import React, { useCallback, useContext, useState } from 'react';
import Clock from '../model/domain-classes/clock';
import ControllerContext from './ControllerContext';

function RaceHeaderView({ race }) {
    const controller = useContext(ControllerContext);
    const [clock] = useState(new Clock());
    const [remainingTime, setRemainingTime] = useState(race.duration);
    
    const tickHandler = useCallback(() => {
        setRemainingTime(race.duration - clock.getElapsedTime());
    }, [clock, race.duration]);
    
    clock.addTickHandler(tickHandler);

    function handleStartRaceClick() {
        controller.startRace(race);
        clock.start();
    }

    function handleStopRaceClick() {
        clock.stop();
    }

    return (
        <>
        <label>{race.name}</label>
        <label htmlFor="race-duration">Duration</label>
        <output id="race-duration">{Clock.formatDuration(race.duration)}</output>
        <label htmlFor="race-duration-remaining">Remaining</label>
        <output id="race-duration-remaining">{Clock.formatDuration(remainingTime)}</output>
        <button id="race-start-button" onClick={handleStartRaceClick}>Start Race</button>
        <button id="race-stop-button" onClick={handleStopRaceClick}>Stop Race</button>
        </>
    );
}

export default RaceHeaderView;