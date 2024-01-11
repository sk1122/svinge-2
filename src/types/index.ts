import { ClientRequestArgs } from "http";
import { WebSocketProvider } from "web3";
import { ClientOptions } from "ws";

export type ReconnectOptions = {
    autoReconnect: boolean;
    delay: number;
    maxAttempts: number;
};
export interface RPC {
    avgResponse: number
    url: string
    responses: any[]
    connections: number
    weight?: number
}
export interface IHTTPConfig {
    maxConnections: number;
    maxRetries: number;
    cache?: CacheOptions;
}
export interface IWSConfig extends IHTTPConfig {
    cache: undefined;
    reconnect: ReconnectOptions;
    client: ClientOptions | ClientRequestArgs;
    disableClientOnError: (error: any) => boolean;
}
export interface ResponseResult {
    method: string
    params?: string[]
    result: string
    start: Date
}
export interface CacheOptions {
    caching: boolean
    cacheClear: number
    excludeMethods: string[]
}
export type SubscriptionMapping = {
    [id: string]: ISubscription;
}
export type SubscriptionEvent = "data";
export interface ISubscriptionHandler {
    id: string;
    on: (event: SubscriptionEvent, handler: (data: any) => void) => void;
}
export interface IWSProvider extends WebSocketProvider {
    address: string;
    available: boolean;
    requests: number;
    subscribeOnReconnect: ISubscription[];
    subscribe(subscription: ISubscription): Promise<ISubscriptionHandler>;
    getSubscriptionById(id: string): ISubscriptionHandler | undefined;
}
export interface ISubscriptionMeta {
    address?: string;
    fromBlock?: string;
    topics?: string[];
}
export interface ISubscription {
    eventName: string;
    meta?: ISubscriptionMeta;
}
