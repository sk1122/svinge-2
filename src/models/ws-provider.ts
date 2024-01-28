import { WebSocketProvider } from "web3";
import { ISubscription, ISubscriptionHandler, IWSConfig, IWSProvider, SubscriptionEvent, SubscriptionMapping } from "../types";

class SubscriptionHandler implements ISubscriptionHandler {
    public readonly id: string;
    private $listeners: { [event: string]: (...args: any[]) => void } = {}
    public get listeners() {
        return this.$listeners;
    }
    public emit: (event: SubscriptionEvent, message: any) => void = (event, message) => {
        this.$listeners[event]?.(message);
    };
    public on: (event: SubscriptionEvent, handler: (data: string) => void) => void = (event, handler) => {
        this.$listeners[event] = handler;
    }
    constructor(id: string) {
        this.id = id;
    }
}
export class WSProvider extends WebSocketProvider implements IWSProvider {
    public readonly address: string;
    private $subscribeOnReconnect: ISubscription[] = [];
    private $requests: number = 0;
    private $available: boolean = false;
    private _disableClientOnError?: (data: any) => boolean;
     public get subscribeOnReconnect() {
        return this.$subscribeOnReconnect;
    }
    public get requests(): number {
        return this.$requests;
    }
    public get available(): boolean {
        return this.$available;
    }
    private pendingSubscriptions: SubscriptionMapping = {};
    private subscriptionsMapping: { [id: string]: SubscriptionHandler } = {};
    public getSubscriptionById(id: string) {
        return this.subscriptionsMapping[id];
    }
    private async onMessageHandler() {
        this.on("message", (message: any) => {
            if (message.method === "eth_subscription") {
                const subscriptionId: string = message.params.subscription;
                const subscription = this.getSubscriptionById(subscriptionId);
                if (subscription) {
                    subscription.emit("data", message.params.result);
                }
            }
        });
    }
    public subscribe(subscription: ISubscription): Promise<ISubscriptionHandler>;
    public subscribe(subscription: ISubscription, disableAutoSubscribeOnReconnect: true): Promise<ISubscriptionHandler>;
    public subscribe(subscription: ISubscription, disableAutoSubscribeOnReconnect?: true): Promise<ISubscriptionHandler> {
        return new Promise(async (resolve, reject) => {
            const response = await this.request({ id: this.requests + 1, method: "eth_subscribe", params: [subscription.eventName, subscription.meta ? { fromBlock: subscription.meta.fromBlock, address: subscription.meta.address, topics: subscription.meta.topics } : undefined] });
            if (response.error) {
                reject(new Error(`Event: ${subscription.eventName}\n${response.error}`));
                return;
            }
            if (!disableAutoSubscribeOnReconnect) {
                const _subscriptionStr = JSON.stringify(subscription);
                if(!this.$subscribeOnReconnect.find(subscription => JSON.stringify(subscription) === _subscriptionStr)) {
                    this.$subscribeOnReconnect.push(subscription);
                }
            }
            const handler = new SubscriptionHandler(response.result);
            this.subscriptionsMapping[response.result] = handler;
            resolve(handler);
        });
    }
    private init() {
        this.on("connect", async (data) => {
            this.$available = true;
            console.log("connected");
            for (const subscription of this.subscribeOnReconnect) {
                this.subscribe(subscription);
            }
            this.onMessageHandler();
        });
        this.on("close", () => {
            this.$available = false;
            for (let subscription in this.subscriptionsMapping) {
                delete this.subscriptionsMapping[subscription];
            }
        });
        this.on("error", (error: any ) => {
            console.log("on error", error);
            if (this._disableClientOnError && this._disableClientOnError(error)) {
                this.$available = false;
                try {
                    this.disconnect();
                } catch (error) { }
                this.$available = false; // to make sure its false in term of the ws tries to reconnect while is manually disconnecting
            }
        })
    }

    constructor(address: string, clientOptions?: IWSConfig["client"], reconnect?: IWSConfig["reconnect"], disableClientOnError?: IWSConfig["disableClientOnError"]) {
        super(address, clientOptions, reconnect);
        this.address = address;
        this._disableClientOnError = disableClientOnError;
        this.init();
    }
}