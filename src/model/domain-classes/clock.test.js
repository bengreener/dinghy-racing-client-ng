// JSDOM does not support background workers. Should be possible to mock a workaround based on jsdom-worker
// import 'jsdom-worker'; // this didn't work error reported node:http using import outside module

import Clock from './clock';

it('starts', () => {
    const clock = new Clock();
    clock.start();
    // sleep thread and then check time is as expected
    // TODO: thread sleep for 1000 milliseconds
    const elapsed = clock._elapsedTime;
    expect(elapsed).toBe(1000);
});

it('stops', () => {
    const clock = new Clock();
    clock.start();
    // sleep thread and then check time is as expected
    // TODO: thread sleep for 1000 milliseconds
    clock.stop();
    const elapsed = clock._elapsedTime;
    // TODO: thread sleep for 1000 milliseconds
    expect(clock._elapsedTime).toBe(elapsed);
});

it('resets', () => {
    const clock = new Clock();
    clock.start();
    // TODO: thread sleep for 1000 milliseconds
    clock.stop();
    clock.reset();
    expect(clock._elapsedTime).toBe(0);
});

it('returns elapsed time', () => {
    const clock = new Clock();
    clock.start();
    // sleep thread and then check time is as expected
    // TODO: thread sleep for 1000 milliseconds
    const elapsed = clock.getElapsedTime();
    expect(elapsed).toBe(1000);
});

it('calls handler on tick', () => {
    const handler = jest.fn();

    const clock = new Clock();
    clock.addTickHandler(handler);
    clock.start();
    // TODO:  thread sleep for 10 milliseconds
    expect(handler).toBeCalledTimes(10);
});