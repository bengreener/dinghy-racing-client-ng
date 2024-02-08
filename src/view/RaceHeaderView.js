import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import Clock from '../model/domain-classes/clock';
import ModelContext from './ModelContext';
import ControllerContext from './ControllerContext';
import PostponeRaceForm from './PostponeRaceForm';
import ModalDialog from './ModalDialog';

function RaceHeaderView({ race }) {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [updatedRace, setUpdatedRace] = useState(race);
    const [elapsedTime, setElapsedTime] = useState(race.clock.getElapsedTime());
    const [message, setMessage] = useState('');
    const previousRace = useRef(); // enables removal of tickHandler from previous race when rendered with new race 
    const [showPostponeRace, setShowPostponeRace] = useState(false);

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

    const handleRaceResultDownloadClick = useCallback(() => {
        controller.downloadRaceResults(race).then(result => {
            if (!result.success) {
                setMessage('Unable to download results\n' + result.message);
            }
        });
    }, [controller, race]);

    function handleRacePostponeClick() {
        setShowPostponeRace(true);
    };

    function handleRaceStartClick() {
        controller.startRace(race);
    }

    useEffect(() => {
        let ignoreFetch = false; // set to true if RaceEntriewView rerendered before fetch completes to avoid using out of date result
        let entries = []; // entries for race that have an update callback set. Used to clear up on rerender/ disposal
        model.getEntriesByRace(race).then(result => {
            if (!ignoreFetch && !result.success) {
                setMessage('Unable to load entries\n' + result.message);
            }
            else if (!ignoreFetch) {
                entries = result.domainObject;
                entries.forEach(entry => {
                    model.registerEntryUpdateCallback(entry.url, handleEntryUpdate);
                });
            }
        });
        // cleanup before effect runs and before form close
        return () => {
            ignoreFetch = true;
            entries.forEach(entry => {
                model.unregisterEntryUpdateCallback(entry.url, handleEntryUpdate);
            });
        }
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

    function closePostponeRaceFormDialog() {
        setShowPostponeRace(false);
    };

    race.clock.start();

    return (
        <div>
            <label>{race.name}</label>
            <label htmlFor={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps</label>
            <output id={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{race.plannedLaps}</output>
            <label htmlFor={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>Duration</label>
            <output id={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(race.duration)}</output>
            <label htmlFor={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>{
                (elapsedTime < 0) ? 'Countdown' : 'Remaining'
            }</label>
            <output id={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()}>{
                (elapsedTime < 0) ? Clock.formatDuration(-elapsedTime) : Clock.formatDuration(race.duration - elapsedTime)
            }</output>
            <label htmlFor={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps estimate</label>
            <output id={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{Number(updatedRace.lapForecast).toFixed(2)}</output>
            <label htmlFor={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Last lap time</label>
            <output id={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(updatedRace.lastLapTime)}</output>
            <label htmlFor={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>Average lap time</label>
            <output id={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(updatedRace.averageLapTime)}</output>
            {race.clock.getElapsedTime() < 0 ? <button id="race-postpone-button" onClick={handleRacePostponeClick}>Postpone Start</button> : null}
            {race.clock.getElapsedTime() < 0 ? <button id="race-start-button" onClick={handleRaceStartClick}>Start Now</button> : null}
            <button id="race-result-download-button" onClick={handleRaceResultDownloadClick}>Download Results</button>
            <p id="race-header-message" className={!message ? "hidden" : ""}>{message}</p>
            <ModalDialog show={showPostponeRace} onClose={() => setShowPostponeRace(false)}>
                <PostponeRaceForm race={race} onPostpone={controller.postponeRace} closeParentDialog={closePostponeRaceFormDialog} />
            </ModalDialog>
        </div>
    );
}

export default RaceHeaderView;