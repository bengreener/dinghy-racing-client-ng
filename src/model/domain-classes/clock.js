class Clock {
    _startTime;
    _elapsedTime = 0;
    _tickHandler;
    _ticker;
    
    constructor() {
        if (window.Worker) {
            this._ticker = new Worker('./modules/tick-worker.js');
            this._ticker.onmessage = function(event) {
                if (this._tickHandler) {
                    this.tickHandler();
                }
            }
        }
        else {
            console.log(`clock: Your browser does not support web workers.`)
        }
    }
    
    start() {
        this._startTime = Date.now();
        if (this._tickHandler) {
            this._ticker.postMessage('start');
        }
    }
    
    stop() {
        this._elapsedTime = this._elapsedTime + Date.now() - this._startTime;
        this._startTime = null;
        this._ticker.postMessage('stop');
    }
    
    reset() {
        if (this._startTime) {
            this. _startTime = Date.now();
        }
        this._elapsedTime = 0;
    }
    
    /**
     * 
     * @returns {number} The number of milliseconds elapsed since timer started, adjusted for any periods during which timer was stopped
     */
    getElapsedTime() {
        return this._startTime ? this._elapsedTime + Date.now() - this._startTime :this._elapsedTime; 
    }
    
    addTickHandler(callback) {
        this._tickHandler = callback;
    }
    
    removeTickHandler() {
        this._tickHandler = null;
    }
    
    
}

export default Clock;