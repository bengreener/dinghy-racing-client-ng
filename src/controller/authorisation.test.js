import Authorisation from './authorisation';

global.fetch = jest.fn();

beforeEach(() => {
    document.cookie = 'JSESSIONID=123456789; expires=Thu, 18 Dec 2013 12:00:00 UTC';
});

describe('when previous session id does not match current session id and current session is for authenticated user', () => {
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
        authorisation.sessionId = 'xyz';
        document.cookie = 'JSESSIONID=123456789';
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
            authorisation.sessionId = 'xyz';
            document.cookie = 'SOME=NONSENSE';
            document.cookie = 'JSESSIONID=123456789';
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
            authorisation.sessionId = 'xyz';
            document.cookie = 'JSESSIONID=123456789';
            expect(await authorisation.getRoles()).toEqual([]);
        });
    });
});

describe('when session id does match', () => {
    it('returns array of roles', async () => {
        document.cookie = 'JSESSIONID=123456789';
        const authorisation = new Authorisation();
        authorisation.sessionId = '123456789';
        authorisation.roles = ['ROLE_HELM'];
        expect(await authorisation.getRoles()).toEqual(['ROLE_HELM']);
    });
    describe('when error occurs', () => {
        it('returns an empty array', async () => {
            fetch.mockImplementation(() => {
                throw new TypeError('Failed to fetch roles');
            });
            document.cookie = 'SOME=NONSENSE'
            document.cookie = 'JSESSIONID=123456789';
            document.cookie =  'FOO=Bar';
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
            authorisation.sessionId = '123456789';
            document.cookie = 'JSESSIONID=123456789';
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
            authorisation.sessionId = '123456789';
            document.cookie = 'JSESSIONID=123456789';
            expect(await authorisation.getRoles()).toEqual([]);
        });
    });
});

describe('when session id not found', () => {
    it('returns an empty array', async () => {
        const authorisation = new Authorisation();
        authorisation.roles = ['ROLE_CREW'];
        expect(await authorisation.getRoles()).toEqual([]);
    });
})
