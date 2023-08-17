import { render } from '@testing-library/react';
import RaceEntryView from './RaceEntryView';
import { entryChrisMarshallScorpionA1234 } from '../model/__mocks__/test-data';

it('renders', () => {
    const tableBody = document.createElement('tbody');
    render(<RaceEntryView entry={entryChrisMarshallScorpionA1234} />, {container: document.body.appendChild(tableBody)});
})