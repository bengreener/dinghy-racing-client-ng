import React from 'react';
import CreateDinghyClass from './component/CreateDinghyClass';

function App() {
  const [displayPort, setDisplayPort] = React.useState();

  function showCreateDinghyClassForm() {
    setDisplayPort(<CreateDinghyClass onCreate={(dinghyClass) => alert(`New dinghy class: ${dinghyClass.name}`)} />);
  }

  return (
      <div className="container-fluid">
        <header style={{backgroundImage: 'url("./images/home-jumbotron-image.jpg")',}}>
            <h1 className='display-4'>Dinghy Racing</h1>
            <p className='lead'>Create, join, and run dinghy races :-D</p>
        </header>
        <div className='list-group'>
          <button key={0} type='button' className='list-group-item list-group-item-action' onClick={showCreateDinghyClassForm}>Create Dinghy Class</button>
        </div>
        <div className="display-port">
          {displayPort}
        </div>
        <footer style={{backgroundImage: 'url("./images/home-footer-image.jpg")',}} />
      </div>
  );
}

export default App;
