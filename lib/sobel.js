// Sobel Edge Detection Library
const SobelLib = {
    apply(imageData) {
        const w=imageData.width,h=imageData.height,data=imageData.data;
        const output=new Float32Array(w*h);
        for(let y=1;y<h-1;y++){
            for(let x=1;x<w-1;x++){
                const i=(y*w+x)*4;
                const gray=d=>(d[0]+d[1]+d[2])/3;
                const tl=gray(Array.from({length:4},(_,k)=>data[(y-1)*w*4+(x-1)*4+k]));
                const tm=gray(Array.from({length:4},(_,k)=>data[(y-1)*w*4+x*4+k]));
                const tr=gray(Array.from({length:4},(_,k)=>data[(y-1)*w*4+(x+1)*4+k]));
                const ml=gray(Array.from({length:4},(_,k)=>data[y*w*4+(x-1)*4+k]));
                const mr=gray(Array.from({length:4},(_,k)=>data[y*w*4+(x+1)*4+k]));
                const bl=gray(Array.from({length:4},(_,k)=>data[(y+1)*w*4+(x-1)*4+k]));
                const bm=gray(Array.from({length:4},(_,k)=>data[(y+1)*w*4+x*4+k]));
                const br=gray(Array.from({length:4},(_,k)=>data[(y+1)*w*4+(x+1)*4+k]));
                const gx=-tl+tr-2*ml+2*mr-bl+br;
                const gy=-tl-2*tm-tr+bl+2*bm+br;
                output[y*w+x]=Math.min(1,Math.sqrt(gx*gx+gy*gy)/400);
            }
        }
        return output;
    },
    toImageData(edgeMap,w,h){
        const data=new Uint8ClampedArray(w*h*4);
        for(let i=0;i<edgeMap.length;i++){const v=Math.round(edgeMap[i]*255);data[i*4]=data[i*4+1]=data[i*4+2]=v;data[i*4+3]=255;}
        return new ImageData(data,w,h);
    }
};
window.SobelLib=SobelLib;
