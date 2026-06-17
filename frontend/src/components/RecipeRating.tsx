import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
interface RecipeRatingProps {
    rating: number
}
export default function RecipeRating({ rating }: RecipeRatingProps) {
    const stars = [1, 2, 3, 4, 5]
    return (
        <div>
            {stars.map((item, index) => {

                if (item <= Number(rating)) {

                    return <FaStar key={index} style={{ color: "#1C5F21", paddingLeft: "5px" }} />

                }
                else if (item - 0.5 <= Number(rating)) {
                    return <FaStarHalfAlt key={index} style={{ color: "#1c5f21", paddingLeft: "5px" }} />

                }
                else {
                    return <FaRegStar style={{ paddingLeft: "5px", color: "#1C5F21", }} key={index} />

                }



            })}</div>
    )
}
