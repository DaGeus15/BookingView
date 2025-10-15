import React from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

const AdminGuard = ({ children }) => {
  const { isAdmin } = useAppContext();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminGuard;
