import React from 'react';
import { useContext, useEffect, useState, useCallback } from 'react';
import ModelContext from './ModelContext';
import ControllerContext from './ControllerContext';
import DinghyRacingModel from '../model/dinghy-racing-model';
import RaceEntriesView from './RaceEntriesView';
import Clock from '../model/domain-classes/clock';

function RaceConsole() {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [selectedRace, setSelectedRace] = useState({...DinghyRacingModel.raceTemplate()});
    const [raceOptions, setRaceOptions] = useState([]);
    const [raceMap, setRaceMap] = useState(new Map());
    const [message, setMessage] = useState('');
    const [clock] = useState(new Clock());
    const [remainingTime, setRemainingTime] = useState(0);

    const tickHandler = useCallback(() => {
        setRemainingTime(selectedRace.duration - clock.getElapsedTime());
    }, [clock, selectedRace.duration]);
    
    clock.addTickHandler(tickHandler);
    
    useEffect(() => {
        model.getRacesOnOrAfterTime(new Date()).then(result => {
            if (!result.success) {
                setMessage('Unable to load races\n' + result.message);
            }
            else {
                const options = [];
                const map = new Map();
                options.push(<option key={''}></option>);
                result.domainObject.forEach(race => {
                    options.push(<option key={race.name + race.plannedStartTime.toISOString()}>{race.name}</option>);
                    map.set(race.name, race);
                });
                setRaceOptions(options);
                setRaceMap(map);
            }
        });
    }, [model]);

    function handleRaceSelect(event) {
        event.preventDefault();
        const race = raceMap.get(event.target.value);
        setSelectedRace(race);
        setRemainingTime(race.duration);
    }

    function handleStartRaceClick() {
        controller.startRace(selectedRace);
        clock.start();
    }

    function handleStopRaceClick() {
        clock.stop();
    }

    /**
     * Formats a duration in milliseconds into a string; format hh:mm:ss
     * @param {Number} duration Duration in milliseconds
     * @returns {String}
     */
    function formatDuration(duration) {
        const d = Math.abs(duration);
        const hours = Math.floor(d / 3600000);
        const minutes = Math.floor((d % 3600000) / 60000);
        const seconds = Math.round((d % 60000) / 1000);
        const formatHours = hours < 10 ? '0' + hours : hours;
        const formatMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formatSeconds = seconds < 10 ? '0' + seconds : seconds;
        return ((duration < 0 ? '-' : '') + formatHours + ':' + formatMinutes + ':' + formatSeconds);
    }

    return (
        <>
            <label htmlFor="race-select">Select Race</label>
            <select id="race-select" name="race" onChange={handleRaceSelect}>{raceOptions}</select>
            <label htmlFor="race-duration">Duration</label>
            <output id="race-duration">{formatDuration(selectedRace.duration)}</output>
            <label htmlFor="race-duration-remaining">Remaining</label>
            <output id="race-duration-remaining">{formatDuration(remainingTime)}</output>
            <p id="race-console-message">{message}</p>
            <button id="race-start-button" onClick={handleStartRaceClick}>Start Race</button>
            <button id="race-start-button" onClick={handleStopRaceClick}>Stop Race</button>
            <RaceEntriesView races={[selectedRace]} clock={clock} />
        </>
    );
}

export default RaceConsole;