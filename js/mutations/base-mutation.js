const BaseMutation = {
    type:'base',params:{strength:1.0,temperature:1.0,probability:0.2},
    mutate(polygon,context={}){throw new Error('Implement mutate()');},
    calculateStrength(base,ctx){
        let s=base;
        if(ctx.temperature)s*=ctx.temperature;
        if(ctx.generation){if(ctx.generation<1000)s*=1.5;else if(ctx.generation>10000)s*=0.7;}
        if(ctx.fitness!==undefined){if(ctx.fitness>90)s*=0.5;else if(ctx.fitness<50)s*=1.3;}
        return Math.max(0.1,Math.min(2.0,s));
    },
    isValid(p,ctx={}){
        if(!p||!p.pts||p.pts.length!==3)return false;
        if(ctx.W&&ctx.H)for(const pt of p.pts)if(Math.abs(pt[0])>ctx.W*2||Math.abs(pt[1])>ctx.H*2)return false;
        return true;
    },
    clonePolygon(p){return {pts:p.pts.map(pt=>[pt[0],pt[1]]),r:p.r,g:p.g,b:p.b,a:p.a,id:p.id||Math.random().toString(36).substr(2,9)};},
    register(){if(!window.MutationRegistry)window.MutationRegistry={};window.MutationRegistry[this.type]=this;}
};
window.BaseMutation=BaseMutation;
