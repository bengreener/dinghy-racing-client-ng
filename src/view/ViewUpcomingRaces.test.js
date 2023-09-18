import { act, render, screen, prettyDOM, logRoles } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../test-utilities/custom-renders';
import DinghyRacingModel from '../model/dinghy-racing-model';
import ViewUpcomingRaces from './ViewUpcomingRaces';
import { httpRootURL, wsRootURL, races } from '../model/__mocks__/test-data';

jest.mock('../model/dinghy-racing-model');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': []})});
    await act(async () => {
        await customRender(<ViewUpcomingRaces />, model);
    });    

    expect(screen.getByText(/race/i)).toBeInTheDocument();
    expect(screen.getByText(/class/i)).toBeInTheDocument();
    expect(screen.getByText(/start/i)).toBeInTheDocument();
});

// test could be affected by date time local settings
it('displays the details of upcoming races', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    const getRacesOnOrAfterTimeSpy = jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    await act(async () => {
        await customRender(<ViewUpcomingRaces />, model);
    });    

    const cells = await screen.findAllByRole('cell');
    const cellValues = cells.map(cell => cell.textContent);

    expect(cellValues).toContain('Scorpion A');
    expect(cellValues).toContain('Graduate');
    expect(cellValues).toContain('14/02/2023, 18:26:00');
});

describe('when a race is selected', () => {
    it('the method passed to showSignUpForm is called with the selected race', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getRacesOnOrAfterTime').mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        const showSignUpFormMock = jest.fn();

        await act(async () => {
            await customRender(<ViewUpcomingRaces showSignUpForm={showSignUpFormMock}/>, model);
        });
        
        const cellRaceScorpionA = await screen.findByRole('cell', {name: 'Scorpion A'});
        await user.click(cellRaceScorpionA);

        expect(showSignUpFormMock).toBeCalled();
    });
});