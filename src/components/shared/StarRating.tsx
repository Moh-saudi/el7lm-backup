'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

export default function StarRating({ 
  initialRating = 0, 
  onRatingChange, 
  maxRating = 5, 
  size = 'md',
  readonly = false,
  className = ''
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRatingClick = (newRating: number) => {
    if (readonly) return;
    
    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleMouseEnter = (newRating: number) => {
    if (readonly) return;
    setHoveredRating(newRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className={`flex items-center space-x-1 space-x-reverse ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= displayRating;
        
        return (
          <button
            key={index}
            type="button"
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-all duration-500 ease-out hover:scale-105 focus:outline-none`}
            onClick={() => handleRatingClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <Star 
              className={`${getSizeClasses()} transition-colors duration-500 ease-out ${
                isActive 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-300'
              }`}
            />
          </button>
        );
      })}
      
      {!readonly && (
        <span className="mr-2 text-sm text-white/70">
          {displayRating > 0 ? `${displayRating}/${maxRating}` : 'اختر التقييم'}
        </span>
      )}
      
      {readonly && rating > 0 && (
        <span className="mr-2 text-sm text-yellow-400 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
} 
