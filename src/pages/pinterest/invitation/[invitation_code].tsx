
import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { fetchCountries } from "@/services/project/countryService";
import { updateInvitationStatus } from "@/services/invitation/updateInvitation";
import { useInvitationLoader } from "@/hooks/use-invitationLoader";
import { goToNextStep } from "@/utils/goToNextStep";

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
];

const Page = () => {
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [projectStages, setProjectStages] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(stepList[0]);
  const { invitation_code } = useParams<{ invitation_code: string }>();
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);

  const { loading, error } = useInvitationLoader({
    invitation_code: invitation_code as string | undefined,
    setFormData,
    setInvitation,
    setProjectStages,
    setCurrentStep,
    stepList,
  });

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (err) {
        console.error("Error fetching countries:", err);
        toast.error("Failed to load countries");
      }
    };

    loadCountries();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
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
    setFormData({ ...formData, termsAccepted: checked });
    form.setValue("termsAccepted", checked);
  };

  const handleAcceptTerms = async () => {
    if (formData.termsAccepted) {
      if (!invitation || !projectStages.length) return;
      
      await goToNextStep({
        invitationId: invitation.id,
        projectStages,
        currentStepId: currentStep.id,
        updateStage: (newStage) => {
          const newStep = stepList.find(step => step.id === newStage.slug);
          if (newStep) {
            setCurrentStep(newStep);
          }
        },
      });
    } else {
      toast.error("You must accept the terms and conditions.");
    }
  };

  const updateInvitationStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return updateInvitationStatus(id, status as any);
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

      // For now, just complete the invitation
      updateInvitationStatusMutation.mutate({
        id: invitation.id,
        status: "completed",
      });
    } catch (error: any) {
      toast.error(`Something went wrong! ${error.message}`);
    }
  };

  const handleSubmit = async (formData: z.infer<typeof formSchema>) => {
    const allFormData = {
      ...defaultFormData,
      ...formData,
      countryOfResidenceId: formData.phoneCountryCode || ""
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
                          field.onChange(checked);
                          handleCheckboxChange(checked as boolean);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-tight">
                      <FormLabel className="text-base font-semibold">
                        I agree to the terms and conditions
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                className="w-full bg-green-600 text-white hover:bg-green-500"
                onClick={handleAcceptTerms}
                disabled={!formData.termsAccepted}
              >
                Accept Terms and Continue
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
          <p className="text-gray-600 text-center">
            Enter your personal details to create your profile.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                      <Input placeholder="Doe" {...field} />
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
                      <Input placeholder="john.doe@example.com" {...field} />
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
                    <FormLabel>Instagram User</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="123-456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneCountryCode"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country: any) => (
                            <SelectItem
                              key={country.id}
                              value={country.phone_code}
                            >
                              {country.name} ({country.phone_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-500"
                disabled={updateInvitationStatusMutation.isPending}
              >
                {updateInvitationStatusMutation.isPending ? "Submitting..." : "Create Profile"}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default Page;
