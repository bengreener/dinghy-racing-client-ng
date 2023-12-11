import React from 'react';
import CreateDinghyClass from './view/CreateDinghyClass';
import CreateRace from './view/CreateRace';
import ErrorBoundary from './view/ErrorBoundary';
import ModelContext from './view/ModelContext';
import ControllerContext from './view/ControllerContext';
import ViewUpcomingRaces from './view/ViewUpcomingRaces';
import SignUp from './view/SignUp';
import RaceConsole from './view/RaceConsole';

function App({model, controller}) {
  const [displayPort, setDisplayPort] = React.useState();

  function showCreateDinghyClassForm() {
    setDisplayPort(<CreateDinghyClass key={Date.now()} onCreate={controller.createDinghyClass} />);
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

  function showRaceConsole() {
    setDisplayPort(<RaceConsole key={Date.now()}/>);
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
          <button key={0} type='button' className='list-group-item list-group-item-action' onClick={showCreateDinghyClassForm}>Create Dinghy Class</button>
          <button key={1} type='button' className='list-group-item list-group-item-action' onClick={showCreateRaceForm}>Create Race</button>
          <button key={2} type='button' className='list-group-item list-group-item-action' onClick={showUpcomingRaces}>Upcoming Races</button>
          <button key={3} type='button' className='list-group-item list-group-item-action' onClick={showRaceConsole}>Race Console</button>
        </div>
        <div className="display-port">
          <ErrorBoundary>
            {displayPort}
          </ErrorBoundary>
        </div>
        <footer style={{backgroundImage: 'url("./images/home-footer-image.jpg")',}} />
      </div>
    </ErrorBoundary>
    </ControllerContext.Provider>
    </ModelContext.Provider>
  );
}

export default App;

