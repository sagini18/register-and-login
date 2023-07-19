import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const LoginAndRegister = () => {
  const API_BASE = "http://localhost:3001";
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(false);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    axios
      .post(API_BASE + "/register", {
        username: usernameReg,
        password: passwordReg,
      })
      .then((res) => {
        console.log(res.data);
        navigate("/Home", { state: { username: usernameReg, loginStatus } });
      })
      .catch((err) => console.log(err));
    axios
      .post(API_BASE + "/set-cookie", { username: usernameReg })
      .then((res) => console.log(res.data));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(API_BASE + "/set-cookie", { username: username })
      .then((res) => console.log(res.data));
    axios
      .get(API_BASE + "/login/" + username + "/" + password)
      .then((res) => {
        if (!res.data.auth) {
          setLoginStatus(false);
          toast.error(res.data.message);
        } else {
          console.log(res.data);
          localStorage.setItem("token", res.data.token);
          setLoginStatus(true);
          navigate("/Home", { state: { username: username, loginStatus } });
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5 pt-5">
      <Toaster toastOptions={{ duration: 4000 }} />
      <div className="d-flex flex-column justify-content-center align-items-center">
        <h1>Registration</h1>

        <input
          type="text"
          placeholder="username..."
          className="form-control mt-3"
          onChange={(e) => setUsernameReg(e.target.value)}
        ></input>
        <br></br>
        <input
          type="text"
          placeholder="password..."
          className="form-control align-self-center"
          onChange={(e) => setPasswordReg(e.target.value)}
        ></input>
        <br></br>
        <button className="btn btn-success" onClick={(e) => handleRegister(e)}>
          Register
        </button>
      </div>
      <div className="d-flex flex-column justify-content-center align-items-center mt-5">
        <h3>Already Have an Account</h3>
        <h1>Login</h1>
        <input
          type="text"
          className="form-control mt-3"
          placeholder="username..."
          onChange={(e) => setUsername(e.target.value)}
        />
        <br></br>
        <input
          type="text"
          className="form-control"
          placeholder="password..."
          onChange={(e) => setPassword(e.target.value)}
        />
        <br></br>
        <button
          className="btn  mb-3 btn-primary"
          onClick={(e) => handleLogin(e)}
        >
          login
        </button>
      </div>
    </div>
  );
};

export default LoginAndRegister;
