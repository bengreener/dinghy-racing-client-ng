// background web worker for Clocks
var ticker;

function startTicker() {
    ticker = setInterval(() => {
        postMessage(null);
    }, 1000)
};

function stopTicker() {
    clearInterval(ticker);
};

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
};