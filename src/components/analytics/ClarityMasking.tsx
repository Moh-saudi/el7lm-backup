'use client';

import React from 'react';

interface ClarityMaskingProps {
  children: React.ReactNode;
  mask?: boolean;
  unmask?: boolean;
}

/**
 * مكون لإخفاء أو إظهار المحتوى في Clarity
 * بناءً على وثائق Microsoft Clarity
 */
const ClarityMasking: React.FC<ClarityMaskingProps> = ({ 
  children, 
  mask = false, 
  unmask = false 
}) => {
  // تحديد الخاصية المناسبة بناءً على القيم
  const dataAttribute = mask 
    ? { 'data-clarity-mask': 'true' }
    : unmask 
    ? { 'data-clarity-unmask': 'true' }
    : {};

  return (
    <div {...dataAttribute}>
      {children}
    </div>
  );
};

export default ClarityMasking;

