const VisualIntelligence = {
    init(targetImageData){
        this.targetData=targetImageData;this.w=targetImageData.width;this.h=targetImageData.height;
        this.face=FaceDetector.detect(targetImageData);
        this.skinMap=SkinToneDetector.detectSkin(targetImageData);
        this.symmetry=SymmetryAnalyzer.calculateSymmetry(targetImageData);
        this.edges=ImageUtils.detectEdges(targetImageData);
        this.importanceMap=EdgeImportance.createImportanceMap(this.w,this.h,this.face);
        console.log('VisualIntelligence init',{faceDetected:!!this.face,skin:this.skinMap.percentage,sym:this.symmetry});
    },
    analyze(polygons){
        const analysis={faceScore:0,skinScore:0,symmetryScore:0,edgeScore:0,compositionScore:0,suggestions:[]};
        if(this.face){
            analysis.symmetryScore=SymmetryAnalyzer.calculatePolygonSymmetry(polygons.filter(p=>{const c=Geometry.getCentroid(p.pts);return c.x>=this.face.x&&c.x<=this.face.x+this.face.width&&c.y>=this.face.y&&c.y<=this.face.y+this.face.height;}),'vertical');
            if(analysis.symmetryScore<0.5)analysis.suggestions.push({type:'improve_symmetry',priority:1});
        }
        analysis.compositionScore=CompositionRules.scoreComposition(polygons,this.w,this.h);
        return analysis;
    },
    suggestMutation(analysis,generation,fitness){
        if(analysis.suggestions.length>0&&Math.random()<0.3){const t=analysis.suggestions[0].type;if(t==='improve_symmetry')return {type:'balance_symmetry'};}
        return {type:'adaptive',rate:generation<1000?1.5:fitness>90?0.5:1.0};
    },
    getFeedback(){
        return {faceDetected:!!this.face,faceScore:this.face?this.face.score:0,skinPercentage:this.skinMap?this.skinMap.percentage:0,symmetry:this.symmetry,dominantTone:this.skinMap?this.skinMap.dominantTone:'unknown'};
    }
};
window.VisualIntelligence = VisualIntelligence;
