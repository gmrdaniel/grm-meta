import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

// Importa el tipo AuditActionType desde el archivo types.ts
import type { AuditActionType } from './types';

interface AuditLogsFiltersProps {
  filters: {
    search?: string;
    action?: AuditActionType;
  };
  onFiltersChange: (filters: { search?: string; action?: AuditActionType }) => void;
}

const AuditLogsFilters: React.FC<AuditLogsFiltersProps> = ({ filters, onFiltersChange }) => {
  const [search, setSearch] = useState<string>(filters.search || '');
  const [action, setAction] = useState<AuditActionType | undefined>(filters.action);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  useEffect(() => {
    if (!filtersInitialized) {
      setSearch(filters.search || '');
      setAction(filters.action);
      setDebouncedSearch(filters.search || '');
      setFiltersInitialized(true);
    }
  }, [filters, filtersInitialized, setAction, setSearch, setDebouncedSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    onFiltersChange({ search: debouncedSearch, action });
  }, [debouncedSearch, action, onFiltersChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const actionOptions = [
    { value: '', label: 'Todas' },
    { value: 'create', label: 'Crear' },
    { value: 'update', label: 'Actualizar' },
    { value: 'delete', label: 'Eliminar' },
    { value: 'revert', label: 'Revertir' },
    { value: 'payment', label: 'Pago' },
  ];

  const handleActionChange = (value: string) => {
    if (value === '') {
      setFilters((prev) => ({ ...prev, action: undefined }));
    } else {
      setFilters((prev) => ({ ...prev, action: value as AuditActionType }));
    }
  };

  const setFilters = (fn: (prevState: { search?: string; action?: AuditActionType }) => { search?: string; action?: AuditActionType }) => {
    onFiltersChange(fn(filters));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="search">Buscar</Label>
          <Input
            type="search"
            id="search"
            placeholder="Buscar..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div>
          <Label htmlFor="action">Acción</Label>
          <Select onValueChange={handleActionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsFilters;
