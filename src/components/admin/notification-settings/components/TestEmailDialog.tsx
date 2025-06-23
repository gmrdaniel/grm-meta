import { useState } from "react";
import { Mail } from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface TestEmailDialogProps {
  subject: string;
  message: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestEmailDialog({ subject, message, isOpen, onOpenChange }: TestEmailDialogProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error("Por favor, ingresa un correo electrónico");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("mailjet", {
        body: {
          email,
          subject,
          html: message,
          variables: {}
        },
      });

      if (error) throw error;

      toast.success("Correo de prueba enviado correctamente");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al enviar correo de prueba:", error);
      toast.error(`Error al enviar correo de prueba: ${error.message || "Error desconocido"}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar correo de prueba</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="test-email" className="text-right font-medium col-span-1">
              Correo
            </label>
            <div className="col-span-3">
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa un correo electrónico"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSendTestEmail} 
            disabled={isSending}
          >
            {isSending ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}