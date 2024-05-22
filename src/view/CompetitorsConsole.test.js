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

import { act, screen, render } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import userEvent from '@testing-library/user-event';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DinghyRacingController from '../controller/dinghy-racing-controller';
import CompetitorsConsole from './CompetitorsConsole';
import { httpRootURL, wsRootURL, competitorsCollection, competitorChrisMarshall } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');
jest.mock('../controller/dinghy-racing-controller');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    await act( async () => {
        customRender(<CompetitorsConsole />, model);
    });
    expect(screen.getByRole('heading', {name: 'Competitors'})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Competitors'}));
});

describe('when there are competitors', () => {
    it('displays list of competitors', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
        await act( async () => {
            customRender(<CompetitorsConsole />, model);
        });
        expect(await screen.findByRole('cell', {name: /chris marshall/i})).toBeInTheDocument();
        expect(await screen.findByRole('cell', {name: /Sarah Pascal/i})).toBeInTheDocument();
    });
    describe('when sucesfully retrieves competitors', () => {
        it('clears any error message', async () => {
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})}).mockImplementationOnce(() => {return Promise.resolve({success: false, message: 'Oops!'})});
            let render;
            await act( async () => {
                render = customRender(<CompetitorsConsole />, model);
            });
            expect(await screen.findByText(/oops/i)).toBeInTheDocument();
            await act(async () => {
                render.rerender(<CompetitorsConsole />, model);
            });
            expect(screen.queryByText('Oops!')).not.toBeInTheDocument();
        })
    })
});

describe('when there is a problem retrieving competitors', () => {
    it('displays error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops!'})});
        await act( async () => {
            customRender(<CompetitorsConsole />, model);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
    });
});

describe('when a competitor is selected', () => {
    it('displays competitor details for editing', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
        await act( async () => {
            customRender(<CompetitorsConsole />, model);
        });
        const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
        await act(async () => {
            await user.click(competitorCell);
        });
        expect(await screen.findByLabelText(/name/i)).toHaveValue('Chris Marshall');
        expect(screen.getByRole('button', {name: /update/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument();
    });
    it('clears any error message', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
        const updateCompetitorSpy = jest.spyOn(controller, 'updateCompetitor').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops!'})});
        await act( async () => {
            customRender(<CompetitorsConsole />, model, controller);
        });
        const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
        await act(async () => {
            await user.click(competitorCell);
        });
        const nameInput = await screen.findByLabelText(/name/i);
        const updateButton = screen.getByRole('button', {name: 'Update'});
        await act(async () => {
            await user.clear(nameInput);
            await user.type(nameInput, 'John Smith');
            await user.click(updateButton);
        });
        expect(await screen.findByText(/oops/i)).toBeInTheDocument();
        await act(async () => {
            await user.click(competitorCell);
        });
        expect(screen.queryByText(/oops/i)).not.toBeInTheDocument();
    })
    describe('when name is changed', () => {
        it('displays new name', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
            await act( async () => {
                customRender(<CompetitorsConsole />, model);
            });
            const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(competitorCell);
            });
            const nameInput = await screen.findByLabelText(/name/i);
            await act(async () => {
                await user.clear(nameInput);
                await user.type(nameInput, 'John Smith');
            });
            expect(nameInput).toHaveValue('John Smith');
        });
    });
    describe('when update button clicked', () => {
        it('updates competitor details in system with new value provided', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
            const updateCompetitorSpy = jest.spyOn(controller, 'updateCompetitor').mockImplementation(() => {return Promise.resolve({success: true})});
            await act( async () => {
                customRender(<CompetitorsConsole />, model, controller);
            });
            const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(competitorCell);
            });
            const nameInput = await screen.findByLabelText(/name/i);
            const updateButton = screen.getByRole('button', {name: 'Update'});
            await act(async () => {
                await user.clear(nameInput);
                await user.type(nameInput, 'John Smith');
                await user.click(updateButton);
            });

            expect(updateCompetitorSpy).toBeCalledWith(competitorChrisMarshall, 'John Smith');
        });
        describe('when update is successful', () => {
            it('hides input fields for updating competitor', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
                jest.spyOn(controller, 'updateCompetitor').mockImplementation(() => {return Promise.resolve({success: true})});
                await act( async () => {
                    customRender(<CompetitorsConsole />, model, controller);
                });
                const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(competitorCell);
                });
                const nameInput = await screen.findByLabelText(/name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await act(async () => {
                    await user.clear(nameInput);
                    await user.type(nameInput, 'John Smith');
                    await user.click(updateButton);
                });
    
                expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
                expect(screen.queryByRole('button', {name: /update/i})).not.toBeInTheDocument();
            });
            it('refreshes competitor list', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: [{...competitorChrisMarshall, name: 'John Smith'}]})}).mockImplementationOnce(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
                jest.spyOn(controller, 'updateCompetitor').mockImplementation(() => {return Promise.resolve({success: true})});
                await act( async () => {
                    customRender(<CompetitorsConsole />, model, controller);
                });
                const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(competitorCell);
                });
                const nameInput = await screen.findByLabelText(/name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await act(async () => {
                    await user.clear(nameInput);
                    await user.type(nameInput, 'John Smith');
                    await user.click(updateButton);
                });
    
                expect(await screen.findByRole('cell', {name: /john smith/i})).toBeInTheDocument();
                expect(screen.queryByRole('cell', {name: /chris marshall/i})).not.toBeInTheDocument();
            });
        });
        describe('when there is a problem updating competitor', () => {
            it('provides a message expalining cause of issue', async () => {
                const user = userEvent.setup();
                const model = new DinghyRacingModel(httpRootURL, wsRootURL);
                const controller = new DinghyRacingController(model);
                jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
                jest.spyOn(controller, 'updateCompetitor').mockImplementation(() => {return Promise.resolve({success: false, message: 'Oops something went wrong.'})});
                await act( async () => {
                    customRender(<CompetitorsConsole />, model, controller);
                });
                const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
                await act(async () => {
                    await user.click(competitorCell);
                });
                const nameInput = await screen.findByLabelText(/name/i);
                const updateButton = screen.getByRole('button', {name: 'Update'});
                await act(async () => {
                    await user.clear(nameInput);
                    await user.type(nameInput, 'John Smith');
                    await user.click(updateButton);
                });

                expect(await screen.findByText('Oops something went wrong.')).toBeInTheDocument();
            });
        })
    });
    describe('when cancelled', () => {
        it('hides input fields for updating competitor', async () => {
            const user = userEvent.setup();
            const model = new DinghyRacingModel(httpRootURL, wsRootURL);
            const controller = new DinghyRacingController(model);
            jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});
            await act( async () => {
                customRender(<CompetitorsConsole />, model, controller);
            });
            const competitorCell = await screen.findByRole('cell', {name: /chris marshall/i});
            await act(async () => {
                await user.click(competitorCell);
            });
            const nameInput = await screen.findByLabelText(/name/i);
            const cancelButton = screen.getByRole('button', {name: 'Cancel'});
            await act(async () => {
                await user.clear(nameInput);
                await user.type(nameInput, 'John Smith');
                await user.click(cancelButton);
            });

            expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /update/i})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /cancel/i})).not.toBeInTheDocument();
        });
    });
});
