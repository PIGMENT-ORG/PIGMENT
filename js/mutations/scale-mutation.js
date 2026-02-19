const ScaleMutation=Object.assign(Object.create(BaseMutation),{
    type:'scale',params:{strength:1.0,minScale:0.5,maxScale:2.0,probability:0.25},
    mutate(polygon,context={}){
        if(!this.isValid(polygon,context))return polygon;
        const clone=this.clonePolygon(polygon),s=this.calculateStrength(this.params.strength,context);
        const range=this.params.maxScale-this.params.minScale,mid=(this.params.maxScale+this.params.minScale)/2;
        const scale=mid+(Math.random()-0.5)*range*s;
        const centroid=Geometry.getCentroid(clone.pts);
        clone.pts=Geometry.clipPolygon(Geometry.scalePolygon(clone.pts,scale,centroid),context.W||200,context.H||200,0.2);
        return clone;
    }
});
ScaleMutation.register();window.ScaleMutation=ScaleMutation;
