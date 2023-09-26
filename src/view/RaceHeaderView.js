import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import Clock from '../model/domain-classes/clock';
import ControllerContext from './ControllerContext';
import ModelContext from './ModelContext';

function RaceHeaderView({ race }) {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [updatedRace, setUpdatedRace] = useState(race);
    const [remainingTime, setRemainingTime] = useState();    
    const [message, setMessage] = useState('');
    const previousRace = useRef(); // enables removal of tickHandler from previous race when rendered with new race 

    const handleEntryUpdate = useCallback(() => {
        model.getRace(race.url).then(result => {
            if (!result.success) {
                setMessage('Unable to update race\n' + result.message);
            }
            else {
                setUpdatedRace(result.domainObject);
            }
        });
    }, [model, race]);

    useEffect(() => {
        model.getEntriesByRace(race).then(result => {
            if (!result.success) {
                setMessage('Unable to load entries\n' + result.message);
            }
            else {
                result.domainObject.forEach(entry => {
                    model.registerEntryUpdateCallback(entry.url, handleEntryUpdate);
                });
            }
        });
    }, [model, race, handleEntryUpdate]);

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
        <label htmlFor={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps</label>
        <output id={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{race.plannedLaps}</output>
        <label htmlFor={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>Duration</label>
        <output id={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(race.duration)}</output>
        <label htmlFor={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>Remaining</label>
        <output id={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(remainingTime)}</output>
        <label htmlFor={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps estimate</label>
        <output id={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{updatedRace.lapForecast}</output>
        <label htmlFor={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Last lap time</label>
        <output id={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(updatedRace.lastLapTime)}</output>
        <label htmlFor={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Average lap time</label>
        <output id={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(updatedRace.averageLapTime)}</output>
        <button id="race-start-button" onClick={handleStartRaceClick}>Start Race</button>
        <button id="race-stop-button" onClick={handleStopRaceClick}>Stop Race</button>
        <p id="race-header-message" className={!message ? "hidden" : ""}>{message}</p>
        </>
    );
}

export default RaceHeaderView;