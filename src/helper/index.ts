import axios from "axios"

export const request = async ({
    url,
    data
}: {
    url: string,
    data: {
        id: string | number,
        jsonrpc: string,
        method: string,
        params?: any
    }
}) => {
    const API = axios.create({
        baseURL: url
    })

    API.interceptors.request.use(
        config => {
            const newConfig = { ...config }
            // @ts-ignore: Object is possibly 'null'.
            newConfig.headers['startTime'] = new Date().toISOString()
            return newConfig
        }
    )

    API.interceptors.response.use(
        response => {
            const start = new Date(response.headers?.date?.toString() as string)

            const end = new Date()

            const elapsedTime = (end.getTime() - start.getTime()) / 1000

            response.headers['elapsedTime'] = elapsedTime.toString()

            return response
        }
    )

    // console.log(`${data.method} -> ${url}`)

    const res = await API({
        url: url,
        method: 'POST',
        data: data
    })

    return res
}