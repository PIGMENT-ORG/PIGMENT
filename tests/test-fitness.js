// Fitness Function Tests
const FitnessTests = {
    run() {
        console.log('Running Fitness Tests...');
        this.testPixelFitness();
        this.testStructuralFitness();
        this.testGeometry();
        console.log('All fitness tests passed!');
    },
    testPixelFitness() {
        const makeCanvas = (color) => {
            const c = document.createElement('canvas'); c.width=10; c.height=10;
            const ctx = c.getContext('2d'); ctx.fillStyle=color; ctx.fillRect(0,0,10,10);
            return ctx.getImageData(0,0,10,10);
        };
        const red = makeCanvas('#ff0000'), blue = makeCanvas('#0000ff');
        const err = PixelFitness.calculateError(red, blue);
        console.assert(err > 0, 'Error between different colors must be > 0');
        const fit = PixelFitness.calculateFitness(0, 10, 10);
        console.assert(fit === 100, 'Zero error = 100% fitness');
        const fit2 = PixelFitness.calculateFitness(Infinity, 10, 10);
        console.assert(fit2 <= 0, 'Max error = 0% fitness');
        console.log('✅ PixelFitness tests passed');
    },
    testStructuralFitness() {
        const polys = [{pts:[[10,10],[90,10],[50,90]],r:255,g:0,b:0,a:200}];
        const score = StructuralFitness.calculateFitness(polys, 100, 100);
        console.assert(score >= 0 && score <= 100, 'Structural fitness must be 0-100');
        console.log('✅ StructuralFitness tests passed');
    },
    testGeometry() {
        const pts = [[0,0],[100,0],[50,100]];
        const area = Geometry.calculateArea(pts);
        console.assert(area > 0, 'Area must be positive');
        console.assert(Math.abs(area - 5000) < 1, 'Triangle area should be ~5000');
        const centroid = Geometry.getCentroid(pts);
        console.assert(Math.abs(centroid.x - 50) < 1 && Math.abs(centroid.y - 100/3) < 1, 'Centroid must be correct');
        console.assert(Geometry.pointInTriangle(50, 50, pts), 'Center point must be inside');
        console.assert(!Geometry.pointInTriangle(200, 200, pts), 'Far point must be outside');
        console.log('✅ Geometry tests passed');
    }
};
if(typeof module !== 'undefined') module.exports = FitnessTests;
