const CompositionRules = {
    ruleOfThirds:{points:[{x:1/3,y:1/3,w:1},{x:2/3,y:1/3,w:1},{x:1/3,y:2/3,w:1},{x:2/3,y:2/3,w:1}]},
    goldenPoints:[{x:0.382,y:0.382,w:1.2},{x:0.618,y:0.382,w:1.2},{x:0.382,y:0.618,w:1.2},{x:0.618,y:0.618,w:1.2}],
    scoreComposition(polygons,w,h){
        return this.scoreRuleOfThirds(polygons,w,h)*0.4+this.scoreGoldenRatio(polygons,w,h)*0.3+this.scoreBalance(polygons,w,h)*0.3;
    },
    scoreRuleOfThirds(polygons,w,h){
        if(!polygons.length)return 0.5;
        const centroids=polygons.map(p=>Geometry.getCentroid(p.pts));let score=0;
        for(const pt of this.ruleOfThirds.points){const px=pt.x*w,py=pt.y*h;const md=Math.min(...centroids.map(c=>Math.sqrt(Math.pow(c.x-px,2)+Math.pow(c.y-py,2))));score+=(1-md/Math.sqrt(w*w+h*h))*pt.w;}
        return score/this.ruleOfThirds.points.length;
    },
    scoreGoldenRatio(polygons,w,h){
        if(!polygons.length)return 0.5;
        const centroids=polygons.map(p=>Geometry.getCentroid(p.pts));let score=0;
        for(const pt of this.goldenPoints){const px=pt.x*w,py=pt.y*h;const md=Math.min(...centroids.map(c=>Math.sqrt(Math.pow(c.x-px,2)+Math.pow(c.y-py,2))));score+=(1-md/Math.sqrt(w*w+h*h))*pt.w;}
        return score/this.goldenPoints.length;
    },
    scoreBalance(polygons,w,h){
        if(!polygons.length)return 0.5;
        let ta=0,wx=0,wy=0;
        polygons.forEach(p=>{const a=Geometry.calculateArea(p.pts),c=Geometry.getCentroid(p.pts);ta+=a;wx+=c.x*a;wy+=c.y*a;});
        if(!ta)return 0.5;
        const comX=wx/ta,comY=wy/ta;
        const d=Math.sqrt(Math.pow(comX-w/2,2)+Math.pow(comY-h*0.4,2));
        return 1-Math.min(1,d/(Math.sqrt(w*w+h*h)/2));
    }
};
window.CompositionRules = CompositionRules;
