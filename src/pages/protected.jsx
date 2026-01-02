import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Assuming AddFriendCard is a component you still want to use, kept it for now.
// import AddFriendCard from "../components/add_friend_card";

// Changed import to use the new CSS file


// Base URL remains unchanged as requested
const BASE_URL = "http://192.168.8.114:8000";


// --- Icons (Using simple text/emojis for now, you should replace with actual icons like FontAwesome) ---
const HomeIcon = "🏠";
const FriendsIcon = "🧑‍🤝‍🧑";
const GroupsIcon = "👥";
const UserIcon = "👤"; // For profile link

function Home() {
  const user_token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // State to manage the active view/tab: 'feed' (default) or 'friends'
  const [activeTab, setActiveTab] = useState("feed"); 

  const [currentUser, setCurrentUser] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [friends, setFriends] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [pendingAccept, setPendingAccept] = useState([]);
  const [requestISendPending, setRequestIsendPending] = useState([]);

  const [userPost, setUserPost] = useState([]);

  // --- API Calls (Moved to a separate function for clarity in useEffects) ---

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
      setCurrentUser(data);
    } catch (error) {
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
        get_current_user();
        fetch_profile();
        fetchUserPosts();
        fetchFriendsData(); // Fetch friend-related data on verification
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
      setProfileData(data);
    } catch (error) {
      console.log("Fail to Load Profile");
    }
  };

  // Combined function to fetch all friend-related data
  const fetchFriendsData = async () => {
    await fetchFriends();
    await fetchSuggested();
    await PendingToAccept();
    await Request_I_send_Pending();
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
      setFriends(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Fail to load friends");
    }
  };

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
      setSuggested(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Fail to load Suggested Friends");
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/posts/feed`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${user_token}`,
        },
      });
      const data = await res.json();
      setUserPost(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleAddFriend = async (user_id) => {
    try {
      await fetch(
        `${BASE_URL}/user/friends?friend_id=${user_id}`, // Used BASE_URL
        {
          method: "Post",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${user_token}`,
          },
        }
      );

      // Re-fetch only the friend-related lists that change
      fetchFriends();
      Request_I_send_Pending();
      fetchSuggested();
    } catch (error) {
      console.error("Failed to add Friend");
    }
  };

  const handleAcceptFriend = async (user_id) => {
    try {
      await fetch(
        `${BASE_URL}/user/accept-friend?friend_id=${user_id}`, // Used BASE_URL
        {
          method: "Post",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${user_token}`,
          },
        }
      );

      // Re-fetch only the friend-related lists that change
      PendingToAccept();
      fetchFriends();
    } catch (error) {
      console.error("Failed to accept Friend");
    }
  };

  const PendingToAccept = async () => {
    try {
      const res = await fetch(`${BASE_URL}/user/pending-to-accept`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${user_token}`,
        },
      });
      const data = await res.json();
      setPendingAccept(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching pending accepts:", err);
    }
  };

  const Request_I_send_Pending = async () => {
    try {
      const res = await fetch(`${BASE_URL}/user/pending-request`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${user_token}`,
        },
      });
      const data = await res.json();
      setRequestIsendPending(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  // --- Use Effects ---

  useEffect(() => {
    verify_token();
  }, [navigate]);

  // Combined initial data fetching into a single call after token verification (inside verify_token)
  // Removed redundant useEffects that were using useState incorrectly
  // --- Components for different views ---

  const FriendsView = () => (
    <div className="friends-view-container">
      <h2>🧑‍🤝‍🧑 Friends Manager</h2>
      <hr />
      
      {/* Friend Requests (Pending Accept) */}
      <div className="friend-section">
        <h3>Friend Requests ({pendingAccept.length})</h3>
        {pendingAccept.length > 0 ? (
          pendingAccept.map((friend) => (
            <div key={friend.id} className="friend-card-small request">
              <div className="pro-img"></div>
              <div className="info">
                <strong>{friend.firstname} {friend.lastname}</strong>
                <span>sent you a request.</span>
              </div>
              <div className="add-button">
                <button 
                  className="accept-btn" 
                  onClick={() => handleAcceptFriend(friend.id)}
                >
                  Confirm
                </button>
                <button className="delete-btn">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No new friend requests.</p>
        )}
      </div>

      {/* People You May Know (Suggested) */}
      <div className="friend-section">
        <h3>People You May Know</h3>
        {suggested.length > 0 ? (
          <div className="suggested-grid">
            {suggested.map((friend) => (
              <div key={friend.id} className="friend-card-large suggestion">
                <div className="pro-img"></div>
                <div className="info">
                  <strong>{friend.firstname} {friend.lastname}</strong>
                  <span className="mutual">0 mutual friends</span>
                </div>
                <div className="add-button">
                  <button 
                    className="add-btn" 
                    onClick={() => handleAddFriend(friend.id)}
                  >
                    + Add Friend
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No suggestions at the moment.</p>
        )}
      </div>

      {/* All Friends */}
      <div className="friend-section">
        <h3>All Friends ({friends.length})</h3>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.user_id} className="friend-card-small my-friend">
              <div className="pro-img"></div>
              <div className="info">
                <strong>{friend.firstname} {friend.lastname}</strong>
              </div>
              <div className="add-button">
                 <button className="delete-btn">Unfriend</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">You have no friends yet.</p>
        )}
      </div>

      {/* Pending Sent Requests */}
      <div className="friend-section">
        <h3>Requests I Sent (Pending)</h3>
        {requestISendPending.length > 0 ? (
          requestISendPending.map((friend) => (
            <div key={friend.id} className="friend-card-small sent-request">
              <div className="pro-img"></div>
              <div className="info">
                <strong>{friend.firstname} {friend.lastname}</strong>
                <span>request sent.</span>
              </div>
              <div className="add-button">
                <button className="cancel-btn">
                  Cancel Request
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No pending outgoing requests.</p>
        )}
      </div>
    </div>
  );

  const FeedView = () => (
    <div className="feed-container">
      <h2>Welcome Back, {currentUser.firstname}!</h2>

      {/* Simple Post Composer Placeholder */}
      <div className="post-composer">
        <textarea placeholder={`What's on your mind, ${currentUser.firstname}?`} />
        <button className="post-button">Post</button>
      </div>
      
      {/* User Posts/Feed */}
      <h3>Recent Posts</h3>
      {userPost.length > 0 ? (
        userPost.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
                <div className="pro-img small"></div>
                <div>
                    <span className="post-time">{new Date(post.time_created).toLocaleString()}</span>
                </div>
            </div>
            <p className="post-description">{post.post_description}</p>
            <div className="post-media">
              {post.media.map((m) => {
                const IsImage = m.filetype === "image";
                const mediaUrl = `${BASE_URL}/src/uploads/${m.filename}`;

                return IsImage ? (
                  <img
                    className="post-image"
                    src={mediaUrl}
                    alt="Post Media"
                  />
                ) : (
                  <video
                    className="post-video"
                    controls
                    src={mediaUrl}
                  />
                );
              })}
            </div>
            <div className="post-footer">
                <button className="like-btn">👍 Like</button>
                <button className="comment-btn">💬 Comment</button>
            </div>
          </div>
        ))
      ) : (
        <p className="no-data">No posts to display.</p>
      )}
    </div>
  );
  
  // --- Main Render ---

  return (
    <div className="fb-layout">
      {/* 1. Top Header/Navigation Bar */}
      <header className="fb-header">
        <div className="header-left">
          <Link to="/" className="logo-text">Jojok</Link>
        </div>
        <div className="header-center">
          <nav className="main-nav">
            <button 
              className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveTab('feed')}
            >
              {HomeIcon} Home
            </button>
            <button 
              className={`nav-item ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              {FriendsIcon} Friends
            </button>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-profile-icon">
            <Link to="/profile">
                {UserIcon} {currentUser.firstname}
            </Link>
          </div>
          <Link to="/login" onClick={() => sessionStorage.removeItem("token")} className="logout-btn">
             Logout
          </Link>
        </div>
      </header>
      
      {/* 2. Main Content Area */}
      <div className="fb-content-wrapper">
        
        {/* Left Sidebar - Navigation & Links */}
        <aside className="left-sidebar">
            <div className="sidebar-link">
                <div className="pro-img small"></div>
                <strong>{currentUser.firstname} {currentUser.lastname}</strong>
            </div>
            <div className="sidebar-link active">
                {FriendsIcon} Friends
            </div>
            <div className="sidebar-link">
                {GroupsIcon} Groups
            </div>
            <hr className="divider"/>
            <p className="sidebar-title">Your Shortcuts</p>
            <div className="sidebar-link">
                🖼️ Photos
            </div>
            <div className="sidebar-link">
                🗓️ Events
            </div>
        </aside>

        {/* Middle Content - Dynamic View */}
        <main className="main-content">
          {activeTab === 'feed' ? <FeedView /> : <FriendsView />}
        </main>
        
        {/* Right Sidebar - Chat/Contacts/Suggestions */}
        <aside className="right-sidebar">
             <p className="sidebar-title">Contacts</p>
             {friends.slice(0, 5).map(friend => (
                <div key={friend.user_id} className="contact-item">
                    <span className="contact-status online"></span>
                    {friend.firstname} {friend.lastname}
                </div>
             ))}
             {friends.length > 5 && <div className="contact-item more">...and {friends.length - 5} more</div>}
             <hr className="divider"/>
             <p className="sidebar-title">Your Profile Info</p>
             <div className="profile-summary">
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Age:</strong> {currentUser.age}</p>
                <p><strong>Town:</strong> {profileData.town}</p>
                <p><strong>Bio:</strong> {profileData.bio ? profileData.bio.substring(0, 50) + '...' : 'No bio set'}</p>
             </div>
        </aside>
        
      </div>
    </div>
  );
}

export default Home;