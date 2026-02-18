// Performance Utilities
const Performance = {
    frameCount:0,lastFrameTime:performance.now(),frameTimes:[],
    throttle(func,limit){let t;return function(){const a=arguments,c=this;if(!t){func.apply(c,a);t=true;setTimeout(()=>t=false,limit);}};},
    debounce(func,delay){let t;return function(){const c=this,a=arguments;clearTimeout(t);t=setTimeout(()=>func.apply(c,a),delay);};},
    limitFrameRate(callback,targetFPS=60){
        const interval=1000/targetFPS,now=performance.now();
        if(now-this.lastFrameTime>=interval){callback();this.lastFrameTime=now;this.frameCount++;this.frameTimes.push(now);if(this.frameTimes.length>60)this.frameTimes.shift();}
    },
    getFPS(){if(this.frameTimes.length<2)return 0;const avg=(this.frameTimes[this.frameTimes.length-1]-this.frameTimes[0])/(this.frameTimes.length-1);return Math.round(1000/avg);},
    processInChunks(items,chunkSize,processFn,callback){
        let idx=0;
        function processChunk(){const end=Math.min(idx+chunkSize,items.length);for(let i=idx;i<end;i++)processFn(items[i],i);idx=end;if(idx<items.length)setTimeout(processChunk,10);else if(callback)callback();}
        processChunk();
    },
    memoize(fn){const cache=new Map();return function(...args){const key=JSON.stringify(args);if(cache.has(key))return cache.get(key);const r=fn.apply(this,args);cache.set(key,r);return r;};}
};
window.Performance = Performance;
