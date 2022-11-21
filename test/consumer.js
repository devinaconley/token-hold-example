// tests for example consumer of the ERC721 token holder interface

const { expect } = require('chai');
const { ethers } = require('hardhat');
const { constants, BigNumber } = require('ethers');

BN = BigNumber;


describe('Consumer', function () {
  let owner, alice, bob, other;
  let holder, token, consumer;

  beforeEach(async function () {
    [owner, alice, bob, other] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory('Vault');
    const Token = await ethers.getContractFactory('Token');
    const Consumer = await ethers.getContractFactory('Consumer');

    token = await Token.deploy();
    holder = await Vault.deploy(token.address, 7 * 24 * 3600);
    consumer = await Consumer.deploy(token.address);

    await token.connect(alice).mint(5);
    await token.connect(bob).mint(5);

    await token.connect(alice).setApprovalForAll(holder.address, true);
    await token.connect(bob).setApprovalForAll(holder.address, true);

    await holder.connect(alice).deposit(3);
    await holder.connect(bob).deposit(7);
    await holder.connect(alice).deposit(5);

    await token.connect(other).mint(5);
    await token.connect(other).transferFrom(other.address, consumer.address, 11);
  });

  describe('construction', function () {

    it('should set the specified token address', async function () {
      expect(await consumer.token()).to.equal(token.address);
    });

  });

  describe('get owner', function () {

    describe('when token does not exist', function () {
      it('should fail', async function () {
        await expect(consumer.getOwner(17))
          .to.be.revertedWith('ERC721: owner query for nonexistent token');
      });
    });

    describe('when owner is a user', function () {
      it('should return user address', async function () {
        expect(await consumer.getOwner(1)).to.equal(alice.address);
      });
    });

    describe('when owner is holder contract', function () {
      it('should return functional user owner', async function () {
        expect(await consumer.getOwner(3)).to.equal(alice.address);
      });
    });

    describe('when owner is another contract', function () {
      it('should return contract address', async function () {
        expect(await consumer.getOwner(11)).to.equal(consumer.address);
      });
    });

  });


  describe('get balance', function () {

    describe('when empty list of holders is passed', function () {
      it('should return plain user balance', async function () {
        expect(await consumer.getBalance(alice.address, [])).to.equal(3);
      });
    });

    describe('when list of holders is passed', function () {
      it('should return plain user balance', async function () {
        expect(await consumer.getBalance(alice.address, [holder.address])).to.equal(5);
      });
    });

  });

});
