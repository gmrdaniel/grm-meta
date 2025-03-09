
import React from 'react';

interface EmailSectionProps {
  email: string | null;
}

export const EmailSection = ({ email }: EmailSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium mb-4">Correo Electrónico</h3>
      <input
        type="email"
        value={email || ''}
        readOnly
        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
      />
    </div>
  );
};
