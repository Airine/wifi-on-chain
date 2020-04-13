---
id: wifi-poa
title: Private Proof-of-Authority Blockchain Network
---

## Why Private and Proof-of-Authority

1. Why private?

    As shown in our design, the blockchain node runs on the router or the raspberry pi connected to the router. We only need the blockchain accessible with devices connected to the router.

2. Why Proof-of-Authority?

    **Proof-of-Authority (PoA)** is a new consensus mechanism for the blockchain, which is IoT friendly (lower resource consumption). In our setting, either the router or the raspberry pi can be considered as an edge computing device. PoA network can save lots of non-sense energy consumption rather than using PoW, the traditional consensus mechanism.

To start the PoA network, simply run `docker-compose up`. By default, only the first node defined in the addresses array will be allowed to seal with following:

- Initializes the data directory with a testing genesis block
- Sets max peers to 0
- Turns off discovery by other nodes
- Sets the gas price to 0
- Uses the Clique PoA consensus engine with which allows blocks to be mined as-needed without excessive CPU and memory consumption
- Uses [on-demand](#normal-log-result) block generation, producing blocks when there are transactions waiting to be mined

## Run

Simply run the command:
```bash
docker-compose up
```

## Connect

Use `geth attach` to open an interactive console connecting to running node:
```bash
geth attach http://127.0.0.1:8545 console
```

## Stop

Press `Control-C`

## Clean the chain data

After stop the running node: (Be careful This command would remove all the stopped docker container)
```bash
docker container prune
```

## If `docker-compose up` does not work

For some reasons, the docker container can not be pull sometimes. Also, sometimes `geth` can not be installed normally. Then you can just compile a runnable `geth` executable, and run the scripts in `./scripts`.

```
scripts
├── node.sh
├── node_pow.sh
└── node_pow_miner.sh
```

If so, please manually clean the data in `/data/.ethereum/`.

## Normal Log Result

```
(base) ➜  wifi-devnet git:(stable) ✗ docker-compose up
Recreating wifi-devnet_node_1 ... done
Attaching to wifi-devnet_node_1
node_1  | WARN [04-11|16:20:01.344] Sanitizing cache to Go's GC limits       provided=1024 updated=663
node_1  | INFO [04-11|16:20:01.348] Maximum peer count                       ETH=25 LES=0 total=25
node_1  | INFO [04-11|16:20:04.779] Using developer account                  address=0x0Cbbb79B02449ea575F6185dd3C541E9ab8d8182
node_1  | INFO [04-11|16:20:04.781] Starting peer-to-peer node               instance=Geth/v1.8.27-stable-4bcc0a37/linux-amd64/go1.11.9
node_1  | WARN [04-11|16:20:04.781] Sanitizing invalid miner gas price       provided=0    updated=0
node_1  | INFO [04-11|16:20:04.785] Allocated cache and file handles         database=/private/.ethereum/geth/chaindata cache=331 handles=524288
node_1  | INFO [04-11|16:20:04.820] Writing custom genesis block 
node_1  | INFO [04-11|16:20:04.830] Persisted trie from memory database      nodes=12 size=1.79kB time=461.805µs gcnodes=0 gcsize=0.00B gctime=0s livenodes=1 livesize=0.00B
node_1  | INFO [04-11|16:20:04.831] Initialised chain configuration          config="{ChainID: 1337 Homestead: 0 DAO: <nil> DAOSupport: false EIP150: 0 EIP155: 0 EIP158: 0 Byzantium: 0 Constantinople: 0  ConstantinopleFix: 0 Engine: clique}"
node_1  | INFO [04-11|16:20:04.831] Initialising Ethereum protocol           versions="[63 62]" network=19990119
node_1  | INFO [04-11|16:20:04.876] Loaded most recent local header          number=0 hash=3fba81…3b7163 td=1 age=51y3d16h
node_1  | INFO [04-11|16:20:04.877] Loaded most recent local full block      number=0 hash=3fba81…3b7163 td=1 age=51y3d16h
node_1  | INFO [04-11|16:20:04.877] Loaded most recent local fast block      number=0 hash=3fba81…3b7163 td=1 age=51y3d16h
node_1  | INFO [04-11|16:20:04.878] Regenerated local transaction journal    transactions=0 accounts=0
node_1  | INFO [04-11|16:20:04.892] Stored checkpoint snapshot to disk       number=0 hash=3fba81…3b7163
node_1  | INFO [04-11|16:20:04.957] New local node record                    seq=1 id=25252257df034560 ip=127.0.0.1 udp=0 tcp=37547
node_1  | INFO [04-11|16:20:04.958] Started P2P networking                   self="enode://0b94b63f10b36440fbe1474d7f2db5dd2e781bf24e19a195a8f536592edfe36e484ec745c8562cf45fa60134aa5af328f8a3796625f220abd9d1b13f3412ee04@127.0.0.1:37547?discport=0"
node_1  | INFO [04-11|16:20:04.960] started whisper v.6.0 
node_1  | INFO [04-11|16:20:04.987] IPC endpoint opened                      url=/private/.ethereum/geth.ipc
node_1  | INFO [04-11|16:20:04.989] HTTP endpoint opened                     url=http://0.0.0.0:8545         cors=* vhosts=localhost
node_1  | INFO [04-11|16:20:04.991] WebSocket endpoint opened                url=ws://[::]:8546
node_1  | INFO [04-11|16:20:07.729] Unlocked account                         address=0x356Cf535FC1f1C4dD1a4C4f4c261684bcd3e1bcb
node_1  | INFO [04-11|16:20:10.731] Unlocked account                         address=0x59Ef5B8b24cE3e00Ad0345cD2d47f96947c3e2c3
node_1  | INFO [04-11|16:20:14.591] Unlocked account                         address=0x4B54772Cc9e233B4fe1F04A65a994aF40A6834ac
node_1  | INFO [04-11|16:20:16.703] Unlocked account                         address=0xF7e5800E52318834E8689c37dCCCD2230427a905
node_1  | INFO [04-11|16:20:18.649] Unlocked account                         address=0xC9c4496508E92A9FCB0Ffc8Cb6363f910C7E8AE3
node_1  | INFO [04-11|16:20:20.848] Unlocked account                         address=0x6c319A49787d10a6e0c72a25DB06cc555370c4DD
node_1  | INFO [04-11|16:20:23.076] Unlocked account                         address=0x9E9581516679F57Aa7eb81D278841DF6aB93902B
node_1  | INFO [04-11|16:20:24.791] Unlocked account                         address=0x71b3D7405080197fC03cA82bCDd1764F1e14ABf2
node_1  | INFO [04-11|16:20:26.391] Unlocked account                         address=0x0Cbbb79B02449ea575F6185dd3C541E9ab8d8182
node_1  | INFO [04-11|16:20:28.096] Unlocked account                         address=0x563A5fC36b990D68bBCaAA206C281BfEc31134AB
node_1  | INFO [04-11|16:20:28.097] Transaction pool price threshold updated price=0
node_1  | INFO [04-11|16:20:28.097] Transaction pool price threshold updated price=0
node_1  | INFO [04-11|16:20:28.097] Etherbase automatically configured       address=0x0Cbbb79B02449ea575F6185dd3C541E9ab8d8182
node_1  | INFO [04-11|16:20:28.099] Commit new mining work                   number=1 sealhash=7a0e2c…2dc6f4 uncles=0 txs=0 gas=0 fees=0 elapsed=1.882ms
node_1  | INFO [04-11|16:20:28.100] Sealing paused, waiting for transactions 
```