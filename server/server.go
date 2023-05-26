package main

import (
	"encoding/json"
	"encoding/hex"
	"crypto/rand"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
	"github.com/labstack/echo/v4"
)

const (
	BASE_URL         = "http://localhost:3000"
	LINK_MAX         = 32
	NAME_MAX         = 50
	IMAGE_MAX        = 512
	TEXT_MAX         = 2000
	KEY_MAX          = 64
	KEY_MIN          = 8
	TITLE_MAX        = 50
	BLITZ_CYCLE      = 1 // seconds between blitz
	BLITZ_COMPLETION = 120 // number of blitz until a user is awarded
	DEFAULT_COST     = 8 // cost of password hashes
	MIN_COST         = bcrypt.MinCost + 1 // minimum cost
	TOO_FAST         = 500 * time.Millisecond // two interactions per second
)

// Interaction struct (within Post)
type Inter struct {
	// public
	Text    string
	Display string

	// private
	_UID int
}

// Post struct
type Post struct {
	// public
	PID      int
	Image    string
	Title    string
	Text     string
	Display  string
	Inters   []Inter

	// private
	_UID     int
}

// User struct
type User struct {
	// public
	Link  string
	Name  string
	Image string
	Text  string
	Posts []Post

	// private
	_UID    int
	hash    string
	session bool
	display string
}

type Stats struct {
	Sessions int
	Users    int
}

// Session struct
type Session struct {
	user    *User
	recency time.Time
}

// temporary; create cliques
var posts map[int]*Post
var posts_m sync.Mutex
var post_PID int

var users []*User
var users_l map[string]*User
var users_m sync.Mutex

var sessions map[string]*Session
var sessions_m sync.Mutex

var blitz_i int
var blitz_m sync.Mutex

var winner_UID int

func init() {
	// create empty post map
	posts = make(map[int]*Post, 0)
	users_l = make(map[string]*User, 0)
	sessions = make(map[string]*Session, 0)
}

func main() {
	e := echo.New()

	e.GET("/", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusNotFound)
	})

	e.GET("/api/blitz", getBlitz)
	e.GET("/api/winner", getWinner)
	e.GET("/api/posts", getPosts)
	e.GET("/api/post/:PID", getPost)
	e.GET("/api/users", getUsers)
	e.GET("/api/user/:link", getUser)
	e.GET("/api/stats", getStats)

	e.POST("/api/create/post", createPost)
	e.POST("/api/create/inter", createInter)
	e.POST("/api/create/user", createUser)

	e.POST("/api/login/:link", logIn)
	e.POST("/api/logout/:link", logOut)
	e.POST("/api/session", getSession)

	fmt.Print("Starting goblitz Backend...")

	go blitz()

	log.Fatal(e.Start(":8000"))
}

func blitz() {
	for {
		time.Sleep(BLITZ_CYCLE * time.Second)

		blitz_m.Lock()
		posts_m.Lock()

		blitz_i++
		kill := blitz_i >= BLITZ_COMPLETION

		if kill {
			var winner Post
			mark := -1

			fmt.Printf("BLITZ! Killing %d posts.\n", len(posts))

			// delete all posts; find winning post
			for PID, post := range posts {
				post_mark := len(post.Inters)

				if post_mark > mark {
					mark = post_mark
					winner = *post
				}

				delete(posts, PID)
			}

			if mark > 0 {
				user := users[winner._UID]

				fmt.Printf("Winner has link %d.\n", user.Link)

				winner_UID = winner._UID
				user.Posts = append(user.Posts, winner)
			} else {
				fmt.Print("No posts; no winner.\n")
			}

			blitz_i = 0
		}

		posts_m.Unlock()
		blitz_m.Unlock()
	}
}

func userSession(accessKey string, request *http.Request) (*User, bool) {
	sessionKey := accessKey

	userAgent, ok := request.Header["User-Agent"]

	if ok {
		for _, field := range userAgent {
			sessionKey += field
		}
	}

	sessions_m.Lock()
	session, ok := sessions[sessionKey]

	if !ok {
		return nil, false
	}

	now := time.Now()

	if now.Sub(session.recency) < TOO_FAST {
		// too many interactions with the website
		sessions_m.Unlock()
		return nil, false
	}

	// update session recency
	session.recency = time.Now()
	user := session.user
	sessions_m.Unlock()

	return user, true
}

func getBlitz(c echo.Context) error {
	blitz_m.Lock()
	remaining := BLITZ_COMPLETION - blitz_i
	blitz_m.Unlock()
	return c.JSON(http.StatusOK, remaining)
}

func getWinner(c echo.Context) error {
	return c.JSON(http.StatusOK, users[winner_UID])
}

func getPosts(c echo.Context) error {
	var posts_json []byte
	var i, n = 0, len(posts)

	posts_m.Lock()
	posts_json = append(posts_json, byte('['))

	for PID, post := range posts {
		post_json, err := json.Marshal(post)

		if err != nil {
			// invalid post in posts; delete it
			fmt.Print("Error: json.Marshal failed for post; PID: %d.\n", PID)
			delete(posts, PID)
			continue
		}

		posts_json = append(posts_json, post_json...)

		if i++; i < n {
			posts_json = append(posts_json, byte(','))
		}
	}

	posts_json = append(posts_json, byte(']'))
	posts_m.Unlock()
	return c.JSONBlob(http.StatusOK, posts_json)
}

func getPost(c echo.Context) error {
	posts_m.Lock()

	PID, err := strconv.Atoi(c.Param("PID"))

	if err != nil {
		posts_m.Unlock()
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	post, ok := posts[PID]

	if !ok {
		posts_m.Unlock()
		return echo.NewHTTPError(http.StatusNotFound)
	}

	post_json, err := json.Marshal(post)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	posts_m.Unlock()

	return c.JSONBlob(http.StatusOK, post_json)
}

func getUsers(c echo.Context) error {
	users_m.Lock()
	users_json, err := json.Marshal(users)
	users_m.Unlock()

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSONBlob(http.StatusOK, users_json)
}

func getUser(c echo.Context) error {
	users_m.Lock()
	link := c.Param("link")
	user, ok := users_l[link]

	if !ok {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusNotFound)
	}

	user_json, err := json.Marshal(user)
	users_m.Unlock()

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSONBlob(http.StatusOK, user_json)
}

func getStats(c echo.Context) error {
	var stats Stats

	sessions_m.Lock()
	users_m.Lock()

	stats.Sessions = len(sessions)
	stats.Users = len(users)

	users_m.Unlock()
	sessions_m.Unlock()

	return c.JSON(http.StatusOK, stats)
}

// POST /api/create/post
// - "Session": user session
// - "Image": image URL of post
// - "Title": title of post
// - "Text": text of post
func createPost(c echo.Context) error {
	users_m.Lock()
	user, ok := userSession(c.FormValue("Session"), c.Request())

	if !ok {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	// session is valid

	post := new(Post)
	post._UID = user._UID
	post.Image = c.FormValue("Image")
	post.Title = c.FormValue("Title")
	post.Text = c.FormValue("Text")
	post.Display = user.display
	post.Inters = make([]Inter, 0)

	users_m.Unlock()

	if len(post.Image) > IMAGE_MAX || len(post.Image) == 0 ||
		len(post.Title) > TITLE_MAX || len(post.Title) == 0 ||
		len(post.Text) > TEXT_MAX || len(post.Text) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	posts_m.Lock()
	PID := post_PID + 1
	post_PID++
	post.PID = PID
	posts[PID] = post
	posts_m.Unlock()

	post_url := BASE_URL + "/post/" + strconv.Itoa(PID)

	return c.Redirect(http.StatusFound, post_url)
}

// POST /api/create/inter
// - "Session": user session
// - "PID": PID of post
// - "Text": text of post
func createInter(c echo.Context) error {
	users_m.Lock()
	user, ok := userSession(c.FormValue("Session"), c.Request())

	if !ok {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	UID := user._UID
	PID, err := strconv.Atoi(c.FormValue("PID"))

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	var inter Inter

	inter._UID = UID
	inter.Text = c.FormValue("Text")
	inter.Display = user.display

	users_m.Unlock()

	if len(inter.Text) > TEXT_MAX || len(inter.Text) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	posts_m.Lock()
	post, ok := posts[PID]

	if !ok {
		posts_m.Unlock()
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	post.Inters = append(post.Inters, inter)
	posts_m.Unlock()

	return c.String(http.StatusOK, "")
}

// POST /api/create/user
// - "Pass": password of new user
// - "Link": link for new user
// - "Name": name of new user
// - "Image": profile image for new user
// - "Text": description of new user
func createUser(c echo.Context) error {
	link := c.FormValue("Link")
	users_m.Lock()
	_, ok := users_l[link]

	// user at this link already exists
	if ok {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	users_m.Unlock()

	user := new(User)
	user.Link = c.FormValue("Link")
	user.Name = c.FormValue("Name")
	user.Image = c.FormValue("Image")
	user.Text = c.FormValue("Text")
	user.Posts = make([]Post, 0)

	pass := c.FormValue("Pass")

	if len(user.Link) > LINK_MAX || len(user.Link) == 0 ||
		len(user.Name) > NAME_MAX || len(user.Name) == 0 ||
		len(user.Image) > IMAGE_MAX || len(user.Image) == 0 ||
		len(user.Text) > TEXT_MAX || len(user.Text) == 0 ||
		len(pass) > KEY_MAX || len(pass) < KEY_MIN {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(pass), DEFAULT_COST)

	if err != nil {
		// assume failure was the user's fault
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	user.hash = string(hash)

	users_m.Lock()
	user._UID = len(users)
	users = append(users, user)
	users_l[link] = users[user._UID]
	users_m.Unlock()

	login_url := BASE_URL + "/login"

	return c.Redirect(http.StatusFound, login_url)
}

// POST /api/login/:user
// - "Pass": password of user
func logIn(c echo.Context) error {
	users_m.Lock()
	user, ok := users_l[c.Param("link")]

	if !ok {
		users_m.Unlock()
		return c.String(http.StatusUnauthorized, "User does not exist.")
	} else
	if user.session {
		users_m.Unlock()
		return c.String(http.StatusUnauthorized, "User is already logged in.")
	}

	pass := c.FormValue("Pass")

	if bcrypt.CompareHashAndPassword([]byte(user.hash), []byte(pass)) != nil {
		users_m.Unlock()
		return c.String(http.StatusUnauthorized, "Incorrect password.")
	}

	// credentials are valid; user is not already logged in

	// TODO: improve this
	hash, err := bcrypt.GenerateFromPassword([]byte(c.Param("user")), MIN_COST)

	if err != nil {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	request := c.Request()
	userAgent, ok := request.Header["User-Agent"]

	sessionKey := string(hash)

	if ok {
		for _, field := range userAgent {
			sessionKey += field
		}
	}

	// make session display name
	b := make([]byte, 4)
	_, err = rand.Read(b)

	if err != nil {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	sessions_m.Lock()

	fmt.Printf("Logged in %s; sessionKey is %s\n", user.Name, sessionKey)

	sessions[sessionKey] = new(Session) // create new session
	sessions[sessionKey].user = user
	sessions[sessionKey].recency = time.Now()
	sessions_m.Unlock()

	user.session = true
	user.display = hex.EncodeToString(b)
	users_m.Unlock()

	// return the session access key
	return c.JSON(http.StatusOK, string(hash))
}

// POST /api/logout/:user
// - "Session": access key of the user session
func logOut(c echo.Context) error {
	sessionKey := c.FormValue("Session")

	request := c.Request()
	userAgent, ok := request.Header["User-Agent"]

	if ok {
		for _, field := range userAgent {
			sessionKey += field
		}
	}

	sessions_m.Lock()
	session, ok := sessions[sessionKey]

	// check if session exists
	if !ok {
		sessions_m.Unlock()
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	users_m.Lock()

	session.user.session = false
	session.user.display = ""
	delete(sessions, sessionKey) // delete session

	users_m.Unlock()
	sessions_m.Unlock()

	// redirect to home
	return c.Redirect(http.StatusFound, BASE_URL)
}

// POST /api/session
// - "Session": access key of the user session
func getSession(c echo.Context) error {
	sessionKey := c.FormValue("Session")

	request := c.Request()
	userAgent, ok := request.Header["User-Agent"]

	if ok {
		for _, field := range userAgent {
			sessionKey += field
		}
	}

	sessions_m.Lock()
	session, ok := sessions[sessionKey]

	// check if session exists
	if !ok {
		sessions_m.Unlock()
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	users_m.Lock()
	user_json, err := json.Marshal(session.user)

	if err != nil {
		sessions_m.Unlock()
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	users_m.Unlock()
	sessions_m.Unlock()

	return c.JSONBlob(http.StatusOK, user_json)
}
