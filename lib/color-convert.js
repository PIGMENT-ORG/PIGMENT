// Color Conversion Library
const ColorConvert = {
    rgbToHsl(r,g,b){
        r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;
        if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}
        return{h:h*360,s,l};
    },
    hslToRgb(h,s,l){
        h/=360;let r,g,b;
        if(s===0){r=g=b=l;}else{const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);}
        return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};
    },
    rgbToHex(r,g,b){return'#'+(r<16?'0':'')+r.toString(16)+(g<16?'0':'')+g.toString(16)+(b<16?'0':'')+b.toString(16);},
    hexToRgb(hex){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?{r:parseInt(r[1],16),g:parseInt(r[2],16),b:parseInt(r[3],16)}:null;}
};
window.ColorConvert=ColorConvert;
