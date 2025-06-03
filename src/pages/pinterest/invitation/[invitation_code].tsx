
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  instagramUser: z.string().min(2, {
    message: "Instagram user must be at least 2 characters.",
  }),
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions.",
  }),
  phoneNumber: z.string().optional(),
  phoneCountryCode: z.string().optional(),
});

const defaultFormData = {
  firstName: "",
  lastName: "",
  email: "",
  instagramUser: "",
  termsAccepted: false,
  phoneNumber: "",
  phoneCountryCode: "",
  countryOfResidenceId: "",
};

const stepList = [
  {
    id: "terms",
    label: "Terms & Conditions",
  },
  {
    id: "profile",
    label: "Profile",
  },
] as const;

type Step = typeof stepList[number];

const Page = () => {
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [projectStages, setProjectStages] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>(stepList[0]);
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load invitation data directly from Supabase
  useEffect(() => {
    const loadInvitationData = async () => {
      if (!invitation_code) {
        setError("No invitation code provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Find invitation by code
        const { data: invitationData, error: invitationError } = await supabase
          .rpc('find_invitation_by_code', { code_param: invitation_code });

        if (invitationError || !invitationData?.length) {
          setError("Invalid invitation code or invitation not found");
          setLoading(false);
          return;
        }

        const invitation = invitationData[0];
        setInvitation(invitation);

        // Set form data from invitation
        setFormData({
          firstName: invitation.first_name || "",
          lastName: invitation.last_name || "",
          email: invitation.email || "",
          instagramUser: invitation.instagram_user || "",
          termsAccepted: false,
          phoneNumber: invitation.phone_number || "",
          phoneCountryCode: invitation.phone_country_code || "",
          countryOfResidenceId: "",
        });

        // Fetch project stages
        const { data: stagesData, error: stagesError } = await supabase
          .from('project_stages')
          .select('*')
          .eq('project_id', invitation.project_id)
          .order('order_index');

        if (stagesError) {
          console.error('Error fetching stages:', stagesError);
        } else {
          setProjectStages(stagesData || []);

          // Set current step based on invitation stage
          if (invitation.current_stage_id) {
            const currentStage = stagesData?.find(s => s.id === invitation.current_stage_id);
            if (currentStage) {
              const currentStep = stepList.find(step => step.id === currentStage.slug);
              if (currentStep) {
                setCurrentStep(currentStep);
              }
            }
          }
        }

      } catch (err) {
        console.error("Error loading invitation:", err);
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    loadInvitationData();
  }, [invitation_code]);

  // Load countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('name_en');

        if (error) {
          console.error("Error fetching countries:", error);
          toast.error("Failed to load countries");
        } else {
          setCountries(data || []);
        }
      } catch (err) {
        console.error("Error fetching countries:", err);
        toast.error("Failed to load countries");
      }
    };
    loadCountries();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: formData?.firstName,
      lastName: formData?.lastName,
      email: formData?.email,
      instagramUser: formData?.instagramUser,
      termsAccepted: formData?.termsAccepted,
      phoneNumber: formData?.phoneNumber,
      phoneCountryCode: formData?.phoneCountryCode,
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(formData);
  }, [formData, form.reset]);

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      termsAccepted: checked,
    });
    form.setValue("termsAccepted", checked);
  };

  const handleAcceptTerms = async () => {
    if (formData.termsAccepted) {
      try {
        const currentIndex = projectStages.findIndex(s => s.slug === currentStep.id);
        const nextStage = projectStages[currentIndex + 1];
        
        if (nextStage) {
          const { error } = await supabase
            .from('creator_invitations')
            .update({
              current_stage_id: nextStage.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', invitation.id);

          if (error) {
            toast.error('Failed to save progress');
            return;
          }

          const newStep = stepList.find(step => step.id === nextStage.slug) as Step;
          if (newStep) {
            setCurrentStep(newStep);
          }
        }
      } catch (error) {
        console.error('Error proceeding to next step:', error);
        toast.error('Failed to proceed to next step');
      }
    } else {
      toast.error("You must accept the terms and conditions.");
    }
  };

  const mutation = useMutation({
    mutationFn: async (profileData: any) => {
      const { data, error } = await supabase
        .from('creator_profile_categories')
        .insert([profileData]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Profile created successfully!");
      updateInvitationStatusMutation.mutate({
        id: invitation.id,
        status: "completed" as const,
      });
    },
    onError: (error: any) => {
      toast.error(`Something went wrong! ${error.message}`);
    },
  });

  const updateInvitationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "completed" }) => {
      const { data, error } = await supabase
        .from('creator_invitations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Invitation completed!");
      if (invitation?.projects?.slug) {
        navigate(`/${invitation?.projects?.slug}/success`);
      } else {
        navigate(`/success`);
      }
    },
    onError: (error: any) => {
      toast.error(`Something went wrong! ${error.message}`);
    },
  });

  const handleFormSubmission = async (data: any) => {
    try {
      if (!invitation) {
        toast.error("Invitation data not loaded.");
        return;
      }

      const profileData = {
        ...data,
        creator_invitation_id: invitation.id,
      };

      mutation.mutate(profileData);
    } catch (error: any) {
      toast.error(`Something went wrong! ${error.message}`);
    }
  };

  const handleSubmit = async (formData: any) => {
    const allFormData = {
      ...defaultFormData,
      ...formData,
      countryOfResidenceId: formData.phoneCountryCode || "",
    };
    await handleFormSubmission(allFormData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {currentStep.id === "terms" && (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Terms and Conditions
          </h2>
          <p className="text-gray-600 text-center">
            Please read and accept the terms and conditions to proceed.
          </p>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          field.onChange(isChecked);
                          handleCheckboxChange(isChecked);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-tight">
                      <FormLabel>
                        I accept the{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          terms and conditions
                        </a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                onClick={handleAcceptTerms}
                disabled={!formData.termsAccepted}
                className="w-full"
              >
                Accept Terms
              </Button>
            </form>
          </Form>
        </div>
      )}

      {currentStep.id === "profile" && (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Complete Your Profile
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagramUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Instagram username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneCountryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country: any) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name_en}
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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? "Creating Profile..." : "Complete Profile"}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default Page;
