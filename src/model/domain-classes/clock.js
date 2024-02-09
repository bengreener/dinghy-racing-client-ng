class Clock {
    _startTime;
    // _elapsedTime = 0;
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
        // const seconds = Math.round((d % 60000) / 1000);
        const seconds = Math.floor((d % 60000) / 1000);
        const formatHours = hours < 10 ? '0' + hours : hours;
        const formatMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formatSeconds = seconds < 10 ? '0' + seconds : seconds;
        return ((duration < 0 ? '-' : '') + formatHours + ':' + formatMinutes + ':' + formatSeconds);
    }

    /**
     * Create a new instance of Clock 
     * @param {Date} startTime The start time for the clock. Defaults to the time of instantiation.
     */
    constructor(startTime = new Date()) {
        this._startTime = startTime.valueOf();
    }

    /**
     * Start clock ticking
     * This does not affect elapsed time which is calculated from the start time given when clock was instantiated or reset
     */
    start() {
        if (!this._ticker) {
            // synchronise to system clock so tick is every time system clock seconds change
            // using setInterval would create timing creep; interval is always > 1000 by a 'random factor'
            // this approach results in an average interval of ~1000 milliseconds
            const setNextTick = (recursiveCallback) => {
                this._ticker = setTimeout(() => {
                    if (this._tickHandler) {
                        this._tickHandler();
                    };
                    recursiveCallback(recursiveCallback);
                }, 1000 - Date.now() % 1000);
            }

            setNextTick(setNextTick);
        }
    }

    /**
     * Stop clock ticking
     * This does not affect elapsed time which is calculated from the start time given when clock was instantiated or reset
     */
    stop() {
        // if clock started then stop it else do nothing
        if (this._ticker) {
            clearTimeout(this._ticker);
            this._ticker = null;
        }
    }
    
    /**
     * Reset clock start time to now
     */
    reset() {
        if (this._startTime) {
            this._startTime = Date.now();
        }
    }
    
    /**
     * Get time elapsed since start time
     * @returns {number} The number of milliseconds elapsed since timer started, adjusted for any periods during which timer was stopped. Can be negative if start time not yet reached.
     */
    getElapsedTime() {
        return Date.now() - this._startTime;
    }
    
    /**
     * Add a function to handle tick events 
     * @param {callback} callback 
     */
    addTickHandler(callback) {
        this._tickHandler = callback;
    }
    
    /**
     * Remove the function handling tick events
     */
    removeTickHandler() {
        this._tickHandler = null;
    }
}

export default Clock;