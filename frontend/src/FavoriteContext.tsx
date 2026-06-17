import { useState, createContext } from "react"
import type { Recipe } from "./pages/Recipes"
import React from "react"
import { useContext } from "react";
import { AuthContext } from "./AuthContext";


interface FavContextType {
    favRecipe: Recipe[]
    setFavRecipe: React.Dispatch<React.SetStateAction<Recipe[]>>
    addToFavorite: (recipe: Recipe) => void,
    removeFromFavorite: (recipe: Recipe) => void,
    setShowAddFavPopUp: (value: boolean) => void,
    setShowAddFavErrPopUp: (value: boolean) => void,
    setShowFailedRemovePopUp: (value: boolean) => void,
    showAddFavPopUp: boolean,
    showAddFavErrPopUp: boolean,
    showFailedRemovePopUp: boolean

}

const FavContext = createContext<FavContextType>({
    favRecipe: [],
    setFavRecipe: () => [],
    showAddFavErrPopUp: false,
    addToFavorite: () => { },
    removeFromFavorite: () => { },
    setShowAddFavPopUp: () => { },
    setShowAddFavErrPopUp: () => { },
    setShowFailedRemovePopUp: () => { },
    showAddFavPopUp: false,
    showFailedRemovePopUp: false
})
const FavContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [favRecipe, setFavRecipe] = useState<Recipe[]>([])
    const [showAddFavPopUp, setShowAddFavPopUp] = useState(false)
    const [showAddFavErrPopUp, setShowAddFavErrPopUp] = useState(false)
    const [showFailedRemovePopUp, setShowFailedRemovePopUp] = useState(false)

    const Auth = useContext(AuthContext)

    async function addToFavorite(recipe: Recipe) {
        if (Auth?.isLoggedIn === true) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' as const,
                body: JSON.stringify({ recipe_id: recipe.id })
            }
            const alreadyExist = favRecipe.find((fav) => fav.id === recipe.id)
            if (alreadyExist) {
                return
            }
            try {
                const response = await fetch('/addFavoriteRecipe', requestOptions)
                if (!response.ok) {
                    setShowAddFavErrPopUp(true)
                    return
                }
                await response.json()
                const newFavRecipe = [...favRecipe, recipe]
                setFavRecipe(newFavRecipe)
                setShowAddFavPopUp(true)
            }
            catch (error) {
                console.log(error, "Could not add favorite recipe")
            }

        }
        else {
            setShowAddFavErrPopUp(true)
        }



    }
    async function removeFromFavorite(recipe: Recipe) {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' as const,
            body: JSON.stringify({ recipe_id: recipe.id })
        }
        try {

            const response = await fetch("/removeFavoriteRecipe", requestOptions)

            if (!response.ok) {
                setShowFailedRemovePopUp(true)
                return
            }

            await response.json()
            const updated = favRecipe.filter(fav => fav.id !== recipe.id)
            setFavRecipe(updated)

        }
        catch (error) {
            console.log(error, "Could not remove favorite recipe")
        }


    }
    return <FavContext.Provider value={{ favRecipe, setFavRecipe, addToFavorite, removeFromFavorite, setShowAddFavPopUp, showAddFavPopUp, setShowAddFavErrPopUp, showAddFavErrPopUp, setShowFailedRemovePopUp, showFailedRemovePopUp }}>{children}</FavContext.Provider>
}
export { FavContext, FavContextProvider }
