import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { createProfile } from "@/services/profile-content-categories/creatorProfileService";
import { updateInvitationStatus } from "@/services/invitation/updateInvitation";
import { useInvitationLoader } from "@/hooks/use-invitationLoader";

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
  const router = useRouter();
  const { invitation_code } = router.query;
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, termsAccepted: e.target.checked });
    form.setValue("termsAccepted", e.target.checked);
  };

  const handleAcceptTerms = () => {
    if (formData.termsAccepted) {
      goToNextStep({
        currentStep,
        stepList,
        setCurrentStep,
        projectStages,
        invitation,
      });
    } else {
      toast.error("You must accept the terms and conditions.");
    }
  };

  const mutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      toast.success("Profile created successfully!");
      updateInvitationStatusMutation.mutate({
        id: invitation.id,
        status: "completed",
      });
    },
    onError: (error: any) => {
      toast.error(`Something went wrong! ${error.message}`);
    },
  });

  const updateInvitationStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return updateInvitationStatus(id, status as any);
    },
    onSuccess: () => {
      toast.success("Invitation completed!");
      if (invitation?.projects?.slug) {
        router.push(`/${invitation?.projects?.slug}/success`);
      } else {
        router.push(`/success`);
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

  const handleSubmit = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    instagramUser: string;
    termsAccepted: boolean;
    phoneNumber: string;
  } & { phoneCountryCode: string; phoneVerified: boolean }) => {
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
                        onCheckedChange={field.onChange}
                        onValueChange={handleCheckboxChange}
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
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "Create Profile"}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default Page;
