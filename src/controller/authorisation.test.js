/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

import Authorisation from './authorisation';

global.fetch = vi.fn();

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
    it('returns an empty array', async () => {// an error is expected to be thrown so mock out console logging of errors so as not to clutter up console
        vi.spyOn(console, 'error');
        console.error.mockImplementation(() => {});

        fetch.mockImplementation(() => {
            throw new TypeError('Failed to fetch roles');
        });
        const authorisation = new Authorisation();
        expect(await authorisation.getRoles()).toEqual([]);

        // restore console logging for errors
        console.error.mockRestore();
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
