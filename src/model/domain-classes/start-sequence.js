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

import Clock from './clock';
import SessionStartSequence from './session-start-sequence';

/**
 * Class to handle the start sequence for a race session
 * Calculates flag states and signals timing for audio signals to race officers
 */
class StartSequence {

    _races = [];
    _clock;
    _sessionStartSequence;

    _tickHandlers = new Map();

    /**
     * Create an instance of StartSequence
     * @param {Array<Race>} races to start
     */
    constructor(races) {
        this._handleTick = this._handleTick.bind(this);
        this.getPrepareForRaceStartStateChange = this.getPrepareForRaceStartStateChange.bind(this);
        this.getRaceStartStateChange = this.getRaceStartStateChange.bind(this);
        this.getFlags = this.getFlags.bind(this);
        this.getActions = this.getActions.bind(this);
        this.getRaces = this.getRaces.bind(this);
        this.addTickHandler = this.addTickHandler.bind(this);
        this.removeTickHandler = this.removeTickHandler.bind(this);
        this.dispose = this.dispose.bind(this);

        this._races = races;
        this._races.forEach(race => {
            race.clock = new Clock(race.plannedStartTime);
        });
        if (races.length > 0) {
            this._clock = new Clock(races[0].plannedStartTime); // countdown to start of first race
        }
        else {
            this._clock = new Clock(new Date());
        }
        this._clock.addTickHandler(this._handleTick);
        this._sessionStartSequence = new SessionStartSequence(races);
    }

    _handleTick() {
        // call any external tick handlers set against this StartSequence
        this._tickHandlers.forEach((value) => {
            value();
        });

    }

    /**
     * Returns an array of the actions required to complete the start sequence
     * It should not be assumed that the array is in a specific order
     * @returns {Array<Action>}
     */
    getActions() {
        return this._sessionStartSequence.getActions();
    }

    /**
     * Get the current state of the flags used to start the races
     * @returns {Array<Flag>}
     */
    getFlags() {
        return this._sessionStartSequence.getFlagsAtTimeWithNextAction(this._clock.getTime());
    }

    /**
     * Return an array of the races included in this start sequence
     * @returns {Array<Race>}
     */
    getRaces() {
        return this._races;
    }

    /**
     * Return the next race to start
     * @returns {Race}
     */
    getNextRaceToStart() {
        // round time off to second so as to show a race as the next race to start during the second in which it is scheduled to start
        return this._sessionStartSequence.getNextRaceToStart(new Date(Math.floor(this._clock.getTime().valueOf() / 1000) * 1000));
    }

    /**
     * Identify if a race state start change is pending
     * @returns {boolean}
     */
    getPrepareForRaceStartStateChange() {
        const now = this._clock.getTime();
        let prepareForRaceStartStateChange = false;
        for (let action of this._sessionStartSequence.getActions()) {
            if (Math.trunc(action.time.valueOf() / 1000) === Math.trunc((now.valueOf() + 60000) / 1000)) {
                prepareForRaceStartStateChange = true;
                break;
            }
        }
        return prepareForRaceStartStateChange;
    }

    /**
     * Identify if a race state start change has just occurred
     * Will return true for the 1st second a race is scheduled to allow utilising components to work through race update notifications and rendering 
     * @returns {boolean}
     */
    getRaceStartStateChange() {
        const now = this._clock.getTime();
        let raceStartStateChange = false;
        for (let action of this._sessionStartSequence.getActions()) {
            if (Math.trunc(action.time.valueOf() / 1000) === Math.trunc(now.valueOf() / 1000)) {
                raceStartStateChange = true;
                break;
            }
        }
        return raceStartStateChange;
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

    /**
     * Start clock
     * Starting clock automatically was causing issues when useEffect in referencing componenet was cancelled before asynch fetch returned
     */
    startClock() {
        this._clock.start();
    }

    /**
     * Clean up resources used by StartSequence to allow garbage collection
     */
    dispose() {
        this._clock.stop();
        this._clock.removeTickHandler();
    }
}

export default StartSequence;