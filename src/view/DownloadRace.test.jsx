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

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { httpRootURL, wsRootURL, fleetScorpionHAL, raceScorpionAHAL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import Fleet from '../model/fleet';
import Race from '../model/race';
import DownloadRace from './DownloadRace';
import NameFormat from '../controller/name-format';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

it('displays race name', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    render(<DownloadRace race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
    expect(screen.findByText(/scorpion a/i));
});
it('displays race fleet', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    vi.spyOn(model, 'getFleet').mockImplementation(async () => {return new Fleet({...fleetScorpionHAL, name: 'Fleet Name Here'}, {version: '"0"'}, model)});
    render(<DownloadRace race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
    expect(screen.findByText(/fleet name here/i));
});
it('displays race start time', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    render(<DownloadRace race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
    const expectedPlannedTime = new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: false
    }).format(new Date(raceScorpionAHAL.plannedStartTime + 'Z'));
    expect(screen.getByText(expectedPlannedTime));
});
it('displays options to output name as firstname surname or surname, firstname', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    render(<DownloadRace race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
    expect(screen.getByRole('radio', {name: /firstname surname/i}));
    expect(screen.getByRole('radio', {name: /surname, firstname/i}));
});
it('displays download race button', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    render(<DownloadRace race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} />);
    expect(screen.getByRole('button', {name: /download results/i}));
});
it('calls method passed to download function with race', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    const downloadFunctionSpy = vi.fn();
    render(<DownloadRace race={new Race(raceScorpionAHAL, {version: '"0"'}, model)} downloadFunction={downloadFunctionSpy} />);
    await user.click(await screen.findByRole('button', {name: /download results/i}));
    expect(downloadFunctionSpy).toBeCalledWith(new Race(raceScorpionAHAL, {version: '"0"'}, model), {nameFormat: NameFormat.FIRSTNAMESURNAME});
});