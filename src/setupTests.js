// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

class BroadcastChannel {
    name;
    onmessage;

    constructor(name) {
        this.name = name;
        // this.onmessage = this.onmessage.bind(this);
    }

    // postMessage = jest.fn();
    postMessage(message) { 
        this.onmessage({data: {message: message}});
    }

    // onmessage = jest.fn();
    // onmessage(event) {
    //     return null;
    // }
}

if(!global.BroadcastChannel) {
    global.BroadcastChannel = BroadcastChannel;
}