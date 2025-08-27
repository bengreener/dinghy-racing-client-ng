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

import { customRender } from '../test-utilities/custom-renders';
import { within } from '@testing-library/react';
import SignalPanel from './SignalsPanel';
import DinghyRacingModel from '../model/dinghy-racing-model';
import FlagState from '../model/domain-classes/flag-state';
import { httpRootURL, wsRootURL } from '../model/__mocks__/test-data';

vi.mock('../model/domain-classes/clock');

it('displays signal indicators in order of time of first signal managed by each indicator', () => {
    const signals = [
        {meaning: 'test signal 2', time: new Date(Date.now() + 60000), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}], flagsState: FlagState.RAISED}},
        {meaning: 'test signal 1', time: new Date(), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}}
    ];
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    const { container } = customRender(<SignalPanel signals={signals} />, model);
    const signalIndicators = container.getElementsByClassName('signal-indicator');

    expect(within(signalIndicators[0]).getByText('flag 1 flag 3')).toBeInTheDocument();
    expect(within(signalIndicators[1]).getByText('flag 2')).toBeInTheDocument();
});

it('displays one signal indicator for each set of flags used', () => {
    const signals = [
        {meaning: 'test signal 2', time: new Date(Date.now() + 60000), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}},
        {meaning: 'test signal 1', time: new Date(), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}},
        {meaning: 'test signal 3', time: new Date(Date.now() + 240000), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.LOWERED}},
        {meaning: 'test signal 4', time: new Date(Date.now() + 360000), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.LOWERED}}
    ];
    const model = new DinghyRacingModel(httpRootURL, wsRootURL);

    const { container } = customRender(<SignalPanel signals={signals} />, model);
    const signalIndicators = container.getElementsByClassName('signal-indicator');

    expect(signalIndicators.length).toBe(2);
});

describe('when time is before any signals are due to have been made', () => {
    it('displays correct initial state for all signals', () => {
        const signals = [
            {meaning: 'test signal 2', time: new Date(Date.now() + 61000), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 1', time: new Date(Date.now() + 1000), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 3', time: new Date(Date.now() + 241000), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.LOWERED}},
            {meaning: 'test signal 4', time: new Date(Date.now() + 301000), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.LOWERED}}
        ];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    
        const { container } = customRender(<SignalPanel signals={signals} />, model);
        const signalIndicators = container.getElementsByClassName('signal-indicator');
    
        expect(within(signalIndicators[0]).getByText('flag 1')).toBeInTheDocument();
        expect(within(signalIndicators[0]).getByText('Lowered')).toBeInTheDocument();
        expect(within(signalIndicators[0]).getByText('00:01')).toBeInTheDocument();
        expect(within(signalIndicators[1]).getByText('flag 2 flag 3')).toBeInTheDocument();
        expect(within(signalIndicators[1]).getByText('Lowered')).toBeInTheDocument();
        expect(within(signalIndicators[1]).getByText('01:01')).toBeInTheDocument();
    });
});

describe('when after time of first signal amd before time of all other signals', () => {
    it('displays correct state for all signals', () => {
        const signals = [
            {meaning: 'test signal 2', time: new Date(Date.now() + 59000), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 1', time: new Date(Date.now() - 1000), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.RAISED}},
            {meaning: 'test signal 3', time: new Date(Date.now() + 239000), soundSignal: null, visualSignal: {flags: [{name: 'flag 2'}, {name: 'flag 3'}], flagsState: FlagState.LOWERED}},
            {meaning: 'test signal 4', time: new Date(Date.now() + 299000), soundSignal: null, visualSignal: {flags: [{name: 'flag 1'}], flagsState: FlagState.LOWERED}}
        ];
        const model = new DinghyRacingModel(httpRootURL, wsRootURL);
    
        const { container } = customRender(<SignalPanel signals={signals} />, model);
        const signalIndicators = container.getElementsByClassName('signal-indicator');
        
        expect(within(signalIndicators[0]).getByText('flag 1')).toBeInTheDocument();
        expect(within(signalIndicators[0]).getByText('Raised')).toBeInTheDocument();
        expect(within(signalIndicators[0]).getByText('04:59')).toBeInTheDocument();
        expect(within(signalIndicators[1]).getByText('flag 2 flag 3')).toBeInTheDocument();
        expect(within(signalIndicators[1]).getByText('Lowered')).toBeInTheDocument();
        expect(within(signalIndicators[1]).getByText('00:59')).toBeInTheDocument();
    });
});
