// tests for example implementation of ERC721 token holder

const { expect } = require('chai');
const { ethers } = require('hardhat');
const { constants, BigNumber } = require('ethers');

BN = BigNumber;


describe('IERC721Holder', function () {
  let owner, alice, bob, other;
  let holder, token;

  beforeEach(async function () {
    [owner, alice, bob, other] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory('Vault');
    const Token = await ethers.getContractFactory('Token');

    token = await Token.deploy();
    holder = await Vault.deploy(token.address, 7 * 24 * 3600);
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
      await token.connect(alice).mint(5);
      await token.connect(bob).mint(5);
    });

    describe('when token transfer is not approved', function () {
      it('should fail', async function () {
        await expect(
          holder.connect(bob).deposit(7)
        ).to.be.revertedWith('ERC721: transfer caller is not owner nor approved');
      });
    });

    describe('when sender does not own token', function () {
      it('should fail', async function () {
        await token.connect(bob).setApprovalForAll(holder.address, true);
        await expect(
          holder.connect(bob).deposit(1)
        ).to.be.revertedWith('ERC721Vault: sender does not own token');
      });
    });

    describe('when user deposits a token', function () {
      beforeEach(async function () {
        await token.connect(alice).setApprovalForAll(holder.address, true);
        this.res = await holder.connect(alice).deposit(1);
      });

      it('should set owners mapping', async function () {
        expect(await holder.owners(1)).to.equal(alice.address);
      });

      it('should set time lock', async function () {
        let block = await ethers.provider.getBlock(this.res.blockNumber);
        expect(await holder.locks(1)).to.equal(block.timestamp + 7 * 24 * 3600);
      });

      it('should update user balance', async function () {
        expect(await holder.balances(alice.address)).to.equal(1);
      });

      it('should transfer token ownership to contract', async function () {
        expect(await token.ownerOf(1)).to.equal(holder.address);
      });

      it('should emit Hold event', async function () {
        await expect(this.res)
          .to.emit(holder, 'Hold')
          .withArgs(alice.address, token.address, 1);
      });
    });
  });

  describe('withdraw', function () {

    beforeEach(async function () {
      await token.connect(alice).mint(5);
      await token.connect(bob).mint(5);

      await token.connect(alice).setApprovalForAll(holder.address, true);
      await token.connect(bob).setApprovalForAll(holder.address, true);

      let res = await holder.connect(alice).deposit(2);
      await holder.connect(bob).deposit(7);

      this.block = await ethers.provider.getBlock(res.blockNumber);
    });

    describe('when lock period has not elapsed', function () {
      it('should fail', async function () {
        await expect(
          holder.connect(alice).withdraw(2)
        ).to.be.revertedWith('ERC721Vault: token is locked');
      });
    });

    describe('when sender does not own token', function () {
      it('should fail', async function () {
        await ethers.provider.send("evm_mine", [this.block.timestamp + 7 * 24 * 3600]);
        await expect(holder.connect(bob).withdraw(2))
          .to.be.revertedWith('ERC721Vault: sender does not own token');
      });
    });

    describe('when user withdraws a token', function () {
      beforeEach(async function () {
        // advance time
        await ethers.provider.send("evm_mine", [this.block.timestamp + 7 * 24 * 3600]);

        // do withdraw
        this.res = await holder.connect(alice).withdraw(2);
      });

      it('should clear owner mapping', async function () {
        expect(await holder.owners(2)).to.equal(constants.AddressZero);
      });

      it('should clear time lock', async function () {
        expect(await holder.locks(2)).to.equal(0);
      });

      it('should update user balance', async function () {
        expect(await holder.balances(alice.address)).to.equal(0);
      });

      it('should transfer token ownership back to user', async function () {
        expect(await token.ownerOf(2)).to.equal(alice.address);
      });

      it('should emit Release event', async function () {
        await expect(this.res)
          .to.emit(holder, 'Release')
          .withArgs(alice.address, token.address, 2);
      });
    });
  });

  describe('held token interface', function () {

    beforeEach(async function () {
      await token.connect(alice).mint(5);
      await token.connect(bob).mint(5);

      await token.connect(alice).setApprovalForAll(holder.address, true);
      await token.connect(bob).setApprovalForAll(holder.address, true);

      await holder.connect(alice).deposit(3);
      await holder.connect(bob).deposit(7);
      await holder.connect(alice).deposit(5);
    });

    it('should support holder interface', async function () {
      expect(await holder.supportsInterface('0x16b900ff')).to.equal(true);
    });

    it('should support erc165 introspection interface', async function () {
      expect(await holder.supportsInterface('0x01ffc9a7')).to.equal(true);
    });

    it('should return held token owner (3)', async function () {
      expect(await holder.heldOwnerOf(token.address, 3)).to.equal(alice.address);
    });

    it('should return held token owner (7)', async function () {
      expect(await holder.heldOwnerOf(token.address, 7)).to.equal(bob.address);
    });

    it('should return held token owner (5)', async function () {
      expect(await holder.heldOwnerOf(token.address, 5)).to.equal(alice.address);
    });

    it('should return held token balance (alice)', async function () {
      expect(await holder.heldBalanceOf(token.address, alice.address)).to.equal(2);
    });

    it('should return held token balance (bob)', async function () {
      expect(await holder.heldBalanceOf(token.address, bob.address)).to.equal(1);
    });

    it('should return zero address for held token owner of unknown token', async function () {
      expect(await holder.heldOwnerOf(token.address, 12)).to.equal(constants.AddressZero);
    });

    it('should return zero held token balance for unknown user address', async function () {
      expect(await holder.heldBalanceOf(token.address, other.address)).to.equal(0);
    });

    it('should revert on held owner check for invalid token address', async function () {
      await expect(holder.heldOwnerOf(other.address, 3))
        .to.be.revertedWith('ERC721Vault: invalid token address');
    });

    it('should revert on held balance check for invalid token address', async function () {
      await expect(holder.heldBalanceOf(other.address, alice.address))
        .to.be.revertedWith('ERC721Vault: invalid token address');
    });

  });

});
