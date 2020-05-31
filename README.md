![LSIO Nano Waller](https://i.imgur.com/HZzgy8q.gif)
# LinuxServer Nano Wallet
## Intro
This project has some core goals that are very different from a conventional CryptoCurrency wallet: 
* Ability to hook into a user defined network
* Interact with a raw Nano RPC endpoint without middleware
* No live info feeds for transactions (websockets), data is loaded from remote statically and the user needs to manually refresh
* Completely clientside and run in any web browser with no server requirements (even object storage)
* No browser/disk local storage used
* provide block explorer functionality with the clientside wallet and publically clickable links

With these goals there are some tradeoffs from a functionality standpoint. One of the biggest being the "near instant" concept of using the Nano protocol are not as instant here. A user needs to manually refresh and manually recieve transactions on their end. Generating your Proof of work using browser javascript will generally be slower than using natively compiled crypto libs. The user will need to enter their private key every time they access their wallet and conduct transactions. 

With that said, these design concepts greatly reduce the barrier of entry to a user of your network. The end user can simply access a web page, generate a wallet, and be off and running after they are sent funds.

## Hosted wallet endpoints

The source code for this project is built transparently and published to Github pages at the following endpoints: 
* https://wallet.linuxserver.io/#/ - What is considered stable, built from releases in this repo.
* https://devwallet.linuxserver.io/#/ - Current head of master built from commits to master in this repo.

The URL paths for public block exploration are in the following format: 
* https://wallet.linuxserver.io/#/nano.linuxserver.io/block/YOUR_BLOCK_HASH_HERE - Displays raw block information.
* https://wallet.linuxserver.io/#/nano.linuxserver.io/address/YOUR_ADDRESS_HERE - Displays a stripped down wallet interface with transaction history. 

## For users

We recommend end users looking to locally host this wallet themselves use the Docker container located [here](https://hub.docker.com/r/linuxserver/nano-wallet) it is a simple nginx wrapper for the built code from this repository. 

Run example:

```
docker run -d \
  --name=nano-wallet \
  -p 80:80 \
  --restart unless-stopped \
  linuxserver/nano-wallet
```

Then access http://localhost/#/YOUR_RPC_ENDPOINT . 

## For developers

The frontend framework for this project is [vuejs](https://vuejs.org/) below are the commands used to build this project from source and run a local development environment. We highly reccomending using [vuejs-devtools](https://github.com/vuejs/vue-devtools) locally to inspect and debug. 

This project's core logic for performing Nano transactions uses [nanocurrency-js](https://github.com/marvinroger/nanocurrency-js) please take time to review their calls along with general RPC interaction with a Nano node [here](https://docs.nano.org/commands/rpc-protocol/).

### Project setup
```
npm install
```

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
