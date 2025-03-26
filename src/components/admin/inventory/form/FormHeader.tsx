
import React from "react";

interface FormHeaderProps {
  title: string;
  description?: string;
}

export function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}
