const express = require("express");
const mysql2 = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const saltRounds = 10; //increases, strongness of encrypted password increases

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "userId",
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24, //session will expired after 24 hours
    },
  })
);

const db = mysql2.createConnection({
  user: "sagini",
  host: "localhost",
  database: "loginSystem",
  password: "root",
});

// db.connect();
db.connect((err) => {
  console.log(err);
  console.log("connected..");
  var users =
    "CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY,username varchar(23),password varchar(500))";
  db.query(users, () => console.log("Users table is created"));
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "INSERT INTO users (username,password) VALUES (?,?)",
      [username, hash],
      (err, result) => {
        console.log(err);
      }
    );
  });
});
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  const sql = "SELECT * FROM users WHERE username = ?;";
  db.query(sql, [username], (err, result) => {
    if (err) {
      res.json(err);
    }
    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (err, response) => {
        if (response) {
          const id = result[0].id;
          const username = result[0].username;
          const token = jwt.sign({ id, username }, "jwtSecretIsMySecret", {
            expiresIn: 300,
          });
          req.session.user = result;
          res.json({ auth: true, token });
        } else {
          res.json({
            auth: false,
            message: "Wrong combination of username and password",
          });
        }
      });
    } else {
      res.json({ auth: false, message: "User doesn't exist" });
    }
  });
});
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});
// middleware
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("We need token ");
  } else {
    jwt.verify(token, "jwtSecretIsMySecret", (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "You failed to authenticate" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.send("you are authenticated");
});

app.listen(3001, () => {
  console.log("server is running");
});
