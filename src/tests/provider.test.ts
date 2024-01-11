import { WSProvider } from "../models/ws-provider";
import { RoundRobinWS } from "../round-robin-ws";
(async () => {
    const subscriptions = [{ eventName: "logs", meta: {} }];
    const roundRobin = new RoundRobinWS({
        client: {},
        disableClientOnError: (error) => {
            return String(error).includes("429");
        },
        maxRetries: 15
    });
    roundRobin.init([
        "wss://eth-mainnet.nodereal.io/ws/v1/YOUR_NODEREAL_API_KEY"
    ]).then(e => e.subscribe(subscriptions[0]).then(subscription => {
        console.log("subscribed to", subscription.id);
        subscription.on("data", (data) => {
            console.log("data from", e.options, "data:", data);
        });
    }));
    // new WSProvider("wss://eth-mainnet.nodereal.io/ws/v1/YOUR_NODEREAL_API_KEY").subscribe(subscriptions[0]).then(subscription => {
    //     console.log("subscribed to", subscription.id);
    //     subscription.on("data", (data) => {
    //         // console.log("on data subscription", data, typeof data);

    //     })
    // });
})();