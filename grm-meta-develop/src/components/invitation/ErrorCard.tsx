
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  title?: string;
  message?: string;
  buttonText?: string;
  redirectPath?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = "Invitation Not Found",
  message = "The invitation you're looking for is either invalid or has expired.",
  buttonText = "Go to Homepage",
  redirectPath = "/",
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">{message}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate(redirectPath)}>{buttonText}</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
