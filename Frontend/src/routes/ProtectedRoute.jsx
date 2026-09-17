import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';
import { getAccessToken } from '../utils/api';

const ProtectedRoute = ({ children, roles }) => {
  const { userProfile, loading: userLoading } = useSelector((state) => state.user);
  const { isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized || userLoading) {
    // Show a loading indicator while session is being refreshed on reload
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