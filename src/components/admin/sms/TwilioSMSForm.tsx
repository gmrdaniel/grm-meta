
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTemplates } from "@/hooks/useTemplates";
import { PhoneInput } from "./PhoneInput";
import { TemplateSelector } from "./TemplateSelector";
import { MessageVariables } from "./MessageVariables";
import { MessagePreview } from "./MessagePreview";

export function TwilioSMSForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [linkInvitation, setLinkInvitation] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const queryClient = useQueryClient();
  const { data: templates } = useTemplates();

  const updateMessageWithVariables = (templateId: string, newName: string, newLink: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      let processedMessage = template.message;
      
      if (newName) {
        processedMessage = processedMessage.replace("{nombre}", newName);
      }
      if (newLink) {
        processedMessage = processedMessage.replace("{link_invitation}", newLink);
      }
      
      processedMessage = processedMessage.replace("{nombre}", newName || "");
      processedMessage = processedMessage.replace("{link_invitation}", newLink || "");
      
      setMessage(processedMessage);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      let processedMessage = template.message;
      
      if (name) {
        processedMessage = processedMessage.replace("{nombre}", name);
      }
      if (linkInvitation) {
        processedMessage = processedMessage.replace("{link_invitation}", linkInvitation);
      }
      
      processedMessage = processedMessage.replace("{nombre}", name || "");
      processedMessage = processedMessage.replace("{link_invitation}", linkInvitation || "");
      
      setMessage(processedMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumber,
          countryCode: phoneCode,
          name,
          message,
          templateId: selectedTemplateId
        }
      });

      if (error) throw error;

      toast.success("SMS enviado exitosamente!");
      setPhoneNumber("");
      setName("");
      setMessage("");
      setLinkInvitation("");
      queryClient.invalidateQueries({ queryKey: ['sms_logs'] });
    } catch (error: any) {
      toast.error(`Error enviando SMS: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTemplate = templates?.find(t => t.id === selectedTemplateId);
  const hasNameVariable = currentTemplate?.message.includes("{nombre}");
  const hasLinkVariable = currentTemplate?.message.includes("{link_invitation}");

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Envío de SMS con Twilio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onTemplateSelect={handleTemplateSelect}
          />

          <PhoneInput
            phoneCode={phoneCode}
            phoneNumber={phoneNumber}
            onPhoneCodeChange={setPhoneCode}
            onPhoneNumberChange={setPhoneNumber}
          />

          <MessageVariables
            hasNameVariable={hasNameVariable}
            hasLinkVariable={hasLinkVariable}
            name={name}
            linkInvitation={linkInvitation}
            onNameChange={(newName) => {
              setName(newName);
              updateMessageWithVariables(selectedTemplateId, newName, linkInvitation);
            }}
            onLinkChange={(newLink) => {
              setLinkInvitation(newLink);
              updateMessageWithVariables(selectedTemplateId, name, newLink);
            }}
          />

          <MessagePreview
            message={message}
            onChange={setMessage}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar SMS"}
        </Button>
      </form>
    </div>
  );
}
