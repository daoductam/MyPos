import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

const ProtectedRoute = ({ children, roles }) => {
  const { userProfile, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const hasToken = localStorage.getItem("jwt");


  if (loading || (hasToken && !userProfile)) {
    // Show a loading indicator while profile is being fetched
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!userProfile) {
    // User not logged in, redirect to login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }


  const userHasRequiredRole = userProfile && roles.includes(userProfile.role);

  if (!userHasRequiredRole) {
    // User does not have the required role, redirect to a 'not found' or 'unauthorized' page
    // Or redirect to the main landing page as a fallback.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;