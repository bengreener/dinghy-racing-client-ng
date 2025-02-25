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
    }

    postMessage(message) { 
        this.onmessage({data: {message: message}});
    }
}

class AudioContext {
    
}

if(!global.BroadcastChannel) {
    global.BroadcastChannel = BroadcastChannel;
}

if(!global.AudioContext) {
    global.AudioContext = AudioContext;
}