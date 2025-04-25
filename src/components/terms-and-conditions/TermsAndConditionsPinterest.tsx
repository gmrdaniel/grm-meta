import { useState } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export function TermsCheckboxPinterest({
  formData,
  onCheckboxChange,
  onAcceptTerms,
}: {
  formData: { termsAccepted: boolean };
  onCheckboxChange: (checked: boolean) => void;
  onAcceptTerms: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        Acepto los{" "}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-pink-600 hover:underline p-0 m-0 bg-transparent inline underline"
            >
              términos y condiciones
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Términos y Condiciones del Sorteo</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-96 text-sm space-y-4 pt-2 pr-2">
              <p>
                <strong>1. Organizador</strong>
                <br />
                Este sorteo es organizado por La Neta, en colaboración con Pinterest, con el objetivo de atraer nuevos creadores de contenido en Hispanic LATAM (México, Colombia, Argentina, Chile y Perú).
              </p>
              <p>
                <strong>2. Participación</strong>
                <br />
                Podrán participar en este sorteo únicamente aquellas personas que cumplan los siguientes requisitos:
              </p>
              <ul className="list-disc list-inside pl-4">
                <li>Ser mayor de edad en su país de residencia.</li>
                <li>
                  Tener una cuenta activa de Instagram con contenido relacionado a una o varias de las siguientes verticales: decoración, bodas, recetas, moda, belleza, lifestyle, viajes y bienestar.
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
                El período de participación finaliza el 15 de mayo. Solo se tomarán en cuenta los registros completados durante este periodo.
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
                Los premios no son transferibles, no se podrán cambiar por dinero en efectivo ni sustituir por ningún otro beneficio.
              </p>
              <p>
                <strong>5. Selección de Ganadores</strong>
                <br />
                Los ganadores serán seleccionados de manera aleatoria entre todos los participantes que hayan completado correctamente todos los pasos del programa. 
                Los ganadores serán notificados por correo electrónico y tendrán un plazo de 5 días hábiles para aceptar su premio. En caso de no recibir respuesta, se seleccionará a un nuevo ganador.
              </p>
              <p>
                <strong>6. Responsabilidad</strong>
                <br />
                La participación en este sorteo implica la aceptación de estos términos y condiciones. La Neta y Pinterest no se hacen responsables por fallos técnicos, interrupciones de servicio o problemas ajenos al control de los organizadores.
              </p>
              <p>
                <strong>7. Protección de Datos</strong>
                <br />
                La información proporcionada por los participantes será utilizada únicamente con fines de validación de participación y contacto de ganadores. Se manejará de acuerdo con la política de privacidad de La Neta.
              </p>
              <p>
                <strong>8. Aceptación</strong>
                <br />
                Al participar en este sorteo, los usuarios aceptan completamente estos Términos y Condiciones.
              </p>
              <p>
                <strong>9. Consentimiento para el Uso de Datos</strong>
                <br />
                Al participar en este programa, el usuario acepta y autoriza expresamente que La Neta, en colaboración con Pinterest, recopile y utilice los datos proporcionados en el formulario de inscripción, así como aquellos derivados de su actividad en la plataforma Pinterest, con fines de análisis, seguimiento y optimización del programa. Esto incluye, pero no se limita a: nombre, correo electrónico, cuenta de Instagram vinculada, cuenta de Pinterest creada, estadísticas de contenido compartido y comportamiento dentro de Pinterest.
              </p>
              <p>
                Esta información será tratada de manera confidencial y utilizada exclusivamente para mejorar la experiencia del participante, verificar el cumplimiento de los requisitos del programa y diseñar futuras iniciativas para creadores de contenido. En ningún caso será vendida o compartida con terceros ajenos al programa.
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
        </Dialog>
      </label>
    </div>
  );
}