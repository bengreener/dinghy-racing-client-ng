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

import React from 'react';
import ScoringAbbreviation from './ScoringAbbreviation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('renders', () => {
    render(<ScoringAbbreviation />);
});

it('displays options for scoring abbreviations', () => {
    render(<ScoringAbbreviation />);
    expect(screen.getByRole('option', {name: ''})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /OCS/})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /DNS/})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /RET/})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /DSQ/})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /DNC/})).toBeInTheDocument();
});

describe('selection is changed', () => {
    it('calls onChange callback provided as prop', async () => {
        const onChangeSpy = jest.fn();
        const user = userEvent.setup();
        render(<ScoringAbbreviation onChange={onChangeSpy} />);
        const selectSA = screen.getByRole('combobox');
        await user.selectOptions(selectSA, 'DNS');
        expect(onChangeSpy).toHaveBeenCalled();
    });
});