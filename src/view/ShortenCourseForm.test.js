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

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShortenCourseForm from './ShortenCourseForm';

it('renders', () => {
    render(<ShortenCourseForm />);
    expect(screen.getByLabelText(/set laps/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Update Laps/})).toBeInTheDocument();
});

it('does not accept an input greater than value set for maximum laps', async () => {
    const user = userEvent.setup();
    render(<ShortenCourseForm maxLaps={3} />);
    const lapInput = screen.getByLabelText(/set laps/i);
    await act(async () => {
        await user.clear(lapInput);
        await user.type(lapInput, '5');
    });
    expect(lapInput).not.toHaveValue(5);
})