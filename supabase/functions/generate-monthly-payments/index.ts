
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { format, startOfMonth } from 'https://esm.sh/date-fns@2.30.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting monthly payments generation...')
    
    // Get active recurring services
    const { data: recurringServices, error: servicesError } = await supabaseClient
      .from('creator_services')
      .select(`
        *,
        services!inner (
          type,
          name
        )
      `)
      .eq('status', 'activo')
      .eq('services.type', 'recurrente')

    if (servicesError) {
      console.error('Error fetching recurring services:', servicesError)
      throw servicesError
    }

    console.log(`Found ${recurringServices?.length || 0} active recurring services`)

    if (!recurringServices?.length) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active recurring services found',
          paymentsCreated: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const currentDate = new Date()
    const paymentMonth = startOfMonth(currentDate)
    let paymentsCreated = 0

    for (const service of recurringServices) {
      console.log(`Processing service: ${service.services.name} (ID: ${service.id})`)

      // Check if a payment already exists for this service and month
      const { data: existingPayment, error: checkError } = await supabaseClient
        .from('service_payments')
        .select()
        .eq('creator_service_id', service.id)
        .eq('payment_month', paymentMonth.toISOString())
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing payment:', checkError)
        continue
      }

      if (existingPayment) {
        console.log(`Payment already exists for service ${service.id} for month ${format(paymentMonth, 'MMMM yyyy')}`)
        continue
      }

      // Calculate payment date (10th of current month)
      const paymentDate = new Date(paymentMonth)
      paymentDate.setDate(10)

      // Calculate earnings based on monthly fee and company share
      const totalAmount = service.monthly_fee || 0
      const companyShare = service.company_share || 0
      const companyEarning = (totalAmount * companyShare) / 100
      const creatorEarning = totalAmount - companyEarning

      // Insert new payment record
      const { error: insertError } = await supabaseClient
        .from('service_payments')
        .insert({
          creator_service_id: service.id,
          payment_month: paymentMonth.toISOString(),
          payment_date: paymentDate.toISOString(),
          total_amount: totalAmount,
          company_earning: companyEarning,
          creator_earning: creatorEarning,
          brand_payment_status: 'pendiente',
          creator_payment_status: 'pendiente',
          is_recurring: true,
          payment_period: format(paymentMonth, 'MMMM yyyy')
        })

      if (insertError) {
        console.error('Error inserting payment:', insertError)
        continue
      }

      console.log(`Created payment for service ${service.id} for month ${format(paymentMonth, 'MMMM yyyy')}`)
      paymentsCreated++
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully created ${paymentsCreated} payments`,
        paymentsCreated 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in generate-monthly-payments:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
