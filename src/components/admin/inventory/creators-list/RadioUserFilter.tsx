
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RadioUserFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function RadioUserFilter({ value, onChange }: RadioUserFilterProps) {
  const handleValueChange = (newValue: string) => {
    // If clicking the same value, toggle it off (set to null)
    if (value === newValue) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };
  
  return (
    <div className="p-4 border rounded-md bg-white">
      <h3 className="font-medium text-sm mb-3">Filtrar por Usuario</h3>
      <RadioGroup value={value || ""} onValueChange={handleValueChange} className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="DANIEL" id="user-daniel" />
            <Label htmlFor="user-daniel">DANIEL</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FRANK" id="user-frank" />
            <Label htmlFor="user-frank">FRANK</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MANUEL" id="user-manuel" />
            <Label htmlFor="user-manuel">MANUEL</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="KATHERINE" id="user-katherine" />
            <Label htmlFor="user-katherine">KATHERINE</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ORIANA" id="user-oriana" />
            <Label htmlFor="user-oriana">ORIANA</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ANA" id="user-ana" />
            <Label htmlFor="user-ana">ANA</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="DAYANA" id="user-dayana" />
            <Label htmlFor="user-dayana">DAYANA</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SAONE" id="user-saone" />
            <Label htmlFor="user-saone">SAONE</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
