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
	BASE_URL       = "http://localhost:3000"
	NAME_MAX       = 50
	IMAGE_MAX      = 512
	TEXT_MAX       = 2000
	TITLE_MAX      = 50
	BLITZ_RAPIDITY = 1 // seconds between blitz
)

// User struct
type User struct {
	UID   int
	Name  string
	Image string
}

// Comment struct (within Post)
type Comment struct {
	CID  int
	UID  int
	Text string
}

// Post struct
type Post struct {
	PID      int
	UID      int
	Image    string
	Title    string
	Text     string
	Comments []Comment
	Mark     int
}

var users []User
var users_m sync.Mutex

var posts map[int]*Post
var posts_m sync.Mutex

var post_PID int

func init() {
	// create empty post map
	posts = make(map[int]*Post, 0)
}

func main() {
	e := echo.New()

	e.GET("/", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusNotFound)
	})

	e.GET("/api/posts", getPosts)
	e.GET("/api/post/:PID", getPost)
	e.GET("/api/users", getUsers)
	e.GET("/api/user/:UID", getUser)

	e.POST("/api/create/post", createPost)
	e.POST("/api/create/comment", createComment)
	e.POST("/api/create/user", createUser)

	fmt.Print("Starting Goblitz Backend...")

	go blitz()

	log.Fatal(e.Start(":8000"))
}

func blitz() {
	for {
		time.Sleep(BLITZ_RAPIDITY * time.Second)

		posts_m.Lock()

		count := 0

		for PID, post := range posts {
			post.Mark--

			if post.Mark <= 0 {
				delete(posts, PID)
				count++
			}
		}

		if count > 0 {
			fmt.Printf("Blitz! Deleted %d posts.\n", count)
		}

		posts_m.Unlock()
	}
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
	i, err := strconv.Atoi(c.Param("UID"))
	users_m.Lock()

	if err != nil || i < 0 || i >= len(users) {
		users_m.Unlock()

		return echo.NewHTTPError(http.StatusNotFound)
	}

	user_json, err := json.Marshal(users[i])
	users_m.Unlock()

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError)
	}

	return c.JSONBlob(http.StatusOK, user_json)
}

func createPost(c echo.Context) error {
	var newPost *Post
	var err error

	newPost = new(Post)
	newPost.UID, err = strconv.Atoi(c.FormValue("UID"))

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	newPost.Image = c.FormValue("Image")
	newPost.Title = c.FormValue("Title")
	newPost.Text = c.FormValue("Text")
	newPost.Comments = make([]Comment, 0)
	newPost.Mark = 100

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

func createComment(c echo.Context) error {
	PID, err := strconv.Atoi(c.FormValue("PID"))

	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	UID, err := strconv.Atoi(c.FormValue("UID"))
	users_m.Lock()

	if err != nil || UID < 0 || UID > len(users) {
		users_m.Unlock()

		return echo.NewHTTPError(http.StatusBadRequest)
	}

	users_m.Unlock()

	var newComment Comment

	newComment.UID = UID
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

func createUser(c echo.Context) error {
	var newUser User

	newUser.Name = c.FormValue("Name")
	newUser.Image = c.FormValue("Image")

	if len(newUser.Name) > NAME_MAX || len(newUser.Name) == 0 ||
		len(newUser.Image) > IMAGE_MAX || len(newUser.Image) == 0 {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	users_m.Lock()

	newUser.UID = len(users)
	users = append(users, newUser)

	users_m.Unlock()

	user_url := BASE_URL + "/user/" + strconv.Itoa(newUser.UID)

	return c.Redirect(http.StatusFound, user_url)
}
