const MutationRegistry = {
    mutations:{},
    register(type,m){this.mutations[type]=m;},
    get(type){return this.mutations[type]||this.mutations['translate'];},
    getAll(){return Object.values(this.mutations);},
    getRandom(){
        const ms=this.getAll();const total=ms.reduce((s,m)=>s+(m.params.probability||0.2),0);let r=Math.random()*total;
        for(const m of ms){r-=m.params.probability||0.2;if(r<=0)return m;}
        return ms[0];
    },
    mutateRandom(p,ctx={}){return this.getRandom().mutate(p,ctx);},
    init(){
        ['translate','scale','rotate','color','opacity','intelligent'].forEach(t=>{if(window[t.charAt(0).toUpperCase()+t.slice(1)+'Mutation'])this.register(t,window[t.charAt(0).toUpperCase()+t.slice(1)+'Mutation']);});
        this.register('translate',TranslateMutation);this.register('scale',ScaleMutation);this.register('rotate',RotateMutation);
        this.register('color',ColorMutation);this.register('opacity',OpacityMutation);this.register('intelligent',IntelligentMutation);
        console.log('MutationRegistry init:',Object.keys(this.mutations).length,'types');
    }
};
window.MutationRegistry=MutationRegistry;
