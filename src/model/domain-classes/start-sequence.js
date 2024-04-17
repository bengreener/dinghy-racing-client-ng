import Clock from './clock';
import FlagState from './flag-state';
import StartSignals from './start-signals';
import { sortArray } from '../../utilities/array-utilities';

const raceStartSequenceTemplate = {
    startingStateTemplates: [
        {startSequenceState: StartSignals.WARNINGSIGNAL, startTimeOffset: -600000, flags: [{name: 'Warning', state: FlagState.RAISED}, {name: 'Blue Peter', state: FlagState.LOWERED}]},
        {startSequenceState: StartSignals.PREPARATORYSIGNAL, startTimeOffset: -300000, flags: [{name: 'Warning', state: FlagState.RAISED}, {name: 'Blue Peter', state: FlagState.RAISED}]},
        {startSequenceState: StartSignals.STARTINGSIGNAL, startTimeOffset: 0, flags: [{name: 'Warning', state: FlagState.LOWERED}, {name: 'Blue Peter', state: FlagState.LOWERED}]}
    ]
}

/**
 * Class to handle the start sequence for a race session
 * Calculates flag states and signals timing for ausio signals to race officers
 */
class StartSequence {

    _races = [];
    _model;
    _clock;
    _tickHandlers = new Map();
    _flags = [];
    _raceStartSequences = [];

    /**
     * Create an instance of StartSequence
     * @param {Array<Race>} races to start
     * @param {DinghyRacingModel} model to use to update underlying data
     */
    constructor(races, model) {
        this._handleTick = this._handleTick.bind(this);
        this._calculateFlags = this._calculateFlags.bind(this);
        this.dispose = this.dispose.bind(this);

        this._races = races;
        this._model = model;
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
        this._clock.start();

        this._raceStartSequences = races.map(race => {
            return new RaceStartSequence(race, raceStartSequenceTemplate);
        });
        const currentStatus = [];
        const time = this._clock.getTime();
        this._raceStartSequences.forEach(ss => {
            currentStatus.push({race: ss.race, status: ss.getStartingStateAtTime(time)});
        });
        this._calculateFlags(currentStatus, time);
    }

    _handleTick() {
        const time = this._clock.getTime();
        // get current status fro each race
        let currentStatus = [];
        this._raceStartSequences.forEach(ss => {
            currentStatus.push({race: ss.race, status: ss.getStartingStateAtTime(time)});
        });

        this._calculateRaceStates(currentStatus);
        this._calculateFlags(currentStatus, time);
        // call any external tick handlers set against this StartSequence
        this._tickHandlers.forEach((value) => {
            value();
        });
    }

    /**
     * 
     * @param {Array<>} currentStatus 
     */
    _calculateRaceStates(currentStatus) {
        currentStatus.forEach(status => {
            // if (status[0].startSequenceState !== status[1].startSequenceState) {
            //     status[0].startSequenceState = status[1].startSequenceState;
            //     this._model.updateRaceStartSequenceState(status[0], status[1].startSequenceState);
            // }
            if (status.race.startSequenceState !== status.status.startSequenceState) {
                status.race.startSequenceState = status.status.startSequenceState;
                this._model.updateRaceStartSequenceState(status.race, status.status.startSequenceState);
            }
        })
    }

    /**
     * Calculate the current state of the flags used to start the races
     */
    _calculateFlags(currentStatus, time) {
        // get flags from all races
        const flags = [];
        currentStatus.forEach(status => {
            status.status.flags.forEach(flag => {
                flags.push({...flag});
            });
        });
        // consolidate flags with the same name
            // raised status has precedence
            // for all flags with raised status use the time to change value that is farthest away
            // for all flags with a lowered status use the time to change value that is nearest
        const consolidatedFlags = [];
        flags.forEach(flag => {
            if (!consolidatedFlags.some(element => element.name === flag.name)) {
                const newFlag = {...flag};
                for (let i = 0; i < flags.length; i++) {
                    if (flag.name === flags[i].name) {
                        if (flag.state === FlagState.RAISED && flags[i].state === FlagState.LOWERED && flag.timeToChange >= flags[i].timeToChange) {
                            // flag will remain raised. Time to change cannot be calculated from data passed to this function. It should be possible to calculate from start sequence data but, at this time effort out weighs benefit. 
                            // newFlag.timeToChange = 0;
                            newFlag.timeToChange = this._getNextStateChangeForFlag(flag, time).timeToChange;
                        }
                        else if (newFlag.state === FlagState.RAISED || flags[i].state === FlagState.RAISED) {
                            newFlag.state = FlagState.RAISED;
                            newFlag.timeToChange = Math.min(newFlag.timeToChange, flags[i].timeToChange);
                        }
                        else {
                            newFlag.timeToChange = Math.max(newFlag.timeToChange, flags[i].timeToChange);
                        }
                    }
                }
                consolidatedFlags.push(newFlag);
            }
        });
        this._flags = consolidatedFlags;
    }
    
    _getNextStateChangeForFlag(flag, time) {
        let futureStates = [];
        const futureFlagsMap = new Map();
        let candidateFlags;
        this._raceStartSequences.forEach(ss => {
            futureStates = futureStates.concat(ss.getFutureStateForFlag(flag, time));
        });
        futureStates.forEach(state => {
            state.flags.forEach(futureFlag => {
                if (flag.name === futureFlag.name) {
                    const timeToChange = time.valueOf() - state.time.valueOf();
                    if (futureFlagsMap.has(timeToChange)) {
                        futureFlagsMap.get(timeToChange).push({...futureFlag, timeToChange: timeToChange});
                    }
                    else {
                        futureFlagsMap.set(timeToChange, [{...futureFlag, timeToChange: timeToChange}]);
                    }
                }
            });
        });
        // remove any times where flag states are in conflict (flag is raised and lowered at the same time) as these result in no change of state
        futureFlagsMap.forEach((value, key, map) => {
            if (value.some(element => element.state !== value[0].state)) {
                map.delete(key);
            }
        });
        candidateFlags = sortArray(Array.from(futureFlagsMap.values()).flat().filter(element => element.state !== flag.state), (value) => {return value.timeToChange});

        return candidateFlags[0];
    }

    /**
     * Returns an array of the actions required to complete the start sequence
     * It should not be assumed that the array is in a specific order
     * @returns {Array<Action>}
     */
    getActions() {
        // create race start actions list
        let actions = [];
        this._races.forEach(race => {
            // raise warning flag
            actions.push({time: new Date(race.plannedStartTime.valueOf() - 600000), description: 'Raise warning flag for ' + race.name});
            // lower warning flag
            actions.push({time: race.plannedStartTime, description: 'Lower warning flag for ' + race.name});
        });
        if (this._races.length > 0) {
            // raise Blue Peter
            actions.push({time: new Date(this._races[0].plannedStartTime.valueOf() - 300000), description: 'Raise Blue Peter'});
            // lower Blue Peter
            actions.push({time: this._races[this._races.length - 1].plannedStartTime, description: 'Lower Blue Peter'});
        }

        return actions;
    }

    /**
     * Get the current state of the flags used to start the races
     * @returns {Array<Flag>}
     */
    getFlags() {
        return this._flags;
    }

    /**
     * Return an array of the races included in this start sequence
     * @returns {Array<Race>}
     */
    getRaces() {
        return this._races;
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
     * Clean up resources used by StartSequence to allow garbage collection
     */
    dispose() {
        this._clock.stop();
        this._clock.removeTickHandler();
    }
}

class RaceStartSequence {
    race; // the race being started
    startingStates = []; // the StartingStates the race will go through

    constructor(race, raceStartSequenceTemplate) {
        this.race = race;
        // if startTimeOffset of first template state is < offset between now and race start need an intial state to set display (otherwise it won't matter as already in first, or subsequent, state) (Offsets are negative)
        if (Date.now() - race.plannedStartTime.valueOf() < raceStartSequenceTemplate.startingStateTemplates[0].startTimeOffset) {
            const flags = raceStartSequenceTemplate.startingStateTemplates[0].flags.map(templateFlag => {
                const flag = {...templateFlag};
                // update name of warning flags to differentiate between races
                if (flag.name === 'Warning') {
                    flag.name = race.name + ' ' + flag.name;
                }
                return {...flag, state: FlagState.LOWERED}
            });
            this.startingStates.push(new StartingState(StartSignals.NONE, new Date(), flags));
        }
        // build up start sequence from template
        raceStartSequenceTemplate.startingStateTemplates.forEach(sst => {
            this.startingStates.push(new StartingState(sst.startSequenceState, new Date(race.plannedStartTime.valueOf() + sst.startTimeOffset), sst.flags.map(templateFlag => {
                    // update name of warning flags to differentiate between races
                    const flag = {...templateFlag};
                    if (flag.name === 'Warning') {
                        flag.name = race.name + ' ' + flag.name;
                    }
                    return flag;
                })
            ));
        });
    }

    /**
     * The StartingState for the race at the specified timethat 
     * @param {Date} time
     * @returns {StartingState}
     */
    getStartingStateAtTime(time) {
        // find state at time
        let state; // the state that applies at the current time
        let stateIndex; // the index of the state that applies at the current time
        const ssLength = this.startingStates.length;
        for(let i = 0; i < ssLength; i++) {
            // determine current state of start sequence
            if (i === ssLength - 1 || (time >= this.startingStates[i].time && time < this.startingStates[i + 1].time)) {
                state = this.startingStates[i];
                stateIndex = i;
                break;
            }
        }
        // calculate time to next state change of each flag (starting from next state)
        state.flags.forEach(flag => {
            let timeToChange = 0;
            for(let i = stateIndex + 1; i < ssLength; i++) {
                let tempTimeToChange = 0; // avoid a no-loop-func linter error
                this.startingStates[i].flags.forEach(nextFlag => {
                    if (flag.name === nextFlag.name && flag.state !== nextFlag.state) {
                        tempTimeToChange = time.valueOf() - this.startingStates[i].time.valueOf();
                    }
                });
                if (tempTimeToChange) { 
                    timeToChange = tempTimeToChange;
                    break;
                };
            }
            flag.timeToChange = timeToChange;
        });
        return state;
    }

    getFutureStateForFlag(flag, time) {
        const futureStates = [];
        // could convert to Array.prototype.filter
        this.startingStates.forEach(state => {
            if (state.time > time) {
                if (state.flags.some(element => element.name === flag.name)) {
                    futureStates.push(state);
                }
            }
        });
        return futureStates;
    }
}

class StartingState {
    startSequenceState; // starting signal state for the race
    time; // the time at which this starting state is reached
    flags; // the state of all flags used to start the race at this stage of the starting sequence
    
    constructor(startSequenceState, time, flags) {
        this.startSequenceState = startSequenceState;
        this.time = time;
        this.flags = flags;
    }
}

export default StartSequence;