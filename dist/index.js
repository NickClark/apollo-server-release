"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const apollo_server_express_1 = require("apollo-server-express");
__exportStar(require("./exports"), exports);
class ApolloServer extends apollo_server_express_1.ApolloServer {
    constructor(config) {
        super(config);
        this.cors = config && config.cors;
        this.onHealthCheck = config && config.onHealthCheck;
    }
    createServerInfo(server, subscriptionsPath) {
        const serverInfo = Object.assign(Object.assign({}, server.address()), { server,
            subscriptionsPath });
        let hostForUrl = serverInfo.address;
        if (serverInfo.address === '' || serverInfo.address === '::')
            hostForUrl = 'localhost';
        serverInfo.url = require('url').format({
            protocol: 'http',
            hostname: hostForUrl,
            port: serverInfo.port,
            pathname: this.graphqlPath,
        });
        serverInfo.subscriptionsUrl = require('url').format({
            protocol: 'ws',
            hostname: hostForUrl,
            port: serverInfo.port,
            slashes: true,
            pathname: subscriptionsPath,
        });
        return serverInfo;
    }
    applyMiddleware() {
        throw new Error('To use Apollo Server with an existing express application, please use apollo-server-express');
    }
    listen(...opts) {
        const _super = Object.create(null, {
            applyMiddleware: { get: () => super.applyMiddleware }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const app = express_1.default();
            app.disable('x-powered-by');
            _super.applyMiddleware.call(this, {
                app,
                path: '/',
                bodyParserConfig: { limit: '50mb' },
                onHealthCheck: this.onHealthCheck,
                cors: typeof this.cors !== 'undefined'
                    ? this.cors
                    : {
                        origin: '*',
                    },
            });
            const httpServer = http_1.default.createServer(app);
            this.httpServer = httpServer;
            if (this.subscriptionServerOptions) {
                this.installSubscriptionHandlers(httpServer);
            }
            yield new Promise(resolve => {
                httpServer.once('listening', resolve);
                httpServer.listen(...(opts.length ? opts : [{ port: 4000 }]));
            });
            return this.createServerInfo(httpServer, this.subscriptionsPath);
        });
    }
    stop() {
        const _super = Object.create(null, {
            stop: { get: () => super.stop }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.httpServer) {
                const httpServer = this.httpServer;
                yield new Promise(resolve => httpServer.close(resolve));
                this.httpServer = undefined;
            }
            yield _super.stop.call(this);
        });
    }
}
exports.ApolloServer = ApolloServer;
//# sourceMappingURL=index.js.map