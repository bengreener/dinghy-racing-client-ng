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

import { useCallback, useEffect, useState } from 'react';
import Clock from '../model/clock';
import FlagState from '../model/flag-state';

/**
 * Display information about a signal, or signals where the same flags are used, in starting a race or session of races
 * @param {Object} props
 * @param {Array<Signal>} [props.signals]
 * @returns {HTMLDivElement}
 */
function SignalIndicator({ signals, clock }) {
    const [time, setTime] = useState(clock.getTimeToSecondPrecision());
    const [flagImageFilenames] = useState(() => {
        const images = [];
        signals[0]?.visualSignal.flags.forEach(flag => {
            switch(flag.name) {
                case 'Blue Peter':
                    images.push('./flags/p.svg');
                    break;
                case 'Open Handicap Class Flag':
                    images.push('./flags/chipstead_pennant.svg');
                    break;
                case 'Solo Class Flag':
                    images.push('./flags/n1.svg');
                    break;
                case 'Comet Class Flag':
                    images.push('./flags/c.svg');
                    break;
                case 'Topper Class Flag':
                    images.push('./flags/t.svg');
                    break;
                case 'Laser & Radial Class Flag':
                    images.push('./flags/laser.svg');
                    break;
                case 'Graduate Class Flag':
                    images.push('./flags/g.svg');
                    break;
                case 'Enterprise Class Flag':
                    images.push('./flags/e.svg');
                    break;
                case 'Firefly Class Flag':
                    images.push('./flags/f.svg');
                    break;
                case 'Heron Class Flag':
                    images.push('./flags/h.svg');
                    break;
                case 'Fast Handicap Class Flag':
                    images.push('./flags/chipstead_pennant.svg');
                    break;
                case 'Slow Handicap Class Flag':
                    images.push('./flags/r.svg');
                    break;
                case 'Optimist Class Flag':
                    images.push('./flags/optimist.svg');
                    break;
                case 'Graduate Goblet Class Flag':
                    images.push('./flags/g.svg');
                    break;
                case 'Chipstead Pin Class Flag':
                    images.push('./flags/chipstead_pennant.svg');
                    break;
                case 'Commodores Class Flag':
                    images.push('./flags/chipstead_pennant.svg');
                    break;
                case 'Novice Class Flag':
                    images.push('./flags/chipstead_pennant.svg');
                    break;
                case 'Christmas Pudding Class Flag':
                    images.push('./flags/chipstead_pennant.svg');
                    break;
                case 'Junior Regatta Class Flag':
                    images.push('./flags/chipstead_pennant.svg');
                    break;
                case 'Scorpion Class Flag':
                    images.push('./flags/z.svg');
                    break;
                default:
                    images.push(`./external/${flag.name}.svg`);
                    break;
            }
        });
        return images;
    })

    const tickHandler = useCallback(() => {
        setTime(clock.getTimeToSecondPrecision());
}, [clock]);

    //set tick handler
    useEffect(() => {
        clock.addTickHandler(tickHandler);

        return(() => {
            clock.removeTickHandler(tickHandler);
        });
}, [clock, tickHandler]);

    const flags = signals[0]?.visualSignal.flags;
    const lastSignal = signals.findLast(signal => signal.time <= time); // only works when there are no more than 2 signals
    const nextSignal = signals.find(signal => signal.time > time);
    const timeToChange = () => {
        if (lastSignal?.time === time) {
            return 0;
        }
        else if (nextSignal) {
            return nextSignal.time - time;
        }
        else {
            return 0;
        }
    }

    const oneMinuteToChange = () => {
        if (lastSignal?.time === time) {
            return '';
        }
        else if (nextSignal) {
            if ((nextSignal.time - time) <= 60000 && (nextSignal.time - time) > 0) {
                return 'one-minute-to-flag-change';
            }
            return '';
        }
        else {
            return '';
        }
    };

    return (
        <div className='signal-indicator w3-col bgis-fifth w3-border'>
            <div className='w3-border-bottom'>
                <output id='flag-name-output' className='w3-cell bgis-bold' >{flags.map(flag => flag.name).join(" ")}</output>
            </div>
            {lastSignal?.visualSignal.flagsState === FlagState.RAISED ? 
                <>
                    <div className='signal-flag-container w3-border-bottom'>
                        {flagImageFilenames.map(imageFilename => <img key={imageFilename} data-testid={`signal-flag-${imageFilename}`} className="signal-flag w3-image" src={imageFilename} />)}
                    </div>
                    <div data-testid='signal-flag-action-container' className={`${oneMinuteToChange()}`}>
                        <div className='bgis-centered-element'>
                            {timeToChange() ? <img data-testid='signal-flag-action-icon' className='signal-flag-action-icon flipped' src='./icons/arrow_shape_up.svg' /> : <img className='signal-flag-action-icon flipped' src='./icons/no_arrow_shape.svg' />}
                        </div>
                        <div className='bgis-centered-element'>
                            <output id='change-in-output' data-testid={`signal-flag-action-time`} className='bgis-centered-element w3-xxlarge' >{Clock.formatDuration(timeToChange(), false, true)}</output>
                        </div>
                    </div>
                </> : 
                <>
                    <div data-testid='signal-flag-action-container' className={`${oneMinuteToChange()}`}>
                        <div className='bgis-centered-element'>
                            <output id='change-in-output' data-testid={`signal-flag-action-time`} className='bgis-centered-element w3-xxlarge' >{Clock.formatDuration(timeToChange(), false, true)}</output>
                        </div>
                        <div className='bgis-centered-element'>
                            {timeToChange() ? <img data-testid='signal-flag-action-icon' className='signal-flag-action-icon' src='./icons/arrow_shape_up.svg' /> : <img className='signal-flag-action-icon flipped' src='./icons/no_arrow_shape.svg' />}
                        </div>
                    </div>
                    <div className='signal-flag-container w3-border-top'>
                        {flagImageFilenames.map(imageFilename => <img key={imageFilename} data-testid={`signal-flag-${imageFilename}`} className="signal-flag w3-image" src={imageFilename} />)}
                    </div>
                </>
            }
        </div>
    )
}

export default SignalIndicator;