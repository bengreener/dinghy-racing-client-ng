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

import React, { useEffect } from 'react';
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

function App({model, controller}) {
  const [displayPort, setDisplayPort] = React.useState();
  const [roles, setRoles] = React.useState([]);
  
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

  return (
    <ModelContext.Provider value={model}>
    <ControllerContext.Provider value={controller}>
    <ErrorBoundary>
      <div className="container-fluid">
        <header style={{backgroundImage: 'url("./images/home-jumbotron-image.jpg")',}}>
            <h1 className='display-4'>Dinghy Racing</h1>
        </header>
        <div className='list-group'>
          {roles.includes('ROLE_RACE_SCHEDULER') ? 
            <button key={0} type='button' className='list-group-item list-group-item-action' onClick={showCreateDinghyClassForm}>Create Dinghy Class</button> 
            : null
          }
          {roles.includes('ROLE_RACE_SCHEDULER') ? 
            <button key={1} type='button' className='list-group-item list-group-item-action' onClick={showCreateRaceForm}>Create Race</button> 
            : null
          }
          <button key={2} type='button' className='list-group-item list-group-item-action' onClick={showUpcomingRaces}>Upcoming Races</button>
          {roles.includes('ROLE_RACE_OFFICER') ? 
            <button key={3} type='button' className='list-group-item list-group-item-action' onClick={showRaceStartConsole}>Race Start Console</button>
            : null
          }
          {roles.includes('ROLE_RACE_OFFICER') ? 
            <button key={4} type='button' className='list-group-item list-group-item-action' onClick={showRaceConsole}>Race Console</button>
            : null
          }
          <button key={5} type='button' className='list-group-item list-group-item-action' onClick={showCompetitorsConsole}>Competitors</button>
          {roles.includes('ROLE_RACE_OFFICER') ? 
            <button key={6} type='button' className='list-group-item list-group-item-action' onClick={showDownloadRaces}>Download Races</button>
            : null
          }
          <button key={7} type='button' className='list-group-item list-group-item-action' onClick={() => {window.location.href = window.origin + '/logout'}}>Logout</button>
        </div>
        <div className="display-port">
          <ErrorBoundary key={Date.now()}>
            {displayPort}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
    </ControllerContext.Provider>
    </ModelContext.Provider>
  );
}

export default App;

