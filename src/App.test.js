import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import DinghyRacingController from './controller/dinghy-racing-controller';
import DinghyRacingModel from './model/dinghy-racing-model';
import { httpRootURL, wsRootURL, dinghyClasses, races, entriesScorpionA } from './model/__mocks__/test-data';

jest.mock('./controller/dinghy-racing-controller');
jest.mock('./model/dinghy-racing-model');

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders banner', async () => {
  const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
  render(<App controller={dinghyRacingController} />);  
  const banner = await screen.findByRole('banner');
  expect(banner).toBeInTheDocument();
});

it('displays menu buttons', () => {
  const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(httpRootURL, wsRootURL));
  render(<App controller={dinghyRacingController} />);
  const btnCreateDinghyClass = screen.getByRole('button', {name: /create dinghy class\b/i});
  const btnCreateRace = screen.getByRole('button', {name: /create race\b/i});
  expect(btnCreateDinghyClass).toBeInTheDocument();
  expect(btnCreateRace).toBeInTheDocument();
});

describe('when create dinghy class button clicked', () => {
  it('displays create dinghy class form', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    jest.spyOn(DinghyRacingModel, 'dinghyClassTemplate').mockImplementation(() => {return {'name': '', 'url': ''}});
    const dinghyRacingController = new DinghyRacingController(model);

    render(<App controller={dinghyRacingController} />);
    const btnCreateDinghyClass = await screen.findByRole('button', {name: /create dinghy class\b/i});
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
    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});

    render(<App model={model} controller={dinghyRacingController} />);
    const btnViewUpcomingRaces = await screen.findByRole('button', {name: /upcoming races\b/i});
    await act(async () => {
      await user.click(btnViewUpcomingRaces);
    });
    expect(await screen.findByText('Scorpion A')).toBeInTheDocument();
    expect(await screen.findByText('Graduate')).toBeInTheDocument();
    expect(await screen.findByText('14/02/2023, 18:26:00')).toBeInTheDocument();
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
    const btnRaceConsole = await screen.findByRole('button', {name: /race console\b/i});
    await act(async () => {
      await user.click(btnRaceConsole);
    });
  });
});