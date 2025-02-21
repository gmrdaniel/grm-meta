
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { format, addMonths, startOfMonth } from 'https://esm.sh/date-fns@2.30.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const currentDate = new Date()
    
    console.log('Fetching active recurring services...')

    // Obtener servicios recurrentes activos
    const { data: services, error: servicesError } = await supabase
      .from('creator_services')
      .select(`
        *,
        services (
          name,
          type
        )
      `)
      .eq('status', 'activo')
      .eq('services.type', 'recurrente')

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
      throw servicesError
    }

    console.log(`Found ${services?.length || 0} active recurring services:`, services)

    if (!services || services.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active recurring services found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const createdPayments = []
    const errors = []

    for (const service of services) {
      try {
        console.log(`Processing service: ${service.id} (${service.services?.name})`)
        
        const paymentMonth = startOfMonth(currentDate)
        
        // Verificar si ya existe un pago para este mes
        const { data: existingPayment, error: checkError } = await supabase
          .from('service_payments')
          .select('id')
          .eq('creator_service_id', service.id)
          .eq('payment_month', format(paymentMonth, 'yyyy-MM-dd'))
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing payment:', checkError)
          throw checkError
        }

        if (existingPayment) {
          console.log(`Payment already exists for service ${service.id} in ${format(paymentMonth, 'MMMM yyyy')}`)
          continue
        }

        // Calcular fecha de pago (día 10 del mes)
        const paymentDate = new Date(paymentMonth)
        paymentDate.setDate(10)

        const totalAmount = service.monthly_fee || 0
        const companyShare = service.company_share || 0
        const companyEarning = (totalAmount * companyShare) / 100
        const creatorEarning = totalAmount - companyEarning

        const paymentData = {
          creator_service_id: service.id,
          payment_month: format(paymentMonth, 'yyyy-MM-dd'),
          payment_date: paymentDate.toISOString(),
          total_amount: totalAmount,
          company_earning: companyEarning,
          creator_earning: creatorEarning,
          brand_payment_status: 'pendiente',
          creator_payment_status: 'pendiente',
          is_recurring: true
        }

        console.log('Creating payment with data:', paymentData)

        const { data: newPayment, error: insertError } = await supabase
          .from('service_payments')
          .insert(paymentData)
          .select()
          .single()

        if (insertError) {
          console.error('Error creating payment:', insertError)
          errors.push({ serviceId: service.id, error: insertError })
          continue
        }

        console.log('Payment created successfully:', newPayment)
        createdPayments.push(newPayment)

      } catch (error) {
        console.error(`Error processing service ${service.id}:`, error)
        errors.push({ serviceId: service.id, error })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdPayments.length} payments`,
        data: {
          payments: createdPayments,
          errors: errors
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

