import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import "../css/signup.css"

const BASE_URL = "http://192.168.8.114:8000";



function SignUp() {

    const [email, setEmail] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [password, setPassword] = useState("");
    const [date_of_birth, setDateofBirth] = useState(null)


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();

    const validateForm = () => {
        if (!email || !password || !firstname || !age || !lastname || !date_of_birth)  {
            setError("All fields Need to fill")
            return false;
        }
        setError("");
        return true;
    };

    const ValidateAge = () => {
        if (age <= 1) {
            setError("Age can not be less than 2!!");
            return false
        }
        setError("");
        return true;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm() || !ValidateAge()) return;


        setLoading(true);

        const formDetails = {
            email,
            firstname,
            lastname,
            age,
            password,
            date_of_birth,
        }

        try {
            const response = await fetch(
                `${BASE_URL}/auth/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formDetails),

                }
            );

            setLoading(false);
            if (response.ok) {
                alert("Account Created Succefully Use Email and password to log In");
                navigate("/login");
                
            } else {
                setError("Email already in Used, Use the details to logIn")
            }
        } catch (error) {
            setLoading(false);
            setError("And Error Occured while trying to Sign Up, Try Again")

        }
    };



    return (
        <div className="sign-up-landing-page">
            <div className="content-wrapper">

                <div className="message">
                    <h1>Welecome  to Connect 2.0</h1>
                    <p>Connecting  you to the world of AI</p>
                    <p>Open New account to Connect</p>
                </div>

                <div className="sign-up-card">
                    <form onSubmit={handleSubmit}>
                            
                        <div className="email">
                            <label>Email</label>
                            <input
                                placeholder="Email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                            />
                        </div>

                        <div className="firstname">
                            <label>First Name</label>
                            <input
                                type="text"
                                placeholder="First Name..."
                                value={firstname}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        <div className="lastname">
                            <label>Last Name</label>
                            <input
                                type="text"
                                placeholder="Last Name..."
                                value={lastname}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        <div className="date-of-bith">
                            <label>Date of Birth</label>
                            <input 
                            type="date" 
                            value={date_of_birth}
                            onChange={(e) => setDateofBirth(e.target.value)}
                            />
                        </div>

                        <div className="age">
                            <label>Age</label>
                            <input
                                type="number"
                                placeholder="Age..."
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>

                        <div className="password">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Password.."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>



                        <button disabled={loading}  type="submit">
                            {loading ? "Creating Account....." : "Create Account"}
                        </button>
                    </form>
                     <div className="error-displayer">
                            {error && <p style={{color:"red"}}>{error}</p>}
                    </div>
                    <div className="links">
                        Have an account, LogIn <Link to='/login'>here</Link>
                    </div>
                </div>
            </div>
        </div>
    )


}


export default SignUp