import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "../css/login.module.css";
import Home from "./home";

import { BASE_URL } from "../apis/apis";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false)

  const ShowUserPassword = () => setShowPassword(true);
  const HideUserPassword = () => setShowPassword(false);

  // For navigating to protected page
  const navigate = useNavigate();

  //Function to validate form before submitting
  const validateForm = () => {
    if (!email || !password) {
      setError("email and password required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append("username", email.toLocaleLowerCase()),
      formDetails.append("password", password);

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
  
        //alert("LogIn Succefully");
       // console.log(data.access_token);
        navigate("/");
      } else if (response.status === 401) {
        setError("Email or password Incorrect");
      } else {
        setError("Something Went wrong, Try again")
      }

    } catch (error) {
      setLoading(false);
      setError("An error occured while authenticating, try again");
    }
  };

  return (
    <div className={styles.login_landing_page}>
      <div className={styles.content_wrapper}></div>
      <div className={styles.message}>
        <h1>Welecome to Connect</h1>
          <p>Connecting you to new online environment</p>
          <p>Log In to your account to Connect to people who matter.</p>
      </div>
      <div className={styles.login_card}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.email}>
            <label>Email</label>
            <input
              placeholder="Email or Phone or Username.."
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.password}>
            <label>Password</label>
            <input
              placeholder="Password....."
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {
              showPassword ? <img onClick={HideUserPassword} src="/hide_password.png"/> : <img onClick={ShowUserPassword} src="/show_password.png" alt="" />
            }
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Login In...." : "Login"}
          </button>
          <div className={styles.error_displayer}>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <div className={styles.links}>
            Dont have account, SignUp <Link to="/signup">here</Link>
          </div>
        </form>
      </div>
      <div />
    </div>
  );
}

export default Login;
