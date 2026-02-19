import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { embedding, threshold = 0.7, limit = 10 } = await req.json()
    
    // Convert embedding array to vector string
    const embeddingStr = `[${embedding.join(',')}]`
    
    // Perform similarity search
    const { data: similar } = await supabase.rpc('match_embeddings', {
      query_embedding: embeddingStr,
      match_threshold: threshold,
      match_count: limit
    })
    
    // Analyze successful traits
    const successfulTraits = similar?.reduce((acc, curr) => {
      if (curr.fitness > 90) {
        // Add to successful traits analysis
      }
      return acc
    }, {})
    
    return new Response(JSON.stringify({ 
      similar,
      count: similar?.length || 0,
      successfulTraits
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