import React from 'react';
import CreateDinghyClass from './view/CreateDinghyClass';
import CreateRace from './view/CreateRace';

function App({controller}) {
  const [displayPort, setDisplayPort] = React.useState();

  function showCreateDinghyClassForm() {
    setDisplayPort(<CreateDinghyClass onCreate={controller.createDinghyClass} />);
  }

  function showCreateRaceForm() {
    setDisplayPort(<CreateRace onCreate={controller.createRace} />);
  }

  return (
      <div className="container-fluid">
        <header style={{backgroundImage: 'url("./images/home-jumbotron-image.jpg")',}}>
            <h1 className='display-4'>Dinghy Racing</h1>
            <p className='lead'>Create, join, and run dinghy races :-D</p>
        </header>
        <div className='list-group'>
          <button key={0} type='button' className='list-group-item list-group-item-action' onClick={showCreateDinghyClassForm}>Create Dinghy Class</button>
          <button key={1} type='button' className='list-group-item list-group-item-action' onClick={showCreateRaceForm}>Create Race</button>
        </div>
        <div className="display-port">
          {displayPort}
        </div>
        <footer style={{backgroundImage: 'url("./images/home-footer-image.jpg")',}} />
      </div>
  );
}

export default App;
