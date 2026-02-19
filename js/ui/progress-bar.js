const ProgressBar = {
    value:0,history:[],target:0,
    update(rawFitness){
        this.target=rawFitness;
        const sig=100/(1+Math.exp(-(rawFitness-50)/12));
        this.history.push(sig);if(this.history.length>10)this.history.shift();
        this.value=this.history.reduce((a,b)=>a+b,0)/this.history.length;
        const el=document.getElementById('progressFill');if(el)el.style.width=this.value+'%';
    },
    calculateETA(history,currentFitness,gensPerSec){
        if(history.length<20||gensPerSec===0)return Infinity;
        const recent=history.slice(-20),rate=(recent[recent.length-1]-recent[0])/20;
        if(rate<=0)return Infinity;
        return ((99.5-currentFitness)/rate)/gensPerSec;
    },
    getStage(f){if(f<30)return'initial';if(f<60)return'exploring';if(f<80)return'developing';if(f<95)return'refining';return'polishing';},
    reset(){this.value=0;this.target=0;this.history=[];const el=document.getElementById('progressFill');if(el)el.style.width='0%';}
};
window.ProgressBar=ProgressBar;
