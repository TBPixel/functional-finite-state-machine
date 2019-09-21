/**
 * transitionTo transitions to another internal state
 *
 * @param {Object} m The finite state machine
 * @param {Function} state The state to transition to
 * @param {*} payload An optional payload
 * @returns {Object}
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
 * @param {Object} machine The state machine.
 * @returns {Object} The new state machine.
 */
const undo = ({ history }) => {
    if (history.length <= 0) {
        return { history };
    }

    const cursor = history.length - 1;
    history.push({
        ...history[cursor - 1],
        timestamp: new Date(),
    });

    return {
        history,
    };
};

/**
 * redo moves the state machine ahead one state, if it can, and returns a new state machine.
 *
 * @param {Object} machine The state machine
 * @returns {Object}
 */
const redo = ({ history }) => {
    if (history.length <= 0) {
        return { history };
    }

    const cursor = history.length - 1;
    history.push({
        ...history[cursor],
        timestamp: new Date(),
    });

    return {
        history,
    };
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

    const current = () => m.history[m.history.length - 1];
    const history = () => [...m.history];

    const handleTransitionTo = (handler, payload) => {
        const localMachine = {
            ...m,
            transitionTo: handleTransitionTo,
        };

        return transitionTo(localMachine, handler, payload);
    };

    const handleUndo = () => {
        m = {
            ...m,
            ...undo(m),
        };
    };

    const handleRedo = () => {
        m = {
            ...m,
            ...redo(m),
        };
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
