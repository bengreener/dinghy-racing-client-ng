import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DinghyRacingController from './controller/dinghy-racing-controller'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
const controller = new DinghyRacingController();

root.render(
  <React.StrictMode>
    <App controller={controller}/>
  </React.StrictMode>
);
