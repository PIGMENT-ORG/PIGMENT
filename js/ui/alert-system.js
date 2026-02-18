const AlertSystem = {
    maxAlerts:5,duration:5000,
    show(message,type='info',duration=null){
        const area=document.getElementById('alert-area');if(!area)return null;
        const alert=document.createElement('div');alert.className=`alert alert-${type}`;
        alert.innerHTML=`<span class="alert-time">[${new Date().toLocaleTimeString()}]</span> <span>${message}</span><button class="alert-close" onclick="this.parentElement.remove()">×</button>`;
        area.appendChild(alert);
        while(area.children.length>this.maxAlerts)area.removeChild(area.firstChild);
        setTimeout(()=>alert.parentNode&&alert.remove(),duration||this.duration);
        return alert;
    },
    success(m){return this.show(m,'success');},
    error(m){return this.show(m,'error',8000);},
    warning(m){return this.show(m,'warning',6000);},
    info(m){return this.show(m,'info');},
    clear(){const a=document.getElementById('alert-area');if(a)a.innerHTML='';},
    milestone(fitness,gen){
        const milestones=[25,50,75,90,95,98,99];
        const msgs={25:'Starting to take shape!',50:'Halfway there!',75:'Looking great!',90:'Almost there!',95:'Fine-tuning...',98:'Excellent!',99:'Near perfect!'};
        const m=milestones.find(x=>Math.abs(fitness-x)<0.5);
        if(m&&msgs[m])this.success(`🎯 ${m}% — ${msgs[m]} (gen ${gen})`);
    },
    imageLoaded(n){this.success('✅ Image loaded: '+n);},
    genomeLoaded(c){this.success('✅ Genome loaded: '+c+' polygons');},
    exported(n){this.success('📄 Exported: '+n);},
    evolutionStarted(){this.info('▶ Evolution started');},
    evolutionPaused(){this.info('⏸ Evolution paused');},
    evolutionReset(){this.info('↺ Evolution reset');}
};
window.AlertSystem=AlertSystem;
