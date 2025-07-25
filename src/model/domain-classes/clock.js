/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

class Clock {
    static _synchOffset = 0;
    static _broadcastChannel = new BroadcastChannel('DinghyRacingClock');
    static _synchEvent = false;

    // fancy static initialisation to avoid need for Bable configuration; https://babeljs.io/docs/babel-plugin-transform-class-static-block
    static #_ = (() => {
        this._broadcastChannel.onmessage = ({ data }) => {
            switch (data.message) {
                case 'synchToTime':
                    Clock._synchEvent = true;
                    Clock.synchToTime(data.body);
                    break;
                default:
                    break;
            }
        };
    })();

    _startTime
    _performanceTimerStartTime; // when the race is due to start based on the value of performance.now() when clock was initialised
    _dateNowPerformanceNowDiff; // difference between Date.now() and performance.now() on clock initialisation
    _tickHandlers = new Map();
    _ticker;

    /**
     * Formats a duration in milliseconds into a string; format hh:mm:ss
     * If fractional seconds is false will truncate to the current second
     * @param {Number} duration Duration in milliseconds
     * @param {boolean} [fractionalSeconds = false] true to display fractional seconds to 3 decimal places
     * @param {boolean} [countdown = false] true to omit minus sign from the front of a negative duration
     * @returns {String}
     */
    static formatDuration(duration, fractionalSeconds = false, countdown = false) {
        let durationSeconds = 0;
        if (fractionalSeconds) {
            durationSeconds = Math.abs(Math.trunc(duration / 1000));
        }
        else {
            durationSeconds = Math.abs(Math.floor(duration / 1000));
        }
        const durationMinutes = Math.abs(Math.trunc(durationSeconds / 60));
        const durationHours = Math.abs(Math.trunc(durationMinutes / 60));
        let formattedValue = "";

        if (durationHours > 0) {
            formattedValue = String(durationHours).padStart(2, '0') + ':';
        }
            formattedValue = formattedValue + String(durationMinutes - durationHours * 60).padStart(2, '0') + ':' + String(durationSeconds - durationMinutes * 60).padStart(2, '0');
        if (fractionalSeconds) {
            formattedValue += '.' + String(Math.abs(duration) - durationSeconds * 1000).padStart(3, '0');
        }
        if (duration < 0 && !countdown) {
            formattedValue = '-' + formattedValue;
        }
        return formattedValue;
    }

    /**
     * Formats a duration in milliseconds into a string in seconds
     * Will truncate to the current second
     * @param {Number} duration Duration in milliseconds
     * @returns {String}
     */
    static formatDurationAsSeconds(duration) {
        let d = Math.floor(duration / 1000);

        return d.toString();
    }

    static synchToTime(time) {
        Clock._synchOffset = time.valueOf() - Date.now();
        if (!Clock.synchEvent) {
            Clock._broadcastChannel.postMessage({message: 'synchToTime', body: time});
        }
        else {
            Clock._synchEvent = false;
        }
    }

    static now() {
        return Date.now() + Clock._synchOffset;
    }

    /**
     * Create a new instance of Clock
     * @param {Date} startTime The start time for the clock. Defaults to the time of instantiation.
     */
    constructor(startTime = new Date()) {
        if (window.Worker) {
            const url = new URL('./tick-worker.js', import.meta.url);
            this._ticker = new Worker(url);
            this._ticker.onmessage = (event) => {
                    if (this._tickHandlers.size > 0) {
                        this._tickHandlers.forEach(callback => {
                        callback(); 
                    });
                };
            }
        }
        else {
            console.log(`clock: A browser that supports web workers is required for clock timer functions to work.`)
        }
        this._startTime = startTime.valueOf();
        this._dateNowPerformanceNowDiff = Date.now() - performance.now();
        this._performanceTimerStartTime =  this._startTime - this._dateNowPerformanceNowDiff;
    }

    /**
     * Start clock ticking
     * This does not affect elapsed time which is calculated from the start time given when clock was instantiated or reset
     * Aligned to system clock rather than performance timer as variation should be minimal and adjusting to performance timer would incur a (slight) overhead
     */
    start() {
        this._ticker.postMessage('start');
    }

    /**
     * Stop clock ticking
     * This does not affect elapsed time which is calculated from the start time given when clock was instantiated or reset
     */
    stop() {
        this._ticker.postMessage('stop');
    }
    
    /**
     * Return a time based on the start time of the clock and the elapsed time calculated by the performance timer
     * This may differ from the time that would be returned by new Date() or Date.now()
     * @returns {Date}
     */
    getTime() {
        return new Date(this._startTime + this.getElapsedTime());
    }

    /**
     * Return a time based on the start time of the clock and the elapsed time calculated by the performance timer with precision reduced to the current second
     * This may differ from the time that would be returned by new Date() or Date.now()
     * @returns {Date}
     */
    getTimeToSecondPrecision() {
        return new Date(Math.floor((this._startTime + this.getElapsedTime()) / 1000) * 1000);
    }

    /**
     * Get time elapsed since start time
     * This is based on performance timer to ensure monotonically increasing values returned.
     * There are known issues with the performance timer on some combinations of OS and browser relating to the timer suspending during sleep:
     * Chromium: https://issues.chromium.org/issues/40765101
     * Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1709767
     * Safari/ Webkit: https://bugs.webkit.org/show_bug.cgi?id=225610
     * @param {Date} [date] if provided calculates elapsed time from this time instead of start time of clock 
     * @returns {number} The number of milliseconds elapsed since timer started, adjusted for any periods during which timer was stopped. Can be negative if start time not yet reached.
     */
    getElapsedTime(date) {
        const pNow = performance.now();
        const dNow = Date.now();
        const raceStartAdjustment = date ? this._startTime - date.getTime() : 0;
        // adjust if performance timer falls behind system clock; intended to autocorrect any error caused by sleeping of clock used for performance timer
        if (pNow + this._dateNowPerformanceNowDiff < dNow - 2) {
            this._dateNowPerformanceNowDiff = dNow - pNow;
            this._performanceTimerStartTime =  this._startTime - this._dateNowPerformanceNowDiff;
        }
        return pNow - this._performanceTimerStartTime + raceStartAdjustment + Clock._synchOffset;
    }
    
    /**
     * Add a function to handle tick events
     * @param {callback} callback 
     */
    addTickHandler(callback) {
        this._tickHandlers.set(callback, callback);
    }

    /**
     * Remove the function handling tick events
     */
    removeTickHandler(callback) {
        this._tickHandlers.delete(callback);
    }
}

export default Clock;