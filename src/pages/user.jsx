import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/navbar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useParams, useLocation } from "react-router-dom";
import FeedCardForProfile from "../components/feed-card-for-profile";

const BASE_URL = "http://192.168.8.114:8000";


function User() {
  const [profileData, setProfileData] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);
  const [userPost, setUserPost] = useState([]);



  const [friends, setFriends] = useState([]);

  const navigate = useNavigate();

  const location = useLocation()
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
        // fetchProfileelatedData();
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
        }
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
        }
      );

      const data = await user_profile.json();
      //console.log(data);
      setProfileData(data);
    } catch (eeror) {
      console.log("Fail to Load Profile");
    }
  };

  const fetchUserPosts = async (user_id) => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/posts/userPosts?user_id=${user_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
          },
        }
      );
      const data = await res.json();
      setUserPost(Array.isArray(data) ? data : []);
      //console.log(data)
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

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
        }
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

  const fetchProfileelatedData = async () => {
    setLoadingProfileData(true);
    await fetchUserPosts(user_id);
    await get_current_user(user_id);
    await fetch_profile(user_id);
    await fetchFriends(user_id);
    setLoadingProfileData(false);
  };

  const feedLenght = () => {
    if (userPost.length >= 1) {
      return (
        <div>
          <h1>No more Post From {currentUser.firstname}.</h1>
          <h3>
            Born on {format(Date(profileData.date_of_birth), "dd, MMMM yyyy")}
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
const totla_firends = friends.length


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
                Name: {currentUser.firstname}, {currentUser.lastname}
              </h1>
              <h3>Email: {currentUser.email} </h3>
              <h4>Age: {currentUser.age} years old </h4>
              <h4>BIO: {profileData.bio}</h4>
              <h4>Town: {profileData.town} </h4>
              <h3>Middle Name: {profileData.middlename} </h3>
              <h3>
                Date of Birth:{" "}
                {format(Date(profileData.date_of_birth), "dd, MMMM yyyy")}{" "}
              </h3>
            </div>
              <div className="relationships">
                <h1>{currentUser.firstname} Friends</h1>
                <h3>{currentUser.firstname} have {totla_firends} Friends</h3>
                {friends.map((friend) => (
                  <div key={friend.id} className="my-firends-list">
                    <Link style={{textDecoration:"none"}} to={`/user/${friend.id}`}>
                      <div className="info">
                        {friend.firstname} {friend.lastname}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>


            <div className="my-timeline">
              <h1>What {currentUser.firstname} Shared</h1>
              {userPost.map((post) => (
                <FeedCardForProfile key={post.id} feed={post} />
              ))}
              <div style={{ textAlign: "center" }}>{feedLenght()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default User;
