import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import DinghyRacingController from './controller/dinghy-racing-controller';
import DinghyRacingModel from './model/dinghy-racing-model';
import { rootURL, dinghyClasses } from './model/__mocks__/test-data';

jest.mock('./controller/dinghy-racing-controller');
jest.mock('./model/dinghy-racing-model');

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders banner', async () => {
  const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(rootURL));
  render(<App controller={dinghyRacingController} />);  
  const banner = await screen.findByRole('banner');
  expect(banner).toBeInTheDocument();
});

it('displays menu buttons', () => {
  const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(rootURL));
  render(<App controller={dinghyRacingController} />);
  const btnCreateDinghyClass = screen.getByRole('button', {name: /create dinghy class\b/i});
  const btnCreateRace = screen.getByRole('button', {name: /create race\b/i});
  expect(btnCreateDinghyClass).toBeInTheDocument();
  expect(btnCreateRace).toBeInTheDocument();
});

describe('when create dinghy class button clicked', () => {
  it('displays create dinghy class form', async () => {
    const user = userEvent.setup();
    const dinghyRacingController = new DinghyRacingController(new DinghyRacingModel(rootURL));

    render(<App controller={dinghyRacingController} />);
    const btnCreateDinghyClass = await screen.findByRole('button', {name: /create dinghy class\b/i});
    await act(async () => {
      await user.click(btnCreateDinghyClass);
    });
    expect(await screen.findByLabelText('Class Name')).toBeInTheDocument();
  })
})

describe('when create race button clicked', () => {
  it('displays create race form', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(rootURL);
    const dinghyRacingController = new DinghyRacingController(model);
    jest.spyOn(model, 'getDinghyClasses').mockImplementationOnce(() => {return Promise.resolve(dinghyClasses)});

    render(<App model={model} controller={dinghyRacingController} />);
    const btnCreateRace = await screen.findByRole('button', {name: /create race\b/i});
    await act(async () => {
      await user.click(btnCreateRace);
    });
    expect(await screen.findByLabelText('Race Name')).toBeInTheDocument();
  })
})