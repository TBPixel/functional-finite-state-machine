/**
 * @typedef {Object} StateSnapshot
 * @property {String} name
 * @property {Number} index
 * @property {Date} timestamp
 * @property {*} payload
 * @property {*} state
 */

/**
 * Handles the state transition and returns the result
 *
 * @function HandlerFunc
 * @param {{states: Object.<String, HandlerFunc>, transitionTo: function(HandlerFunc, *)}} machine
 * @param {*} [payload]
 */

/**
 * @typedef {Object} InternalStateMachine
 * @property {Object.<String, HandlerFunc>} states
 * @property {StateSnapshot[]} history
 */

/**
 * @typedef {Object} StateMachine
 * @property {Object.<String, HandlerFunc>} states A reference to the passed in object of states
 * @property {function():StateSnapshot} current Returns the last active state
 * @property {function():StateSnapshot[]} history Returns a copy of the state history array
 * @property {function(HandlerFunc, *)} transitionTo Transitioning the state machine to a given state, calling the handler
 * @property {function():StateSnapshot} undo Reverts to the previous state, and doesn't call the handler
 * @property {function():StateSnapshot} redo Re-does the next state, if exists
 */

/**
 * transitionTo transitions to another internal state
 *
 * @param {InternalStateMachine} m The finite state machine
 * @param {HandlerFunc} handler The state to transition to
 * @param {*} [payload] An optional payload
 */
const transitionTo = (m, handler, payload) => {
    const name = Object.keys(m.states).find((k) => m.states[k] === handler);
    if (!name) {
        throw new Error('failed to transition to an unknown state!');
    }

    const state = {
        name,
        payload,
        state: null,
        index: m.history.length,
        timestamp: new Date(),
    };
    const index = m.history.push(state) - 1;
    const result = handler(m, payload);
    if (result) {
        m.history.splice(index, 1, {
            ...state,
            state: result,
        });
    }

    return payload;
};

/**
 * undo one state transition on the state stack.
 *
 * @param {InternalStateMachine} m The state machine.
 * @return {StateSnapshot[]} The new state machine.
 */
const undo = (m) => {
    if (m.history.length <= 0) {
        return m.history;
    }

    const cursor = m.history.length - 1;
    const state = m.history[cursor];
    if (state.index <= 0) {
        return m.history;
    }

    const prev = m.history[state.index - 1];
    const next = {
        ...prev,
        timestamp: new Date(),
    };
    m.history.push(next);

    return m.history;
};

/**
 * redo moves the state machine ahead one state, if it can, and returns a new state machine.
 *
 * @param {InternalStateMachine} m The state machine
 * @return {StateSnapshot[]}
 */
const redo = (m) => {
    if (m.history.length <= 0) {
        return m.history;
    }

    const cursor = m.history.length - 1;
    const state = m.history[cursor];
    if (state.index >= cursor) {
        return m.history;
    }

    const prev = m.history[state.index + 1];
    const next = {
        ...prev,
        timestamp: new Date(),
    };
    m.history.push(next);

    return m.history;
};

/**
 * newStateMachine creates and returns a finite state machine.
 *
 * @param   {Object} states
 * @return {StateMachine} The state machine
 */
const newStateMachine = (states) => {
    const initial = {
        history: [],
        states: {},
    };

    let m = {
        ...initial,
        states,
    };

    const current = () => m.history[m.history.length - 1];
    const history = () => [...m.history];

    const handleTransitionTo = (handler, payload) => {
        const localMachine = {
            ...m,
            transitionTo: handleTransitionTo,
        };

        const result = transitionTo(localMachine, handler, payload);
        if (!result || (!result.index && result.index < 0)) {
            return current();
        }

        return result;
    };

    const handleUndo = () => {
        m = {
            ...m,
            history: undo(m),
        };

        return current();
    };

    const handleRedo = () => {
        m = {
            ...m,
            history: redo(m),
        };

        return current();
    };

    return {
        states,
        current,
        history,
        transitionTo: handleTransitionTo,
        undo: handleUndo,
        redo: handleRedo,
    };
};

/**
 * factory returns an already executed state machine for inspection.
 *
 * @param {Object} states
 * @param {HandlerFunc} initialState
 * @param {*} payload
 * @returns {{fsm: StateMachine, result: StateSnapshot}}
 */
export const factory = (states, initialState, payload) => {
    const fsm = newStateMachine(states);
    const result = fsm.transitionTo(initialState, payload);

    return { fsm, result };
};

export default newStateMachine;
