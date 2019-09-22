# Functional Finite State Machine (FFSM)

<!-- [![Latest Version on Packagist](https://img.shields.io/packagist/v/TBPixel/xml-streamer.svg?style=flat-square)](https://packagist.org/packages/tbpixel/type-adapter)
[![Build Status](https://img.shields.io/travis/TBPixel/xml-streamer/master.svg?style=flat-square)](https://travis-ci.org/TBPixel/type-adapter)
 -->


#### Content

- [Installation](#installation)
- [Examples](#examples)
  - [Http Request](#http-request)
- [Rational](#rational)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [Support Me](#support-me)
- [License](#license)


## Installation

You can install this package via `npm` and `yarn`.

```bash
npm install ffsm
# or
yarn add ffsm
```


### Examples

Using `ffsm` is easy. The default export is aptly called `newStateMachine` (but feel free to name it whatever you'd like). Simply import the constructor and define out your states as an object of `key: Function` pairs!

```js
// stop-lights.js
import newStateMachine from 'ffsm';

const fsm = newStateMachine({
    green: ({ states, transitionTo }) => {
        console.log("green light!");
        return transitionTo(states.yellow);
    },
    yellow: ({ states, transitionTo }) => {
        console.log("yellow light!");
        return transitionTo(states.red);
    },
    red: ({ states }) => {
        console.log("red light!");
    },
});

fsm.transitionTo(fsm.states.green);
// "green light!"
// "yellow light!"
// "red light!"
```

The classic traffic light state machine demonstrates the emphasis on simplicity for `ffsm`. The FSM moves to it's initial state with `fsm.transitionTo(fsm.states.green)`, and then the internal handler is called. We destructure the state machine that's passed in, retrieving it's internal reference of `states` and the `transitionTo` function.

It's worth noting that `transitionTo` actually assigns a result to the relative state's `state` property, if one was given, otherwise it assings the optional `payload` passed to the handler.


#### HTTP Request

A clear use for the state machine would be handling an HTTP Request. You might have some special logic to display a "success" or "error" based on the result of an http callback. `ffsm` allows you to define conditional state transitions as part of your handler.

```js
// request-fsm.js
import newStateMachine from 'ffsm';

const fsm = newStateMachine({
    send: ({ states, transitionTo }, uri) => {
        const request = async () => fetch(uri);

        try {
            const response = await request();
        } catch (err) {
            return transitionTo(states.error, err);
        }

        if (response.status >= 400) {
            return transitionTo(states.fail, response);
        }

        return transitionTo(states.success, response);
    },
    fail: ({ states }, response) => {
        console.log(`request failed with status code: ${response.status}`);
        console.error(response.data);

        return response;
    },
    success: ({ states }, response) => {
        console.log('request succeeded!');
        console.log(response.data);

        return response;
    },
    error: ({ states }, error }) => {
        console.log('something went wrong unexpectedly!');
        console.error(error);

        return error;
    },
});
```

The above code is really easy to follow and understand. It has logical error handling, and it takes advantage of `async/await` while utilizing the strictly `synchronous` state machine. Not only that, this state machine is highly re-usable, since it makes HTTP requests for us.

To handle errors, we can simply call the state machine and check the resulting state:

```js
// request-fsm.js
const result = fsm.transitionTo(fsm.states.send, '/hello-world');

if (!result.name === 'success') {
    // handle error
} else {
    // handle success
}
```

The result of the `fsm` is always the last executed state. This makes it easy for us to check the results, should we need to.

The returned state has a `name` key that matches the key of the handler. If you want to perform some additional validation checks, you can simply verify that key and do some extra handling. Though I'd recommend instead handling that logic within each state instead.


## Rational

With the advent of great finite state machine (FSM) packages like [Xstate](https://github.com/davidkpiano/xstate#readme) and [Machina JS](http://machina-js.org/), not to mention dozens of others, it's fair to question why I've created *yet another FSM*. `ffsm` was created because the public API's were too verbose and classical for my tastes. Don't get me wrong, `xstate` is a rock solid FSM, but it's API is not very pragmatic.

`ffsm` attempts to address that concern by providing an API which is function-first, allowing states to handle their own transitions internally. `ffsm` also tries to be different by keeping it's API very minimal and simple.


### Limitations

Due to the design of this FSM, there are some limitations.

- `states` *must* be synchronous.
- Each `state` *must* handle it's own transitions.
- `ffsm` has no concept of a "start" state or an "end" state, and so you must be wary of infinite loops.


## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.


### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.


### Support Me

Hi! I'm a developer living in Vancouver. If you wanna support me, consider following me on [Twitter @TBPixel](https://twitter.com/TBPixel), or if you're super generous [buying me a coffee](https://ko-fi.com/tbpixel) :).


## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
