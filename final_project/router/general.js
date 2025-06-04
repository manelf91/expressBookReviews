const express = require('express');
const axios = require('axios').default;
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    new Promise((resolve, reject) => {
        // Simulate async operation
        resolve(books);
    }).then(data => {
        res.status(200).json(JSON.stringify(data));
    }).catch(err => {
        res.status(500).json({ error: err });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    new Promise((resolve, reject) => {
        const isbn = req.params.isbn;
        const book = books[isbn];
        return book ? resolve(book) : reject();
    }).then(book => {
        return res.status(200).json(book);
    }).catch(err => {
        return res.status(404).json({ message: "Book not found" });
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    new Promise((resolve, reject) => {
        const author = req.params.author;
        var filtered_books = [];

        Object.keys(books).forEach(isbn => {
            if (books[isbn].author === author) {
                filtered_books.push(books[isbn]);
            }
        });
        return resolve(filtered_books);
    }).then(filtered_books => {
        return res.status(200).json(JSON.stringify(filtered_books));
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    new Promise((resolve, reject) => {
        const title = req.params.title;
        var filtered_books = [];

        Object.keys(books).forEach(isbn => {
            if (books[isbn].title === title) {
                filtered_books.push(books[isbn]);
            }
        });
        return resolve(filtered_books);
    }).then(filtered_books => {
        return res.status(200).json(JSON.stringify(filtered_books));
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
