import { useEffect, useState } from "react";
import NavBar from "../components/navbar";
import { useNavigate } from "react-router-dom";
import styles from "../css/friends.module.css";

import { BASE_URL } from "../apis/apis";


import { Link } from "react-router-dom";

function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [pendingAccept, setPendingAccept] = useState([]);
  const [requestISendPending, setRequestIsendPending] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchqQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

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
        //get_current_user();
        //fetch_profile();
        // fetchFeed();
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.log("Fail to verify Token");
    }
  };

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
        }
      );

      fetchFriendsRelatedData();
    } catch (error) {
      console.error("Failed to add Friend");
    }
  };

  const handleAcceptFriend = async (user_id) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/user/accept-friend?friend_id=${user_id}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFriendsRelatedData();
    } catch (error) {
      console.error("Failed to aceept Friend");
    }
    setLoading(false);
  };

  const PendingToAccept = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/user/pending-to-accept`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPendingAccept(data);
      //console.log(data)
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const Request_I_send_Pending = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/user/pending-request`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setRequestIsendPending(Array.isArray(data) ? data : []);
      //console.log(data)
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  //combine and fetch all friends related data at onece after login
  const fetchFriendsRelatedData = async () => {
    await fetchFriends();
    await fetchSuggested();
    await PendingToAccept();
    await Request_I_send_Pending();
  };

  useEffect(() => {
    fetchFriendsRelatedData();

    const fetch_interval = setInterval(fetchFriendsRelatedData, 1000);

    return () => clearInterval(fetch_interval);
  }, []);

  useEffect(() => {
    verify_token();
  }, [navigate]);

  const totla_firends = friends.length;
  const suggested_total = suggested.length;
  const pending_total = pendingAccept.length;
  const requested_total = requestISendPending.length;

  // useEffect(() => {
  //  fetchFriendsRelatedData();
  //}, []);

  return (
    <div className={styles.friends_page}>
      <div className={styles.navbar}>
        <NavBar />
      </div>

      <div style={{ paddingTop: "80px" }} className={styles.friend_content}>
        <div className={styles.my_friends}>
          <h1>My Friends</h1>
          <h3>You have {totla_firends} Friends</h3>
          {friends.map((friend) => (
            <div key={friend.id} className={styles.my_firends_list}>
              <Link
                style={{ textDecoration: "none" }}
                to={`/user/${friend.id}`}
              >
                <div className={styles.info}>
                  {friend.firstname} {friend.lastname}
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.add_new_friends}>
          <h1>Add New Friends ({suggested_total}) </h1>
          <div className={styles.searchBar}>
            <input
              placeholder="Search For Friend"
              type="text"
              value={searchqQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p>Searching for " {searchqQuery} "</p>
          {suggested.map(
            (friend) =>
              friend.firstname.toLowerCase().includes(searchqQuery) && (
                <div key={friend.id}>
                  <div className={styles.pro_img}></div>
                  <div className={styles.info}>
                    <Link
                      style={{ textDecoration: "none" }}
                      to={`/user/${friend.id}`}
                    >
                      {friend.firstname} {friend.lastname}
                    </Link>
                  </div>
                  <div className={styles.add_button}>
                    <button onClick={() => handleAddFriend(friend.id)}>
                      Add Friend
                    </button>
                  </div>
                </div>
              )
          )}
        </div>

        <div className={styles.friends_to_add}>
          <h1>Friends To Accept({pending_total}) </h1>
          {pendingAccept.map((friend_to_accept) => (
            <div key={friend_to_accept.id}>
              <div className={styles.friends_info}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={`/user/${friend_to_accept.id}`}
                >
                  <h4>{friend_to_accept.firstname} </h4>{" "}
                </Link>
              </div>
              <div className={styles.accept_button}>
                <button onClick={() => handleAcceptFriend(friend_to_accept.id)}>
                  Accept Friend Request
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.pending_to_accept}>
          <h1>Pending Request ({requested_total}) </h1>
          {requestISendPending.map((friend, index) => (
            <div key={friend.id}>
              <Link
                style={{ textDecoration: "none" }}
                to={`/user/${friend.id}`}
              >
                <h4>
                  {friend.firstname} {friend.lastname}
                </h4>
              </Link>
              <div className={styles.add_button}>
                <button>Cancel Request</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default FriendsPage;
