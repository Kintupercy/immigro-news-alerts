
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { identifier } = await req.json()
    
    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'Identifier required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const oneHour = new Date(now.getTime() - 60 * 60 * 1000)
    
    // Get or create rate limit record
    const { data: existing, error: fetchError } = await supabaseClient
      .from('auth_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching rate limit:', fetchError)
      return new Response(
        JSON.stringify({ allowed: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const maxAttempts = 5
    let currentAttempts = 0
    let blockedUntil = null

    if (existing) {
      // Check if currently blocked
      if (existing.blocked_until && new Date(existing.blocked_until) > now) {
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            remainingAttempts: 0,
            blockedUntil: existing.blocked_until 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Reset if last attempt was more than an hour ago
      if (new Date(existing.last_attempt) < oneHour) {
        currentAttempts = 1
      } else {
        currentAttempts = existing.attempt_count + 1
      }

      // Block if too many attempts
      if (currentAttempts >= maxAttempts) {
        blockedUntil = new Date(now.getTime() + 15 * 60 * 1000) // Block for 15 minutes
      }

      // Update existing record
      await supabaseClient
        .from('auth_rate_limits')
        .update({
          attempt_count: currentAttempts,
          last_attempt: now.toISOString(),
          blocked_until: blockedUntil?.toISOString() || null
        })
        .eq('identifier', identifier)
    } else {
      // Create new record
      currentAttempts = 1
      await supabaseClient
        .from('auth_rate_limits')
        .insert({
          identifier,
          attempt_count: currentAttempts,
          last_attempt: now.toISOString()
        })
    }

    const remainingAttempts = Math.max(0, maxAttempts - currentAttempts)
    const allowed = currentAttempts < maxAttempts

    return new Response(
      JSON.stringify({ 
        allowed,
        remainingAttempts,
        blockedUntil
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Rate limit function error:', error)
    return new Response(
      JSON.stringify({ allowed: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
