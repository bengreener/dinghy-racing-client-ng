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
    const [warningFlagClass, setWarningFlagClass] = useState(() => {
        // 11 minutes before race prepare to raise warning (class) flag
        // 10 minutes before race raise warning (class) flag
        // 1 minute before race prepare to lower warning (class) flag
        // At start of race race lower warning (class) flag
        if (elapsedTime >= -660000 && elapsedTime < -600000) {
            return 'warning-flag-prepare-raise';
        }
        else if (elapsedTime >= -600000 && elapsedTime < -60000) {
            return 'warning-flag-raised';
        }
        else if (elapsedTime >= -60000 && elapsedTime < 0) {
            return 'warning-flag-prepare-lower';
        }
        else {
            return 'warning-flag-lowered';
        }
    });
    const [bluePeterClass, setBluePeterClass] = useState(() => {
        // 6 minutes before race prepare to raise Blue Peter flag
        // 5 minutes before race raise Blue Peter flag
        // 1 minute before race prepare to lower Blue Peter flag
        // At start of race race lower Blue Peter flag
        if (elapsedTime >= -360000 && elapsedTime < -300000) {
            return 'blue-peter-prepare-raise';
        }
        else if (elapsedTime >= -300000 && elapsedTime < -60000) {
            return 'blue-peter-raised';
        }
        else if (elapsedTime >= -60000 && elapsedTime < 0) {
            return 'blue-peter-prepare-lower';
        }
        else {
            return 'blue-peter-lowered';
        }
    });
    const [prepareWFSoundWarning, setPrepareWFSoundWarning] = useState(false);
    const [prepareBPSoundWarning, setPrepareBPSoundWarning] = useState(false);
    const [actWFSoundWarning, setActWFSoundWarning] = useState(false);
    const [actBPSoundWarning, setActBPSoundWarning] = useState(false);

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

    function handleRacePostponeClick() {
        setShowPostponeRace(true);
    };

    function handleRaceStartClick() {
        controller.startRace(race);
    }

    useEffect(() => {
        race.clock.start();
    }, [race]);

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
            const currentElapsedTime = race.clock.getElapsedTime(); // ensure state calculated on current time uses the same value
            setElapsedTime(currentElapsedTime); // takes effect next render so can't be used to drive caluclations of other state updates based on time in this handler
            // 11 minutes before race prepare to raise warning (class) flag
            // 10 minutes before race raise warning (class) flag
            // 1 minute before race prepare to lower warning (class) flag
            // At start of race race lower warning (class) flag
            if (currentElapsedTime >= -660000 && currentElapsedTime < -659000) {
                warningFlagClass !== 'warning-flag-prepare-raise' ? setPrepareWFSoundWarning(true) : setPrepareWFSoundWarning(false);
                setWarningFlagClass('warning-flag-prepare-raise');
            }
            else if (currentElapsedTime >= -600000 && currentElapsedTime < -599000) {
                // warningFlagClass !== 'warning-flag-raised' ? setActSoundWarning(true) : setActSoundWarning(false);
                if (warningFlagClass !== 'warning-flag-raised') {
                    setActWFSoundWarning(true);
                }
                else {
                    setActWFSoundWarning(false);
                }
                setWarningFlagClass('warning-flag-raised');
            }
            else if (currentElapsedTime >= -60000 && currentElapsedTime < -59000) {
                warningFlagClass !== 'warning-flag-prepare-lower' ? setPrepareWFSoundWarning(true) : setPrepareWFSoundWarning(false);
                setWarningFlagClass('warning-flag-prepare-lower');
            }
            else if (currentElapsedTime < -660000 || currentElapsedTime >= 0) {
                warningFlagClass !== 'warning-flag-lowered' ? setActWFSoundWarning(true) : setActWFSoundWarning(false);
                setWarningFlagClass('warning-flag-lowered');
            }
            // 6 minutes before race prepare to raise Blue Peter flag
            // 5 minutes before race raise Blue Peter flag
            // 1 minute before race prepare to lower Blue Peter flag
            // At start of race race lower Blue Peter flag
            if (currentElapsedTime >= -360000 && currentElapsedTime < -359000) {
                bluePeterClass !== 'blue-peter-prepare-raise' ? setPrepareBPSoundWarning(true) : setPrepareBPSoundWarning(false);
                setBluePeterClass('blue-peter-prepare-raise');
            }
            else if (currentElapsedTime >= -300000 && currentElapsedTime < -299000) {
                bluePeterClass !== 'blue-peter-raised' ? setActBPSoundWarning(true) : setActBPSoundWarning(false);
                setBluePeterClass('blue-peter-raised');
            }
            else if (currentElapsedTime >= -60000 && currentElapsedTime < -59000) {
                bluePeterClass !== 'blue-peter-prepare-lower' ? setPrepareBPSoundWarning(true) : setPrepareBPSoundWarning(false);
                setBluePeterClass('blue-peter-prepare-lower');
            }
            else if (currentElapsedTime < -360000 || currentElapsedTime >= 0) {
                bluePeterClass !== 'blue-peter-lowered' ? setActBPSoundWarning(true) : setActBPSoundWarning(false);
                setBluePeterClass('blue-peter-lowered');
            }
        });
        previousRace.current = race;
    }, [race, bluePeterClass, warningFlagClass]);

    function closePostponeRaceFormDialog() {
        setShowPostponeRace(false);
    };

    return (
        <div>
            <label>{race.name}</label>
            <label htmlFor={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>Laps</label>
            <output id={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()}>{race.plannedLaps}</output>
            <label htmlFor={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>Duration</label>
            <output id={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()}>{Clock.formatDuration(race.duration)}</output>
            {<p className={warningFlagClass} style={{display: 'inline'}}>WF</p>}
            {<p className={bluePeterClass} style={{display: 'inline'}}>BP</p>}
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
            {elapsedTime < 0 ? <button id="race-postpone-button" onClick={handleRacePostponeClick}>Postpone Start</button> : null}
            {elapsedTime < 0 ? <button id="race-start-button" onClick={handleRaceStartClick}>Start Now</button> : null}
            <p id="race-header-message" className={!message ? "hidden" : ""}>{message}</p>
            {prepareWFSoundWarning || prepareBPSoundWarning ? <audio data-testid='prepare-sound-warning-audio' autoPlay={true} src='./sounds/prepare_alert.mp3' /> : null}
            {actWFSoundWarning || actBPSoundWarning ? <audio data-testid='act-sound-warning-audio' autoPlay={true} src='./sounds/act_alert.mp3' /> : null}
            <ModalDialog show={showPostponeRace} onClose={() => setShowPostponeRace(false)}>
                <PostponeRaceForm race={race} onPostpone={controller.postponeRace} closeParentDialog={closePostponeRaceFormDialog} />
            </ModalDialog>
        </div>
    );
}

export default RaceHeaderView;