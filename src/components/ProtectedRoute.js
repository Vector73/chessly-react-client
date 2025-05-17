import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession, useUser } from '@descope/react-sdk';
import Loading from './Loading';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/userSlice';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const dispatch = useDispatch();

  if (isSessionLoading || isUserLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  } else {
    dispatch(setUser({
          username: user.displayName || user.loginIds[2],
          email: user.email,
          userId: user.userId,
        }))
  }
  return <>{children}</>;
};

export default ProtectedRoute;
