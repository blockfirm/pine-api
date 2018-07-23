Payla API
=========

REST API for the [Payla app](https://github.com/blockfirm/payla-app) to interact with different blockchains.

## Getting started

1. Install [btcd](https://github.com/btcsuite/btcd)
2. Start the btcd node with transaction and address indexing turned on:  
```
$ btcd --txindex --addrindex
```
3. Clone this repo:  
```
$ git clone https://github.com/blockfirm/payla-api.git
$ cd payla-api
```
4. Install dependencies:  
```
$ npm install
```
5. Start the API server in development mode:  
```
$ npm run dev
```
6. Or build it and run in production mode:  
```
$ npm run build
$ npm start
```

## API

### `GET` /v1/bitcoin/transactions  
Scans the bitcoin blockchain for transactions matching a set of addresses.

**Parameters**  
* `addresses` – (*string*) Comma-separated list of addresses to get transactions for. Maximum 20 addresses are allowed per request
* `page` – (*integer*) Each *page* returns maximum 100 transactions per address

**Returns**  
Returns the transactions together with extra vin data and other useful information about each transaction, e.g. whether it is pending or not. See <https://github.com/btcsuite/btcd/blob/master/docs/json_rpc_api.md#searchrawtransactions> for an example return.

### `POST` /v1/bitcoin/transactions  
Broadcasts a transaction to the Bitcoin network. The transaction must be serialized in raw format
(https://bitcoin.org/en/developer-reference#raw-transaction-format).

**Parameters**  
* `transaction` – (*string*) Serialized and signed transaction in raw format

**Returns**  
* `txid` – (*string*) The hash of the transaction

### `GET` /v1/bitcoin/utxo  
Scans the bitcoin blockchain for unspent transaction outputs for the given public key or address.

**Parameters**  
* `public_key` – A DER hex encoded public key
* `address` – A bitcoin address

**Returns**  
Returns the unspent outputs as a JSON array.

### `GET` /v1/bitcoin/fee/estimate  
Estimates the transaction fee based on the fees in the recent blocks.

**Returns**  
Returns the estimated fee per byte in satoshis, e.g.

```json
{
    "satoshisPerByte": 4
}
```

### `GET` /v1/bitcoin/fiatrates  
Gets the exchange rates for bitcoin in different fiat currencies.

**Parameters**  
* `currencies` – Comma-separated list of ISO 4217 codes

**Returns**  
Array of fiat exchange rates for the currencies specified.

### `POST` /v1/bitcoin/pushnotifications  
An endpoint to somehow subscribe to push notifications when new payments are received or confirmed. TBD.

### `DELETE` /v1/bitcoin/pushnotifications  
An endpoint to unsubscribe to push notifications. TBD.

### Error handling

Errors are returned as JSON in the following format:

```json
{
    "error": "<error message>"
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

3. **Configure the Payla app to use testnet**

    You need to configure the app to use testnet and point it to your testnet API.
    This requires you to build and run the app yourself.
    Follow the instructions in the [Payla app repo](https://github.com/blockfirm/payla-app).

## Contributing

Want to help us making Payla better? Great, but first read the
[CONTRIBUTING.md](CONTRIBUTING.md) file for instructions.

## Licensing

Payla is licensed under the Apache License, Version 2.0.
See [LICENSE](LICENSE) for full license text.
