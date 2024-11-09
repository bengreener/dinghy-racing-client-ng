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

import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import DinghyRacingController from './controller/dinghy-racing-controller';
import DinghyRacingModel from './model/dinghy-racing-model';
import { httpRootURL, wsRootURL, dinghyClasses, races, entriesScorpionA, entriesGraduateA, entriesCometA, entriesHandicapA, competitorsCollection } from './model/__mocks__/test-data';
import Authorisation from './controller/authorisation';

jest.mock('./controller/dinghy-racing-controller');
jest.mock('./model/dinghy-racing-model');
jest.mock('./controller/authorisation');

HTMLDialogElement.prototype.showModal = jest.fn();
HTMLDialogElement.prototype.close = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  // jest.spyOn(console, 'error')
  // console.error.mockImplementation(() => null);
});

it('displays menu buttons', async () => {
  const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
  await act(async () => {
    render(<App controller={dinghyRacingController} />);
  });
  const btnCreateDinghyClass = screen.getByRole('button', {name: /dinghy classes\b/i, hidden: true});
  const btnCreateRace = screen.getByRole('button', {name: /create race\b/i, hidden: true});
  const btnUpcomingRaces = screen.getByRole('button', {name: /registration\b/i, hidden: true});
  const btnRaceStartConsole = screen.getByRole('button', {name: /race start\b/i, hidden: true});
  const btnRaceConsole = screen.getByRole('button', {name: /run race\b/i, hidden: true});
  const btnDownloadRaces = screen.getByRole('button', {name: /download races\b/i, hidden: true});
  const btnSynchExternalCloclRaces = screen.getByRole('button', {name: /synch external clock\b/i, hidden: true});
  const btnLogout = screen.getByRole('button', {name: /logout\b/i, hidden: true});
  expect(btnCreateDinghyClass).toBeInTheDocument();
  expect(btnCreateRace).toBeInTheDocument();
  expect(btnUpcomingRaces).toBeInTheDocument();
  expect(btnRaceStartConsole).toBeInTheDocument();
  expect(btnRaceConsole).toBeInTheDocument();
  expect(btnDownloadRaces).toBeInTheDocument();
  expect(btnSynchExternalCloclRaces).toBeInTheDocument();
  expect(btnLogout).toBeInTheDocument();
});

describe('user roles does not include ROLE_RACE_SCHEDULER', () => {
  it('does not provide option to add dinghy class', async () => {
    const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
    jest.spyOn(Authorisation.prototype, 'getRoles').mockImplementation(() => {return Promise.resolve([])});
    await act(async () => {
      render(<App controller={dinghyRacingController} />);
    });
    const btnCreateDinghyClass = screen.queryByRole('button', {name: /create dinghy class\b/i});
    expect(btnCreateDinghyClass).not.toBeInTheDocument();
  });
  it('does not provide option to add race', async () => {
    const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
    jest.spyOn(Authorisation.prototype, 'getRoles').mockImplementation(() => {return Promise.resolve([])});
    await act(async () => {
      render(<App controller={dinghyRacingController} />);
    });
    const btnCreateRace = screen.queryByRole('button', {name: /create race\b/i});
    expect(btnCreateRace).not.toBeInTheDocument();
  });
});

describe('user roles does not include ROLE_RACE_OFFICER', () => {
  it('does not provide option to access race console', async () => {
    const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
    jest.spyOn(Authorisation.prototype, 'getRoles').mockImplementation(() => {return Promise.resolve([])});
    await act(async () => {
      render(<App controller={dinghyRacingController} />);
    });
    const btnRaceConsole = screen.queryByRole('button', {name: /run race\b/i});
    expect(btnRaceConsole).not.toBeInTheDocument();
  });
  it('does not provide option to access race start console', async () => {
    const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
    jest.spyOn(Authorisation.prototype, 'getRoles').mockImplementation(() => {return Promise.resolve([])});
    await act(async () => {
      render(<App controller={dinghyRacingController} />);
    });
    const btnRaceStartConsole = screen.queryByRole('button', {name: /race start\b/i});
    expect(btnRaceStartConsole).not.toBeInTheDocument();
  });
});

describe('when dinghy classes button clicked', () => {
  it('displays dinghy class console', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(DinghyRacingModel, 'dinghyClassTemplate').mockImplementation(() => {return {'name': '', 'url': ''}});
    jest.spyOn(model, 'getDinghyClasses').mockImplementation(() => {return Promise.resolve({success: true, domainObject: []})});
    const dinghyRacingController = new DinghyRacingController(model);

    render(<App model={model} controller={dinghyRacingController} />);
    const btnMenu = await screen.findByRole('button', {name: /☰/i})
    await act(async () => {
      await user.click(btnMenu);
    });
    const btnCreateDinghyClass = await screen.findByRole('button', {name: /dinghy classes\b/i});
    await act(async () => {
      await user.click(btnCreateDinghyClass);
    });
    expect(await screen.findByLabelText('Class Name')).toBeInTheDocument();
  })
});

describe('when create race button clicked', () => {
  it('displays create race form', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const dinghyRacingController = new DinghyRacingController(model);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});

    render(<App model={model} controller={dinghyRacingController} />);
    const btnMenu = await screen.findByRole('button', {name: /☰/i})
    await act(async () => {
      await user.click(btnMenu);
    });
    const btnCreateRace = await screen.findByRole('button', {name: /create race\b/i});
    await act(async () => {
      await user.click(btnCreateRace);
    });
    expect(await screen.findByLabelText('Race Name')).toBeInTheDocument();
  })
});

describe('when upcoming races button clicked', () => {
  // test could be affected by timezone changes; for example move from British Summer Time to GMT
  it('displays upcoming races', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const dinghyRacingController = new DinghyRacingController(model);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    render(<App model={model} controller={dinghyRacingController} />);
    const btnMenu = await screen.findByRole('button', {name: /☰/i})
    await act(async () => {
      await user.click(btnMenu);
    });
    const btnViewUpcomingRaces = await screen.findByRole('button', {name: /registration\b/i});
    await act(async () => {
      await user.click(btnViewUpcomingRaces);
    });
    const timeCheck = new Date('2021-10-14T10:30:00Z').toLocaleString();
    expect(await screen.findByText('Scorpion A')).toBeInTheDocument();
    expect(await screen.findByText('Graduate')).toBeInTheDocument();
    expect(await screen.findByText(timeCheck)).toBeInTheDocument();
  })
});

describe('when race console button is clicked', ()  => {
  it('displays race console', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    const dinghyRacingController = new DinghyRacingController(model);

    render(<App model={model} controller={dinghyRacingController} />);
    const btnRaceConsole = await screen.findByRole('button', {name: /run race\b/i});
    await act(async () => {
      await user.click(btnRaceConsole);
    });
  });
});

describe('when race start console button is clicked', ()  => {
  it('displays race start console', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation((race) => {
      if (race.name === 'Scorpion A') {
        return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})
      }
      if (race.name === 'Graduate A') {
        return Promise.resolve({'success': true, 'domainObject': entriesGraduateA})
      }
      if (race.name === 'Comet A') {
        return Promise.resolve({'success': true, 'domainObject': entriesCometA})
      }
      if (race.name === 'Handicap A') {
        return Promise.resolve({'success': true, 'domainObject': entriesHandicapA})
      }
    });
    jest.spyOn(model, 'getStartSequence').mockImplementation(() => {return Promise.resolve({success: false, message: 'Set to fail'})});
    const dinghyRacingController = new DinghyRacingController(model);

    render(<App model={model} controller={dinghyRacingController} />);
    const btnRaceStartConsole = await screen.findByRole('button', {name: /race start\b/i});
    await act(async () => {
      await user.click(btnRaceStartConsole);
    });
  });
});

describe('when download races console button is clicked', ()  => {
  it('displays download races form', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    jest.spyOn(model, 'getEntriesByRace').mockImplementation(() => {return Promise.resolve({'success': true, 'domainObject': entriesScorpionA})});
    const dinghyRacingController = new DinghyRacingController(model);

    render(<App model={model} controller={dinghyRacingController} />);
    const btnMenu = await screen.findByRole('button', {name: /☰/i})
    await act(async () => {
      await user.click(btnMenu);
    });
    const btnDownloadRaces = await screen.findByRole('button', {name: /download races\b/i});
    await act(async () => {
      await user.click(btnDownloadRaces);
    });
    expect(await screen.findByRole('heading', {name: /download races/i})).toBeInTheDocument();
  });
});

describe('when competitors console button is clicked', () => {
  it('displays competitors console', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(model, 'getCompetitors').mockImplementation(() => {return Promise.resolve({success: true, domainObject: competitorsCollection})});

    render(<App model={model} />);
    const btnMenu = await screen.findByRole('button', {name: /☰/i})
    await act(async () => {
      await user.click(btnMenu);
    });
    const btnCompetitors = await screen.findByRole('button', {name: /competitors\b/i});
    await act(async () => {
      await user.click(btnCompetitors);
    });
    expect(await screen.findByRole('heading', {name: /competitors/i})).toBeInTheDocument();
  });
});

it('enables user to logout', async () => {
  // jsdom does not implement navigation so replace Window.location with a trackable mock for this test
  const holdOldWindowLocation = {...window.location};
  Object.defineProperty(window, 'location', {
    value: new URL(window.location.href),
    configurable: true,
  });
  const user = userEvent.setup();
  const model = new DinghyRacingModel(httpRootURL, wsRootURL);
  const dinghyRacingController = new DinghyRacingController(model);

  render(<App model={model} controller={dinghyRacingController} />);
  const btnMenu = await screen.findByRole('button', {name: /☰/i})
  await act(async () => {
    await user.click(btnMenu);
  });
  const btnLogout = screen.getByRole('button', { 'name': /logout/i});
  await act(async () => {
    await user.click(btnLogout);
  });
  expect(global.window.location.href).toMatch(/logout/i);

  // revert to old Window.location implmentation
  Object.defineProperty(window, 'location', {
    value: {...holdOldWindowLocation},
    configurable: true,
  });
});

describe('when synch external clock button clicked button clicked', () => {
      it('displays synch external clock dialog', async () => {
        let formatOptions = {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        };
        const timeFormat = new Intl.DateTimeFormat('en-GB', formatOptions);
        const testTimeString = timeFormat.format(Date.now());
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const controller = new DinghyRacingController(model);
        await act(async () => {
          render(<App model={model} controller={controller} />);
        });
        const btnMenu = await screen.findByRole('button', {name: /☰/i})
        await act(async () => {
          await user.click(btnMenu);
        });
        await act(async () => {
            await user.click(screen.getByRole('button', {'name': /synch external clock/i}));
        });
        const dialog = within(screen.getByTestId('synch-external-time-dialog'));
        expect(dialog.getByLabelText(/enter time/i)).toHaveValue(testTimeString);
        expect(dialog.getByRole('button', {name: /set time/i, 'hidden': true})).toBeInTheDocument();
        expect(dialog.getByRole('button', {name: /cancel/i, 'hidden': true})).toBeInTheDocument();
    });
});