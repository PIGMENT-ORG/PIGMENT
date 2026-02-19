const PGExporter = {
    export(polygons,metadata){
        const lines=[`-- PIGMENT Genome`,`-- Generated: ${new Date().toLocaleString()}`,`-- Generations: ${metadata.generations||0}`,`-- Fitness: ${metadata.fitness?metadata.fitness.toFixed(2):'0.00'}%`,`-- Polygons: ${polygons.length}`,`-- Algorithm: ${metadata.algorithm||'multi-objective'}`,``,`canvas {`,`  width: ${metadata.width||200}`,`  height: ${metadata.height||200}`,`  title: "${metadata.title||'Evolved Painting'}"`,`}`,``,`polygons {`];
        for(let i=0;i<polygons.length;i++){const p=polygons[i];const pts=p.pts.map(pt=>`${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');lines.push(`  poly-${i} {`,`    points: ${pts}`,`    color: rgba(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)},${(p.a/255).toFixed(2)})`,`  }`);}
        lines.push(`}`);return lines.join('\n');
    },
    download(content,filename){const blob=new Blob([content],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename.endsWith('.pg')?filename:filename+'.pg';a.click();URL.revokeObjectURL(url);},
    copyToClipboard(content){navigator.clipboard.writeText(content).catch(()=>{const t=document.createElement('textarea');t.value=content;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);});},
    generateFilename(metadata){const d=new Date();const ds=`${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}`;return `pigment_${ds}_gen${metadata.generations||0}_${Math.round(metadata.fitness||0)}.pg`;},
    exportWithMetadata(polygons,metadata){const c=this.export(polygons,metadata);this.download(c,this.generateFilename(metadata));return c;}
};
window.PGExporter=PGExporter;
