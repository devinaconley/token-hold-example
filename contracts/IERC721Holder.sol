/*
IERC721Holder

https://github.com/devinaconley/token-hold-example

SPDX-License-Identifier: MIT
*/

import "@openzeppelin/contracts/interfaces/IERC165.sol";

pragma solidity ^0.8.0;

interface IERC721Holder is IERC165 {
  // emitted when the token is transferred to the contract
  event Hold(
    address indexed owner,
    address indexed tokenAddress,
    uint256 indexed tokenId
  );

  // emitted when the token is released back to the user
  event Release(
    address indexed owner,
    address indexed tokenAddress,
    uint256 indexed tokenId
  );

  // returns the functional owner of the held token
  function heldOwnerOf(address tokenAddress, uint256 tokenId)
    external
    view
    returns (address);

  // returns the held balance of the functional owner
  function heldBalanceOf(address tokenAddress, address owner)
    external
    view
    returns (uint256);
}
