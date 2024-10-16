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

import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import Clock from '../model/domain-classes/clock';
import ModelContext from './ModelContext';
import ControllerContext from './ControllerContext';
import PostponeRaceForm from './PostponeRaceForm';
import ModalDialog from './ModalDialog';
import AdjustCourseForm from './AdjustCourseForm';
import RaceType from '../model/domain-classes/race-type';

/**
 * Present summary information ablout a race
 * @param {Object} props
 * @param {Race} race 
 * @param {boolean} [showInRaceData = true] enables or disables display of remaiing duration, estimated laps, last lap time for lead boat, and average lap time for lead boat
 * @returns {HTMLDivElement}
 */
function RaceHeaderView({ race, showInRaceData = true }) {
    const model = useContext(ModelContext);
    const controller = useContext(ControllerContext);
    const [updatedRace, setUpdatedRace] = useState(race);
    const [elapsedTime, setElapsedTime] = useState(race.clock.getElapsedTime());
    const [message, setMessage] = useState('');
    const previousRace = useRef(); // enables removal of tickHandler from previous race when rendered with new race
    const [showPostponeRace, setShowPostponeRace] = useState(false);
    const [showShortenCourse, setShowShortenCourse] = useState(false);

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

    function handleShortenCourseClick() {
        setShowShortenCourse(true);
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
        });
        previousRace.current = race;
    }, [race]);

    function closePostponeRaceFormDialog() {
        setShowPostponeRace(false);
    };

    function closeShortenCourseDialog() {
        setShowShortenCourse(false);
    };

    return (
        <div className='race-header-view' >
            <div className='w3-row' >
                <label  className='w3-col m2' ><b>{race.name}</b></label>
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
                    <label htmlFor={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{(elapsedTime < 0) ? 'Countdown' : 'Remaining'}</label>
                    <output id={'race-duration-remaining-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{(elapsedTime < 0) ? Clock.formatDuration(-elapsedTime) : Clock.formatDuration(race.duration - elapsedTime)}</output>
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && race.type !== RaceType.PURSUIT && updatedRace.lastLapTime > 0 ? <label htmlFor={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Laps estimate</label> : null}
                    {showInRaceData && race.type !== RaceType.PURSUIT && updatedRace.lastLapTime > 0 ? <output id={'estmated-race-laps-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Number(updatedRace.lapForecast).toFixed(2)}</output> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && race.type !== RaceType.PURSUIT && updatedRace.lastLapTime > 0 ? <label htmlFor={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Last lap time</label> : null}
                    {showInRaceData && race.type !== RaceType.PURSUIT && updatedRace.lastLapTime > 0 ? <output id={'last-lap-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Clock.formatDuration(updatedRace.lastLapTime)}</output> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && race.type !== RaceType.PURSUIT && updatedRace.lastLapTime > 0 ? <label htmlFor={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >Average lap time</label> : null}
                    {showInRaceData && race.type !== RaceType.PURSUIT && updatedRace.lastLapTime > 0 ? <output id={'average-lap-' + race.name.replace(/ /g, '-').toLowerCase()} className='w3-col' >{Clock.formatDuration(updatedRace.averageLapTime)}</output> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {showInRaceData && race.type !== RaceType.PURSUIT && updatedRace.lapsSailed < updatedRace.plannedLaps - 1 ? <button id='shorten-course-button' className='w3-col' onClick={handleShortenCourseClick}>Shorten Course</button> : null}
                    {!showInRaceData && race.type !== RaceType.PURSUIT ? <button id='adjust-course-button' className='w3-col' onClick={handleShortenCourseClick}>Adjust Course</button> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {elapsedTime < 0 ? <button id='race-postpone-button' className='w3-col' onClick={handleRacePostponeClick}>Postpone Start</button> : null}
                </div>
                <div className='w3-col m1 s6'>
                    {elapsedTime < 0 ? <button id='race-start-button' className='w3-col' onClick={handleRaceStartClick}>Start Now</button> : null}
                </div>
            </div>
            <p id="race-header-message" className={!message ? "hidden" : ""}>{message}</p>
            <ModalDialog show={showPostponeRace} onClose={() => setShowPostponeRace(false)} testid={'postpone-race-dialog'} >
                <PostponeRaceForm race={race} onPostpone={controller.postponeRace} closeParent={closePostponeRaceFormDialog} />
            </ModalDialog>
            <ModalDialog show={showShortenCourse} onClose={closeShortenCourseDialog} testid={'shorten-course-dialog'}>
                {showInRaceData ? <AdjustCourseForm race={race} minLaps={updatedRace.lapsSailed + 1} maxLaps={updatedRace.plannedLaps - 1} initialValue={updatedRace.plannedLaps - 1} onUpdate={controller.updateRacePlannedLaps} closeParent={closeShortenCourseDialog} /> : 
                    <AdjustCourseForm race={race} minLaps={updatedRace.lapsSailed + 1} initialValue={updatedRace.plannedLaps - 1} onUpdate={controller.updateRacePlannedLaps} closeParent={closeShortenCourseDialog} />}
            </ModalDialog>
        </div>
    );
}

export default RaceHeaderView;