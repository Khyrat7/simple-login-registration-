//jshint esversion:6
// encrypting the secret data in .env file 
require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mysql = require("mysql");
// hashing text package for encrypting the password
const md5 = require("md5");

// making express able to read from local stored folder (public)
const app = express();
app.use(express.static("public"));


// setting body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// setting the view engine to ejs
app.set('view engine', 'ejs');



// creating a connection to mySQL database
const db = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

// testing mySQL connection
db.connect(function (err) {
    if (err) throw err;
    console.log("mySQL is Connected");
})


// home page
app.get("/", function (req, res) {
    res.render("home");
})

// login page
app.get("/login", function (req, res) {
    res.render("login");
})

// register page
app.get("/register", function (req, res) {
    res.render("register");
})


// posting register page
app.post("/register", function (req, res) {
    let strSQL = "";
    const username = req.body.username;
    let password = md5(req.body.password);

    // check if the user exist and if exist direct to the login page
    strSQL = "SELECT COUNT(id) as count FROM users WHERE username = '" + username + "'";
    db.query(strSQL, function (err, results) {

        if (results[0].count === 1) { // user already exist
            res.redirect("/login");
        } else { // new user
            strSQL = "INSERT INTO users (username, pword) VALUES ('" + username + "', '" + password + "')";
            db.query(strSQL, function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("secrets");
                }
            })

        }
    })
})



// posting login page
app.post("/login", function (req, res) {
    let strSQL = "";
    const username = req.body.username;
    let password = md5(req.body.password);

    // check if the user exist if not direct to register page
    strSQL = "SELECT COUNT(id) as count FROM users WHERE username = '" + username + "'";
    db.query(strSQL, function (err, results) {
        if (results[0].count === 0) { // user doesn't exist in db
            res.redirect("/register");
        } else {  // user exists in the db
            // fetching the password for the user
            strSQL = "SELECT pword FROM users WHERE username = '" + username + "'";
            db.query(strSQL, function (err, results) {
                // checking the entered password with the password stored in mysql db
                if (results[0].pword === password) {
                    res.render("secrets");
                } else {
                    console.log("wrong password");
                }

            })
        }
    })
})









// setting the server on port 3000
app.listen(3000, function () {
    console.log("Server is running on port 3000");
})