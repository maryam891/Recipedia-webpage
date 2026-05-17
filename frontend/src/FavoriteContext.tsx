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
    setRemoveFavPopUpShow: (value: boolean) => void,
    setShowAddFavErrPopUp: (value: boolean) => void,
    setShowFailedRemovePopUp: (value: boolean) => void,
    showAddFavPopUp: boolean,
    showAddFavErrPopUp: boolean,
    removeFavPopUpShow: boolean,
    showFailedRemovePopUp: boolean

}

const FavContext = createContext<FavContextType>({
    favRecipe: [],
    setFavRecipe: () => [],
    showAddFavErrPopUp: false,
    addToFavorite: () => { },
    removeFromFavorite: () => { },
    setShowAddFavPopUp: () => { },
    setRemoveFavPopUpShow: () => { },
    setShowAddFavErrPopUp: () => { },
    setShowFailedRemovePopUp: () => { },
    showAddFavPopUp: false,
    removeFavPopUpShow: false,
    showFailedRemovePopUp: false
})
const FavContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [favRecipe, setFavRecipe] = useState<Recipe[]>([])
    const [showAddFavPopUp, setShowAddFavPopUp] = useState(false)
    const [removeFavPopUpShow, setRemoveFavPopUpShow] = useState(false)
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
                    setRemoveFavPopUpShow(true)
                }
                else {
                    setShowFailedRemovePopUp(true)
                }
            })


    }
    return <FavContext.Provider value={{ favRecipe, setFavRecipe, addToFavorite, removeFromFavorite, setRemoveFavPopUpShow, removeFavPopUpShow, setShowAddFavPopUp, showAddFavPopUp, setShowAddFavErrPopUp, showAddFavErrPopUp, setShowFailedRemovePopUp, showFailedRemovePopUp }}>{children}</FavContext.Provider>
}
export { FavContext, FavContextProvider }
