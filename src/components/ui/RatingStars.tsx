import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RatingStarsProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
  error?: string;
}

export function RatingStars({ rating, onRatingChange, maxStars = 5, error }: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (hoverRating || rating);
          const isHovered = starValue <= hoverRating;

          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className={cn(
                "p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer",
                isFilled ? "text-amber-400" : "text-gray-300"
              )}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => onRatingChange(starValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRatingChange(starValue);
                }
              }}
            >
              <Star
                size={32}
                className={cn(
                  "transition-colors",
                  isFilled && "fill-amber-400",
                  isHovered && "fill-amber-300 bg-opacity-80"
                )}
              />
            </div>
          );
        })}
      </div>
      {error && (
        <span className="text-xs text-color-danger font-medium mt-1">{error}</span>
      )}
    </div>
  );
}
