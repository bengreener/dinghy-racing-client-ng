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

import SynchronousDinghy from './synchronous-dinghy';
import SynchronousEntry from './synchronous-entry';
import SynchronousFleet from './synchronous-fleet';
import SynchronousRace from './synchronous-race';

 async function buildSynchronousDinghy(dinghy) {
    const dinghyClass = await dinghy.getDinghyClass();
    return new SynchronousDinghy(dinghy, dinghyClass);
}

// async function buildSynchronousEntry(entry) {
//     const results = await Promise.all([entry.getDinghy(), entry.getHelm(), entry.getDirectRace(), entry.getLaps(), entry.getPositionInDirectRace(), entry.getCrew()]);
//     const dinghy = await buildSynchronousDinghy(results[0]);
//     return new SynchronousEntry(entry, dinghy, results[1], results[2], results[3], results[4], results[5]);
// }
async function buildSynchronousEntry(entry) {
    const results = await Promise.all([entry.getDinghy(), entry.getHelm(), entry.getDirectRace(), entry.getLaps(), entry.getSignedUpToDirectRace(), entry.getCrew()]);
    const dinghy = await buildSynchronousDinghy(results[0]);
    return new SynchronousEntry(entry, dinghy, results[1], results[2], results[3], results[4], results[5]);
}

/**
 * 
 * @param {Array<Race>} races 
 * @returns {Array<SynchronousEntry>}
 */
async function buildSynchronousEntries(races) {
    const arrayEntriesCollections = await Promise.all(races.map((race) => {
        return race.getEntries();
    }));
    const entries = arrayEntriesCollections.flatMap((entryCollection) => {return entryCollection.entities});
    return Promise.all(entries.map((entry) => {return buildSynchronousEntry(entry)}));
    // return entries.map((entry) => {return buildSynchronousEntry(entry)});
}

async function buildSynchronousFleet(fleet) {
    const dinghyClasses = await fleet.getDinghyClasses();
    return new SynchronousFleet(dinghyClasses);
}

async function buildSynchronousRace(race) {
    const fleet = await race.getFleet();
    const results = await Promise.all([buildSynchronousFleet(fleet), buildSynchronousEntries([race])]);
    return new SynchronousRace(race, results[0], results[1]);
}

export { buildSynchronousDinghy, buildSynchronousEntry, buildSynchronousEntries, buildSynchronousFleet, buildSynchronousRace };