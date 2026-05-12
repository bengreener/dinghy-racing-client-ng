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

import SoundSignal from './sound-signal';
import VisualSignal from './visual-signal';

/**
 * A signal to competitors to indicate the progress of a race start sequence.
 * Meaning should be treated as an enumeration. Recognised values are: 'Warning signal', 'Preparatory signal', 'Starting signal'. 
 * @typedef Signal
 * @property {String} meaning of the signal
 * @property {Number} time of the signal; in milliseconds
 * @property {SoundSignal} soundSignal
 * @property {VisualSignal} visualSignal
 */

export default Signal;