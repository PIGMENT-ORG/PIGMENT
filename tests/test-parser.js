// PG Parser Tests
const ParserTests = {
    run() {
        console.log('Running Parser Tests...');
        this.testExport();
        this.testImport();
        this.testRoundTrip();
        console.log('All parser tests passed!');
    },
    testExport() {
        const polys = [{pts:[[10,20],[80,30],[50,90]],r:255,g:128,b:0,a:200,id:'t1'}];
        const meta = {generations:1000,fitness:75.5,width:200,height:200,algorithm:'multi'};
        const content = PGExporter.export(polys, meta);
        console.assert(content.includes('-- PIGMENT Genome'), 'Must have header');
        console.assert(content.includes('poly-0'), 'Must have polygon');
        console.assert(content.includes('points:'), 'Must have points');
        console.assert(content.includes('color:'), 'Must have color');
        console.log('✅ export test passed');
    },
    testImport() {
        const content = `-- PIGMENT Genome
-- Generated: 2024-01-01
-- Generations: 5000
-- Fitness: 85.00%
-- Polygons: 2
-- Algorithm: multi-objective

canvas {
  width: 200
  height: 200
  title: "Test"
}

polygons {
  poly-0 {
    points: 10.0,20.0 80.0,30.0 50.0,90.0
    color: rgba(255,128,0,0.78)
  }
  poly-1 {
    points: 100.0,100.0 180.0,50.0 150.0,180.0
    color: rgba(0,128,255,0.50)
  }
}`;
        console.assert(PGParser.isValid(content), 'Content must be valid');
        const result = PGParser.parse(content);
        console.assert(result.success, 'Parse must succeed');
        console.assert(result.polygons.length === 2, 'Must have 2 polygons');
        console.assert(result.metadata.generations === 5000, 'Generations must be 5000');
        console.assert(Math.abs(result.metadata.fitness - 85) < 0.1, 'Fitness must be ~85');
        console.log('✅ import test passed');
    },
    testRoundTrip() {
        const polys = [{pts:[[10,20],[80,30],[50,90]],r:255,g:128,b:0,a:200,id:'t1'}];
        const meta = {generations:2000,fitness:90.5,width:200,height:200,algorithm:'multi'};
        const exported = PGExporter.export(polys, meta);
        const imported = PGParser.parse(exported);
        console.assert(imported.success, 'Round trip parse must succeed');
        console.assert(imported.polygons.length === polys.length, 'Polygon count must match');
        const p = imported.polygons[0];
        console.assert(Math.abs(p.r - polys[0].r) < 2, 'R channel must match');
        console.assert(Math.abs(p.g - polys[0].g) < 2, 'G channel must match');
        console.assert(Math.abs(p.b - polys[0].b) < 2, 'B channel must match');
        console.log('✅ round-trip test passed');
    }
};
if(typeof module !== 'undefined') module.exports = ParserTests;
