// tests for example implementation of ERC721 token holder

const { expect } = require('chai');
const { ethers } = require('hardhat');
BN = ethers.BigNumber;


describe('IERC721Holder', function () {
  let owner, alice, bob;
  let holder, token;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const ERC721Vault = await ethers.getContractFactory('ERC721Vault');
    const TestERC721 = await ethers.getContractFactory('TestERC721');

    token = await TestERC721.deploy();
    holder = await ERC721Vault.deploy(token.address, 7 * 24 * 3600);
  });

  describe('construction', function () {

    it('should set the specified token address', async function () {
      expect(await holder.token()).to.equal(token.address);
    });

    it('should return the specified timelock period', async function () {
      expect(await holder.timelock()).to.equal(BN.from(7 * 24 * 3600));
    });
  });

  describe('deposit', function () {

    beforeEach(async function () {
      // TODO
    });

    describe('when sender does not own token', function () {
      it('should fail', async function () {
        // TODO
      });

      // TODO
    });
  });

  
});