
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { format } from 'https://esm.sh/date-fns@3.3.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const currentMonth = format(now, "MM/yyyy")

    // Obtener servicios recurrentes activos que no tienen pago para el mes actual
    const { data: services, error: servicesError } = await supabaseClient
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
      .eq('services.type', 'recurrente')

    if (servicesError) {
      throw servicesError
    }

    console.log('Servicios encontrados:', services?.length)

    if (!services || services.length === 0) {
      return new Response(
        JSON.stringify({ count: 0, message: 'No se encontraron servicios para generar pagos' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Insertar pagos pendientes
    const { data: insertedPayments, error: insertError } = await supabaseClient
      .from('service_payments')
      .upsert(
        services.map((service) => ({
          creator_service_id: service.id,
          payment_date: new Date(now.getFullYear(), now.getMonth(), 9),
          brand_payment_status: 'pendiente',
          creator_payment_status: 'pendiente',
          is_recurring: true,
          payment_period: currentMonth,
          payment_month: new Date(now.getFullYear(), now.getMonth(), 1),
          total_amount: service.monthly_fee || 0,
          company_earning: (service.monthly_fee || 0) * ((service.company_share || 0) / 100),
          creator_earning: (service.monthly_fee || 0) * (1 - (service.company_share || 0) / 100)
        })),
        {
          onConflict: 'creator_service_id,payment_month'
        }
      )

    if (insertError) {
      console.error('Error al insertar pagos:', insertError)
      throw insertError
    }

    console.log('Pagos insertados:', insertedPayments?.length)

    return new Response(
      JSON.stringify({ 
        count: insertedPayments?.length || 0,
        message: 'Pagos generados exitosamente' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
