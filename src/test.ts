import { Readable } from 'stream';
import { EventEmitter } from 'events'
var FeedMe = require('feedme')

import { createSimpleHttpProvider, Miner } from './miner';

let URLS = [
    "http://www.feedforall.com/sample.xml"
]

function parseRssStream(stream: Readable, item: {(item: any)}, done: Function, ...args: any[]): void {
    let parser = new FeedMe()
    parser.on('item', item)
    parser.on('end', done)
    stream.pipe(parser)
}

function main() {
    new Miner(createSimpleHttpProvider(URLS), parseRssStream)
        .on('data', (data) => console.log(data))
        .on('complete', () => console.log('done'))
}

main()