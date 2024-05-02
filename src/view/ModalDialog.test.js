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

import { render, screen } from '@testing-library/react';
import ModalDialog from './ModalDialog';

// jsdom 16.7.0 does not implement HTMLDialogElement behaviour
// unsure how to address this. A better understanding f the standard and jsdom implementation might help
HTMLDialogElement.prototype.showModal = jest.fn();
HTMLDialogElement.prototype.close = jest.fn();

describe('when set to show', () => {
    it('renders with children vsible', async () => {
        function TestText() {
            return (<p>Test Text</p>)
        };
        render(<ModalDialog show={true} onClose={jest.fn()} children={TestText()} />);
        const testText = await screen.findByText('Test Text');
        expect(testText).toBeInTheDocument();
    });
});

describe('when show is false', () => {
    // cannot test with jsdom implementation
    xit('renders with children invsible', async () => {
        function TestText() {
            return (<p>Test Text</p>)
        };
        render(<ModalDialog show={false} onClose={jest.fn()} children={TestText()} />);
        const testText = await screen.findByText('Test Text');
        expect(testText).not.toBeInTheDocument();
    });
});

