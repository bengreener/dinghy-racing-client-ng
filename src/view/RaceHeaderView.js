import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import Clock from '../model/domain-classes/clock';
import ModelContext from './ModelContext';

function RaceHeaderView({ race }) {
    const model = useContext(ModelContext);
    const [updatedRace, setUpdatedRace] = useState(race);
    const [elapsedTime, setElapsedTime] = useState(race.clock.getElapsedTime());
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
        if (previousRace.current && previousRace.current.clock) {
            previousRace.current.clock.removeTickHandler();
        }
        race.clock.addTickHandler(() => {
            setElapsedTime(race.clock.getElapsedTime());
        });
        previousRace.current = race;
    }, [race]);

    function handleStopRaceClick() {
        race.clock.stop();
    }

    race.clock.start();

    return (
        <div>
            <label>{race.name}</label>
            <label htmlFor={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps</label>
            <output id={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{race.plannedLaps}</output>
            <label htmlFor={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>Duration</label>
            <output id={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(race.duration)}</output>
            <label htmlFor={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>{(elapsedTime < 0) ? 'Countdown' : 'Remaining'}</label>
            <output id={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>{(elapsedTime < 0) ? Clock.formatDuration(elapsedTime) : Clock.formatDuration(race.duration - elapsedTime)}</output>
            <label htmlFor={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps estimate</label>
            <output id={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{Number(updatedRace.lapForecast).toFixed(2)}</output>
            <label htmlFor={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Last lap time</label>
            <output id={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(updatedRace.lastLapTime)}</output>
            <label htmlFor={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Average lap time</label>
            <output id={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(updatedRace.averageLapTime)}</output>
            <button id="race-stop-button" onClick={handleStopRaceClick}>Stop Race</button>
            <p id="race-header-message" className={!message ? "hidden" : ""}>{message}</p>
        </div>
    );
}

export default RaceHeaderView;