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
    const [userInfo, setUserInfo] = useState<Profile | null>(null)


    useEffect(() => {
        if (Auth?.isLoading) return //wait until session is checked
        if (!Auth?.isLoggedIn) {
            navigate('/Login')
            return
        }
        fetch('/Profile', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
            },
            credentials: 'include' as const,
        })
            .then((response) => {
                if (response.status === 400 || response.status === 401) {
                    navigate('/Login')
                    return null
                }
                return response.json()
            })
            .then((data) => {
                if (!data) return
                setUserInfo(data);
            })
            .catch((err) => {
                alert("User does not exist")
                console.log(err.message);
            });
    }, [Auth?.isLoggedIn, Auth?.isLoading, navigate])
    if (Auth?.isLoading) return <div>Loading...</div>
    return (
        <>
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
                        <button className="logOutBtn" type="submit" onClick={() => {
                            Auth?.logout()
                            navigate('/Login')
                        }}>Log out</button>
                    </div>
                </div>
            </main>


        </>
    )
}
