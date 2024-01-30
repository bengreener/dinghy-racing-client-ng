import Authorisation from './authorisation';

global.fetch = jest.fn();

it('returns array of roles', async () => {
    fetch.mockImplementation((resource, options) => {
        if (resource === 'http://localhost/authentication/roles') {
            return Promise.resolve({
                ok: true,
                status: 200, 
                json: () => Promise.resolve({'roles': ['ROLE_SAILOR']})
            });
        }
        else {
            return Promise.resolve({
                ok: false,
                status: 400, 
                json: () => Promise.resolve({'message': 'Not found'})
            });
        }
    });
    const authorisation = new Authorisation();
    expect(await authorisation.getRoles()).toEqual(['ROLE_SAILOR']);
});

describe('when error occurs', () => {
    it('returns an empty array', async () => {
        fetch.mockImplementation(() => {
            throw new TypeError('Failed to fetch roles');
        });
        const authorisation = new Authorisation();
        expect(await authorisation.getRoles()).toEqual([]);
    });
});

describe('when fetch operation is not successful', () => {
    it('returns an empty array', async () => {
        fetch.mockImplementation((resource, options) => {
            if (resource === 'http://localhost/authentication/roles') {
                return Promise.resolve({
                    ok: false,
                    status: 400, 
                    json: () => Promise.resolve({'message': 'Oops!'})
                });
            }
        });
        const authorisation = new Authorisation();
        expect(await authorisation.getRoles()).toEqual([]);
    });
});

describe('when response does not include roles', () => {
    it('returns an empty array', async () => {
        fetch.mockImplementation((resource, options) => {
            if (resource === 'http://localhost/authentication/roles') {
                return Promise.resolve({
                    ok: true,
                    status: 200, 
                    json: () => Promise.resolve({'message': 'Oops!'})
                });
            }
        });
        const authorisation = new Authorisation();
        expect(await authorisation.getRoles()).toEqual([]);
    });
});