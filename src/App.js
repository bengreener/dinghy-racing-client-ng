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

import React, { useEffect, useRef } from 'react';
import DinghyClassConsole from './view/DinghyClassConsole';
import CreateRace from './view/CreateRace';
import ErrorBoundary from './view/ErrorBoundary';
import ModelContext from './view/ModelContext';
import ControllerContext from './view/ControllerContext';
import ViewUpcomingRaces from './view/ViewUpcomingRaces';
import SignUp from './view/SignUp';
import RaceConsole from './view/RaceConsole';
import Authorisation from './controller/authorisation';
import DownloadRacesForm from './view/DownloadRacesForm';
import RaceStartConsole from './view/RaceStartConsole';
import CompetitorsConsole from './view/CompetitorsConsole';
import ModalDialog from './view/ModalDialog';
import SetTimeForm from './view/SetTimeForm';
import Clock from './model/domain-classes/clock';

function App({model, controller}) {
    const [displayPort, setDisplayPort] = React.useState();
    const [roles, setRoles] = React.useState([]);
    const [showSetTimeForm, setShowSetTimeForm] = React.useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const authorisation = new Authorisation();
        authorisation.getRoles().then(newRoles => {
            if (newRoles.toString() !== roles.toString()) {
                setRoles(newRoles);
            }
        });
    });

    function showCreateDinghyClassForm() {
        setDisplayPort(<DinghyClassConsole key={Date.now()} />);
    }

    function showCreateRaceForm() {
        setDisplayPort(<CreateRace key={Date.now()} onCreate={controller.createRace} />);
    }

    function showUpcomingRaces() {
        setDisplayPort(<ViewUpcomingRaces key={Date.now()} showSignUpForm={showSignUpForm}/>);
    }

    function showSignUpForm(race) {
        setDisplayPort(<SignUp race={race} />)
    }

    function showRaceStartConsole() {
        setDisplayPort(<RaceStartConsole key={Date.now()}/>);
    }

    function showRaceConsole() {
        setDisplayPort(<RaceConsole key={Date.now()}/>);
    }

    function showCompetitorsConsole() {
        setDisplayPort(<CompetitorsConsole key={Date.now()}/>);
    }

    function showDownloadRaces() {
        setDisplayPort(<DownloadRacesForm key={Date.now()}/>);
    }

    function handleSynchExternalClockClick() {
        setShowSetTimeForm(true);
    }

    function closeSetTimeFormDialog() {
        setShowSetTimeForm(false);
    }

    function w3_open() {
        sidebarRef.current.style.display = 'block';
    }

    function w3_close() {
        sidebarRef.current.style.display = 'none';
    }

    return (
        <ModelContext.Provider value={model}>
        <ControllerContext.Provider value={controller}>
        <ErrorBoundary>
            <div className='w3-row w3-display-container w3-white' >
                <div className='w3-display-container'>
                    <img className='w3-image' src='/images/dinghy-icon.svg' alt='Dinghy Icon' />
                    <button className='w3-button w3-xlarge w3-display-right' onClick={w3_open}>☰</button>
                </div>
                <div ref={sidebarRef} className='w3-sidebar w3-bar-block w3-border-left' style={{display:'none', right:'0'}} >
                    <button onClick={w3_close} className='w3-bar-item w3-btn'>Close &times;</button>
                    {roles.includes('ROLE_RACE_SCHEDULER') ? 
                        <button key={0} type='button' className='w3-bar-item w3-btn' onClick={showCreateDinghyClassForm}>Dinghy Classes</button>
                        : null
                    }
                    {roles.includes('ROLE_RACE_SCHEDULER') ? 
                        <button key={1} type='button' className='w3-bar-item w3-btn' onClick={showCreateRaceForm}>Create Race</button>
                        : null
                    }
                    <button key={5} type='button' className='w3-bar-item w3-btn' onClick={showCompetitorsConsole}>Competitors</button>
                    {roles.includes('ROLE_RACE_OFFICER') ? 
                        <button key={6} type='button' className='w3-bar-item w3-btn' onClick={showDownloadRaces}>Download Races</button>
                        : null
                    }
                    {roles.includes('ROLE_RACE_OFFICER') ? 
                        <button key={7} type='button' className='w3-bar-item w3-btn' onClick={handleSynchExternalClockClick}>Synch External Clock</button>
                        : null
                    }
                    <button key={8} type='button' className='w3-bar-item w3-btn' onClick={() => {window.location.href = window.origin + '/logout'}}>Logout</button>
                </div>
                <nav className='w3-row w3-bginfosys-display-bottommiddle-m1' >
                    <button key={2} type='button' className='w3-third bginfosys-min-content w3-btn w3-card' onClick={showUpcomingRaces}>Enrolment</button>
                    {roles.includes('ROLE_RACE_OFFICER') ? 
                        <button key={3} type='button' className='w3-third w3-btn w3-card' onClick={showRaceStartConsole}>Race Start</button>
                        : null
                    }
                    {roles.includes('ROLE_RACE_OFFICER') ? 
                        <button key={4} type='button' className='w3-third w3-btn w3-card' onClick={showRaceConsole}>Run Race</button>
                        : null
                    }
                </nav>
            </div>
            <div className='display-port' >
            <ErrorBoundary key={Date.now()}>
                {displayPort}
            </ErrorBoundary>
            </div>
            <ModalDialog show={showSetTimeForm} onClose={() => setShowSetTimeForm(false)} testid={'synch-external-time-dialog'} >
                <SetTimeForm setTime={Clock.synchToTime} closeParent={closeSetTimeFormDialog} />
            </ModalDialog>
        </ErrorBoundary>
        </ControllerContext.Provider>
        </ModelContext.Provider>
    );
}

export default App;