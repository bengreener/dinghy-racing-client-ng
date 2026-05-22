/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Clock from '../model/clock';
import PostponeRaceForm from './PostponeRaceForm';
import ModalDialog from './ModalDialog';
import AdjustCourseForm from './AdjustCourseForm';
import RaceType from '../model/race-type';

/**
 * Present summary information ablout a race
 * @param {Object} props
 * @param {DirectRace} race 
 * @param {boolean} [showInRaceData = true] enables or disables display of remaining duration, estimated laps, last lap time for lead boat, and average lap time for lead boat
 * @returns {HTMLDivElement}
 */
function RaceHeaderView({ race, model, controller, showInRaceData = true }) {
    const [updatedRace, setUpdatedRace] = useState(race); // used to get current lead entry information for race after a lap recorded. May not reflect changes to planned start time or planned laps
    const [elapsedTime, setElapsedTime] = useState(model.getClock().getElapsedTime(race.plannedStartTime));
    const [message, setMessage] = useState('');
    const [showPostponeRace, setShowPostponeRace] = useState(false);
    const [showShortenCourse, setShowShortenCourse] = useState(false);
    const audioContext = useRef(new AudioContext());
    const pursuitEndWarningAudioRef = useRef(null);
    const pursuitEndAudioRef = useRef(null);
    const pursuitEndWarningTrack = useRef(null);
    const pursuitEndTrack = useRef(null);

    useEffect(() => {
        if (pursuitEndWarningAudioRef.current === null && race.type === RaceType.PURSUIT) {
            pursuitEndWarningAudioRef.current = new Audio('./sounds/prepare_alert.mp3');
        }
        if (pursuitEndAudioRef.current === null && race.type === RaceType.PURSUIT) {
            pursuitEndAudioRef.current = new Audio('./sounds/act_alert.mp3');
        }
        if (pursuitEndWarningTrack === null && audioContext != null && pursuitEndWarningAudioRef.current != null) {
            pursuitEndWarningTrack.current = audioContext.createMediaElementSource(pursuitEndWarningAudioRef.current);
            pursuitEndWarningTrack.current(audioContext.current.destination);
        }
        if (pursuitEndTrack === null && audioContext != null && pursuitEndAudioRef.current != null) {
            pursuitEndTrack.current = audioContext.createMediaElementSource(pursuitEndAudioRef.current);
            pursuitEndTrack.current(audioContext.current.destination);
        }
    }, [race.type]);
    

    const handleRaceEntryLapsUpdate = useCallback(() => {
        model.getRace(race.url).then(result => {
            setUpdatedRace(result);
        })
        .catch(error => {
            setMessage('Unable to update race\n' + error.message);
        });
    }, [model, race]);

    const tickHandler = useCallback(() => {
        const currentElapsedTime = model.getClock().getElapsedTime(race.plannedStartTime); // ensure state calculated on current time uses the same value
        setElapsedTime(currentElapsedTime); // takes effect next render so can't be used to drive caluclations of other state updates based on time in this handler
        if (pursuitEndWarningAudioRef.current != null && (Math.floor(currentElapsedTime / 1000) * 1000) === race.duration - 60000) {
            pursuitEndWarningAudioRef.current.play();
        }
        if (pursuitEndAudioRef.current != null && (Math.floor(currentElapsedTime / 1000) * 1000) === race.duration) {
            pursuitEndAudioRef.current.play();
        }
    }, [model, race.plannedStartTime, race.duration]);

    function handleRacePostponeClick() {
        setShowPostponeRace(true);
    };

    function handleRaceStartClick() {
        controller.startRace(race);
    }

    function handleShortenCourseClick() {
        setShowShortenCourse(true);
    }

    function handleLapSheetClick() {
        // get race id
        const id = race.url.match(/(\d+$)/)[0];
        window.open(window.location.origin + '/lap-sheet/' + id);
    }

    useEffect(() => {
        race.registerRaceEntryLapsUpdateCallback(handleRaceEntryLapsUpdate);
        
        return () => {
            race.unregisterRaceEntryLapsUpdateCallback(handleRaceEntryLapsUpdate);
        }
    }, [race, handleRaceEntryLapsUpdate]);

    // add tick handler
    useEffect(() => {
        model.getClock().addTickHandler(tickHandler);

        return (() => {
            model.getClock().removeTickHandler(tickHandler);
        });
    }, [model, tickHandler]);

    function closePostponeRaceFormDialog() {
        setShowPostponeRace(false);
    }

    function closeShortenCourseDialog() {
        setShowShortenCourse(false);
    }

    function userMessageClasses() {
        return !message ? 'hidden' : 'console-error-message';
    }

    return (
        <div className='race-header-view' >
            <div className='w3-row' >
                <label  className='w3-col m2' ><b>{updatedRace.name}</b></label>
                <div className='w3-col m1 s6'>
                    {race.type !== RaceType.PURSUIT ? <label htmlFor={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Laps</label> : null}
                    {race.type !== RaceType.PURSUIT ? <output id={'race-laps-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{race.plannedLaps}</output> : null}
                </div>
                <div className='w3-col m1 s6'>
                    <label htmlFor={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Duration</label>
                    <output id={'race-duration-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Clock.formatDuration(race.duration)}</output>
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && elapsedTime >= 0 ? <label htmlFor={'race-elapsed-time-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Elapsed</label> : null}
                    {showInRaceData && elapsedTime >= 0 ? <output id={'race-elapsed-time-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Clock.formatDuration(elapsedTime)}</output> : null}
                </div>
                <div className='w3-col m2 s6'>
                    <label htmlFor={'race-duration-remaining-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{(elapsedTime < 0) ? 'Countdown' : 'Remaining'}</label>
                    {/** When formatting time remaining adjust elapsed time to prevent formatted time remaining from being one second fast after formatting */}
                    <output id={'race-duration-remaining-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{(elapsedTime < 0) ? Clock.formatDuration(elapsedTime, false, true) : Clock.formatDuration(race.duration - (Math.floor(elapsedTime /1000) * 1000))}</output>
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && updatedRace.type !== RaceType.PURSUIT && updatedRace.leadEntryLastLapTime > 0 ? <label htmlFor={'estmated-race-laps-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Laps estimate</label> : null}
                    {showInRaceData && updatedRace.type !== RaceType.PURSUIT && updatedRace.leadEntryLastLapTime > 0 ? <output id={'estmated-race-laps-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Number(updatedRace.lapForecast).toFixed(2)}</output> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && updatedRace.type !== RaceType.PURSUIT && updatedRace.leadEntryLastLapTime > 0 ? <label htmlFor={'last-lap-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Last lap time</label> : null}
                    {showInRaceData && updatedRace.type !== RaceType.PURSUIT && updatedRace.leadEntryLastLapTime > 0 ? <output id={'last-lap-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Clock.formatDuration(updatedRace.leadEntryLastLapTime)}</output> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && updatedRace.type !== RaceType.PURSUIT && updatedRace.leadEntryLastLapTime > 0 ? <label htmlFor={'average-lap-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Average lap time</label> : null}
                    {showInRaceData && updatedRace.type !== RaceType.PURSUIT && updatedRace.leadEntryLastLapTime > 0 ? <output id={'average-lap-' + updatedRace.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Clock.formatDuration(updatedRace.leadEntryAverageLapTime)}</output> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && updatedRace.type !== RaceType.PURSUIT && updatedRace.leadEntryLapsSailed < updatedRace.plannedLaps ? <button id='shorten-course-button' className='w3-col' onClick={handleShortenCourseClick}>Shorten Course</button> : null}
                    {!showInRaceData && updatedRace.type !== RaceType.PURSUIT ? <button id='adjust-course-button' className='w3-col' onClick={handleShortenCourseClick}>Adjust Laps</button> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {elapsedTime < 0 ? <button id='race-postpone-button' className='w3-col' onClick={handleRacePostponeClick}>Postpone Start</button> : null}
                    {(elapsedTime >= 0 && (updatedRace.leadEntryLapsSailed == null || updatedRace.leadEntryLapsSailed < 1)) ? <button id='race-restart-button' className='w3-col' onClick={handleRacePostponeClick}>Restart Race</button> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {elapsedTime < 0 ? <button id='race-start-button' className='w3-col' onClick={handleRaceStartClick}>Start Now</button> : null}
                </div>
                <div className='w3-col m1 s6'>
                    <button id='race-start-button' className='w3-col' onClick={handleLapSheetClick}>Lap Sheet</button>
                </div>
            </div>
            <p className={userMessageClasses()}>{message}</p>
            <ModalDialog show={showPostponeRace} onClose={() => setShowPostponeRace(false)} testid={'postpone-race-dialog'} >
                <PostponeRaceForm race={updatedRace} onPostpone={controller.postponeRace} closeParent={closePostponeRaceFormDialog} />
            </ModalDialog>
            <ModalDialog show={showShortenCourse} onClose={closeShortenCourseDialog} testid={'shorten-course-dialog'}>
                {showInRaceData ? <AdjustCourseForm key={race.plannedLaps} race={updatedRace} minLaps={Math.max(1, updatedRace.leadEntryLapsSailed)} maxLaps={updatedRace.plannedLaps - 1} initialValue={Math.max(1, updatedRace.plannedLaps - 1)} onUpdate={controller.updateRacePlannedLaps} closeParent={closeShortenCourseDialog} /> :
                    <AdjustCourseForm key={race.plannedLaps} race={updatedRace} minLaps={Math.max(1, updatedRace.leadEntryLapsSailed)} initialValue={Math.max(1, updatedRace.plannedLaps)} onUpdate={controller.updateRacePlannedLaps} closeParent={closeShortenCourseDialog} />}
            </ModalDialog>
        </div>
    );
}

export default RaceHeaderView;