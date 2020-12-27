import { describe, beforeEach, it } from "mocha";
import { expect } from "chai";
import { JSONRPCClient, JSONRPCProtocol, JSONRPCRequest } from ".";

interface ClientContext {
  token: string;
}

describe("JSONRPCClient", () => {
  let client: JSONRPCClient<ClientContext>;

  let id: number;
  let lastRequest: JSONRPCRequest | undefined;
  let lastClientContext: ClientContext | undefined;
  let resolveClientRequest: ((value?: any) => void) | undefined;
  let rejectClientRequest: ((error: any) => void) | undefined;

  beforeEach(() => {
    id = 0;
    lastRequest = undefined;
    resolveClientRequest = undefined;
    rejectClientRequest = undefined;

    client = new JSONRPCClient(
      (request, ClientContext) => {
        lastRequest = request;
        lastClientContext = ClientContext;
        return new Promise((givenResolve, givenReject) => {
          resolveClientRequest = givenResolve;
          rejectClientRequest = givenReject;
        });
      },
      () => ++id
    );
  });

  describe("requesting", () => {
    let requestResult: any;
    let requestError: any;
    let requestPromise: PromiseLike<void>;

    beforeEach(() => {
      requestResult = undefined;
      requestError = undefined;

      requestPromise = client.request("foo", ["bar"]).then(
        (givenResult) => (requestResult = givenResult),
        (givenError) => (requestError = givenError)
      );
    });

    it("should send the request", () => {
      expect(lastRequest).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id,
        method: "foo",
        params: ["bar"],
      });
    });

    describe("succeeded on client side", () => {
      describe("and succeeded on server side too", () => {
        beforeEach(() => {
          resolveClientRequest!({
            jsonrpc: JSONRPCProtocol,
            id,
            result: "foo",
          });
          return requestPromise;
        });

        it("should resolve the result", () => {
          expect(requestResult).to.equal("foo");
        });
      });

      describe("and succeeded on server side with falsy but defined result", () => {
        beforeEach(() => {
          resolveClientRequest!({
            jsonrpc: JSONRPCProtocol,
            id,
            result: 0,
          });
          return requestPromise;
        });

        it("should resolve the result", () => {
          expect(requestResult).to.equal(0);
        });
      });

      describe("but failed on server side", () => {
        beforeEach(() => {
          resolveClientRequest!({
            jsonrpc: JSONRPCProtocol,
            id,
            error: {
              code: 0,
              message: "This is a test. Do not panic.",
              data: {
                test: true,
              },
            },
          });
          return requestPromise;
        });

        it("should reject with the error message", () => {
          expect(requestError.message).to.equal(
            "This is a test. Do not panic."
          );
          expect(requestError.code).to.equal(0);
          expect(requestError.data.test).to.equal(true);
        });
      });

      describe("but server responded invalid response", () => {
        describe("like having both result and error", () => {
          beforeEach(() => {
            resolveClientRequest!({
              jsonrpc: JSONRPCProtocol,
              id,
              result: "foo",
              error: {
                code: 0,
                message: "bar",
              },
            });
            return requestPromise;
          });

          it("should reject", () => {
            expect(requestError).to.not.be.undefined;
          });
        });

        describe("like not having both result and error", () => {
          beforeEach(() => {
            resolveClientRequest!({
              jsonrpc: JSONRPCProtocol,
              id,
            });
            return requestPromise;
          });

          it("should reject", () => {
            expect(requestError).to.not.be.undefined;
          });
        });
      });
    });

    describe("failed on client side", () => {
      beforeEach(() => {
        rejectClientRequest!(new Error("This is a test. Do not panic."));
        return requestPromise;
      });

      it("should reject the promise", () => {
        expect(requestResult).to.be.undefined;
        expect(requestError.message).to.equal("This is a test. Do not panic.");
      });
    });

    describe("failed on client side with no error object", () => {
      beforeEach(() => {
        rejectClientRequest!(undefined);
        return requestPromise;
      });

      it("should reject the promise", () => {
        expect(requestResult).to.be.undefined;
        expect(requestError).to.be.undefined;
      });
    });

    describe("failed on client side with an error object without message", () => {
      beforeEach(() => {
        rejectClientRequest!(new Error());
        return requestPromise;
      });

      it("should reject the promise", () => {
        expect(requestResult).to.be.undefined;
        expect(requestError).not.to.be.undefined;
      });
    });
  });

  describe("requesting with client params", () => {
    let expected: ClientContext;
    beforeEach(() => {
      expected = { token: "baz" };

      client.request("foo", undefined, expected);
    });

    it("should pass the client params to send function", () => {
      expect(lastClientContext).to.deep.equal(expected);
    });
  });

  describe("notifying", () => {
    beforeEach(() => {
      client.notify("foo", ["bar"]);
    });

    it("should send the notification", () => {
      expect(lastRequest).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        method: "foo",
        params: ["bar"],
      });
    });
  });

  describe("notifying with client params", () => {
    let expected: ClientContext;
    beforeEach(() => {
      expected = { token: "baz" };

      client.notify("foo", undefined, expected);
    });

    it("should pass the client params to send function", () => {
      expect(lastClientContext).to.deep.equal(expected);
    });
  });
});
