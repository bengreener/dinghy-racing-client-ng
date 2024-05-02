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