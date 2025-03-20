
import { ReactNode } from "react";

interface AuthContainerProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthContainer({ children, title, subtitle }: AuthContainerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>

      <div className="mt-6">
        <img
          src="/lovable-uploads/9e1be316-e2d0-4ebe-863a-e7062b2e9a78.png"
          alt="LA NETA Logo"
          className="h-10 w-auto object-contain"
        />
      </div>

      <div className="mt-4 text-center text-gray-500 text-sm">
        © 2025 LA NETA from Global Media Review
      </div>
    </div>
  );
}
