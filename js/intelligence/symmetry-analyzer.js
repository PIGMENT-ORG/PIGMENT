const SymmetryAnalyzer = {
    calculateSymmetry(imageData,axis='vertical'){
        const w=imageData.width,h=imageData.height,data=imageData.data;
        let sym=0,comp=0;
        if(axis==='vertical'){
            for(let y=0;y<h;y++)for(let x=0;x<w/2;x++){
                const li=(y*w+x)*4,ri=(y*w+(w-1-x))*4;
                const lb=(data[li]+data[li+1]+data[li+2])/3,rb=(data[ri]+data[ri+1]+data[ri+2])/3;
                sym+=1-Math.abs(lb-rb)/255;comp++;
            }
        } else {
            for(let y=0;y<h/2;y++)for(let x=0;x<w;x++){
                const ti=(y*w+x)*4,bi=((h-1-y)*w+x)*4;
                const tb=(data[ti]+data[ti+1]+data[ti+2])/3,bb=(data[bi]+data[bi+1]+data[bi+2])/3;
                sym+=1-Math.abs(tb-bb)/255;comp++;
            }
        }
        return comp>0?sym/comp:0;
    },
    calculatePolygonSymmetry(polygons,axis='vertical'){
        if(axis==='none')return 1.0;
        const left=[],right=[];
        polygons.forEach(p=>{const c=Geometry.getCentroid(p.pts);(axis==='vertical'?c.x<0.5:c.y<0.5)?left.push(p):right.push(p);});
        if(!left.length||!right.length)return 0.5;
        let sym=0;const pairs=Math.min(left.length,right.length);
        for(let i=0;i<pairs;i++){
            const l=left[i],r=right[i];
            const cd=Math.abs(l.r-r.r)+Math.abs(l.g-r.g)+Math.abs(l.b-r.b);
            const cs=1-cd/(255*3);
            const la=Geometry.calculateArea(l.pts),ra=Geometry.calculateArea(r.pts);
            const as=1-Math.abs(la-ra)/Math.max(la,ra);
            sym+=(cs+as)/2;
        }
        return sym/pairs;
    }
};
window.SymmetryAnalyzer = SymmetryAnalyzer;
