import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { useContext } from 'react'
import { AiFillHeart } from "react-icons/ai";
import type { Recipe } from "../pages/Recipes"
import { FavContext } from '../FavoriteContext'
import { useState } from 'react';
import "../css/Favorites.css"
import RecipeModal from '../components/RecipeModal';
import RecipeRating from '../components/RecipeRating';
import api from "../api"
export interface FavoriteRecipesProps {
    favRecipe: Recipe[]
    setFavRecipe: React.Dispatch<React.SetStateAction<Recipe[]>>
}

export default function FavoriteRecipes() {
    const [clickedRecipe, setClickedRecipe] = useState<Recipe | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [hoveredRecipeId, setHoveredRecipeId] = useState<number | null>(null)
    const [confirmRemoveFaveRecipe, setConfirmRemoFavRecipe] = useState(false)
    const [selectedRecipeToRemove, setSelectedRecipeToRemove] = useState<Recipe | null>(null)
    const [removeFavPopUpShow, setRemoveFavPopUpShow] = useState(false)
    const navigate = useNavigate()
    const addFav = useContext(FavContext)


    useEffect(() => {
        const getFav = async () => {
            try {
                const response = await api.get("/api/getFavoriteRecipes")
                const result = response.data

                addFav.setFavRecipe(result);

            }
            catch (error) {
                console.log(error, "Could not get favorite recipes")
            }
        }

        getFav()
    }, [addFav])


    return (
        <main>
            {confirmRemoveFaveRecipe === true &&
                <div className='overlay'>
                    <div className='removeFavPopUp'>
                        <h2>Recipe has been removed!</h2>
                        <button onClick={() => {
                            setConfirmRemoFavRecipe(false)
                        }
                        } className='ok-btn'>Ok</button>
                    </div>
                </div>
            }
            {removeFavPopUpShow === true &&
                <div className='overlay'>
                    <div className='removeFavPopUp'>
                        <h2>Remove recipe?</h2>
                        <p>Are you sure you wan't to remove recipe from favorites?</p>
                        <div className='popup-btn-container'>
                            <button onClick={() => { setConfirmRemoFavRecipe(true); setRemoveFavPopUpShow(false); if (selectedRecipeToRemove) addFav.removeFromFavorite(selectedRecipeToRemove) }} className='yes-btn'>Yes</button>
                            <button className='no-btn' onClick={() => setRemoveFavPopUpShow(false)
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
                                                setRemoveFavPopUpShow(true)
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
                                    <div className='recipes-textboxContainer'>
                                        <p>{recipe.name}</p>
                                        <p>Cuisine {recipe.cuisine}</p>
                                        <p> Rating {recipe.rating}</p>
                                        <div className='ratingBtnContainer'>
                                            <RecipeRating rating={recipe.rating}></RecipeRating>
                                            <button className='seeRecipe-btn' onClick={() => {
                                                setClickedRecipe(recipe)
                                                setModalOpen(true)
                                            }}>See recipe</button></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='noFavorite-recipesContainer'>
                                <p>No favorite recipes yet!</p>
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
