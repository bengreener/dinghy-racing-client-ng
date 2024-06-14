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
 * Class providng enumeration of start sequence options
 */
class StartSignals {
    static NONE = 'NONE';
    static WARNINGSIGNAL = 'WARNINGSIGNAL';
    static PREPARATORYSIGNAL = 'PREPARATORYSIGNAL';
    static ONEMINUTE = 'ONEMINUTE';
	static STARTINGSIGNAL = 'STARTINGSIGNAL';

    /**
     * Return a StartSequence stage value based on the supplied string
     * @param {String} stage
     */
    static from(stage) {
        const lowerStage = stage?.toUpperCase();
        switch (lowerStage) {
            case 'WARNINGSIGNAL':
                return StartSignals.WARNINGSIGNAL;
            case 'PREPARATORYSIGNAL':
                return StartSignals.PREPARATORYSIGNAL;
            case 'ONEMINUTE':
                return StartSignals.ONEMINUTE;
            case 'STARTINGSIGNAL':
                return StartSignals.STARTINGSIGNAL;
            default:
                return StartSignals.NONE;
        }
    }
}

export default StartSignals;
