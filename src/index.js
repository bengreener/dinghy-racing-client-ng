import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DinghyRacingModel from './model/dinghy-racing-model';
import DinghyRacingController from './controller/dinghy-racing-controller'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
const model = new DinghyRacingModel('http://localhost:8081/dinghyracing/api');
const controller = new DinghyRacingController(model);

root.render(
  <React.StrictMode>
    <App controller={controller}/>
  </React.StrictMode>
);
