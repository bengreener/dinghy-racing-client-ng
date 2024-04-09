import React, { useEffect, useState, useCallback, useRef } from 'react';
import Clock from '../model/domain-classes/clock';
import FlagState from '../model/flag-state';

/**
 * Indicates the current state of a flag
 * @param {Object} props
 * @param {string} props.name of the flag
 * @param {Clock} props.clock to use to time state changes
 * @param {Array<FlagStateChangeTiming>} flagStateChangeTimings for raising and lowering the flag
 * @returns {HTMLDivElement}
 */
function FlagControl({ name, clock, flagStateChangeTimings }) {
    const calculateFlagState = useCallback(() => {
        const elapsedTime = clock.getElapsedTime();
        let finalState = FlagState.LOWERED;
        flagStateChangeTimings.forEach(flagStateChange => {
            if (elapsedTime >= flagStateChange.startTimeOffset) {
                finalState = flagStateChange.state;
            }
        });
        return finalState;
    }, [clock, flagStateChangeTimings]);

    const calculateChangeIn = useCallback(() => {
        const elapsedTime = clock.getElapsedTime();
        for (let i = 0; i < flagStateChangeTimings.length; i++) {
            if (elapsedTime < flagStateChangeTimings[i].startTimeOffset) {
                return elapsedTime - flagStateChangeTimings[i].startTimeOffset;
            }
        }
        return elapsedTime - flagStateChangeTimings[flagStateChangeTimings.length - 1].startTimeOffset;
    }, [clock, flagStateChangeTimings]);

    const calculateAudio = useCallback(() => {
        const elapsedTime = clock.getElapsedTime();
        for (let i = 0; i < flagStateChangeTimings.length; i++) {
            const timeToChange = elapsedTime - flagStateChangeTimings[i].startTimeOffset;
            if (timeToChange >= -60000 && timeToChange < -59000) {
                return 'prepare';
            }
            else if (timeToChange >= -0 && timeToChange < 1000) {
                return 'act';
            }
        }
        return 'none';
    }, [clock, flagStateChangeTimings]);

    const [flagState, setFlagState] = useState(calculateFlagState());
    const [flagStateChangeIn, setFlagStateChangeIn] = useState(calculateChangeIn());
    const [audio, setAudio] = useState(calculateAudio());
    const previousClock = useRef(); // enable removal of tick handler from previous clock when rendered with new clock

    useEffect(() => {
        clock.start();
    }, [clock]);

    useEffect(() => {
        if (previousClock.current) {
            previousClock.current.removeTickHandler();
        }
        previousClock.current = clock;
        clock.addTickHandler(() => {
            setFlagState(calculateFlagState());
            setFlagStateChangeIn(calculateChangeIn());
            setAudio(calculateAudio());
        });
    }, [clock, calculateFlagState, calculateChangeIn, calculateAudio]);

    return (
        <div>
            <label htmlFor={'flag-name-output'}>Flag</label>
            <output id='flag-name-output'>{name}</output>
            <label htmlFor={'current-state-output'}>State</label>
            <output id='current-state-output'>{flagState === FlagState.LOWERED ? 'Lowered' : 'Raised' }</output>
            <label htmlFor={'change-in-output'}>Change In</label>
            <output id='change-in-output'>{Clock.formatDuration(Math.max(-flagStateChangeIn, 0))}</output>
            {audio === 'prepare' ? <audio data-testid='prepare-sound-warning-audio' autoPlay={true} src='./sounds/prepare_alert.mp3' /> : null}
            {audio === 'act' ? <audio data-testid='act-sound-warning-audio' autoPlay={true} src='./sounds/act_alert.mp3' /> : null}
        </div>
    )
}

/**
 * @typedef {Object} FlagStateChangeTiming
 * @property {integer} startTimeOffset duration in milliseconds, before or after, the start time set for the associated clock that flag should be set to this state
 * @property {FlagState} state of flag to be set at this time 
 */

export default FlagControl;