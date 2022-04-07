# Token holder example

This repository contains a reference implementation for the proposed held token ERC standard.
The standard would provide a lightweight interface for programmatic token "holders"
to generally expose information on the actual functional ownership and balance of a token.

More context can be found in the discussion thread [here](https://ethereum-magicians.org/t/erc-standard-for-held-non-fungible-token-nfts-defi/7117).

## Overview

In this example, the `Vault` contract is a token holder which implements the `IERC721Holder` interface.
It allows a user to lock up an `ERC721` token for a specified period of time, while still reporting functional ownership and balance.

The `Consumer` contract implements an example "consumer" of the proposed held token standard.
It can query `ERC721` ownership and balances, including any "held" tokens.

All functionality is further demonstrated by the unit tests in `holder.js` and `consumer.js`

## Setup

Both **Node.js** (v14+) and **npm** are required for package management and testing. See instructions
for installation [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

This project also uses [Hardhat](https://hardhat.org/getting-started/),
[ethers.js](https://docs.ethers.io/),
[Waffle](https://getwaffle.io/),
and [OpenZeppelin](https://docs.openzeppelin.com/) (contracts)
for development, testing, and deployment.

To install these packages along with other dependencies

```
npm install
```

## Test

To run all unit tests

```
npm test
```

To run a specific set of tests

```
npx hardhat compile && npx hardhat test ./test/holder.js
```
