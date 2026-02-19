const RotateMutation=Object.assign(Object.create(BaseMutation),{
    type:'rotate',params:{strength:1.0,maxAngle:Math.PI/4,probability:0.20},
    mutate(polygon,context={}){
        if(!this.isValid(polygon,context))return polygon;
        const clone=this.clonePolygon(polygon),s=this.calculateStrength(this.params.strength,context);
        const angle=(Math.random()-0.5)*2*this.params.maxAngle*s;
        const centroid=Geometry.getCentroid(clone.pts);
        clone.pts=Geometry.clipPolygon(Geometry.rotatePolygon(clone.pts,angle,centroid),context.W||200,context.H||200,0.2);
        return clone;
    }
});
RotateMutation.register();window.RotateMutation=RotateMutation;
