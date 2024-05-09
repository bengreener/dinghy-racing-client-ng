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
 * An entry in a race.
 * @typedef Entry
 * @property {Race} race The race entered
 * @property {Competitor} helm The competitor entering the race as helm
 * @property {Competitor} crew The copetitor entering the race as crew
 * @property {Dinghy} dinghy The dinghy that will be sailed in the race
 * @property {Array<Lap>} laps The laps for this entry in the race
 * @property {integer} sumOfLapTimes
 * @property {boolean} onLastLap
 * @property {boolean} finishedRace
 * @property {String} scoringAbbreviation records the scoring abbreviation that identifies an adjustment required to an entries scoring for the race 
 * @property {string} url The URL to the remote resource
 */