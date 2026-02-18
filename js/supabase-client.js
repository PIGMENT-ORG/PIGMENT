// Supabase Client for PIGMENT
const SupabaseClient = {
    url: null,
    anonKey: null,
    enabled: false,
    sessionId: null,
    
    // Initialize with your Supabase credentials
    init(config) {
        this.url = config.url
        this.anonKey = config.anonKey
        this.enabled = !!(this.url && this.anonKey)
        this.sessionId = crypto.randomUUID ? crypto.randomUUID() : 'session-' + Date.now()
        
        if (this.enabled) {
            console.log('✅ Supabase ML backend enabled')
        } else {
            console.log('⚠️ Supabase ML backend disabled (no credentials)')
        }
        
        return this
    },
    
    // Generate embedding from image data
    async generateEmbedding(imageData, text = null) {
        if (!this.enabled) return null
        
        try {
            const response = await fetch(`${this.url}/functions/v1/generate-embedding`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageBase64: imageData,
                    text: text
                })
            })
            
            const data = await response.json()
            return data.embedding
        } catch (err) {
            console.error('Embedding generation failed:', err)
            return null
        }
    },
    
    // Select mutation using RL
    async selectMutation(state) {
        if (!this.enabled) return { action: 'random', source: 'local' }
        
        try {
            const response = await fetch(`${this.url}/functions/v1/select-mutation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: 'select',
                    state: state
                })
            })
            return await response.json()
        } catch (err) {
            console.error('RL selection failed:', err)
            return { action: 'random', source: 'local' }
        }
    },
    
    // Update RL with reward
    async updateRL(state, action, reward, nextState) {
        if (!this.enabled) return
        
        try {
            await fetch(`${this.url}/functions/v1/select-mutation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: 'update',
                    state: state,
                    lastAction: action,
                    reward: reward,
                    nextState: nextState
                })
            })
        } catch (err) {
            console.error('RL update failed:', err)
        }
    },
    
    // Store evolution experience
    async learnFromEvolution(evolutionData) {
        if (!this.enabled) return
        
        try {
            await fetch(`${this.url}/functions/v1/learn-from-evolution`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evolutionData: {
                        ...evolutionData,
                        sessionId: this.sessionId
                    }
                })
            })
        } catch (err) {
            console.error('Learning failed:', err)
        }
    },
    
    // Search for similar evolutions
    async semanticSearch(embedding, threshold = 0.7, limit = 10) {
        if (!this.enabled) return []
        
        try {
            const response = await fetch(`${this.url}/functions/v1/semantic-search`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embedding: embedding,
                    threshold: threshold,
                    limit: limit
                })
            })
            
            const data = await response.json()
            return data.similar || []
        } catch (err) {
            console.error('Semantic search failed:', err)
            return []
        }
    },
    
    // Predict aesthetic score
    async predictAesthetic(features) {
        if (!this.enabled) return 0.5
        
        try {
            const response = await fetch(`${this.url}/functions/v1/aesthetic-predictor`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    features: features
                })
            })
            
            const data = await response.json()
            return data.aestheticScore || 0.5
        } catch (err) {
            console.error('Aesthetic prediction failed:', err)
            return 0.5
        }
    },
    
    // Submit user feedback
    async submitFeedback(evolutionRunId, imageEmbeddingId, rating, comments = '') {
        if (!this.enabled) return
        
        try {
            const response = await fetch(`${this.url}/rest/v1/user_feedback`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'apikey': this.anonKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evolution_run_id: evolutionRunId,
                    image_embedding_id: imageEmbeddingId,
                    user_rating: rating,
                    user_comments: comments,
                    created_at: new Date().toISOString()
                })
            })
            return response.ok
        } catch (err) {
            console.error('Feedback submission failed:', err)
            return false
        }
    }
}

window.SupabaseClient = SupabaseClient