const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    return !users.some((user) => {
        return user.username === username;
    });
}

// Function to check if the user is authenticated
const authenticatedUser = (username, password) => {
    return users.some((user) => {
        return user.username === username && user.password === password;
    });
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password,
            username: username
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.username;

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    book.reviews[Object.keys(book.reviews).length] = {review: review, username: username};
    return res.status(200).json(book);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.username;

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    var new_reviews = [];
    Object.keys(book.reviews).forEach(index => {
        const review = book.reviews[index];
        if (review.username !== username) {
            new_reviews[new_reviews.length] = review;
        }
    });
    book.reviews = new_reviews;
    return res.status(200).send(book);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
