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

import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpConsole from './SignUpConsole';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Entry from '../model/entry';
import DirectRace from '../model/direct-race';
import { httpRootURL, wsRootURL, raceScorpionAHAL, entryChrisMarshall1234ScorpionAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const controller = new SylphController(model);
    const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
    await act(async () => {
        render(<SignUpConsole model={model} controller={controller} race={race} />);
    });
    expect(screen.getByRole('heading', {name: /scorpion a/i})).toBeInTheDocument();
});
describe('when the withdraw button for an entry is clicked', () => {
    it('calls the controller withDraw entry method with the entry to be withdrawn', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        const race = new DirectRace(raceScorpionAHAL, {version: '"0"'}, model);
        const withdrawEntrySpy = vi.spyOn(controller, 'withdrawEntry');
        await act(async () => {
            render(<SignUpConsole  model={model} controller={controller} race={race}/>);
        });
        const currentEntries = document.getElementsByClassName('current-entries')[0];
        const entryToWithdraw = within(currentEntries).getByRole('row', {name: /chris marshall/i});
        await user.click(within(entryToWithdraw).getByRole('button', {name: /x/i}));
        expect(withdrawEntrySpy).toBeCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model));
    });
});