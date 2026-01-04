import TimeAgo from "react-timeago";
import "../css/home1.css";
import { Link } from "react-router-dom";
const BASE_URL = "http://192.168.8.114:8000";

function FeedCard({ feed }) {
  const handleAddFriend = async (user_id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/user/friends?friend_id=${user_id}`,
        {
          method: "Post",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return "";
    } catch (error) {
      console.error("Failed to add Friend");
    }
  };


  return (
    <div className="post-card">
      <div className="card-container">
        <div className="profile">
          <div className="profile-image"></div>
          <div className="info">
            <div className="profile-name-time">
              <p className="name">
                <Link style={{textDecoration:"none"}} to={`/user/${feed.user.id}`}>{feed.user.firstname} {feed.user.lastname}</Link>
              </p>
              <p className="time-ago">
                <TimeAgo date={feed.time_created} />
              </p>
            </div>
          </div>
          <div className="firend-stats">
            {feed.is_friends === "friend" ? (
              <p style={{ color: "red" }}>Friends</p>
            ) : feed.is_friends == "not friend" ? (
              <p style={{ color: "red" }}>Not Friends!</p>
            ) : (
              <p style={{ color: "red" }}>You</p>
            )}
          </div>
        </div>
        <div className="post-description">
          <p>{feed.post_description}</p>
        </div>
        <div className="post-media">
          {feed.media.map((media) => {
            const IsImage = media.filetype === "image";

            return IsImage ? (
              <img
                key={media.id}
                src={`${BASE_URL}/src/uploads/${media.filename}`}
              />
            ) : (
              <video
                controls
                key={media.id}
                src={`${BASE_URL}/src/uploads/${media.filename}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FeedCard;
