import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DinghyRacingModel from './model/dinghy-racing-model';
import DinghyRacingController from './controller/dinghy-racing-controller'; 
import getDinghyRacingProperties from './dinghy-racing-properties';

const propertiesResource = window.location.origin + window.location.pathname + 'dinghyracingproperties/connectionurls';
const properties = await getDinghyRacingProperties(propertiesResource);
const root = ReactDOM.createRoot(document.getElementById('root'));
const model = new DinghyRacingModel(properties.httpRootURL, properties.wsRootURL);
const controller = new DinghyRacingController(model);

root.render(
  <React.StrictMode>
    <App model={model} controller={controller} />
  </React.StrictMode>
);
