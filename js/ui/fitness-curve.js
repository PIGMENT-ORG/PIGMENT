const FitnessCurve = {
    ctx:null,pixelHistory:[],structHistory:[],width:800,height:100,
    init(canvasId){
        const canvas=document.getElementById(canvasId);
        if(!canvas)return;
        this.ctx=canvas.getContext('2d');
        this.width=canvas.offsetWidth||800;this.height=canvas.height||100;
        canvas.width=this.width;
    },
    addPoint(pf,sf){
        this.pixelHistory.push(pf);this.structHistory.push(sf);
        if(this.pixelHistory.length>200){this.pixelHistory.shift();this.structHistory.shift();}
        this.draw();
    },
    update(pd,sd){this.pixelHistory=pd;this.structHistory=sd;this.draw();},
    draw(){
        if(!this.ctx||this.pixelHistory.length<2)return;
        const ctx=this.ctx,w=this.width,h=this.height;
        ctx.clearRect(0,0,w,h);
        const all=[...this.pixelHistory,...this.structHistory];
        const max=Math.max(...all,1),min=Math.min(...all,0),range=Math.max(max-min,1);
        const drawLine=(data,color,lw)=>{
            ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();
            data.forEach((v,i)=>{const x=(i/(data.length-1))*w,y=h-((v-min)/range)*(h-20)-10;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
            ctx.stroke();
        };
        drawLine(this.pixelHistory,'#c0a030',2);
        if(this.structHistory.length>0)drawLine(this.structHistory,'#608060',1.5);
        ctx.fillStyle='#5a5440';ctx.font='10px Courier New';
        ctx.fillText(max.toFixed(1)+'%',5,15);ctx.fillText(min.toFixed(1)+'%',5,h-5);
        if(this.pixelHistory.length){ctx.fillStyle='#c0a030';ctx.fillText('P:'+this.pixelHistory[this.pixelHistory.length-1].toFixed(1)+'%',w-80,15);ctx.fillStyle='#608060';ctx.fillText('S:'+((this.structHistory[this.structHistory.length-1])||0).toFixed(1),w-80,30);}
    },
    clear(){this.pixelHistory=[];this.structHistory=[];if(this.ctx)this.ctx.clearRect(0,0,this.width,this.height);}
};
window.FitnessCurve=FitnessCurve;
