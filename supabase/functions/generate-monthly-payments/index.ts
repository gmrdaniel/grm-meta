
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { format } from 'https://esm.sh/date-fns@3.3.1'
import { startOfMonth } from 'https://esm.sh/date-fns@3.3.1'

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

    console.log('Starting monthly payments generation...');

    // 1. Obtener servicios recurrentes activos
    const { data: recurringServices, error: servicesError } = await supabaseClient
      .from('creator_services')
      .select(`
        id,
        monthly_fee,
        company_share,
        profile_id,
        services!inner (
          id,
          type,
          name
        )
      `)
      .eq('status', 'activo')
      .eq('services.type', 'recurrente');

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      throw servicesError;
    }

    console.log('Found recurring services:', recurringServices);

    if (!recurringServices || recurringServices.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No recurring services found to process',
          results: { successful: [], failed: [] }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const currentMonth = startOfMonth(new Date());
    const formattedMonth = format(currentMonth, 'yyyy-MM-dd');
    const successfulPayments = [];
    const failedPayments = [];

    // 2. Procesar cada servicio
    for (const service of recurringServices) {
      try {
        console.log(`Processing service: ${service.services.name} (ID: ${service.id})`);

        // Verificar si ya existe un pago para este mes
        const { data: existingPayment, error: existingPaymentError } = await supabaseClient
          .from('service_payments')
          .select('id')
          .eq('creator_service_id', service.id)
          .eq('payment_month', formattedMonth)
          .maybeSingle();

        if (existingPaymentError) {
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

        console.log('Calculating payment:', {
          totalAmount,
          companyShare,
          companyEarning,
          creatorEarning
        });

        // Crear el registro de pago
        const { error: insertError } = await supabaseClient
          .from('service_payments')
          .insert({
            creator_service_id: service.id,
            payment_month: formattedMonth,
            payment_date: formattedMonth, // Primer día del mes
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

        console.log(`Successfully created payment for service ${service.id}`);
        successfulPayments.push({
          serviceId: service.id,
          serviceName: service.services.name
        });

      } catch (error) {
        console.error(`Error processing service ${service.id}:`, error);
        failedPayments.push({
          serviceId: service.id,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${recurringServices.length} services. Success: ${successfulPayments.length}, Failed: ${failedPayments.length}`,
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
