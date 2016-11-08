import { Readable } from "stream";
import { IncomingMessage } from "http";
import { EventEmitter } from "events"
import * as request from "request"
import * as Debug from "debug"
var FeedMe = require('feedme')

export class Miner<Type> {
    private eventEmitter: EventEmitter = new EventEmitter()
    private internalEventEmitter: EventEmitter = new EventEmitter()
    private debug = Debug("Miner")

    constructor(public provider: Provider, public shovel: Shovel<Type>) {
        this.mine()
    }

    on(event: string | symbol, callback: Function): Miner<Type> {
        this.eventEmitter.on(event, callback)
        return this
    }

    mine(...args: any[]): EventEmitter {
        this.internalEventEmitter.on("complete", () => {
            this.internalMine(args)
                .catch((reason) => {
                    throw(reason)
                })
        })
        this.internalEventEmitter.emit("complete")

        return this.eventEmitter
    }

    private async internalMine(...args: any[]): Promise<void> {
        let source: Readable

        source = await this.provider(...args)
        if (!source) {
            this.debug("Source exhausted")
            this.eventEmitter.emit("complete")
            return
        }

        this.shovel(source, (item) => {
            this.debug("data mined")
            this.eventEmitter.emit("data", item)
        }, () => {
            this.internalEventEmitter.emit("complete")
        })
    }
}

export interface Provider {
    (...args: any[]): Promise<Readable>
}

export interface Shovel<Type> {
    (stream: Readable, item: {(item: Type)}, done: Function, ...args: any[]): void
}

export function createSimpleHttpProvider(source: {(...args: any[]): string} | string[]): {(...args: any[]): Promise<Readable>} {
    let debug = Debug("SimpleHttpProvider")

    return async (...args: any[]): Promise<Readable> => {
        let url = Array.isArray(source) ? (source as any).pop() : source(args)

        if (!url) {
            return Promise.resolve(null)
        }

        debug("source: " + url)

        return new Promise<Readable>((resolve, reject) => {
            request(url)
                .on("response", (response) => {
                    debug("response: #" + response.statusCode)
                    response.pause()
                    resolve(response)
                })
                .on("error", (error) => {
                    reject(error)
                })
        })
    }
}