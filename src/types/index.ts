export interface RPC {
    avgResponse: number
    url: string
    responses: any[]
    connections: number
    weight?: number
}

export interface IConfig {
    maxConnections: number
    maxResponses: number
    maxRetries: number
    cache?: CacheOptions
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