import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSubmit } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";
import styles from "../css/home.module.css";

import FeedCardForProfile from "../components/feed-card-for-profile";
import NavBar from "../components/navbar";

import { BASE_URL } from "../apis/apis";

function Home() {
  const user_token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [friends, setFriends] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loadingHomeData, setLoadingHomeData] = useState(false);

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

      if (current_user.ok) {
        const data = await current_user.json();
        setCurrentUser(data);
      } else if (current_user.status === 404) {
        navigate("/login");
      }
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
        //fetchHomeData();
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
        },
      );

      const result = await res.json();
      console.log(result);

      //Update data
      //If page 1, replace data, if page 2+, append data
      setFeeddata((prev) =>
        pageNum === 1 ? result.data : [...prev, ...result.data],
      );

      // Update hasMore
      setHasMore(result.hasMore);
      setLoadingInitial(false);
    } catch (error) {
      console.error("Fetch Error", error);
      setLoadingInitial(false);
    }
  }, []);

  const fetchFriends = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const friend_profile = await fetch(`${BASE_URL}/user/my-friends`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await friend_profile.json();
      // console.log(data);
      setFriends(data);
    } catch (eeror) {
      console.log("Fail to load friends");
    }
  };

  //Fetch suggested user
  const fetchSuggested = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const friend_profile = await fetch(`${BASE_URL}/user/sugestions`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await friend_profile.json();
      //console.log(data);
      setSuggested(data);
    } catch (eeror) {
      console.log("Fail to load Suggested Friends");
    }
  };

  const handleAddFriend = async (user_id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/user/friends?friend_id=${user_id}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchFriends();
      fetchSuggested();
    } catch (error) {
      console.error("Failed to add Friend");
    }
  };

  const fetchHomeData = async () => {
    setLoadingHomeData(true);
    await fetchFriends();
    await fetchSuggested();
    await fetch_profile();
    await get_current_user();
    setLoadingHomeData(false);
  };

  const entryToConnect = async () => {
    setLoadingHomeData(true);
    await fetchFriends();
    await fetchSuggested();
    await fetch_profile();
    await get_current_user();
    await verify_token();
    await fetchFeed(1);
    setLoadingHomeData(false);
  };

  useEffect(() => {
    entryToConnect();
  }, [navigate, fetchFeed]);

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

  return loadingHomeData ? (
    <div className={styles.connectLogo}>
      <p>C</p>
      <div className={styles.connectName}>
        <h2>Connect</h2>
        <span>Connecting you to peope that matter!</span>
      </div>
      <div className={styles.dots_loader}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  ) : (
    <div className={styles.mainHome}>
      <div className={styles.navBar}>
        <NavBar username={currentUser.user?.username}/>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.leftContent}>
          {loadingHomeData ? (
            <p>Loading data....</p>
          ) : (
            <div className={styles.ProfileInfo}>
              <div className={styles.profile_image}>
                {currentUser.profile?.status ? (
                  <img
                    src={`${currentUser.profile.media?.filename}`}
                    alt={`${currentUser.user?.firstname} profile picture`}
                  />
                ) : (
                  <img
                    src="https://vggbohfgmxodbzvbbrad.supabase.co/storage/v1/object/public/CoonectStorage/Asserts/no_profile.jpg"
                    alt={`${currentUser.user?.firstname} profile picture`}
                  />
                )}
              </div>
              <div className={styles.info}>
                <p>
                  {currentUser.user?.firstname} {currentUser.user?.lastname}
                </p>
                <p>{currentUser.user?.email}</p>
                <p>{profileData.middlename}</p>
                <p>{profileData.bio}</p>
              </div>
            </div>
          )}
        </div>
        <div className={styles.middleContent}>
          <div>
            <div style={{ paddingTop: "70px" }}>
              {loadingHomeData ? (
                <p>Loading....</p>
              ) : (
                <h2>Hello, {currentUser.user?.firstname}</h2>
              )}
            </div>
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
                endMessage={feedLenght()}
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
        <div className={styles.rightContent}>
          <div className={styles.rightMessage}>
            <h2>Welecome to Connect.</h2>
            <p>
              Lets Connect you to peope you will like to meet as new friends
            </p>
          </div>
          {loadingHomeData ? (
            <p>Loading Contacts</p>
          ) : (
            friends.length > 0 && (
              <div className={styles.contacts}>
                <h2>Contacts</h2>
                <p>Click on contact to start chatting</p>
                {friends.map((friend, idx) => (
                  <div key={idx} className={styles.myFriendinfo}>
                    <Link
                      style={{ textDecoration: "none" }}
                      to={`/chats/${friend.user?.id}`}
                    >
                      <div className={styles.contactsProfileImage}>
                        {friend.profilePic.status ? (
                          <img
                            src={`${friend.profilePic.media?.filename}`}
                            alt={`${friend.user?.firstname} profile picture`}
                          />
                        ) : (
                          <img
                            src="https://vggbohfgmxodbzvbbrad.supabase.co/storage/v1/object/public/CoonectStorage/Asserts/no_profile.jpg"
                            alt={`${friend.user?.firstname} profile picture`}
                          />
                        )}
                      </div>
                      <div className={styles.friendName}>
                        {friend.user?.firstname} {friend.user?.lastname}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
          {loadingHomeData ? (
            <p>Loading people you may know</p>
          ) : (
            suggested.length > 0 && (
              <div className={styles.newFriends}>
                <h2>People you may Know</h2>
                <div className={styles.suggestedFriends}>
                  {suggested.map((friend) => (
                    <div key={friend.user?.id} className={styles.friendToAdd}>
                      <div className={styles.friendsNameandProfilePic}>
                        <div className={styles.suggestedProfilePic}>
                          {friend.profilePic.status ? (
                            <img
                              src={`${friend.profilePic.media?.filename}`}
                              alt={`${friend.user?.firstname} profile picture`}
                            />
                          ) : (
                            <img
                              src="https://vggbohfgmxodbzvbbrad.supabase.co/storage/v1/object/public/CoonectStorage/Asserts/no_profile.jpg"
                              alt={`${friend.user?.firstname} profile picture`}
                            />
                          )}
                        </div>
                        <div className={styles.friendsName}>
                          <Link
                            style={{ textDecoration: "none" }}
                            to={`/user/${friend.user?.id}`}
                          >
                            {friend.user?.firstname} {friend.user?.lastname}
                          </Link>
                        </div>
                      </div>
                      <div className={styles.add_button}>
                        <button
                          onClick={() => handleAddFriend(friend.user?.id)}
                        >
                          Add Friend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
export default Home;
