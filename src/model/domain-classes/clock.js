class Clock {
    _startTime;
    _elapsedTime = 0;
    _tickHandler;
    _ticker;
        
    start() {
        this._startTime = Date.now();
        this._ticker = setInterval(() => {
            if (this._tickHandler) {
                this._tickHandler();
            };
        }, 1000);
    }

    stop() {
        clearInterval(this._ticker);
        this._elapsedTime = this._elapsedTime + Date.now() - this._startTime;
        this._startTime = null;
    }
    
    reset() {
        if (this._startTime) {
            this._startTime = Date.now();
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