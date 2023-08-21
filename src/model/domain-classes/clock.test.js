import Clock from './clock';

it('starts', () => {
    const clock = new Clock();
    clock.start();
    // sleep thread and then check time is as expected
    setTimeout(() => {
        const elapsed = clock.getElapsedTime();
    expect(elapsed).toBe(1000);    
    }, 1000);
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
            expect(elapsed).toBe(1000);    
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
    // const elapsed = clock.getElapsedTime();
    setTimeout(() => {
        expect(clock.getElapsedTime()).toBe(elapsed);
    }, 10);
});

describe('if clock not started and stop instruction given', () => {
    it('does nothing', () => {
        const clock = new Clock();
        clock.stop();
        expect(clock._elapsedTime).toBe(0);
    });
});

it('resets', () => {
    const clock = new Clock();
    clock.start();
    setTimeout(() => {
        clock.stop();
    }, 1000);
    clock.reset();
    expect(clock.getElapsedTime()).toBe(0);
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