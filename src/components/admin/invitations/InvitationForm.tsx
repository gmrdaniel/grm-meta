import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvitation, updateInvitation } from "@/services/invitationService";
import { fetchProjects } from "@/services/project/projectService";
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
import { Switch } from "@/components/ui/switch";
import { CreateInvitationData, EditInvitationData } from "@/types/invitation";

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
          !/instagram\.com|tiktok\.com|pinterest\.com|facebook\.com/i.test(val)),
      {
        message: "Do not include @ or links in the handle",
      }
    ),
  social_media_type: z.enum(["tiktok", "pinterest", "youtube", "instagram", "facebook"]).optional(),
  youtube_channel: z.string().optional().nullable(),
  instagram_user: z.string().optional().nullable(),
  facebook_page: z.string().optional().nullable(),
  project_id: z.string().uuid({ message: "Please select a project" }),
  invitation_type: z.enum(["new_user", "existing_user"]),
  status: z.enum(["pending", "accepted", "rejected", "completed"]),
  phone_number: z.string().optional().nullable(),
  phone_country_code: z.string().optional().nullable(),
  phone_verified: z.boolean().optional(),
  fb_step_completed: z.boolean().optional(),
  is_professional_account: z.boolean().optional(),
});

interface InvitationFormProps {
  onSuccess?: () => void;
  initialData?: any; // Datos iniciales para edición
  isEditMode?: boolean;
  invitationId?: string;
}

const InvitationForm = ({ onSuccess, initialData, isEditMode = false, invitationId }: InvitationFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      social_media_handle: "",
      invitation_type: "new_user",
      status: "pending",
      phone_verified: false,
      fb_step_completed: false,
      is_professional_account: false,
    },
  });

  // Cargar los valores iniciales cuando estamos en modo edición y tenemos datos
  useEffect(() => {
    if (isEditMode && initialData) {
      Object.keys(initialData).forEach((key) => {
        if (key in form.getValues()) {
          // @ts-ignore - Ignoramos errores de tipado aquí ya que estamos accediendo a claves dinámicas
          form.setValue(key, initialData[key]);
        }
      });
    }
  }, [initialData, isEditMode, form]);

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

  const updateInvitationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditInvitationData }) => {
      console.log("Updating invitation with data:", data);
      return updateInvitation(id, data);
    },
    onSuccess: () => {
      toast.success("Invitation updated successfully!");
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Error updating invitation: ${error.message}`);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const invitationData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      social_media_handle: data.social_media_handle || null,
      social_media_type: data.social_media_type || null,
      youtube_channel: data.youtube_channel || null,
      instagram_user: data.instagram_user || null,
      facebook_page: data.facebook_page || null,
      project_id: data.project_id,
      invitation_type: data.invitation_type,
      status: data.status,
      phone_number: data.phone_number || null,
      phone_country_code: data.phone_country_code || null,
      phone_verified: data.phone_verified || false,
      fb_step_completed: data.fb_step_completed || false,
      is_professional_account: data.is_professional_account || false,
    };

    if (isEditMode && invitationId) {
      updateInvitationMutation.mutate({
        id: invitationId,
        data: invitationData as EditInvitationData,
      });
    } else {
      createInvitationMutation.mutate(invitationData as CreateInvitationData);
    }
  };

  const hasSocialMedia = !!form.watch("social_media_type");
  const selectedProjectId = form.watch("project_id");
  const selectedProject = projects?.find(
    (project) => project.id === selectedProjectId
  );
  const selectedSocialMedia = form.watch("social_media_type");

  const isPending = isEditMode
    ? updateInvitationMutation.isPending
    : createInvitationMutation.isPending;

  const buttonText = isEditMode
    ? isPending
      ? "Updating..."
      : "Update Invitation"
    : isPending
    ? "Creating..."
    : "Create Invitation";

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
                    disabled={isEditMode}
                    className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
                  />
                </FormControl>
                {isEditMode && (
                  <FormDescription className="text-amber-500">
                    Email cannot be modified once an invitation is created
                  </FormDescription>
                )}
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
                      value as "tiktok" | "pinterest" | "youtube" | "instagram" | "facebook"
                    );
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
                      disabled={!hasSocialMedia || selectedSocialMedia === "youtube" || selectedSocialMedia === "facebook"}
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

          {selectedSocialMedia === "youtube" && (
            <FormField
              control={form.control}
              name="youtube_channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Channel</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter YouTube channel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedSocialMedia === "instagram" && (
            <FormField
              control={form.control}
              name="instagram_user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Instagram username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedSocialMedia === "facebook" && (
            <FormField
              control={form.control}
              name="facebook_page"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook Page</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Facebook page" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., +1, +44, +34" />
                </FormControl>
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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_verified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Phone Verified</FormLabel>
                  <FormDescription>
                    Is the phone number verified?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fb_step_completed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">FB Step Completed</FormLabel>
                  <FormDescription>
                    Has the Facebook step been completed?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_professional_account"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Professional Account</FormLabel>
                  <FormDescription>
                    Is this a professional account?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-32"
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvitationForm;