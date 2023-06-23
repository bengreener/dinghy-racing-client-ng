import React, { useEffect } from 'react';

function App() {
  const [displayPort, setDisplayPort] = React.useState();

  return (
    <>
      <div className="container-fluid">
        <header style={{backgroundImage: 'url("./images/home-jumbotron-image.jpg")',}}>
            <h1 className='display-4'>Dinghy Racing</h1>
            <p className='lead'>Create, join, and run dinghy races :-D</p>
        </header>
        <div className='list-group'>
          <button key={0} type='button' className='list-group-item list-group-item-action' >Create Dinghy Class</button>
        </div>
        <div className="display-port">
          {displayPort}
        </div>
        <footer style={{backgroundImage: 'url("./images/home-footer-image.jpg")',}} />
      </div>
        {/* {dialog} */}
    </>
  );
}

export default App;
