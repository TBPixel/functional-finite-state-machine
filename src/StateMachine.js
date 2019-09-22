/**
 * transitionTo transitions to another internal state
 *
 * @param {Object} m The finite state machine
 * @param {Function} state The state to transition to
 * @param {*} payload An optional payload
 * @returns {*}
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
 * @param {Object} m The state machine.
 * @returns {Object} The new state machine.
 */
const undo = (m) => {
    if (m.history.length <= 0) {
        return { history: m.history };
    }

    const cursor = m.history.length - 1;
    const state = m.history[cursor];
    if (state.index <= 0) {
        return { history: m.history };
    }

    const prev = m.history[state.index - 1];
    const next = {
        ...prev,
        timestamp: new Date(),
    };
    m.history.push(next);

    return { history: m.history };
};

/**
 * redo moves the state machine ahead one state, if it can, and returns a new state machine.
 *
 * @param {Object} m The state machine
 * @returns {Object}
 */
const redo = (m) => {
    if (m.history.length <= 0) {
        return { history: m.history };
    }

    const cursor = m.history.length - 1;
    const state = m.history[cursor];
    if (state.index >= cursor) {
        return { history: m.history };
    }

    const prev = m.history[state.index + 1];
    const next = {
        ...prev,
        timestamp: new Date(),
    };
    m.history.push(next);

    return { history: m.history };
};

/**
 * newStateMachine creates and returns a finite state machine.
 *
 * @param   {Object} states
 * @returns {Object} The state machine
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

    /**
     * current returns the current state in the history.
     *
     * @returns {Object}
     */
    const current = () => m.history[m.history.length - 1];

    /**
     * history returns a copy of the current state history.
     *
     * @returns {Array}
     */
    const history = () => [...m.history];

    /**
     * transitionTo transitions the state machine with the given handler.
     *
     * @param {Function} handler
     * @param {*} payload
     *
     * @returns {*}
     */
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

    /**
     * undo transitions the state machine back one state.
     *
     * @returns {void}
     */
    const handleUndo = () => {
        m = {
            ...m,
            ...undo(m),
        };

        return current();
    };

    /**
     * redo transitions the state machine forward one state.
     *
     * @returns {void}
     */
    const handleRedo = () => {
        m = {
            ...m,
            ...redo(m),
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

export default newStateMachine;
