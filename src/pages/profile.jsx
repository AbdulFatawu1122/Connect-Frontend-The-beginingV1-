import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/navbar";
import FeedCard from "../components/feed-card";
import styles from "../css/profile.module.css";
import { format, parseISO } from "date-fns";

import { useNavigate } from "react-router-dom";

function Profile() {
  const BASE_URL = "http://192.168.8.114:8000";


  const [profileData, setProfileData] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);
  const [userPost, setUserPost] = useState([]);

  const [searchQuery, setSearchQiery] = useState("");

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creatingpost, setCreatingPost] = useState(false);
  const [formSubmitionError, setFormSubmitionError] = useState("");
  const [hasMore, setHasMore] = useState(true); //if a page have more posts
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [postDescription, setPostDescription] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});

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
        fetchUserPosts()
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

  const fetchUserPosts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      setLoadingUserPost(true);
      const res = await fetch(`${BASE_URL}/posts/`, {
        method: "Get",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUserPost(Array.isArray(data) ? data : []);
      setLoadingUserPost(false);
      //console.log(data)
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchProfileelatedData = async () => {
    setLoadingProfileData(true);
    await fetchUserPosts();
    await get_current_user();
    await fetch_profile();
    setLoadingProfileData(false);
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
    if (userPost.length >= 1) {
      return (
        <div>
          <h1>No more Post From You.</h1>
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
          <h2>You have not posted anything on your spaces profile</h2>
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
          <button className={styles.closePostFormButton} onClick={() => HideCreatePost()}>Close❌</button>
          <form className={styles.createPostForm} onSubmit={handleSubmit}>
            <textarea
              className={styles.createPostTextArea}
              placeholder="What's on your mind?"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
            />
            <input
              className={styles.createPostInput}
              type="file"
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
              Welecome On Board {currentUser.firstname}, {currentUser.lastname}
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

      <div>
        <h1>
          <Link to={`/settings/${currentUser.id}`}>Settings</Link>
        </h1>
      </div>

      {loadingUserPost ? (
        FeedLoadingAninmate()
      ) : (
        <div className={styles.myTimeline}>
          <h1>What i Shared</h1>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search Post"
              value={searchQuery}
              onChange={(e) => setSearchQiery(e.target.value)}
            />
          </div>

          {userPost.map((post) => (
            <FeedCard key={post.id} feed={post} />
          ))}
          <div style={{ textAlign: "center" }}>{feedLenght()}</div>
        </div>
      )}
    </div>
  );
}

export default Profile;
