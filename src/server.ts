import {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCParams,
  JSONRPCProtocol,
  JSONRPCID,
  JSONRPCErrorCode,
  createJSONRPCErrorResponse,
  isJSONRPCRequest,
} from "./models";

export type SimpleJSONRPCMethod<ServerContext> = (
  params?: Partial<JSONRPCParams>,
  ServerContext?: ServerContext
) => any;

export type JSONRPCMethod<ServerContext> = (
  request: JSONRPCRequest,
  ServerContext?: ServerContext
) => PromiseLike<JSONRPCResponse | null>;

export type ErrorDataGetter = (error: any) => any;

export interface Logger {
  info(message: string, ...others: any[]): void;
  warn(message: string, ...others: any[]): void;
  error(message: string, ...others: any[]): void;
}

export interface ServerOptions {
  getErrorData?: (error: any) => any;
  onError?: (error: any) => void;
  logger?: Logger;
}

const DefaultErrorCode = 0;

const createMethodNotFoundResponse = (id: JSONRPCID): JSONRPCResponse =>
  createJSONRPCErrorResponse(
    id,
    JSONRPCErrorCode.MethodNotFound,
    "Method not found"
  );

export class JSONRPCServer<ServerContext = void> {
  private nameToMethodDictionary: {
    [name: string]: JSONRPCMethod<ServerContext>;
  };

  logger: Logger | null;

  constructor(private readonly options: ServerOptions = {}) {
    this.nameToMethodDictionary = {};
    this.logger = options.logger || null;
  }

  /**
   * Adds a new method to be invoked by remote JSON-RPC clients.
   */
  addMethod(name: string, method: SimpleJSONRPCMethod<ServerContext>): void {
    this.nameToMethodDictionary = {
      ...this.nameToMethodDictionary,
      [name]: this.toJSONRPCMethod(method),
    };
  }

  /**
   * Processes an incoming JSON-RPC request.
   *
   * Returns an object suitable for JSON serialization with a response if the request merits a response, and returns null if no response is required. Nulls like this happen for JSON-RPC notifications.
   */
  async process(
    request: JSONRPCRequest,
    ServerContext?: ServerContext
  ): Promise<JSONRPCResponse | null> {
    if (!isJSONRPCRequest(request)) {
      const message = "Received an invalid JSON-RPC request";
      this.logger?.warn(message, request);
      throw new Error(message);
    }

    const method = this.nameToMethodDictionary[request.method];
    const isNotification = typeof request.id === "undefined";

    if (!method) {
      return isNotification ? null : createMethodNotFoundResponse(request.id!);
    }

    const response = await this.callMethod(method, request, ServerContext);
    return isNotification ? null : response;
  }

  private toJSONRPCMethod(
    method: SimpleJSONRPCMethod<ServerContext>
  ): JSONRPCMethod<ServerContext> {
    return async (
      request: JSONRPCRequest,
      ServerContext: ServerContext
    ): Promise<JSONRPCResponse | null> => {
      try {
        const result = await method(request.params, ServerContext);
        return mapResultToJSONRPCResponse(request.id, result);
      } catch (error) {
        return this.handleErrorAndCreateResponse(request.id, error);
      }
    };
  }

  private async callMethod(
    method: JSONRPCMethod<ServerContext>,
    request: JSONRPCRequest,
    ServerContext?: ServerContext
  ): Promise<JSONRPCResponse | null> {
    try {
      return await method(request, ServerContext);
    } catch (error) {
      return this.handleErrorAndCreateResponse(request.id, error);
    }
  }

  private handleErrorAndCreateResponse(id: JSONRPCID | undefined, error: any) {
    this.logger?.error("Error occurred handling json-rpc request", error);
    this.options.onError && this.options.onError(error);
    if (id !== undefined) {
      return createJSONRPCErrorResponse(
        id,
        DefaultErrorCode,
        (error && error.message) || "An unexpected error occurred",
        this.options.getErrorData ? this.options.getErrorData(error) : undefined
      );
    } else {
      return null;
    }
  }
}

const mapResultToJSONRPCResponse = (
  id: JSONRPCID | undefined,
  result: any
): JSONRPCResponse | null => {
  if (id !== undefined) {
    return {
      jsonrpc: JSONRPCProtocol,
      id,
      result: result === undefined ? null : result,
    };
  } else {
    return null;
  }
};
