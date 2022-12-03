import { ethers } from "ethers";
import { request as axios } from "./helper";
import { IConfig, ResponseResult, RPC } from "./types";

export class LoadBalanceRPC {
    public queue: RPC[] = []
    public responseResults: { [key: string]: ResponseResult } = {}
    public path = ''
    public options: IConfig = {
        maxConnections: 5,
        maxResponses: 5,
        maxRetries: 3
    }
    
    constructor (options: IConfig) {
        this.options = options
    }

    sortQueue() {
        return this.queue.sort((a, b) => a.avgResponse - b.avgResponse)
    }

    storeResult(result: ResponseResult) {
        this.responseResults[result.method] = result
    }

    async init(rpcList: string[]) {
        for(let i = 0; i < rpcList.length; i++) {
            const url = rpcList[i]
            const que: RPC = {
                avgResponse: 0,
                url,
                responses: [],
                connections: 0,
                weight: 0
            }

            for(let j = 0; j < 3; j++) {
                const res = await axios({
                    url,
                    data: {
                        id: 1,
                        jsonrpc: "2.0",
                        method: "eth_chainId"
                    }
                })
                
                que.responses.push({
                    url,
                    response: Number(res.headers.elapsedTime)
                })

                que.avgResponse = (que.avgResponse + Number(res.headers.elapsedTime)) / que.responses.length
            }
            this.queue.push(que)
        }

        this.queue = this.sortQueue()
        
        this.path = this.queue[0].url

        return this.queue
    }

    public updateQueue = (idx: number, val: RPC) => {
        this.queue[idx] = val
        
        this.queue = this.sortQueue()

        if((this.queue[idx].connections >= this.options.maxConnections)) {
            const res = this.queue.shift() as RPC
            this.queue.push(res)
        }
        
        this.path = this.queue[0].url
        // console.log(this.queue[0], "we are at here")
    }

    public getQueue = () => {
        return this.queue
    }

    public async sendAsync(request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void): Promise<any> {
        const url = this.queue[0].url
        const connections = this.queue[0].connections

        this.updateQueue(0, {
            ...this.queue[0],
            connections: connections + 1
        })
        
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

        let avgResponse = responses.slice().map(res => res.response).reduce((a, b) => a + b, 0) / responses.length

        this.updateQueue(0, {
            ...this.queue[0],
            avgResponse,
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

        let avgResponse = responses.slice().map(res => res.response).reduce((a, b) => a + b, 0) / responses.length

        this.updateQueue(0, {
            ...this.queue[0],
            avgResponse,
            responses,
            connections: connections
        })

        const data = await res.data

        return data.result
    }

    public async request(request: { method: string, params?: Array<any> }, retries = 0): Promise<any> {
        if(this.options.cache && this.options.cache.caching && !(this.options.cache.excludeMethods.includes(request.method))) {
            const result = this.responseResults[request.method]
            if(result) {
                const timeSpent = new Date().getTime() - result.start.getTime()
    
                if(timeSpent <= this.options.cache.cacheClear) {
                    if(request.params && result.params?.sort().toString() === request.params.sort().toString()) {
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

        for(let i = 0; i < this.options.maxRetries; i++) {
            console.log(url, request.method)
            const res = await axios({
                url,
                data: {
                    id: 1,
                    jsonrpc: "2.0",
                    method: request.method,
                    params: request.params
                }
            })
            
            if(res.status >= 400) {
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