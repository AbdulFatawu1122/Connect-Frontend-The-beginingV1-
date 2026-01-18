import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import { useParams } from "react-router-dom";
import styles from "../css/settings.module.css";
import { format, parseISO } from "date-fns";

const BASE_URL = "http://192.168.8.114:8000";


function Settings() {
  const [currentUser, setCurrentUser] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);
  const [userPost, setUserPost] = useState([]);
  const [isformDisable, setisformDisable] = useState(true);

  //Updating USer info
  const [middlename, setMiddleName] = useState("");
  const [bio, setBio] = useState("");
  const [date_of_birth, setDataOfBirth] = useState("");
  const [town, setTown] = useState("");
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
    if (!middlename || !bio || !town || !date_of_birth) {
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
      middlename,
      bio,
      town,
      date_of_birth,
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
        }
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
        }
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
    fetch_profile(user_id);
    get_current_user(user_id);
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
              <button onClick={HideUpdateYserInfoPopup}>❌</button>
            </div>
            <form onSubmit={handleUpdateInfo}>
              <fieldset>
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
        <div className={styles.settingsContent}>
          <div className={styles.profielInfo}>
            <h3>Profile Information</h3>
            <h4>
              First Name: <strong>{currentUser.firstname}</strong>
            </h4>
            <h4>
              Middlename{" "}
              <strong>
                <strike>{profileData.middlename}</strike>
              </strong>
            </h4>
            <h4>
              Last Name: <strong>{currentUser.lastname}</strong>{" "}
            </h4>
            <h4>
              Age: <strong>{currentUser.age}</strong>
            </h4>
            <h4>
              Date of Birth:{" "}
              <strong>
                {profileData.date_of_birth
                  ? formatDateofBirth(profileData.date_of_birth)
                  : "Loading"}
              </strong>
            </h4>
            <h4>
              Email or Phone: <strong>{currentUser.email}</strong>{" "}
            </h4>
          </div>

          <div className={styles.userDetails}>
            <h3>{currentUser.firstname}, Details</h3>
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
