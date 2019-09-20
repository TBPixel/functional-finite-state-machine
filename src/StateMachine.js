const fsm = {
    isFSM: true,
    current: -1,
    history: [],
    states: {},
};

/**
 * NewStateMachine creates and returns a finite state machine.
 *
 * @param   {Object} states
 * @returns {Object} The state machine
 */
const NewStateMachine = (states) => ({
    ...fsm,
    states,
});

/**
 * TransitionTo transitions to another internal state
 *
 * @param {Object} stateMachine The finite state machine
 * @param {Function} state The state to transition to
 * @param {*} payload An optional payload
 * @returns {Object} The current state
 */
export const TransitionTo = ({ current, history, states }, handler, payload) => {
    const name = Object.keys(states).find((k) => states[k] === handler);
    if (!name) {
        throw new Error('failed to transition to an unknown state!');
    }

    const state = {
        name,
        handler,
        state: payload,
        timestamp: new Date(),
    };
    const index = history.push(state) - 1;

    const result = handler({ current, history, states }, payload);
    if (result.isFSM) {
        return result;
    }

    history.splice(index, 1, {
        ...state,
        state: result,
    });

    return {
        ...fsm,
        current: index,
        states,
        history,
    };
};

/**
 * CurrentState returns the last active state on the FSM, or null
 *
 * @param {Object} stateMachine
 * @returns {Object}
 */
export const CurrentState = ({ current, history }) => {
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
export const Undo = ({ current, history, states }) => {
    if (current <= 0 || history.length <= 0) {
        return { current, history, states };
    }

    return {
        ...fsm,
        current: current - 1,
        history,
        states,
    };
};

/**
 * Redo moves the state machine ahead one state, if it can, and returns a new state machine.
 *
 * @param {Object} machine The state machine
 * @returns {Object}
 */
export const Redo = ({ current, history, states }) => {
    if (current > history.length) {
        return { current, history, states };
    }

    return {
        ...fsm,
        current: current + 1,
        history,
        states,
    };
};

export default NewStateMachine;
