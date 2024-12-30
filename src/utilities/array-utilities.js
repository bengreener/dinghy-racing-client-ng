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

/**
 * Retirn a shallow copy of an array sorted in ascending order, smallest to largest, based on value returned by getValueFunction
 * @param {Array} array Array to sort
 * @param {Function} getValueFunction Function that returns the value to sort by
 * @param {Boolean} [reversed=false] Reverse the order of the sorted array; default is false
 * @returns {Array}
 */
function sortArray(array, getValueFunction, reversed = false) {
    const tempArray = [...array];
    const newArray = [];
    
    while(tempArray.length > 0) {
        // find index of lowest value in array
        const lowestIndex = findIndexOfLowest(tempArray, getValueFunction);
        // put lowest item into a new array
        newArray.push(tempArray[lowestIndex]);
        // remove item from temp array
        tempArray.splice(lowestIndex, 1);
    }
    if (reversed) {
        newArray.reverse();
    }
    return newArray;
}

/**
 * Find the index of the lowest value in an array
 * @param {Array} array 
 * @param {Function} getValueFunction Function that returns the value of the property to sort against; must be a primitive value or an array
 * @returns {number}
 */
function findIndexOfLowest(array, getValueFunction) {
    var lowestIndex = 0;
    var lowestValue = getValueFunction(array[lowestIndex]);
    for (var i = 1; i < array.length; i++) {
        const value = getValueFunction(array[i]);
        // compare array based on values
        if (Array.isArray(value)) {
            for (var x = 0; x < value.length; x++) {
                // if value greater than current lowest value move on to next item
                if (value[x] > lowestValue[x]) {
                    break;
                }
                if (value[x] < lowestValue[x]) {
                    lowestValue = value;
                    lowestIndex = i;
                    break;
                }
            }
        }
        else {
            if(value < lowestValue) {
                lowestValue = value;
                lowestIndex = i;
            }
        }
    }
    return lowestIndex;
}

export { sortArray, findIndexOfLowest }