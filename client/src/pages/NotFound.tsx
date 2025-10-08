import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black h-screen w-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold mb-4 text-lime-500">404</h1>
      <p className="text-2xl mb-8">Oops! Page Not Found</p>
      <button
        onClick={() => navigate(-1)}
        className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
