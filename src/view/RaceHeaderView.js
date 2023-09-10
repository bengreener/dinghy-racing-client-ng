import React, { useContext, useEffect, useState, useRef } from 'react';
import Clock from '../model/domain-classes/clock';
import ControllerContext from './ControllerContext';

function RaceHeaderView({ race }) {
    const controller = useContext(ControllerContext);
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
        <div>
        <label>{race.name}</label>
        <label htmlFor={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps</label>
        <output id={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{race.plannedLaps}</output>
        <label htmlFor={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>Duration</label>
        <output id={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(race.duration)}</output>
        <label htmlFor={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>Remaining</label>
        <output id={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(remainingTime)}</output>
        <label htmlFor={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps estimate</label>
        <output id={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{race.lapForecast}</output>
        <label htmlFor={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Last lap time</label>
        <output id={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(race.lastLapTime)}</output>
        <label htmlFor={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Average lap time</label>
        <output id={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(race.averageLapTime)}</output>
        <button id="race-start-button" onClick={handleStartRaceClick}>Start Race</button>
        <button id="race-stop-button" onClick={handleStopRaceClick}>Stop Race</button>
        </div>
    );
}

export default RaceHeaderView;