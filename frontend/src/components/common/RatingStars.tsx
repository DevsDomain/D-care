/**
 * Rating Stars Component
 * Displays star ratings with healthcare theme styling
 */

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = true,
  reviewCount,
  interactive = false,
  onRatingChange,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // garante que o rating fique entre 0 e maxRating
  const clampedRating = Math.max(0, Math.min(rating, maxRating));

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  // formata a nota como "4,3"
  const formattedRating = Number.isFinite(clampedRating)
    ? clampedRating.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    : "0,0";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= clampedRating;
          const isPartiallyFilled =
            starRating - 0.5 <= clampedRating && starRating > clampedRating;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(starRating)}
              className={cn(
                "relative transition-colors",
                interactive && "hover:scale-110 cursor-pointer",
                !interactive && "cursor-default",
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled || isPartiallyFilled
                    ? "fill-medical-warning text-medical-warning"
                    : "fill-none text-neutral-300",
                )}
              />
              {isPartiallyFilled && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    "absolute inset-0 fill-medical-warning text-medical-warning",
                    "clip-path-[polygon(0_0,_50%_0,_50%_100%,_0_100%)]",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {showNumber && (
        <div className={cn("flex items-center gap-1", textSizeClasses[size])}>
          <span className="font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
          {typeof reviewCount === "number" && reviewCount > 0 && (
            <span className="text-muted-foreground">
              ({reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
