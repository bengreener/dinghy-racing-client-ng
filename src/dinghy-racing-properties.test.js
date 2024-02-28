import getDinghyRacingProperties from './dinghy-racing-properties';

global.fetch = jest.fn();

beforeEach(() => {
    fetch.mockClear();
});

it('returns properties', async () => {
    const expectedProperties = {'httpRootURL':'http://localhost:8081/dinghyracing/api','wsRootURL':'ws://localhost:8081/dinghyracingws'};
    fetch.mockImplementation((resource, options) => {
        return Promise.resolve({
            ok: true,
            status: 200, 
            json: () => Promise.resolve(expectedProperties)
        });
    });
    const properties = await getDinghyRacingProperties('http://someserver');
    expect(properties).toBe(expectedProperties);
});