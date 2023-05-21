package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

const (
	DOG1 = "https://random.dog/1326984c-39b0-492c-a773-f120d747a7e2.jpg"
	DOG2 = "https://random.dog/1abd3cbd-d6db-435b-9218-a9b6a26be50b.JPG"
	DOG3 = "https://random.dog/5d6792a5-a458-4077-b9ee-de7f15706cca.jpg"
	DOG4 = "https://random.dog/c8b7a017-8966-4f84-b2c6-609a739d833e.jpg"
	DOG5 = "https://random.dog/831d264b-01c6-41f2-a00a-c798c9b72e7e.jpg"
	DOG6 = "https://random.dog/9efb1b9f-389e-4bd6-a67a-e25cb166aa91.gif"
	DOG7 = "https://random.dog/2b77b03c-3073-454e-957b-867580b3d005.jpg"
	DOG8 = "https://random.dog/b775c9ae-205a-47ad-96e5-bea4d78628c5.jpg"
)

type User struct {
	UID int
	Name string
	Image string
	Date string
}

type Comment struct {
	UID int
	Text string
}

type Post struct {
	PID int
	UID int
	Image string
	Title string
	Text string
	Comments []Comment
	Date string
}

var user []User
var post []Post

func init() {
	user = append(user, User{0, "Micah Baker", DOG1, "Today"})  // 0
	user = append(user, User{1, "Nakul Bansal", DOG2, "Today"}) // 1
	user = append(user, User{2, "Simon Purdon", DOG3, "Today"}) // 2

	post = append(post, Post{0, 0, DOG4, "New Dog", "Cute dog", nil, "Today"})
	post = append(post, Post{1, 1, DOG5, "Hello Dog", "Crazy dog", nil, "Today"})
	post = append(post, Post{2, 2, DOG6, "No more Dog", "Weird dog", nil, "Today"})
}

func main() {
	e := echo.New()

	e.GET("/", notFound)
	e.GET("/api/posts", getPosts)
	e.GET("/api/post/:PID", getPost)
	e.GET("/api/comments/:PID", getComments)
	e.GET("/api/users", getUsers)
	e.GET("/api/user/:UID", getUser)
	e.POST("/api/create/post", createPost)
	e.POST("/api/create/comment", createComment)
	e.POST("/api/create/user", createUser)

	fmt.Print("Starting Glyptodon Go Backend...")

	log.Fatal(e.Start(":8000"))
}

func notFound(c echo.Context) error {
	return echo.NewHTTPError(http.StatusNotFound)
}

func getPosts(c echo.Context) error {
	return c.JSON(http.StatusOK, post)
}

func getPost(c echo.Context) error {
	i, err := strconv.Atoi(c.Param("PID"))
	if err != nil || i < 0 || i >= len(post) {
		return echo.NewHTTPError(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, post[i])
}

func getComments(c echo.Context) error {
	i, err := strconv.Atoi(c.Param("PID"))
	if err != nil || i < 0 || i >= len(post) {
		return echo.NewHTTPError(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, post[i].Comments)
}

func getUsers(c echo.Context) error {
	return c.JSON(http.StatusOK, user)
}

func getUser(c echo.Context) error {
	i, err := strconv.Atoi(c.Param("UID"))
	if err != nil || i < 0 || i >= len(user) {
		return echo.NewHTTPError(http.StatusNotFound)
	}
	return c.JSON(http.StatusOK, user[i])
}

func createPost(c echo.Context) error {
	var newPost Post
	newPost.UID, _ = strconv.Atoi(c.FormValue("UID"))
	newPost.Image = c.FormValue("Image")
	newPost.Title = c.FormValue("Title")
	newPost.Text = c.FormValue("Text")
	newPost.PID = len(post)
	newPost.Date = "Today"
	newPost.Comments = nil
	post = append(post, newPost)
	return c.String(http.StatusOK, strconv.Itoa(newPost.PID))
}

func createComment(c echo.Context) error {
	var newComment Comment
	PID, _ := strconv.Atoi(c.FormValue("PID"))
	newComment.UID, _ = strconv.Atoi(c.FormValue("UID"))
	newComment.Text = c.FormValue("Text")
	if post[PID].Comments == nil {
		post[PID].Comments = make([]Comment, 0)
	}
	post[PID].Comments = append(post[PID].Comments, newComment)
	return c.String(http.StatusOK, strconv.Itoa(PID))
}

func createUser(c echo.Context) error {
	var newUser User
	newUser.Name = c.FormValue("Name")
	newUser.Image = c.FormValue("Image")
	newUser.UID = len(user)
	newUser.Date = "Today"
	user = append(user, newUser)
	return c.String(http.StatusOK, strconv.Itoa(newUser.UID))
}
