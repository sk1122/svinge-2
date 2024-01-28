<h1 align="center">Welcome to rpc-load-balancer 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/rpc-balancer" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/rpc-balancer.svg">
  </a>
  <a href="https://github.com/sk1122/rpc-load-balancer" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/sk1122\_" target="_blank">
    <img alt="Twitter: sk1122\_" src="https://img.shields.io/twitter/follow/sk1122\_.svg?style=social" />
  </a>
</p>

> Load Balance RPC Calls between multiple RPC Providers

### ✨ [Demo](https://github.com/sk1122/rpc-load-balancer)

## Install

```sh
yarn add rpc-balancer
```

## Usage

We've used 2 different algorithms to load balance rpc calls, so you can use any algorithm based on your needs, they are

- **Round Robin**
  - Switch RPC Provider after certain amount of responses
- **Dynamic Load Balancing**
  - Switch RPC Providers based on certain parameters like `avgResponse`, `connections`, `responses` etc

This package can also **cache** requests for certain amount of time and retry if request fails, you can configure all these options in the constructor.

- `maxConnections` - No of max active connections allowed for a RPC
- `maxResponses` - No of max responses for a connection before switching it out
- `maxRetries` - No of max retries allowed for a failed request
- `cache` - Cache Options
  - `caching` - True or False
  - `cacheClear` - Duration for cache
  - `excludeMethods` - JSON RPC methods to be omitted from caching

### Round Robin

```ts
import { RoundRobin } from 'rpc-balancer'
import { ethers } from 'ethers'

const balancer = new RoundRobin({
  maxConnections: 2,
  maxResponses: 2,
  maxRetries: 2,
  cache: {
    caching: true,
    cacheClear: 2000,
    excludeMethods: []
  }
})

await balancer.init(['RPC_LINKS'])

const provider = new ethers.providers.Web3Provider(balancer)
```

### Dynamic Load Balancing

```ts
import { LoadBalanceRPC } from 'rpc-balancer'
import { ethers } from 'ethers'

const balancer = new LoadBalanceRPC({
  maxConnections: 2,
  maxResponses: 2,
  maxRetries: 2,
  cache: {
    caching: true,
    cacheClear: 2000,
    excludeMethods: []
  }
})

await balancer.init(['RPC_LINKS'])

const provider = new ethers.providers.Web3Provider(balancer)
```

### Dynamic WebSocket Load Balancing


```ts
import { RoundRobinWS } from "rpc-balancer"
import { ethers } from 'ethers'

const balancer = new RoundRobinWS({
    maxRetries: 5, // Default is "5"
    client: {
      // WebSocket Client Options
    },
    {
      autoReconnect: true, // Default is "true"
      delay: 2000, // Default is "2000"
      maxAttempts: 100, // Too large to fit on the screen by default
    }
})

await balancer.init(["RPC_URLS_STARTS_WITH_WS_OR_WSS"])
balancer.subscribe({ // This will subscribe from all providers then give a single output on "data" callback
  eventName: "logs",
  meta: { // optional
    // Checkout https://ethereum.org/tr/developers/tutorials/using-websockets/#eth-subscribe
  }
}).then(subscription => {
  subscription.on("data", (data) => {
    let transactionHash = data.transactionHash;
    let from = data.from;
    console.log(`New transaction ${transactionHash} made by ${from}`);
    // transaction data, the transactions has the same transactionHash won't be emitted again.
  });
});

const provider = new ethers.providers.Web3Provider(balancer)
```

## Author

👤 **Satyam Kulkarni**

- Website: https://satyamkulkarni.xyz
- Twitter: [@sk1122\_](https://twitter.com/sk1122_)
- Github: [@sk1122](https://github.com/sk1122)
- LinkedIn: [@satyam-kulkarni](https://linkedin.com/in/satyam-kulkarni)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/sk1122/rpc-load-balancer/issues).

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
