import React from "react";

interface RadioGroupProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange }) => {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="form-radio"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};
