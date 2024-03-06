import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../test-utilities/custom-renders';
import { httpRootURL, wsRootURL, races } from '../model/__mocks__/test-data';
import DinghyRacingModel from '../model/dinghy-racing-model';
import DownloadRacesForm from './DownloadRacesForm';

jest.mock('../model/dinghy-racing-model');

it('renders', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })
});

it('provides option to select start time and end time for session', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })

    const selectSessionStart = screen.getByLabelText(/session start/i);
    const selectSessionEnd = screen.getByLabelText(/session end/i);
    expect(selectSessionStart).toBeInTheDocument();
    expect(selectSessionEnd).toBeInTheDocument();
});

it('sets start and end time to defaults', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const expectedStartTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000).toISOString().substring(0, 16);
    const expectedEndTime = new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000).toISOString().substring(0, 16);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })
    expect(screen.getByLabelText(/session start/i)).toHaveValue(expectedStartTime);
    expect(screen.getByLabelText(/session end/i)).toHaveValue(expectedEndTime);
});

it('accepts a change to the get races in window start time', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })

    const sessionStartInput = screen.getByLabelText(/session start/i);
    await act(async () => {
        await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
        await user.type(sessionStartInput, '2020-02-12T12:10');
    });
    expect(sessionStartInput).toHaveValue('2020-02-12T12:10');
});

it('accepts a change to the get races in window start time', async () => {
    const user = userEvent.setup();
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })

    const sessionEndInput = screen.getByLabelText(/session end/i);
    await act(async () => {
        await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
        await user.type(sessionEndInput, '2075-02-12T12:10');
    });
    expect(sessionEndInput).toHaveValue('2075-02-12T12:10');
});

it('calls model get races between times with values set for start and end of window', async () => {
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    const getRacesBetweenTimesSpy = jest.spyOn(model, 'getRacesBetweenTimes');//.mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
    await act(async () => {
        await customRender(<DownloadRacesForm />, model);
    })
    
    expect(getRacesBetweenTimesSpy).toBeCalledWith(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000), new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
});

describe('when start time for races window chnages', () => {
    it('calls model get races between times with new time set for start and end of window', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesSpy = jest.spyOn(model, 'getRacesBetweenTimes');//.mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        
        await act(async () => {
            await customRender(<DownloadRacesForm />, model);
        })

        const sessionStartInput = screen.getByLabelText(/session start/i);
        await act(async () => {
            await user.clear(sessionStartInput); // clear input to avoid errors when typing in new value
            await user.type(sessionStartInput, '2020-02-12T12:10');
        });

        expect(getRacesBetweenTimesSpy).toBeCalledWith(new Date('2020-02-12T12:10'), new Date(Math.floor(Date.now() / 86400000) * 86400000 + 64800000));
    });
});

describe('when end time for races window chnages', () => {
    it('calls model get races between times with start time and new time set for end of window', async () => {
        const user = userEvent.setup();
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        const getRacesBetweenTimesSpy = jest.spyOn(model, 'getRacesBetweenTimes');//.mockImplementationOnce(() => {return Promise.resolve({'success': true, 'domainObject': races})});
        
        await act(async () => {
            await customRender(<DownloadRacesForm />, model);
        })

        const sessionEndInput = screen.getByLabelText(/session end/i);
        await act(async () => {
            await user.clear(sessionEndInput); // clear input to avoid errors when typing in new value
            await user.type(sessionEndInput, '2075-02-12T12:10');
        });

        expect(getRacesBetweenTimesSpy).toBeCalledWith(new Date(Math.floor(Date.now() / 86400000) * 86400000 + 28800000), new Date('2075-02-12T12:10'));
    });
});

describe('when an error is received', () => {
    it('displays error message', async () => {
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
        jest.spyOn(model, 'getRacesBetweenTimes').mockImplementationOnce(() => {return Promise.resolve({'success': false, 'message': 'Oops!'})});
        await act(async () => {
            await customRender(<DownloadRacesForm />, model);
        })
        
        expect(screen.getByText(/oops!/i)).toBeInTheDocument();
    });
});