import { describe, beforeEach, it } from "mocha";
import { expect } from "chai";
import { JSONRPCServer, JSONRPCProtocol } from ".";
import { JSONRPCErrorCode, JSONRPCResponse } from "./models";

describe("JSONRPCServer", () => {
  interface ServerContext {
    userID: string;
  }

  let server: JSONRPCServer<ServerContext>;

  beforeEach(() => {
    server = new JSONRPCServer();
  });

  describe("having an echo method", () => {
    type Params = { text: string };

    beforeEach(() => {
      server.addMethod(
        "echo",
        ({ text }: Params, ServerContext?: ServerContext) => {
          if (ServerContext) {
            return `${ServerContext.userID} said ${text}`;
          } else {
            return text;
          }
        }
      );
    });

    describe("receiving a request to the method", () => {
      it("should echo the text", async () => {
        const response = await server.process({
          jsonrpc: JSONRPCProtocol,
          id: 0,
          method: "echo",
          params: { text: "foo" },
        });

        expect(response).to.deep.equal({
          jsonrpc: JSONRPCProtocol,
          id: 0,
          result: "foo",
        });
      });
    });

    describe("receiving a request to the method with user ID", () => {
      it("should echo the text with the user ID", async () => {
        const response = await server.process(
          {
            jsonrpc: JSONRPCProtocol,
            id: 0,
            method: "echo",
            params: { text: "foo" },
          },
          { userID: "bar" }
        );

        expect(response).to.deep.equal({
          jsonrpc: JSONRPCProtocol,
          id: 0,
          result: "bar said foo",
        });
      });
    });
  });

  describe("responding undefined", () => {
    it("should response with null result", async () => {
      server.addMethod("ack", () => undefined);

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "ack",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        result: null,
      });
    });
  });

  describe("throwing", () => {
    it("should respond error", async () => {
      server.addMethod("throw", () => {
        throw new Error("Test throwing");
      });

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "throw",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        error: {
          code: 0,
          message: "Test throwing",
        },
      });
    });
  });

  describe("rejecting", () => {
    it("should respond error", async () => {
      server.addMethod("reject", async () => {
        throw new Error("Test rejecting");
      });

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "reject",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        error: {
          code: 0,
          message: "Test rejecting",
        },
      });
    });
  });

  describe("with an onError option", () => {
    let onErrorArgs: any = null;

    beforeEach(() => {
      onErrorArgs = null;
      server = new JSONRPCServer({
        onError: (...args) => {
          onErrorArgs = args;
        },
      });
    });

    it("should call the onError callback with the error", async () => {
      const error = new Error("Test rejecting");

      server.addMethod("reject", async () => {
        throw error;
      });

      await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "reject",
      });

      expect(onErrorArgs[0]).to.equal(error);
    });
  });

  describe("with a getErrorData option", () => {
    beforeEach(() => {
      server = new JSONRPCServer({
        getErrorData: (error) => ({ testErrorData: true }),
      });
    });

    it("should respond with the error and data if the handler throws synchronously", async () => {
      server.addMethod("throw", () => {
        throw new Error("Test throwing");
      });

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "throw",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        error: {
          code: 0,
          message: "Test throwing",
          data: { testErrorData: true },
        },
      });
    });

    it("should respond with the error and data if the handler throws asnychronously", async () => {
      server.addMethod("reject", async () => {
        await Promise.resolve(); // forces a nextTick()
        throw new Error("Test rejecting");
      });

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "reject",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        error: {
          code: 0,
          message: "Test rejecting",
          data: { testErrorData: true },
        },
      });
    });
  });

  describe("responding to a notification", () => {
    it("should not respond", async () => {
      server.addMethod("foo", () => "foo");

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        method: "foo",
      });

      expect(response).to.be.null;
    });
  });

  describe("error on a notification", () => {
    it("should throw", async () => {
      server.addMethod("foo", async () => {
        throw new Error("foo");
      });

      try {
        await server.process({
          jsonrpc: JSONRPCProtocol,
          method: "foo",
        });
      } catch (error) {
        expect(error.message).to.equal("foo");
      }
    });
  });

  describe("responding with strange values", () => {
    it("should respond with null", async () => {
      server.addMethod("foo", async () => null);

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "foo",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        result: null,
      });
    });

    it("should respond with undefined", async () => {
      server.addMethod("foo", async () => undefined);

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "foo",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        result: null,
      });
    });

    it("should respond with 0", async () => {
      server.addMethod("foo", async () => 0);

      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "foo",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        result: 0,
      });
    });
  });

  describe("receiving a request to an unknown method", () => {
    it("should respond error", async () => {
      const response = await server.process({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        method: "foo",
      });

      expect(response).to.deep.equal({
        jsonrpc: JSONRPCProtocol,
        id: 0,
        error: {
          code: JSONRPCErrorCode.MethodNotFound,
          message: "Method not found",
        },
      });
    });
  });

  describe("receiving an invalid request", () => {
    it("should throw", async () => {
      try {
        await server.process({} as any);
      } catch (error) {
        expect(error.message).not.to.be.undefined;
      }
    });
  });
});
