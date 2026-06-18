import React, { useContext } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import "../css/Recipes.css"
import RecipeModal from "../components/RecipeModal"
import { IoIosSearch } from "react-icons/io";
import { AiFillHeart } from "react-icons/ai";
import { FaRegHeart } from "react-icons/fa6";
import { FavContext } from '../FavoriteContext'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import RecipeRating from '../components/RecipeRating'


export interface Recipe {
    name: string,
    recipe_image: string,
    rating: number,
    cuisine: string,
    id: number,
    cookTimeMinutes: number,
    servings: number,
    prepTimeMinutes: number,

}
export interface RecipesProps {
    favRecipe: Recipe[]
    setFavRecipe: React.Dispatch<React.SetStateAction<Recipe[]>>
}

export default function Recipes() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [clickedRecipe, setClickedRecipe] = useState<Recipe | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [search, setSearch] = useState("")
    const Fav = useContext(FavContext)
    const [hoveredRecipeId, setHoveredRecipeId] = useState<number | null>(null)
    const [activeSearch, setActiveSearch] = useState("")
    const [recipeToRemove, setRecipeToRemove] = useState<Recipe | null>(null)
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
    const [confirmRemoveFaveRecipe, setConfirmRemoFavRecipe] = useState(false)
    const navigate = useNavigate()
    const Auth = useContext(AuthContext)


    //Render recipes
    useEffect(() => {
        const getRecipes = async () => {
            try {
                const response = await fetch("/recipes");
                const result = await response.json();

                setRecipes(result);
            } catch (error) {
                console.error(error);
            }
        };

        getRecipes();
    }, []);


    return (
        <>
            {Fav.showFailedRemovePopUp === true &&
                <div className='overlay'>
                    <div className='addFavPopUpErr'>
                        <h2>Failed to remove recipe!</h2>
                        <button onClick={() => Fav?.setShowFailedRemovePopUp(false)} className='addFavErr-btn'>
                            Ok
                        </button>
                    </div>
                </div>}
            {Fav?.showAddFavErrPopUp === true &&
                <div className='overlay'>
                    <div className='addFavPopUpErr'>
                        <h2>Please login!</h2>
                        <p>Please login to add to favorites!</p>
                        <button onClick={() => Fav?.setShowAddFavErrPopUp(false)} className='addFavErr-btn'>
                            Ok
                        </button>
                    </div>
                </div>}
            {showRemoveConfirm && recipeToRemove && (
                <div className='overlay'>
                    <div className='removeFavPopUp'>
                        <h2>Remove recipe?</h2>
                        <p>Are you sure you wan't to remove recipe from favorites?</p>
                        <div className='popup-btn-container'>
                            <button
                                onClick={() => {
                                    Fav.removeFromFavorite(recipeToRemove)
                                    setShowRemoveConfirm(false)
                                    setConfirmRemoFavRecipe(true);
                                    setRecipeToRemove(null)
                                }}
                                className='yes-btn'
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => {
                                    setShowRemoveConfirm(false)
                                    setRecipeToRemove(null)
                                }}
                                className='no-btn'
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
            <main className={modalOpen ? 'modal-open' : ''}>
                {Fav.showAddFavPopUp && (
                    <div className='overlay'>
                        <div className='addFav-popup-btntext-container'>
                            <h2>Recipe added!</h2>
                            <p>Recipe has been added to favorites!</p>
                            <button onClick={() => {
                                Fav.setShowAddFavPopUp(false)
                                navigate("/FavoriteRecipes")
                            }}>Ok</button>
                        </div>
                    </div>
                )}
                {/* search input field */}
                <div className='search-field-container'>
                    <input type="text" placeholder='search...' value={search} onChange={(event) => {
                        setSearch(event.target.value);
                        //clear input when search filed is empty

                        if (event.target.value === "") {
                            setActiveSearch("")
                        }
                    }}>

                    </input>
                    <div className='search-iconContainer'>
                        <IoIosSearch className='input-search-icon' onClick={() => { setActiveSearch(search) }}></IoIosSearch></div>
                </div>
                {/* Show h1 based on if one recipe is clicked */}
                {!clickedRecipe ? <h1 style={{ textAlign: "center", marginTop: "10px", color: "#1C5F21" }}>Recipes</h1> : ""}
                {/* check if search input field is empty and show all recipes */}
                {activeSearch === "" ?
                    <div className='Recipes'>
                        {/* check if recipes exists and if the recipe isn't clicked and modal isn't true to show all recipes */}
                        {recipes && !clickedRecipe && !modalOpen &&
                            recipes.map((recipe) => (

                                <div key={recipe.id} className='recipe-container'>

                                    {/* Find recipe id that matches on click to add recipe to favorites and show the heart icon, confirm popup when recipe is added to favorites */}

                                    {Fav.favRecipe && Auth?.isLoggedIn && Auth?.currentUser && Fav.favRecipe.find((fav) => fav.id === recipe.id) ? (
                                        <span className='iconTextContainer'>
                                            {/*Filter through favRecipe to find recipe that should be removed and save to setFavRecipe usestate */}
                                            <AiFillHeart
                                                onClick={() => {
                                                    setRecipeToRemove(recipe)
                                                    setShowRemoveConfirm(true)
                                                }}
                                                onMouseEnter={() => setHoveredRecipeId(recipe.id)}
                                                onMouseLeave={() => setHoveredRecipeId(null)}
                                                style={{ padding: "7px", cursor: "pointer", color: "Palevioletred" }}
                                            />
                                            {/*See if heart icon is hovered to show text*/}
                                            {hoveredRecipeId === recipe.id && (
                                                <span className='addTofavHoverText'>Remove from favorites</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className='iconTextContainer'>
                                            <FaRegHeart
                                                className='outlineHeart-icon'
                                                onClick={() => {
                                                    Fav.addToFavorite(recipe)


                                                }}
                                                onMouseEnter={() => setHoveredRecipeId(recipe.id)}
                                                onMouseLeave={() => setHoveredRecipeId(null)}

                                            />  {hoveredRecipeId === recipe.id && (
                                                <span className='addTofavHoverText'>Add to favorites</span>
                                            )}</span>
                                    )}

                                    {/* Remove from favorites and show other heart icon */}
                                    <img src={recipe.recipe_image} />
                                    <div className='recipes-textboxContainer'>
                                        <p>{recipe.name}</p>
                                        <p>Cuisine {recipe.cuisine}</p>
                                        <p> Rating {recipe.rating} </p>
                                        <div className='ratingBtn-Container'>
                                            <RecipeRating rating={recipe.rating}></RecipeRating>

                                            {/* Show modal when clicking on a recipe */}
                                            <button className='seeRecipe-btn' onClick={() => {
                                                setClickedRecipe(recipe)
                                                setModalOpen(true)
                                            }}>See recipe</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    : <div className='Recipes'>
                        {/* Show only recipes that matches the search input */}
                        {recipes && recipes.filter((recipefilter) => {
                            return recipefilter.name.toLowerCase().includes(activeSearch.toLowerCase()) || recipefilter.cuisine.toLowerCase().includes(activeSearch.toLowerCase())
                            {/* Map through the filtered searched recipes to display on the browser */ }
                        }).map((recipefilter) => (
                            <div key={recipefilter.id} className='recipe-container'>
                                {Fav.favRecipe && Fav.favRecipe.find((fav) => fav.id === recipefilter.id) ? (
                                    <span className='iconTextContainer'>
                                        <AiFillHeart
                                            style={{ padding: "7px", cursor: "pointer", color: "Palevioletred" }}
                                            onClick={() => {
                                                setRecipeToRemove(recipefilter)
                                                setShowRemoveConfirm(true)
                                            }}
                                            onMouseEnter={() => setHoveredRecipeId(recipefilter.id)}
                                            onMouseLeave={() => setHoveredRecipeId(null)}
                                        />
                                        {hoveredRecipeId === recipefilter.id && (
                                            <span className='addTofavHoverText'>Remove from favorites</span>
                                        )}</span>

                                ) : (

                                    <span className='iconTextContainer'>
                                        <FaRegHeart
                                            className='outlineHeart-icon'
                                            onClick={() => {
                                                Fav.addToFavorite(recipefilter)


                                            }}
                                            onMouseEnter={() => setHoveredRecipeId(recipefilter.id)}
                                            onMouseLeave={() => setHoveredRecipeId(null)}

                                        />  {hoveredRecipeId === recipefilter.id && (
                                            <span className='addTofavHoverText'>Add to favorites</span>
                                        )}</span>
                                )}

                                <img src={recipefilter.recipe_image} />
                                <div className='recipes-textboxContainer'>
                                    <p>{recipefilter.name}</p>
                                    <p>Cuisine {recipefilter.cuisine}</p>
                                    <p> Rating {recipefilter.rating}</p>
                                    <RecipeRating rating={recipefilter.rating}></RecipeRating>


                                    <button className='seeRecipe-btn' onClick={() => {
                                        setClickedRecipe(recipefilter)
                                        setModalOpen(true)
                                    }}>See recipe</button>
                                </div>
                            </div>

                        ))}

                    </div >

                }
                {/* Send prop values to Modal.tsx to handle modal functionality */}
                {clickedRecipe && <RecipeModal recipe={clickedRecipe} setClickedRecipe={setClickedRecipe} setModalOpen={setModalOpen} modalOpen={modalOpen} />}
            </main >
        </>
    )
}
