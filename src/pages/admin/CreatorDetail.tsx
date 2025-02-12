
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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

export default function CreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreatorDetail();
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
