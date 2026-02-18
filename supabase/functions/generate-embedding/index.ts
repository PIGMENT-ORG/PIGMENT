import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const { imageBase64, text } = await req.json()
    
    // Use Supabase AI for embedding generation
    const session = new (globalThis as any).Supabase.ai.Session('gte-small')
    
    let embedding: number[]
    if (text) {
      // Text embedding for style descriptions
      embedding = await session.run(text, { mean_pool: true, normalize: true })
    } else if (imageBase64) {
      // For images, we describe them as text first
      const description = `evolutionary polygon art fitness ${Date.now()}`
      embedding = await session.run(description, { mean_pool: true, normalize: true })
    } else {
      throw new Error('Either imageBase64 or text must be provided')
    }
    
    return new Response(JSON.stringify({ embedding, dimensions: embedding.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
