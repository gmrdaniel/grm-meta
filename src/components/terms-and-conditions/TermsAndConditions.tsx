import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function TermsCheckbox({
  formData,
  onCheckboxChange,
  onAcceptTerms,
  formType, // Nueva prop para identificar el formulario
}: {
  formData: { termsAccepted: boolean };
  onCheckboxChange: (checked: boolean) => void;
  onAcceptTerms: () => void;
  formType: "pinterest" | "meta"; // Define los posibles tipos de formulario
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const renderTermsContent = () => {
    if (formType === "pinterest") {
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Términos y Condiciones del Sorteo</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96 text-sm space-y-4 pt-2 pr-2">
            <p>
              <strong>1. Organizador</strong>
              <br />
              Este sorteo es organizado por La Neta, en colaboración con
              Pinterest, con el objetivo de atraer nuevos creadores de contenido
              en Hispanic LATAM (México, Colombia, Argentina, Chile y Perú).
            </p>
            <p>
              <strong>2. Participación</strong>
              <br />
              Podrán participar en este sorteo únicamente aquellas personas que
              cumplan los siguientes requisitos:
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>Ser mayor de edad en su país de residencia.</li>
              <li>
                Tener una cuenta activa de Instagram con contenido relacionado a
                una o varias de las siguientes verticales: decoración, bodas,
                recetas, moda, belleza, lifestyle, viajes y bienestar.
              </li>
              <li>No haber tenido una cuenta de Pinterest anteriormente ni haber colaborado con Pinterest en el pasado.</li>
              <li>Crear una cuenta nueva de Pinterest.</li>
              <li>Conectar su cuenta de Instagram con Pinterest.</li>
              <li>Aceptar la función de autopublicación de contenido de los últimos 90 días desde Instagram a Pinterest.</li>
              <li>Asistir al webinar oficial organizado por Pinterest.</li>
            </ul>
            <p>
              <strong>3. Vigencia</strong>
              <br />
              El período de participación finaliza el 15 de mayo. Solo se tomarán
              en cuenta los registros completados durante este periodo.
            </p>
            <p>
              <strong>4. Premios</strong>
              <br />
              Los premios serán los siguientes:
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>1 (un) ganador recibirá una tarjeta de regalo Amazon de $1,000 USD.</li>
              <li>10 (diez) participantes adicionales recibirán tarjetas de regalo Amazon de $100 USD cada uno.</li>
            </ul>
            <p>
              Los premios no son transferibles, no se podrán cambiar por dinero en
              efectivo ni sustituir por ningún otro beneficio.
            </p>
            <p>
              <strong>5. Selección de Ganadores</strong>
              <br />
              Los ganadores serán seleccionados de manera aleatoria entre todos
              los participantes que hayan completado correctamente todos los
              pasos del programa. Los ganadores serán notificados por correo
              electrónico y tendrán un plazo de 5 días hábiles para aceptar su
              premio. En caso de no recibir respuesta, se seleccionará a un nuevo
              ganador.
            </p>
            <p>
              <strong>6. Responsabilidad</strong>
              <br />
              La participación en este sorteo implica la aceptación de estos
              términos y condiciones. La Neta y Pinterest no se hacen
              responsables por fallos técnicos, interrupciones de servicio o
              problemas ajenos al control de los organizadores.
            </p>
            <p>
              <strong>7. Protección de Datos</strong>
              <br />
              La información proporcionada por los participantes será utilizada
              únicamente con fines de validación de participación y contacto de
              ganadores. Se manejará de acuerdo con la política de privacidad de
              La Neta.
            </p>
            <p>
              <strong>8. Aceptación</strong>
              <br />
              Al participar en este sorteo, los usuarios aceptan completamente
              estos Términos y Condiciones.
            </p>
            <p>
              <strong>9. Consentimiento para el Uso de Datos</strong>
              <br />
              Al participar en este programa, el usuario acepta y autoriza
              expresamente que La Neta, en colaboración con Pinterest, recopile y
              utilice los datos proporcionados en el formulario de inscripción,
              así como aquellos derivados de su actividad en la plataforma
              Pinterest, con fines de análisis, seguimiento y optimización del
              programa. Esto incluye, pero no se limita a: nombre, correo
              electrónico, cuenta de Instagram vinculada, cuenta de Pinterest
              creada, estadísticas de contenido compartido y comportamiento
              dentro de Pinterest.
            </p>
            <p>
              Esta información será tratada de manera confidencial y utilizada
              exclusivamente para mejorar la experiencia del participante,
              verificar el cumplimiento de los requisitos del programa y diseñar
              futuras iniciativas para creadores de contenido. En ningún caso
              será vendida o compartida con terceros ajenos al programa.
            </p>
            <div className="flex justify-center">
              <button
                className="text-pink-800 hover:font-semibold mt-4"
                onClick={() => {
                  setIsDialogOpen(false);
                  onAcceptTerms(); // Llama al callback para marcar el checkbox
                }}
              >
                Aceptar términos y condiciones
              </button>
            </div>
          </div>
        </DialogContent>
      );
    } else {
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96 text-sm space-y-4 pt-2 pr-2">
            <p>Please review and accept the terms below to continue:</p>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                <strong>Monetization Program & Benefits Disclaimer</strong>
                <p className="mt-2 text-justify">
                  By participating in this onboarding process, you acknowledge
                  that monetization opportunities, payments, and benefits,
                  including Breakthrough Bonuses and Meta Verified, are provided
                  directly by Meta (Facebook/Instagram). Any related program
                  benefits, payment details, timelines, and terms of
                  participation are subject to change by Meta at any time.
                </p>
                <p className="mt-2 text-justify">
                  Global Media Review Inc. (our agency) is not responsible for any
                  changes, adjustments, missing payments, or modifications in
                  program terms made by Meta. Meta reserves the right to change
                  or discontinue benefits without prior notice. We (the agency)
                  assume no responsibility or liability for the payments,
                  benefits, or decisions made by Meta.
                </p>
              </li>
              <li>
                <strong>Consent for Communication & Data Usage</strong>
                <p className="mt-2 text-justify">
                  By completing this onboarding form, you explicitly authorize
                  and grant us (the agency) permission to contact you directly
                  via:
                </p>
                <ul className="list-disc list-inside pl-4 mt-4">
                  <li>Email</li>
                  <li>SMS/Text Messages</li>
                  <li>WhatsApp</li>
                  <li>
                    Direct Messages (Instagram, Messenger, or similar channels)
                  </li>
                </ul>
                <p className="mt-4 text-justify">
                  to share creator-related opportunities, updates, collaboration
                  proposals, and promotional materials. You also explicitly
                  consent to our storage, processing, and use of your provided
                  personal and professional data, including but not limited to:
                </p>
                <ul className="list-disc list-inside pl-4 mt-4">
                  <li>Fisrt Name</li>
                  <li>Email Address</li>
                  <li>Phone Number</li>
                  <li>
                    Social Media Usernames (Instagram, Facebook, TikTok, YouTube,
                    and others provided)
                  </li>
                  <li>Audience Metrics, engagement rate, and follower counts</li>
                </ul>
                <p className="mt-2 text-justify">
                  You further authorize us to share your provided information
                  with trusted third-party partners and brands for the purpose of
                  facilitating creator partnerships, marketing opportunities, or
                  similar commercial engagements.
                </p>
              </li>
              <li>
                <strong>Content Rights, Tips & Resources Disclaimer</strong>
                <p className="mt-2 text-justify">
                  All content you create and submit to platforms (including
                  Facebook and Instagram) is your sole responsibility. You must
                  ensure:
                </p>
                <ul className="list-disc list-inside pl-4 mt-4">
                  <li>
                    You own or possess appropriate rights and clearances for all
                    content posted.
                  </li>
                  <li className="mt-2 text-justify">
                    The provided creator tips, resources, and tools are for
                    guidance purposes only and do not guarantee audience growth
                    or monetization results.
                  </li>
                </ul>
                <p className="mt-4 text-justify">
                  We (the agency) explicitly disclaim liability for any claims,
                  disputes, copyright infringement, or legal consequences
                  related to your content.
                </p>
              </li>
              <li>
                <strong>Modification & Termination Rights</strong>
                <p className="mt-2">We reserve the right to:</p>
                <ul className="list-disc list-inside pl-4 mt-4">
                  <li>
                    Modify, suspend, or terminate this onboarding process at our
                    sole discretion.
                  </li>
                  <li className="mt-2">
                    Update or modify eligibility criteria, terms, and
                    conditions, or any aspect of the onboarding process by
                    providing notice via email or SMS.
                  </li>
                </ul>
              </li>
            </ol>
            <p className="text-justify">
              <strong>Your Agreement</strong>
              <br />
              By clicking "Complete My Onboarding", you acknowledge and agree to
              these terms in their entirety.
            </p>

            <p className="text-justify">
              <div className="flex justify-center">
                <button
                  className="text-blue-800 hover:font-semibold mt-4"
                  onClick={() => {
                    setIsDialogOpen(false);
                    onAcceptTerms(); // Llama al callback para marcar el checkbox
                  }}
                >
                  Accept Terms & Complete My Onboarding
                </button>
              </div>
            </p>
          </div>
        </DialogContent>
      );
    }
  };

  const termsText = formType === "pinterest" ? "términos y condiciones" : "terms and conditions";
  const termsColor = formType === "pinterest" ? "text-pink-600" : "text-blue-600";

  return (
    <div className="flex items-start space-x-2 pt-4">
      <Checkbox
        id="termsAccepted"
        checked={formData.termsAccepted}
        onCheckedChange={onCheckboxChange}
      />
      <label
        htmlFor="termsAccepted"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {formType === "pinterest" ? "Acepto los " : "I accept the "}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`${termsColor} hover:underline p-0 m-0 bg-transparent inline underline`}
            >
              {termsText}
            </button>
          </DialogTrigger>
          {renderTermsContent()}
        </Dialog>
      </label>
    </div>
  );
}