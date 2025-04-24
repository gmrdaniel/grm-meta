import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CountrySelect } from "@/components/pinterest/CountrySelect";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

interface Template {
  id: string;
  name: string;
  message: string;
}

export function TwilioSMSForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [linkInvitation, setLinkInvitation] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const queryClient = useQueryClient();

  const { data: templates } = useQuery<Template[]>({
    queryKey: ['sms_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('id, name, message')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleCountrySelect = (_countryId: string, code: string) => {
    setPhoneCode(code);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      let processedMessage = template.message;
      
      // Replace variables only if they have values
      if (name) {
        processedMessage = processedMessage.replace("{nombre}", name);
      }
      if (linkInvitation) {
        processedMessage = processedMessage.replace("{link_invitation}", linkInvitation);
      }
      
      // Replace remaining placeholders with empty strings if no values
      processedMessage = processedMessage.replace("{nombre}", name || "");
      processedMessage = processedMessage.replace("{link_invitation}", linkInvitation || "");
      
      setMessage(processedMessage);
    }
  };

  const updateMessageWithVariables = (templateId: string, newName: string, newLink: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      let processedMessage = template.message;
      
      // Replace variables only if they have values
      if (newName) {
        processedMessage = processedMessage.replace("{nombre}", newName);
      }
      if (newLink) {
        processedMessage = processedMessage.replace("{link_invitation}", newLink);
      }
      
      // Replace remaining placeholders with empty strings if no values
      processedMessage = processedMessage.replace("{nombre}", newName || "");
      processedMessage = processedMessage.replace("{link_invitation}", newLink || "");
      
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
          <div>
            <Label htmlFor="template">Plantilla</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plantilla" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="country">Código de país</Label>
            <CountrySelect
              onSelect={handleCountrySelect}
              className="w-full"
              placeholder="Seleccionar país"
            />
          </div>

          <div>
            <Label htmlFor="phone">Número de teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="123456789"
              required
            />
          </div>

          {hasNameVariable && (
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setName(newName);
                  updateMessageWithVariables(selectedTemplateId, newName, linkInvitation);
                }}
                placeholder="Juan Pérez"
              />
            </div>
          )}

          {hasLinkVariable && (
            <div>
              <Label htmlFor="link">Link de invitación</Label>
              <Input
                id="link"
                value={linkInvitation}
                onChange={(e) => {
                  const newLink = e.target.value;
                  setLinkInvitation(newLink);
                  updateMessageWithVariables(selectedTemplateId, name, newLink);
                }}
                placeholder="https://example.com/invitation/123"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="min-h-[100px]"
              required
            />
          </div>
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
