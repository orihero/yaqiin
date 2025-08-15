import React, { useState, useEffect } from 'react';
import { formatPrice, formatNumber, parseFormattedPrice, parseFormattedNumber } from '../utils/inputMasks';

interface MaskedInputProps {
  value: number;
  onChange: (value: number) => void;
  type: 'price' | 'number';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MaskedInput: React.FC<MaskedInputProps> = ({
  value,
  onChange,
  type,
  placeholder,
  className = '',
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (type === 'price') {
      setDisplayValue(formatPrice(value.toString()));
    } else {
      setDisplayValue(formatNumber(value.toString()));
    }
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (type === 'price') {
      const formatted = formatPrice(inputValue);
      setDisplayValue(formatted);
      const parsed = parseFormattedPrice(formatted);
      onChange(parsed);
    } else {
      const formatted = formatNumber(inputValue);
      setDisplayValue(formatted);
      const parsed = parseFormattedNumber(formatted);
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    // Ensure the display value is properly formatted on blur
    if (type === 'price') {
      setDisplayValue(formatPrice(value.toString()));
    } else {
      setDisplayValue(formatNumber(value.toString()));
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};

export default MaskedInput;
