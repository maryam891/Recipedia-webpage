import { useState, createContext } from "react"
import type { Recipe } from "./pages/Recipes"
import React from "react"
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import api from "./api";


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

            const alreadyExist = favRecipe.find((fav) => fav.id === recipe.id)
            if (alreadyExist) {
                return
            }
            try {
                await api.post('/api/addFavoriteRecipe', { recipe_id: recipe.id })
                const newFavRecipe = [...favRecipe, recipe]
                setFavRecipe(newFavRecipe)
                setShowAddFavPopUp(true)
            }
            catch (error) {
                setShowAddFavErrPopUp(true)
                console.log(error, "Could not add favorite recipe")
            }

        }

    }
    async function removeFromFavorite(recipe: Recipe) {

        try {

            await api.delete("/api/removeFavoriteRecipe", { data: { recipe_id: recipe.id } })
            const updated = favRecipe.filter(fav => fav.id !== recipe.id)
            setFavRecipe(updated)

        }
        catch (error) {
            setShowFailedRemovePopUp(true)
            console.log(error, "Could not remove favorite recipe")
        }


    }
    return <FavContext.Provider value={{ favRecipe, setFavRecipe, addToFavorite, removeFromFavorite, setShowAddFavPopUp, showAddFavPopUp, setShowAddFavErrPopUp, showAddFavErrPopUp, setShowFailedRemovePopUp, showFailedRemovePopUp }}>{children}</FavContext.Provider>
}
export { FavContext, FavContextProvider }
