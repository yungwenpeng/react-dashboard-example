import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

test('Test - navigation to HomaPage', () => {
  // use <MemoryRouter> when you want to manually control the history
  render(
    <MemoryRouter initialEntries={['/']}>
      <Home setCurrentPath={() => {}}/>
    </MemoryRouter>
  );

  // verify navigation to home route
  const homePageText = screen.getByText(/Demo homepage/i);
  expect(homePageText).toBeInTheDocument();
})
