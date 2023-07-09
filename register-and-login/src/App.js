import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const API_BASE = "http://localhost:3001";
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  axios.defaults.withCredentials = true;

  const register = (e) => {
    e.preventDefault();
    axios
      .post(API_BASE + "/register", {
        username: usernameReg,
        password: passwordReg,
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  };
  const login = (e) => {
    e.preventDefault();
    axios
      .post(API_BASE + "/login", { username, password })
      .then((res) => {
        if (!res.data.auth) {
          setLoginStatus(false);
        } else {
          console.log(res.data);
          localStorage.setItem("token", res.data.token);
          setLoginStatus(true);
        }
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    axios
      .get(API_BASE + "/login")
      .then((res) => {
        if (res.data.loggedIn) setLoginStatus(true);
      })
      .catch((err) => console.log(err));
  }, []);
  const userAuthenticated = () => {
    axios
      .get(API_BASE + "/isUserAuth", {
        headers: { "x-access-token": localStorage.getItem("token") },
      })
      .then((res) => console.log(res.data));
  };
  return (
    <div className="App">
      <div>
        <h1>Registration</h1>
        <label>Username</label>
        <input
          type="text"
          onChange={(e) => setUsernameReg(e.target.value)}
        ></input>
        <br></br>
        <label>Password</label>
        <input
          type="text"
          onChange={(e) => setPasswordReg(e.target.value)}
        ></input>
        <br></br>
        <button onClick={(e) => register(e)}>Register</button>
      </div>
      <div className="login">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="username..."
          onChange={(e) => setUsername(e.target.value)}
        />
        <br></br>
        <input
          type="text"
          placeholder="password..."
          onChange={(e) => setPassword(e.target.value)}
        />
        <br></br>
        <button onClick={(e) => login(e)}>login</button>
      </div>
      <h1>
        {loginStatus && (
          <button onClick={userAuthenticated()}>Check is authenticated</button>
        )}
      </h1>
    </div>
  );
}

export default App;
