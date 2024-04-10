import Clock from './clock';
import FlagState from './flag-state';

/**
 * Class to handle the start sequence for a race session
 * Calculates flag states and signals timing for ausio signals to race officers
 */
class StartSequence {

    _races = [];
    _clock;

    /**
     * Create an instance of StartSequence
     * @param {Array<Race>} races to start
     */
    constructor(races) {
        this._races = races;
        if (races.length > 0) {
            this._clock = new Clock(races[0].plannedStartTime); // countdown to start of first race
        }
        else {
            this._clock = new Clock(new Date());
        }
        this._clock.start();
    }

    /**
     * Calculate the flags required to start the races and their current state
     * @returns {Array<Flag>}
     */
    calculateFlags() {
        // race warning flags
        const flags = this._races.map(race => {
            const raceOffset = race.plannedStartTime.valueOf() - this._races[0].plannedStartTime.valueOf(); // factor in gap between races
            
            let flagStateChangeTimings = [ {startTimeOffset: -600000 + raceOffset, state: FlagState.RAISED}, {startTimeOffset: 0 + raceOffset, state: FlagState.LOWERED} ];
            
            const flagState = this.calulateFlagState(this._clock.getElapsedTime(), flagStateChangeTimings);
            return {name: race.name + ' Warning', state: flagState.finalState, timeToChange: flagState.timeToChange};
        });

        // blue peter
        if (this._races.length > 0) {
            const firstRaceStart = this._races[0].plannedStartTime;
            const lastRaceStart = this._races[this._races.length -1].plannedStartTime;
            const flagStateChangeTimings = [{startTimeOffset: -300000, state: FlagState.RAISED}, {startTimeOffset: lastRaceStart.valueOf() - firstRaceStart.valueOf(), state: FlagState.LOWERED}];
            const flagState = this.calulateFlagState(this._clock.getElapsedTime(), flagStateChangeTimings);

            flags.splice(1, 0, {name: 'Blue Peter', state: flagState.finalState, timeToChange: flagState.timeToChange});
        }

        return flags;
    }

    calulateFlagState(elapsedTime, flagStateChangeTimings) {
        let finalState = FlagState.LOWERED;
        let timeToChange = elapsedTime - flagStateChangeTimings[flagStateChangeTimings.length - 1].startTimeOffset;

        flagStateChangeTimings.forEach(flagStateChange => {
            const tempTimeToChange = elapsedTime - flagStateChange.startTimeOffset;
            
            if (elapsedTime >= flagStateChange.startTimeOffset) {
                finalState = flagStateChange.state;
            }
            if (elapsedTime < flagStateChange.startTimeOffset && tempTimeToChange >= timeToChange) {
                timeToChange = tempTimeToChange;
            }
        });
        timeToChange = Math.min(timeToChange, 0);
        return {finalState: finalState, timeToChange: timeToChange};
    }

    /**
     * Add a function to handle tick events
     * @param {callback} callback
     */
    addTickHandler(callback) {
        this._clock.addTickHandler(callback);
    }

    /**
     * Remove the function handling tick events
     */
    removeTickHandler() {
        this._clock.removeTickHandler();
    }
}

export default StartSequence;