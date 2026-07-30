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
import EditRaceEntryView from './EditRaceEntryView';
import { httpRootURL, wsRootURL, competitorChrisMarshallHAL, entryChrisMarshall1234ScorpionAHAL, 
    dinghy1234HAL, dinghyClassScorpionHAL, raceScorpionAHAL, lap1HAL, lap2HAL,
    signedUpChrisMarshallDinghy1234ScorpionAHAL } from '../model/__mocks__/test-data';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Competitor from '../model/competitor';
import Collection from '../model/collection';
import Dinghy from '../model/dinghy';
import DinghyClass from '../model/dinghy-class';
import DirectRace from '../model/direct-race';
import Entry from '../model/entry';
import Lap from '../model/lap';
import SignedUp from '../model/signed-up';
import SynchronousDinghy from './synchronous-model/synchronous-dinghy';
import SynchronousEntry from './synchronous-model/synchronous-entry';
import userEvent from '@testing-library/user-event';

vi.mock('../model/sylph-model');
vi.mock('../model/clock');

it('renders', () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
        new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
        new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
        new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
        new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
        new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
        new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
    );
    render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
    const SMScorp1234entry = screen.getByRole('status', {name: (content, node) => node.textContent === '1234'});
    expect(SMScorp1234entry).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Update'})).not.toBeInTheDocument();
});
describe('when entering a time', () => {
    it('accepts : characters', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const sailingTimeInput = screen.getByTestId('sailing-time-input-Scorpion-1234');
        await user.clear(sailingTimeInput);
        await user.type(sailingTimeInput, '::');
        expect(sailingTimeInput).toHaveValue('::');
    });
    it('accepts numeric characters', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const sailingTimeInput = screen.getByTestId('sailing-time-input-Scorpion-1234');
        await user.clear(sailingTimeInput);
        await user.type(sailingTimeInput, '1456');
        expect(sailingTimeInput).toHaveValue('1456');
    });
    it('rejects invalid characters', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const sailingTimeInput = screen.getByTestId('sailing-time-input-Scorpion-1234');
        await user.clear(sailingTimeInput);
        await user.type(sailingTimeInput, 'a.;');
        expect(sailingTimeInput).toHaveValue('');
    });
});
describe('when entering a lap count', () => {
    it('accepts 0', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-1234');
        await user.clear(lapCountInput);
        await user.type(lapCountInput, '0');
        expect(lapCountInput).toHaveValue('0');
    });
    it('accepts a value equal to the planned laps for the direct race', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-1234');
        await user.clear(lapCountInput);
        await user.type(lapCountInput, '5');
        expect(lapCountInput).toHaveValue('5');
    });
    it('does not accept a negative value', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-1234');
        await user.clear(lapCountInput);
        await user.type(lapCountInput, '-1');
        expect(lapCountInput).toHaveValue('1');
    });
    it('does not accept a value greater than the number of planned laps for the direct race', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-1234');
        await user.clear(lapCountInput);
        await user.type(lapCountInput, '6');
        expect(lapCountInput).toHaveValue('');
    });
    it('allows value to be cleared', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-1234');
        await user.clear(lapCountInput);
        await user.type(lapCountInput, '{backspace}');
        expect(lapCountInput).toHaveValue('');
    });
});
describe('when entering a scoring abbreviation', () => {
    it('displays value entered', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const scoringAbbreviationInput = screen.getByRole('combobox');
        await user.selectOptions(scoringAbbreviationInput, 'OCS');
        expect(scoringAbbreviationInput).toHaveValue('OCS');
    });
});
describe('when value entered for lap count does not equal value recorded as lap count for entry', () => {
    it('displays update button', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-1234');
        await user.clear(lapCountInput);
        await user.type(lapCountInput, '3');
        expect(screen.getByRole('button', {name: 'Update'})).toBeInTheDocument();
    });
});
describe('when value entered for time sailed does not equal value recorded as time sailed for entry', () => {
    it('displays update button', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const sailingTimeInput = screen.getByTestId('sailing-time-input-Scorpion-1234');
        await user.clear(sailingTimeInput);
        await user.type(sailingTimeInput, '1:15:12');
        expect(screen.getByRole('button', {name: 'Update'})).toBeInTheDocument();
    });
});
describe('when value entered for scoring abbreviation does not equal value recorded as scoring abbreviation for entry', () => {
    it('displays update button', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
            new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
            new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
            new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
            new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
            new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
            new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
        );
        render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} />);
        const scoringAbbreviationInput = screen.getByRole('combobox');
        await user.selectOptions(scoringAbbreviationInput, 'OCS');
        expect(screen.getByRole('button', {name: 'Update'})).toBeInTheDocument();
    });
});
describe('when update button clicked', () => {
    describe('when a new lap count has been entered', async () => {
        it('calls onSetLapTotal with value entered for lap count', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const onSetLapTotalSpy = vi.spyOn(controller, 'setLapTotal').mockImplementation(async () => {});
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([], {size: 20, totalElements: 0, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} onSetLapTotal={onSetLapTotalSpy} />);
            const lapCountInput = screen.getByTestId('lap-count-input-Scorpion-1234');
            await user.clear(lapCountInput);
            await user.type(lapCountInput, '3');
            await user.click(screen.getByRole('button', {name: 'Update'}));
            expect(await onSetLapTotalSpy).toHaveBeenCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 3, '33:20');
        });
    });
    describe('when a new time sailed has been entered', async () => {
        it('calls onSetLapTotal with value entered for time sailed', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const onSetLapTotalSpy = vi.spyOn(controller, 'setLapTotal').mockImplementation(async () => {});
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([new Lap(lap1HAL, {version: '"0"'}, model), new Lap(lap2HAL, {version: '"0"'}, model)], {size: 20, totalElements: 2, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} onSetLapTotal={onSetLapTotalSpy} />);
            const sailingTimeInput = screen.getByTestId('sailing-time-input-Scorpion-1234');
            await user.clear(sailingTimeInput);
            await user.type(sailingTimeInput, '14:56');
            await user.click(screen.getByRole('button', {name: 'Update'}));
            expect(await onSetLapTotalSpy).toHaveBeenCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 2, '14:56');
        });
    });
    describe('when a new scoring abbreviation has been entered', async () => {
        it('calls onSetScoringAbbreviation with value entered for scoring abbreviation', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const onSetScoringAbbreviationSpy = vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation(async () => {});
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([new Lap(lap1HAL, {version: '"0"'}, model), new Lap(lap2HAL, {version: '"0"'}, model)], {size: 20, totalElements: 2, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} onSetScoringAbbreviation={onSetScoringAbbreviationSpy} />);
            const scoringAbbreviationInput = screen.getByRole('combobox');
            await user.selectOptions(scoringAbbreviationInput, 'OCS');
            await user.click(screen.getByRole('button', {name: 'Update'}));
            expect(await onSetScoringAbbreviationSpy).toHaveBeenCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'OCS');
        });
    });
    describe('when a new lap count and scoring abbreviation has been entered', async () => {
        it('calls onSetScoringAbbreviation with value entered for scoring abbreviation and does not call onSetLapTotal', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const onSetLapTotalSpy = vi.spyOn(controller, 'setLapTotal').mockImplementation(async () => {});
            const onSetScoringAbbreviationSpy = vi.spyOn(controller, 'setScoringAbbreviation').mockImplementation(async () => {});
            const entryChrisMarshallScorpionA1234 = new SynchronousEntry(
                new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 
                new SynchronousDinghy(new Dinghy(dinghy1234HAL, {version: '"0"'}, model), new DinghyClass(dinghyClassScorpionHAL, {version: '"0"'}, model)),
                new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model),
                new DirectRace(raceScorpionAHAL, {version: '"0"'}, model),
                new Collection([new Lap(lap1HAL, {version: '"0"'}, model), new Lap(lap2HAL, {version: '"0"'}, model)], {size: 20, totalElements: 2, totalPages: 0,number: 0}),
                new SignedUp(signedUpChrisMarshallDinghy1234ScorpionAHAL, {version: '"0"'}, model)
            );
            render(<EditRaceEntryView entry={entryChrisMarshallScorpionA1234} onSetLapTotal={onSetLapTotalSpy} onSetScoringAbbreviation={onSetScoringAbbreviationSpy} />);
            const sailingTimeInput = screen.getByTestId('sailing-time-input-Scorpion-1234');
            await user.clear(sailingTimeInput);
            await user.type(sailingTimeInput, '14:56');
            const scoringAbbreviationInput = screen.getByRole('combobox');
            await user.selectOptions(scoringAbbreviationInput, 'OCS');
            await user.click(screen.getByRole('button', {name: 'Update'}));
            expect(await onSetScoringAbbreviationSpy).toHaveBeenCalledWith(new Entry(entryChrisMarshall1234ScorpionAHAL, {version: '"0"'}, model), 'OCS');
            expect(await onSetLapTotalSpy).not.toHaveBeenCalled();
        });
    });
})