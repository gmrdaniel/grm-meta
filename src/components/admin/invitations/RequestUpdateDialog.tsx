import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

type NotificationSetting = {
  id: string;
  type: string;
  subject: string;
  message: string;
  channel: "email" | "sms";
};

interface RequestUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: string;
  email: string;
  name: string;
  invitation_id?: string; // Add this new prop
}

export function RequestUpdateDialog({
  isOpen,
  onOpenChange,
  project,
  email,
  name,
  invitation_id, 
}: RequestUpdateDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateMessage, setTemplateMessage] = useState<string>("");
  const [templateSubject, setTemplateSubject] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [testEmail, setTestEmail] = useState<string>("");

  // Obtener las notificaciones de tipo "notice"
  const { data: noticeTemplates, isLoading } = useQuery({
    queryKey: ["notice-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("id, type, subject, message, channel, template_id")
        .eq("type", "notice")
        .eq("channel", "email")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as NotificationSetting[];
    },
  });

  useEffect(() => {
    if (selectedTemplate && noticeTemplates) {
      const template = noticeTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setTemplateMessage(template.message);
        setTemplateSubject(template.subject || "Update Request");
      }
    }
  }, [selectedTemplate, noticeTemplates]);

  // Function to get the HTML template
  const fetchEmailTemplateHtml = async (templateId: string) => {
    const { data, error } = await supabase
      .from("email_templates")
      .select("html")
      .eq("id", templateId)
      .single();
  
    if (error) throw error;
    return data.html;
  };

  // Function to combine the template with custom content
  const combineTemplateWithContent = (templateHtml: string, content: string) => {
    return templateHtml.replace("{{content}}", content);
  };

  // Function to send the test email
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    setIsSending(true);
    try {
      // Get the selected template
      const template = noticeTemplates?.find(t => t.id === selectedTemplate);
      
      if (!template) {
        throw new Error("Selected template not found");
      }
      
      let finalHtml = templateMessage;
      
      // If there's an associated template_id, get the HTML template and combine it with the message
      if (template.template_id) {
        const templateHtml = await fetchEmailTemplateHtml(template.template_id);
        finalHtml = combineTemplateWithContent(templateHtml, templateMessage);
      }
  
      // Direct call to Supabase mailjet function
      const { data, error } = await supabase.functions.invoke("mailjet", {
        body: {
          email: testEmail, // Test email entered by the user
          subject: templateSubject,
          html: finalHtml,
          variables: {}
        },
      });
  
      if (error) throw error;
  
      toast.success(`Test email successfully sent to ${testEmail}`);
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error(`Error sending test email: ${error.message || "Unknown error"}`);
    } finally {
      setIsSending(false);
    }
  };

  // Función para enviar la notificación
  const handleSendNotice = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
  
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
  
    setIsSending(true);
    try {
      // Obtener el template seleccionado
      const template = noticeTemplates?.find(t => t.id === selectedTemplate);
      
      if (!template) {
        throw new Error("Selected template not found");
      }
      
      let finalHtml = templateMessage;
      
      // Si hay un template_id asociado, obtener la plantilla HTML y combinarla con el mensaje
      if (template.template_id) {
        const templateHtml = await fetchEmailTemplateHtml(template.template_id);
        finalHtml = combineTemplateWithContent(templateHtml, templateMessage);
      }
  
      // Llamada directa a la función de Supabase mailjet
      const { data, error } = await supabase.functions.invoke("mailjet", {
        body: {
          email: email, // Email del destinatario (de las props)
          subject: templateSubject,
          html: finalHtml,
          variables: {}
        },
      });
  
      if (error) throw error;
  
      // After successfully sending the notification, add a row to invitation_fixing table
      if (invitation_id) {
        const { error: fixingError } = await supabase
          .from('invitation_fixing')
          .insert({
            invitation_id: invitation_id,
            reason: reason, // This is the enum value: 'profile', 'page', or 'other'
            description: templateMessage, 
            is_fixed: false // Default value
          });
        
        if (fixingError) {
          console.error("Error adding record to invitation_fixing:", fixingError);
          toast.error(`Error recording update request: ${fixingError.message}`);
        } else {
          toast.success("Notification sent and update request recorded");
        }
      } else {
        toast.success("Notification sent successfully");
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error al enviar notificación:", error);
      toast.error(`Error al enviar notificación: ${error.message || "Error desconocido"}`);
    } finally {
      setIsSending(false);
    }
  };

  // Función para alternar el modo de prueba
  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    if (!isTestMode) {
      // Al activar el modo de prueba, inicializar el correo de prueba con el correo actual
      setTestEmail("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Update</DialogTitle>
        </DialogHeader>
        
        {/* Invitation Information */}
        <div className="bg-gray-50 p-2 rounded-md mb-2">
          <h3 className="font-medium text-sm mb-1">Invitation Information:</h3>
          <div className="grid grid-cols-1 gap-1 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span> 
              <span>{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span> 
              <span>{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Project:</span> 
              <span className="font-medium">{project}</span>
            </div>
          </div>
        </div>
        
        {/* Toggle for test mode */}
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="test-mode" className="font-medium">
            Test Mode
          </Label>
          <Switch
            id="test-mode"
            checked={isTestMode}
            onCheckedChange={toggleTestMode}
          />
        </div>
        
        {/* Test email field (only visible in test mode) */}
        {isTestMode && (
          <div className="grid grid-cols-4 items-center gap-2 mb-2">
            <Label htmlFor="test-email" className="text-right font-medium col-span-1">
              Test Email
            </Label>
            <div className="col-span-3">
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Email to send the test"
              />
            </div>
          </div>
        )}
        
        <div className="grid gap-2 py-2">
          {/* Reason selector */}
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="reason" className="text-right font-medium col-span-1">
              Reason
            </Label>
            <div className="col-span-3">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Incorrectly registered profile</SelectItem>
                  <SelectItem value="page">Incorrectly registered page</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template selector */}
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="template" className="text-right font-medium col-span-1">
              Template
            </Label>
            <div className="col-span-3">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading templates...
                    </SelectItem>
                  ) : noticeTemplates && noticeTemplates.length > 0 ? (
                    noticeTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.subject || "No subject"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No templates available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Field to edit the template subject */}
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="subject" className="text-right font-medium col-span-1">
              Subject
            </Label>
            <div className="col-span-3">
              <Input
                id="subject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
          </div>

          {/* Textarea to edit the template message */}
          <div className="grid grid-cols-4 items-start gap-2">
            <Label htmlFor="message" className="text-right font-medium col-span-1 pt-2">
              Message
            </Label>
            <div className="col-span-3">
              <Textarea
                id="message"
                value={templateMessage}
                onChange={(e) => setTemplateMessage(e.target.value)}
                placeholder="Selected template content"
                rows={4}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between pt-2">
          {isTestMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTestMode(false)}
              >
                Cancel Test
              </Button>
              <Button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSending}
              >
                Send Test
              </Button>
            </>
          ) : (
            <>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSendNotice}
                  disabled={isSending}
                >
                  Send Notice
                </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}