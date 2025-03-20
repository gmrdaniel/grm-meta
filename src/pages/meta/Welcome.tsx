
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function WelcomePage() {
  const { invitationId } = useParams<{ invitationId?: string }>();
  const [invitation, setInvitation] = useState<{ email?: string; full_name?: string } | null>(null);
  const [loading, setLoading] = useState(invitationId !== undefined);

  useEffect(() => {
    async function fetchInvitationDetails() {
      if (!invitationId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("bulk_creator_invitation_details")
          .select("email, full_name")
          .eq("id", invitationId)
          .single();

        if (error) throw error;
        setInvitation(data);
      } catch (error: any) {
        console.error("Error fetching invitation:", error.message);
        toast.error("No pudimos encontrar la invitación solicitada");
      } finally {
        setLoading(false);
      }
    }

    fetchInvitationDetails();
  }, [invitationId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-lg">
        <Card className="w-full border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">¡Bienvenido a la plataforma!</CardTitle>
            <CardDescription>
              {invitationId && loading ? (
                "Cargando información de la invitación..."
              ) : invitation ? (
                <>Hola {invitation.full_name || invitation.email}</>
              ) : (
                "Descubre todas las posibilidades"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="flex justify-center">
              <img
                src="/public/og-image.png"
                alt="Logo"
                className="h-16 w-auto"
              />
            </div>
            
            <div className="space-y-2 text-center">
              <h3 className="font-medium">Una plataforma diseñada para ti</h3>
              <p className="text-sm text-gray-500">
                Accede a todas las herramientas y servicios que necesitas en un solo lugar.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  {invitation ? (
                    "Ya tienes una cuenta creada en nuestra plataforma. Inicia sesión para comenzar."
                  ) : (
                    "Regístrate para acceder a todas las funcionalidades."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link to="/auth">
                {invitation ? "Iniciar sesión" : "Crear cuenta"}
              </Link>
            </Button>
            
            {!invitation && (
              <p className="text-xs text-gray-500 text-center">
                ¿Ya tienes una cuenta? <Link to="/auth" className="text-blue-600 underline">Inicia sesión</Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
