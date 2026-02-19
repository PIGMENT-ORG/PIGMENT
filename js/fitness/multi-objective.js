const MultiObjectiveFitness = {
    weights:{pixel:0.40,structural:0.25,semantic:0.25,edge:0.10},
    calculate(polygons,imageData,targetData,intelligence){
        const w=imageData.width,h=imageData.height;
        const pe=PixelFitness.calculateError(imageData,targetData);
        const pf=PixelFitness.calculateFitness(pe,w,h)/100;
        const sf=StructuralFitness.calculateFitness(polygons,w,h)/100;
        const semf=intelligence?SemanticFitness.calculateFitness(polygons,targetData,intelligence)/100:0.5;
        const ef=this.calcEdge(imageData,intelligence);
        const combined=pf*this.weights.pixel+sf*this.weights.structural+semf*this.weights.semantic+ef*this.weights.edge;
        return {combined:combined*100,components:{pixel:pf*100,structural:sf*100,semantic:semf*100,edge:ef*100},weights:{...this.weights}};
    },
    calcEdge(imageData,intelligence){
        if(!intelligence||!intelligence.edges)return 0.5;
        const edges=ImageUtils.detectEdges(imageData);let s=0,t=0;
        for(let i=0;i<edges.length;i++){const w=intelligence.importanceMap?intelligence.importanceMap[i]:1;s+=Math.min(edges[i],intelligence.edges[i])*w;t+=w;}
        return t>0?s/t:0.5;
    },
    resetWeights(){this.weights={pixel:0.40,structural:0.25,semantic:0.25,edge:0.10};}
};
window.MultiObjectiveFitness=MultiObjectiveFitness;
