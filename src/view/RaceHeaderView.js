import React, { useContext, useEffect, useState, useRef } from 'react';
import Clock from '../model/domain-classes/clock';
import ControllerContext from './ControllerContext';

function RaceHeaderView({ race }) {
    const controller = useContext(ControllerContext);
    // const [clock, setClock] = useState(new Clock());
    const [remainingTime, setRemainingTime] = useState();    
    const previousRace = useRef(); // enables removal of tickHandler from previous race when rendered with new race 

    useEffect(() => {
        setRemainingTime(race.duration - race.clock.getElapsedTime());
        // previousRace.current.removeTickHandler is before adding new handler as otherwise if app is run in strict mode extra render will cause previously added handler to be removed
        if (previousRace.current && previousRace.current.clock) {
            previousRace.current.clock.removeTickHandler();
        }
        race.clock.addTickHandler(() => {
            setRemainingTime(race.duration - race.clock.getElapsedTime());
        });
        previousRace.current = race;
    }, [race]);

    function handleStartRaceClick() {
        controller.startRace(race);
        race.clock.start();
    }

    function handleStopRaceClick() {
        race.clock.stop();
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