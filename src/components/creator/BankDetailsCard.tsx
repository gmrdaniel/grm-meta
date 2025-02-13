
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface BankDetails {
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
}

interface BankDetailsCardProps {
  bankDetails?: BankDetails;
}

export function BankDetailsCard({ bankDetails }: BankDetailsCardProps) {
  if (!bankDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No bank details provided</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bank Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="font-medium text-gray-500">Payment Method</dt>
            <dd className="capitalize">{bankDetails.payment_method.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Beneficiary Name</dt>
            <dd>{bankDetails.beneficiary_name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Country</dt>
            <dd>{bankDetails.country}</dd>
          </div>
          {bankDetails.payment_method === "bank_transfer" && (
            <>
              {bankDetails.bank_account_number && (
                <div>
                  <dt className="font-medium text-gray-500">Account Number</dt>
                  <dd>{bankDetails.bank_account_number}</dd>
                </div>
              )}
              {bankDetails.routing_number && (
                <div>
                  <dt className="font-medium text-gray-500">Routing Number</dt>
                  <dd>{bankDetails.routing_number}</dd>
                </div>
              )}
              {bankDetails.iban && (
                <div>
                  <dt className="font-medium text-gray-500">IBAN</dt>
                  <dd>{bankDetails.iban}</dd>
                </div>
              )}
              {bankDetails.swift_bic && (
                <div>
                  <dt className="font-medium text-gray-500">SWIFT/BIC</dt>
                  <dd>{bankDetails.swift_bic}</dd>
                </div>
              )}
              {bankDetails.clabe && (
                <div>
                  <dt className="font-medium text-gray-500">CLABE</dt>
                  <dd>{bankDetails.clabe}</dd>
                </div>
              )}
              {bankDetails.bank_name && (
                <div>
                  <dt className="font-medium text-gray-500">Bank Name</dt>
                  <dd>{bankDetails.bank_name}</dd>
                </div>
              )}
              {bankDetails.bank_address && (
                <div>
                  <dt className="font-medium text-gray-500">Bank Address</dt>
                  <dd>{bankDetails.bank_address}</dd>
                </div>
              )}
            </>
          )}
          {bankDetails.payment_method === "paypal" && (
            <div>
              <dt className="font-medium text-gray-500">PayPal Email</dt>
              <dd>{bankDetails.paypal_email}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
