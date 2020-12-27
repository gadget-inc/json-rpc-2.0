# json-rpc-utils

Let your client and server talk over function calls under [JSON-RPC 2.0 spec](https://www.jsonrpc.org/specification).

This library is protocol agnostic, which is convienient if you're already using an `http` server like Express or Fastify, and you want to control how the request is passed off to this RPC system. If you want to re-use your authentication middleware, or your fancy JSON parser/serializer, or your tracing system, this is the library for you!

Features:

- Use over HTTP, WebSocket, TCP, UDP, inter-process, whatever else
  - Easy migration from HTTP to WebSocket, for example
- No external dependencies
  - Keep your package small
  - Stay away from dependency hell
- First-class TypeScript support (written in TypeScript)

## Install

`npm install --save json-rpc-utils`

## Example

The example uses HTTP for communication protocol, but it can be anything.

### Server

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-utils");

const server = new JSONRPCServer();

// Add methods, which have a name, and an implementation function.  The implementation function takes the JSON-RPC params and returns some kind of result or nothing at all. The implementation can be async too!
server.addMethod("echo", ({ text }) => text);
server.addMethod("log", ({ message }) => console.log(message));

const app = express();
app.use(bodyParser.json());

app.post("/json-rpc", async (req, res) => {
  const jsonRPCRequest = req.body;
  // server.process takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  const jsonRPCResponse = await server.process(jsonRPCRequest);

  // If response is absent, it was a JSON-RPC notification method (where no response is expected).
  // Respond with no content status (204).
  if (jsonRPCResponse) {
    res.json(jsonRPCResponse);
  } else {
    res.sendStatus(204);
  }
});

app.listen(80);
```

#### With authentication

To hook authentication into the API, inject custom params:

```javascript
const server = new JSONRPCServer();

// Use the second context argument to inject whatever information that method needs outside the regular JSON-RPC request.
server.addMethod(
  "echo",
  (params, context) => `${context.userID} said ${params.text}`
);

app.post("/json-rpc", async (req, res) => {
  const jsonRPCRequest = req.body;
  const userID = getUserID(req);

  // server.process takes an optional second parameter to pass context into the handler method
  const response = await server.process(jsonRPCRequest, { userID });
  if (jsonRPCResponse) {
    res.json(jsonRPCResponse);
  } else {
    res.sendStatus(204);
  }
});

const getUserID = (req) => {
  // Do whatever to get user ID out of the request
};
```

### Client

```javascript
import { JSONRPCClient } from "json-rpc-utils";

// JSONRPCClient needs to know how to send a JSON-RPC request.
// Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.
const client = new JSONRPCClient(async (jsonRPCRequest) =>
  const response = await fetch("http://localhost/json-rpc", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  })


    if (response.status === 200) {
      // Return the received a JSON-RPC response for processing by the client
      return await response.json()
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  })
);

// Use client.request to make a JSON-RPC request call.
// The function returns a promise of the result.
client
  .request("echo", { text: "Hello, World!" })
  .then((result) => console.log(result));

// Use client.notify to make a JSON-RPC notification call.
// By definition, JSON-RPC notification does not respond.
client.notify("log", { message: "Hello, World!" });
```

#### With authentication

Just like `JSONRPCServer`, you can inject custom context to `JSONRPCClient` as well:

```javascript
const client = new JSONRPCClient(
  // If it is a higher-order function, it passes the custom params to the returned function.
  (jsonRPCRequest, context) =>
    return await fetch("http://localhost/json-rpc", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${context.token}`, // Use the passed token
      },
      body: JSON.stringify(jsonRPCRequest),
    }).json()
);

// Pass the custom context as the third argument.
client.request("echo", { text: "Hello, World!" }, { token: "foo's token" });
client.notify("log", { message: "Hello, World!" }, { token: "foo's token" });
```

### Error handling

To respond an error, reject with an `Error`. On the client side, the promise will be rejected with an `Error` object with the same message.

```javascript
server.addMethod("fail", () =>
  Promise.reject(new Error("This is an error message."))
);

client.request("fail").then(
  () => console.log("This does not get called"),
  (error) => console.error(error.message) // Outputs "This is an error message."
);
```

The `error` object thrown by the client will be a `JSONRPCRemoteError` object if the server replies with a spec conforming JSON-RPC error response. If the server fails to reply with an appropriate response or any other internal error occurs, the error will be a plain old `Error` object.

`JSONRPCRemoteError` are a subclass of the standard `Error` object, so they have a `message` like normal errors, and the message will come from the server side error. The stack of a `JSONRPCRemoteError` object will be the client side local stack. These custom error objects also have the following properties:

- `code`, containing the JSON-RPC error code
- `data`, which if set on the server will contain auxiliary data for the error. This is supported by the JSON-RPC spec, but isn't set automatically. Users of this library on the server ust use the server's `getErrorData` option to send `data` with errors.
- `isJSONRPCRemoteError`, which is always `true`.

There's also an `isJSONRPCRemoteError` function exported from this package for detecting these errors in a forward compatible (and TypeScript type assert-y) way.

#### Server side error data

The `JSONRPCServer` class can be configured to send custom `data` alongside error responses. Pass a `getErrorData` function in the constructor options to the server. The function is passed any `error`s thrown by handlers, and should reply with a JSON serializable object.

```javascript
// as an example, send the server side error's stack in the error data
const server = new JSONRPCServer({
  getErrorData: (error) => {
    return {
      customData: true,
      errorStack: error.stack,
    };
  },
});

// ...

client.request("fail").then(
  () => {},
  (error) => console.error(error.data.stack) // Outputs the server side error's stack
);
```

## Build

`npm run build`

## Test

`npm test`

## Credits

This project started as a fork of [`json-rpc-utils`](https://github.com/shogowada/json-rpc-utils) by Shogo Wada! We forked to change how we handle error,s drop some backwards compatability, and improve performance by using `async/await`. Thanks Shogo for all the hard work!
