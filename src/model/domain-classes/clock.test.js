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

import Clock from './clock';

describe('when provided with a start time', () => {
    it('returns the time to elapse to reach start time when start time is ahead of now', () => {
        const clock = new Clock(new Date(Date.now() + 10000));
        expect(Math.round(clock.getElapsedTime())).toBe(-10000);
    });
    it('returns the amount of time elapsed sins the start time when start time is in the past', () => {
        const clock = new Clock(new Date(Date.now() - 999));
        expect(Math.round(clock.getElapsedTime())).toBe(999);
    });
});

describe('when started without providing a start time', () => {
    it('returns elapsed time from when clock was started', () => {
        const clock = new Clock();
        clock.start();
        // sleep thread and then check time is as expected
        setTimeout(() => {
            const elapsed = clock.getElapsedTime();
        expect(Math.round(elapsed)).toBe(1000);    
        }, 1000);
    });    
});

describe('when clock already started and start instruction given', () => {
    it('does nothing', () => {
        const clock = new Clock();
        clock.start();
        const startTime = clock._startTime;
        // sleep thread and then check time is as expected
        setTimeout(() => {
            clock.start();
            const elapsed = clock.getElapsedTime();
            expect(clock._startTime).toBe(startTime);
            expect(Math.round(elapsed)).toBe(1000);    
        }, 1000);
    });
});

it('stops', () => { 
    const clock = new Clock();
    clock.start();
    setTimeout(() => {
        clock.stop();
        const elapsed = clock.getElapsedTime();
    }, 1000);
    setTimeout(() => {
        expect(clock.getElapsedTime()).toBe(elapsed);
    }, 10);
});

it('resets', () => {
    const clock = new Clock();
    clock.start();
    setTimeout(() => {
        clock.stop();
    }, 1000);
    clock.reset();
    expect(Math.round(clock.getElapsedTime())).toBe(0);
});

it('calls handler on tick', () => {
    const handler = jest.fn();

    const clock = new Clock();
    clock.addTickHandler(handler);
    clock.start();
    setTimeout(() => {
        expect(handler).toBeCalledTimes(10);
    }, 10);
});

describe('when formatting a duration', () => { 
    it('converts 0ms to 00:00', () => {
        expect(Clock.formatDuration(0)).toBe('00:00');
    });
    it('converts 5256000ms to 01:27:36', () => {
        expect(Clock.formatDuration(5256000)).toBe('01:27:36');
    });
    it('converts 43323000ms to 12:02:03', () => {
        expect(Clock.formatDuration(43323000)).toBe('12:02:03');
    });
    it('converts -1379000ms to -22:59', () => {
        expect(Clock.formatDuration(-1379000)).toBe('-22:59');
    });
});