import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";
import { useParams } from "react-router-dom";
import "../css/settings.css";

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
            setformerror("Failed to Update your Info, Try Again")
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
                <div className="modal-overlay">
                    <div className="update-info">
                        {submitingForm &&
                            <div className="loading-overlay">
                                <div className="spinner"></div>
                                <p>Updating Profile...</p>
                            </div>}
                        <div className="close-button">
                            <button onClick={HideUpdateYserInfoPopup}>
                                ❌
                            </button>
                        </div>
                        <form onSubmit={handleUpdateInfo}>
                            <fieldset>
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
                        {foremerror && <p style={{ color: "red" }}>{foremerror}</p>}
                    </div>
                </div>
            );
    };

    return (
        <>
            <NavBar />
            <div className="main-body">
                <div className="setting-text">
                    <h1>Settings.</h1>
                </div>
                <div className="line-above-settings-text"></div>
                <div className="update-user-info">
                    <div className="update-user-info">
                        <button onClick={ShowUpdateUserInfoPopup}>Update User Info</button>
                        {updatindUserInfo()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Settings;
