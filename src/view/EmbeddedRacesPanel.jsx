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

import EmbeddedRace from '../model/embedded-race';
import EmbeddedRaceSelector from './EmbeddedRaceSelector';

/**
 * Display embedded races for selection
 * @param {Object} props
 * @param {Array<EmbeddedRace} props.embeddedRaces
 * @param {Function} props.onRaceSelectionChange
 * @returns {HTMLDivElement}
 */
function EmbeddedRacesPanel({ embeddedRaces = [], onRaceSelectionChanged, selectedRaces = [] }) {

    function handleEmbeddedRaceSelectionChange(embeddedRace) {
        let newSelectedRaces = [];        
        if (selectedRaces.find(er => er.name === embeddedRace.name)) {
            selectedRaces.forEach(er => {
                if (er.name != embeddedRace.name) {
                    newSelectedRaces.push(er);
                }
            });
        }
        else {
            newSelectedRaces = [...selectedRaces, embeddedRace];
        }
        if (onRaceSelectionChanged) {
            onRaceSelectionChanged(newSelectedRaces);
        }
    }

    function raceIsSelected(embeddedRace) {
        const selectedRaceNames = selectedRaces.map(race => race.name);
        return selectedRaceNames.includes(embeddedRace.name);
    }

    return (
        <div>
            {embeddedRaces.map(embeddedRace => <EmbeddedRaceSelector key={embeddedRace.name + raceIsSelected(embeddedRace)} embeddedRace={embeddedRace} raceSelected={raceIsSelected(embeddedRace)} onChange={handleEmbeddedRaceSelectionChange} />)}
        </div>
    )
}

export default EmbeddedRacesPanel;