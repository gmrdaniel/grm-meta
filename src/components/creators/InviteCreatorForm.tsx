import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { InvitationsTable } from "./InvitationsTable";

interface InviteCreatorFormProps {
  onInviteSent: () => void;
}

const inviteCreatorFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  service_id: z.string().min(1, { message: "Please select a service" }),
});

type InviteCreatorFormValues = z.infer<typeof inviteCreatorFormSchema>;

export function InviteCreatorForm({ onInviteSent }: InviteCreatorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);

  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<InviteCreatorFormValues>({
    resolver: zodResolver(inviteCreatorFormSchema),
    defaultValues: {
      email: "",
      service_id: "",
    },
  });

  async function onSubmit(values: InviteCreatorFormValues) {
    setIsSubmitting(true);
    try {
      const { data: invitation, error } = await supabase
        .from("creator_invitations")
        .insert({
          email: values.email,
          service_id: values.service_id,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select("token")
        .single();

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/auth?invitation=${invitation.token}`;
      setInvitationUrl(inviteUrl);

      console.log("Sending invitation email to:", values.email);
      console.log("Invitation URL:", inviteUrl);

      try {
        const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: values.email,
            invitationUrl: inviteUrl,
          },
        });

        if (emailError) {
          console.error("Email sending error:", emailError);
          throw new Error(`Error sending email: ${emailError.message}`);
        }
        
        toast.success("Invitation sent successfully");
        form.reset();
        onInviteSent();
      } catch (emailError: any) {
        console.error("Error sending invitation email:", emailError);
        toast.error(`Error sending email: ${emailError.message}`);
      }
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="p-6 bg-white rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Send New Invitation</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id || "default"}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting || isServicesLoading}>
              {isSubmitting
                ? "Submitting..."
                : isServicesLoading
                ? "Loading services..."
                : "Invite Creator"}
            </Button>
          </form>
        </Form>

        {invitationUrl && (
          <div className="mt-4 p-4 rounded-md bg-gray-100">
            <p className="text-sm text-gray-500">Invitation URL:</p>
            <Input type="text" value={invitationUrl} readOnly className="mt-2" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Sent Invitations</h2>
        </div>
        <div className="p-6">
          <InvitationsTable />
        </div>
      </div>
    </div>
  );
}
