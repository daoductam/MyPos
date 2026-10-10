import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';
import { getAccessToken } from '../utils/api';

const ProtectedRoute = ({ children, permissions = [] }) => {
  const { userProfile, authorizationProfile, loading, authorizationLoading } = useSelector((state) => state.user);
const ProtectedRoute = ({ children, roles }) => {
  const { userProfile, loading: userLoading } = useSelector((state) => state.user);
  const { isInitialized, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();


  if (loading || authorizationLoading || (hasToken && (!userProfile || !authorizationProfile))) {
    // Show a loading indicator while profile is being fetched
  // Show loading spinner until session initialization is complete,
  // or if user is authenticated but userProfile is still fetching.
  if (!isInitialized || userLoading || (isAuthenticated && !userProfile)) {
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


  const userHasRequiredCapability = permissions.length === 0
    || permissions.some((permission) => authorizationProfile?.capabilities?.includes(permission))
    || (permissions.includes('order.create') && (userProfile?.role === 'ROLE_CASHIER' || userProfile?.role === 'ROLE_BRANCH_CASHIER'))
    || (permissions.includes('employee.create') && (userProfile?.role === 'ROLE_BRANCH_MANAGER' || userProfile?.role === 'ROLE_BRANCH_ADMIN'))
    || (permissions.includes('store.read') && (userProfile?.role === 'ROLE_STORE_ADMIN' || userProfile?.role === 'ROLE_STORE_MANAGER'))
    || (permissions.includes('platform.dashboard.read') && userProfile?.role === 'ROLE_ADMIN');

  if (!userHasRequiredCapability) {
    // User does not have the required role, redirect to a 'not found' or 'unauthorized' page
    // Or redirect to the main landing page as a fallback.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
