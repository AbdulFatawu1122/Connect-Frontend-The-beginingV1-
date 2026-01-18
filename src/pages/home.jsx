import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSubmit } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";


import styles from "../css/home.module.css";

import FeedCardForProfile from "../components/feed-card-for-profile";
import NavBar from "../components/navbar";

const BASE_URL = "http://192.168.8.114:8000";

function Home() {
  const user_token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [FeedData, setFeeddata] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [LoadingInitial, setLoadingInitial] = useState(true);

  //const [loadingFeed, setLoadingFeed] = useState(false);

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

  const fetchFeed = useCallback(async (pageNum) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/posts/test-v1-feed?limit=5&page=${pageNum}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      console.log(result);

      //Update data
      //If page 1, replace data, if page 2+, append data
      setFeeddata((prev) =>
        pageNum === 1 ? result.data : [...prev, ...result.data]
      );

      // Update hasMore
      setHasMore(result.hasMore);
      setLoadingInitial(false);
    } catch (error) {
      console.error("Fetch Error", error);
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    verify_token();
  }, [navigate]);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  // Loading more
  const loadNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const feedLenght = () => {
    if (FeedData.length >= 1) {
      return <h1>No more Feed</h1>;
    } else {
      return <h1>No feed available</h1>;
    }
  };

  const FeedLoadingAninmate = () => {
    return (
      <div className="loaders">
        <div className={styles.postmaincard}>
          <div className={styles.postcardcontainer}>
            <div className={styles.postcardprofile}>
              <div className={styles.postprofileimage}></div>
              <div className={styles.postinfo}>
                <div className={styles.postprfolenametimeago}></div>
              </div>
              <div className={styles.postfirendstats}></div>
            </div>
            <div className={styles.postcarddescription}></div>
            <div className={styles.postcardmedia}></div>
          </div>
        </div>
      </div>
    );
  };

  const feedTotal = FeedData.length;
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
        {LoadingInitial ? (
          FeedLoadingAninmate()
        ) : (
          <InfiniteScroll
            dataLength={FeedData.length}
            next={loadNextPage}
            hasMore={hasMore}
            loader={FeedLoadingAninmate()}
            endMessage={<h1 style={{textAlign:"center"}}>No more Feed.</h1>}
            scrollThreshold={0.9} //load more post when user is 200px from the buttom
          >
            <div>
              {FeedData.map((post) => {
                return <FeedCardForProfile key={post.id} feed={post} />;
              })}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
export default Home;
