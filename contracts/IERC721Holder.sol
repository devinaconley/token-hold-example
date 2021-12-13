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
    address indexed _user,
    address indexed _tokenAddress,
    uint256 indexed _tokenId
  );

  // emitted when the token is released back to the user
  event Release(
    address indexed _user,
    address indexed _tokenAddress,
    uint256 indexed _tokenId
  );

  // returns the functional owner of the held token
  function heldOwnerOf(address _tokenAddress, uint256 _tokenID)
    external
    view
    returns (address);

  // returns the held balance of the functional owner
  function heldBalanceOf(address _tokenAddress, address _owner)
    external
    view
    returns (uint256);
}
