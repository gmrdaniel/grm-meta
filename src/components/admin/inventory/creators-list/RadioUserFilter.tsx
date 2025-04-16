
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RadioUserFilterProps {
  selectedUser: string | null;
  onSelectUser: (user: string | null) => void;
}

const USERS = [
  "DANIEL", 
  "ORIANA", 
  "FRANK", 
  "ANA", 
  "MANUEL", 
  "DAYANA", 
  "KATHERINE", 
  "SAONE"
];

export function RadioUserFilter({ selectedUser, onSelectUser }: RadioUserFilterProps) {
  const handleClearSelection = () => {
    onSelectUser(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          Filtrar por Usuario
          {selectedUser && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpiar selección</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedUser || ""} onValueChange={onSelectUser} className="flex flex-col space-y-2">
          {USERS.map((user) => (
            <div key={user} className="flex items-center space-x-2">
              <RadioGroupItem value={user} id={`radio-user-${user}`} />
              <Label htmlFor={`radio-user-${user}`} className="font-normal cursor-pointer">
                Radio: {user}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
