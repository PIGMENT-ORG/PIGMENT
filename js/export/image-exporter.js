const ImageExporter = {
    renderToCanvas(polygons,width,height){
        const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);
        const sx=width/200,sy=height/200;
        for(const p of polygons){ctx.beginPath();ctx.moveTo(p.pts[0][0]*sx,p.pts[0][1]*sy);for(let i=1;i<p.pts.length;i++)ctx.lineTo(p.pts[i][0]*sx,p.pts[i][1]*sy);ctx.closePath();ctx.fillStyle=`rgba(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)},${p.a/255})`;ctx.fill();}
        return canvas;
    },
    exportPNG(polygons,w,h,scale=1){return this.renderToCanvas(polygons,w*scale,h*scale).toDataURL('image/png');},
    exportJPG(polygons,w,h,scale=1,quality=0.95){return this.renderToCanvas(polygons,w*scale,h*scale).toDataURL('image/jpeg',quality);},
    exportSVG(polygons,w,h){let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/>`;for(const p of polygons)s+=`<polygon points="${p.pts.map(pt=>pt.join(',')).join(' ')}" fill="rgba(${p.r},${p.g},${p.b},${p.a/255})"/>`;s+='</svg>';return s;},
    download(dataURL,filename){const a=document.createElement('a');a.href=dataURL;a.download=filename;a.click();},
    generateFilename(metadata,format){const d=new Date();const ds=`${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}`;return `pigment_${ds}_gen${metadata.generations||0}_${Math.round(metadata.fitness||0)}.${format}`;},
    export(polygons,metadata,options={}){
        const format=options.format||'png',scale=options.scale||1,w=metadata.width||200,h=metadata.height||200;
        let dataURL;
        if(format==='svg'){dataURL='data:image/svg+xml,'+encodeURIComponent(this.exportSVG(polygons,w*scale,h*scale));}
        else if(format==='jpg'||format==='jpeg'){dataURL=this.exportJPG(polygons,w,h,scale,options.quality);}
        else{dataURL=this.exportPNG(polygons,w,h,scale);}
        this.download(dataURL,this.generateFilename(metadata,format));return dataURL;
    }
};
window.ImageExporter=ImageExporter;
