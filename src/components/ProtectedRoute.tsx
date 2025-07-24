import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
