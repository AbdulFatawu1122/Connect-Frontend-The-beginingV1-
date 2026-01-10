import TimeAgo from "react-timeago";
import styles from "../css/feed_card_profile_main.module.css";
import { Link } from "react-router-dom";
import { useState } from "react";
const BASE_URL = "http://192.168.8.114:8000";

function FeedCard({ feed }) {
  const [showWarnindDialog, setShowWarningDialog] = useState(false);

  const showDeleteWarning = () => setShowWarningDialog(true);
  const hideDeleteWarning = () => setShowWarningDialog(false);

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

  const handleDeletePost = async (post_id) => {
    alert("You are about to delete a Post, This can not be Undo");
    try {
      const response = await fetch(
        `${BASE_URL}/posts/delete-post?post_id=${post_id}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
          },
        }
      );
      if (response.status === 200) {
        alert("You have Deleted a Post");
        window.location.reload();
      }
    } catch (error) {
      console.log("Failed to Delete a Post", error);
    }
  };

  const WarningBox = (post_id) => {
    if (showWarnindDialog) {
      return (
        <div className={styles.deleteDialogBox}>
          <div className={styles.content}>
            <div className={styles.dialog_box}>
              <div className={styles.message}>
                <h2>
                  You are about to Delete a Post.<br />Do yu Want to Continue.{" "}
                </h2>
                <p>Note You cant Undo This Process!</p>
              </div>
              <div className={styles.action_buttons}>
                <button
                  className={styles.cancel_button}
                  onClick={hideDeleteWarning}
                >
                  Cancel
                </button>
                <button className={styles.delete_button}
                onClick={() => handleDeletePost(post_id)}
                >Delete</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={styles.post_card}>
      <div className={styles.card_container}>
        <div className={styles.profile}>
          <div className={styles.profile_image}></div>
          <div className={styles.info}>
            <div className={styles.profile_name_time}>
              <p className={styles.name}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={`/user/${feed.user.id}`}
                  title={`${feed.user.firstname}, ${feed.user.lastname}`}
                >
                  {feed.user.firstname} {feed.user.lastname}
                </Link>
              </p>
              <p className={styles.time_ago}>
                <TimeAgo date={feed.time_created} />
              </p>
            </div>
          </div>
          <div className={styles.firend_stats}>
            {feed.is_friends === "friend" ? (
              <p style={{ color: "red" }}>Friends</p>
            ) : feed.is_friends == "not friend" ? (
              <p style={{ color: "red" }}>Not Friends!</p>
            ) : (
              <div className={styles.lefttoggle}>
                <p style={{ color: "red" }}>You</p>
                <button onClick={showDeleteWarning}>Delete</button>
              </div>
            )}
          </div>
        </div>
        {WarningBox(feed.id)}
        <div className={styles.post_description}>
          <p>{feed.post_description}</p>
        </div>
        <div className={styles.post_media}>
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
