const EdgeImportance = {
    regionWeights:{eyes:3.0,nose:2.0,mouth:2.5,jawline:2.0,faceOutline:1.8,background:0.5},
    createImportanceMap(w,h,faceRegion=null){
        const map=new Float32Array(w*h).fill(1.0);
        if(!faceRegion){const cx=w/2,cy=h/2;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const d=Math.sqrt(Math.pow((x-cx)/(w/2),2)+Math.pow((y-cy)/(h/2),2));map[y*w+x]=1.0+(1.0-Math.min(1,d))*2;}return map;}
        this.applyFaceImportance(map,w,h,faceRegion);return map;
    },
    applyFaceImportance(map,w,h,fr){
        const regions=[
            {x:fr.x+fr.width*0.3,y:fr.y+fr.height*0.3,w:fr.width*0.4,h:fr.height*0.2,weight:this.regionWeights.eyes},
            {x:fr.x+fr.width*0.45,y:fr.y+fr.height*0.5,w:fr.width*0.1,h:fr.height*0.1,weight:this.regionWeights.nose},
            {x:fr.x+fr.width*0.35,y:fr.y+fr.height*0.65,w:fr.width*0.3,h:fr.height*0.1,weight:this.regionWeights.mouth}
        ];
        for(const r of regions){
            for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
                const px=Math.floor(x),py=Math.floor(y);
                if(px>=0&&px<w&&py>=0&&py<h)map[py*w+px]=r.weight;
            }
        }
    },
    weightEdges(edgeMap,importanceMap){const w=new Float32Array(edgeMap.length);for(let i=0;i<edgeMap.length;i++)w[i]=edgeMap[i]*importanceMap[i];return w;},
    getImportantRegions(importanceMap,threshold=2.0){
        const regions=[];const w=Math.sqrt(importanceMap.length),h=importanceMap.length/w;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(importanceMap[i]>=threshold)regions.push({x,y,importance:importanceMap[i]});}
        return regions;
    }
};
window.EdgeImportance = EdgeImportance;
