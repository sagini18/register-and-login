import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const API_BASE = "http://localhost:3001";
  axios.defaults.withCredentials = true;
  const location = useLocation();
  const navigate = useNavigate();
  const [noOfViews, setNoOfViews] = useState(0);
  const [user, setUser] = useState([]);
  const [userObj] = user; // userObj = user[0]
  const [isAuthenticated, setIsAuthenticated] = useState("");
  const [loginStatus, setLoginStatus] = useState(
    location?.state?.loginStatus || false
  );
  const finalUsername = userObj?.username || location?.state?.username;

  useEffect(() => {
    axios
      .get(API_BASE + "/loggedUser")
      .then((res) => {
        if (res.data.loggedIn) {
          setLoginStatus(true);
        } else {
          toast.error("Session Time Out");
        }
        if (res.data.sessionViews) setNoOfViews(res.data.sessionViews);
        if (res.data.user) setUser(res.data.user);
      })
      .catch((err) => console.log(err));
  }, []);

  const userAuthenticated = () => {
    axios
      .get(API_BASE + "/isUserAuth", {
        headers: { "x-access-token12": localStorage.getItem("token") },
      })
      .then((res) => setIsAuthenticated(res.data));
  };
  const handleLogout = () => {
    axios
      .get(API_BASE + "/logout")
      .then((res) => {
        console.log(res.data);
        setLoginStatus(false);
        navigate("/");
      })
      .catch((err) => console.log(err));
  };
  return (
    loginStatus && (
      <div className="mt-5 pt-5 d-flex flex-column justify-content-center align-items-center">
        {" "}
        <Toaster toastOptions={{ duration: 4000 }} />
        {noOfViews === 0 && toast.success("Login Success")}
        <button className="btn btn-light mt-5" onClick={userAuthenticated}>
          Check is authenticated
        </button>
        <h4 className="mt-5 text-warning">{isAuthenticated}</h4>
        <h5 className="mt-3">Welcome {finalUsername}</h5>
        <h5 className="mt-3"> You have visited {noOfViews || 1} times</h5>
        <button
          className="btn btn-danger mt-5"
          onClick={() => {
            handleLogout();
            toast.success("Logout");
          }}
        >
          Logout
        </button>{" "}
      </div>
    )
  );
};

export default Home;
