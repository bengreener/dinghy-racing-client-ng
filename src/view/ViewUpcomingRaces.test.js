import { render, screen } from '@testing-library/react';
import { customRender } from '../test-utilities/custom-renders';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ViewUpcomingRaces from './ViewUpcomingRaces';
import { rootURL, races } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');

it('renders', () => {
    const model = new DinghyRacingModel(rootURL);

    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    customRender(<ViewUpcomingRaces />, model);

    expect(screen.getByText(/race/i)).toBeInTheDocument();
    expect(screen.getByText(/class/i)).toBeInTheDocument();
    expect(screen.getByText(/start/i)).toBeInTheDocument();
});

// test could be affected by date time local settings
it('displays the details of upcoming races', async () => {
    const model = new DinghyRacingModel(rootURL);

    const getRacesOnOrAfterTimeSpy = jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    await customRender(<ViewUpcomingRaces />, model);

    const cells = await screen.findAllByRole('cell');
    const cellValues = cells.map(cell => cell.textContent);

    expect(cellValues).toContain('Scorpion A');
    expect(cellValues).toContain('Graduate');
    expect(cellValues).toContain('14/02/2023, 18:26:00');
});