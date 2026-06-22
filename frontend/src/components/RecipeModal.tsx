import { useState } from 'react'
import { useEffect } from 'react'
import type { Recipe } from "../pages/Recipes"
import "../css/RecipeModal.css"
import api from '../api'

export interface ModalProps {
    recipe: Recipe | null
    setModalOpen: (value: boolean) => void
    setClickedRecipe: (value: Recipe | null) => void,
    modalOpen: boolean,

}

export interface FullRecipeDetails {
    ingredientsSection: ingredientsItem[];
    instructionsSection: instructionsItem[];
}


export interface ingredientsItem {
    id: number;
    name: string;
    ingredient: string;


}

export interface instructionsItem {
    id: number;
    name: string;
    instruction: string;
}
export default function RecipeModal({ recipe, setModalOpen, modalOpen, setClickedRecipe }: ModalProps) {
    const [recipeDetails, setRecipeDetails] = useState<FullRecipeDetails | null>(null)
    const handleCloseModal = () => {
        setModalOpen(false)
        setClickedRecipe(null)
    }

    useEffect(() => {
        const getClickedRecipe = async () => {
            if (!recipe) return
            try {
                const response = await api.get("/api/recipes/" + recipe.id)

                const result = await response.data

                setRecipeDetails(result)
            }

            catch (error) {
                console.log("Failed to get recipe", error)
            }

        }
        getClickedRecipe()
    }, [recipe])
    return (
        <>
            <main>
                <h1 style={{ color: "#1C5F21", textAlign: "center", width: "auto", padding: "10px" }}>{recipe?.name}</h1>

                {recipe && modalOpen &&
                    <div className='recipe-section-container'>
                        <button className="recipe-modalBtn" onClick={handleCloseModal}>Close</button>

                        <img src={recipe.recipe_image} className="recipe-modal-img" />

                        <div className='recipe-start-section'>
                            <p style={{ marginBottom: "8px", color: "#1C5F21", fontWeight: 600 }}>Cooking time:</p>
                            <p style={{ marginBottom: "8px" }}>{recipe.cookTimeMinutes} minutes</p>
                            <p style={{ marginBottom: "8px", color: "#1C5F21", fontWeight: 600 }}>Servings:</p>
                            <p style={{ marginBottom: "8px" }}>{recipe.servings}</p>
                            <p style={{ marginBottom: "8px", color: "#1C5F21", fontWeight: 600 }}>Prep time:</p>
                            <p>{recipe.prepTimeMinutes} minutes</p>
                        </div>

                        <h3 style={{ marginTop: "10px", color: "#1C5F21", fontWeight: 600 }}>Ingredients</h3>
                        {recipeDetails && recipeDetails.ingredientsSection.map((recipeIngredientDetail, index) => (
                            <div key={index} style={{ marginTop: "10px" }}>
                                <p>{recipeIngredientDetail.ingredient}</p>
                            </div>
                        ))}

                        <h3 style={{ marginTop: "15px", color: "#1C5F21" }}>Instructions</h3>
                        {recipeDetails && recipeDetails.instructionsSection.map((recipeInstructionDetail, index) => (
                            <div key={index} style={{ marginTop: "10px" }}>
                                <p>{recipeInstructionDetail.instruction}</p>
                            </div>
                        ))}
                    </div>
                }
            </main>
        </>
    )
}
