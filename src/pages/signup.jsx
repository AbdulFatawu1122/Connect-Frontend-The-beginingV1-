import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import styles from "../css/signup.module.css";

import { BASE_URL } from "../apis/apis";

function SignUp() {
  const [email, setEmail] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [date_of_birth, setDateofBirth] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [schoolname, setSchoolName] = useState("");
  const [student_number, setStudentNumber] = useState("");
  const [course_name, setCourseName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (
      !email ||
      !password ||
      !firstname ||
      !lastname ||
      !date_of_birth ||
      !gender ||
      !course_name ||
      !schoolname ||
      !student_number ||
      !username
    ) {
      setError("All fields Need to fill");
      return false;
    }
    setError("");
    return true;
  };

  const LogMeIn = async () => {
    const formDetails = new URLSearchParams();
    (formDetails.append("username", email.toLocaleLowerCase()),
      formDetails.append("password", password));
    try {
      const response = await fetch(`${BASE_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDetails,
      });

      setLoading(false);
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("token", data.access_token);
        const token = sessionStorage.getItem("token");
        //console.log(token);
        //alert("LogIn Succefully");
        // console.log(data.access_token);
        navigate("/");
      } else {
        alert(
          "Failed to Log In Automatically, Please you your details to Log In. Thank You",
        );
        navigate("/login");
      }
    } catch (error) {
      setLoading(false);
      //setError("An error occured while authenticating, try again");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const formDetails = {
      email,
      firstname,
      lastname,
      password,
      date_of_birth,
      username,
      gender,
      schoolname,
      student_number,
      course_name,
    };

    try {
      const response = await fetch(`${BASE_URL}/auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDetails),
      });

      setLoading(false);
      if (response.ok) {
        alert(
          "Account Created Succefully, We will try to log you In, if faild, use you details to log In",
        );
        LogMeIn();
      } else if (response.status === 422) {
        setError("Date is Invalid");
      } else if (response.status === 409) {
        setError("Email already in used");
      }
    } catch (error) {
      setLoading(false);
      setError("And Error Occured while trying to Sign Up, Try Again");
    }
  };
  return (
    <div className={styles.sign_up_landing_page}>
      <div className={styles.content_wrapper}>
        <div className={styles.message}>
          <h1>Welecome to Connect</h1>
          <p>Connecting you to the world of AI</p>
          <p>Open New account to Connect to people who matter.</p>
        </div>

        <div className={styles.sign_up_card}>
          <form onSubmit={handleSubmit}>
            <div className={styles.username}>
              <label>UserName</label>
              <input
                type="text"
                placeholder="User Name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className={email}>
              <label>Email</label>
              <input
                placeholder="Email or Phone..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div className={styles.firstname}>
              <label>First Name</label>
              <input
                type="text"
                placeholder="First Name..."
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className={styles.lastname}>
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Last Name..."
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className={styles.date_of_bith}>
              <label>Date of Birth</label>
              <input
                type="date"
                value={date_of_birth}
                onChange={(e) => setDateofBirth(e.target.value)}
              />
            </div>

            <div className={styles.student_number}>
              <label>Student ID</label>
              <input
                type="text"
                placeholder="Student ID"
                value={student_number}
                onChange={(e) => setStudentNumber(e.target.value)}
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
              <input
              value={course_name}
              onChange={(e) => setCourseName(e.target.value)}
               type="text" placeholder="Type in your course name" />
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

            <div className={styles.password}>
              <label>Password</label>
              <input
                type="password"
                placeholder="Password.."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button disabled={loading} type="submit">
              {loading ? "Creating Account....." : "Create Account"}
            </button>
          </form>
          <div className={styles.error_displayer}>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
          <div className={styles.links}>
            Have an account, LogIn <Link to="/login">here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
