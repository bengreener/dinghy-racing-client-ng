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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SylphView from './view/SylphView.jsx';
import SylphModel from './model/sylph-model.js';
import SylphController from './controller/sylph-controller.js';
import getDinghyRacingProperties from './dinghy-racing-properties';

const propertiesResource = window.location.origin + window.location.pathname + 'dinghyracingproperties/connectionurls';
const properties = await getDinghyRacingProperties(propertiesResource);
const model = new SylphModel(properties.httpRootURL, properties.wsRootURL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SylphView model={model} controller={new SylphController(model)}/>
  </StrictMode>,
)
