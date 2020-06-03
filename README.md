![LSIO Nano Wallet](https://i.imgur.com/HZzgy8q.gif)
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

## Live Nano network addresses

We will list here Live Nano RPC provies that we add and how to use them.

### [mynano.ninja](https://mynano.ninja/)
Requires an API key to use: https://mynano.ninja/auth/login#apikey
* Use: https://wallet.linuxserver.io/#/mynano.ninja?auth=APIKEY

### [nanos.cc](https://nanos.cc/)
Does not requires an API key to use
* Use: https://wallet.linuxserver.io/#/proxy.nanos.cc

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

This wallet was designed around the software stack described [here](https://blog.linuxserver.io/2020/05/31/deploying-your-own-crypto/), and specifically our Nano Node image with a firewall to allow default wallet RPC calls [here](https://hub.docker.com/r/linuxserver/nano).  

## Customisation

If you want to lock the wallet to a specific RPC server then go to src/stores/app/state.js and change `changeaddress` to false, the node will then be locked to the node details directly beneath (only change the settings node details not the main node details).

From there basic branding would be to modify the site title found in `/public/index.html` and swap out our QR code icon at `/public/qr_logo.png` we have specifically made efforts to not brand this wallet to our codebase or organization to allow anyone with a public RPC endpoint to also host this wallet themselves and have their users use it as a wallet and block explorer.

### Hosting your forked repo from Github Pages

If you are planning on hosting this wallet on your domain pointed to your RPC servers, for transparency it is likely best to fork this repo and publish it using [Github Pages](https://pages.github.com/) . Here are the basic steps to follow to achieve that: 

1. Fork this repo into your namespace in Github
2. In your repo under `Actions` click to enable actions on your fork
3. In your repo main settings enable Github pages and set your custom domain
4. Generate an API key following the instructions [here](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line), you will need to select the `repo` permissions
5. Set this API key in your repo settings under `Secrets` as `ACCESS_TOKEN` this key is needed to publish changes to the `gh-pages` branch of your repo
6. Push your customizations to your repo on the master branch, this should trigger a build of the site and push to the gh-pages branch using the logic located [here](https://github.com/linuxserver/nano-wallet/blob/master/.github/workflows/main.yml)
7. When built the wallet will be available at the endpoint you defined pointed to your RPC servers given you have the DNS properly setup as described [here](https://help.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site)

From here you can ingest upstream changes from this repo when needed and customize it to your needs while Github deploys your site on updates to their hosted CDN. 

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
