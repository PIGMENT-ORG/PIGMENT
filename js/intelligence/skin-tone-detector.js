const SkinToneDetector = {
    skinRanges:[
        {h:[0,20],s:[0.2,0.6],v:[0.3,0.9],name:'light'},
        {h:[20,40],s:[0.3,0.7],v:[0.3,0.8],name:'medium'},
        {h:[40,60],s:[0.2,0.5],v:[0.2,0.7],name:'olive'},
        {h:[0,15],s:[0.5,0.9],v:[0.2,0.6],name:'dark'}
    ],
    detectSkin(imageData){
        const w=imageData.width,h=imageData.height,data=imageData.data;
        const map=new Uint8Array(w*h);let skinPx=0;
        for(let i=0;i<data.length;i+=4){
            const hsv=ColorUtils.rgbToHsv(data[i],data[i+1],data[i+2]);
            if(this.isSkinTone(hsv)){map[i/4]=1;skinPx++;}
        }
        return {map,percentage:skinPx/(w*h),dominantTone:this.findDominantSkinTone(data,w,h)};
    },
    isSkinTone(hsv){return this.skinRanges.some(r=>hsv.h>=r.h[0]&&hsv.h<=r.h[1]&&hsv.s>=r.s[0]&&hsv.s<=r.s[1]&&hsv.v>=r.v[0]&&hsv.v<=r.v[1]);},
    findDominantSkinTone(data,w,h){
        const counts={};
        for(let i=0;i<data.length;i+=4){
            const hsv=ColorUtils.rgbToHsv(data[i],data[i+1],data[i+2]);
            for(const r of this.skinRanges)if(hsv.h>=r.h[0]&&hsv.h<=r.h[1]&&hsv.s>=r.s[0]&&hsv.s<=r.s[1]&&hsv.v>=r.v[0]&&hsv.v<=r.v[1]){counts[r.name]=(counts[r.name]||0)+1;break;}
        }
        let dom='light',mx=0;
        for(const [t,c] of Object.entries(counts))if(c>mx){mx=c;dom=t;}
        return dom;
    },
    generateSkinPalette(dominantTone,count=5){
        const bases={light:{h:[20,30],s:[0.3,0.4],v:[0.7,0.8]},medium:{h:[25,35],s:[0.4,0.5],v:[0.6,0.7]},olive:{h:[40,50],s:[0.3,0.4],v:[0.5,0.6]},dark:{h:[10,20],s:[0.5,0.6],v:[0.3,0.4]}};
        const range=bases[dominantTone]||bases.light;const palette=[];
        for(let i=0;i<count;i++){const h=range.h[0]+Math.random()*(range.h[1]-range.h[0]),s=range.s[0]+Math.random()*(range.s[1]-range.s[0]),v=range.v[0]+Math.random()*(range.v[1]-range.v[0]);palette.push(ColorUtils.hsvToRgb(h,s,v));}
        return palette;
    }
};
window.SkinToneDetector = SkinToneDetector;
