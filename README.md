Pine API
========

[![GitHub Release](https://img.shields.io/github/release/blockfirm/pine-api.svg?style=flat-square)](https://github.com/blockfirm/pine-api/releases)
[![Build Status](https://img.shields.io/travis/blockfirm/pine-api.svg?branch=master&style=flat-square)](https://travis-ci.org/blockfirm/pine-api)
[![Coverage Status](https://img.shields.io/coveralls/blockfirm/pine-api.svg?style=flat-square)](https://coveralls.io/r/blockfirm/pine-api)

REST API for [Pine](https://pinewallet.co) to interact with the bitcoin blockchain and network.

## Table of Contents

* [Dependencies](#dependencies)
* [Getting started](#getting-started)
* [Setting up push notifications](#setting-up-push-notifications)
  * [Send notifications to the official Pine app](#send-notifications-to-the-official-pine-app)
  * [Send notifications to your own app](#send-notifications-to-your-own-app)
* [Setting up the fiat rates service](#setting-up-the-fiat-rates-service)
* [API Docs](#api)
  * [Endpoints](#endpoints)
  * [Error handling](#error-handling)
  * [Rate limiting](#rate-limiting)
* [Use with Bitcoin testnet](#use-with-bitcoin-testnet)
* [Contributing](#contributing)
* [Licensing](#licensing)

## Dependencies

* [Node.js](https://nodejs.org) and [Restify](http://restify.com) for creating the REST API
* [btcd](https://github.com/btcsuite/btcd) as a bitcoin node for interacting with the bitcoin network and blockchain
* [Redis](https://redis.io) for caching device tokens and addresses that should be used for sending notifications and caching fiat rates
* [APN](https://developer.apple.com/notifications/) for sending push notifications to iOS devices (optional)
* [BitcoinAverage](https://bitcoinaverage.com) for getting the latest fiat exchange rates (*Developer Plan* required)

## Getting started

1. Install [btcd](https://github.com/btcsuite/btcd)
2. Start the btcd node with transaction and address indexing turned on:
    ```
    $ btcd --txindex --addrindex
    ```
3. Clone this repo:
    ```
    $ git clone https://github.com/blockfirm/pine-api.git
    $ cd pine-api
    ```
4. Install dependencies:
    ```
    $ npm install
    ```
5. Open `src/config.js` and enter your btcd RPC username and password

6. Start the API server in development mode:
    ```
    $ npm run dev
    ```
7. Or build it and run in production mode:
    ```
    $ npm run build
    $ npm start
    ```

## Setting up push notifications

There are two ways to set up push notifications; set it up with your own app with your own keys, or
send them to the official Pine app through Pine's official node.

Both methods requires [Redis](https://redis.io) to be installed and running.

### Send notifications to the official Pine app

**Note: This method will only work once Pine is released and has an official node to send notifications
through.**

This is the only way if you just want to host your own node but still want to use the Pine app from
the App Store and continue to get push notifications.

1. Open `src/config.js`
2. Uncomment `notifications.webhook`
3. Build and restart the server

Your node will now monitor the blockchain and trigger a webhook to Pine's node every time it finds
a matching transaction. No information other than the device token is sent to Pine's servers.

### Send notifications to your own app

If you are running the app from source you will need to create a new APN key and enter your
credentials in `config.js` to be able to receive push notifications.

1. [Create a new key](https://developer.apple.com/account/ios/authkey) in your Apple Developer account to be used with the Apple Push Notifications Service
2. Open `src/config.js`
3. Enter your key credentials (key path, key ID, and team ID) in `apn.token`
4. Enter your app's bundle ID in `apn.bundleId`
5. Build and restart the server

Your node will now monitor the blockchain and send a notification with the Apple Push Notifications Service
every time it finds a matching transaction.

## Setting up the fiat rates service

Fiat exchange rates are provided by [BitcoinAverage](https://bitcoinaverage.com) and updated every minute.
If you're setting up your own node you will need to create a BitcoinAverage account with the *Developer Plan*
or higher.

1. Create a BitcoinAverage account
2. Get your API key
3. Open `src/config.js`
4. Enter your key credentials (`publicKey` and `secretKey`) in `fiatRates.bitcoinAverage`
5. Build and restart the server

## API

### Endpoints

Endpoints for retrieving and submitting information to the bitcoin blockchain and network.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | [/v1/info](#get-v1info) | Get information about the server |
| GET | [/v1/bitcoin/transactions](#get-v1bitcointransactions) | Get transactions by address |
| POST | [/v1/bitcoin/transactions](#post-v1bitcointransactions) | Broadcast a signed transaction |
| GET | [/v1/bitcoin/transactions/:txid](#get-v1bitcointransactionstxid) | Get a specific transaction by its ID |
| GET | [/v1/bitcoin/fees/estimate](#get-v1bitcoinfeesestimate) | Get the current estimated transaction fee rate |
| GET | [/v1/bitcoin/fiatrates](#get-v1bitcoinfiatrates) | Get exchange rates for specific fiat currencies |
| POST | [/v1/bitcoin/subscriptions](#post-v1bitcoinsubscriptions) | Subscribe to push notifications for specified addresses |
| GET | [/v1/bitcoin/subscriptions/:deviceToken](#get-v1bitcoinsubscriptionsdevicetoken) | Get metadata about subscriptions for a device token |
| DELETE | [/v1/bitcoin/subscriptions/:deviceToken](#delete-v1bitcoinsubscriptionsdevicetoken) | Unsubscribe from all push notifications |
| POST | [/v1/notifications](#post-v1notifications) | Used by other nodes to send push notifications through an official Pine node |

### `GET` /v1/info

Returns information about the server.

#### Returns

```
{
  "isConnected": true, (boolean) Whether or not the server is connected to a bitcoin node
  "network": "testnet", (string) "mainnet" or "testnet"
  "blocks": n (integer) The number of blocks processed
}
```

### `GET` /v1/bitcoin/transactions

Scans the bitcoin blockchain for transactions matching a set of addresses.

#### Query String Parameters

| Name | Type | Description |
| --- | --- | --- |
| addresses | *string* | Comma-separated list of addresses to get transactions for. Maximum 20 addresses are allowed per request. |
| page | *integer* | What page to get transactions for. The number of transactions depends on the `page_size` parameter. |
| page_size | *integer* | Number of transactions to return per address for each page. Must be between 1 and 100 (defaults to 100). |
| reverse | *boolean* | `1` specifies that the transactions should be returned in reverse chronological order. Defaults to `0` (false). |

#### Returns

Returns the transactions together with extra vin data and other useful information about each transaction, e.g. whether it is pending or not. Here's an example return copied from <https://github.com/btcsuite/btcd/blob/master/docs/json_rpc_api.md#searchrawtransactions>:

```
[
    {
        "hex": "data", (string) hex-encoded transaction
        "txid": "hash", (string) the hash of the transaction
        "version": n, (numeric) the transaction version
        "locktime": n, (numeric) the transaction lock time
        "vin": [ the transaction inputs as json objects
        For coinbase transactions:
            {
                "coinbase": "data", (string) the hex-encoded bytes of the signature script
                "txinwitness": “data", (string) the witness stack for the input
                "sequence": n, (numeric) the script sequence number
            }
        For non-coinbase transactions:
            {
                "txid": "hash", (string) the hash of the origin transaction
                "vout": n, (numeric) the index of the output being redeemed from the origin transaction
                "scriptSig": { the signature script used to redeem the origin transaction
                    "asm": "asm", (string) disassembly of the script
                    "hex": "data", (string) hex-encoded bytes of the script
                }
                "prevOut": { data from the origin transaction output with index vout
                    "addresses": ["value",...], (array of string) previous output addresses
                    "value": n.nnn, (numeric) previous output value
                }
                "txinwitness": “data", (string) the witness stack for the input
                "sequence": n, (numeric) the script sequence number
            }, ...
        ],
        "vout": [ the transaction outputs as json objects
            {
                "value": n, (numeric) the value in BTC
                "n": n, (numeric) the index of this transaction output
                "scriptPubKey": { the public key script used to pay coins
                    "asm": "asm", (string) disassembly of the script
                    "hex": "data", (string) hex-encoded bytes of the script
                    "reqSigs": n, (numeric) the number of required signatures
                    "type": "scripttype" (string) the type of the script (e.g. 'pubkeyhash')
                    "addresses": [ the bitcoin addresses associated with this output
                        "address", (string) the bitcoin address
                        ...
                    ]
                }
            }, ...
        ],
        "blockhash": "hash" hash of the block the transaction is part of
        "confirmations": n, number of numeric confirmations of block
        "time": t, transaction time in seconds since the epoch
        "blocktime": t, block time in seconds since the epoch
    }, ...
]
```

### `POST` /v1/bitcoin/transactions

Broadcasts a transaction to the Bitcoin network. The transaction must be serialized in raw format
(https://bitcoin.org/en/developer-reference#raw-transaction-format).

#### Body

Encoded as JSON.

| Name | Type | Description |
| --- | --- | --- |
| transaction | *string* | Serialized and signed transaction in raw format. |

#### Returns

```
{
  "txid": "data" (string) The hash of the transaction
}
```

### `GET` /v1/bitcoin/transactions/:txid

Returns a specific transaction based on its id.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| txid | *string* | Transaction hash for the transaction to get. |

#### Returns

Returns the transaction together with extra vin data and other useful information, e.g. whether it is pending or not. Here's an example return copied from <https://github.com/btcsuite/btcd/blob/master/docs/json_rpc_api.md#getrawtransaction>:

```
{
    "hex": "data", (string) hex-encoded transaction
    "txid": "hash", (string) the hash of the transaction
    "version": n, (numeric) the transaction version
    "locktime": n, (numeric) the transaction lock time
    "vin": [ the transaction inputs as json objects
    For coinbase transactions:
        {
            "coinbase": "data", (string) the hex-encoded bytes of the signature script
            "txinwitness": “data", (string) the witness stack for the input
            "sequence": n, (numeric) the script sequence number
        }
    For non-coinbase transactions:
        {
            "txid": "hash", (string) the hash of the origin transaction
            "vout": n, (numeric) the index of the output being redeemed from the origin transaction
            "scriptSig": { the signature script used to redeem the origin transaction
                "asm": "asm", (string) disassembly of the script
                "hex": "data", (string) hex-encoded bytes of the script
            }
            "prevOut": { data from the origin transaction output with index vout
                "addresses": ["value",...], (array of string) previous output addresses
                "value": n.nnn, (numeric) previous output value
            }
            "txinwitness": “data", (string) the witness stack for the input
            "sequence": n, (numeric) the script sequence number
        }, ...
    ],
    "vout": [ the transaction outputs as json objects
        {
            "value": n, (numeric) the value in BTC
            "n": n, (numeric) the index of this transaction output
            "scriptPubKey": { the public key script used to pay coins
                "asm": "asm", (string) disassembly of the script
                "hex": "data", (string) hex-encoded bytes of the script
                "reqSigs": n, (numeric) the number of required signatures
                "type": "scripttype" (string) the type of the script (e.g. 'pubkeyhash')
                "addresses": [ the bitcoin addresses associated with this output
                    "address", (string) the bitcoin address
                    ...
                ]
            }
        }, ...
    ],
    "blockhash": "hash" hash of the block the transaction is part of
    "confirmations": n, number of numeric confirmations of block
    "time": t, transaction time in seconds since the epoch
    "blocktime": t, block time in seconds since the epoch
}
```

### `GET` /v1/bitcoin/fees/estimate

Estimates the transaction fee to be confirmed in the next number of blocks specified by `numberOfBlocks`.

#### Query String Parameters

| Name | Type | Description |
| --- | --- | --- |
| numberOfBlocks | *integer* | Number of blocks the transaction can wait until being confirmed. Defaults to 1. |

#### Returns

```
{
  "satoshisPerByte": 4.7 (number) The estimated fee per byte in satoshis
}
```

### `GET` /v1/bitcoin/fiatrates

Gets the current exchange rates for bitcoin in different fiat currencies.

#### Query String Parameters

| Name | Type | Description |
| --- | --- | --- |
| currencies | *string* | Comma-separated list of ISO 4217 codes. |

#### Returns

Map of fiat exchange rates for the specified currencies.

```
{
  "EUR": 3277.00, (number) The price of 1 BTC in EUR
  "SEK": 33900.68 (number) The price of 1 BTC in SEK
}
```

### `POST` /v1/bitcoin/subscriptions

An endpoint for subscribing to push notifications when new payments are received.
Currently only supports sending notifications using Apple Push Notification Service.

#### Body

Encoded as JSON.

| Name | Type | Description |
| --- | --- | --- |
| deviceToken | *string* | Device token to use when sending the notifications. |
| addresses | *array of strings* | Array of bitcoin addresses to subscribe to. Maximum 1000 addresses per request. |

### `GET` /v1/bitcoin/subscriptions/:deviceToken

Returns metadata about the subscriptions for the specified device token.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| deviceToken | *string* | Device token to get information about. |

#### Returns

```
{
  "numberOfSubscriptions": 3 (number) The number of subscriptions this device token has subscribed to
}
```

### `DELETE` /v1/bitcoin/subscriptions/:deviceToken

An endpoint for unsubscribing from all push notifications for the specified device token.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| deviceToken | *string* | Device token to unsubscribe. |

### `POST` /v1/notifications

Sends a push notification to an iOS device using the specified device token.

Used by other nodes that are not managed by Pine to still be able to send push notifications to the
official Pine app.

Rate limited to 2 requests per second with bursts up to 10 requests.

#### Body

Encoded as JSON.

| Name | Type | Description |
| --- | --- | --- |
| deviceToken | *string* | Device token to send the notification to. |

#### Returns

The response from [`apn.Provider#send()`](https://github.com/node-apn/node-apn/blob/master/doc/provider.markdown#class-apnprovider).

### Error handling

Errors are returned as JSON in the following format:

```json
{
    "error": "<error message>"
}
```

### Rate limiting

The API is rate limited to 10 requests per second with bursts up to 100 requests. The rate limiting is
based on the [Token Bucket](https://en.wikipedia.org/wiki/Token_bucket) algorithm and can be configured
in `src/config.js` at `api.rateLimit`.

The limit is per IP number, so if your server is behind a reverse proxy or similar you must change the
config to rate limit by the `X-Forwarded-For` header instead of the actual IP:

```js
rateLimit: {
  ...
  ip: false,
  xff: true
  ...
}
```

## Use with Bitcoin testnet

During development and testing it is recommended to use the testnet network. By doing so you can
use testnet coins and don't risk losing any real money. Running a testnet node is also much lighter
than running a mainnet node.

1. **Run btcd with testnet**

    `$ btcd --txindex --addrindex --testnet`

2. **Configure the API server to use testnet**

    Open `src/config.js` and set `network` to `testnet` instead
    of `mainnet`.

3. **Configure the Pine app to use testnet**

    You need to configure the app to use testnet and point it to your testnet API.
    This requires you to build and run the app yourself.
    Follow the instructions in the [Pine app repo](https://github.com/blockfirm/pine-app).

## Contributing

Want to help us making Pine better? Great, but first read the
[CONTRIBUTING.md](CONTRIBUTING.md) file for instructions.

## Licensing

Pine is licensed under the Apache License, Version 2.0.
See [LICENSE](LICENSE) for full license text.
