import {
  JSONRPCProtocol,
  JSONRPCID,
  JSONRPCParams,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCRemoteError,
} from "./models";

export type SendRequest<ClientContext> = (
  payload: JSONRPCRequest,
  ClientContext?: ClientContext
) => Promise<JSONRPCResponse>;

export type CreateID = () => JSONRPCID;

export class JSONRPCClient<ClientContext = void> {
  private id: number;

  constructor(
    private readonly _send: SendRequest<ClientContext>,
    private readonly createID?: CreateID
  ) {
    this.id = 0;
  }

  /**
   * Invoke a remote procedure using JSON-RPC and return the result. Throws a `JSONRPCRemoteError` if the transport between the client and server was successful but the server failed to execute. Doesn't wrap or rethrow any errors thrown by the request sender function passed to this `JSONRPCClient` object.
   *
   * @param method The name of the method to invoke
   * @param params The parameters (arguments) to send to the remote method
   * @param context An optional context object to pass into the send function passed to this JSONRPCClient object
   * @returns The result of invoking the remote method, the shape of which is defined by the server
   */
  async request(
    method: string,
    params?: JSONRPCParams,
    context?: ClientContext
  ): Promise<any> {
    const request: JSONRPCRequest = {
      jsonrpc: JSONRPCProtocol,
      method,
      params,
      id: this._createID(),
    };

    const response = await this.send(request, context);

    if (!response) {
      throw new Error(
        "JSONRPCClient internal error: No response returned from send function passed to constructor."
      );
    }

    if (response.result !== undefined && !response.error) {
      return response.result;
    } else if (response.result === undefined && response.error) {
      throw new JSONRPCRemoteError(
        response.error.message,
        response.error.code,
        response,
        response.error.data
      );
    } else {
      // this should never happen: we shouldn't get back a defined result with an error, or an undefined result and undefined error.
      throw new Error(
        "JSONRPCClient internal error: An unexpected error occurred, result/error response didn't make sense"
      );
    }
  }

  /**
   * Fire and forget a remote procedure invocation using JSON-RPC. Doesn't return a result, and doesn't check to see if the remote execution was successful.
   *
   * @param method The name of the method to invoke
   * @param params The parameters (arguments) to send to the remote method
   * @param context An optional context object to pass into the send function passed to this JSONRPCClient object
   */
  async notify(
    method: string,
    params?: JSONRPCParams,
    context?: ClientContext
  ): Promise<void> {
    await this.send(
      {
        jsonrpc: JSONRPCProtocol,
        method,
        params,
      },
      context as ClientContext
    );
  }

  private send(
    payload: any,
    context?: ClientContext
  ): Promise<JSONRPCResponse> {
    return this._send(payload, context);
  }

  private _createID(): JSONRPCID {
    if (this.createID) {
      return this.createID();
    } else {
      return ++this.id;
    }
  }
}
