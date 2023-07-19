import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Home from "./pages/Home";
import LoginAndRegister from "./pages/LoginAndRegister";

function App() {
  axios.defaults.withCredentials = true;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/" element={<LoginAndRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
