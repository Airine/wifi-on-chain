---
id: intro
title: Introduction
---

**YourWiFi** is a bidding based wireless resource allocation system using blockchian smart contract, which provides a Pay-as-You-Want WiFi Access Service on Blockchain.

![System Overview](/wifi-on-chain/img/docs/system.png)

## Problem Scenario

<br/>

**Owner**: 1. Owns WiFi Resource 2. Provide it as a service

**Users**: 1. Want WiFi Connection with Specified Bandwidth 2. Want Transparency and Fairness.

## Components

This system consists of three parts:

  1. [Blockchain](/wifi-on-chain/docs/wifi-poa)
  2. [User Interface](/wifi-on-chain/docs/wifi-dapp)
  3. Bandwidth Controller

## Development Tools

1. Geth - Go Ethereum: Official Go implementation of the Ethereum protocol.
  ```
  geth <other-options> --dev --dev.period 1 # PoA
  ```

2. [Docker](#5)

3. [Truffle](#6) Suite
   - **Truffle**: the most popular development framework 
   - Ganache: One click blockchain testnet.
   - **Drizzle** (Font-end): Fast response. 