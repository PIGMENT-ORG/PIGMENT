import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  try {
    const { evolutionData } = await req.json()
    
    // Store training experience
    await supabase.from('training_data').insert({
      feature_vector: evolutionData.features || {},
      target_fitness: evolutionData.fitness || 0,
      mutation_success: evolutionData.improved || false,
      parent_fitness: evolutionData.parentFitness || 0,
      offspring_fitness: evolutionData.offspringFitness || 0,
      operator_used: evolutionData.operator || 'unknown',
      style_category: evolutionData.styleCategory || 'general',
      metadata: { generation: evolutionData.generation, polygonCount: evolutionData.polygonCount }
    })
    
    // Check if we should trigger model update (every 100 samples)
    const { count } = await supabase.from('training_data').select('*', { count: 'exact', head: true })
    const shouldRetrain = count && count % 100 === 0
    
    return new Response(JSON.stringify({ 
      success: true, 
      totalSamples: count,
      retraining: shouldRetrain
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
