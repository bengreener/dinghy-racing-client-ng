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

import { getCookieValue } from './dom-utilities';

beforeEach(() => {
    document.cookie = 'JSESSIONID=123456789; expires=Thu, 18 Dec 2013 12:00:00 UTC';
    document.cookie = 'SOME=NONSENSE; expires=Thu, 18 Dec 2013 12:00:00 UTC';
    document.cookie =  'FOO=Bar; expires=Thu, 18 Dec 2013 12:00:00 UTC';
});

describe('when named cookie is first cookie', () => {
    it('returns value of cookie', () => {
        document.cookie = 'JSESSIONID=123456789';
        document.cookie = 'SOME=NONSENSE';
        document.cookie =  'FOO=Bar';
        expect(getCookieValue('JSESSIONID')).toBe('123456789');
    });
});

describe('when named cookie is not first or last cookie', () => {
    it('returns value of cookie', () => {
        document.cookie = 'SOME=NONSENSE';
        document.cookie = 'JSESSIONID=123456789';
        document.cookie =  'FOO=Bar';
        expect(getCookieValue('JSESSIONID')).toBe('123456789');
    });
});

describe('when named cookie is last cookie', () => {
    it('returns value of cookie', () => {
        document.cookie = 'SOME=NONSENSE';
        document.cookie =  'FOO=Bar';
        document.cookie = 'JSESSIONID=123456789';
        expect(getCookieValue('JSESSIONID')).toBe('123456789');
    });
});

describe('when named cookie is not present', () => {
    it('returns empty string', () => {
        document.cookie = 'SOME=NONSENSE';
        document.cookie =  'FOO=Bar';
        expect(getCookieValue('JSESSIONID')).toBe('');
    });
});