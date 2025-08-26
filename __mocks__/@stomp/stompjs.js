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

'use strict'

// vi.createMockFromModule('@stomp/stompjs');

export const ActivationState = {
    ACTIVE: "active",
    DEACTIVATING: "deactivating",
    INACTIVE: "inactive"
  }

export class Client {
    /**
     * The URL for the STOMP broker to connect to.
     */
    brokerURL = null;
    connectionTimeout = 0;
    _connectionWatcher = null; // Timer
    reconnectDelay = 5;
    heartbeatIncoming = 10;
    heartbeatOutgoing = 10;
    splitLargeFrames = false;
    maxWebSocketChunkSize = 8 * 1024;
    forceBinaryWSFrames = false;
    appendMissingNULLonIncoming = false;
    connectHeaders = null;
    _disconnectHeaders = null;

    _stompHandler = null; // dummy using a Map with destination/ topic will be key. Callback will be added to array for that key
    _interval = null;

  /**
   * Disconnection headers.
   */
  get disconnectHeaders() {
    return this._disconnectHeaders;
  }

  set disconnectHeaders(value) {
    this._disconnectHeaders = value;
    if (this._stompHandler) {
      this._stompHandler.disconnectHeaders = this._disconnectHeaders;
    }
  }
  onUnhandledMessage = null;
  onUnhandledReceipt = null;
  onUnhandledFrame = null;

  get connected() {
    return !!this._stompHandler;
  }

  beforeConnect = null;
  onConnect = null;
  onDisconnect = null;
  onStompError = null;
  onWebSocketClose = null;
  onWebSocketError = null;
  logRawCommunication = false;
  debug = null;
  discardWebsocketOnCommFailure = false;

  get connectedVersion() {
    return this._stompHandler ? this._stompHandler.connectedVersion : undefined;
  } 

  get active() {
    return this.state === ActivationState.ACTIVE;
  }
  
  onChangeState = null;

  _changeState(state) {
    this.state = state;
    this.onChangeState(state);
  }

  state = ActivationState.INACTIVE;

  _reconnector = null;

  /**
   * Create an instance.
   */
  constructor(conf = {}) {
    // No op callbacks
    const noOp = () => {};
    this.debug = noOp;
    this.beforeConnect = noOp;
    this.onConnect = noOp;
    this.onDisconnect = noOp;
    this.onUnhandledMessage = noOp;
    this.onUnhandledReceipt = noOp;
    this.onUnhandledFrame = noOp;
    this.onStompError = noOp;
    this.onWebSocketClose = noOp;
    this.onWebSocketError = noOp;
    this.logRawCommunication = false;
    this.onChangeState = noOp;



    // These parameters would typically get proper values before connect is called
    this.connectHeaders = {};
    this._disconnectHeaders = {};

    // Apply configuration
    this.configure(conf);
  }

  /**
   * Update configuration.
   */
  configure(conf) {
    // bulk assign all properties to this
    Object.assign(this, conf);
  }

  activate() {
    this._connect();
  }

  // fake responses via WebSocket via timed loop to call
  // if interest registered for each topic trigger each callback
  _connect() {
    this.onConnect();
    this._interval = setInterval(() => {
        if (this._stompHandler) {
            // this._stompHandler.forEach(value => value.forEach(cb => cb({'body': 'http://localhost:8081/dinghyracing/api/entries/10'})));
            this._stompHandler.forEach((value, key) => {
              if (key === '/topic/createCompetitor') {
                value.forEach(cb => cb({body: 'http://localhost:8081/dinghyracing/api/competitors/99'}));
              }
              if (key === '/topic/createDinghy') {
                value.forEach(cb => cb({body: 'http://localhost:8081/dinghyracing/api/dinghies/99'}));
              }
              if (key === '/topic/createDinghyClass') {
                value.forEach(cb => cb({body: 'http://localhost:8081/dinghyracing/api/dinghyClasses/99'}));
              }
              if (key === '/topic/createFleet') {
                value.forEach(cb => cb({body: 'http://localhost:8081/dinghyracing/api/fleet/1'}));
              }
              if (key === '/topic/updateRace') {
                value.forEach(cb => cb({'body': 'http://localhost:8081/dinghyracing/api/races/4'}));
              }
              if (key === '/topic/updateRaceEntryLaps') {
                value.forEach(cb => cb({'body': 'http://localhost:8081/dinghyracing/api/races/4'}));
              }
              if (key === '/topic/updateEntry') {
                value.forEach(cb => cb({'body': 'http://localhost:8081/dinghyracing/api/entries/10'}));
              }
              if (key === '/topic/deleteEntry') {
                value.forEach(cb => cb({'body': 'http://localhost:8081/dinghyracing/api/entries/10'}));
              }
              if (key === '/topic/updateDinghyClass') {
                value.forEach(cb => cb({'body': 'http://localhost:8081/dinghyracing/api/dinghyClasses/1'}));
              }
              if (key === '/topic/updateFleet') {
                value.forEach(cb => cb({'body': 'http://localhost:8081/dinghyracing/api/fleet/1'}));
              }
            });
        }
    }, 1);
  }

  async deactivate(options) {
    clearInterval(this._interval);
  }

  forceDisconnect() {
    clearInterval(this._interval);
  }

  // should return a stomp description but ignoring for time being
  // also not doing anything with headers
  subscribe(
    destination,
    callback,
    headers = {}
  ) {
    // this._checkConnection();
    if (!this._stompHandler) {
      this._stompHandler = new Map();
    }
    if (this._stompHandler.has(destination)) {
      this._stompHandler.get(destination).push(callback);
    }
    else {
      this._stompHandler.set(destination, [callback]);
    }
  }
}
