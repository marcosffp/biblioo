import React from "react";

export interface RatingStarsProps {
  value: number; // 0-5
  size?: number;
}

export function RatingStars({ value }: RatingStarsProps) {
  const normalizedValue = Math.max(0, Math.min(5, Math.round(value)));
  const fullStars = Math.floor(normalizedValue);
  const hasHalfStar = normalizedValue - fullStars >= 0.5;

  return (
    <div className="inline-flex" aria-label={`Avaliação ${value} de 5`}>
      {Array.from({ length: 5 }, (_, idx) => {
        const isFull = idx < fullStars;
        const isHalf = idx === fullStars && hasHalfStar;

        if (isHalf) {
          return <span key={idx} className="icon-star-half" aria-hidden="true" />;
        }

        return (
          <span
            key={idx}
            className={`icon-star ${isFull ? "text-amber-300" : "text-amber-100"}`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export default RatingStars;
