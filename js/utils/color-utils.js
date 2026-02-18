// Color Utilities
const ColorUtils = {
    rgbToHsv(r,g,b) {
        r/=255;g/=255;b/=255;
        const max=Math.max(r,g,b),min=Math.min(r,g,b),diff=max-min;
        let h=0,s=max===0?0:diff/max,v=max;
        if(diff!==0){
            if(max===r) h=60*((g-b)/diff+(g<b?6:0));
            else if(max===g) h=60*((b-r)/diff+2);
            else h=60*((r-g)/diff+4);
        }
        return {h:(h+360)%360,s,v};
    },
    hsvToRgb(h,s,v) {
        h/=60; const i=Math.floor(h),f=h-i,p=v*(1-s),q=v*(1-s*f),t=v*(1-s*(1-f));
        let r,g,b;
        switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;case 5:r=v;g=p;b=q;break;}
        return {r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};
    },
    colorDelta(r1,g1,b1,r2,g2,b2) {
        const dr=r1-r2,dg=g1-g2,db=b1-b2;
        return Math.sqrt(dr*dr*0.3+dg*dg*0.5+db*db*0.2);
    },
    isSkinTone(r,g,b) {
        const hsv=this.rgbToHsv(r,g,b);
        const ranges=[
            {h:[0,20],s:[0.2,0.6],v:[0.3,0.9]},{h:[20,40],s:[0.3,0.7],v:[0.3,0.8]},
            {h:[40,60],s:[0.2,0.5],v:[0.2,0.7]},{h:[0,15],s:[0.5,0.9],v:[0.2,0.6]}
        ];
        return ranges.some(r=>hsv.h>=r.h[0]&&hsv.h<=r.h[1]&&hsv.s>=r.s[0]&&hsv.s<=r.s[1]&&hsv.v>=r.v[0]&&hsv.v<=r.v[1]);
    },
    randomColor() { return {r:Math.floor(Math.random()*255),g:Math.floor(Math.random()*255),b:Math.floor(Math.random()*255)}; },
    randomSkinTone() { const h=20+Math.random()*20,s=0.3+Math.random()*0.3,v=0.5+Math.random()*0.3; return this.hsvToRgb(h,s,v); },
    blendColors(c1,c2,ratio) { return {r:Math.round(c1.r*(1-ratio)+c2.r*ratio),g:Math.round(c1.g*(1-ratio)+c2.g*ratio),b:Math.round(c1.b*(1-ratio)+c2.b*ratio)}; },
    colorTemperature(r,g,b) { return (r-b)/255; },
    complementary(r,g,b) { return {r:255-r,g:255-g,b:255-b}; }
};
window.ColorUtils = ColorUtils;
