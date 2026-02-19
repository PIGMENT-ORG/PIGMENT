const StructuralFitness = {
    calculateFitness(polygons,w,h){
        if(!polygons.length)return 50;
        const sd=this.calculateSizeDiversity(polygons)*25;
        const sq=this.calculateShapeQuality(polygons)*25;
        const cov=this.calculateCoverage(polygons,w,h)*20;
        const comp=this.calculateComplexity(polygons)*15;
        const ov=this.calculateOverlapScore(polygons)*15;
        return (sd+sq+cov+comp+ov)/100*100;
    },
    calculateSizeDiversity(polygons){
        const sizes=polygons.map(p=>Geometry.calculateArea(p.pts));
        const avg=sizes.reduce((a,b)=>a+b,0)/sizes.length;
        const std=Math.sqrt(sizes.reduce((s,x)=>s+Math.pow(x-avg,2),0)/sizes.length);
        return Math.min(1,avg>0?std/avg:0);
    },
    calculateShapeQuality(polygons){
        let s=0;
        for(const p of polygons){
            let ps=0;
            if(Geometry.isConvex(p.pts))ps+=0.3;
            const ar=Geometry.calculateAspectRatio(p.pts);
            if(ar>=0.3&&ar<=3.0)ps+=0.3;
            const c=Geometry.calculateCompactness(p.pts);
            if(c>=0.5&&c<=2.0)ps+=0.4;
            s+=ps;
        }
        return s/polygons.length;
    },
    calculateCoverage(polygons,w,h){
        if(!polygons.length)return 0;
        let covered=0;
        for(let i=0;i<100;i++){const x=Math.random()*w,y=Math.random()*h;for(const p of polygons)if(Geometry.pointInTriangle(x,y,p.pts)){covered++;break;}}
        return covered/100;
    },
    calculateComplexity(polygons){if(polygons.length<10)return 0.3;if(polygons.length>100)return 0.8;return 0.3+(polygons.length-10)/90*0.5;},
    calculateOverlapScore(polygons){
        if(polygons.length<2)return 1.0;
        let ov=0,comp=0;
        const bb=p=>({minX:Math.min(...p.pts.map(x=>x[0])),maxX:Math.max(...p.pts.map(x=>x[0])),minY:Math.min(...p.pts.map(y=>y[1])),maxY:Math.max(...p.pts.map(y=>y[1]))});
        for(let i=0;i<polygons.length;i++)for(let j=i+1;j<polygons.length;j++){const b1=bb(polygons[i]),b2=bb(polygons[j]);if(!(b2.minX>b1.maxX||b2.maxX<b1.minX||b2.minY>b1.maxY||b2.maxY<b1.minY))ov++;comp++;}
        return 1-Math.min(1,comp>0?ov/comp:0);
    }
};
window.StructuralFitness=StructuralFitness;
