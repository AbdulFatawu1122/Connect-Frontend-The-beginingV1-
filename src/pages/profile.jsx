import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/navbar";
import FeedCard from "../components/feed-card";
//import "../css/profile.css";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

function Profile() {
  const BASE_URL = "http://192.168.8.114:8000";

  const [profileData, setProfileData] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);
  const [userPost, setUserPost] = useState([]);

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

  //Updating Profile
  const [middlename, setMiddleName] = useState("");
  const [bio, setBio] = useState("");
  const [date_of_birth, setDataOfBirth] = useState("");
  const [town, setTown] = useState("");
  const [isformDisable, setisformDisable] = useState(true);
  const [foremerror, setformerror] = useState("");

  const handleenbaleform = () => setisformDisable(false);
  const handledisenbaleform = () => setisformDisable(true);

  const validateForm = () => {
    if (
      !middlename ||
      !bio ||
      !town ||
      !date_of_birth
    ) {
      setformerror("All fields Need to fill");
      return false;
    }
    setformerror("");
    return true;
  };

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
        setShowCreate(false);
        fetchProfileelatedData();
      } else {
        alert("Failed to create post");
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
        fetchProfileelatedData();
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
      //console.log(data);
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

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDetails = {
      middlename,
      bio,
      town,
      date_of_birth,
    };

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formDetails),
      });

      if (response.ok) {
        alert("Your Info Have been Updated");
        fetchProfileelatedData();
        setisformDisable(true)
      }
    } catch (error) {
      console.log("Error whilts updating Info", error);
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

  const feedLenght = () => {
    if (userPost.length >= 1) {
      return (
        <div>
          <h1>No more Post From You.</h1>
          <h3>
            Born on {format(Date(profileData.date_of_birth), "dd, MMMM yyyy")}
          </h3>
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
      <div className="loaders">
        <div className="post-main-card">
          <div className="post-card-container">
            <div className="post-card-profile">
              <div className="post-profile-image"></div>
              <div className="post-info">
                <div className="post-prfole-name-time-ago"></div>
              </div>
              <div className="post-firend-stats"></div>
            </div>
            <div className="post-card-description"></div>
            <div className="post-card-media"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="navbar">
        <NavBar />
      </div>

      <div style={{ paddingTop: "70px" }}>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{
            padding: "10px 20px",
            background: "#1877f2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          {showCreate ? "Hide Form" : "Create Post"}
        </button>

        {/* Create Post Form */}
        {showCreate && (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              background: "#f9f9f9",
              marginBottom: "20px",
            }}
          >
            <textarea
              placeholder="What's on your mind?"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              style={{ width: "100%", height: "80px", padding: "10px" }}
            />
            <input
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
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {mediaFiles.map((file, idx) => {
                  const isImage = file.type.startsWith("image");
                  const url = URL.createObjectURL(file);
                  return isImage ? (
                    <img
                      key={idx}
                      src={url}
                      alt={file.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                  ) : (
                    <video
                      key={idx}
                      controls
                      src={url}
                      style={{
                        width: "150px",
                        height: "100px",
                        borderRadius: "5px",
                      }}
                    />
                  );
                })}
              </div>
            )}
            <button
              type="submit"
              disabled={creatingpost}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                background: "#42b72a",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {creatingpost ? "Creating Post....." : "Post"}
            </button>
            {formSubmitionError && (
              <p style={{ color: "red" }}>{formSubmitionError}</p>
            )}
          </form>
        )}
      </div>
      <div className="lockers">
        <button className="unlock" onClick={handleenbaleform} type="button">
          Update Info
        </button>
        <button className="lock" onClick={handledisenbaleform} type="button">
          Lock form
        </button>
      </div>

      <div className="update-info">
        <form onSubmit={handleUpdateInfo}>
          <fieldset disabled={isformDisable}>
            <div className="middlname">
              <label>Middle Name</label>
              <input
                placeholder={profileData.middlename}
                value={middlename}
                onChange={(e) => setMiddleName(e.target.value)}
                type="text"
              />
            </div>
            <div className="bio">
              <label>BIO</label>
              <textarea
                placeholder={profileData.bio}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="town">
              <label>Town</label>
              <input
                placeholder={profileData.town}
                value={town}
                onChange={(e) => setTown(e.target.value)}
                type="text"
              />
            </div>
            <div className="date-of-birth">
              <label>Date of Birth</label>
              <input
                type="date" 
                value={date_of_birth}
                onChange={(e) => setDataOfBirth(e.target.value)}
                
              />
            </div>

            <div className="submit-button">
              <button type="submit"> Update Now</button>
            </div>
          </fieldset>
        </form>
      </div>

      {loadingProfileData ? (
        "Laoding User Profile Please Wait......"
      ) : (
        <div className="content">
          <div className="profile-info">
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
              {format(Date(profileData.date_of_birth), "dd, MMMM yyyy")}{" "}
            </h3>
          </div>
        </div>
      )}

      {loadingUserPost ? (
        FeedLoadingAninmate()
      ) : (
        <div className="my-timeline">
          <h1>What i Shared</h1>

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
