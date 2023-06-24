import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders banner', async () => {
  render(<App />);  
  const banner = await screen.findByRole('banner');
  expect(banner).toBeInTheDocument();
});

it('displays menu buttons', () => {
  render(<App />);
  const btnCreateDinghyClass = screen.getByRole('button', {name: /create dinghy class\b/i});
  expect(btnCreateDinghyClass).toBeInTheDocument();
});

describe('when create dinghy class button clicked', () => {
  it('displays create dinghy class form', async () => {
    const user = userEvent.setup();

    render(<App />);
    const btnCreateDinghyClass = await screen.findByRole('button', {name: /create dinghy class\b/i});
    await act(async () => {
      await user.click(btnCreateDinghyClass);
    });
    expect(await screen.findByLabelText('Class Name')).toBeInTheDocument();
  })
})