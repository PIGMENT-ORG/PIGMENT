const PGParser = {
    parse(content){
        const polygons=[],metadata=this.parseMetadata(content),blocks=this.extractPolyBlocks(content);
        for(const b of blocks){const p=this.parsePolyBlock(b);if(p)polygons.push(p);}
        return {polygons,metadata,success:polygons.length>0};
    },
    parseMetadata(content){
        const m={generations:0,fitness:0,width:200,height:200,title:'Evolved Painting',algorithm:'unknown'};
        const gm=content.match(/Generations:\s*([\d,]+)/);if(gm)m.generations=parseInt(gm[1].replace(/,/g,''));
        const fm=content.match(/Fitness:\s*([\d.]+)%/);if(fm)m.fitness=parseFloat(fm[1]);
        const wm=content.match(/width:\s*(\d+)/);if(wm)m.width=parseInt(wm[1]);
        const hm=content.match(/height:\s*(\d+)/);if(hm)m.height=parseInt(hm[1]);
        return m;
    },
    extractPolyBlocks(content){const b=[],r=/poly-\d+\s*{([^}]*)}/g;let m;while((m=r.exec(content))!==null)b.push(m[0]);return b;},
    parsePolyBlock(block){
        try{
            const pm=block.match(/points:\s*([\d.,\-\s]+)/);if(!pm)return null;
            const pts=pm[1].trim().split(/\s+/).map(p=>p.split(',').map(Number));
            const cm=block.match(/color:\s*rgba?\(([^)]+)\)/);if(!cm)return null;
            const rgba=cm[1].split(',').map(s=>parseFloat(s.trim()));
            return {pts,r:Math.round(rgba[0]||0),g:Math.round(rgba[1]||0),b:Math.round(rgba[2]||0),a:Math.round((rgba[3]||1)*255),id:Math.random().toString(36).substr(2,9)};
        }catch(e){return null;}
    },
    isValid(content){return content.includes('-- PIGMENT Genome')&&content.includes('polygons {')&&content.includes('poly-');},
    loadFromFile(file,callback){
        const r=new FileReader();
        r.onload=e=>{const c=e.target.result;if(this.isValid(c))callback(null,this.parse(c));else callback(new Error('Invalid .pg file'),null);};
        r.onerror=()=>callback(new Error('Failed to read file'),null);
        r.readAsText(file);
    },
    loadFromString(content){return this.isValid(content)?this.parse(content):null;}
};
window.PGParser=PGParser;
