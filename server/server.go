package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

const (
	BASE_URL         = "http://localhost:3000"
	NAME_MAX         = 50
	IMAGE_MAX        = 512
	TEXT_MAX         = 2000
	KEY_MAX          = 64
	KEY_MIN          = 8
	TITLE_MAX        = 50
	BLITZ_CYCLE      = 1 // seconds between blitz
	BLITZ_COMPLETION = 120 // number of blitz until a user is awarded
)

// Comment struct (within Post)
type Comment struct {
	CID  int
	_UID int
	Text string
}

// Post struct
type Post struct {
	PID      int
	_UID     int
	Image    string
	Title    string
	Text     string
	Comments []Comment
	Mark     int
}

// User struct
type User struct {
	_UID  int
	Link  string
	key   string
	Name  string
	Image string
	Text  string
	Posts []Post
}

var posts map[int]*Post
var posts_m sync.Mutex
var post_PID int

var users []User
var users_l map[string]*User
var users_m sync.Mutex

var blitz_i int
var blitz_m sync.Mutex

var winner_UID int

func init() {
	// create empty post map
	posts = make(map[int]*Post, 0)
	users_l = make(map[string]*User, 0)
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

	e.POST("/api/create/post", createPost)
	e.POST("/api/create/comment", createComment)
	e.POST("/api/create/user", createUser)

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
			var winningPost Post

			fmt.Printf("BLITZ! Killing %d posts.\n", len(posts))
			winner := false

			// delete all posts; find winning post
			for PID, post := range posts {
				if post.Mark > winningPost.Mark {
					winningPost = *post
					winner = true
				}

				delete(posts, PID)
			}

			if winner {
				fmt.Printf("Winner has UID %d.\n", winningPost._UID)
				user := &users[winningPost._UID]
				winner_UID = winningPost._UID
				user.Posts = append(user.Posts, winningPost)
			} else {
				fmt.Print("No posts; no winner.\n")
			}

			blitz_i = 0
		} else {
			count := 0

			for PID, post := range posts {
				post.Mark--

				if post.Mark <= 0 {
					delete(posts, PID)
					count++
				}
			}

			if count > 0 {
				fmt.Printf("Cycle! Deleted %d posts.\n", count)
			}
		}

		blitz_m.Unlock()
		posts_m.Unlock()
	}
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

// POST /api/create/post
// - "UID": UID of posting user
// - "Key": key of posting user
// - "Image": image URL of post
// - "Title": title of post
// - "Text": text of post
func createPost(c echo.Context) error {
	UID, err := strconv.Atoi(c.FormValue("UID"))

	users_m.Lock()

	if err != nil || UID < 0 || UID > len(users) {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	key := c.FormValue("Key")

	if users[UID].key != key {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	users_m.Unlock()

	newPost := new(Post)
	newPost._UID = UID
	newPost.Image = c.FormValue("Image")
	newPost.Title = c.FormValue("Title")
	newPost.Text = c.FormValue("Text")
	newPost.Comments = make([]Comment, 0)

	blitz_m.Lock()
	newPost.Mark = BLITZ_COMPLETION - blitz_i
	blitz_m.Unlock()

	if len(newPost.Image) > IMAGE_MAX || len(newPost.Image) == 0 ||
		len(newPost.Title) > TITLE_MAX || len(newPost.Title) == 0 ||
		len(newPost.Text) > TEXT_MAX || len(newPost.Text) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	posts_m.Lock()
	PID := post_PID + 1
	post_PID++
	newPost.PID = PID
	posts[PID] = newPost
	posts_m.Unlock()

	post_url := BASE_URL + "/post/" + strconv.Itoa(PID)

	return c.Redirect(http.StatusFound, post_url)
}

// POST /api/create/comment
// - "UID": UID of commenting user
// - "Key": key of commenting user
// - "PID": PID of post
// - "Text": text of post
func createComment(c echo.Context) error {
	UID, err := strconv.Atoi(c.FormValue("UID"))

	users_m.Lock()

	if err != nil || UID < 0 || UID > len(users) {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	key := c.FormValue("Key")

	if users[UID].key != key {
		users_m.Unlock()
		return echo.NewHTTPError(http.StatusUnauthorized)
	}

	users_m.Unlock()
	PID, err := strconv.Atoi(c.FormValue("PID"))

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	var newComment Comment

	newComment._UID = UID
	newComment.Text = c.FormValue("Text")

	if len(newComment.Text) > TEXT_MAX || len(newComment.Text) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	posts_m.Lock()
	post, ok := posts[PID]

	if !ok {
		posts_m.Unlock()
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	newComment.CID = len(post.Comments)
	post.Comments = append(post.Comments, newComment)
	posts_m.Unlock()

	comment_url := BASE_URL + "/post/" + strconv.Itoa(PID) +
		      "#" + strconv.Itoa(newComment.CID)

	return c.Redirect(http.StatusFound, comment_url)
}

// POST /api/create/user
// - "Key": key of new user
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
		fmt.Print(1)
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	users_m.Unlock()

	var newUser User

	newUser.Name = c.FormValue("Name")
	newUser.Image = c.FormValue("Image")
	newUser.Text = c.FormValue("Text")
	newUser.Posts = make([]Post, 0)
	newUser.Link = link
	newUser.key = c.FormValue("Key")

	if len(newUser.Name) > NAME_MAX || len(newUser.Name) == 0 ||
		len(newUser.Image) > IMAGE_MAX || len(newUser.Image) == 0 ||
		len(newUser.key) > KEY_MAX || len(newUser.key) < KEY_MIN {
		fmt.Print(2)
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	users_m.Lock()
	newUser._UID = len(users)
	users = append(users, newUser)
	users_l[link] = &users[newUser._UID]
	users_m.Unlock()

	user_url := BASE_URL + "/resolve/" + strconv.Itoa(newUser._UID)

	return c.Redirect(http.StatusFound, user_url)
}
