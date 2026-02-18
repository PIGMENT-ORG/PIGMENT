const Pigment = {
    canvas:null,evolution:null,intelligence:null,
    running:false,paused:false,startTime:null,rafId:null,
    targetData:null,lastMilestone:0,lastFrameTime:0,
    settings:{width:200,height:200,useIntelligence:true},
    init(){
        this.canvas=CanvasManager.init('cvt','cve','cvd');
        MutationRegistry.init();
        UIControls.init();
        FitnessCurve.init('crv');
        this.setupPasteListener();
        AlertSystem.info('✨ PIGMENT ready — Drop an image to start!');
        return this;
    },
    setupPasteListener(){
        document.addEventListener('paste',e=>{
            const t=e.clipboardData.getData('text');
            if(t.includes('-- PIGMENT Genome'))this.loadPGFromString(t);
        });
    },
    loadImage(file){
        ImageUtils.loadImage(file,img=>{
            if(!img){AlertSystem.error('Failed to load image');return;}
            const dims=ImageUtils.resizeToFit(img,200,300);
            this.settings.width=dims.width;this.settings.height=dims.height;
            this.targetData=ImageUtils.getImageData(img,dims.width,dims.height);
            this.canvas.setDimensions(dims.width,dims.height);
            this.canvas.drawTarget(this.targetData);
            if(this.settings.useIntelligence){VisualIntelligence.init(this.targetData);this.intelligence=VisualIntelligence;}
            this.evolution=EvolutionEngine.init({width:dims.width,height:dims.height,targetData:this.targetData,intelligence:this.intelligence});
            ['bstart','breset','bstep'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=false;});
            AlertSystem.imageLoaded(file.name);
            this.updateDisplay();
        });
    },
    loadPG(file){
        PGParser.loadFromFile(file,(err,result)=>{
            if(err){AlertSystem.error('Invalid .pg file');return;}
            this.settings.width=result.metadata.width;this.settings.height=result.metadata.height;
            this.canvas.setDimensions(result.metadata.width,result.metadata.height);
            this.evolution=EvolutionEngine.init({width:result.metadata.width,height:result.metadata.height,targetData:this.targetData,intelligence:this.intelligence});
            this.evolution.loadCheckpoint({polygons:result.polygons,generation:result.metadata.generations||0});
            this.updateDisplay();
            AlertSystem.genomeLoaded(result.polygons.length);
        });
    },
    loadPGFromString(content){
        const result=PGParser.loadFromString(content);
        if(result&&result.success){
            this.settings.width=result.metadata.width;this.settings.height=result.metadata.height;
            this.canvas.setDimensions(result.metadata.width,result.metadata.height);
            this.evolution=EvolutionEngine.init({width:result.metadata.width,height:result.metadata.height,targetData:this.targetData,intelligence:this.intelligence});
            this.evolution.loadCheckpoint({polygons:result.polygons,generation:result.metadata.generations||0});
            this.updateDisplay();
            AlertSystem.success('✅ Pasted genome loaded!');
        }
    },
    start(){
        if(!this.targetData){AlertSystem.warning('Please load an image first');return;}
        this.running=true;this.paused=false;this.startTime=this.startTime||performance.now();
        UIControls.updateRunningState(true);AlertSystem.evolutionStarted();
        this.loop();
    },
    pause(){
        this.paused=!this.paused;UIControls.updatePauseButton(this.paused);
        if(!this.paused)this.loop();else AlertSystem.evolutionPaused();
    },
    reset(){
        this.running=false;this.paused=false;this.startTime=null;this.lastMilestone=0;
        if(this.rafId){cancelAnimationFrame(this.rafId);this.rafId=null;}
        if(this.evolution)this.evolution.reset();
        UIControls.updateRunningState(false);UIControls.updatePauseButton(false);
        StatsDisplay.clear();FitnessCurve.clear();ProgressBar.reset();
        this.updateDisplay();AlertSystem.evolutionReset();
    },
    step(){if(!this.evolution||(!this.paused&&this.running))return;this.evolution.step();this.updateDisplay();},
    loop(){
        if(!this.running||this.paused){this.rafId=null;return;}
        const now=performance.now();
        if(now-this.lastFrameTime>=16){
            const result=this.evolution.step();
            this.lastFrameTime=now;
            if(this.evolution.generation%4===0)this.updateDisplay();
            const f=Math.floor(result.fitness/5)*5;
            if(f>this.lastMilestone&&f>=25){this.lastMilestone=f;AlertSystem.milestone(result.fitness,result.generation);}
        }
        this.rafId=requestAnimationFrame(()=>this.loop());
    },
    updateDisplay(){
        if(!this.evolution)return;
        const stats=this.evolution.getStats();
        const settings=UIControls.getSettings();
        this.canvas.renderToWork(this.evolution.bestPolys,{showOutlines:settings.showOutlines});
        this.canvas.updateEvolved();
        if(this.targetData)this.canvas.updateDiff(this.targetData);
        const elapsed=this.startTime?(performance.now()-this.startTime)/1000:0;
        const speed=elapsed>0?stats.generations/elapsed:0;
        const peak=Math.max(...(this.evolution.fitnessHistory.length?this.evolution.fitnessHistory:[0]),stats.fitness);
        StatsDisplay.update({...stats,speed,time:elapsed,eta:ProgressBar.calculateETA(this.evolution.fitnessHistory,stats.fitness,speed),peak,intelligence:this.intelligence?this.intelligence.getFeedback():null});
        ProgressBar.update(stats.fitness);
        FitnessCurve.addPoint(stats.fitness,stats.structural);
        if(stats.generations%100===0)this.refreshGenome();
    },
    exportPG(){
        if(!this.evolution)return;
        const stats=this.evolution.getStats();
        const meta={generations:stats.generations,fitness:stats.fitness,width:this.settings.width,height:this.settings.height,algorithm:document.getElementById('algorithm')?.value||'multi'};
        const content=PGExporter.export(this.evolution.bestPolys,meta);
        const fn=PGExporter.generateFilename(meta);
        PGExporter.download(content,fn);AlertSystem.exported(fn);
    },
    copyGenome(){
        if(!this.evolution)return;
        const stats=this.evolution.getStats();
        const meta={generations:stats.generations,fitness:stats.fitness,width:this.settings.width,height:this.settings.height};
        const content=PGExporter.export(this.evolution.bestPolys,meta);
        PGExporter.copyToClipboard(content);StatsDisplay.updateGenome(content);
        AlertSystem.success('📋 Genome copied to clipboard!');
    },
    refreshGenome(){
        if(!this.evolution)return;
        const stats=this.evolution.getStats();
        const meta={generations:stats.generations,fitness:stats.fitness,width:this.settings.width,height:this.settings.height};
        StatsDisplay.updateGenome(PGExporter.export(this.evolution.bestPolys,meta));
    },
    exportImage(format){
        if(!this.evolution)return;
        const stats=this.evolution.getStats();
        const scale=parseInt(document.getElementById('exportScale')?.value||'2');
        const meta={generations:stats.generations,fitness:stats.fitness,width:this.settings.width,height:this.settings.height};
        ImageExporter.export(this.evolution.bestPolys,meta,{format,scale});
        AlertSystem.success(`📸 ${format.toUpperCase()} saved at ${scale}x resolution`);
    },
    updateParam(name,value){
        if(name==='mutationRate'&&this.evolution)this.evolution.mutationRate=parseFloat(value);
        if(name==='useIntelligence')this.settings.useIntelligence=value;
        if(name==='temperature'){}
    }
};
window.addEventListener('load',()=>{window.Pigment=Pigment.init();});
