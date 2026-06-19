import { CiUser } from "react-icons/ci"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../AuthContext";
import { useContext } from "react";
import "../css/Profile.css"
import { useEffect } from "react";
import { useState } from "react";

interface Profile {
    name: string,
    email: string
}
export default function Profile() {
    const Auth = useContext(AuthContext)
    const navigate = useNavigate()
    const [showProfileErrPopUp, setShowProfileErrPopUp] = useState(false)
    const [userInfo, setUserInfo] = useState<Profile | null>(null)


    useEffect(() => {
        if (Auth?.isLoading) return //wait until session is checked
        if (!Auth?.isLoggedIn) {
            navigate("/Login")
            return
        }

        const getProfile = async () => {
            try {
                const response = await fetch("/api/user", {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    credentials: 'include' as const,
                })

                const result = await response.json()
                if (result) {

                    setUserInfo(result);

                }
            }


            catch (error) {
                setShowProfileErrPopUp(true)
                console.log(error, "User does not exist");
            }
        }
        getProfile()
    }, [Auth?.isLoggedIn, Auth?.isLoading, navigate])
    if (Auth?.isLoading) return <div>Loading...</div>


    return (
        <>
            {showProfileErrPopUp === true &&
                <div className="overlay">
                    <div className="profilePopUpErr">
                        <h2>User does not exist!</h2>
                        <button onClick={() => setShowProfileErrPopUp(false)} className="profileErrBtn">Ok</button>

                    </div>
                </div>
            }
            <main className="Profile">
                <h1>Profile</h1>
                <div className="profileContainer">
                    <div className="profileHeader">
                        <CiUser className="profileIconImage" />
                        <h2>{userInfo?.name}</h2>
                    </div>

                    <form>
                        <label>Email</label>
                        <input type="text" name="email" defaultValue={userInfo?.email} readOnly ></input>
                    </form>
                    <div className="btnContainer">
                        <button className="logOutBtn" type="submit" onClick={async () => {
                            await Auth?.logout()
                            navigate('/Login')
                        }}>Log out</button>
                    </div>
                </div>
            </main>


        </>
    )
}
