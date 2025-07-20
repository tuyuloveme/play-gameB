import React from 'react';

export default function Button({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}