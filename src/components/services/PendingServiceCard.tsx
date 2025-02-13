
import { Button } from "@/components/ui/button";
import { TermsContent } from "./TermsContent";
import type { PendingService } from "@/types/services";

interface PendingServiceCardProps {
  service: PendingService;
  onAcceptTerms: (creatorServiceId: string, serviceName: string, terms_conditions: string | null) => void;
  loading: boolean;
}

export function PendingServiceCard({ service, onAcceptTerms, loading }: PendingServiceCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="space-y-3">
        <div>
          <h4 className="text-base font-medium text-gray-900">{service.name}</h4>
        </div>
        
        <TermsContent terms_conditions={service.terms_conditions} />

        {!service.terms_accepted && (
          <>
            <p className="text-[0.7rem] text-gray-500">
              Please review and accept the terms for this service
            </p>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => onAcceptTerms(service.creator_service_id, service.name, service.terms_conditions)}
                disabled={loading}
              >
                Accept Terms & Conditions
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
