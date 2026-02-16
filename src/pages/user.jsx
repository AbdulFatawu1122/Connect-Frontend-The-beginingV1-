import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/navbar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useParams, useLocation } from "react-router-dom";
import FeedCardForProfile from "../components/feed-card-for-profile";
import InfiniteScroll from "react-infinite-scroll-component";
import { BASE_URL } from "../apis/apis";

function User() {
  const [profileData, setProfileData] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);

  const [FeedData, setFeeddata] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [LoadingInitial, setLoadingInitial] = useState(true);

  const [friends, setFriends] = useState([]);

  const navigate = useNavigate();

  const location = useLocation();
  const me_id = location.state?.user_id;

  // Get the user id from the URL
  const { user_id } = useParams();
  //console.log(user_id);

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
        fetchProfileelatedData();
      } else {
        navigate("/login");
        sessionStorage.removeItem("token");
      }
    } catch (error) {
      console.log("Something went wrong");
    }
  };

  const get_current_user = async (user_id) => {
    try {
      const token = sessionStorage.getItem("token");
      const current_user = await fetch(
        `${BASE_URL}/user/user-to-get?user_id=${user_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await current_user.json();
      // console.log(data);
      setCurrentUser(data);
    } catch (eeror) {
      console.log("Fail to get Current User");
    }
  };

  const fetch_profile = async (user_id) => {
    const token = sessionStorage.getItem("token");
    try {
      const user_profile = await fetch(
        `${BASE_URL}/user/get-profile?user_id=${user_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
          },
        },
      );

      const data = await user_profile.json();
      //console.log(data);
      setProfileData(data);
    } catch (eeror) {
      console.log("Fail to Load Profile");
    }
  };

  const fetchFeed = useCallback(
    async (pageNum) => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `${BASE_URL}/posts/userPosts?user_id=${user_id}&limit=5&page=${pageNum}`,
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
    },
    [user_id],
  ); //add the user_id here so that when a user is change we clear the old data and uses the new one.

  const fetchFriends = async (user_id) => {
    const token = sessionStorage.getItem("token");
    try {
      const friend_profile = await fetch(
        `${BASE_URL}/user/user-friends?user_id=${user_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await friend_profile.json();
      //  console.log(data);
      setFriends(data);
    } catch (eeror) {
      console.log("Fail to load friends");
    }
  };

  useEffect(() => {
    verify_token();
  }, [navigate]);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const loadNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const fetchProfileelatedData = async () => {
    setLoadingProfileData(true);
    await get_current_user(user_id);
    await fetch_profile(user_id);
    await fetchFriends(user_id);
    setLoadingProfileData(false);
  };

  const feedLenght = () => {
    if (FeedData.length >= 1) {
      return (
        <div>
          <h1>No more Post From {currentUser.user?.firstname}.</h1>
          <h3>
            Born on {format(Date(currentUser.user?.date_of_birth), "dd, MMMM yyyy")}
          </h3>
        </div>
      );
    } else {
      return (
        <div>
          <p> ooOps {currentUser.firstname} has not shared anything yet.</p>
        </div>
      );
    }
  };
  const totla_firends = friends.length;

  useEffect(() => {
    if (user_id) {
      fetchProfileelatedData();
    }
  }, [user_id]);

  return (
    <div className="profile-page">
      <div className="navbar">
        <NavBar />
      </div>

      <div style={{ paddingTop: "70px" }}>
        {loadingProfileData ? (
          "Laoding User Profile Please Wait......"
        ) : (
          <div className="content">
            <div className="profile-info">
              <h1>Profile</h1>

              <h1>
                Name: {currentUser.user?.firstname}, {currentUser.lastname}
              </h1>
              <h3>Email: {currentUser.user?.email} </h3>
              <h4>BIO: {profileData.bio}</h4>
              <h4 style={{ textTransform: "capitalize" }}>
                Town: {profileData.town}{" "}
              </h4>
              <h3 style={{ textTransform: "capitalize" }}>
                Middle Name: {profileData.middlename}{" "}
              </h3>
              <h3 style={{ textTransform: "capitalize" }}>
                Hobby: {profileData?.hobby}
              </h3>
              <h3 style={{ textTransform: "capitalize" }}>
                Relationship: {profileData?.relationship_status}
              </h3>
              <h3 style={{ textTransform: "capitalize" }}>
                Gender: {currentUser.user?.gender}
              </h3>
              <h3 style={{ textTransform: "capitalize" }}>
                School: {currentUser.user?.schoolname}
              </h3>
              <h3 style={{ textTransform: "capitalize" }}>
                Program: {currentUser.user?.course_name}
              </h3>
            </div>
            <div className="relationships">
              <h1>{currentUser.user?.firstname} Friends</h1>
              <h3>
                {currentUser.user?.firstname} have {totla_firends} Friends
              </h3>
              {friends.map((friend) => (
                <div key={friend.user?.id} className="my-firends-list">
                  <Link
                    style={{ textDecoration: "none" }}
                    to={`/chats/${friend.user?.id}`}
                  >
                    <div className="info">
                      {friend.user?.firstname} {friend.user?.lastname}
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="my-timeline">
              <h1>What {currentUser.firstname} Shared</h1>
              {LoadingInitial ? (
                <p>Loading Post</p>
              ) : (
                <InfiniteScroll
                  dataLength={FeedData.length}
                  next={loadNextPage}
                  hasMore={hasMore}
                  loader={<h4>Loading More Post</h4>}
                  endMessage={
                    <div>
                      <h1 style={{ textAlign: "center" }}>
                        You have Reach the end of posts
                      </h1>
                      <div style={{ textAlign: "center" }}>{feedLenght()}</div>
                    </div>
                  }
                  scrollThreshold={0.9}
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
        )}
      </div>
    </div>
  );
}

export default User;
