/*
ERC721Vault

https://github.com/devinaconley/token-hold-example

SPDX-License-Identifier: MIT
*/

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "./IERC721Holder.sol";

contract ERC721Vault is ERC165, IERC721Holder {
  // members
  IERC721 public token;
  uint256 public timelock;
  mapping(uint256 => address) public owners;
  mapping(uint256 => uint256) public locks;
  mapping(address => uint256) public balances;

  /**
   * @param token_ address of token to be stored in vault
   * @param timelock_ duration in seconds that tokens will be locked
   */
  constructor(address token_, uint256 timelock_) {
    token = IERC721(token_);
    timelock = timelock_;
  }

  /**
   * @inheritdoc IERC165
   */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC165, IERC165)
    returns (bool)
  {
    return
      interfaceId == type(IERC721Holder).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /**
   * @inheritdoc IERC721Holder
   */
  function heldOwnerOf(address _tokenAddress, uint256 _tokenID)
    external
    view
    override
    returns (address)
  {
    require(
      _tokenAddress == address(token),
      "ERC721Vault: invalid token address"
    );
    return owners[_tokenID];
  }

  /**
   * @inheritdoc IERC721Holder
   */
  function heldBalanceOf(address _tokenAddress, address _owner)
    external
    view
    override
    returns (uint256)
  {
    require(
      _tokenAddress == address(token),
      "ERC721Vault: invalid token address"
    );
    return balances[_owner];
  }

  /**
   * @notice deposit and lock a token for a period of time
   * @param tokenId ID of token to deposit
   */
  function deposit(uint256 tokenId) public {
    require(
      msg.sender == token.ownerOf(tokenId),
      "ERC721Vault: sender does not own token"
    );

    owners[tokenId] = msg.sender;
    locks[tokenId] = block.timestamp + timelock;
    balances[msg.sender]++;

    emit Hold(msg.sender, address(token), tokenId);

    token.transferFrom(msg.sender, address(this), tokenId);
  }

  /**
   * @notice withdraw token after timelock has elapsed
   * @param tokenId ID of token to withdraw
   */
  function withdraw(uint256 tokenId) public {
    require(
      msg.sender == owners[tokenId],
      "ERC721Vault: sender does not own token"
    );
    require(block.timestamp > locks[tokenId], "ERC721Vault: token is locked");

    delete owners[tokenId];
    delete locks[tokenId];
    balances[msg.sender]--;

    emit Release(msg.sender, address(token), tokenId);

    token.safeTransferFrom(address(this), msg.sender, tokenId);
  }
}
