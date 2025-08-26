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

import { storageAvailable } from './storage-utilities';

afterEach(() => {
    vi.clearAllMocks();
});

describe('when local storage is available', () =>
{
    it('returns true', () => {
        expect(storageAvailable('localStorage')).toBeTruthy();
    })
});

describe('when session storage is available', () =>
{
    it('returns true', () => {
        expect(storageAvailable('sessionStorage')).toBeTruthy();
    })
});

describe('when local storage is not available', () =>
{
    it('returns false', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error();
        });
        expect(storageAvailable('localStorage')).toBeFalsy();
    })
});

describe('when session storage is not available', () =>
{
    it('returns false', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error();
        });
        expect(storageAvailable('sessionStorage')).toBeFalsy();
    })
});