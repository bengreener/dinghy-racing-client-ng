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
