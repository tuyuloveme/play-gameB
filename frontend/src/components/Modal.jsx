import React, { useEffect, useRef } from 'react';

export default function Modal({ children, onClose, className = '' }) {
  const modalRef = useRef();

  // Tutup modal saat klik di luar area konten
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose?.(); // panggil onClose jika disediakan
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`bg-white rounded-lg p-6 max-h-[80vh] overflow-y-auto w-full max-w-md ${className}`}
      >
        {children}
      </div>
    </div>
  );
}