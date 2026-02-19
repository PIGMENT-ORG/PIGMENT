import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple neural network weights (would be trained from user feedback)
const MODEL_WEIGHTS = {
  fitness: 0.4,
  symmetry: 0.2,
  edgeAlignment: 0.2,
  colorHarmony: 0.2
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  try {
    const { features } = await req.json()
    
    // Calculate aesthetic score based on learned weights
    const aestheticScore = 
      (features.fitness || 0) * MODEL_WEIGHTS.fitness +
      (features.symmetry || 0.5) * MODEL_WEIGHTS.symmetry +
      (features.edgeAlignment || 0.5) * MODEL_WEIGHTS.edgeAlignment +
      (features.colorHarmony || 0.5) * MODEL_WEIGHTS.colorHarmony
    
    return new Response(JSON.stringify({ 
      aestheticScore,
      confidence: 0.8, // Would increase with more training data
      modelVersion: '1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})