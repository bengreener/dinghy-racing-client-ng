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
import CompetitorsConsole from './CompetitorsConsole';
import SylphModel from '../model/sylph-model';
import SylphController from '../controller/sylph-controller';
import Collection from '../model/collection';
import Competitor from '../model/competitor';
import { httpRootURL, wsRootURL, competitorsCollection, competitorsCollectionHAL, competitorChrisMarshallHAL, competitorSarahPascalHAL, competitorJillMyerHAL, competitorLouScrewHAL, 
	competitorOwainDaviesHAL, competitorLiuBaoHAL } from '../model/__mocks__/test-data';

vi.mock('../model/sylph-model');
vi.mock('../controller/sylph-controller');
vi.mock('../model/clock');

it('renders', async () => {
    const model = new SylphModel(httpRootURL, wsRootURL);
    await act( async () => {
        render(<CompetitorsConsole model={model} />);
    });
    expect(screen.getByRole('heading', {name: 'Competitors'})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Competitors'}));
});

describe('when there are competitors', () => {
    it('displays list of competitors', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        await act( async () => {
            render(<CompetitorsConsole model={model} />);
        });
        expect(await screen.findByRole('cell', {name: /chris marshall/i})).toBeInTheDocument();
        expect(await screen.findByRole('cell', {name: /Sarah Pascal/i})).toBeInTheDocument();
    });
    describe('when successfully retrieves competitors', () => {
        it('clears any error message', async () => {
            const model = new SylphModel(httpRootURL, wsRootURL);
            vi.spyOn(model, 'getCompetitors').mockImplementationOnce(async () => {throw new Error('Oops!')});
            let renderResult;
            await act( async () => {
                renderResult = render(<CompetitorsConsole model={model} />);
            });
            expect(await screen.findByText(/oops/i)).toBeInTheDocument();
            await act(async () => {
                renderResult.rerender(<CompetitorsConsole model={model} />);
            });
            expect(screen.queryByText('Oops!')).not.toBeInTheDocument();
        })
    })
});
describe('when there is a problem retrieving competitors', () => {
    it('displays error message', async () => {
        const model = new SylphModel(httpRootURL, wsRootURL);
        vi.spyOn(model, 'getCompetitors').mockImplementation(async () => {throw new Error('Oops!')});
        await act( async () => {
            render(<CompetitorsConsole model={model} />);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
});
describe('when a competitor is selected', () => {
    it('displays competitor details for editing', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        await act( async () => {
            render(<CompetitorsConsole model={model} />);
        });
        const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
        await user.click(competitorCell);
        expect(await screen.findByLabelText(/name/i)).toHaveValue('Chris Marshall');
        expect(screen.getByRole('button', {name: /update/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
    });
    it('clears any error message', async () => {
        const user = userEvent.setup();
        const model = new SylphModel(httpRootURL, wsRootURL);
        const controller = new SylphController(model);
        vi.spyOn(controller, 'updateCompetitor').mockImplementation(async () => {throw new Error('Oops!')});
        await act( async () => {
            render(<CompetitorsConsole model={model} controller={controller} />);
        });
        const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
        await user.click(competitorCell);
        const nameInput = await screen.findByLabelText(/name/i);
        const updateButton = screen.getByRole('button', {name: 'Update'});
        await user.clear(nameInput);
        await user.type(nameInput, 'John Smith');
        await user.click(updateButton);
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await user.click(competitorCell);
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    });
    describe('when name is changed', () => {
        it('displays new name', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            await act( async () => {
                render(<CompetitorsConsole model={model} />);
            });
            const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
            await user.click(competitorCell);
            const nameInput = await screen.findByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, 'John Smith');
            expect(nameInput).toHaveValue('John Smith');
        });
    });
    describe('when update button clicked', () => {
        it('updates competitor details in system with new value provided', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            const updateCompetitorSpy = vi.spyOn(controller, 'updateCompetitor').mockImplementation(async () => {return new Competitor({...competitorChrisMarshallHAL, name: 'John Smith'}, {version: '"1"'}, model)});
            await act( async () => {
                render(<CompetitorsConsole model={model} controller={controller} />);
            });
            const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
            await user.click(competitorCell);
            const nameInput = await screen.findByLabelText(/name/i);
            const updateButton = screen.getByRole('button', {name: 'Update'});
            await user.clear(nameInput);
            await user.type(nameInput, 'John Smith');
            await user.click(updateButton);
            expect(updateCompetitorSpy).toBeCalledWith(new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, model), 'John Smith');
        });
        describe('when update is successful', () => {
            it('hides input fields for updating competitor', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(controller, 'updateCompetitor').mockImplementation(async () => {return new Competitor({...competitorChrisMarshallHAL, name: 'John Smith'}, {version: '"1"'}, model)});
                await act( async () => {
                    render(<CompetitorsConsole model={model} controller={controller} />);
                });
                const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
                await user.click(competitorCell);
                const nameInput = await screen.findByLabelText(/name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await user.clear(nameInput);
                await user.type(nameInput, 'John Smith');
                await user.click(updateButton);
                expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', {name: /update/i})).not.toBeInTheDocument();
            });
            it('refreshes competitor list', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                const competitorChrisMarshall = new Competitor(competitorChrisMarshallHAL, {version: '"0"'}, this);
                const competitorJillMyer = new Competitor(competitorJillMyerHAL, {version: '"0"'}, this);
                const competitorLiuBao = new Competitor(competitorLiuBaoHAL, {version: '"0"'}, this);
                const competitorLouScrew = new Competitor(competitorLouScrewHAL, {version: '"0"'}, this);
                const competitorOwainDavies = new Competitor(competitorOwainDaviesHAL, {version: '"0"'}, this);
                const competitorSarahPascal = new Competitor(competitorSarahPascalHAL, {version: '"0"'}, this);
                const competitorJohnSmith = new Competitor({...competitorChrisMarshallHAL, name: 'John Smith'}, {version: '"1"'}, this);
                let competitors = [competitorChrisMarshall, competitorJillMyer, competitorLiuBao, competitorLouScrew, competitorOwainDavies, competitorSarahPascal];
                vi.spyOn(model, 'getCompetitors').mockImplementation(async () => {return new Collection(competitors, {size: 20, totalElements: 6, totalPages: 0, number: 0})});
                vi.spyOn(controller, 'updateCompetitor').mockImplementation(() => {return Promise.resolve({success: true})});
                await act( async () => {
                    render(<CompetitorsConsole model={model} controller={controller} />);
                });
                const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
                await user.click(competitorCell);
                const nameInput = await screen.findByLabelText(/name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await user.clear(nameInput);
                await user.type(nameInput, 'John Smith');
                competitors = [competitorJohnSmith, competitorJillMyer, competitorLiuBao, competitorLouScrew, competitorOwainDavies, competitorSarahPascal];
                await user.click(updateButton);
                await act(async () => {
                    model.handleCompetitorUpdate({'body': competitorChrisMarshall.url});
                });
                expect(await screen.findByRole('cell', {name: /john smith/i})).toBeInTheDocument();
                expect(screen.queryByRole('cell', {name: /chris marshall/i})).not.toBeInTheDocument();
            });
        });
        describe('when there is a problem updating competitor', () => {
            it('provides a message expalining cause of issue', async () => {
                const user = userEvent.setup();
                const model = new SylphModel(httpRootURL, wsRootURL);
                const controller = new SylphController(model);
                vi.spyOn(controller, 'updateCompetitor').mockImplementation(async () => {throw new Error('Oops something went wrong.')});
                await act( async () => {
                    render(<CompetitorsConsole model={model} controller={controller} />);
                });
                const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
                await user.click(competitorCell);
                const nameInput = await screen.findByLabelText(/name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await user.clear(nameInput);
                await user.type(nameInput, 'John Smith');
                await user.click(updateButton);
                expect(await screen.findByText('Oops something went wrong.')).toBeInTheDocument();
            });
        });
    });
    describe('when cancelled', () => {
        it('hides input fields for updating competitor', async () => {
            const user = userEvent.setup();
            const model = new SylphModel(httpRootURL, wsRootURL);
            const controller = new SylphController(model);
            await act( async () => {
                render(<CompetitorsConsole model={model} controller={controller} />);
            });
            const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
            await user.click(competitorCell);
            const nameInput = await screen.findByLabelText(/name/i);
            const cancelButton = screen.getByRole('button', {name: 'Cancel'});
            await user.clear(nameInput);
            await user.type(nameInput, 'John Smith');
            await user.click(cancelButton);
            expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /update/i})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /cancel/i})).not.toBeInTheDocument();
        });
    });
});
