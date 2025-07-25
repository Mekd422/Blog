const express = require("express")
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
    if(!req.body.username && req.body.username.length > 10) errors.push("username must be at most 10 characters."); 
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("username can only contain letters and numbers.");

    if(errors.length){
        return res.render("homepage", { errors});
    }else{
        res.send("Thank you for registering, ");
    }

});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});