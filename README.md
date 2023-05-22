# Goblitz

## Go API

The following are for HTTP GETs:

`/api/posts` returns all posts visible to the user.

`/api/post/<PID>` returns the information associated with a specific post.

`/api/users.json` returns all users known to the user.

`/api/user/<UID>` returns the information associated with a specific user.

The following are for HTTP POSTs:

`/api/create/post`
`/api/create/comment`
`/api/create/user`

Which expects form data.
When you are creating a post, the following must be posted:

```
UID="UID (Pre-existing)"
Image="Image URL"
Title="Post Title"
Text="This is what this post is about!"
```

When you are creating a comment, the following must be posted:

```
PID="PID (Pre-existing)"
UID="UID (Pre-existing)"
Text="This is the comment itself."
```

When you are creating a user, the following must be posted:

```
Name="John Doe"
Image="Image URL"
```
