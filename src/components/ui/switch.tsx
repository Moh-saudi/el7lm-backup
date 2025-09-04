"use client";

import * as React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <div className={`
          w-11 h-6 
          bg-gray-200 
          rounded-full 
          peer 
          peer-checked:after:translate-x-full 
          peer-checked:after:border-white 
          after:content-[''] 
          after:absolute 
          after:top-[2px] 
          after:start-[2px] 
          after:bg-white 
          after:border-gray-300 
          after:border 
          after:rounded-full 
          after:h-5 
          after:w-5 
          after:transition-all 
          peer-checked:bg-blue-600
          ${className}
        `}></div>
      </label>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };

