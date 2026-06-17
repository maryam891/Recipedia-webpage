
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import { createHashRouter, Outlet, RouterProvider } from "react-router-dom"
import Recipes from "./pages/Recipes"
import Home from "./pages/Home"
import Login from "./pages/Login"
import { FavContextProvider } from "./FavoriteContext"
import Profile from "./pages/Profile"
import FavoriteRecipes from "../src/pages/FavoriteRecipes"
import SignUp from "./pages/SignUp"
import { useState } from "react"
import { useEffect } from "react"
import { AuthContext } from "./AuthContext"

export interface User {
  email: string;
  name?: string; //make name optional
  userId: number;

}

const router = createHashRouter([
  {
    element: (
      <FavContextProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          <div style={{ flex: 1 }}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </FavContextProvider>
    ),
    children: [
      { element: <Home />, index: true },
      { element: <Recipes />, path: "Recipes" },
      { element: <Profile />, path: "Profile" },
      { element: <SignUp />, path: "SignUp" },
      { element: <FavoriteRecipes />, path: "FavoriteRecipes" },
      { element: <Login />, path: "Login" },
      { element: <Home />, path: "Home" },
    ]
  }
])

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true)


  const login = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  }

  const signup = (user: User) => {
    setCurrentUser(user)
    setIsLoggedIn(true)

  };

  const logout = async () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' as const,
    }
    try {
      const response = await fetch("/logout", requestOptions)
      if (!response.ok) {
        return
      }
      await response.json()

      setCurrentUser(null);
      setIsLoggedIn(false);

    }
    catch (error) {
      console.log(error, "failed to log out")
    }


  };

  useEffect(() => {
    const getUser = async () => {
      try {

        const response = await fetch("/user", {
          credentials: 'include' as const
        }

        )
        if (!response.ok) {
          setIsLoggedIn(false)
          setIsLoading(false)
          return
        }
        const result = await response.json()
        setIsLoggedIn(true);
        setCurrentUser({
          email: result.email,
          name: result.name,
          userId: result.id
        })
        setIsLoading(false)

      }

      catch (error) {
        console.log(error, "could not get user")
      }
    }
    getUser()

  }, []);



  return <AuthContext.Provider value={{ currentUser, logout, login, signup, isLoggedIn, isLoading }}><RouterProvider router={router} />
  </AuthContext.Provider>
}
export default App
