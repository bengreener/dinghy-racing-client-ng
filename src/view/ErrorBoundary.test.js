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

import { render, screen, prettyDOM } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// beforeEach(() => {
//     vi.spyOn(console, 'error');
//     console.error.mockImplementation(() => {});
// })

// afterEach(() => {
//     console.error.mockRestore();
// })

describe('when there is no error', () => {
    it('renders children', () => {
        render(<ErrorBoundary children={<h1>Child Prop</h1>}/>);
        expect(screen.getByText('Child Prop')).toBeInTheDocument();
    })
})

describe('when there is an error', () => {
    it('displays the error message', () => {
        // an error is expected to be thrown so mock out console logging of errors so as not to clutter up console
        vi.spyOn(console, 'error');
        console.error.mockImplementation(() => {});

        const ThrowError = () => {
            throw new SyntaxError('Oops!');
        }

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        )

        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('SyntaxError')).toBeInTheDocument();
        expect(screen.getByText('Oops!')).toBeInTheDocument();

        // restore console logging for errors
        console.error.mockRestore();
    });
})