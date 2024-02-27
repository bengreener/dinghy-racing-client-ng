import React from 'react';
import ScoringAbbreviation from './ScoringAbbreviation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('renders', () => {
    const tableRow = document.createElement('tr');
    render(<ScoringAbbreviation />, {container: document.body.appendChild(tableRow)});
});

it('displays options for scoring abbreviations', () => {
    const tableRow = document.createElement('tr');
    render(<ScoringAbbreviation />, {container: document.body.appendChild(tableRow)});
    expect(screen.getByRole('option', {name: ''})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /DNS/})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /RET/})).toBeInTheDocument();
});

describe('selection is changed', () => {
    it('calls onChange callback provided as prop', async () => {
        const onChangeSpy = jest.fn();
        const user = userEvent.setup();
        const tableRow = document.createElement('tr');
        render(<ScoringAbbreviation onChange={onChangeSpy} />, {container: document.body.appendChild(tableRow)});
        const selectSA = screen.getByRole('combobox');
        await user.selectOptions(selectSA, 'DNS');
        expect(onChangeSpy).toHaveBeenCalled();
    });
});