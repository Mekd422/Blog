const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const express = require("express")
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("better-sqlite3")(path.join(__dirname, "blog.db"));
db.pragma("journal_mode = WAL");


// database setup starts here
const createTables = db.transaction(() => {
    db.prepare(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL)`
    ).run()
})

createTables();

// database setup ends here
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

//routes
app.get("/", (req, res) => {
    res.render("homepage");
});

app.get("/login", (req, res) => {
    res.render("login");   
});

app.post("/register", (req, res) => {
    const errors = []

    if(typeof req.body.username !== "string") req.body.username = "";
    if(typeof req.body.password !== "string") req.body.password = "";

    req.body.username = req.body.username.trim();

    if(!req.body.username) errors.push("you must provide a username.");
    if(req.body.username && req.body.username.length < 3) errors.push("username must be at least 3 characters.");
    if(req.body.username && req.body.username.length > 10) errors.push("username must be at most 10 characters."); 
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("username can only contain letters and numbers.");

    if(!req.body.password) errors.push("you must provide a password.");
    if(req.body.password && req.body.password.length < 6) errors.push("password must be at least 6 characters.");
    if(req.body.password && req.body.password.length > 12) errors.push("password must be at most 12 characters."); 

    if(errors.length){
        return res.render("homepage", { errors});
    }

    // save the new user into a database
    const salt = bcrypt.genSaltSync(10);
    req.body.password = bcrypt.hashSync(req.body.password, salt);
    const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    
    const result = ourStatement.run(req.body.username, req.body.password);

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?");
    const user = lookupStatement.get(result.lastInsertRowid);

    // log in the user in by giving then a cookie
    const token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, skyColor: "blue", userid: user.id }, process.env.JWTSECRET);

    res.cookie("ourSimpleApp", token,  { 
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: true ,
        sameSite: "strict"}); 

    res.send("Thank you");

});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});