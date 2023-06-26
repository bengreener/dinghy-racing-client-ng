import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DinghyRacingController from './controller/dinghy-racing-controller'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App controller={DinghyRacingController}/>
  </React.StrictMode>
);
