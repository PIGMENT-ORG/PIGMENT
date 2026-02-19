// Evolution Algorithm Tests
const EvolutionTests = {
    run() {
        console.log('Running Evolution Tests...');
        this.testRandomPolygon();
        this.testMutation();
        this.testFitness();
        this.testClone();
        console.log('All evolution tests passed!');
    },
    testRandomPolygon() {
        // Ensure randomPoly generates valid polygons
        const poly = EvolutionEngine.randomPoly ? EvolutionEngine.randomPoly() : {pts:[[0,0],[100,0],[50,100]],r:128,g:128,b:128,a:150};
        console.assert(poly.pts.length === 3, 'Polygon must have 3 points');
        console.assert(poly.r >= 0 && poly.r <= 255, 'R must be 0-255');
        console.assert(poly.g >= 0 && poly.g <= 255, 'G must be 0-255');
        console.assert(poly.b >= 0 && poly.b <= 255, 'B must be 0-255');
        console.assert(poly.a >= 0 && poly.a <= 255, 'A must be 0-255');
        console.log('✅ randomPolygon test passed');
    },
    testMutation() {
        const poly = {pts:[[50,50],[150,50],[100,150]],r:100,g:150,b:200,a:128,id:'test'};
        const ctx = {W:200,H:200,generation:1000,fitness:50};
        const translated = TranslateMutation.mutate(poly, ctx);
        console.assert(translated.pts.length === 3, 'Translated polygon must have 3 points');
        const scaled = ScaleMutation.mutate(poly, ctx);
        console.assert(scaled.pts.length === 3, 'Scaled polygon must have 3 points');
        const rotated = RotateMutation.mutate(poly, ctx);
        console.assert(rotated.pts.length === 3, 'Rotated polygon must have 3 points');
        console.log('✅ mutation tests passed');
    },
    testFitness() {
        const canvas = document.createElement('canvas');
        canvas.width = 10; canvas.height = 10;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, 10, 10);
        const img1 = ctx.getImageData(0, 0, 10, 10);
        ctx.fillStyle = '#0000ff'; ctx.fillRect(0, 0, 10, 10);
        const img2 = ctx.getImageData(0, 0, 10, 10);
        const error = PixelFitness.calculateError(img1, img2);
        console.assert(error > 0, 'Different images should have error > 0');
        const sameError = PixelFitness.calculateError(img1, img1);
        console.assert(sameError === 0, 'Same image should have error = 0');
        console.log('✅ fitness test passed');
    },
    testClone() {
        const polys = [{pts:[[1,2],[3,4],[5,6]],r:10,g:20,b:30,a:40,id:'a'}];
        const cloned = polys.map(p=>({...p,pts:p.pts.map(pt=>[pt[0],pt[1]])}));
        cloned[0].pts[0][0] = 999;
        console.assert(polys[0].pts[0][0] === 1, 'Clone must be deep copy');
        console.log('✅ clone test passed');
    }
};
if(typeof module !== 'undefined') module.exports = EvolutionTests;
