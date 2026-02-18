const IntelligentMutation=Object.assign(Object.create(BaseMutation),{
    type:'intelligent',params:{strength:1.0,probability:0.1},
    mutate(polygon,context={}){
        if(!this.isValid(polygon,context))return polygon;
        if(!context.intelligence)return this.fallback(polygon,context);
        const analysis=context.intelligence.analyze(context.allPolygons||[]);
        const suggestion=context.intelligence.suggestMutation(analysis,context.generation||0,context.fitness||0);
        if(suggestion.type==='balance_symmetry'){
            const clone=this.clonePolygon(polygon);
            const c=Geometry.getCentroid(clone.pts),W=context.W||200;
            clone.pts=Geometry.clipPolygon(Geometry.translatePolygon(clone.pts,(W-2*c.x)*0.3,0),W,context.H||200,0.2);
            return clone;
        }
        return this.fallback(polygon,context);
    },
    fallback(polygon,context){
        const types=['translate','scale','rotate','color','opacity'];
        const t=types[Math.floor(Math.random()*types.length)];
        const m=window.MutationRegistry&&window.MutationRegistry[t];
        return m?m.mutate(polygon,context):polygon;
    }
});
IntelligentMutation.register();window.IntelligentMutation=IntelligentMutation;
