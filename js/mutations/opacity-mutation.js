const OpacityMutation=Object.assign(Object.create(BaseMutation),{
    type:'opacity',params:{strength:1.0,maxChange:30,minAlpha:20,maxAlpha:220,probability:0.05},
    mutate(polygon,context={}){
        if(!this.isValid(polygon,context))return polygon;
        const clone=this.clonePolygon(polygon),s=this.calculateStrength(this.params.strength,context);
        clone.a=Math.max(this.params.minAlpha,Math.min(this.params.maxAlpha,clone.a+(Math.random()-0.5)*2*this.params.maxChange*s));
        return clone;
    }
});
OpacityMutation.register();window.OpacityMutation=OpacityMutation;
