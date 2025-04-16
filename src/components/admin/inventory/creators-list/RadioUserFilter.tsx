
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RadioUserFilterProps {
  selectedUser: string | null;
  onSelectUser: (user: string | null) => void;
}

// Rearranged users according to specified columns
const COLUMN_1 = ["DANIEL", "FRANK"];
const COLUMN_2 = ["MANUEL", "KATHERINE"];
const COLUMN_3 = ["ORIANA", "ANA"];
const COLUMN_4 = ["DAYANA", "SAONE"];

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
        <RadioGroup value={selectedUser || ""} onValueChange={onSelectUser}>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1 space-y-2">
              {COLUMN_1.map((user) => (
                <div key={user} className="flex items-center space-x-2">
                  <RadioGroupItem value={user} id={`radio-user-${user}`} />
                  <Label htmlFor={`radio-user-${user}`} className="font-normal cursor-pointer">
                    {user}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="col-span-1 space-y-2">
              {COLUMN_2.map((user) => (
                <div key={user} className="flex items-center space-x-2">
                  <RadioGroupItem value={user} id={`radio-user-${user}`} />
                  <Label htmlFor={`radio-user-${user}`} className="font-normal cursor-pointer">
                    {user}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="col-span-1 space-y-2">
              {COLUMN_3.map((user) => (
                <div key={user} className="flex items-center space-x-2">
                  <RadioGroupItem value={user} id={`radio-user-${user}`} />
                  <Label htmlFor={`radio-user-${user}`} className="font-normal cursor-pointer">
                    {user}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="col-span-1 space-y-2">
              {COLUMN_4.map((user) => (
                <div key={user} className="flex items-center space-x-2">
                  <RadioGroupItem value={user} id={`radio-user-${user}`} />
                  <Label htmlFor={`radio-user-${user}`} className="font-normal cursor-pointer">
                    {user}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
