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

import { render, screen } from '@testing-library/react';
import EditRaceEntryView from './RaceEntryView';
import { httpRootURL, wsRootURL, competitorChrisMarshallHAL, entryChrisMarshall1234ScorpionAHAL, 
    dinghy1234HAL, dinghyClassScorpionHAL, raceScorpionAHAL,
    signedUpChrisMarshallDinghy1234ScorpionAHAL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import Competitor from '../model/competitor';
import Collection from '../model/collection';
import Dinghy from '../model/dinghy';
import DinghyClass from '../model/dinghy-class';
import Entry from '../model/entry';
import DirectRace from '../model/direct-race';
import SignedUp from '../model/signed-up';
import SynchronousDinghy from './synchronous-model/synchronous-dinghy';
import SynchronousEntry from './synchronous-model/synchronous-entry';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

it('renders', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
        new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"', model}), 
        new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
        new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
        new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
        new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
        new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
    );
    render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
    const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
    expect(SMScorp1234entry).toBeInTheDocument();
});