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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  fetchProjectStages,
  createProjectStage,
  updateProjectStage,
} from "@/services/project/projectService";
import { ProjectStage } from "@/types/project";

const formSchema = z. object({
name: z
. string()
. min(3, { message: "Name must be at least 3 characters" }),
slug: z
. string()
. min(3, { message: "Slug must be at least 3 characters" }),
url: z. string(). min(1, { message: "URL is required" }),
view: z. string(). min(1, { message: "View is required" }),
responsible: z. enum(["system", "creator", "admin"], {
required_error: "You must select a responsible",
}),
privacy: z. enum(["public", "private"], {
required_error: "You must select privacy",
}),
response_positive: z. string(). optional(),
response_negative: z.string().optional(),
});

interface ProjectStageFormProps {
  projectId: string;
  onSuccess: () => void;
  defaultValues?: z.infer<typeof formSchema> & { order_index?: number };
  stageId?: string;
}

export function ProjectStageForm({
  projectId,
  onSuccess,
  defaultValues,
  stageId,
}: ProjectStageFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!stageId;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      slug: "",
      url: "",
      view: "",
      responsible: "system",
      privacy: "private",
      response_positive: "",
      response_negative: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Get next order index if creating new stage
      let orderIndex = defaultValues?.order_index || 1;

      if (!isEditing) {
        const stages = await fetchProjectStages(projectId);
        orderIndex =
          stages.length > 0
            ? Math.max(...stages.map((s) => s.order_index)) + 1
            : 1;
      }

      if (isEditing && stageId) {
        await updateProjectStage(stageId, {
          ...values,
          project_id: projectId,
        });
        toast.success("Successfully updated stage");
      } else {
        await createProjectStage({
          name: values.name,
          slug: values.slug,
          url: values.url,
          view: values.view,
          responsible: values.responsible,
          privacy: values.privacy,
          response_positive: values.response_positive,
          response_negative: values.response_negative,
          project_id: projectId,
          order_index: orderIndex,
        });
        toast.success("Successfully created stage");
      }

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} stage: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Stage" : "Create New Stage"}
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
                  <FormLabel>Stage Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Application Review" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: review-request" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="/projects/review" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="view"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>View</FormLabel>
                    <FormControl>
                      <Input placeholder="ReviewView" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsible</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select responsible" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select privacy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Públic</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="response_positive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next View (Positive)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ApprovalView"
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="response_negative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next View (Negative)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="RejectionView"
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading && (
                <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {isEditing ? "Update Stage" : "Create Stage"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
