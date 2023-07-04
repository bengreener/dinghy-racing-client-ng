import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import DinghyRacingController from './controller/dinghy-racing-controller'; 

jest.mock('./controller/dinghy-racing-controller');

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders banner', async () => {
  render(<App controller={DinghyRacingController} />);  
  const banner = await screen.findByRole('banner');
  expect(banner).toBeInTheDocument();
});

it('displays menu buttons', () => {
  render(<App controller={DinghyRacingController} />);
  const btnCreateDinghyClass = screen.getByRole('button', {name: /create dinghy class\b/i});
  const btnCreateRace = screen.getByRole('button', {name: /create race\b/i});
  expect(btnCreateDinghyClass).toBeInTheDocument();
  expect(btnCreateRace).toBeInTheDocument();
});

describe('when create dinghy class button clicked', () => {
  it('displays create dinghy class form', async () => {
    const user = userEvent.setup();

    render(<App controller={DinghyRacingController} />);
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

    render(<App controller={DinghyRacingController} />);
    const btnCreateRace = await screen.findByRole('button', {name: /create race\b/i});
    await act(async () => {
      await user.click(btnCreateRace);
    });
    expect(await screen.findByLabelText('Race Name')).toBeInTheDocument();
  })
})