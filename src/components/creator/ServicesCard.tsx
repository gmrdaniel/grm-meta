
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Service {
  id: string;
  name: string;
  type: 'único' | 'recurrente' | 'contrato';
  description: string | null;
}

interface CreatorService {
  id: string;
  service: Service;
  status: string;
  start_date: string;
  end_date: string | null;
  monthly_fee: number | null;
  company_share: number | null;
  total_revenue: number | null;
}

interface ServicesCardProps {
  creatorServices: CreatorService[];
  availableServices: Service[];
  selectedServiceId: string;
  onServiceSelect: (id: string) => void;
  onAddService: () => void;
  addingService: boolean;
}

export function ServicesCard({
  creatorServices,
  availableServices,
  selectedServiceId,
  onServiceSelect,
  onAddService,
  addingService,
}: ServicesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {creatorServices.length > 0 && (
          <div className="space-y-4">
            {creatorServices.map((creatorService) => (
              <div key={creatorService.id} className="border p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">{creatorService.service.name}</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="font-medium text-gray-500">Type</dt>
                    <dd className="capitalize">{creatorService.service.type}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Status</dt>
                    <dd className="capitalize">{creatorService.status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Start Date</dt>
                    <dd>{new Date(creatorService.start_date).toLocaleDateString()}</dd>
                  </div>
                  {creatorService.end_date && (
                    <div>
                      <dt className="font-medium text-gray-500">End Date</dt>
                      <dd>{new Date(creatorService.end_date).toLocaleDateString()}</dd>
                    </div>
                  )}
                  {creatorService.monthly_fee && (
                    <div>
                      <dt className="font-medium text-gray-500">Monthly Fee</dt>
                      <dd>${creatorService.monthly_fee}</dd>
                    </div>
                  )}
                  {creatorService.company_share && (
                    <div>
                      <dt className="font-medium text-gray-500">Company Share</dt>
                      <dd>{creatorService.company_share}%</dd>
                    </div>
                  )}
                  {creatorService.total_revenue && (
                    <div>
                      <dt className="font-medium text-gray-500">Total Revenue</dt>
                      <dd>${creatorService.total_revenue}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Add New Service</h3>
          <div className="flex gap-4">
            <Select value={selectedServiceId} onValueChange={onServiceSelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {availableServices
                  .filter(service => !creatorServices.some(cs => cs.service.id === service.id))
                  .map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={onAddService} 
              disabled={addingService || !selectedServiceId}
            >
              {addingService ? "Adding..." : "Add Service"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
