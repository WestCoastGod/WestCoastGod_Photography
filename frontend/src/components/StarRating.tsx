import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  level: number;
  className?: string;
  showText?: boolean;
}

const StarRating = ({
  level,
  className = "",
  showText = true,
}: StarRatingProps) => {
  const fullStars = Math.floor(level);
  const hasHalfStar = level % 1 >= 0.5;

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-yellow-400">
          {i < fullStars ? (
            <FaStar className="inline-block" />
          ) : i === fullStars && hasHalfStar ? (
            <FaStarHalfAlt className="inline-block" />
          ) : (
            <FaRegStar className="inline-block" />
          )}
        </span>
      ))}
      {showText && <span className="ml-1 text-sm">{level.toFixed(1)}/5</span>}
    </div>
  );
};

export default StarRating;
