import { JSONRPCRequest, JSONRPCResponse, JSONRPCParams } from "./models";
export declare type SimpleJSONRPCMethod<ServerContext> = (params?: Partial<JSONRPCParams>, ServerContext?: ServerContext) => any;
export declare type JSONRPCMethod<ServerContext> = (request: JSONRPCRequest, ServerContext?: ServerContext) => PromiseLike<JSONRPCResponse | null>;
export declare type ErrorDataGetter = (error: any) => any;
export interface Logger {
    info(message: string, ...others: any[]): void;
    warn(message: string, ...others: any[]): void;
}
export declare class JSONRPCServer<ServerContext = void> {
    private nameToMethodDictionary;
    getErrorData?: ErrorDataGetter;
    logger: Logger | null;
    constructor(options?: {
        getErrorData?: ErrorDataGetter;
    });
    /**
     * Adds a new method to be invoked by remote JSON-RPC clients.
     */
    addMethod(name: string, method: SimpleJSONRPCMethod<ServerContext>): void;
    /**
     * Processes an incoming JSON-RPC request.
     *
     * Returns an object suitable for JSON serialization with a response if the request merits a response, and returns null if no response is required. Nulls like this happen for JSON-RPC notifications.
     */
    process(request: JSONRPCRequest, ServerContext?: ServerContext): Promise<JSONRPCResponse | null>;
    private toJSONRPCMethod;
    private callMethod;
    private mapErrorToJSONRPCResponse;
}
