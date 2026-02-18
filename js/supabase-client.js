const SupabaseClient = {
    url: null,
    anonKey: null,
    enabled: false,
    sessionId: null,
    callCount: 0,
    
    init(config) {
        this.url = config.url;
        this.anonKey = config.anonKey;
        this.enabled = !!(this.url && this.anonKey);
        this.sessionId = crypto.randomUUID ? crypto.randomUUID() : 'session-' + Date.now();
        
        // Reset counter daily
        setInterval(() => { this.callCount = 0; }, 86400000);
        
        if (this.enabled) {
            console.log('✅ Supabase ML backend enabled');
        }
        return this;
    },
    
    async batchLearn(records) {
        if (!this.enabled || records.length === 0) return;
        this.callCount++;
        
        try {
            await fetch(`${this.url}/functions/v1/learn-from-evolution`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ evolutionData: records })
            });
        } catch (err) {
            console.error('Batch learn failed:', err);
        }
    },
    
    async batchRLUpdate(updates) {
        if (!this.enabled || updates.length === 0) return;
        this.callCount++;
        
        try {
            await fetch(`${this.url}/functions/v1/select-mutation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mode: 'batch', updates })
            });
        } catch (err) {
            console.error('Batch RL update failed:', err);
        }
    },
    
    async selectMutation(state) {
        if (!this.enabled) return { action: 'random', source: 'local' };
        this.callCount++;
        
        try {
            const response = await fetch(`${this.url}/functions/v1/select-mutation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mode: 'select', state })
            });
            return await response.json();
        } catch (err) {
            console.error('RL selection failed:', err);
            return { action: 'random', source: 'local' };
        }
    },
    
    async generateEmbedding(imageData) {
        if (!this.enabled) return null;
        this.callCount++;
        
        try {
            const response = await fetch(`${this.url}/functions/v1/generate-embedding`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageBase64: imageData })
            });
            const data = await response.json();
            return data.embedding;
        } catch (err) {
            console.error('Embedding failed:', err);
            return null;
        }
    },
    
    getCallStats() {
        return {
            today: this.callCount,
            monthly: this.callCount * 30 // estimate
        };
    }
};

window.SupabaseClient = SupabaseClient;