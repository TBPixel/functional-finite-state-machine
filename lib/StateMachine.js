"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Redo = exports.Undo = exports.CurrentState = exports.TransitionTo = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fsm = {
  isFSM: true,
  current: -1,
  history: [],
  states: {}
};
/**
 * NewStateMachine creates and returns a finite state machine.
 *
 * @param   {Object} states
 * @returns {Object} The state machine
 */

var NewStateMachine = function NewStateMachine(states) {
  return _objectSpread({}, fsm, {
    states: states
  });
};
/**
 * TransitionTo transitions to another internal state
 *
 * @param {Object} stateMachine The finite state machine
 * @param {Function} state The state to transition to
 * @param {*} payload An optional payload
 * @returns {Object} The current state
 */


var TransitionTo = function TransitionTo(_ref, handler, payload) {
  var current = _ref.current,
      history = _ref.history,
      states = _ref.states;
  var name = Object.keys(states).find(function (k) {
    return states[k] === handler;
  });

  if (!name) {
    throw new Error('failed to transition to an unknown state!');
  }

  var state = {
    name: name,
    handler: handler,
    state: payload,
    timestamp: new Date()
  };
  var index = history.push(state) - 1;
  var result = handler({
    current: current,
    history: history,
    states: states
  }, payload);

  if (result.isFSM) {
    return result;
  }

  history.splice(index, 1, _objectSpread({}, state, {
    state: result
  }));
  return _objectSpread({}, fsm, {
    current: index,
    states: states,
    history: history
  });
};
/**
 * CurrentState returns the last active state on the FSM, or null
 *
 * @param {Object} stateMachine
 * @returns {Object}
 */


exports.TransitionTo = TransitionTo;

var CurrentState = function CurrentState(_ref2) {
  var current = _ref2.current,
      history = _ref2.history;

  if (current < 0 || history.length <= 0) {
    return null;
  }

  return history[current];
};
/**
 * Undo one state transition on the state stack.
 *
 * @param {Object} machine The state machine.
 * @returns {Object} The new state machine.
 */


exports.CurrentState = CurrentState;

var Undo = function Undo(_ref3) {
  var current = _ref3.current,
      history = _ref3.history,
      states = _ref3.states;

  if (current <= 0 || history.length <= 0) {
    return {
      current: current,
      history: history,
      states: states
    };
  }

  console.log(history);
  return _objectSpread({}, fsm, {
    current: current - 1,
    history: history,
    states: states
  });
};
/**
 * Redo moves the state machine ahead one state, if it can, and returns a new state machine.
 *
 * @param {Object} machine The state machine
 * @returns {Object}
 */


exports.Undo = Undo;

var Redo = function Redo(_ref4) {
  var current = _ref4.current,
      history = _ref4.history,
      states = _ref4.states;

  if (current > history.length) {
    return {
      current: current,
      history: history,
      states: states
    };
  }

  return _objectSpread({}, fsm, {
    current: current + 1,
    history: history,
    states: states
  });
};

exports.Redo = Redo;
var _default = NewStateMachine;
exports["default"] = _default;