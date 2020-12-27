"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONRPCServer = void 0;
var models_1 = require("./models");
var DefaultErrorCode = 0;
var createMethodNotFoundResponse = function (id) {
    return models_1.createJSONRPCErrorResponse(id, models_1.JSONRPCErrorCode.MethodNotFound, "Method not found");
};
var JSONRPCServer = /** @class */ (function () {
    function JSONRPCServer(options) {
        this.getErrorData = options === null || options === void 0 ? void 0 : options.getErrorData;
        this.nameToMethodDictionary = {};
    }
    /**
     * Adds a new method to be invoked by remote JSON-RPC clients.
     */
    JSONRPCServer.prototype.addMethod = function (name, method) {
        var _a;
        this.nameToMethodDictionary = __assign(__assign({}, this.nameToMethodDictionary), (_a = {}, _a[name] = this.toJSONRPCMethod(method), _a));
    };
    /**
     * Processes an incoming JSON-RPC request.
     *
     * Returns an object suitable for JSON serialization with a response if the request merits a response, and returns null if no response is required. Nulls like this happen for JSON-RPC notifications.
     */
    JSONRPCServer.prototype.process = function (request, ServerContext) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var message, method, isNotification, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!models_1.isJSONRPCRequest(request)) {
                            message = "Received an invalid JSON-RPC request";
                            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn(message, request);
                            throw new Error(message);
                        }
                        method = this.nameToMethodDictionary[request.method];
                        isNotification = typeof request.id === "undefined";
                        if (!method) {
                            return [2 /*return*/, isNotification ? null : createMethodNotFoundResponse(request.id)];
                        }
                        return [4 /*yield*/, this.callMethod(method, request, ServerContext)];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, isNotification ? null : response];
                }
            });
        });
    };
    JSONRPCServer.prototype.toJSONRPCMethod = function (method) {
        var _this = this;
        return function (request, ServerContext) { return __awaiter(_this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, method(request.params, ServerContext)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, mapResultToJSONRPCResponse(request.id, result)];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.mapErrorToJSONRPCResponse(request.id, error_1)];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    };
    JSONRPCServer.prototype.callMethod = function (method, request, ServerContext) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, method(request, ServerContext)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.mapErrorToJSONRPCResponse(request.id, error_2)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    JSONRPCServer.prototype.mapErrorToJSONRPCResponse = function (id, error) {
        if (id !== undefined) {
            return models_1.createJSONRPCErrorResponse(id, DefaultErrorCode, (error && error.message) || "An unexpected error occurred", this.getErrorData ? this.getErrorData(error) : undefined);
        }
        else {
            return null;
        }
    };
    return JSONRPCServer;
}());
exports.JSONRPCServer = JSONRPCServer;
var mapResultToJSONRPCResponse = function (id, result) {
    if (id !== undefined) {
        return {
            jsonrpc: models_1.JSONRPCProtocol,
            id: id,
            result: result === undefined ? null : result,
        };
    }
    else {
        return null;
    }
};
