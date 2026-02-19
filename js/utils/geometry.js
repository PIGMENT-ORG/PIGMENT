// Geometry Utilities
const Geometry = {
    calculateArea(pts) {
        return Math.abs((pts[0][0]*(pts[1][1]-pts[2][1]) + pts[1][0]*(pts[2][1]-pts[0][1]) + pts[2][0]*(pts[0][1]-pts[1][1])) / 2);
    },
    calculatePerimeter(pts) {
        let p = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            p += Math.sqrt(Math.pow(pts[j][0]-pts[i][0],2) + Math.pow(pts[j][1]-pts[i][1],2));
        }
        return p;
    },
    getCentroid(pts) {
        return { x: (pts[0][0]+pts[1][0]+pts[2][0])/3, y: (pts[0][1]+pts[1][1]+pts[2][1])/3 };
    },
    pointInTriangle(px, py, pts) {
        const v0=[pts[2][0]-pts[0][0],pts[2][1]-pts[0][1]];
        const v1=[pts[1][0]-pts[0][0],pts[1][1]-pts[0][1]];
        const v2=[px-pts[0][0],py-pts[0][1]];
        const d00=v0[0]*v0[0]+v0[1]*v0[1], d01=v0[0]*v1[0]+v0[1]*v1[1];
        const d02=v0[0]*v2[0]+v0[1]*v2[1], d11=v1[0]*v1[0]+v1[1]*v1[1];
        const d12=v1[0]*v2[0]+v1[1]*v2[1];
        const inv=1/(d00*d11-d01*d01);
        const u=(d11*d02-d01*d12)*inv, v=(d00*d12-d01*d02)*inv;
        return u>=0 && v>=0 && u+v<=1;
    },
    calculateCompactness(pts) {
        const a=this.calculateArea(pts), p=this.calculatePerimeter(pts);
        return (p*p)/(4*Math.PI*a);
    },
    calculateAspectRatio(pts) {
        const minX=Math.min(...pts.map(p=>p[0])), maxX=Math.max(...pts.map(p=>p[0]));
        const minY=Math.min(...pts.map(p=>p[1])), maxY=Math.max(...pts.map(p=>p[1]));
        return (maxX-minX)/Math.max(1,maxY-minY);
    },
    isConvex(pts) {
        let sign=0;
        for(let i=0;i<pts.length;i++){
            const p1=pts[i],p2=pts[(i+1)%pts.length],p3=pts[(i+2)%pts.length];
            const cross=(p2[0]-p1[0])*(p3[1]-p2[1])-(p2[1]-p1[1])*(p3[0]-p2[0]);
            if(i===0) sign=Math.sign(cross);
            else if(Math.sign(cross)!==sign) return false;
        }
        return true;
    },
    scalePolygon(pts, factor, center=null) {
        if(!center) center=this.getCentroid(pts);
        return pts.map(pt=>[center.x+(pt[0]-center.x)*factor, center.y+(pt[1]-center.y)*factor]);
    },
    rotatePolygon(pts, angle, center=null) {
        if(!center) center=this.getCentroid(pts);
        const cos=Math.cos(angle), sin=Math.sin(angle);
        return pts.map(pt=>{
            const dx=pt[0]-center.x, dy=pt[1]-center.y;
            return [center.x+dx*cos-dy*sin, center.y+dx*sin+dy*cos];
        });
    },
    translatePolygon(pts, dx, dy) { return pts.map(pt=>[pt[0]+dx,pt[1]+dy]); },
    clipPolygon(pts, W, H, margin=0.2) {
        return pts.map(([x,y])=>[
            Math.max(-W*margin,Math.min(W*(1+margin),x)),
            Math.max(-H*margin,Math.min(H*(1+margin),y))
        ]);
    }
};
window.Geometry = Geometry;
