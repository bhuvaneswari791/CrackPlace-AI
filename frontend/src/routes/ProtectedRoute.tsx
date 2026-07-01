import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'student' | 'recruiter' | 'mentor';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { authUser, userProfile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark text-white gradient-bg px-6">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-neon-pink border-t-transparent border-r-transparent border-l-transparent animate-spin-reverse opacity-70"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="font-display text-sm tracking-widest text-purple-300 font-bold uppercase animate-pulse">
            Checking account...
          </p>
          <p className="font-display text-xs tracking-wider text-gray-400">
            Loading your session...
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userProfile && userProfile.role !== requiredRole && userProfile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
