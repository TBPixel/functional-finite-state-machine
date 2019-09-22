import newStateMachine from '../index';

const testStates = {
    foo: ({ states, transitionTo }) => transitionTo(states.bar, 'foo'),
    bar: ({ states, transitionTo }, payload) => transitionTo(states.baz, `${payload}-bar`),
    baz: (_, payload) => `${payload}-baz`,
};

test('can transition between states', () => {
    const fsm = newStateMachine(testStates);
    const actual = fsm.transitionTo(fsm.states.foo);

    expect(actual.state).toBe('foo-bar-baz');
    expect(fsm.history().length).toBe(3);
});

test('can undo transition from state', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    const actual = fsm.undo();

    expect(actual.state).toBe('foo-bar');
    expect(fsm.history().length).toBe(4);
});

test('can undo multiple times', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    fsm.undo();
    const actual = fsm.undo();

    expect(actual.state).toBe('foo');
    expect(fsm.history().length).toBe(5);
});

test('cannot undo infinitely', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    fsm.undo();
    fsm.undo();
    const actual = fsm.undo();

    expect(actual.state).toBe('foo');
    expect(fsm.history().length).toBe(5);
});

test('can redo transition from state', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    fsm.undo();
    fsm.undo();
    const actual = fsm.redo();

    expect(actual.state).toBe('foo-bar');
    expect(fsm.history().length).toBe(6);
});

test('can redo multiple times', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    fsm.undo();
    fsm.undo();
    fsm.redo();
    const actual = fsm.redo();

    expect(actual.state).toBe('foo-bar-baz');
    expect(fsm.history().length).toBe(7);
});

test('cannot redo infinitely', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    const actual = fsm.redo();

    expect(actual.state).toBe('foo-bar-baz');
    expect(fsm.history().length).toBe(3);
});

test('cannot transition to unexpected state', () => {
    const fsm = newStateMachine(testStates);

    expect(() => {
        fsm.transitionTo({ foo: () => null });
    }).toThrow('failed to transition to an unknown state!');
});

test('cannot undo with an empty history', () => {
    const fsm = newStateMachine(testStates);
    fsm.undo();

    expect(fsm.history().length).toBe(0);
});

test('cannot redo with an empty history', () => {
    const fsm = newStateMachine(testStates);
    fsm.redo();

    expect(fsm.history().length).toBe(0);
});
