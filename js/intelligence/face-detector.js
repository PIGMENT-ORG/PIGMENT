const FaceDetector = {
    model: {
        features: {
            leftEye:{x:0.4,y:0.4,radius:0.05},rightEye:{x:0.6,y:0.4,radius:0.05},
            nose:{x:0.5,y:0.55,radius:0.07},mouth:{x:0.5,y:0.7,width:0.15,height:0.05}
        }
    },
    detect(imageData) {
        const w=imageData.width,h=imageData.height,data=imageData.data;
        const gray=this.toGrayscale(data);
        // Simple heuristic face detection based on region scoring
        const region={x:w*0.2,y:h*0.1,width:w*0.6,height:h*0.7,score:0};
        region.score=this.scoreRegion(region,gray,w,h);
        return region.score>0.1?region:null;
    },
    toGrayscale(data){const g=new Uint8Array(data.length/4);for(let i=0;i<data.length;i+=4)g[i/4]=(data[i]+data[i+1]+data[i+2])/3;return g;},
    detectEye(gray,cx,cy,w,h){
        if(cx<0||cx>=w||cy<0||cy>=h)return 0;
        let dark=0,total=0;const r=5;
        for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=cx+dx,y=cy+dy;if(x>=0&&x<w&&y>=0&&y<h){if(gray[y*w+x]<100)dark++;total++;}}
        return total>0?dark/total:0;
    },
    detectNose(gray,cx,cy,w,h){
        if(cx<0||cx>=w||cy<0||cy>=h)return 0;
        let s=0;const len=10;
        for(let dy=-len;dy<=len;dy++){const y=cy+dy;if(y>=0&&y<h){const i=y*w+Math.floor(cx);s+=Math.abs((gray[i-1]||gray[i])-(gray[i+1]||gray[i]));}}
        return Math.min(1,s/(len*2*50));
    },
    detectMouth(gray,cx,cy,w,h){
        if(cx<0||cx>=w||cy<0||cy>=h)return 0;
        let s=0;const width=15;
        for(let dx=-width;dx<=width;dx++){const x=cx+dx;if(x>=0&&x<w){const i=cy*w+x;s+=Math.abs((gray[i-w]||gray[i])-(gray[i+w]||gray[i]));}}
        return Math.min(1,s/(width*2*50));
    },
    scoreRegion(region,gray,w,h){
        const f=this.model.features;
        const le=this.detectEye(gray,Math.floor(region.x+region.width*f.leftEye.x),Math.floor(region.y+region.height*f.leftEye.y),w,h);
        const re=this.detectEye(gray,Math.floor(region.x+region.width*f.rightEye.x),Math.floor(region.y+region.height*f.rightEye.y),w,h);
        const ns=this.detectNose(gray,Math.floor(region.x+region.width*f.nose.x),Math.floor(region.y+region.height*f.nose.y),w,h);
        const ms=this.detectMouth(gray,Math.floor(region.x+region.width*f.mouth.x),Math.floor(region.y+region.height*f.mouth.y),w,h);
        return (le+re)*3+ns*2+ms*2;
    },
    getImportanceMap(w,h,faceRegion=null){
        const map=new Float32Array(w*h).fill(0.5);
        if(!faceRegion)return map;
        const f=this.model.features;
        Object.entries(f).forEach(([name,pos])=>{
            const fx=faceRegion.x+faceRegion.width*pos.x;
            const fy=faceRegion.y+faceRegion.height*pos.y;
            const radius=(pos.radius||0.05)*faceRegion.width;
            for(let dy=-radius*2;dy<=radius*2;dy++)for(let dx=-radius*2;dx<=radius*2;dx++){
                const x=Math.floor(fx+dx),y=Math.floor(fy+dy);
                if(x>=0&&x<w&&y>=0&&y<h){const dist=Math.sqrt(dx*dx+dy*dy);if(dist<radius*2)map[y*w+x]=Math.max(map[y*w+x],1.0-dist/(radius*2));}
            }
        });
        return map;
    }
};
window.FaceDetector = FaceDetector;
