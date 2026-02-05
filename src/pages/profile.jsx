import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/navbar";
import FeedCard from "../components/feed-card";
import styles from "../css/profile.module.css";
import { format, parseISO } from "date-fns";
import InfiniteScroll from "react-infinite-scroll-component";

import { BASE_URL } from "../apis/apis";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [profileData, setProfileData] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);
  const [userPost, setUserPost] = useState([]);

  const [FeedData, setFeeddata] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [LoadingInitial, setLoadingInitial] = useState(true);

  const [searchQuery, setSearchQiery] = useState("");

  const [loading, setLoading] = useState(false);
  const [creatingpost, setCreatingPost] = useState(false);
  const [formSubmitionError, setFormSubmitionError] = useState("");
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [postDescription, setPostDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});

  const [friends, setFriends] = useState([]);

  const ShowCreatePost = () => setShowCreate(true);
  const HideCreatePost = () => setShowCreate(false);
  const [loadingUserPost, setLoadingUserPost] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postDescription && mediaFiles.length === 0) {
      setFormSubmitionError("Provide Post Description or Upload Media");
      return;
    }
    setFormSubmitionError("");
    const formData = new FormData();
    formData.append("post_description", postDescription);
    mediaFiles.forEach((file) => formData.append("files", file));
    setCreatingPost(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        body: formData,
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${token}`,
        },
      });
      setCreatingPost(false);
      if (res.ok) {
        //alert("Post created!");
        setPostDescription("");
        setMediaFiles([]);
        //fetchProfileelatedData();
        fetchFeed(1);
        HideCreatePost();
      } else {
        alert("Failed to create post");
        setPostDescription("");
        setMediaFiles([]);
        fetchProfileelatedData();
        HideCreatePost();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
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

  const get_current_user = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const current_user = await fetch(`${BASE_URL}/user/me`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await current_user.json();
      // console.log(data);
      setCurrentUser(data);
    } catch (eeror) {
      console.log("Fail to get Current User");
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
      // console.log(data);
      setProfileData(data);
    } catch (eeror) {
      console.log("Fail to Load Profile");
    }
  };

  const fetchFeed = useCallback(async (pageNum) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/posts/profilePost?page=${pageNum}&limit=5`,
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

  const fetchProfileelatedData = async () => {
    setLoadingProfileData(true);
    await get_current_user();
    await fetch_profile();
    await fetchFriends();
    setLoadingProfileData(false);
  };

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  // Loading more
  const loadNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  useEffect(() => {
    verify_token();
  }, [navigate]);

  useEffect(() => {
    fetchProfileelatedData();
  }, []);

  const formatDate = (dateString) => {
    // parseISO converts the string to a date object
    const date_string = dateString;
    const dateObject = parseISO(date_string);

    const formatted_date = format(dateObject, "dd MMMM, yyyy");

    return formatted_date;
  };

  const feedLenght = () => {
    if (FeedData.length >= 1) {
      return (
        <div>
          <h3>No more Post From You.</h3>
          <h1>
            Born on,{" "}
            {profileData.date_of_birth
              ? formatDate(profileData.date_of_birth)
              : "Loading ......"}
          </h1>
        </div>
      );
    } else {
      return (
        <div>
          <h4>You have not posted anything on your spaces profile</h4>
          <p>
            Click on the <strong>Create Post</strong> Button to start sharing on
            your new online environment{" "}
          </p>
        </div>
      );
    }
  };

  const FeedLoadingAninmate = () => {
    return (
      <div className={styles.loaders}>
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

  const ShowPostCreation = () => {
    return (
      <div className={styles.postCreationShower}>
        <div className={styles.PostCreationArea}>
          {creatingpost && (
            <div className={styles.loadingoverlay}>
              <div className={styles.spinner}></div>
              <p>
                <strong>Creating your Post.....</strong>
              </p>
            </div>
          )}
          <button
            className={styles.closePostFormButton}
            onClick={() => HideCreatePost()}
          >
            Close❌
          </button>
          <form className={styles.createPostForm} onSubmit={handleSubmit}>
            <textarea
              className={styles.createPostTextArea}
              placeholder="What are you sharing today?"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
            />
            <input
              className={styles.createPostInput}
              type="file"
              accept="video/*,image/*"
              multiple
              onChange={(e) =>
                setMediaFiles((prev) => [
                  ...prev,
                  ...Array.from(e.target.files),
                ])
              }
              style={{ marginTop: "10px" }}
            />
            {mediaFiles.length > 0 && (
              <div className={styles.createPostMediaPreview}>
                {mediaFiles.map((file, idx) => {
                  const isImage = file.type.startsWith("image");
                  const url = URL.createObjectURL(file);
                  return isImage ? (
                    <img
                      className={styles.CreatePostPreviewImage}
                      key={idx}
                      src={url}
                      alt={file.name}
                    />
                  ) : (
                    <video
                      className={styles.createPostPreviewVideo}
                      key={idx}
                      controls
                      src={url}
                    />
                  );
                })}
              </div>
            )}
            <button
              className={styles.createPostSubmitButton}
              type="submit"
              disabled={creatingpost}
            >
              {creatingpost ? "Creating Post....." : "Post"}
            </button>
            {formSubmitionError && (
              <p style={{ color: "red" }}>{formSubmitionError}</p>
            )}
          </form>
        </div>
      </div>
    );
  };

  const totla_firends = friends.length;

  return (
    <div className={styles.profilePage}>
      <div className={styles.navbar}>
        <NavBar />
      </div>
      <div className={styles.createPost}>
        <button
          className={styles.createPostBtn}
          onClick={() => ShowCreatePost()}
        >
          Create Post
        </button>

        {/* Create Post Form */}
        {showCreate && ShowPostCreation()}
      </div>
      {loadingProfileData ? (
        "Laoding User Profile Please Wait......"
      ) : (
        <div className={styles.content}>
          <div className={styles.profileInfo}>
            <h1>Profile Details</h1>
            <h1>
              Welecome On Board {currentUser.user?.firstname}, {currentUser.lastname}
            </h1>
            <h3>Email: {currentUser.email} </h3>
            <h4>Age: {currentUser.age} years old </h4>
            <h4>BIO: {profileData.bio}</h4>
            <h4>Town: {profileData.town} </h4>
            <h3>Middle Name: {profileData.middlename} </h3>
            <h3>
              Date of Birth:{" "}
              {profileData.date_of_birth
                ? formatDate(profileData.date_of_birth)
                : "Loading..."}
            </h3>
          </div>
        </div>
      )}

      <div className={styles.my_friends}>
        <h1>My Friends</h1>
        <h3>You have {totla_firends} Friends</h3>
        <h3>Click on firend to chat with</h3>
        {friends.map((friend) => (
          <div key={friend.id} className={styles.my_firends_list}>
            <Link style={{ textDecoration: "none" }} to={`/chats/${friend.id}`}>
              <div className={styles.info}>
                {friend.firstname} {friend.lastname}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div>
        <h1>
          <Link to={`/settings/${currentUser.user?.id}`}>Settings</Link>
        </h1>
      </div>

      {LoadingInitial ? (
        FeedLoadingAninmate()
      ) : (
        <InfiniteScroll
          dataLength={FeedData.length}
          next={loadNextPage}
          hasMore={hasMore}
          loader={FeedLoadingAninmate()}
          endMessage={<h1 style={{ textAlign: "center" }}>{feedLenght()}</h1>}
          scrollThreshold={0.9} //load more post when user is 200px from the buttom
        >
          <div>
            {FeedData.map((post) => {
              return <FeedCard key={post.id} feed={post} />;
            })}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default Profile;
