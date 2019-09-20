import {
    newStateMachine,
    currentState,
    transitionTo,
    undo,
    redo,
} from '../index';

test('can transition between states', () => {
    const expected = 'end';
    let fsm = newStateMachine({
        start: (m, payload) => transitionTo(fsm, m.states.end, payload),
        end: () => expected,
    });

    fsm = transitionTo(fsm, fsm.states.start, 'start');
    const actual = currentState(fsm).state;

    expect(actual).toBe(expected);
    expect(fsm.history.length).toBe(2);
});

test('can undo transition from state', () => {
    let fsm = newStateMachine({
        start: (m, payload) => transitionTo(fsm, m.states.end, payload),
        end: () => 'end',
    });

    const expected = 'start';
    fsm = transitionTo(fsm, fsm.states.start, expected);
    fsm = undo(fsm);
    const actual = currentState(fsm).state;

    expect(actual).toBe(expected);
    expect(fsm.history.length).toBe(2);
});

test('can redo transition from state', () => {
    const expected = 'end';
    let fsm = newStateMachine({
        start: (m, payload) => transitionTo(fsm, m.states.end, payload),
        end: () => expected,
    });

    fsm = transitionTo(fsm, fsm.states.start, 'start');
    fsm = undo(fsm);
    fsm = redo(fsm);
    const actual = currentState(fsm).state;

    expect(actual).toBe(expected);
    expect(fsm.history.length).toBe(2);
});

