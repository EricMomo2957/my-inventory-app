import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Replace this with your actual auth logic later (e.g., checking a token in localStorage)
  const isAuthenticated = localStorage.getItem('userToken'); 

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;