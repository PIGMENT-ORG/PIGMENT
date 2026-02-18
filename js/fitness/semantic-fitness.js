const SemanticFitness = {
    calculateFitness(polygons,targetData,intelligence){
        if(!intelligence)return 50;
        const sym=this.calculateSymmetryScore(polygons,intelligence)*25;
        const comp=CompositionRules.scoreComposition(polygons,intelligence.w,intelligence.h)*25;
        return (50+sym+comp);
    },
    calculateSymmetryScore(polygons,intelligence){
        if(!intelligence.face)return 0.5;
        const face=intelligence.face;
        const facePolys=polygons.filter(p=>{const c=Geometry.getCentroid(p.pts);return c.x>=face.x&&c.x<=face.x+face.width&&c.y>=face.y&&c.y<=face.y+face.height;});
        if(!facePolys.length)return 0.5;
        return SymmetryAnalyzer.calculatePolygonSymmetry(facePolys,'vertical');
    }
};
window.SemanticFitness=SemanticFitness;
