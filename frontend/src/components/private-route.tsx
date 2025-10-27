// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/use-auth";


interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[]; // quais roles podem acessar
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />; // ou uma página de acesso negado
  }

  return <>{children}</>;
}
