import { Link } from "react-router-dom";
import "../css/navbar.css";
import { useEffect, useState } from "react";
const BASE_URL = "http://192.168.8.114:8000";

function NavBar() {
  return (
    <div>
      <div className="navbar">
        <div className="left-logo">
          <Link to={"/"} style={{textDecoration:'none'}}><p>J</p></Link>
        </div>
        <div className="middle-items">
          <Link to={"/"}>Home 🏡</Link>
          <Link to={"/profile"}>Profile👤</Link>
          <Link to={"/friends"}>Friends👥</Link>
        </div>

        <div className="right-items">
          <Link
            to={"/login"}
            onClick={() => sessionStorage.removeItem("token")}
          >
            Logout📤
          </Link>
        </div>
      </div>
      
    </div>
  );
}

export default NavBar;
