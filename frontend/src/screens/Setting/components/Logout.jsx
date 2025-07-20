import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../../components/Button';

export default function Logout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded w-full"
    >
      Logout
    </Button>
  );
}