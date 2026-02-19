// Fitness Worker - Calculates fitness in background
self.onmessage = function(e) {
    const { type, data } = e.data;
    if (type === 'calculate') {
        const result = calculateFitness(data.imageData, data.targetData, data.width, data.height);
        self.postMessage({ type: 'result', ...result });
    }
};

function calculateFitness(imageData, targetData, w, h) {
    const d = imageData, t = targetData;
    let pixelError = 0;
    for (let i = 0; i < d.length; i += 4) {
        const dr=d[i]-t[i], dg=d[i+1]-t[i+1], db=d[i+2]-t[i+2];
        pixelError += dr*dr + dg*dg + db*db;
    }
    const maxError = 255*255*3*w*h;
    const pixelFitness = 100 * (1 - pixelError/maxError);
    return { pixelError, pixelFitness, maxError };
}
