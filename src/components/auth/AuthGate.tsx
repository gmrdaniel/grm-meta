import { useAuth } from "@/hooks/useAuth";
import React from "react";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();

  if (loading) {
    return null; 
  }
  
  return <>{children}</>;
};