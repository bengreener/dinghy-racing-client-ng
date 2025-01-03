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

import { sortArray, findIndexOfLowest } from './array-utilities';

it('finds lowest value in array', () => {
    const array = ['d', 'b', 'h', 'z'];
    const lowestIndex = findIndexOfLowest(array, (value) => value);
    expect(lowestIndex).toBe(1);
});

it('sorts an array', () => {
    const startArray = [ 2, 7, 3, 12, 1];
    const sortedArray = sortArray(startArray, (value) => value);
    expect(sortedArray).toEqual([1, 2, 3, 7, 12]);
});

it('sorts an array into reverse order', () => {
    const startArray = [ 2, 7, 3, 12, 1];
    const sortedArray = sortArray(startArray, (value) => value, true);
    expect(sortedArray).toEqual([12, 7, 3, 2, 1]);
});

it('leaves original array unchanged', () => {
    const startArray = [ 2, 7, 3, 12, 1];
    const copyStartArray = [...startArray];
    sortArray(startArray, (value) => value);
    expect(startArray).toEqual(copyStartArray);
})