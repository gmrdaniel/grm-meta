
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { NotificationLogFormValues } from "../schemas/notificationLogFormSchema";
import { useProjectStages } from "../hooks/useProjectStages";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";

interface ProjectStageFieldProps {
  control: Control<NotificationLogFormValues>;
}

export function ProjectStageField({ control }: ProjectStageFieldProps) {
  const { data: stages, isLoading } = useProjectStages();

  if (isLoading) {
    return <div className="h-10 flex items-center"><LoadingSpinner /></div>;
  }

  return (
    <FormField
      control={control}
      name="stage_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project Stage (Optional)</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a project stage" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {stages?.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
