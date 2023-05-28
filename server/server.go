package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
	"bufio"
	"os"
	"io"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
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
	BLITZ_CYCLE      = 1                      // seconds between blitz
	BLITZ_COMPLETION = 300                    // number of blitz until a user is awarded
	DEFAULT_COST     = 8                      // cost of password hashes
	MIN_COST         = bcrypt.MinCost + 1     // minimum cost
	TOO_FAST         = 2 * time.Second        // one interaction per two seconds
	EXPIRE_SESSION   = 600 * time.Second      // expire a session after ten minutes
	ERR_UNAUTHORIZED = "Unauthorized."
	ERR_BADREQUEST   = "Improper information given."
	ERR_INTERNAL     = "Internal server error."
	ERR_INVALIDUSER  = "Invalid user session."
	ERR_NOTFOUND     = "Not found."
)

// Interaction struct (within Post)
type Inter struct {
	// public
	Text    string
	Creator string
	Blitz   bool // true if this interaction was during a blitz

	// private
	creator string
}

// Post struct
type Post struct {
	// public
	PID       int
	Image     string
	Title     string
	Text      string
	Creator   string
	Inters    []Inter
	Overwrite bool // for posts_b overwriting

	// private
	creator   string
}

// User struct
type User struct {
	// public
	Link      string
	Name      string
	Image     string
	Text      string
	Moderator bool

	// private
	display    string
	hash       string
	sessionKey string
	posts      []int
}

type UserFile struct {
	// public
	Link  string
	Name  string
	Image string
	Text  string
	Hash  string
	Posts []int
}

type Winner struct {
	User *User
	Post *Post
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

type SessionResponse struct {
	Link      string
	Name      string
	Image     string
	Session   string
	Display   string
	Moderator bool
}

var posts_b []*Post     // posts during the blitz period
var posts map[int]*Post // posts kept after the blitz period
var post_PID int        // PID of next post
var posts_m sync.Mutex

var users map[string]*User
var users_m sync.Mutex

var sessions map[string]*Session
var sessions_m sync.Mutex

var blitz_i int
var blitz_PID int // first PID during this blitz period
var blitz_m sync.Mutex

var winner Winner

func init() {
	clear()
}

func main() {
	e := echo.New()

	e.GET("/", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusNotFound)
	})

	e.GET("/api/blitz", getBlitz)
	e.GET("/api/winner", getWinner)
	e.GET("/api/posts", getPosts)
	e.GET("/api/posts/:link", getUserPosts)
	e.GET("/api/post/:PID", getPost)
	e.GET("/api/user/:link", getUser)
	e.GET("/api/stats", getStats)

	e.POST("/api/create/post", createPost)
	e.POST("/api/create/inter", createInter)
	e.POST("/api/create/user", createUser)
	e.POST("/api/delete/:PID", deletePost)
	e.POST("/api/session", getSession)

	e.POST("/api/login/:link", logIn)
	e.POST("/api/logout", logOut)

	fmt.Print("Starting goblitz Backend...")

	go console()
	go blitz()

	log.Fatal(e.Start(":8000"))
}

func clear() {
	posts_b = make([]*Post, 0)
	posts = make(map[int]*Post, 0)
	users = make(map[string]*User, 0)
	sessions = make(map[string]*Session, 0)

	post_PID = 0
	blitz_i = 0
	blitz_PID = 0
}

func readPosts() bool {
	posts_file, err := os.Open("posts.json")

	if err != nil {
		return false
	}

	dec := json.NewDecoder(posts_file)
	max_PID := 0

	t, err := dec.Token()

	if err != nil {
		posts_file.Close()

		return false
	}

	fmt.Printf("%T: %v\n", t, t)

	for dec.More() {
		post := new(Post)

		if err := dec.Decode(post); err == io.EOF {
			break
		} else if err != nil {
			fmt.Printf("%v\n", err)

			continue
		}

		if post.PID > max_PID {
			max_PID = post.PID
		}

		posts[post.PID] = post

		fmt.Printf("Got post %d.\n", post.PID)
	}

	t, err = dec.Token()

	if err == nil {
		fmt.Printf("%T: %v\n", t, t)
		post_PID = max_PID + 1
		blitz_PID = post_PID
	} else {
		fmt.Print("Post array isn't terminated.\n")
	}

	posts_file.Close()

	return true
}

func readUsers() bool {
	users_file, err := os.Open("users.json")

	if err != nil {
		return false
	}

	dec := json.NewDecoder(users_file)

	t, err := dec.Token()

	if err != nil {
		users_file.Close()

		return false
	}

	fmt.Printf("%T: %v\n", t, t)

	for dec.More() {
		var user_f UserFile

		if err := dec.Decode(&user_f); err == io.EOF {
			break
		} else if err != nil {
			fmt.Printf("%v\n", err)

			continue
		}

		user := new(User)

		user.Link  = user_f.Link
		user.Image = user_f.Image
		user.Name  = user_f.Name
		user.Text  = user_f.Text
		user.hash  = user_f.Hash
		user.posts = user_f.Posts

		users[user.Link] = user

		fmt.Printf("Got user '%s'.\n", user.Link)
	}

	t, err = dec.Token()

	if err == nil {
		fmt.Printf("%T: %v\n", t, t)
	} else {
		fmt.Print("Users array isn't terminated.\n")
	}

	users_file.Close()

	return true
}

func writePosts() bool {
	posts_file, err := os.Create("posts.json")

	if err != nil {
		return false
	}

	enc := json.NewEncoder(posts_file)
	posts_file.Write([]byte("[\n"))

	var i, n = 0, len(posts)
	for _, post := range posts {
		enc.Encode(post)

		if i++; i < n {
			posts_file.Write([]byte(",\n"))
		}
	}

	posts_file.Write([]byte("]\n"))
	posts_file.Close()

	return true
}

func writeUsers() bool {
	users_file, err := os.Create("users.json")

	if err != nil {
		return false
	}

	enc := json.NewEncoder(users_file)
	users_file.Write([]byte("[\n"))

	var i, n = 0, len(users)
	for _, user := range users {
		var user_f UserFile

		user_f.Link  = user.Link
		user_f.Image = user.Image
		user_f.Name  = user.Name
		user_f.Text  = user.Text
		user_f.Hash  = user.hash
		user_f.Posts = user.posts

		enc.Encode(user_f)

		if i++; i < n {
			users_file.Write([]byte(",\n"))
		}
	}

	users_file.Write([]byte("]\n"))
	users_file.Close()

	return true
}

func console() {
	time.Sleep(time.Second) // let echo messages print
	input := bufio.NewReader(os.Stdin)

	for {
		fmt.Print("goblitz >> ")
		command, err := input.ReadString('\n')
		command = command[:len(command) - 1]

		if err != nil || command == "exit" {
			break
		}

		lock(&posts_m, &users_m, &sessions_m, &blitz_m)

		if command == "read" {
			fmt.Printf("Reading...\n")
			clear()

			if !readPosts() {
				fmt.Print("Could not read posts.json.\n")
			}

			if !readUsers() {
				fmt.Print("Could not read users.json.\n")
				clear() // posts cannot be correlated to users; clear
			}

			fmt.Printf("Finished reading %d posts, %d users.\n", len(posts), len(users))
		}

		if command == "write" {
			fmt.Printf("Writing...\n")

			if !writePosts() {
				fmt.Print("Could not write to posts.json.\n")
			}

			if !writeUsers() {
				fmt.Print("Could not write to users.json.\n")
			}

			fmt.Printf("Finished writing.\n")
		}

		unlock(&posts_m, &users_m, &sessions_m, &blitz_m)
	}
}

func publicize(post *Post) {
	post.Creator = post.creator

	for i, _ := range post.Inters {
		post.Inters[i].Creator = post.Inters[i].creator
	}
}

func blitz() {
	for {
		time.Sleep(BLITZ_CYCLE * time.Second)

		lock(&posts_m, &users_m, &blitz_m)

		blitz_i++
		kill := blitz_i >= BLITZ_COMPLETION

		if kill {
			var winner_p *Post
			mark := -1

			fmt.Printf("BLITZ! Killing %d posts.\n", len(posts))

			// delete all posts; find winning post
			for _, post := range posts_b {
				if post.Overwrite {
					continue
				}

				if len(post.Inters) > mark {
					mark = len(post.Inters)
					winner_p = post
				}
			}

			// winner must have at least one interaction
			if mark > 0 {
				user, ok := users[winner_p.creator]

				if !ok {
					fmt.Print("Unexpected error; post creator does not exist.\n")
				} else {
					fmt.Printf("Winner has link %s.\n", user.Link)
					user.posts = append(user.posts, winner_p.PID)
					posts[winner_p.PID] = winner_p // ensure that post doesn't cease to exist
					publicize(winner_p)
					winner.User = user
					winner.Post = winner_p
				}
			} else {
				fmt.Print("No posts; no winner.\n")
			}

			posts_b = posts_b[:0] // remove all posts for this cycle
			blitz_i = 0
			// reset blitz_PID to the PID of the next post
			blitz_PID = post_PID
		}

		current := time.Now()

		for SID, session := range sessions {
			if current.Sub(session.recency) > EXPIRE_SESSION {
				fmt.Printf("Kicked %s's session.\n", session.user.Link)
				delete(sessions, SID)
			}
		}

		unlock(&posts_m, &users_m, &blitz_m)
	}
}

// assumes that users_m is locked
func findSession(sessionKey string) (*User, bool) {
	session, ok := sessions[sessionKey]

	if !ok {
		return nil, false
	}

	now := time.Now()

	if now.Sub(session.recency) < TOO_FAST {
		// too many interactions with the website
		return nil, false
	}

	// update session recency
	session.recency = time.Now()
	user := session.user

	return user, true
}

// assumes that posts_m is locked
func findPost(PID_s string) (*Post, bool) {
	PID, err := strconv.Atoi(PID_s)

	if err != nil {
		return nil, false
	}

	var post *Post = nil
	ok := PID < post_PID

	if ok && PID >= blitz_PID {
		post = posts_b[PID - blitz_PID]
	} else {
		post, ok = posts[PID]
	}

	return post, post != nil
}

func lock(mutices ...*sync.Mutex) {
	for _, m := range mutices {
		m.Lock()
	}
}

func unlock(mutices ...*sync.Mutex) {
	for _, m := range mutices {
		m.Unlock()
	}
}

func getBlitz(c echo.Context) error {
	lock(&blitz_m)
	remaining := BLITZ_COMPLETION - blitz_i
	unlock(&blitz_m)

	return c.JSON(http.StatusOK, remaining)
}

func getWinner(c echo.Context) error {
	lock(&users_m)
	user_json, err := json.Marshal(winner)
	unlock(&users_m)

	if err != nil {
		return c.JSON(http.StatusNotFound, ERR_NOTFOUND)
	}

	return c.JSONBlob(http.StatusOK, user_json)
}

func getPosts(c echo.Context) error {
	lock(&posts_m)
	posts_json, err := json.Marshal(posts_b)
	unlock(&posts_m)

	if err != nil {
		// return empty array; no posts available
		return c.JSONBlob(http.StatusOK, []byte("[]"))
	}

	return c.JSONBlob(http.StatusOK, posts_json)
}

func getUserPosts(c echo.Context) error {
	lock(&posts_m, &users_m)
	user, ok := users[c.Param("link")]

	if !ok {
		unlock(&posts_m, &users_m)
		return echo.NewHTTPError(http.StatusNotFound)
	}

	var posts_json []byte

	posts_json = append(posts_json, byte('['))

	n := len(user.posts)
	for i, PID := range user.posts {
		post, ok := posts[PID]

		if !ok {
			fmt.Printf("User %s post %d anomaly.\n", user.Link, PID)

			continue
		}

		post_json, err := json.Marshal(post)

		if err != nil {
			fmt.Printf("User %s post %d Marshal error.\n", user.Link, PID)

			continue
		}

		posts_json = append(posts_json, post_json...)

		if i++; i < n {
			posts_json = append(posts_json, byte(','))
		}
	}

	posts_json = append(posts_json, byte(']'))
	unlock(&posts_m, &users_m)

	return c.JSONBlob(http.StatusOK, posts_json)
}

func getPost(c echo.Context) error {
	lock(&posts_m)
	post, ok := findPost(c.Param("PID"))

	if !ok {
		unlock(&posts_m)
		return echo.NewHTTPError(http.StatusNotFound)
	}

	post_json, err := json.Marshal(post)
	unlock(&posts_m)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSONBlob(http.StatusOK, post_json)
}

func getUser(c echo.Context) error {
	lock(&users_m)
	user, ok := users[c.Param("link")]

	if !ok {
		unlock(&users_m)
		return echo.NewHTTPError(http.StatusNotFound)
	}

	user_json, err := json.Marshal(user)
	unlock(&users_m)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSONBlob(http.StatusOK, user_json)
}

func getStats(c echo.Context) error {
	var stats Stats

	lock(&users_m, &sessions_m)
	stats.Sessions = len(sessions)
	stats.Users = len(users)
	unlock(&users_m, &sessions_m)

	return c.JSON(http.StatusOK, stats)
}

// POST /api/create/post
// - "Session": user session
// - "Image": image URL of post
// - "Title": title of post
// - "Text": text of post
func createPost(c echo.Context) error {
	lock(&posts_m, &users_m, &sessions_m)
	user, ok := findSession(c.FormValue("Session"))

	if !ok {
		unlock(&posts_m, &users_m, &sessions_m)
		return c.JSON(http.StatusUnauthorized, ERR_UNAUTHORIZED)
	}

	// session is valid

	var post *Post = nil
	overwritten := false

	for _, _post := range posts_b {
		if _post.Overwrite {
			post = _post
			post.Overwrite = false
			overwritten = true
		}
	}

	if post == nil {
		post = new(Post)
	}

	post.creator = user.Link
	post.Creator = user.display
	post.Image = c.FormValue("Image")
	post.Title = c.FormValue("Title")
	post.Text = c.FormValue("Text")
	post.Inters = make([]Inter, 0)

	if len(post.Image) > IMAGE_MAX || len(post.Image) == 0 ||
		len(post.Title) > TITLE_MAX || len(post.Title) == 0 ||
		len(post.Text) > TEXT_MAX || len(post.Text) == 0 {
		unlock(&posts_m, &users_m, &sessions_m)
		return c.JSON(http.StatusBadRequest, ERR_BADREQUEST)
	}

	if !overwritten {
		PID := post_PID
		post_PID++
		post.PID = PID
		posts_b = append(posts_b, post)
	}

	post_url := BASE_URL + "/p/" + strconv.Itoa(post.PID)
	unlock(&posts_m, &users_m, &sessions_m)

	return c.Redirect(http.StatusFound, post_url)
}

// POST /api/create/inter
// - "Session": user session
// - "PID": PID of post
// - "Text": text of post
func createInter(c echo.Context) error {
	lock(&posts_m, &users_m, &sessions_m)
	user, ok := findSession(c.FormValue("Session"))

	if !ok {
		unlock(&posts_m, &users_m, &sessions_m)
		return c.JSON(http.StatusUnauthorized, ERR_UNAUTHORIZED)
	}

	var inter Inter

	inter.Text = c.FormValue("Text")
	inter.creator = user.Link
	post, ok := findPost(c.FormValue("PID"))

	if !ok {
		unlock(&posts_m, &users_m, &sessions_m)
		return c.JSON(http.StatusBadRequest, ERR_BADREQUEST)
	}

	if post.PID >= blitz_PID {
		// this interaction is during a blitz
		inter.Blitz = true
		inter.Creator = user.display
	} else {
		inter.Creator = user.Link
	}

	if len(inter.Text) > TEXT_MAX || len(inter.Text) == 0 {
		unlock(&posts_m, &users_m, &sessions_m)
		return c.JSON(http.StatusBadRequest, ERR_BADREQUEST)
	}

	post.Inters = append(post.Inters, inter)
	unlock(&posts_m, &users_m, &sessions_m)

	return c.String(http.StatusOK, "")
}

// POST /api/create/user
// - "Pass": password of new user
// - "Link": link for new user
// - "Name": name of new user
// - "Image": profile image for new user
// - "Text": description of new user
func createUser(c echo.Context) error {
	lock(&users_m)
	link := c.FormValue("Link")
	_, ok := users[link]

	// user at this link already exists
	if ok {
		unlock(&users_m)
		return c.JSON(http.StatusBadRequest, ERR_BADREQUEST)
	}

	user := new(User)
	user.Link = c.FormValue("Link")
	user.Name = c.FormValue("Name")
	user.Image = c.FormValue("Image")
	user.Text = c.FormValue("Text")
	user.posts = make([]int, 0)

	pass := c.FormValue("Pass")

	if len(user.Link) > LINK_MAX || len(user.Link) == 0 ||
		len(user.Name) > NAME_MAX || len(user.Name) == 0 ||
		len(user.Image) > IMAGE_MAX || len(user.Image) == 0 ||
		len(user.Text) > TEXT_MAX || len(user.Text) == 0 ||
		len(pass) > KEY_MAX || len(pass) < KEY_MIN {
		unlock(&users_m)
		return c.JSON(http.StatusBadRequest, ERR_BADREQUEST)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(pass), DEFAULT_COST)

	if err != nil {
		// assume failure was the user's fault
		unlock(&users_m)
		return c.JSON(http.StatusBadRequest, ERR_BADREQUEST)
	}

	user.hash = string(hash)
	users[link] = user
	login_url := BASE_URL + "/login"
	unlock(&users_m)

	return c.Redirect(http.StatusFound, login_url)
}

// POST /api/delete/:PID
// - "Session": session of user
func deletePost(c echo.Context) error {
	lock(&posts_m, &users_m, &sessions_m, &blitz_m)
	user, ok := findSession(c.FormValue("Session"))

	// user isn't logged in
	if !ok {
		unlock(&posts_m, &users_m, &sessions_m, &blitz_m)
		return c.JSON(http.StatusBadRequest, ERR_UNAUTHORIZED)
	}

	post, ok := findPost(c.Param("PID"))

	// post doesn't exist
	if !ok {
		unlock(&posts_m, &users_m, &sessions_m, &blitz_m)
		return c.JSON(http.StatusBadRequest, ERR_UNAUTHORIZED)
	}

	// don't allow deletion if user isn't the creator and isn't a mod
	if post.creator != user.Link && post.Creator != user.Link && !user.Moderator {
		unlock(&posts_m, &users_m, &sessions_m, &blitz_m)
		return c.JSON(http.StatusBadRequest, ERR_UNAUTHORIZED)
	}

	// you can only delete posts that were successful;
	// otherwise, deletion is automatic.
	if post.PID < blitz_PID {
		delete(posts, post.PID)

		user_p, ok := users[post.Creator]

		if !ok {
			unlock(&posts_m, &users_m, &sessions_m, &blitz_m)
			return c.String(http.StatusOK, "")
		}

		// find post in user's posts
		for i, PID := range user_p.posts {
			if PID == post.PID {
				// remove it from their list
				user_p.posts[i] = user_p.posts[len(user_p.posts) - 1]
				user_p.posts = user_p.posts[:len(user_p.posts) - 1]

				break
			}
		}
	} else {
		post.Overwrite = true
	}

	unlock(&posts_m, &users_m, &sessions_m, &blitz_m)

	return c.String(http.StatusOK, "")
}

// POST /api/session
// - "Session": session of user
func getSession(c echo.Context) error {
	lock(&users_m, &sessions_m)
	user, ok := findSession(c.FormValue("Session"))

	if !ok {
		unlock(&users_m, &sessions_m)
		return c.JSON(http.StatusUnauthorized, ERR_UNAUTHORIZED)
	}

	display := user.display
	unlock(&users_m, &sessions_m)

	return c.JSON(http.StatusOK, display)
}

func hexgen(n int) (string, error) {
	b := make([]byte, n)

	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return hex.EncodeToString(b), nil
}

// POST /api/login/:user
// - "Pass": password of user
func logIn(c echo.Context) error {
	lock(&users_m, &sessions_m)
	user, ok := users[c.Param("link")]

	if !ok {
		unlock(&users_m, &sessions_m)
		return c.JSON(http.StatusUnauthorized, ERR_UNAUTHORIZED)
	} else if user.sessionKey != "" {
		// remove existing session
		delete(sessions, user.sessionKey)
		user.sessionKey = ""
	}

	pass := c.FormValue("Pass")

	if bcrypt.CompareHashAndPassword([]byte(user.hash), []byte(pass)) != nil {
		unlock(&users_m, &sessions_m)
		return c.JSON(http.StatusUnauthorized, ERR_UNAUTHORIZED)
	}

	// credentials are valid; user is not already logged in

	sessionKey, err := hexgen(8)

	if err != nil {
		unlock(&users_m, &sessions_m)
		return c.JSON(http.StatusInternalServerError, ERR_INTERNAL)
	}

	// make session display name
	display, err := hexgen(4)

	fmt.Printf("Logged in %s; sessionKey is %s\n", user.Link, sessionKey)

	sessions[sessionKey] = new(Session) // create new session
	sessions[sessionKey].user = user
	sessions[sessionKey].recency = time.Now()

	user.sessionKey = sessionKey
	user.display = display

	var response SessionResponse

	response.Link = user.Link
	response.Name = user.Name
	response.Image = user.Image
	response.Session = user.sessionKey
	response.Display = user.display
	response.Moderator = user.Moderator

	unlock(&users_m, &sessions_m)

	// return the session access key
	return c.JSON(http.StatusOK, response)
}

// POST /api/logout
// - "Session": access key of the user session
func logOut(c echo.Context) error {
	lock(&users_m, &sessions_m)
	sessionKey := c.FormValue("Session")
	session, ok := sessions[sessionKey]

	// check if session exists
	if !ok {
		unlock(&users_m, &sessions_m)
		return c.JSON(http.StatusUnauthorized, ERR_UNAUTHORIZED)
	}

	session.user.sessionKey = ""
	session.user.display = ""
	delete(sessions, sessionKey) // delete session

	unlock(&users_m, &sessions_m)

	// redirect to home
	return c.Redirect(http.StatusFound, BASE_URL)
}
