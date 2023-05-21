package main

import (
	"fmt"
	"log"
	"net/http"
	"encoding/json"
)

const (
	MOUNTAIN = "https://i.natgeofe.com/n/f27ebe1a-7265-4e18-8c82-b6f93c7da44e/sunrise-moraine-lake-canada.jpg?w=636&h=425"
	CAT = "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3V0ZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"
	SIMON = "https://cdn.discordapp.com/avatars/363121958545784832/e3cf5618ffea9642d6aafc3fe4f1f80e.webp"
)

type Post struct {
	PID int
	CID int
	AID int
	Image string
	Title string
	Author string
	Date string
}

var posts []Post

func init() {
	num := 3
	image := [3]string{ MOUNTAIN, CAT, SIMON }
	title := [3]string{
		"Beautiful British Columbia",
		"This cat is HUUUUUGEE!! AHH FUQUE",
		"Spookin out dogge",
	}
	author := [3]string{
		"Mountaineer",
		"Micah Baker",
		"Simon Purdon",
	}
	date := [3]string{
		"Today",
		"Yesterday",
		"1 Jan 2023",
	}

	for i := 0; i < num; i++ {
		post := Post{0, 0, 0, image[i], title[i], author[i], date[i]}
		posts = append(posts, post)
	}
}

func main() {
	http.HandleFunc("/", defaultHandler)
	http.HandleFunc("/api/posts.json", getPosts)
	log.Fatal(http.ListenAndServe("localhost:8000", nil))
}

func defaultHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "%v", r.URL)
}

func getPosts(w http.ResponseWriter, r *http.Request) {
	m, err := json.Marshal(posts)
	if err != nil {
		fmt.Fprint(w, "{}")
		return
	}
	fmt.Fprint(w, string(m))
}
