import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Q-learning constants
const LEARNING_RATE = 0.1
const DISCOUNT_FACTOR = 0.95
const EXPLORATION_RATE = 0.2
const ACTIONS = ['translate', 'scale', 'rotate', 'color', 'opacity', 'intelligent']

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  try {
    const { state, lastAction, reward, nextState, mode } = await req.json()
    
    if (mode === 'select') {
      // Select best mutation action
      const stateKey = JSON.stringify(state)
      const { data: qtRow } = await supabase
        .from('rl_q_table')
        .select('action_values')
        .eq('state_key', stateKey)
        .single()
      
      // Exploration vs exploitation
      if (Math.random() < EXPLORATION_RATE || !qtRow) {
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
        return new Response(JSON.stringify({ action, source: 'random' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Pick best action from Q-table
      const qValues = qtRow.action_values as Record<string, number>
      const action = Object.entries(qValues).sort(([,a],[,b]) => b-a)[0]?.[0] || ACTIONS[0]
      
      return new Response(JSON.stringify({ action, source: 'rl', qValues }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    if (mode === 'update') {
      // Update Q-table with new experience
      const stateKey = JSON.stringify(state)
      const nextKey = JSON.stringify(nextState)
      
      const { data: current } = await supabase.from('rl_q_table').select('action_values').eq('state_key', stateKey).single()
      const { data: next } = await supabase.from('rl_q_table').select('action_values').eq('state_key', nextKey).single()
      
      const qValues = (current?.action_values as Record<string, number>) || {}
      const nextValues = (next?.action_values as Record<string, number>) || {}
      const maxNextQ = Math.max(0, ...Object.values(nextValues))
      const currentQ = qValues[lastAction] || 0
      const newQ = currentQ + LEARNING_RATE * (reward + DISCOUNT_FACTOR * maxNextQ - currentQ)
      
      qValues[lastAction] = newQ
      
      await supabase.from('rl_q_table').upsert({
        state_key: stateKey,
        action_values: qValues,
        update_count: (current as any)?.update_count + 1 || 1,
        last_updated: new Date().toISOString()
      })
      
      return new Response(JSON.stringify({ updated: true, newQ }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    throw new Error('Invalid mode')
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
