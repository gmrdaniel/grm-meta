import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvitation } from "@/services/invitationService";
import { fetchProjects } from "@/services/projectService";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateInvitationData } from "@/types/invitation";

const formSchema = z.object({
  first_name: z
    .string()
    .min(2, { message: "First Name must be at least 2 characters" }),
  last_name: z
    .string()
    .min(2, { message: "Last Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  social_media_handle: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!val.includes("@") &&
          !/^https?:\/\//i.test(val) &&
          !/instagram\.com|tiktok\.com|pinterest\.com/i.test(val)),
      {
        message: "Do not include @ or links in the handle",
      }
    ),
  social_media_type: z.enum(["tiktok", "pinterest", "youtube", "instagram"]).optional(),
  //youtube_social_media: z.string().nullable(),
  project_id: z.string().uuid({ message: "Please select a project" }),
  invitation_type: z.enum(["new_user", "existing_user"]),
});

interface InvitationFormProps {
  onSuccess?: () => void;
}

const InvitationForm = ({ onSuccess }: InvitationFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      social_media_handle: "",
      invitation_type: "new_user",
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const createInvitationMutation = useMutation({
    mutationFn: (data: CreateInvitationData) => {
      console.log("Creating invitation with data:", data);
      return createInvitation(data);
    },
    onSuccess: () => {
      toast.success("Invitation created and email sent successfully!");
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Error creating invitation: ${error.message}`);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const invitationData: CreateInvitationData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      social_media_handle: null,
      youtube_channel: null,
      social_media_type: data.social_media_type || null,
      project_id: data.project_id,
      invitation_type: data.invitation_type,
    };

    const socialMediaPropertyMap: Record<
      string,
      keyof CreateInvitationData | null
    > = {
      tiktok: "social_media_handle",
      youtube: "youtube_channel",
      instagram: "instagram_user",
    };

    const targetProperty = socialMediaPropertyMap[data.social_media_type || ""];

    if (targetProperty && data.social_media_handle) {
      invitationData[targetProperty] = data.social_media_handle;
    }

    createInvitationMutation.mutate(invitationData, {
      onSuccess: () => {
        toast.success("Invitation created!");
        form.reset();
        if (onSuccess) onSuccess();
      },
    });
  };

  const hasSocialMedia = !!form.watch("social_media_type");
  const selectedProjectId = form.watch("project_id");
  const selectedProject = projects?.find(
    (project) => project.id === selectedProjectId
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creator First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter first name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creator Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter last name" />
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
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter email address"
                  />
                </FormControl>
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
            name="social_media_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Media Platform</FormLabel>
                <Select
                  disabled={!selectedProjectId}
                  onValueChange={(value) => {
                    form.setValue(
                      "social_media_type",
                      value as "tiktok" | "pinterest" | "youtube" | 'instagram'
                    ); // Guardar siempre en social_media_type

                    form.setValue("social_media_handle", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select social media platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>

                    {selectedProject?.platforms?.map((platform) => (
                      <SelectItem key={platform.id} value={platform.name.toLowerCase()}>
                        {platform.name.charAt(0).toUpperCase() +
                          platform.name.slice(1)}
                      </SelectItem>
                    ))}

                  </SelectContent>
                </Select>
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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 text-sm">@</span>
                    </div>
                    <Input
                      {...field}
                      className="pl-8"
                      placeholder="creatorname123"
                      disabled={!hasSocialMedia}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  <span className="text-muted-foreground text-xs">
                    Example: <code>creatorname123</code>
                  </span>
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
            {createInvitationMutation.isPending
              ? "Creating..."
              : "Create Invitation"}
          </Button>
          {/* 
          
          I will comment this code temporarily because
          the form redirect to the list. 

          So the user wont see this button ever.
            
          {createdInvitation && (
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={handleSendEmail}
                disabled={sendEmail.isPending}
              >
                {sendEmail.isPending
                  ? "Sending Email..."
                  : "Send Invitation Email"}
              </Button>
            </div>
          )} */}
        </div>
      </form>
    </Form>
  );
};

export default InvitationForm;
