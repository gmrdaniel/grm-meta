
import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={`rounded-md border p-4 space-y-4 ${className || ""}`}>
      <h4 className="font-medium">{title}</h4>
      {children}
    </div>
  );
}
