import TimeAgo from "react-timeago";
import styles from "../css/feed_card_profile_main.module.css";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import CommentsBoxComponent from "./comments";

import { BASE_URL, WEB_SOC_BASE_URL } from "../apis/apis";

function FeedCard({ feed }) {
  const [showWarnindDialog, setShowWarningDialog] = useState(false);

  const showDeleteWarning = () => setShowWarningDialog(true);
  const hideDeleteWarning = () => setShowWarningDialog(false);

  const [showPost, setShowPost] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [totalLikes, setTotalLikes] = useState(0);
  const [commentContent, setCommentContent] = useState("");

  const [loadedComments, setLoadedComments] = useState([]);

  const [postLikers, setPostLikers] = useState([]);

  const [messages, setMessages] = useState([]);
  const soundURL = "/facebook_likes.mp3";
  const playSound = () => {
    new Audio(soundURL).play().catch((e) => {
      console.log("Falied to play Sound");
    });
  };

  const ShowMediaFull = () => {
    setShowPost(true);
    console.log("Image cliked");
  };
  const HideShowMediaFull = () => {
    console.log("Image Closed");
    setShowPost(false);
    console.log(showPost);
  };

  const ws = useRef(null);

  const OpenCommentsBox = async (post_id) => {
    //console.log(post_id);
    setShowComments(true);

    console.log("You have open the comments box");
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/posts/loadComments?post_id=${post_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setLoadedComments(data);
      }
    } catch (error) {
      console.log("Falied to load comments", error);
    }
    //After loading all comments we start live comments
    ws.current = new WebSocket(
      `${WEB_SOC_BASE_URL}/posts/ws-comments/${post_id}`,
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setLoadedComments((prevMessage) => [data, ...prevMessage]);
    };

    ws.current.onclose = () => console.log("Websocket disconnected");
  };
  const closeCommentsBox = () => {
    setShowComments(false);
    if (ws.current) {
      ws.current.close();
      ws.current = null; //clear the ref
    }
    console.log("You have close the comments box and Websocket has closed");
  };

  console.log(showPost);

  const handleAddComment = async (post_id) => {
    if (!commentContent.trim()) return;
    try {
      console.log(post_id);
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/posts/commentV3?post_id=${post_id}&comment=${commentContent}`,
        {
          method: "Post",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        //alert("Comment added Succefully");
        //OpenCommentsBox();
        setCommentContent("");
      }
    } catch (error) {
      console.log("Falied to add comment");
    }
  };

  const handleKeyDown = ({ e, post_id }) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment(post_id);
    }
  };

  const LikePost = async (post_id) => {
    try {
      playSound();
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/posts/likes?post_id=${post_id}&likes=1`,
        {
          method: "Post",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setTotalLikes(data.total_likes);
        console.log("You have Liked a Post");
        console.log(totalLikes);
      }
    } catch (error) {
      console.error("Failed to Like a post");
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
        },
      );
      if (response.status === 200) {
        alert("You have Deleted a Post");
        window.location.reload();
      }
    } catch (error) {
      console.log("Failed to Delete a Post", error);
    }
  };

  const CommentsBox = () => {
    if (showComments) {
      return (
        <div className={styles.CommentsDisplaBox}>
          <button onClick={closeCommentsBox}>❌</button>
          <div className={styles.CommentsContent}>
            <div>
              {loadedComments.length >= 1 ? (
                <div>
                  {loadedComments.map((comment) => {
                    if (feed.id === comment.comment.post_id) {
                      return (
                        <div key={comment?.comment?.id}>
                          <CommentsBoxComponent comments={comment} />
                        </div>
                      );
                    }
                  })}
                </div>
              ) : (
                <h1>No comments for this Post</h1>
              )}
            </div>
          </div>
          <div className={styles.TypeCommentsInput}>
            <input
              onKeyDown={(e) => {
                if (e.key == "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment(feed.id);
                }
              }}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              type="text"
              placeholder="Type a comment"
            />
            <button onClick={() => handleAddComment(feed.id)}>Send</button>
          </div>
        </div>
      );
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
                  You are about to Delete a Post.
                  <br />
                  Do yu Want to Continue.{" "}
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
                <button
                  className={styles.delete_button}
                  onClick={() => handleDeletePost(post_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const LoadLikersProfile = async (post_id) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/posts/loadLikers?post_id=${post_id}`,
        {
          method: "Get",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setPostLikers(data);
        console.log(data);
      }
    } catch (error) {
      console.log("Falied to load Likers", error);
    }
  };

  const LikersList = () => {
    if (postLikers.length >= 1) {
      return postLikers
        .map((liker) => `${liker.firstname} ${liker.lastname}`)
        .join("\n");
    } else {
      return "No one";
    }
  };

  return (
    <div className={styles.post_card}>
      <div className={styles.card_container}>
        <div className={styles.profile}>
          <div className={styles.profile_image}>
            {
              feed.user.profilePic.status ? (
                <img 
            src={`${BASE_URL}/src/uploads/${feed.user.profilePic.media?.filename}`}
            alt={`${feed.user.userInfo.firstname} profile picture`}
            />
              ): (
                <img 
            src={`${BASE_URL}/src/uploads/no_profile.jpg`}
            alt={`${feed.user.userInfo.firstname} profile picture`}
            />
              )
             }
          </div>
          <div className={styles.info}>
            <div className={styles.profile_name_time}>
              <p className={styles.name}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={`/user/${feed.user.id}`}
                  title={`${feed.user.firstname}, ${feed.user.lastname}`}
                >
                  {feed.user.userInfo.firstname} {feed.user.userInfo.lastname} 
                </Link>
                 {feed.is_profile && ("  Updated Profile")}
              </p>
              <p className={styles.time_ago}>
                <TimeAgo date={feed.time_created} />
              </p>
              
            </div>
          </div>
        </div>
        {WarningBox(feed.id)}
        <div className={styles.post_description}>
          <p>{feed.post_description}</p>
        </div>
        <div className={showPost ? styles.MediaBox : styles.MediaNormal}>
          <button onClick={HideShowMediaFull}>Close ❌</button>
          <div className={showPost ? styles.popupPostMedia : styles.post_media}>
            {feed.media.map((media) => {
              const IsImage = media.filetype === "image";

              return IsImage ? (
                <img
                  onClick={ShowMediaFull}
                  key={media.id}
                  src={`${BASE_URL}/src/uploads/${media.filename}`}
                  loading="lazy"
                />
              ) : (
                <video
                  onClick={ShowMediaFull}
                  controls
                  key={media.id}
                  src={`${BASE_URL}/src/uploads/${media.filename}`}
                  loading="lazy"
                />
              );
            })}
          </div>
        </div>
        <div className={styles.buttomStats}>
          <div className={styles.likesLove}>
            <button
              title={`Like by\n${LikersList()}`}
              onMouseEnter={() => LoadLikersProfile(feed.id)}
              onClick={() => LikePost(feed.id)}
            >
              👍🏻 {totalLikes ? totalLikes : feed.likes}
            </button>
          </div>
          <div className={styles.commentIcon}>
            <button onClick={() => OpenCommentsBox(feed.id)}>
              🗨️{feed.total_comments}
            </button>
            <div>{CommentsBox(loadedComments)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedCard;
