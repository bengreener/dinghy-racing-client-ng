//Set ESLint no-undef rule to ignore undefined variable 'global'
/*global global */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

class AudioContext {
    createMediaElementSource() {};
}

if (!global.AudioContext) {
  global.AudioContext = AudioContext;
}