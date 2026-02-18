const StatsDisplay = {
    update(stats){
        this.set('sg',stats.generations.toLocaleString());
        this.set('sf',stats.fitness.toFixed(2)+'%');
        this.set('ss',stats.structural.toFixed(2));
        this.set('si',stats.improvements.toLocaleString());
        this.set('sr',Math.round(stats.speed)+'/s');
        const ms=Math.floor(stats.time/60),ss=Math.floor(stats.time%60);
        this.set('stime',`${ms}:${ss.toString().padStart(2,'0')}`);
        if(stats.eta>0&&stats.eta<999999){const me=Math.floor(stats.eta/60),se=Math.floor(stats.eta%60);this.set('seta',`${me}:${se.toString().padStart(2,'0')}`);}else this.set('seta','--:--');
        this.set('speak',stats.peak.toFixed(1)+'%');
        if(stats.intelligence){this.set('faceScore',stats.intelligence.faceScore?.toFixed(2)||'0.00');this.set('symScore',stats.intelligence.symmetry?.toFixed(2)||'0.00');this.set('skinScore',((stats.intelligence.skinPercentage||0)*100).toFixed(0)+'%');}
    },
    set(id,val){const el=document.getElementById(id);if(el)el.textContent=val;},
    updateProgress(p){const el=document.getElementById('progressFill');if(el)el.style.width=p+'%';},
    updateGenome(content){const el=document.getElementById('pg-out');if(el)el.value=content;},
    clear(){['sg','sf','ss','si','sr','stime','seta','speak'].forEach(id=>this.set(id,'0'));this.set('seta','--:--');this.set('sf','0.00%');this.set('speak','0%');this.updateProgress(0);this.updateGenome('');}
};
window.StatsDisplay=StatsDisplay;
