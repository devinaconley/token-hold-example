/*
Token

https://github.com/devinaconley/token-hold-example

SPDX-License-Identifier: MIT
*/

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Token is ERC721 {
  uint256 public minted;

  constructor() ERC721("TestERC721", "NFT") {}

  function mint(uint256 quantity) public {
    for (uint256 i = 0; i < quantity; i++) {
      minted = minted + 1;
      _mint(msg.sender, minted);
    }
  }
}
