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
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

export interface Recipe {
    name: string,
    recipe_image: string,
    rating: number,
    cuisine: string,
    id: string,
    image: string,
    cookTimeMinutes: number,
    servings: number,
    prepTimeMinutes: number,
    ingredients: string,
    instructions: string
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
    const [hoveredRecipeId, setHoveredRecipeId] = useState<string | null>(null)
    const [activeSearch, setActiveSearch] = useState("")
    const stars = [1, 2, 3, 4, 5]
    const navigate = useNavigate()
    const Auth = useContext(AuthContext)


    //Render recipes
    useEffect(() => {
        fetch('/api/recipes')
            .then((response) => response.json())
            .then((result) => {
                setRecipes(result)
                console.log(result)
            })
    }, [])



    return (
        <>
            {Fav.showFailedRemovePopUp === true &&
                <div className='overlay'>
                    <div className='addFavPopUpErr'>
                        <h2>Failed to remove recipe!</h2>
                        <button onClick={() => Fav?.setShowFailedRemovePopUp(false)} className='addFavErr-btn'>
                            Ok
                        </button>

                    </div></div>}
            {Fav?.showAddFavErrPopUp === true &&
                <div className='overlay'>
                    <div className='addFavPopUpErr'>
                        <h2>Please login!</h2>
                        <p>Please login to add to favorites!</p>
                        <button onClick={() => Fav?.setShowAddFavErrPopUp(false)} className='addFavErr-btn'>
                            Ok
                        </button>

                    </div></div>}
            <main className={modalOpen ? 'modal-open' : ''}>
                {Fav.showAddFavPopUp && (
                    <div className='addFav-popup-container'>
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
                    <IoIosSearch className='input-search-icon' onClick={() => { setActiveSearch(search) }}></IoIosSearch>
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
                                                    const updated = Fav.favRecipe.filter(fav => fav.id !== recipe.id)
                                                    Fav.setFavRecipe(updated)

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
                                                style={{ padding: "7px", cursor: "pointer" }}
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
                                    <div style={{ height: "150px", marginLeft: "32px", width: "auto" }}>
                                        <p>{recipe.name}</p>
                                        <p style={{ wordSpacing: "5px" }}>Cuisine {recipe.cuisine}</p>
                                        <p> Rating {recipe.rating} </p>
                                        {stars.map((item, index) => {

                                            if (item <= Number(recipe.rating)) {

                                                return <FaStar key={index} style={{ color: "#1C5F21", paddingLeft: "5px" }} />

                                            }
                                            else {
                                                return <CiStar key={index} />

                                            }



                                        })}

                                        {/* Show modal when clicking on a recipe */}
                                        <input type="button" value="See recipe" onClick={() => {
                                            setClickedRecipe(recipe)
                                            setModalOpen(true)
                                        }} />
                                    </div>
                                </div>
                            ))}
                    </div>

                    : <div className='Recipes'>
                        {/* Show only recipes that matches the search input */}
                        {recipes && recipes.filter((recipefilter) => {
                            if (activeSearch.includes(activeSearch)) {
                                return recipefilter.name.toLowerCase().includes(activeSearch.toLowerCase()) || recipefilter.cuisine.toLowerCase().includes(activeSearch.toLowerCase())

                            }
                            else {
                                return false
                            }
                            {/* Map through the filtered searched recipes to display on the browser */ }
                        }).map((recipefilter) => (
                            <div key={recipefilter.id} className='recipe-container'>
                                {Fav.favRecipe && Fav.favRecipe.find((fav) => fav.id === recipefilter.id) ? (
                                    <span className='iconTextContainer'>
                                        <AiFillHeart style={{ padding: "7px", cursor: "pointer", color: "Palevioletred" }} onClick={() => {
                                            const updated = Fav.favRecipe.filter(fav => fav.id !== recipefilter.id); Fav.setFavRecipe(updated); {/*Filter through favRecipe to find recipe that should be removed and save to setFavRecipe usestate */ }
                                        }} onMouseEnter={() => setHoveredRecipeId(recipefilter.id)}
                                            onMouseLeave={() => setHoveredRecipeId(null)} />
                                        {hoveredRecipeId === recipefilter.id && (
                                            <span className='addTofavHoverText'>Remove from favorites</span>
                                        )}</span>

                                ) : (
                                    <span className='iconTextContainer'>
                                        <FaRegHeart
                                            style={{ padding: "7px", cursor: "pointer" }}
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
                                <div style={{ height: "150px", marginLeft: "32px", width: "auto", position: "relative" }}>
                                    <p>{recipefilter.name}</p>
                                    <p style={{ wordSpacing: "5px" }}>Cuisine {recipefilter.cuisine}</p>
                                    <p> Rating {recipefilter.rating}</p>

                                    <input type="button" value="See recipe" onClick={() => {
                                        setClickedRecipe(recipefilter)
                                        setModalOpen(true)
                                    }}></input>
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
