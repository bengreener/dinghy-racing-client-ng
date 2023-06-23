import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders banner', async () => {
  render(<App />);  
  const banner = await screen.findByRole('banner');
  expect(banner).toBeInTheDocument();
});

it('displays menu buttons', async () => {
  render(<App />);
  const button1 = await screen.findByRole('button', {name: /create dinghy class\b/i});
  expect(button1).toBeInTheDocument();
});