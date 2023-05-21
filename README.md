# Glyptodon

## Go API

The following are for HTTP GETs:

`/api/posts` returns all posts visible to the user.

`/api/post/<PID>` returns the information associated with a specific post.

`/api/comments/<PID>` returns all comments on a post

`/api/users.json` returns all users known to the user.

`/api/user/<UID>` returns the information associated with a specific user.

The following are for HTTP POSTs:

`/api/create`

Which expects JSON with at least the following field set:

```json
"Creating": "Post / Comment / User"
```

When you are creating a post, the following must be posted:

```json
{
    "Creating": "Post",
    "User": "UID (Pre-existing)"
    "Image": "Image URL",
    "Title": "Post Title",
    "Text": "This is what this post is about!"
}
```

When you are creating a comment, the following must be posted:

```json
{
    "Creating": "Comment",
    "Post": "PID (Pre-existing)",
    "User": "UID (Pre-existing)",
    "Text": "This is the comment itself."
}
```

When you are creating a user, the following must be posted:

```json
{
    "Creating": "User",
    "Name": "John Doe",
    "Image": "Image URL",
}
```
