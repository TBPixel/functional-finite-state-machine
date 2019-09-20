const StateMachine = require('./lib/StateMachine');

module.exports = {
    newStateMachine: StateMachine.default,
    currentState: StateMachine.CurrentState,
    transitionTo: StateMachine.TransitionTo,
    undo: StateMachine.Undo,
    redo: StateMachine.Redo,
};
