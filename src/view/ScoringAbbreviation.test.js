import React from 'react';
import ScoringAbbreviation from './ScoringAbbreviation';
import { render, screen } from '@testing-library/react';

it('renders', () => {
    const tableRow = document.createElement('tr');
    render(<ScoringAbbreviation />, {container: document.body.appendChild(tableRow)});
});

it('displays options for scoring abbreviations', () => {
    const tableRow = document.createElement('tr');
    render(<ScoringAbbreviation />, {container: document.body.appendChild(tableRow)});
    expect(screen.getByRole('option', {name: ''})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: /DNS/})).toBeInTheDocument();
});