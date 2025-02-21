
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { format } from 'https://esm.sh/date-fns@3.3.1'
import { startOfMonth, setDate } from 'https://esm.sh/date-fns@3.3.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Obtener servicios recurrentes activos
    const { data: recurringServices, error: servicesError } = await supabaseClient
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

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      throw servicesError;
    }

    const currentMonth = startOfMonth(new Date());
    const successfulPayments = [];
    const failedPayments = [];

    // 2. Procesar cada servicio
    for (const service of recurringServices || []) {
      try {
        // Verificar si ya existe un pago para este mes
        const { data: existingPayment, error: existingPaymentError } = await supabaseClient
          .from('service_payments')
          .select('id')
          .eq('creator_service_id', service.id)
          .eq('payment_month', format(currentMonth, 'yyyy-MM-dd'))
          .single();

        if (existingPaymentError && !existingPaymentError.message.includes('No rows found')) {
          console.error('Error checking existing payment:', existingPaymentError);
          throw existingPaymentError;
        }

        if (existingPayment) {
          console.log(`Payment already exists for service ${service.id} in ${format(currentMonth, 'MMMM yyyy')}`);
          continue;
        }

        const totalAmount = service.monthly_fee || 0;
        const companyShare = service.company_share || 0;
        const companyEarning = (totalAmount * companyShare) / 100;
        const creatorEarning = totalAmount - companyEarning;
        const paymentDate = setDate(currentMonth, 10);

        // Crear el registro de pago
        const { error: insertError } = await supabaseClient
          .from('service_payments')
          .insert({
            creator_service_id: service.id,
            payment_month: format(currentMonth, 'yyyy-MM-dd'),
            payment_date: format(paymentDate, 'yyyy-MM-dd'),
            total_amount: totalAmount,
            company_earning: companyEarning,
            creator_earning: creatorEarning,
            brand_payment_status: 'pending',
            creator_payment_status: 'pending',
            is_recurring: true,
            payment_period: format(currentMonth, 'MMMM yyyy')
          });

        if (insertError) {
          console.error('Error inserting payment:', insertError);
          throw insertError;
        }

        successfulPayments.push(service.id);

      } catch (error) {
        console.error(`Error processing service ${service.id}:`, error);
        failedPayments.push({ serviceId: service.id, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Monthly payments generated',
        results: {
          successful: successfulPayments,
          failed: failedPayments
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-monthly-payments:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
