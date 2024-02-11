class Clock {
    _startTime;
    // _elapsedTime = 0;
    _tickHandler;
    _ticker;
    
    /**
     * Formats a duration in milliseconds into a string; format hh:mm:ss
     * If fractional seconds is false will round to the nearest second when formatting for display to avoid issues when a countdown traverses from positive to negative; (resolves dispaly of 1, 0, -0, 1 (over 4 seconds) to 1, 0, -1 (over 3 seconds))
     * Also, compensates for fact that second ticks tend to occur slightly after the second due to processing delays
     * Would be an issue if formatting actual times as second element would be rounded up so time displayed may not be correct
     * @param {Number} duration Duration in milliseconds
     * @param {boolean} fractionalSeconds true to display fractional seconds to 3 decimal places
     * @returns {String}
     */
    static formatDuration(duration, fractionalSeconds = false) {
        let d = Math.abs(duration);
        const hours = Math.floor(d / 3600000);

        let formatOptions = {
            timeZone: 'UTC',
            minute: '2-digit',
            second: '2-digit',
        };

        if (hours > 0) formatOptions = {...formatOptions, hour: '2-digit'};
        if (fractionalSeconds)  {
            formatOptions = {...formatOptions, fractionalSecondDigits: 3};
        }
        else {
            d = Math.round(d / 1000) * 1000;
        }
        const timeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);
        return (duration < 0 ? '-' : '') + timeFormat.format(d);
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