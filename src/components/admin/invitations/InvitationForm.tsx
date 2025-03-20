
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvitation } from "@/services/invitationService";
import { fetchProjects } from "@/services/projectService";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateInvitationData } from "@/types/invitation";

const formSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  social_media_handle: z.string().optional(),
  social_media_type: z.enum(["tiktok", "pinterest"]).optional(),
  project_id: z.string().uuid({ message: "Please select a project" }),
  invitation_type: z.enum(["new_user", "existing_user"])
});

interface InvitationFormProps {
  onSuccess?: () => void;
}

const InvitationForm = ({ onSuccess }: InvitationFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      social_media_handle: "",
      invitation_type: "new_user"
    }
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects
  });

  const createInvitationMutation = useMutation({
    mutationFn: (data: CreateInvitationData) => createInvitation(data),
    onSuccess: () => {
      toast.success("Invitation created and email sent successfully!");
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Error creating invitation: ${error.message}`);
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Convert form data to match the expected API format
    const invitationData: CreateInvitationData = {
      full_name: data.full_name,
      email: data.email,
      social_media_handle: data.social_media_handle || null,
      social_media_type: data.social_media_type || null,
      project_id: data.project_id,
      invitation_type: data.invitation_type
    };

    createInvitationMutation.mutate(invitationData);
  };

  const hasSocialMedia = form.watch("social_media_handle") !== "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creator Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter full name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter email address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_media_handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Media Handle</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter social media handle" />
                </FormControl>
                <FormDescription>
                  Optional: Creator's username on social media
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_media_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Media Platform</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!hasSocialMedia}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select social media platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="pinterest">Pinterest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <SelectItem value="loading" disabled>
                        Loading projects...
                      </SelectItem>
                    ) : (
                      projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The project this invitation is associated with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invitation_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invitation Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new_user">New User</SelectItem>
                    <SelectItem value="existing_user">Existing User</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Whether this is for a new user or an existing user
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createInvitationMutation.isPending}
            className="min-w-32"
          >
            {createInvitationMutation.isPending ? "Creating..." : "Create Invitation"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvitationForm;
