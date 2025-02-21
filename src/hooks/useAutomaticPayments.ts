
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { addMonths, format, startOfMonth, setDate } from 'date-fns';
import { toast } from "sonner";

interface AutomaticPaymentProps {
  creator_service_id: string;
  payment_month: Date;
  total_amount: number;
  company_earning: number;
  creator_earning: number;
  is_recurring: boolean;
}

export function useAutomaticPayments() {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPayment = async ({
    creator_service_id,
    payment_month,
    total_amount,
    company_earning,
    creator_earning,
    is_recurring
  }: AutomaticPaymentProps) => {
    try {
      setIsProcessing(true);

      // Verificar si ya existe un pago para este mes y servicio
      const { data: existingPayment } = await supabase
        .from('service_payments')
        .select('id')
        .eq('creator_service_id', creator_service_id)
        .eq('payment_month', format(payment_month, 'yyyy-MM-dd'))
        .single();

      if (existingPayment) {
        throw new Error('Ya existe un pago registrado para este mes y servicio');
      }

      // Establecer la fecha de pago al día 10 del mes
      const paymentDate = setDate(payment_month, 10);

      const paymentData = {
        creator_service_id,
        payment_month: format(startOfMonth(payment_month), 'yyyy-MM-dd'),
        payment_date: format(paymentDate, 'yyyy-MM-dd'),
        total_amount,
        company_earning,
        creator_earning,
        brand_payment_status: 'pending',
        creator_payment_status: 'pending',
        is_recurring,
        payment_period: format(payment_month, 'MMMM yyyy')
      };

      const { error: insertError } = await supabase
        .from('service_payments')
        .insert(paymentData);

      if (insertError) throw insertError;

      toast.success('Pago creado exitosamente');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el pago');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMonthlyPayments = async () => {
    try {
      setIsProcessing(true);

      // Obtener todos los servicios recurrentes activos
      const { data: recurringServices, error: servicesError } = await supabase
        .from('creator_services')
        .select(`
          id,
          monthly_fee,
          company_share,
          services (
            type
          )
        `)
        .eq('status', 'activo')
        .filter('services.type', 'eq', 'recurrente');

      if (servicesError) throw servicesError;

      const currentMonth = startOfMonth(new Date());
      
      for (const service of recurringServices || []) {
        const totalAmount = service.monthly_fee || 0;
        const companyShare = service.company_share || 0;
        const companyEarning = (totalAmount * companyShare) / 100;
        const creatorEarning = totalAmount - companyEarning;

        await createPayment({
          creator_service_id: service.id,
          payment_month: currentMonth,
          total_amount: totalAmount,
          company_earning: companyEarning,
          creator_earning: creatorEarning,
          is_recurring: true
        });
      }

      toast.success('Pagos mensuales generados exitosamente');
    } catch (error: any) {
      toast.error('Error al generar los pagos mensuales');
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createPayment,
    generateMonthlyPayments,
    isProcessing
  };
}
