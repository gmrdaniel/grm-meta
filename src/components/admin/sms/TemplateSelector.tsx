
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Template } from "@/hooks/useTemplates";

interface TemplateSelectorProps {
  templates: Template[] | undefined;
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplateId,
  onTemplateSelect
}: TemplateSelectorProps) {
  return (
    <div>
      <Label htmlFor="template">Plantilla</Label>
      <Select
        value={selectedTemplateId}
        onValueChange={onTemplateSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar plantilla" />
        </SelectTrigger>
        <SelectContent>
          {templates?.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
