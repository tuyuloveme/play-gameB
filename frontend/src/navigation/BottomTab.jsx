// src/navigation/BottomTab.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHistory, FaChartBar, FaCog } from 'react-icons/fa';

const tabs = [
  { label: 'Home', path: '/', icon: <FaHome size={20} /> },
  { label: 'Riwayat', path: '/riwayat', icon: <FaHistory size={20} /> },
  { label: 'Summary', path: '/summary', icon: <FaChartBar size={20} /> },
  { label: 'Setting', path: '/setting', icon: <FaCog size={20} /> },
];

export default function BottomTab() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center gap-1 text-xs font-medium ${
              active ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div>{tab.icon}</div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}