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

import RaceType from './race-type';
import StartType from './start-type';

/**
 * @typedef Race
 * @property {String} name Name of the race
 * @property {Date} plannedStartTime Time the race is scheduled to start
 * @property {Fleet} fleet The fleet that may participate in the race
 * @property {Number} duration The duration of the race; in milliseconds
 * @property {Number} plannedLaps The number of laps planned to be completed during the race
 * @property {RaceType} type The type of the race
 * @property {StartType} startType The start type for the race
 * @property {Number} lapsSailed The number of laps sailed by the lead boat in the race
 * @property {Number} lapForecast A forecast of the total number of race laps that will be completed given laps already completed, last lap time, and remaining race time
 * @property {Number} lastLapTime The last lap time of the lead boat in the race; in milliseconds
 * @property {Number} averageLapTime The average lap time of the lead boat in the race; in milliseconds
 * @property {Clock} clock The race clock
 * @property {Array<DinghyClass>} dinghyClasses The set of dinghy classes for boats that have been entered into the race
 * @property {String} url The URL to the remote resource
 */