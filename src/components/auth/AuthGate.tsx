import { useAuth } from "@/hooks/useAuth";
import React from "react";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  console.log(loading)
  if (loading) {
    return null; 
  }
   console.log(loading)
  return <>{children}</>;
};
