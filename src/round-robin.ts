import { IHTTPConfig, ResponseResult, RPC } from "./types"
import { request as axios } from "./helper"

export class RoundRobin {
    public queue: RPC[] = []
    public path = ''
    public responseResults: { [key: string]: ResponseResult } = {}
    public options: IHTTPConfig = {
        maxConnections: 5,
        maxRetries: 5
    }

    constructor(options: IHTTPConfig) {
        this.options = options
    }

    sortQueue() {
        return this.queue.sort((a, b) => (a.avgResponse - b.avgResponse) || (a.connections - b.connections))
    }

    async init(rpcList: string[]) {
        for (let i = 0; i < rpcList.length; i++) {
            const url = rpcList[i]
            const res = await axios({
                url,
                data: {
                    id: 1,
                    jsonrpc: "2.0",
                    method: "eth_chainId"
                }
            })

            this.queue.push({
                avgResponse: Number(res.headers.elapsedTime),
                url,
                responses: [{
                    url,
                    response: Number(res.headers.elapsedTime)
                }],
                connections: 0,
                weight: 0
            })
        }

        this.queue = this.sortQueue()

        this.path = this.queue[0].url

        return this.queue
    }

    public updateQueue = (idx: number, val: RPC) => {
        // console.log(idx, val)
        this.queue[idx] = val

        if (this.queue[0].responses.length >= 5) {
            const res = this.queue.shift() as RPC
            this.queue.push(res)
        }

        this.path = this.queue[0].url
    }

    storeResult(result: ResponseResult) {
        this.responseResults[result.method] = result
    }

    public async sendAsync(request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void): Promise<any> {
        const url = this.queue[0].url
        const connections = this.queue[0].connections

        this.updateQueue(0, {
            ...this.queue[0],
            connections: connections + 1
        })

        // console.log(this.queue, request.method)
        const res = await axios({
            url,
            data: {
                id: 1,
                jsonrpc: "2.0",
                method: request.method,
                params: request.params
            }
        })

        let responses = this.queue[0].responses

        responses.push({
            url,
            response: Number(res.headers.elapsedTime)
        })

        this.updateQueue(0, {
            ...this.queue[0],
            responses,
            connections: connections
        })

        const data = await res.data

        return data.result
    }

    public async send(request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void): Promise<any> {
        const url = this.queue[0].url
        const connections = this.queue[0].connections

        this.updateQueue(0, {
            ...this.queue[0],
            connections: connections + 1
        })

        // console.log(this.queue, request.method)
        const res = await axios({
            url,
            data: {
                id: 1,
                jsonrpc: "2.0",
                method: request.method,
                params: request.params
            }
        })

        let responses = this.queue[0].responses

        responses.push({
            url,
            response: Number(res.headers.elapsedTime)
        })

        this.updateQueue(0, {
            ...this.queue[0],
            responses,
            connections: connections
        })

        const data = await res.data

        return data.result
    }

    public async request(request: { method: string, params?: Array<any> }): Promise<any> {
        if (this.options.cache && this.options.cache.caching && !(this.options.cache.excludeMethods.includes(request.method))) {
            const result = this.responseResults[request.method]
            if (result) {
                const timeSpent = new Date().getTime() - result.start.getTime()

                if (timeSpent <= this.options.cache.cacheClear) {
                    if (request.params && result.params?.sort().toString() === request.params.sort().toString()) {
                        return result.result
                    } else if (!request.params) {
                        return result.result
                    }
                } else {
                    delete this.responseResults[request.method]
                }
            }

        }

        const url = this.queue[0].url
        const connections = this.queue[0].connections

        this.updateQueue(0, {
            ...this.queue[0],
            connections: connections + 1
        })

        for (let i = 0; i < this.options.maxRetries; i++) {
            const res = await axios({
                url,
                data: {
                    id: 1,
                    jsonrpc: "2.0",
                    method: request.method,
                    params: request.params
                }
            })

            if (res.status >= 400) {
                continue
            }

            let responses = this.queue[0].responses

            // console.log(this.queue, request.method)
            responses.push({
                url,
                response: Number(res.headers.elapsedTime)
            })

            let avgResponse = responses.slice().map(res => res.response).reduce((a, b) => a + b, 0) / responses.length


            this.updateQueue(0, {
                ...this.queue[0],
                avgResponse: avgResponse,
                responses: responses,
                connections: connections
            })

            const data = await res.data

            this.storeResult({
                method: request.method,
                params: request.params,
                result: data.result,
                start: new Date()
            })

            return data.result
        }
    }
}