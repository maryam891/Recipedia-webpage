import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { useContext } from 'react'
import { AiFillHeart } from "react-icons/ai";
import type { Recipe } from "../pages/Recipes"
import { FavContext } from '../FavoriteContext'
import { useState } from 'react';
import "../css/Favorites.css"
import RecipeModal from '../components/RecipeModal';
export interface FavoriteRecipesProps {
    favRecipe: Recipe[]
    setFavRecipe: React.Dispatch<React.SetStateAction<Recipe[]>>
}

export default function FavoriteRecipes() {
    const [clickedRecipe, setClickedRecipe] = useState<Recipe | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [hoveredRecipeId, setHoveredRecipeId] = useState<null | string>(null)
    const [confirmRemoveFaveRecipe, setConfirmRemoFavRecipe] = useState(false)
    const [selectedRecipeToRemove, setSelectedRecipeToRemove] = useState<Recipe | null>(null)
    const navigate = useNavigate()
    const addFav = useContext(FavContext)

    function getFav() {
        fetch("/getFavoriteRecipes", {
            headers: {
                'Content-type': 'application/json',
            },
            credentials: 'include' as const,
        })
            .then((response) => response.json())
            .then((result) => {
                if (result) {
                    addFav.setFavRecipe(result)
                }

            })
    }

    useEffect(() => {
        getFav()
    }, [])


    return (
        <main>
            {confirmRemoveFaveRecipe === true &&
                <div className='removeFav-popup-container'>
                    <div className='removeFav-popup'>
                        <h2>Recipe has been removed!</h2>
                        <button onClick={() => {
                            if (selectedRecipeToRemove) {
                                setConfirmRemoFavRecipe(false); const updated = addFav.favRecipe.filter(fav => fav.id !== selectedRecipeToRemove.id)
                                addFav.setFavRecipe(updated)

                            }
                        }
                        } className='ok-btn'>Ok</button>
                    </div>
                </div>
            }
            {addFav.removeFavPopUpShow === true &&
                <div className='removeFav-popup-container'>
                    <div className='removeFav-popup'>
                        <h2>Are you sure you want to remove recipe?</h2>
                        <div className='popup-btn-container'>
                            <button onClick={() => { setConfirmRemoFavRecipe(true); addFav.setRemoveFavPopUpShow(false) }} className='yes-btn'>Yes</button>
                            <button className='no-btn' onClick={() => addFav.setRemoveFavPopUpShow(false)
                            }>No</button></div>
                    </div>
                </div>
            }

            {modalOpen && clickedRecipe ? (
                <RecipeModal recipe={clickedRecipe} setClickedRecipe={setClickedRecipe} setModalOpen={setModalOpen} modalOpen={modalOpen} />
            ) : (
                <>
                    <h1 style={{ textAlign: "center", marginTop: "20px", color: "green" }}>Favorite Recipes</h1>
                    <div className='Recipes'>
                        {addFav.favRecipe && addFav.favRecipe.length > 0 ? (
                            addFav.favRecipe.map((recipe: Recipe) => (
                                <div key={recipe.id} className='fav-recipe-container recipe-container'>
                                    <span className='iconTextContainer'>
                                        <AiFillHeart
                                            onClick={() => {
                                                addFav.setRemoveFavPopUpShow(true)
                                                setSelectedRecipeToRemove(recipe)
                                            }}
                                            style={{ padding: "7px", cursor: "pointer", color: "Palevioletred" }}
                                            onMouseEnter={() => setHoveredRecipeId(recipe.id)}
                                            onMouseLeave={() => setHoveredRecipeId(null)}
                                        />
                                        {hoveredRecipeId === recipe.id && (
                                            <span className='addTofavHoverText'>Remove from favorites</span>
                                        )}
                                    </span>
                                    <img src={recipe.recipe_image} />
                                    <div style={{ height: "150px", marginLeft: "32px", width: "auto" }}>
                                        <p>{recipe.name}</p>
                                        <p style={{ wordSpacing: "5px" }}>Cuisine {recipe.cuisine}</p>
                                        <p> Rating {recipe.rating}</p>
                                        <input type="button" value="See recipe" onClick={() => {
                                            setClickedRecipe(recipe)
                                            setModalOpen(true)
                                        }} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: "center", marginTop: "20px", height: "100vh" }}>
                                <p style={{ textAlign: "center", marginTop: "50px" }}>No favorite recipes yet!</p>
                                <button onClick={() => navigate("/Recipes")} className='backTo-recipes-btn'>
                                    Back to Recipes
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </main>
    )
}
