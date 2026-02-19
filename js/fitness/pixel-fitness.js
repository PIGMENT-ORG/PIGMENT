const PixelFitness = {
    calculateError(imageData,targetData){
        if(!targetData)return Infinity;
        const d=imageData.data,t=targetData.data;let err=0;
        for(let i=0;i<d.length;i+=8){const dr=d[i]-t[i],dg=d[i+1]-t[i+1],db=d[i+2]-t[i+2];err+=dr*dr+dg*dg+db*db;}
        return err*(d.length/(d.length/8*4));
    },
    calculateFitness(error,w,h){return Math.max(0,Math.min(100,100*(1-error/(255*255*3*w*h))));},
    createErrorMap(imageData,targetData){
        const w=imageData.width,h=imageData.height,map=new Float32Array(w*h);
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const dr=imageData.data[i]-targetData.data[i],dg=imageData.data[i+1]-targetData.data[i+1],db=imageData.data[i+2]-targetData.data[i+2];map[y*w+x]=Math.sqrt(dr*dr+dg*dg+db*db);}
        return map;
    }
};
window.PixelFitness=PixelFitness;
