const ColorMutation=Object.assign(Object.create(BaseMutation),{
    type:'color',params:{strength:1.0,maxChange:40,probability:0.15},
    mutate(polygon,context={}){
        if(!this.isValid(polygon,context))return polygon;
        const clone=this.clonePolygon(polygon),s=this.calculateStrength(this.params.strength,context);
        const ch=['r','g','b'],n=Math.random()<0.7?1:2;
        for(let i=0;i<n;i++){const c=ch[i],d=(Math.random()-0.5)*2*this.params.maxChange*s;clone[c]=Math.max(0,Math.min(255,clone[c]+d));}
        return clone;
    }
});
ColorMutation.register();window.ColorMutation=ColorMutation;
