import { useEffect, useState } from "react";
import { useNavigate, useSubmit } from "react-router-dom";
import AddFriendCard from "../components/add_friend_card";

import TimeAgo from "react-timeago"; // to caluculate a time ago post

import { Link } from "react-router-dom";

import styles from "../css/login.module.css";

import { use } from "react";
import FeedCard from "../components/feed-card";
import NavBar from "../components/navbar";

const BASE_URL = "http://192.168.8.114:8000";

function Home() {
  const user_token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [postDescription, setPostDescription] = useState("");
  const [postFiles, setPostFiles] = useState([]);

  const [feed_data, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  //get the current user to verify their token
  const get_current_user = async () => {
    try {
      const current_user = await fetch(`${BASE_URL}/user/me`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${user_token}`,
        },
      });

      const data = await current_user.json();
      // console.log(data);
      setCurrentUser(data);
    } catch (eeror) {
      console.log("Fail to get Current User");
    }
  };

  const verify_token = async () => {
    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(`${BASE_URL}/auth/verify-token/${token}`, {
        method: "Post",
        headers: {
          accept: "application/json",
        },
      });

      if (response.ok) {
        // console.log("Login");
        get_current_user();
        fetch_profile();
      } else {
        navigate("/login");
      }
    } catch (error) {
      sessionStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetch_profile = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const user_profile = await fetch(`${BASE_URL}/user/profile`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await user_profile.json();
      //console.log(data);
      setProfileData(data);
    } catch (eeror) {
      console.log("Fail to Load Profile");
    }
  };

  const fetchFeed = async () => {
    
    try {
      const token = sessionStorage.getItem("token");
      setLoadingFeed(true);
      const res = await fetch(`${BASE_URL}/posts/feed`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFeed(Array.isArray(data) ? data : []);
      setLoadingFeed(false);
      // console.log(data);
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
    
  };

  useEffect(() => {
    verify_token();
  }, [navigate]);

  useEffect(() => {
    fetchFeed();
  }, []);

  const feedLenght = () => {
    if (feed_data.length >= 1) {
      return <h1>No more Feed.</h1>;
    } else {
      return <h1>No feed available</h1>;
    }
  };

  const FeedLoadingAninmate = () => {
    return (
      <div className="loaders">
        <div className="post-main-card">
          <div className="post-card-container">
            <div className="post-card-profile">
              <div className="post-profile-image"></div>
              <div className="post-info">
                <div className="post-prfole-name-time-ago"></div>
              </div>
              <div className="post-firend-stats"></div>
            </div>
            <div className="post-card-description"></div>
            <div className="post-card-media"></div>
          </div>
        </div>

        <div className="post-main-card">
          <div className="post-card-container">
            <div className="post-card-profile">
              <div className="post-profile-image"></div>
              <div className="post-info">
                <div className="post-prfole-name-time-ago"></div>
              </div>
              <div className="post-firend-stats"></div>
            </div>
            <div className="post-card-description"></div>
            <div className="post-card-media"></div>
          </div>
        </div>

        <div className="post-main-card">
          <div className="post-card-container">
            <div className="post-card-profile">
              <div className="post-profile-image"></div>
              <div className="post-info">
                <div className="post-prfole-name-time-ago"></div>
              </div>
              <div className="post-firend-stats"></div>
            </div>
            <div className="post-card-description"></div>
            <div className="post-card-media"></div>
          </div>
        </div>
      </div>
    );
  };

  const feedTotal = feed_data.length;
  return (
    <div className="main-home">
      <div>
        <NavBar />
      </div>
      <div>
        <h1 style={{ paddingTop: "70px" }}>Hello, {currentUser.firstname}</h1>
      </div>

      <div style={{ textAlign: "center", backgroundColor: "yellow" }}>
        <h1>What others Shared ({feedTotal}) </h1>
      </div>

      <div>
        {loadingFeed ? (
          FeedLoadingAninmate()
        ) : (
          <div>
            {feed_data.map((post) => (
              <FeedCard key={post.id} feed={post} />
            ))}
            <div style={{ textAlign: "center" }}>{feedLenght()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Home;
