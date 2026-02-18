const EvolutionEngine = {
    polygons:[],bestPolys:[],bestError:Infinity,generation:0,improvements:0,
    mutationRate:1.0,lastImprovementGen:0,plateauCount:0,
    fitnessHistory:[],structHistory:[],
    config:{width:200,height:200,targetData:null,intelligence:null,supabase:null,maxPolygonSize:0.15,minPolygonSize:0.005},
    
    init(config){Object.assign(this.config,config);this.reset();return this;},
    
    reset(){
        const count=parseInt(document.getElementById('selpoly')?.value||'50');
        this.polygons=this.generateRandom(count);this.bestPolys=this.clone(this.polygons);
        this.bestError=this.evaluate(this.polygons);this.generation=0;this.improvements=0;
        this.mutationRate=1.0;this.lastImprovementGen=0;this.plateauCount=0;
        this.fitnessHistory=[];this.structHistory=[];
        return this.bestError;
    },
    
    generateRandom(count){const p=[];for(let i=0;i<count;i++)p.push(this.randomPoly());return p;},
    
    randomPoly(){
        const sz=parseFloat(document.getElementById('rsize')?.value||'4');
        const s=this.config.width*(0.04+Math.random()*sz*0.03);
        const cx=Math.random()*this.config.width,cy=Math.random()*this.config.height;
        const pts=[];
        for(let i=0;i<3;i++){
            const angle=(i/3)*Math.PI*2+Math.random()*0.5;
            const r=s*(0.5+Math.random()*0.8);
            pts.push([Math.max(-this.config.width*0.2,Math.min(this.config.width*1.2,cx+Math.cos(angle)*r)),Math.max(-this.config.height*0.2,Math.min(this.config.height*1.2,cy+Math.sin(angle)*r))]);
        }
        return {pts,r:Math.floor(Math.random()*255),g:Math.floor(Math.random()*255),b:Math.floor(Math.random()*255),a:Math.floor(40+Math.random()*100),id:Math.random().toString(36).substr(2,9)};
    },
    
    clone(polygons){return polygons.map(p=>({...p,pts:p.pts.map(pt=>[pt[0],pt[1]])}));},
    
    evaluate(polygons){
        const canvas=document.createElement('canvas');canvas.width=this.config.width;canvas.height=this.config.height;
        const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
        for(const p of polygons){ctx.beginPath();ctx.moveTo(p.pts[0][0],p.pts[0][1]);for(let i=1;i<p.pts.length;i++)ctx.lineTo(p.pts[i][0],p.pts[i][1]);ctx.closePath();ctx.fillStyle=`rgba(${p.r},${p.g},${p.b},${p.a/255})`;ctx.fill();}
        return PixelFitness.calculateError(ctx.getImageData(0,0,canvas.width,canvas.height),this.config.targetData);
    },
    
    step(){
        const speed=parseInt(document.getElementById('selspd')?.value||'20');
        let impr=0;
        for(let i=0;i<speed;i++){const r=this.mutateOne();if(r.improved)impr++;}
        
        if(this.generation % 100 === 0) {
            this.saveImageEmbedding();
        }
        
        return {generation:this.generation,error:this.bestError,improvements:impr,fitness:this.getFitness()};
    },
    
    async selectMutation() {
        const f = this.getFitness();
        const state = {
            fitness: Math.floor(f / 10) * 10,
            plateau: this.plateauCount > 500 ? 'stuck' : 'moving',
            stage: f < 30 ? 'early' : f < 60 ? 'mid' : 'late',
            polygonCount: this.polygons.length
        };
        
        if (this.config.supabase && this.config.supabase.enabled) {
            const rlResult = await this.config.supabase.selectMutation(state);
            if (rlResult.source === 'rl' && rlResult.action) {
                console.log('RL chose:', rlResult.action);
                return rlResult.action;
            }
        }
        
        if(this.config.intelligence && f<80 && Math.random()<0.15) return 'intelligent';
        if(this.plateauCount>1000){const r=Math.random();if(r<0.4)return'translate';if(r<0.7)return'scale';return'rotate';}
        if(f>90){const r=Math.random();if(r<0.3)return'color';if(r<0.5)return'opacity';if(r<0.7)return'translate';return'scale';}
        const r=Math.random();if(r<0.35)return'translate';if(r<0.60)return'scale';if(r<0.80)return'rotate';if(r<0.95)return'color';return'opacity';
    },
    
    async mutateOne(){
        const idx=Math.floor(Math.random()*this.polygons.length);
        const candidate=this.clone(this.polygons);
        const mtype=await this.selectMutation();
        const mutation=MutationRegistry.get(mtype);
        const ctx={W:this.config.width,H:this.config.height,generation:this.generation,fitness:this.getFitness(),temperature:parseFloat(document.getElementById('temperature')?.value||'1'),intelligence:this.config.intelligence,allPolygons:this.polygons};
        candidate[idx]=mutation.mutate(this.polygons[idx],ctx);
        const area=Geometry.calculateArea(candidate[idx].pts);
        const maxA=this.config.width*this.config.height*this.config.maxPolygonSize;
        const minA=this.config.width*this.config.height*this.config.minPolygonSize;
        if(area>maxA||area<minA){this.generation++;return{accepted:false,improved:false};}
        
        const parentFitness = this.getFitness();
        const error=this.evaluate(candidate);
        const offspringFitness = 100 * (1 - error / (255*255*3*this.config.width*this.config.height));
        const improved = error < this.bestError;
        
        const reward = improved ? 1.0 : -0.1;
        
        const currentState = {
            fitness: Math.floor(parentFitness / 10) * 10,
            plateau: this.plateauCount > 500 ? 'stuck' : 'moving',
            stage: parentFitness < 30 ? 'early' : parentFitness < 60 ? 'mid' : 'late',
            polygonCount: this.polygons.length
        };
        
        const nextState = {
            fitness: Math.floor(offspringFitness / 10) * 10,
            plateau: improved ? 'moving' : (this.plateauCount + 1 > 500 ? 'stuck' : 'moving'),
            stage: offspringFitness < 30 ? 'early' : offspringFitness < 60 ? 'mid' : 'late',
            polygonCount: this.polygons.length
        };
        
        if (this.config.supabase && this.config.supabase.enabled) {
            this.config.supabase.updateRL(currentState, mtype, reward, nextState)
                .catch(err => console.log('RL update err:', err));
        }
        
        if(improved){
            this.polygons=candidate;this.bestPolys=this.clone(candidate);
            this.bestError=error;this.improvements++;this.lastImprovementGen=this.generation;
            this.plateauCount=0;this.mutationRate=Math.max(0.3,this.mutationRate*0.998);
            
            this.recordTrainingData({
                operator: mtype,
                success: true,
                parentFitness: parentFitness,
                offspringFitness: offspringFitness,
                generation: this.generation,
                polygonCount: this.polygons.length,
                features: {
                    fitness: offspringFitness,
                    plateauCount: this.plateauCount
                }
            });
            
            this.generation++;return{accepted:true,improved:true};
        }
        
        this.recordTrainingData({
            operator: mtype,
            success: false,
            parentFitness: parentFitness,
            offspringFitness: offspringFitness,
            generation: this.generation,
            polygonCount: this.polygons.length,
            features: {
                fitness: parentFitness,
                plateauCount: this.plateauCount
            }
        });
        
        this.plateauCount++;this.mutationRate=Math.min(1.5,this.mutationRate*1.001);
        this.generation++;return{accepted:false,improved:false};
    },
    
    async recordTrainingData(data) {
        if (!this.config.supabase || !this.config.supabase.enabled) return;
        
        try {
            await this.config.supabase.learnFromEvolution({
                operator: data.operator,
                improved: data.success,
                parentFitness: data.parentFitness,
                offspringFitness: data.offspringFitness,
                generation: data.generation,
                polygonCount: data.polygonCount,
                fitness: data.offspringFitness,
                features: data.features,
                styleCategory: 'general'
            });
        } catch (err) {
            console.log('ML recording:', err.message);
        }
    },
    
    async saveImageEmbedding() {
        if (!this.config.supabase || !this.config.supabase.enabled) return;
        if (this.generation % 100 !== 0) return;
        if (this.getFitness() < 30) return;
        
        try {
            const canvas = document.createElement('canvas');
            canvas.width = this.config.width;
            canvas.height = this.config.height;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (const p of this.bestPolys) {
                ctx.beginPath();
                ctx.moveTo(p.pts[0][0], p.pts[0][1]);
                for (let i = 1; i < p.pts.length; i++) {
                    ctx.lineTo(p.pts[i][0], p.pts[i][1]);
                }
                ctx.closePath();
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a/255})`;
                ctx.fill();
            }
            
            const imageBase64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
            const embedding = await this.config.supabase.generateEmbedding(imageBase64);
            
            if (embedding) {
                await fetch(`${this.config.supabase.url}/functions/v1/learn-from-evolution`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.supabase.anonKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        evolutionData: {
                            type: 'embedding',
                            generation: this.generation,
                            fitness: this.getFitness(),
                            embedding: embedding,
                            sessionId: this.config.supabase.sessionId
                        }
                    })
                });
            }
        } catch (err) {
            console.log('Embedding save failed:', err);
        }
    },
    
    getFitness(){return 100*(1-this.bestError/(255*255*3*this.config.width*this.config.height));},
    
    getStructuralFitness(){return StructuralFitness.calculateFitness(this.bestPolys,this.config.width,this.config.height);},
    
    getStats(){return{generations:this.generation,fitness:this.getFitness(),structural:this.getStructuralFitness(),improvements:this.improvements,mutationRate:this.mutationRate,plateauCount:this.plateauCount,polygons:this.bestPolys.length,error:this.bestError};},
    
    loadCheckpoint(cp){this.bestPolys=this.clone(cp.polygons);this.polygons=this.clone(cp.polygons);this.bestError=cp.error||this.evaluate(this.polygons);this.generation=cp.generation||0;this.improvements=cp.improvements||0;this.mutationRate=cp.mutationRate||1.0;}
};

window.EvolutionEngine=EvolutionEngine;