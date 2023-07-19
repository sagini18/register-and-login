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
    unInitialized: false,
    cookie: {
      expires: 1000 * 60 * 5, //session will expire after 5 minutes
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
app.post("/set-cookie", (req, res) => {
  const username = req.body?.username;
  // set cookie, cookie is available for 15 minutes and it is accessible only by server via http request
  res.cookie("username", username, { maxAge: 900000, httpOnly: true });
  res.send("Cookie set!");
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
app.get("/login/:username/:password", (req, res) => {
  const username = req.params.username;
  const password = req.params.password;
  // retrieve cookie
  console.log("username from cookie:", req?.cookies?.username);

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
          // generate token
          const payload = { id, username };
          const jwtSecret = "jwtSecretIsMySecret";
          const token = jwt.sign(payload, jwtSecret, { expiresIn: 300 });

          req.session.user = result;
          res.json({ auth: true, token, sessionViews: req.session.views });
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
app.get("/loggedUser", (req, res) => {
  // express-session
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user,
      sessionViews: req.session.views,
    });
  } else {
    res.json({ loggedIn: false });
  }
});
// middleware
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token12"];
  if (!token) {
    res.send("We need token ");
  } else {
    jwt.verify(token, "jwtSecretIsMySecret", (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "You failed to authenticate" });
      } else {
        console.log("decoded: ", decoded);
        req.userIdToken = decoded.id;
        next();
      }
    });
  }
};

app.get("/isUserAuth", verifyJWT, (req, res) => {
  res.send("you are authenticated");
});
app.get("/logout", (req, res) => {
  req.session.views = 0;
  req.session.destroy();
  console.log(
    "is cookies alive after deleting session: ",
    req.cookies.username
  );
});
app.listen(3001, () => {
  console.log("server is running");
});
