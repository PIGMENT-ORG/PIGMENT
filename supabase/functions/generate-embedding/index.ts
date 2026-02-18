import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { imageBase64, text } = await req.json()
    
    // Use Supabase AI for embedding generation
    const session = new (globalThis as any).Supabase.ai.Session('gte-small')
    
    let embedding: number[]
    if (text) {
      // Text embedding for style descriptions
      embedding = await session.run(text, { 
        mean_pool: true, 
        normalize: true 
      })
    } else if (imageBase64) {
      // For images, we describe them as text first
      // In production, use actual image-to-text model
      const description = `evolutionary polygon art with fitness score`
      embedding = await session.run(description, { 
        mean_pool: true, 
        normalize: true 
      })
    } else {
      throw new Error('Either imageBase64 or text must be provided')
    }
    
    return new Response(JSON.stringify({ 
      embedding, 
      dimensions: embedding.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})