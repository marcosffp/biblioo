import React from "react";

export interface RatingStarsProps {
  value: number; // 0-5
}

export function RatingStars({ value }: RatingStarsProps) {
  const filledCount = Math.max(0, Math.min(5, Math.round(value)));
  const stars = Array.from({ length: 5 }, (_, i) => i < filledCount);
  return (
    <div className="inline-flex gap-1" aria-label={`Avaliação ${value} de 5`}>
      {stars.map((filled, idx) => (
        <span key={idx} className={`${filled ? "text-amber-400" : "text-gray-300"} text-sm`}>★</span>
      ))}
    </div>
  );
}

export default RatingStars;
