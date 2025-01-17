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

it('returns the correct time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2021-10-14T10:10:00Z'));
    const clock = new Clock(new Date(Date.now() + 10000));
    const time = clock.getTime().valueOf();
    const pMod = Date.now() - Math.floor(performance.now());
    expect(time).toEqual(Math.floor(performance.now() + pMod));
});

describe('when provided with a start time', () => {
    it('returns the time to elapse to reach start time when start time is ahead of now', () => {
        const clock = new Clock(new Date(Date.now() + 10000));
        expect(Math.round(clock.getElapsedTime())).toBe(-10000);
    });
    it('returns the amount of time elapsed since the start time when start time is in the past', () => {
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

describe('when formatting a duration as [hh:]mm:ss', () => {
    it('converts 1000ms to 00:01', () => {
        expect(Clock.formatDuration(1000)).toBe('00:01');
    });
    it('converts 999ms to 00:00', () => {
        expect(Clock.formatDuration(999)).toBe('00:00');
    });
    it('converts 1ms to 00:00', () => {
        expect(Clock.formatDuration(1)).toBe('00:00');
    });
    it('converts 0ms to 00:00', () => {
        expect(Clock.formatDuration(0)).toBe('00:00');
    });
    it('converts -1ms to -00:01', () => {
        expect(Clock.formatDuration(-1)).toBe('-00:01');
    });
    it('converts -1000ms to -00:01', () => {
        expect(Clock.formatDuration(-1000)).toBe('-00:01');
    });
    it('converts -1001ms to be -00:02', () => {
        expect(Clock.formatDuration(-1001)).toBe('-00:02');
    });
    it('converts 5256000ms to be 01:27:36', () => {
        expect(Clock.formatDuration(5256000)).toBe('01:27:36');
    });
    it('converts 43323000ms to 12:02:03', () => {
        expect(Clock.formatDuration(43323000)).toBe('12:02:03');
    });
    it('converts -1379000ms to -22:59', () => {
        expect(Clock.formatDuration(-1379000)).toBe('-22:59');
    });
    it('converts -5256900ms to -01:27:37', () => {
        expect(Clock.formatDuration(-5256900)).toBe('-01:27:37');
    });
    describe('when formatting a negative duration as a countdown', () => {
        it('omits the minus sign in front of the time', () => {
            expect(Clock.formatDuration(-1001, false, true)).toBe('00:02');
        });
    });
});

describe('when formatting a duration as [hh:]mm:ss.000', () => {
    it('converts 1000ms to 00:01.000', () => {
        expect(Clock.formatDuration(1000, true)).toBe('00:01.000');
    });
    it('converts 999ms to 00:00.999', () => {
        expect(Clock.formatDuration(999, true)).toBe('00:00.999');
    });
    it('converts 1ms to 00:00.001', () => {
        expect(Clock.formatDuration(1, true)).toBe('00:00.001');
    });
    it('converts 0ms to 00:00.000', () => {
        expect(Clock.formatDuration(0, true)).toBe('00:00.000');
    });
    it('converts -1ms to 00:00.001', () => {
        expect(Clock.formatDuration(-1, true)).toBe('-00:00.001');
    });
    it('converts -1000ms to -00:01.000', () => {
        expect(Clock.formatDuration(-1000, true)).toBe('-00:01.000');
    });
    it('converts -1001ms to -00:01.001', () => {
        expect(Clock.formatDuration(-1001, true)).toBe('-00:01.001');
    });
    it('converts -1379000ms to -22:59.000', () => {
        expect(Clock.formatDuration(-1379000, true)).toBe('-22:59.000');
    });
    it('converts -5256900ms to 01:27:36.900', () => {
        expect(Clock.formatDuration(-5256900, true)).toBe('-01:27:36.900');
    });
    describe('when formatting a negative duration as a countdown', () => {
        it('omits the minus sign in front of the time', () => {
            expect(Clock.formatDuration(-1001, true, true)).toBe('00:01.001');
        });
    });
});

describe('when formatting a duration in seconds', () => {
    it('converts 1000ms to 1', () => {
        expect(Clock.formatDurationAsSeconds(1000)).toBe('1');
    });
    it('converts 999ms to 0', () => {
        expect(Clock.formatDurationAsSeconds(999)).toBe('0');
    });
    it('converts 1ms to 0', () => {
        expect(Clock.formatDurationAsSeconds(1)).toBe('0');
    });
    it('converts 0ms to 0', () => {
        expect(Clock.formatDurationAsSeconds(0)).toBe('0');
    });
    it('converts -1ms to -1', () => {
        expect(Clock.formatDurationAsSeconds(-1)).toBe('-1');
    });
    it('converts -1000ms to -1', () => {
        expect(Clock.formatDurationAsSeconds(-1000)).toBe('-1');
    });
    it('converts -1001ms to -2', () => {
        expect(Clock.formatDurationAsSeconds(-1001)).toBe('-2');
    });
    it('converts -1379000ms to -1379', () => {
        expect(Clock.formatDurationAsSeconds(-1379000)).toBe('-1379');
    });
    it('converts 5256000ms to 5256', () => {
        expect(Clock.formatDurationAsSeconds(5256000)).toBe('5256');
    });
    it('converts -5256900ms to -5257', () => {
        expect(Clock.formatDurationAsSeconds(-5256900)).toBe('-5257');
    });
});

describe('when not synched against an external clocl', () => {
    it('returns the same value for Clock.now() as Date.now()', () => {
        expect(Clock.now()).toEqual(Date.now());
    })
});

describe('when need to synch with an external clock accepts a time to synch clocks to and any associated clocks synch to that time when calculating elapsed time', () => {
    it('returns the correct time', () => {
        jest.useFakeTimers().setSystemTime(new Date('2021-10-14T10:10:00Z'));
        Clock.synchToTime(new Date(Date.now() - 3000)); // set time to synch all clocks to
        const clock = new Clock(new Date(Date.now() + 10000));
        const time = clock.getTime().valueOf();
        const pMod = Date.now() - Math.floor(performance.now());
        expect(time).toEqual(Math.floor(performance.now() + pMod) - 3000);
    });
    it('returns the time to elapse to reach start time when start time is ahead of now', () => {
        Clock.synchToTime(new Date(Date.now() - 3000)); // set time to synch all clocks to
        const clock = new Clock(new Date(Date.now() + 10000)); // create a clock
        expect(Math.round(clock.getElapsedTime())).toBe(-10000 - 3000);
    });
    it('returns the amount of time elapsed since the start time when start time is in the past', () => {
        Clock.synchToTime(new Date(Date.now() - 3000)); // set time to synch all clocks to
        const clock = new Clock(new Date(Date.now() - 999));
        expect(Math.round(clock.getElapsedTime())).toBe(999 - 3000);
    });
    describe('when more than one clock', () => {
        it('all clock return adjusted time', () => {
            Clock.synchToTime(new Date(Date.now() - 3000)); // set time to synch all clocks to
            const clock1 = new Clock(new Date(Date.now() + 10000)); // create a clock
            const clock2 = new Clock(new Date(Date.now() + 6000)); // create a clock
            expect(Math.round(clock1.getElapsedTime())).toBe(-10000 - 3000);
            expect(Math.round(clock2.getElapsedTime())).toBe(-6000 - 3000);
        });
    });
    it('sends message to a broadcast channel to advise either Clocks to synch to external time', () => {
        const postMessageSpy = jest.spyOn(BroadcastChannel.prototype, 'postMessage');
        const testTime = new Date();
        Clock.synchToTime(testTime);
        expect(postMessageSpy).toBeCalledWith({message: 'synchToTime', body: testTime});
    });
    // not sure how to make this work. May need to bring in broadcast-channel package from NPM and use to pollyfill jest. Would then need to create a seperate context to send messages between? :-/
    xit('picks up a message from a broadcast channel to receive notification to synch against an external time', () => {
        // const onmessageSpy = jest.spyOn(BroadcastChannel.prototype, 'onmessage');
        const testTime = new Date(Date.now() + 1000);
        Clock.synchToTime(testTime);
        expect(onmessageSpy).toBeCalledWith({message: 'synchToTime', body: testTime});
    });
});