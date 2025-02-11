
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useBankDetails } from "@/hooks/useBankDetails";
import { CountryField } from "@/components/bank-details/CountryField";
import { PaymentMethodField } from "@/components/bank-details/PaymentMethodField";
import { BeneficiaryField } from "@/components/bank-details/BeneficiaryField";
import { BankTransferFields } from "@/components/bank-details/BankTransferFields";
import { PayPalField } from "@/components/bank-details/PayPalField";

export default function CreatorBankDetail() {
  const {
    form,
    countries,
    isLoadingCountries,
    watchCountry,
    watchPaymentMethod,
    isPayPalOnly,
    onSubmit,
  } = useBankDetails();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Datos bancarios</h1>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <CountryField 
                    form={form}
                    countries={countries}
                    isLoadingCountries={isLoadingCountries}
                  />

                  <PaymentMethodField 
                    form={form}
                    isPayPalOnly={isPayPalOnly}
                    watchCountry={watchCountry}
                  />

                  <BeneficiaryField form={form} />

                  {watchPaymentMethod === "bank_transfer" && (
                    <BankTransferFields form={form} country={watchCountry} />
                  )}

                  {watchPaymentMethod === "paypal" && (
                    <PayPalField form={form} />
                  )}

                  <Button type="submit" className="w-full">
                    Guardar datos bancarios
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
