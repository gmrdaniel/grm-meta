import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Project } from "@/types/project";
import {
  createProject,
  updateProject,
} from "@/services/project/projectService";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "The name must have at least 3 characters" }),
  status: z.enum(["draft", "active", "pending", "archived"]),
});

interface ProjectFormProps {
  onSuccess: () => void;
  defaultValues?: z.infer<typeof formSchema>;
  projectId?: string;
}

export function ProjectForm({
  onSuccess,
  defaultValues,
  projectId,
}: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!projectId;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      status: "draft",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      if (isEditing && projectId) {
        await updateProject(projectId, values);
        toast.success("Project updated successfully");
      } else {
        await createProject({
          name: values.name,
          status: values.status,
        });
        toast.success("Project created successfully");
      }

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} project: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Project" : "Create New Project"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Meta Growth Program" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading && (
                <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {isEditing ? "Update Project" : "Create Project"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
