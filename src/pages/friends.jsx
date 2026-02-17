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

  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [acceptingFriend, setAcceptingFriend] = useState(false);
  const [loadingMyfriends, setLoadingMyFriends] = useState(false);
  const [loadingSuggestedUsers, setLoadingSuggestedUsers] = useState(false);
  const [loadingFriendsToAccept, setLoadingFriendsToaccept] = useState(false);
  const [loadingpageError, setloadingPageError] = useState(false);

  const [loadingFriendsPage, setLoadingFriendsPage] = useState(false);

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
      setLoadingMyFriends(true);
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
      setLoadingMyFriends(false);
    } catch (eeror) {
      setloadingPageError(true);
      console.log("Fail to load friends");
    }
  };

  //Fetch suggested user
  const fetchSuggested = async () => {
    const token = sessionStorage.getItem("token");
    try {
      setLoadingSuggestedUsers(true);
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
      setLoadingSuggestedUsers(false);
    } catch (eeror) {
      console.log("Fail to load Suggested Friends");
    }
  };

  const handleAddFriend = async (user_id) => {
    try {
      setAddingFriend(true);
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
      setAddingFriend(false);
      if (response.ok) {
        fetchFriends();
        fetchSuggested();
        requestISendPending();
      } else {
        alert(
          "This user already sent you a request go to friends tab to accep",
        );
      }
    } catch (error) {
      console.error("Failed to add Friend ", error);
    }
  };
  const handleAcceptFriend = async (friend_id) => {
    setLoading(true);
    try {
      setAcceptingFriend(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/user/accept-friend?friend_id=${friend_id}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAcceptingFriend(false);

      if (response.ok) {
        fetchFriends();
        PendingToAccept();
      } else {
        alert("Failed to accept friend");
      }
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
    setLoadingFriendsPage(true);
    await fetchFriends();
    await fetchSuggested();
    await PendingToAccept();
    await Request_I_send_Pending();
    setLoadingFriendsPage(false);
  };

  useEffect(() => {
    fetchFriendsRelatedData();
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
        {loadingpageError ? (
          <h2>Failed to load Page, Please refresh the page to try again</h2>
        ) : (
          <div>
            {loadingFriendsPage ? (
              <h2>Loading Friends Data.......wait small.</h2>
            ) : (
              <div>
                {loadingMyfriends ? (
                  <p>Loading your friends....Please wait!</p>
                ) : (
                  <div className={styles.my_friends}>
                    <h1>My Friends</h1>
                    <h3>You have {totla_firends} Friends</h3>
                    {friends.map((friend, idx) => (
                      <div key={idx} className={styles.my_firends_list}>
                        <Link
                          style={{ textDecoration: "none" }}
                          to={`/user/${friend.user?.id}`}
                        >
                          <div className={styles.info}>
                            {friend.user?.firstname} {friend.user?.lastname}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.suggestionList}>
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
                  <div className={styles.newFriends}>
                    {suggested.map(
                      (friend) =>
                        friend.user?.firstname
                          .toLowerCase()
                          .includes(searchqQuery) && (
                          <div
                            key={friend.user?.id}
                            className={styles.newFriendToadd}
                          >
                            <div className={styles.pro_img}>
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
                            <div className={styles.info}>
                              <Link
                                style={{ textDecoration: "none" }}
                                to={`/user/${friend.user?.id}`}
                              >
                                {friend.user?.firstname} {friend.user?.lastname}
                              </Link>
                            </div>
                            <div className={styles.add_button}>
                              <button
                                disabled={addingFriend}
                                onClick={() => handleAddFriend(friend.user?.id)}
                              >
                                {addingFriend ? "processing.." : "Add Friend"}
                              </button>
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                </div>
                <div className={styles.friends_to_add}>
                  <h1>Friends To Accept({pending_total}) </h1>
                  {pendingAccept.map((friend_to_accept) => (
                    <div key={friend_to_accept.user?.id}>
                      <div className={styles.friends_info}>
                        <Link
                          style={{ textDecoration: "none" }}
                          to={`/user/${friend_to_accept.user?.id}`}
                        >
                          <h4>
                            {friend_to_accept.user?.firstname}{" "}
                            {friend_to_accept.user?.lastname}{" "}
                          </h4>{" "}
                        </Link>
                      </div>
                      <div className={styles.accept_button}>
                        <button
                          disabled={acceptingFriend}
                          onClick={() =>
                            handleAcceptFriend(friend_to_accept.user?.id)
                          }
                        >
                          {acceptingFriend
                            ? "processing"
                            : "Accept Friend Request"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.pending_to_accept}>
                  <h1>Pending Request ({requested_total}) </h1>
                  {requestISendPending.map((friend, index) => (
                    <div key={friend.user?.id}>
                      <Link
                        style={{ textDecoration: "none" }}
                        to={`/user/${friend.user?.id}`}
                      >
                        <h4>
                          {friend.user?.firstname} {friend.user?.lastname}
                        </h4>
                      </Link>
                      <div className={styles.add_button}>
                        <button>Cancel Request</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default FriendsPage;
