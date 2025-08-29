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
import userEvent from '@testing-library/user-event';
import { raceScorpionA } from '../model/__mocks__/test-data';
import DownloadRace from './DownloadRace';
import NameFormat from '../controller/name-format';

it('displays race name', () => {
    render(<DownloadRace race={raceScorpionA} />);
    expect(screen.getByText(/scorpion a/i));
});
it('displays race class', () => {
    render(<DownloadRace race={{...raceScorpionA, dinghyClass: {name: 'DinghyClass'}}} />);
    expect(screen.getByText(/dinghyclass/i));
});
it('displays race start time', () => {
    render(<DownloadRace race={raceScorpionA} />);
    const expectedPlannedTime = new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'medium',
        timeStyle: 'medium',
        hour12: false
    }).format(raceScorpionA.plannedStartTime);
    expect(screen.getByText(expectedPlannedTime));
});
it('displays options to output name as firstname surname or surname, firstname', () => {
    render(<DownloadRace race={raceScorpionA} />);
    expect(screen.getByRole('radio', {name: /firstname surname/i}));
    expect(screen.getByRole('radio', {name: /surname, firstname/i}));
});
it('displays download race button', () => {
    render(<DownloadRace race={raceScorpionA} />);
    expect(screen.getByRole('button', {name: /download results/i}));
});
it('calls method passed to download function with race', async () => {
    const user = userEvent.setup();
    const downloadFunctionSpy = vi.fn();
    render(<DownloadRace race={raceScorpionA} downloadFunction={downloadFunctionSpy} />);
    await user.click(screen.getByRole('button', {name: /download results/i}));
    expect(downloadFunctionSpy).toBeCalledWith(raceScorpionA, {nameFormat: NameFormat.FIRSTNAMESURNAME});
});