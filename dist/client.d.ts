import { JSONRPCID, JSONRPCParams, JSONRPCRequest, JSONRPCResponse } from "./models";
export declare type SendRequest<ClientContext> = (payload: JSONRPCRequest, ClientContext?: ClientContext) => Promise<JSONRPCResponse>;
export declare type CreateID = () => JSONRPCID;
export declare class JSONRPCClient<ClientContext = void> {
    private readonly _send;
    private readonly createID?;
    private id;
    constructor(_send: SendRequest<ClientContext>, createID?: CreateID | undefined);
    /**
     * Invoke a remote procedure using JSON-RPC and return the result. Throws a `JSONRPCRemoteError` if the transport between the client and server was successful but the server failed to execute. Doesn't wrap or rethrow any errors thrown by the request sender function passed to this `JSONRPCClient` object.
     *
     * @param method The name of the method to invoke
     * @param params The parameters (arguments) to send to the remote method
     * @param context An optional context object to pass into the send function passed to this JSONRPCClient object
     * @returns The result of invoking the remote method, the shape of which is defined by the server
     */
    request(method: string, params?: JSONRPCParams, context?: ClientContext): Promise<any>;
    /**
     * Fire and forget a remote procedure invocation using JSON-RPC. Doesn't return a result, and doesn't check to see if the remote execution was successful.
     *
     * @param method The name of the method to invoke
     * @param params The parameters (arguments) to send to the remote method
     * @param context An optional context object to pass into the send function passed to this JSONRPCClient object
     */
    notify(method: string, params?: JSONRPCParams, context?: ClientContext): Promise<void>;
    private send;
    private _createID;
}
