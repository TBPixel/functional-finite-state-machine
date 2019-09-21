import newStateMachine from '../build/index';

const testStates = {
    foo: ({ states, transitionTo }) => transitionTo(states.bar, 'foo'),
    bar: ({ states, transitionTo }, payload) => transitionTo(states.baz, `${payload}-bar`),
    baz: (_, payload) => `${payload}-baz`,
};

test('can transition between states', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);

    const actual = fsm.current().state;
    expect(actual).toBe('foo-bar-baz');
    expect(fsm.history().length).toBe(3);
});

test('can undo transition from state', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    fsm.undo();

    const actual = fsm.current().state;
    expect(actual).toBe('foo-bar');
    expect(fsm.history().length).toBe(4);
});

test('can redo transition from state', () => {
    const fsm = newStateMachine(testStates);
    fsm.transitionTo(fsm.states.foo);
    fsm.redo();

    const actual = fsm.current().state;
    expect(actual).toBe('foo-bar-baz');
    expect(fsm.history().length).toBe(4);
});
