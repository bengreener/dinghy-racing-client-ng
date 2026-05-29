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

import { useEffect, useRef, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import ClockDisplay from './ClockDisplay';
import CompetitorsConsole from './CompetitorsConsole';
import CreateRace from './CreateRace';
import DinghyClassConsole from './DinghyClassConsole';
import DownloadRacesForm from './DownloadRacesForm';
import FleetConsole from './FleetConsole';
import SignUpConsole from './SignUpConsole';
import RaceStartConsole from './RaceStartConsole';
import RaceConsole from './RaceConsole';
import Authorisation from '../controller/authorisation';
import UpcomingRacesConsole from './UpcomingRacesConsole';

function SylphView({model, controller}) {
    const [displayPort, setDisplayPort] = useState();
    const [roles, setRoles] = useState([]);
    const sidebarRef = useRef(null);
    
    const enrolmentButtonRef = useRef(null);
    const raceStartButtonRef = useRef(null);
    const runRaceButtonRef = useRef(null);

    useEffect(() => {
        const authorisation = new Authorisation();
        authorisation.getRoles().then(newRoles => {
            if (newRoles.toString() !== roles.toString()) {
                setRoles(newRoles);
            }
        });
    });

    function showCreateDinghyClassForm() {
        raceStartButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.remove('selected');
        setDisplayPort(<DinghyClassConsole key={Date.now()} model={model} controller={controller} />);
    }

    function showFleetsForm() {
        raceStartButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.remove('selected');
        setDisplayPort(<FleetConsole key={Date.now()} model={model} controller={controller} />);
    }

    function showCreateRaceForm() {
        raceStartButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.remove('selected');
        setDisplayPort(<CreateRace key={Date.now()} model={model} controller={controller} onCreate={controller.createRace} />);
    }

    function showUpcomingRaces() {
        raceStartButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.add('selected');
        setDisplayPort(<UpcomingRacesConsole key={Date.now()} model={model} showSignUpConsole={showSignUpConsole}/>);
    }

    function showSignUpConsole(race, model) {
        raceStartButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.remove('selected');
        setDisplayPort(<SignUpConsole key={Date.now()} race={race} model={model} controller={controller} />);
    }

    function showRaceStartConsole() {
        enrolmentButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        raceStartButtonRef.current?.classList.add('selected');
        setDisplayPort(<RaceStartConsole key={Date.now()} model={model} controller={controller} />);
    }

    function showRaceConsole() {
        raceStartButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.add('selected');
        setDisplayPort(<RaceConsole key={Date.now()} model={model} controller={controller} />);
    }

    function showCompetitorsConsole() {
        raceStartButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.remove('selected');
        setDisplayPort(<CompetitorsConsole key={Date.now()} model={model} controller={controller} />);
    }

    function showDownloadRaces() {
        raceStartButtonRef.current?.classList.remove('selected');
        runRaceButtonRef.current?.classList.remove('selected');
        enrolmentButtonRef.current?.classList.remove('selected');
        setDisplayPort(<DownloadRacesForm key={Date.now()} model={model} controller={controller} />);
    }

    function w3_open() {
        sidebarRef.current.style.display = 'block';
    }

    function w3_close() {
        sidebarRef.current.style.display = 'none';
    }

    return (
        <ErrorBoundary>
            <div className='w3-row w3-display-container w3-white' >
                <div className='w3-display-container'>
                    <img className='w3-image' src='/dinghy-icon.svg' alt='Dinghy Icon' />
                    <button className='w3-button w3-xlarge w3-display-right' onClick={w3_open}>☰</button>
                </div>
                <div ref={sidebarRef} className='w3-sidebar w3-bar-block w3-border-left' style={{display:'none', right:'0'}} >
                    <button onClick={w3_close} className='w3-bar-item w3-btn'>Close &times;</button>
                    {roles.includes('ROLE_RACE_SCHEDULER') ? 
                        <button key={0} type='button' className='w3-bar-item w3-btn' onClick={showCreateDinghyClassForm}>Dinghy Classes</button>
                        : null
                    }{roles.includes('ROLE_RACE_SCHEDULER') ? 
                        <button key={1} type='button' className='w3-bar-item w3-btn' onClick={showFleetsForm}>Fleets</button>
                        : null
                    }
                    {roles.includes('ROLE_RACE_SCHEDULER') ? 
                        <button key={2} type='button' className='w3-bar-item w3-btn' onClick={showCreateRaceForm}>Create Race</button>
                        : null
                    }
                    <button key={6} type='button' className='w3-bar-item w3-btn' onClick={showCompetitorsConsole}>Competitors</button>
                    {roles.includes('ROLE_RACE_OFFICER') ? 
                        <button key={7} type='button' className='w3-bar-item w3-btn' onClick={showDownloadRaces}>Download Races</button>
                        : null
                    }
                    <button key={9} type='button' className='w3-bar-item w3-btn' onClick={() => {window.location.href = window.origin + '/logout'}}>Logout</button>
                </div>
                <nav className='w3-row w3-bginfosys-display-bottommiddle-m1' >
                    <button key={3} ref={enrolmentButtonRef} type='button' className='w3-bginfosys-third bgis-min-content w3-btn w3-card' onClick={() => showUpcomingRaces(model)}>Enrolment</button>
                    {roles.includes('ROLE_RACE_OFFICER') ? 
                        <button key={4} ref={raceStartButtonRef} type='button' className='w3-bginfosys-third w3-btn w3-card' onClick={showRaceStartConsole}>Race Start</button>
                        : null
                    }
                    {roles.includes('ROLE_RACE_OFFICER') ? 
                        <button key={5} ref={runRaceButtonRef} type='button' className='w3-bginfosys-third w3-btn w3-card' onClick={showRaceConsole}>Run Race</button>
                        : null
                    }
                </nav>
            </div>
            <div className='w3-row'>
                <div className='w3-right'>
                    <ClockDisplay clock={model.getClock()} />
                </div>
            </div>
            <div className='display-port' >
            <ErrorBoundary>
                {displayPort}
            </ErrorBoundary>
            </div>
        </ErrorBoundary>
    )
}

export default SylphView;
