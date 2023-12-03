import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DinghyRacingModel from './model/dinghy-racing-model';
import DinghyRacingController from './controller/dinghy-racing-controller'; 

const response = await fetch("properties.json");
const properties = await response.json();
const root = ReactDOM.createRoot(document.getElementById('root'));
// const model = new DinghyRacingModel('http://localhost:8081/dinghyracing/api', 'ws://localhost:8081/dinghyracingws');
// const model = new DinghyRacingModel('http://bginfosys.com:8080/dinghyracing/api', 'ws://bginfosys.com:8080/dinghyracingws');
const model = new DinghyRacingModel(properties.httpRootURL, properties.wsRootURL);
const controller = new DinghyRacingController(model);

root.render(
  <React.StrictMode>
    <App model={model} controller={controller}/>
  </React.StrictMode>
);
