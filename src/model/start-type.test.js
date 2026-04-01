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

import StartType from './start-type';

describe('when passed a string start type value', () => {
    it('converts cscclubstart to StartType.CSCCLUBSTART', () => {
        expect(StartType.from('cscclubstart')).toEqual(StartType.CSCCLUBSTART);
    });
    it('converts rrs26 to StartType.RRS26', () => {
        expect(StartType.from('rrs26')).toEqual(StartType.RRS26);
    });
    describe('when string passed is not a recognised value', () => {
        it('returns null', () => {
            expect(StartType.from('pursuit')).toBeNull();
        });
    })
});