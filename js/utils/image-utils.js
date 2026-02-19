// Image Utilities
const ImageUtils = {
    loadImage(file, callback) {
        const reader = new FileReader();
        reader.onload = e => { const img=new Image(); img.onload=()=>callback(img); img.src=e.target.result; };
        reader.readAsDataURL(file);
    },
    resizeToFit(img, maxW, maxH) {
        const ratio=img.height/img.width; let w=maxW,h=Math.round(w*ratio);
        if(h>maxH){h=maxH;w=Math.round(h/ratio);}
        return {width:w,height:h};
    },
    getImageData(img, width, height) {
        const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
        const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,width,height);
        return ctx.getImageData(0,0,width,height);
    },
    toGrayscale(imageData) {
        const data=imageData.data,gray=new Uint8ClampedArray(data.length);
        for(let i=0;i<data.length;i+=4){const a=(data[i]+data[i+1]+data[i+2])/3;gray[i]=gray[i+1]=gray[i+2]=a;gray[i+3]=255;}
        return new ImageData(gray,imageData.width,imageData.height);
    },
    detectEdges(imageData) {
        const w=imageData.width,h=imageData.height,data=imageData.data,edges=new Float32Array(w*h);
        for(let y=1;y<h-1;y++){
            for(let x=1;x<w-1;x++){
                const i=(y*w+x)*4;
                const gx=-data[i-4]+data[i+4]-2*data[i-w*4]+2*data[i+w*4]-data[i-w*4-4]+data[i+w*4+4];
                const gy=-data[i-w*4]+data[i+w*4]-2*data[i-4]+2*data[i+4]-data[i-w*4-4]+data[i+w*4+4];
                edges[y*w+x]=Math.min(1,Math.sqrt(gx*gx+gy*gy)/500);
            }
        }
        return edges;
    },
    createDiffImage(img1, img2) {
        const w=img1.width,h=img1.height,diff=new ImageData(w,h);
        for(let i=0;i<img1.data.length;i+=4){
            diff.data[i]=Math.abs(img1.data[i]-img2.data[i])*4;
            diff.data[i+1]=Math.abs(img1.data[i+1]-img2.data[i+1])*4;
            diff.data[i+2]=Math.abs(img1.data[i+2]-img2.data[i+2])*4;
            diff.data[i+3]=255;
        }
        return diff;
    }
};
window.ImageUtils = ImageUtils;
