import React from 'react';

export default function EditIcon({ className = 'w-5 h-5 text-blue-500' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3zM3 21h18"
      />
    </svg>
  );
}