import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../css/Login.css"
import { useContext } from "react"
import { AuthContext } from "../AuthContext"

export default function Login() {
    const Auth = useContext(AuthContext)
    const navigate = useNavigate()
    const [showWelcomePopUp, setShowWelcomePopUp] = useState(false);
    const [showLoginErrPopUp, setShowLoginErrPopUp] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [fieldErrors, setFieldErrors] = useState({
        emailField: false,
        passwordField: false
    });
    const [showProfileErrPopUp2, setShowProfileErrPopUp2] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loginForm, setLoginForm] = useState({ email: "", password: "" })
    {/*Change border color of input based on empty and non empty field*/ }
    const styles = {
        emailInput: {
            border: (!submitted || fieldErrors.emailField) ? "2px solid #1C5F21" : "2px solid rgb(134, 19, 19)"
        },
        passwordInput: {
            border: (!submitted || fieldErrors.passwordField) ? "2px solid #1C5F21" : "2px solid rgb(134, 19, 19)"
        }
    };

    {/*Login function for login button*/ }
    async function Login(event: React.MouseEvent) {
        event.preventDefault()
        setSubmitted(true)

        //Check if either of the input fileds are empty to stop sending fetch
        if (loginForm.email.trim().length === 0 || loginForm.password.trim().length === 0) {
            setFieldErrors({
                emailField: true, passwordField: true
            })
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' as const,
            body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
        }
        try {
            const response = await fetch("/api/Login",
                requestOptions)
            const result = await response.json()
            if (!response.ok || !result.email) {
                setShowLoginErrPopUp(true)
                return
            }
            Auth?.login({
                email: loginForm.email,
                userId: result.id || 0,
                name: result.name
            })
            setShowWelcomePopUp(true)
            setIsLoggedIn(true)

        }


        catch (err) {
            setShowLoginErrPopUp(true)
            console.log(err, "Could not login, email or password is wrong")

        }


        if (loginForm.email.trim().length !== 0 && loginForm.password.trim().length === 0) {
            setShowLoginErrPopUp(true)
            setFieldErrors({ emailField: true, passwordField: false })
        }
        else if (loginForm.password.trim().length !== 0 && loginForm.email.trim().length === 0) {
            setShowLoginErrPopUp(true)
            setFieldErrors({ emailField: false, passwordField: true })
        }

        else {
            setFieldErrors({ emailField: false, passwordField: false })
        }

    }
    //SetTimeout to wait to navigate to Login page when session is expired
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("sessionExpired") === "1") {
            setShowProfileErrPopUp2(true)
        }
    }, [])
    //SetTimeout to wait to navigate to profile page when user is logged in to be able to show popup first
    useEffect(() => {
        if (isLoggedIn === true) {
            setTimeout(() => navigate("/Profile"), 1500);
        }
    }, [navigate, isLoggedIn]);


    return (
        <>
            {showLoginErrPopUp === true &&
                <div className="overlay">
                    <div className="loginPopUpErr">
                        <h2>Could not login!</h2>
                        <p>Password or email is wrong, please try again!</p>
                        <button onClick={() => setShowLoginErrPopUp(false)} className="loginErrBtn">Ok</button>

                    </div>
                </div>
            }

            {showWelcomePopUp === true && (
                <div className="overlay">
                    <div className="welcomePopUp">
                        <h2>Welcome back!</h2>
                        <p>Glad to see you again!</p>
                    </div>
                </div>
            )}
            {showProfileErrPopUp2 === true &&
                <div className="overlay">
                    <div className="profilePopUpErr">
                        <h2>You are logged out!</h2>
                        <p>You have been logged out, login again!</p>
                        <button onClick={() => setShowProfileErrPopUp2(false)} className="profileErrBtn">Ok</button>

                    </div>
                </div>
            }
            <section>

                <div className="loginForm">
                    <h1>Login</h1>
                    <form>
                        <div className="labelInput-container">
                            <label>Email</label>
                            {/*Show error message if filed is empty when signing up*/}
                            {submitted && loginForm?.email.trim().length === 0 && <p style={{ color: "rgb(134, 19, 19)", fontSize: "13px", margin: 0 }}>Please fill in email</p>}
                            <input type="text" name="email" value={loginForm.email} style={styles.emailInput} onChange={(event) => {

                                setLoginForm({
                                    ...loginForm,
                                    email: event.target.value
                                })

                                setFieldErrors({
                                    ...fieldErrors, emailField: event.target.value.trim().length !== 0
                                })



                            }}></input></div>
                        <div className="labelInput-container">
                            <label>Password</label>
                            {/*Show error message if filed is empty when signing up*/}
                            {submitted && loginForm?.password.trim().length === 0 && <p style={{ color: "rgb(134, 19, 19)", fontSize: "13px", margin: 0 }}>Please fill in password</p>}
                            <input type="password" name="password" style={styles.passwordInput} value={loginForm.password} onChange={(event) => {

                                setLoginForm({
                                    ...loginForm,
                                    password: event.target.value
                                })
                                setFieldErrors({
                                    ...fieldErrors, passwordField: event.target.value.trim().length !== 0
                                })


                            }}></input></div>
                        <button type="submit" onClick={Login}>Login</button>
                        <div className="loginTextContainer" onClick={() => {
                            navigate("/SignUp")
                        }}>
                            <p>Don't have an account?</p>
                            <p className="signUpText" >Sign up</p>
                        </div>
                    </form>

                </div>
            </section>
        </>
    )
}
