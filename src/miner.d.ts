import { Readable } from "stream";
import { EventEmitter } from "events";
export declare class Miner<Type> {
    provider: Provider;
    shovel: Shovel<Type>;
    private eventEmitter;
    private internalEventEmitter;
    private debug;
    constructor(provider: Provider, shovel: Shovel<Type>);
    on(event: string | symbol, callback: Function): Miner<Type>;
    mine(...args: any[]): EventEmitter;
    private internalMine(...args);
}
export interface Provider {
    (...args: any[]): Promise<Readable>;
}
export interface Shovel<Type> {
    (stream: Readable, item: {
        (item: Type);
    }, done: Function, ...args: any[]): void;
}
export declare function createSimpleHttpProvider(source: {
    (...args: any[]): string;
} | string[]): {
    (...args: any[]): Promise<Readable>;
};
