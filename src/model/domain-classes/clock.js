class Clock {
    _startTime;
    _elapsedTime = 0;
    _tickHandler;
    _ticker;
    
    /**
     * Formats a duration in milliseconds into a string; format hh:mm:ss
     * @param {Number} duration Duration in milliseconds
     * @returns {String}
     */
    static formatDuration(duration) {
        const d = Math.abs(duration);
        const hours = Math.floor(d / 3600000);
        const minutes = Math.floor((d % 3600000) / 60000);
        const seconds = Math.round((d % 60000) / 1000);
        const formatHours = hours < 10 ? '0' + hours : hours;
        const formatMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formatSeconds = seconds < 10 ? '0' + seconds : seconds;
        return ((duration < 0 ? '-' : '') + formatHours + ':' + formatMinutes + ':' + formatSeconds);
    }

    start() {
        // if clock stopped start it else do nothing
        if (!this._startTime) {
            this._startTime = Date.now();
            this._ticker = setInterval(() => {
                if (this._tickHandler) {
                    this._tickHandler();
                };
            }, 1000);
        }
    }

    stop() {
        // if clock started then stop it else do nothing
        if (this._startTime) {
            clearInterval(this._ticker);
            this._elapsedTime = this._elapsedTime + Date.now() - this._startTime;
            this._startTime = null;
        }
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
        return this._startTime ? this._elapsedTime + Date.now() - this._startTime : this._elapsedTime; 
    }
    
    addTickHandler(callback) {
        this._tickHandler = callback;
    }
    
    removeTickHandler() {
        this._tickHandler = null;
    }


    
    
}

export default Clock;