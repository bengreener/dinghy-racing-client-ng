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

import CountdownDisplayControl from './CountdownDisplayControl';
import { render, screen } from '@testing-library/react';

jest.mock('../model/domain-classes/clock');

it('renders', () => {
    render(<CountdownDisplayControl title={'Countdown'} time={-600000} message={'Some Event'} />);
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText(/some event/i)).toBeInTheDocument();
});