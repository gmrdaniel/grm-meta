
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CountrySelect } from "@/components/pinterest/CountrySelect";
import { supabase } from "@/integrations/supabase/client";

export function TwilioSMSForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleCountrySelect = (_countryId: string, code: string) => {
    setPhoneCode(code);
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
          message
        }
      });

      if (error) throw error;

      toast.success("SMS sent successfully!");
      setPhoneNumber("");
      setName("");
      setMessage("");
    } catch (error: any) {
      toast.error(`Error sending SMS: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Envío de SMS con Twilio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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

          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </div>

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
