import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import { useParams } from "react-router-dom";
import styles from "../css/settings.module.css";
import { addYears, format, parseISO } from "date-fns";

import { BASE_URL } from "../apis/apis";

function Settings() {
  const [currentUser, setCurrentUser] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [userPost, setUserPost] = useState([]);
  const [isformDisable, setisformDisable] = useState(true);

  const [uploadingProfile, setUploadingProfile] = useState(false);

  //Updating USer info
  const [middlename, setMiddleName] = useState("");
  const [bio, setBio] = useState("");
  const [date_of_birth, setDataOfBirth] = useState("");
  const [town, setTown] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [schoolname, setSchoolName] = useState("");
  const [student_number, setStudentNumber] = useState("");
  const [course_name, setCourseName] = useState("");
  const [hobby, setHobby] = useState("");
  const [relationship, setRelationship] = useState("");

  const [profileImage, setProfileImage] = useState([]);

  const handleenbaleform = () => setisformDisable(false);
  const handledisenbaleform = () => setisformDisable(true);
  const [foremerror, setformerror] = useState("");
  const [submitingForm, setSubmittingForm] = useState(false);

  const [showUpdate, setShowUpdate] = useState(false);

  const navigate = useNavigate();

  const { user_id } = useParams();

  const ShowUpdateUserInfoPopup = () => setShowUpdate(true);
  const HideUpdateYserInfoPopup = () => setShowUpdate(false);

  const validateForm = () => {
    if (
      !middlename ||
      !bio ||
      !town ||
      !date_of_birth ||
      !firstname ||
      !lastname ||
      !gender ||
      !course_name ||
      !schoolname ||
      !student_number ||
      !username
    ) {
      setformerror("All fields Need to fill");
      return false;
    }
    setformerror("");
    return true;
  };
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDetails = {
      profile_data: {
        middlename,
        bio,
        town,
        date_of_birth,
        hobby,
        relationship,
      },
      user_info: {
        firstname,
        lastname,
        gender,
        username,
        schoolname,
        course_name,
        student_number,
      },
    };

    try {
      setSubmittingForm(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDetails),
      });
      setSubmittingForm(false);
      if (response.ok) {
        alert("Your Info Have been Updated");
        fetchProfileData();
        setisformDisable(true);
        HideUpdateYserInfoPopup();
      }
    } catch (error) {
      setSubmittingForm(false);
      console.log("Error whilts updating Info", error);
      setformerror("Failed to Update your Info, Try Again");
    }
  };

  const handleChangeProfileImage = async (e) => {
    e.preventDefault();
    if (profileImage) {
      const formData = new FormData();
      formData.append("file", profileImage);
      setUploadingProfile(true);
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/posts/profileImage`, {
          method: "POST",
          body: formData,
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          alert("You have changed your profile picture");
          setProfileImage([]);
          navigate("/profile");
        }
        setUploadingProfile(false);
      } catch (error) {
        console.error("Something went wrong and failed to change profile");
      }
    } else {
      alert("You have to select or upload an Image");
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
        },
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
        },
      );

      const data = await user_profile.json();
      //console.log(data);
      setProfileData(data);
    } catch (eeror) {
      console.log("Fail to Load Profile");
    }
  };

  useEffect(() => {
    verify_token();
  }, [navigate]);

  const fetchProfileData = async () => {
    await fetch_profile(user_id);
    await get_current_user(user_id);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const updatindUserInfo = () => {
    if (showUpdate)
      return (
        <div className={styles.modaloverlay}>
          <div className={styles.updateinfo}>
            {submitingForm && (
              <div className={styles.loadingoverlay}>
                <div className={styles.spinner}></div>
                <p>Updating Profile...</p>
              </div>
            )}
            <div className={styles.closebutton}>
              <button
                disabled={uploadingProfile}
                onClick={HideUpdateYserInfoPopup}
              >
                ❌
              </button>
            </div>
            <form onSubmit={handleUpdateInfo}>
              <fieldset>
                <div className={styles.username}>
                  <label>UserName</label>
                  <input
                    type="text"
                    placeholder="User Name..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className={styles.firstname}>
                  <label>First Name</label>
                  <input
                    placeholder={currentUser.user.firstname}
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                  />
                </div>
                <div className={styles.lastname}>
                  <label>Last Name</label>
                  <input
                    placeholder={currentUser.user.lastname}
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                  />
                </div>

                <div className={styles.middlname}>
                  <label>Middle Name</label>
                  <input
                    placeholder={profileData.middlename}
                    value={middlename}
                    onChange={(e) => setMiddleName(e.target.value)}
                    type="text"
                  />
                </div>
                <div className={styles.bio}>
                  <label>BIO</label>
                  <textarea
                    placeholder={profileData.bio}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className={styles.town}>
                  <label>Town</label>
                  <input
                    placeholder={profileData.town}
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    type="text"
                  />
                </div>
                <div className={styles.dateofbirth}>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={date_of_birth}
                    onChange={(e) => setDataOfBirth(e.target.value)}
                  />
                </div>

                <div className={styles.student_number}>
                  <label>Student ID</label>
                  <input
                    type="text"
                    placeholder={currentUser?.user.student_number}
                    value={student_number}
                    onChange={(e) => setStudentNumber(e.target.value)}
                  />
                </div>

                <div className={styles.hobby}>
                  <label>What you Like</label>
                  <input
                    type="text"
                    placeholder="What do you Like?"
                    value={hobby}
                    onChange={(e) => setHobby(e.target.value)}
                  />
                </div>

                <div className={styles.schoolname}>
                  <label>Select a School</label>
                  <select
                    value={schoolname}
                    onChange={(e) => setSchoolName(e.target.value)}
                  >
                    <option>---Select School-----</option>
                    <option value="tamale technincal university">
                      Tamale Technical University
                    </option>
                  </select>
                </div>

                <div className={styles.coursename}>
                  <label>Program or Course Name</label>
                  <select
                    value={course_name}
                    onChange={(e) => setCourseName(e.target.value)}
                  >
                    <option>----Choose your Program-----</option>
                    <option value="btech information technology">
                      BTech Information Technology
                    </option>
                    <option value="btech cyber sycurity">
                      Btech Cyber Security
                    </option>
                  </select>
                </div>

                <div className={styles.gender}>
                  <label>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option>----Select Gender---</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className={styles.submitbutton}>
                  <button type="submit"> Update Now</button>
                </div>
              </fieldset>
            </form>
            {foremerror && <p style={{ color: "red" }}>{foremerror}</p>}
          </div>
        </div>
      );
  };

  const formatDateofBirth = (dateString) => {
    const date = dateString;
    const dateObject = parseISO(dateString);
    const formatted_date = format(dateObject, "dd, MMMM, yyyy");

    return formatted_date;
  };

  return (
    <>
      <NavBar />
      <div className={styles.mainbody}>
        <div className={styles.settingtext}>
          <h1>Settings.</h1>
        </div>
        <div className={styles.lineabovesettingstext}></div>
        <h1>Manage your Account {currentUser.firstname} </h1>
        <div
          className={styles.chnageProfileImage}
          style={{ alignItems: "center", textAlign: "center" }}
        >
          <fieldset>
            <h2>click to choose your new Profile Picture and hit Change</h2>
            <form onSubmit={handleChangeProfileImage}>
              <input
                style={{ width: "400px" }}
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
                type="file"
              />
              {uploadingProfile ? (
                <h2>Uploading Your Profile wait....</h2>
              ) : (
                <button
                  style={{
                    width: "130px",
                    backgroundColor: "green",
                    height: "50px",
                  }}
                  type="submit"
                >
                  Change Your Profile
                </button>
              )}
            </form>
          </fieldset>
        </div>
        <div className={styles.settingsContent}>
          <div className={styles.profielInfo}>
            <h3>Profile Information</h3>
            <h4>
              First Name: <strong>{currentUser.user?.firstname}</strong>
            </h4>
            <h4>
              Middlename{" "}
              <strong>
                <strike>{profileData.middlename}</strike>
              </strong>
            </h4>
            <h4>
              Last Name: <strong>{currentUser.user?.lastname}</strong>{" "}
            </h4>
            <h4>
              Gender: <strong style={{textTransform:"capitalize"}}>{currentUser.user?.gender}</strong>
            </h4>
            <h4>
              Hobby: <strong style={{textTransform:"capitalize"}}>{profileData?.hobby}</strong>
            </h4>

            <h4>
              School: <strong style={{textTransform:"capitalize"}}>{currentUser.user?.schoolname}</strong>
            </h4>

            <h4>
              Program: <strong style={{textTransform:"capitalize"}}>{currentUser.user?.course_name}</strong>
            </h4>

            <h4>
              Born on:{" "}
              <strong>
                {currentUser.user?.date_of_birth
                  ? formatDateofBirth(currentUser.user?.date_of_birth)
                  : "Loading"}
              </strong>
            </h4>
            <h4>
              Email or Phone: <strong>{currentUser.user?.email}</strong>{" "}
            </h4>
          </div>
          <div className={styles.userDetails}>
            <h3>{currentUser.user?.firstname} Details</h3>
            <h4>
              Bio: <strong>{profileData.bio}</strong>
            </h4>
            <h4>
              Town: <strong>{profileData.town}</strong>
            </h4>
          </div>

          <div className={styles.updateButton}>
            <div className={styles.updateuserinfo}>
              <button onClick={ShowUpdateUserInfoPopup}>
                Update User Info
              </button>
              {updatindUserInfo()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
