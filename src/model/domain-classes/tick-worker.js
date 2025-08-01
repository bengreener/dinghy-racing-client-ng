let ticker;
let dateOffset = Date.now() - performance.now();

function startTicker() {
    // synchronise to system clock so tick is every time system clock seconds change
    // using setInterval would create timing creep; interval is always > 1000 by a 'random factor'
    // this approach results in an average interval of ~1000 milliseconds
    const setNextTick = (recursiveCallback) => {
        ticker = setTimeout(() => {
            postMessage(null);
            recursiveCallback(recursiveCallback);
        }, 1001 - (performance.now() + dateOffset) % 1000);
    }
    setNextTick(setNextTick);
}

function stopTicker() {
    clearInterval(ticker);
}

onmessage = function(event) {
    switch (event.data) {
        case 'start':
            startTicker();
            break;
        case 'stop':
            stopTicker();
            break;
        default:
            console.log(`tick-worker: Unknown command: ${event.data}`);
    }
}