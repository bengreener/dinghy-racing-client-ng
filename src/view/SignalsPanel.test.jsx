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

import { render, within, screen } from '@testing-library/react';
import SignalsPanel from './SignalsPanel';
import Clock from '../model/clock';
import FlagState from '../model/flag-state';

vi.mock('../model/clock');

it('displays signal indicators in order of time of first signal managed by each indicator', () => {
    const signals = [
        {meaning: 'test signal 2', time: Date.now() + 60000, soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}], flagsState: FlagState.RAISED}},
        {meaning: 'test signal 1', time: Date.now(), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}}
    ];
    const { container } = render(<SignalsPanel signals={signals}  clock={new Clock()} />);
    const signalIndicators = container.getElementsByClassName('signal-indicator');

    expect(within(signalIndicators[0]).getByText('flag 1 flag 3')).toBeInTheDocument();
    expect(within(signalIndicators[1]).getByText('flag 2')).toBeInTheDocument();
});

it('displays one signal indicator for each set of flags used', () => {
    const signals = [
        {meaning: 'test signal 2', time: Date.now() + 60000, soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}},
        {meaning: 'test signal 1', time: Date.now(), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}},
        {meaning: 'test signal 3', time: Date.now() + 240000, soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.LOWERED}},
        {meaning: 'test signal 4', time: Date.now() + 360000, soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.LOWERED}}
    ];

    const { container } = render(<SignalsPanel signals={signals} clock={new Clock()} />);
    const signalIndicators = container.getElementsByClassName('signal-indicator');

    expect(signalIndicators.length).toBe(2);
});

describe('when time is before any signals are due to have been made', () => {
    it('displays correct initial state for all signals', () => {
        const signals = [
            {meaning: 'test signal 2', time: Date.now() + 61000, soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 1', time: Date.now() + 1000, soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 3', time: Date.now() + 241000, soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.LOWERED}},
            {meaning: 'test signal 4', time: Date.now() + 301000, soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.LOWERED}}
        ];
        const { container } = render(<SignalsPanel signals={signals} clock={new Clock()} />);
        const signalIndicators = container.getElementsByClassName('signal-indicator');
    
        let signalFlag = within(signalIndicators[0]).getByTestId('signal-flag-./external/flag 1.svg');
	    let signalFlagActionIcon = within(signalIndicators[0]).getByTestId('signal-flag-action-icon');
	    let signalFlagActionTime = within(signalIndicators[0]).getByTestId('signal-flag-action-time');

        expect(signalFlagActionTime.compareDocumentPosition(signalFlagActionIcon)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(signalFlagActionIcon.classList.contains('flipped')).toBeFalsy();
        expect(signalFlagActionIcon.compareDocumentPosition(signalFlag)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
       
        signalFlag = within(signalIndicators[1]).getByTestId('signal-flag-./external/flag 2.svg');
	    signalFlagActionIcon = within(signalIndicators[1]).getByTestId('signal-flag-action-icon');
	    signalFlagActionTime = within(signalIndicators[1]).getByTestId('signal-flag-action-time');

        expect(signalFlagActionTime.compareDocumentPosition(signalFlagActionIcon)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(signalFlagActionIcon.classList.contains('flipped')).toBeFalsy();
        expect(signalFlagActionIcon.compareDocumentPosition(signalFlag)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
});

describe('when after time of first signal amd before time of all other signals', () => {
    it('displays correct state for all signals', () => {
        const signals = [
            {meaning: 'test signal 2', time: Date.now() + 59000, soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 1', time: Date.now() - 1000, soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 3', time: Date.now() + 239000, soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.LOWERED}},
            {meaning: 'test signal 4', time: Date.now() + 299000, soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.LOWERED}}
        ];
        const { container } = render(<SignalsPanel signals={signals} clock={new Clock()} />);
        const signalIndicators = container.getElementsByClassName('signal-indicator');
        
        let signalFlag = within(signalIndicators[0]).getByTestId('signal-flag-./external/flag 1.svg');
	    let signalFlagActionIcon = within(signalIndicators[0]).getByTestId('signal-flag-action-icon');
	    let signalFlagActionTime = within(signalIndicators[0]).getByTestId('signal-flag-action-time');

        expect(signalFlagActionTime.compareDocumentPosition(signalFlagActionIcon)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
        expect(signalFlagActionIcon.classList.contains('flipped')).toBeTruthy();
        expect(signalFlagActionIcon.compareDocumentPosition(signalFlag)).toBe(Node.DOCUMENT_POSITION_PRECEDING);
       
        signalFlag = within(signalIndicators[1]).getByTestId('signal-flag-./external/flag 2.svg');
	    signalFlagActionIcon = within(signalIndicators[1]).getByTestId('signal-flag-action-icon');
	    signalFlagActionTime = within(signalIndicators[1]).getByTestId('signal-flag-action-time');

        expect(signalFlagActionTime.compareDocumentPosition(signalFlagActionIcon)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(signalFlagActionIcon.classList.contains('flipped')).toBeFalsy();
        expect(signalFlagActionIcon.compareDocumentPosition(signalFlag)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
});

describe('when 2 signals have the same time and 1 is a Preparatory signal and the other is not', () => {
    it('displays the preparatory signal first', () => {
        const signals = [
            {meaning: 'Warning signal', time: Date.now(), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}], flagsState: FlagState.RAISED}},
            {meaning: 'Preparatory signal', time: Date.now(), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}}
        ];
        const { container } = render(<SignalsPanel signals={signals} clock={new Clock()} />);
        const signalIndicators = container.getElementsByClassName('signal-indicator');

        expect(within(signalIndicators[0]).getByText('flag 1')).toBeInTheDocument();
        expect(within(signalIndicators[1]).getByText('flag 2')).toBeInTheDocument();
    });
})