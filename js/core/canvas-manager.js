const CanvasManager = {
    canvases:{target:null,evolved:null,diff:null,work:null},
    contexts:{target:null,evolved:null,diff:null,work:null},
    width:200,height:200,displayScale:2,
    init(targetId,evolvedId,diffId){
        this.canvases.target=document.getElementById(targetId);
        this.canvases.evolved=document.getElementById(evolvedId);
        this.canvases.diff=document.getElementById(diffId);
        this.canvases.work=document.createElement('canvas');
        this.contexts.target=this.canvases.target.getContext('2d');
        this.contexts.evolved=this.canvases.evolved.getContext('2d');
        this.contexts.diff=this.canvases.diff.getContext('2d');
        this.contexts.work=this.canvases.work.getContext('2d');
        return this;
    },
    setDimensions(width,height){
        this.width=width;this.height=height;
        this.canvases.work.width=width;this.canvases.work.height=height;
        const dw=width*this.displayScale,dh=height*this.displayScale;
        ['target','evolved','diff'].forEach(k=>{this.canvases[k].width=dw;this.canvases[k].height=dh;});
        return this;
    },
    drawTarget(imageData){
        const temp=document.createElement('canvas');temp.width=this.width;temp.height=this.height;
        temp.getContext('2d').putImageData(imageData,0,0);
        this.contexts.target.drawImage(temp,0,0,this.canvases.target.width,this.canvases.target.height);
    },
    renderToWork(polygons,options={}){
        const ctx=this.contexts.work,w=this.width,h=this.height;
        ctx.clearRect(0,0,w,h);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
        for(const p of polygons){
            ctx.beginPath();ctx.moveTo(p.pts[0][0],p.pts[0][1]);
            for(let i=1;i<p.pts.length;i++)ctx.lineTo(p.pts[i][0],p.pts[i][1]);
            ctx.closePath();
            if(options.showOutlines){ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=0.5;ctx.stroke();}
            ctx.fillStyle=`rgba(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)},${p.a/255})`;ctx.fill();
        }
        return ctx.getImageData(0,0,w,h);
    },
    updateEvolved(){this.contexts.evolved.drawImage(this.canvases.work,0,0,this.canvases.evolved.width,this.canvases.evolved.height);},
    updateDiff(targetData){
        const workData=this.contexts.work.getImageData(0,0,this.width,this.height);
        const diff=new ImageData(this.width,this.height);
        for(let i=0;i<workData.data.length;i+=4){
            diff.data[i]=Math.min(255,Math.abs(workData.data[i]-targetData.data[i])*4);
            diff.data[i+1]=Math.min(255,Math.abs(workData.data[i+1]-targetData.data[i+1])*4);
            diff.data[i+2]=Math.min(255,Math.abs(workData.data[i+2]-targetData.data[i+2])*4);
            diff.data[i+3]=255;
        }
        const temp=document.createElement('canvas');temp.width=this.width;temp.height=this.height;
        temp.getContext('2d').putImageData(diff,0,0);
        this.contexts.diff.drawImage(temp,0,0,this.canvases.diff.width,this.canvases.diff.height);
    },
    getWorkData(){return this.contexts.work.getImageData(0,0,this.width,this.height);},
    clear(){Object.values(this.contexts).forEach(ctx=>{if(ctx)ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);});}
};
window.CanvasManager=CanvasManager;
