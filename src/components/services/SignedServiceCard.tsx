
import { Button } from "@/components/ui/button";
import type { PendingService } from "@/types/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TermsContent } from "./TermsContent";

interface SignedServiceCardProps {
  service: PendingService;
}

export function SignedServiceCard({ service }: SignedServiceCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-base font-medium text-gray-900">{service.name}</h4>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Ver términos firmados
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Términos y Condiciones Firmados - {service.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <TermsContent terms_conditions={service.terms_conditions} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Firmado
          </span>
          <span className="text-xs text-gray-500">
            {new Date(service.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
