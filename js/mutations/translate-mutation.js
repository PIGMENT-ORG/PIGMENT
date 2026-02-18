const TranslateMutation=Object.assign(Object.create(BaseMutation),{
    type:'translate',params:{strength:1.0,maxTranslation:0.1,probability:0.35},
    mutate(polygon,context={}){
        if(!this.isValid(polygon,context))return polygon;
        const clone=this.clonePolygon(polygon),s=this.calculateStrength(this.params.strength,context);
        const W=context.W||200,H=context.H||200;
        const dx=(Math.random()-0.5)*2*W*this.params.maxTranslation*s;
        const dy=(Math.random()-0.5)*2*H*this.params.maxTranslation*s;
        clone.pts=Geometry.clipPolygon(Geometry.translatePolygon(clone.pts,dx,dy),W,H,0.2);
        return clone;
    }
});
TranslateMutation.register();window.TranslateMutation=TranslateMutation;
