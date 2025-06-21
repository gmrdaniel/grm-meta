import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createInvitation,
  updateInvitation,
} from "@/services/invitationService";
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
import { CreateInvitationData, CreatorInvitation } from "@/types/invitation";
import { Switch } from "@/components/ui/switch";
import { validateFacebookPageUrl } from "@/utils/validateFacebookPageUrl";

const formSchema = z
  .object({
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
    social_media_type: z
      .enum(["tiktok", "pinterest", "youtube", "instagram"])
      .optional(),
    project_id: z.string().uuid({ message: "Please select a project" }),
    invitation_type: z.enum(["new_user", "existing_user"]),
    phone_number: z
      .string()
      .nullable()
      .refine((val) => !val || val.replace(/\D/g, "").length >= 9, {
        message: "Phone number must have at least 9 digits",
      }),
        
    phone_country_code: z
      .string()
      .nullable()
      .refine((val) => !val || val.startsWith("+"), {
        message: "Country code must start with '+'",
      }),

    facebook_page: z
      .string()
      .nullable()
      .refine((val) => !val || validateFacebookPageUrl(val), {
        message: "Please enter a valid Facebook page URL",
      }),
    facebook_profile: z
      .string()
      .nullable()
      .refine((val) => !val || validateFacebookPageUrl(val), {
        message: "Please enter a valid Facebook profile URL",
      }),

    phone_verified: z.boolean().optional().default(false),
    fb_step_completed: z.boolean().optional().default(false),
    is_professional_account: z.boolean().optional().default(false),
    status: z.enum(["pending", "in process", "completed","rejected","approved"]),
    instagram_user: z.string().optional().default(""),
    
  })
  .superRefine((data, ctx) => {
    // 🔒 Requiere teléfono completo para marcar como verificado
    if (data.phone_verified) {
      if (!data.phone_number || !data.phone_country_code) {
        ctx.addIssue({
          code: "custom",
          message:
            "Phone number and country code are required to verify the phone.",
          path: ["phone_verified"],
        });
      }
    }
    // Validación: que `facebook_page` y `facebook_profile` no sean iguales
    if (
      data.facebook_page &&
      data.facebook_profile &&
      data.facebook_page.trim() === data.facebook_profile.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["facebook_profile"],
        message: "Facebook profile and page URLs must be different",
      });
    }

    // 🔒 Requiere URLs válidas para marcar paso de FB como completo
    if (data.facebook_page) {
      const result = validateFacebookPageUrl(data.facebook_page);
      if (!result.isValid) {
        ctx.addIssue({
          code: "custom",
          message: result.errorMessage ?? "Invalid Facebook page URL",
          path: ["facebook_page"],
        });
      }
    }

    // Facebook profile
    if (data.facebook_profile) {
      const result = validateFacebookPageUrl(data.facebook_profile);
      if (!result.isValid) {
        ctx.addIssue({
          code: "custom",
          message: result.errorMessage ?? "Invalid Facebook profile URL",
          path: ["facebook_profile"],
        });
      }
    }

    // Paso FB completo solo si ambas URLs están presentes y válidas
    const pageValid =
      data.facebook_page && validateFacebookPageUrl(data.facebook_page).isValid;
    const profileValid =
      data.facebook_profile &&
      validateFacebookPageUrl(data.facebook_profile).isValid;

    if (data.fb_step_completed && (!pageValid || !profileValid)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Both Facebook page and profile URLs must be valid to complete this step.",
        path: ["fb_step_completed"],
      });
    }
  });

interface InvitationFormProps {
  onSuccess?: () => void;
  initialData?: CreatorInvitation;
  isEditMode?: boolean;
}

const InvitationForm = ({
  onSuccess,
  initialData,
  isEditMode,
}: InvitationFormProps) => {
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      social_media_handle: "",
      invitation_type: "new_user",
      phone_number: "",
      phone_country_code: "",
      facebook_page: "",
      facebook_profile: "",
      phone_verified: false,
      fb_step_completed: false,
      is_professional_account: false,
      status: "pending",
      instagram_user: "",
    },
  });
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "status" && (value.status === "pending" || value.status === "in process")) {
        form.setValue("fb_step_completed", false, {
          shouldValidate: true
        });
      }

       if (name === "status" && (value.status === "completed" || value.status === "approved")) {
        form.setValue("fb_step_completed", true, {
          shouldValidate: true
        });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

   const isFbStepDisabled = () => {
    const status = form.watch("status");
    return status === "pending" || status === "in process" || status === "completed" || status === "approved";
  };
  
  useEffect(() => {
    if (
      initialData &&
      isEditMode &&
      projects &&
      projects.length > 0 // nos aseguramos de que la lista esté lista
    ) {
      const sanitizedData = sanitizeInitialData(initialData);
      form.reset({
        ...form.getValues(),
        ...sanitizedData,
      });
    }
  }, [initialData, isEditMode, projects, form]);

  const sanitizeInitialData = (data: Record<string, any>) => {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = value === undefined || value === null ? "" : value;
    }
    return sanitized;
  };

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
      email: data.email.toLowerCase(),
      social_media_handle: data.social_media_handle,
      youtube_channel: null,
      social_media_type: data.social_media_type || null,
      project_id: data.project_id,
      invitation_type: data.invitation_type,
      phone_number: data.phone_number || null,
      phone_country_code: data.phone_country_code || null,
      facebook_page: data.facebook_page || null,
      facebook_profile: data.facebook_profile || null,
      phone_verified: data.phone_verified || false,
      fb_step_completed: data.fb_step_completed || false,
      is_professional_account: data.is_professional_account || false,
      status: data.status || "pending",
      instagram_user: data.instagram_user || "",
    };

    // Map social_media_handle to the correct property
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

    // 🚀 Switch between create or update
    if (isEditMode && initialData?.id) {
      updateInvitationMutation.mutate(
        { id: initialData.id, data: invitationData },
        {
          onSuccess: () => {
            toast.success("Invitation updated!");
            if (onSuccess) onSuccess();
          },
        }
      );
    } else {
      createInvitationMutation.mutate(invitationData, {
        onSuccess: () => {
          toast.success("Invitation created!");
          form.reset();
          if (onSuccess) onSuccess();
        },
      });
    }
  };

  const updateInvitationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateInvitationData }) => {
      return updateInvitation(id, {...data, status: data.status}); // Asegúrate de tener esta función en tus servicios
    },
    onSuccess: () => {
      toast.success("Invitation updated!");
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Error updating invitation: ${error.message}`);
    },
  });

  const hasSocialMedia = !!form.watch("social_media_type");
  const selectedProjectId = form.watch("project_id");
  const selectedProject = projects?.find(
    (project) => project.id === selectedProjectId
  );

  const isSubmitting = isEditMode
    ? updateInvitationMutation.isPending
    : createInvitationMutation.isPending;

  const buttonText = isEditMode
    ? isSubmitting
      ? "Updating..."
      : "Update Invitation"
    : isSubmitting
    ? "Creating..."
    : "Create Invitation";

  useEffect(() => {
    if (isEditMode && selectedProject && initialData?.social_media_type) {
      form.setValue("social_media_type", initialData.social_media_type);
    }
  }, [selectedProject, isEditMode, initialData?.social_media_type]);

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
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isEditMode}
                >
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
                      value as "tiktok" | "pinterest" | "youtube" | "instagram"
                    );

                    // Solo limpiar el handle si estás creando
                    if (!isEditMode) {
                      form.setValue("social_media_handle", "");
                    }
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
                      <SelectItem
                        key={platform.id}
                        value={platform.name.toLowerCase()}
                      >
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
          {!isEditMode && (
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
                      <SelectItem value="existing_user">
                        Existing User
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Whether this is for a new user or an existing user
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isEditMode && (
            <>
              <FormField
                control={form.control}
                name="phone_country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., +1, +34, +57" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="facebook_page"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Page</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="facebook.com/yourpage" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebook_profile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Profile</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="facebook.com/yourprofile"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="facebook.com/yourprofile"
                      />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in process">In Process</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>                        
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>

                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of the invitation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <hr className="col-span-full border-t border-gray-300" />

              <FormField
                control={form.control}
                name="phone_verified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Phone Verified
                      </FormLabel>
                      <FormDescription>
                        Is the phone number verified?
                      </FormDescription>
                      <FormMessage />
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
                      <FormLabel className="text-base">
                        FB Step Completed
                      </FormLabel>
                      <FormDescription>
                        Has the Facebook step been completed?
                      </FormDescription>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          if (!isFbStepDisabled()) {
                            field.onChange(checked);
                          }
                        }}
                        disabled={isFbStepDisabled()}
                        className={isFbStepDisabled() ? "opacity-50 cursor-not-allowed" : ""}
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
                      <FormLabel className="text-base">
                        Professional Account
                      </FormLabel>
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
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {buttonText}
          </Button>

        
        </div>
      </form>
    </Form>
  );
};

export default InvitationForm;
