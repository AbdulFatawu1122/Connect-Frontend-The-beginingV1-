import { Link } from "react-router-dom";
import styles from "../css/navbar.module.css";
import { useEffect, useState } from "react";

import { BASE_URL } from "../apis/apis";

function NavBar() {
  return (
    <div>
      <div className={styles.navbar}>
        <div className={styles.left_logo}>
          <Link to={"/"} style={{textDecoration:'none'}}><p>J</p></Link>
        </div>
        <div className={styles.middle_items}>
          <Link title="Home, Feed, Love❤️" to={"/"}>Home 🏡</Link>
          <Link title="Your Profile, Post and timeline" to={"/profile"}>Profile👤</Link>
          <Link title="Checks on Your friends, add new and accept request" to={"/friends"}>Friends👥</Link>
        </div>

        <div className={styles.right_items}>
          <Link
            title="Logout from Connect"
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
