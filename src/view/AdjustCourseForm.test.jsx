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
import AdjustCourseForm from './AdjustCourseForm';
import SylphModel from '../model/sylph-model';
import DirectRace from '../model/direct-race';
import { httpRootURL, wsRootURL, raceScorpionAHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../model/clock.js');

it('renders', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
    render(<AdjustCourseForm race={race}/>);
    expect(screen.getByLabelText(/Current laps/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New laps/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Update Laps/})).toBeInTheDocument();
});

it('displays current number of laps set for race', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
    render(<AdjustCourseForm race={race}/>);
    expect(screen.getByLabelText(/Current laps/i)).toHaveValue('5');
})

it('displays new value typed in for laps', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
    render(<AdjustCourseForm race={race} minLaps={0}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
    const lapInput = screen.getByLabelText(/new laps/i);
    await act(async () => {
        await user.clear(lapInput);
        await user.type(lapInput, '5');
    });
    expect(lapInput).toHaveValue('5');
});

it('does not accept an input greater than value set for maximum laps', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
    render(<AdjustCourseForm race={race} minLaps={0} maxLaps={3} />);
    const lapInput = screen.getByLabelText(/new laps/i);
    await act(async () => {
        await user.clear(lapInput);
        await user.type(lapInput, '5');
    });
    expect(lapInput).not.toHaveValue(5);
});

it('does not accept an input less than value set for minimum laps', async () => {
    const user = userEvent.setup();
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
    render(<AdjustCourseForm race={race} minLaps={3} />);
    const lapInput = screen.getByLabelText(/new laps/i);
    await act(async () => {
        await user.clear(lapInput); // fails as value would be 0
        await user.type(lapInput, '2'); // results in a value of 32
    });
    expect(lapInput).not.toHaveValue(2);
});

it('shows initial value set for number of laps', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
    render(<AdjustCourseForm race={race} initialValue={3} />);
    expect(screen.getByLabelText(/new laps/i)).toHaveValue('3');
});

describe('when up arrow key is pressed', () => {
    it('adds 1 to value for new laps', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} initialValue={race.plannedLaps}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            lapInput.focus();
            await user.keyboard('{ArrowUp}');
        });
        expect(lapInput).toHaveValue('6');
    });
});

describe('when down arrow key is pressed', () => {
    it('subtracts 1 from value for new laps', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} initialValue={race.plannedLaps}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            lapInput.focus();
            await user.keyboard('{ArrowDown}');
        });
        expect(lapInput).toHaveValue('4');
    });
});

describe('when +1 button is pressed', () => {
    it('adds 1 to value for new laps', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} initialValue={race.plannedLaps}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            await user.click(screen.getByText(/\+1 lap/i));
        });
        expect(lapInput).toHaveValue('6');
    });
});

describe('when -1 button is pressed', () => {
    it('subtracts 1 from value for new laps', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} initialValue={race.plannedLaps}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            await user.click(screen.getByText(/-1 lap/i));
        });
        expect(lapInput).toHaveValue('4');
    });
});

describe('when backspace key is pressed and lap count in single digits', () => {
    it('proposed new laps set to 0', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} initialValue={race.plannedLaps}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            lapInput.focus();
            await user.keyboard('{Backspace}');
        });
        expect(lapInput).toHaveValue('0');
    });
});

describe('when update laps button clicked', () => {
    it('calls function passed to onUpdate with race and value entered for laps', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        const onUpdateSpy = vi.fn();
        const user = userEvent.setup();
        render(<AdjustCourseForm race={race} minLaps={0} maxLaps={5} initialValue={3} onUpdate={onUpdateSpy} />);
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            await user.clear(lapInput);
            await user.type(lapInput, '4');
        });
        await user.click(screen.getByRole('button', {name: /Update Laps/}));
        expect(onUpdateSpy).toHaveBeenCalledWith(race, 4);
    });
});

describe('when the minimum number of laps set for the race would be breached by an update', () => {
    it('displays a clear message to the user', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} minLaps={4} initialValue={race.plannedLaps}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            lapInput.focus();
            await user.keyboard('{ArrowDown}');
            await user.keyboard('{ArrowDown}');
        });
        expect(screen.getByText(/Cannot adjust course to less than 4 laps./)).toBeInTheDocument();
    });
    it('does not accept value entered', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        const onUpdateSpy = vi.fn();
        render(<AdjustCourseForm race={race} initialValue={race.plannedLaps} onUpdate={onUpdateSpy} />); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            lapInput.focus();
            await user.keyboard('{Backspace}');
        });
        await user.click(screen.getByRole('button', {name: /Update Laps/}));
        expect(onUpdateSpy).not.toHaveBeenCalled();
    });
});

describe('when the maximum number of laps set for the race would be breached by an update', () => {
    it('displays a clear message to the user', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} maxLaps={5} initialValue={race.plannedLaps}/>); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            lapInput.focus();
            await user.keyboard('{ArrowUp}');
        });
        expect(screen.getByText(/Cannot adjust course to more than 5 laps./)).toBeInTheDocument();
    });
    it('does not accept value entered', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        const onUpdateSpy = vi.fn();
        render(<AdjustCourseForm race={race} maxLaps={5} initialValue={race.plannedLaps} onUpdate={onUpdateSpy} />); // minLaps is set to 0 to allow user.clear to work; otherwise cleared value ('') will fail handleChange value test and value will not be updated
        const lapInput = screen.getByLabelText(/new laps/i);
        await act(async () => {
            await user.type(lapInput, '15');
        });
        expect(lapInput).toHaveValue('5');
    });
});

describe('when enter button is pressed', () => {
    it('calls function passed to onUpdate with race and value entered for laps', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        const onUpdateSpy = vi.fn();
        const user = userEvent.setup();
        render(<AdjustCourseForm race={race} minLaps={0} maxLaps={5} initialValue={3} onUpdate={onUpdateSpy} />);
        await user.keyboard('{Enter}');
        expect(onUpdateSpy).toHaveBeenCalledWith(race, 3);
    });
});

describe('when contained in a modal dialog', () => {
    describe('when update laps button clicked', () => {
        it('closes containing dialog', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
            const onUpdateSpy = vi.fn();
            const closeParentSpy = vi.fn();
            const user = userEvent.setup();
            render(<AdjustCourseForm race={race} minLaps={0} maxLaps={5} initialValue={3} onUpdate={onUpdateSpy} closeParent={closeParentSpy} />);
            const lapInput = screen.getByLabelText(/new laps/i);
            await act(async () => {
                await user.clear(lapInput);
                await user.type(lapInput, '4');
            });
            await user.click(screen.getByRole('button', {name: /Update Laps/}));
            expect(closeParentSpy).toHaveBeenCalled();
        });
    });
    it('when cancelled it closes containing dialog', async () => {
        const closeParentSpy = vi.fn();
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const race = new DirectRace({...raceScorpionAHAL, startTimeOffset: 'PT10M'}, {version: '"0"'}, model);
        render(<AdjustCourseForm race={race} closeParent={closeParentSpy} />);
        const cancelButtton = screen.getByRole('button', {'name': /cancel/i});
        await user.click(cancelButtton);
        expect(closeParentSpy).toBeCalledTimes(1);
    });
});