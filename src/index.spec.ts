import "mocha";
import { expect } from "chai";
import { JSONRPCServer, JSONRPCClient } from ".";

describe("JSONRPCClient and JSONRPCServer", () => {
  let server: JSONRPCServer;
  let client: JSONRPCClient;

  beforeEach(() => {
    server = new JSONRPCServer();
    client = new JSONRPCClient(async (request) => {
      const result = await server.process(request);
      return result!;
    });
  });

  it("sending a request should resolve the result", async () => {
    server.addMethod("foo", () => "bar");

    const result = await client.request("foo");
    expect(result).to.equal("bar");
  });

  it("sending a request should reject with an error", async () => {
    server.addMethod("foo", async () => {
      throw new Error("test error");
    });

    try {
      await client.request("foo");
    } catch (error) {
      expect(error.message).to.equal("test error");
    }
  });

  it("sending a notification should send a notification", async () => {
    let received: string = "<nothing sent yet>";

    server.addMethod("foo", ([text]: any[]) => {
      received = text;
    });

    await client.notify("foo", ["bar"]);
    expect(received).to.equal("bar");
  });
});
