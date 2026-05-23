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

    function addToFavorite(recipe: Recipe) {
        if (Auth?.isLoggedIn === true) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' as const,
                body: JSON.stringify({ recipe_id: recipe.id })
            }
            fetch('/addFavoriteRecipe', requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    if (result) {
                        const newFavRecipe = [...favRecipe, recipe]
                        setFavRecipe(newFavRecipe)
                        setShowAddFavPopUp(true)
                    }
                })

        }
        else {
            setShowAddFavErrPopUp(true)
        }



    }
    function removeFromFavorite(recipe: Recipe) {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' as const,
            body: JSON.stringify({ recipe_id: recipe.id })
        }
        fetch("/removeFavoriteRecipe", requestOptions)
            .then((response) => response.json())
            .then((result) => {
                if (result) {
                    const updated = favRecipe.filter(fav => fav.id !== recipe.id)
                    setFavRecipe(updated)
                }
                else {
                    setShowFailedRemovePopUp(true)
                }
            })


    }
    return <FavContext.Provider value={{ favRecipe, setFavRecipe, addToFavorite, removeFromFavorite, setShowAddFavPopUp, showAddFavPopUp, setShowAddFavErrPopUp, showAddFavErrPopUp, setShowFailedRemovePopUp, showFailedRemovePopUp }}>{children}</FavContext.Provider>
}
export { FavContext, FavContextProvider }
