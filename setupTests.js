//Set ESLint no-undef rule to ignore undefined variable 'global'
/*global global */

import { vi } from 'vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// When using Vitest with fake timers, userEvent times out because it does not advance the fake timers. Work around this by shimming the Jest global.
// https://github.com/testing-library/user-event/pull/1304
globalThis.jest = {
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
}

afterEach(() => {
  cleanup();
});

class AudioContext {
  createMediaElementSource() {};
}

if (!global.AudioContext) {
  global.AudioContext = AudioContext;
}