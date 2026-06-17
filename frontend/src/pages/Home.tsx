import backgroundImg from "../assets/images/backgroundImg.jpg"
import "../css/Home.css"
import { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import RecipeRating from "../components/RecipeRating";



interface Recipes {
    name: string,
    rating: number,
    cuisine: string,
    id: number,
    recipe_image: string

}

export default function Home() {
    const navigate = useNavigate();
    const recipeNavigation = () => {

        navigate("/Recipes");
    }
    const [popularRecipes, setPopularRecipes] = useState<Recipes[]>([])

    useEffect(() => {
        const getPopularRecipes = async () => {
            try {
                const response = await fetch('/api/popular')
                const result = await response.json()
                setPopularRecipes(result)
            } catch (error) {
                console.log(error, "Could not get popular recipes")
            }
        }

        getPopularRecipes()
    }, [])

    const image = backgroundImg
    return (
        <>
            <div className="Home-container">
                <div className="home-text-btn-container">
                    <h2>We have different cuisines and variations</h2>
                    <h3>Explore our recipes and save your favorite recipes</h3>
                    <button onClick={recipeNavigation}>Recipes</button>
                </div>
                <img src={image}></img>
            </div>
            <div className="popular-Recipes-Container">
                <h2>Popular recipes this week</h2>
                <div className="popular-recipes">
                    {/* Shows popular recipes*/}
                    {popularRecipes &&
                        popularRecipes.map((popularRecipe) => (
                            <div key={popularRecipe.id}>
                                <img src={popularRecipe.recipe_image} className="popularRecipes-img"></img>
                                <div className="popularRecipes-innerContainer">
                                    <p>{popularRecipe.name}</p>
                                    <p>Cuisine {popularRecipe.cuisine}</p>
                                    <p>Rating {popularRecipe.rating}</p>
                                    <RecipeRating rating={popularRecipe.rating}></RecipeRating>
                                </div>

                            </div>
                        ))}
                </div>
            </div>

        </>
    )
}
