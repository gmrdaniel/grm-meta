import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreatorDetail {
  id: string;
  created_at: string;
  personal_data?: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
    birth_date: string | null;
    country_of_residence: string | null;
    state_of_residence: string | null;
    phone_number: string | null;
    gender: string | null;
    category: string | null;
  };
  bank_details?: {
    beneficiary_name: string;
    payment_method: "bank_transfer" | "paypal";
    country: string;
    bank_account_number: string | null;
    iban: string | null;
    swift_bic: string | null;
    bank_name: string | null;
    bank_address: string | null;
    routing_number: string | null;
    clabe: string | null;
    paypal_email: string | null;
  };
}

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

export default function CreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatorServices, setCreatorServices] = useState<CreatorService[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    fetchCreatorDetail();
    fetchCreatorServices();
    fetchAvailableServices();
  }, [id]);

  async function fetchCreatorDetail() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          created_at,
          personal_data (
            first_name,
            last_name,
            instagram_username,
            birth_date,
            country_of_residence,
            state_of_residence,
            phone_number,
            gender,
            category
          ),
          bank_details (
            beneficiary_name,
            payment_method,
            country,
            bank_account_number,
            iban,
            swift_bic,
            bank_name,
            bank_address,
            routing_number,
            clabe,
            paypal_email
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setCreator(data);
    } catch (error: any) {
      toast.error("Error fetching creator details");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCreatorServices() {
    try {
      const { data, error } = await supabase
        .from("creator_services")
        .select(`
          id,
          status,
          start_date,
          end_date,
          monthly_fee,
          company_share,
          total_revenue,
          service:services (
            id,
            name,
            type,
            description
          )
        `)
        .eq("profile_id", id);

      if (error) throw error;
      setCreatorServices(data || []);
    } catch (error: any) {
      toast.error("Error fetching creator services");
      console.error("Error:", error.message);
    }
  }

  async function fetchAvailableServices() {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, type, description")
        .order("name");

      if (error) throw error;
      setAvailableServices(data || []);
    } catch (error: any) {
      toast.error("Error fetching available services");
      console.error("Error:", error.message);
    }
  }

  async function handleAddService() {
    if (!selectedServiceId) {
      toast.error("Please select a service");
      return;
    }

    setAddingService(true);
    try {
      const { error } = await supabase
        .from("creator_services")
        .insert({
          profile_id: id,
          service_id: selectedServiceId,
          status: 'pendiente'
        });

      if (error) throw error;
      
      toast.success("Service added successfully");
      fetchCreatorServices();
      setSelectedServiceId("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAddingService(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!creator) {
    return <div>Creator not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/admin/creators">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Creators
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="font-medium text-gray-500">First Name</dt>
                      <dd>{creator.personal_data?.first_name || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Last Name</dt>
                      <dd>{creator.personal_data?.last_name || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Instagram Username</dt>
                      <dd>{creator.personal_data?.instagram_username || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Birth Date</dt>
                      <dd>{creator.personal_data?.birth_date || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Country</dt>
                      <dd>{creator.personal_data?.country_of_residence || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">State</dt>
                      <dd>{creator.personal_data?.state_of_residence || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Phone Number</dt>
                      <dd>{creator.personal_data?.phone_number || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Gender</dt>
                      <dd>{creator.personal_data?.gender || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Category</dt>
                      <dd>{creator.personal_data?.category || "Not set"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creator.bank_details ? (
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="font-medium text-gray-500">Payment Method</dt>
                        <dd className="capitalize">{creator.bank_details.payment_method.replace('_', ' ')}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Beneficiary Name</dt>
                        <dd>{creator.bank_details.beneficiary_name}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Country</dt>
                        <dd>{creator.bank_details.country}</dd>
                      </div>
                      {creator.bank_details.payment_method === "bank_transfer" && (
                        <>
                          {creator.bank_details.bank_account_number && (
                            <div>
                              <dt className="font-medium text-gray-500">Account Number</dt>
                              <dd>{creator.bank_details.bank_account_number}</dd>
                            </div>
                          )}
                          {creator.bank_details.routing_number && (
                            <div>
                              <dt className="font-medium text-gray-500">Routing Number</dt>
                              <dd>{creator.bank_details.routing_number}</dd>
                            </div>
                          )}
                          {creator.bank_details.iban && (
                            <div>
                              <dt className="font-medium text-gray-500">IBAN</dt>
                              <dd>{creator.bank_details.iban}</dd>
                            </div>
                          )}
                          {creator.bank_details.swift_bic && (
                            <div>
                              <dt className="font-medium text-gray-500">SWIFT/BIC</dt>
                              <dd>{creator.bank_details.swift_bic}</dd>
                            </div>
                          )}
                          {creator.bank_details.clabe && (
                            <div>
                              <dt className="font-medium text-gray-500">CLABE</dt>
                              <dd>{creator.bank_details.clabe}</dd>
                            </div>
                          )}
                          {creator.bank_details.bank_name && (
                            <div>
                              <dt className="font-medium text-gray-500">Bank Name</dt>
                              <dd>{creator.bank_details.bank_name}</dd>
                            </div>
                          )}
                          {creator.bank_details.bank_address && (
                            <div>
                              <dt className="font-medium text-gray-500">Bank Address</dt>
                              <dd>{creator.bank_details.bank_address}</dd>
                            </div>
                          )}
                        </>
                      )}
                      {creator.bank_details.payment_method === "paypal" && (
                        <div>
                          <dt className="font-medium text-gray-500">PayPal Email</dt>
                          <dd>{creator.bank_details.paypal_email}</dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="text-gray-500">No bank details provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {creatorServices.length > 0 ? (
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
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-500">No services added yet</p>
                      <div className="flex gap-4">
                        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                          <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleAddService} 
                          disabled={addingService || !selectedServiceId}
                        >
                          {addingService ? "Adding..." : "Add Service"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
