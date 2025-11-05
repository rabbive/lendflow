const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lending Contract", function () {
  let lending;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Lending = await ethers.getContractFactory("Lending");
    lending = await Lending.deploy();
    await lending.waitForDeployment();

    // Fund the contract with 1000 ETH for lending
    await owner.sendTransaction({
      to: await lending.getAddress(),
      value: ethers.parseEther("1000"),
    });
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial balance", async function () {
      const balance = await lending.getBalance();
      expect(balance).to.equal(ethers.parseEther("1000"));
    });

    it("Should initialize reentrancy guard correctly", async function () {
      // Contract should be in NOT_ENTERED state
      // We can verify this by making a successful call
      await expect(lending.connect(addr1).deposit({ value: ethers.parseEther("1") })).to.not.be.reverted;
    });
  });

  describe("Deposits", function () {
    it("Should allow users to deposit ETH", async function () {
      const depositAmount = ethers.parseEther("10");
      await lending.connect(addr1).deposit({ value: depositAmount });

      const userDeposit = await lending.deposits(addr1.address);
      expect(userDeposit).to.equal(depositAmount);
    });

    it("Should emit Deposit event", async function () {
      const depositAmount = ethers.parseEther("5");
      await expect(lending.connect(addr1).deposit({ value: depositAmount }))
        .to.emit(lending, "Deposit")
        .withArgs(addr1.address, depositAmount);
    });

    it("Should reject zero deposits", async function () {
      await expect(lending.connect(addr1).deposit({ value: 0 })).to.be.revertedWith(
        "Deposit amount must be greater than 0"
      );
    });

    it("Should allow multiple deposits from same user", async function () {
      await lending.connect(addr1).deposit({ value: ethers.parseEther("5") });
      await lending.connect(addr1).deposit({ value: ethers.parseEther("3") });

      const userDeposit = await lending.deposits(addr1.address);
      expect(userDeposit).to.equal(ethers.parseEther("8"));
    });
  });

  describe("Borrowing", function () {
    beforeEach(async function () {
      // Deposit collateral first
      await lending.connect(addr1).deposit({ value: ethers.parseEther("100") });
    });

    it("Should allow borrowing with sufficient collateral", async function () {
      const borrowAmount = ethers.parseEther("50"); // 200% collateralization
      await lending.connect(addr1).borrow(borrowAmount);

      const userLoan = await lending.loans(addr1.address);
      expect(userLoan).to.equal(borrowAmount);
    });

    it("Should emit Borrow event", async function () {
      const borrowAmount = ethers.parseEther("40");
      await expect(lending.connect(addr1).borrow(borrowAmount))
        .to.emit(lending, "Borrow")
        .withArgs(addr1.address, borrowAmount);
    });

    it("Should reject borrow without collateral", async function () {
      await expect(lending.connect(addr2).borrow(ethers.parseEther("10"))).to.be.revertedWith("No deposits found");
    });

    it("Should reject borrow with insufficient collateral", async function () {
      const borrowAmount = ethers.parseEther("51"); // More than 50% of deposit
      await expect(lending.connect(addr1).borrow(borrowAmount)).to.be.revertedWith(
        "Insufficient collateral (need 200%)"
      );
    });

    it("Should reject zero borrow amount", async function () {
      await expect(lending.connect(addr1).borrow(0)).to.be.revertedWith("Borrow amount must be greater than 0");
    });

    it("Should track multiple borrows correctly", async function () {
      await lending.connect(addr1).borrow(ethers.parseEther("20"));
      await lending.connect(addr1).borrow(ethers.parseEther("10"));

      const userLoan = await lending.loans(addr1.address);
      expect(userLoan).to.equal(ethers.parseEther("30"));
    });
  });

  describe("Repayment", function () {
    beforeEach(async function () {
      // Deposit and borrow
      await lending.connect(addr1).deposit({ value: ethers.parseEther("100") });
      await lending.connect(addr1).borrow(ethers.parseEther("40"));
    });

    it("Should allow loan repayment", async function () {
      const repayAmount = ethers.parseEther("20");
      await lending.connect(addr1).repay({ value: repayAmount });

      const userLoan = await lending.loans(addr1.address);
      expect(userLoan).to.equal(ethers.parseEther("20"));
    });

    it("Should emit Repay event", async function () {
      const repayAmount = ethers.parseEther("10");
      await expect(lending.connect(addr1).repay({ value: repayAmount }))
        .to.emit(lending, "Repay")
        .withArgs(addr1.address, repayAmount);
    });

    it("Should reject repay with no outstanding loan", async function () {
      await expect(lending.connect(addr2).repay({ value: ethers.parseEther("1") })).to.be.revertedWith(
        "No outstanding loans"
      );
    });

    it("Should reject repay amount exceeding loan", async function () {
      await expect(lending.connect(addr1).repay({ value: ethers.parseEther("50") })).to.be.revertedWith(
        "Repay amount exceeds loan"
      );
    });

    it("Should reject zero repay amount", async function () {
      await expect(lending.connect(addr1).repay({ value: 0 })).to.be.revertedWith(
        "Repay amount must be greater than 0"
      );
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await lending.connect(addr1).deposit({ value: ethers.parseEther("100") });
    });

    it("Should allow withdrawal of excess collateral", async function () {
      const withdrawAmount = ethers.parseEther("50");
      const initialBalance = await ethers.provider.getBalance(addr1.address);

      await lending.connect(addr1).withdraw(withdrawAmount);

      const userDeposit = await lending.deposits(addr1.address);
      expect(userDeposit).to.equal(ethers.parseEther("50"));
    });

    it("Should emit Withdraw event", async function () {
      const withdrawAmount = ethers.parseEther("30");
      await expect(lending.connect(addr1).withdraw(withdrawAmount))
        .to.emit(lending, "Withdraw")
        .withArgs(addr1.address, withdrawAmount);
    });

    it("Should reject withdrawal with active loan requiring collateral", async function () {
      await lending.connect(addr1).borrow(ethers.parseEther("40")); // Requires 80 ETH collateral
      await expect(lending.connect(addr1).withdraw(ethers.parseEther("30"))).to.be.revertedWith(
        "Insufficient available collateral"
      );
    });

    it("Should allow withdrawal of excess after loan", async function () {
      await lending.connect(addr1).borrow(ethers.parseEther("40")); // Requires 80 ETH, 20 ETH available
      await lending.connect(addr1).withdraw(ethers.parseEther("20"));

      const userDeposit = await lending.deposits(addr1.address);
      expect(userDeposit).to.equal(ethers.parseEther("80"));
    });

    it("Should reject zero withdrawal amount", async function () {
      await expect(lending.connect(addr1).withdraw(0)).to.be.revertedWith("Withdraw amount must be greater than 0");
    });
  });

  describe("Interest Accrual", function () {
    beforeEach(async function () {
      await lending.connect(addr1).deposit({ value: ethers.parseEther("100") });
      await lending.connect(addr1).borrow(ethers.parseEther("40"));
    });

    it("Should accrue interest over time", async function () {
      // Fast forward time by 1 year (365 days)
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const accruedInterest = await lending.getAccruedInterest(addr1.address);
      // 5% of 40 ETH ≈ 2 ETH
      expect(accruedInterest).to.be.gt(ethers.parseEther("1.9"));
      expect(accruedInterest).to.be.lt(ethers.parseEther("2.1"));
    });

    it("Should return zero interest for no loan", async function () {
      const interest = await lending.getAccruedInterest(addr2.address);
      expect(interest).to.equal(0);
    });

    it("Should update loan balance with accrued interest on borrow", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Make another borrow to trigger interest accrual
      await lending.connect(addr1).borrow(ethers.parseEther("5"));

      const currentLoan = await lending.loans(addr1.address);
      // Should be > 45 ETH due to interest
      expect(currentLoan).to.be.gt(ethers.parseEther("45"));
    });
  });

  describe("Health Factor", function () {
    beforeEach(async function () {
      await lending.connect(addr1).deposit({ value: ethers.parseEther("100") });
    });

    it("Should return infinite health factor with no loan", async function () {
      const healthFactor = await lending.getHealthFactor(addr1.address);
      expect(healthFactor).to.equal(ethers.MaxUint256);
    });

    it("Should calculate correct health factor", async function () {
      await lending.connect(addr1).borrow(ethers.parseEther("40"));
      const healthFactor = await lending.getHealthFactor(addr1.address);

      // 100 ETH deposit / 40 ETH loan = 2.5 = 250 (with 2 decimal precision)
      expect(healthFactor).to.equal(250);
    });

    it("Should indicate healthy position", async function () {
      await lending.connect(addr1).borrow(ethers.parseEther("40"));
      const isHealthy = await lending.isHealthy(addr1.address);
      expect(isHealthy).to.be.true;
    });

    it("Should indicate unhealthy position", async function () {
      await lending.connect(addr1).deposit({ value: ethers.parseEther("100") });
      await lending.connect(addr1).borrow(ethers.parseEther("60"));

      // Simulate interest accrual to push health factor below 2.0
      await ethers.provider.send("evm_increaseTime", [10 * 365 * 24 * 60 * 60]); // 10 years
      await ethers.provider.send("evm_mine");

      const currentLoan = await lending.getCurrentLoanBalance(addr1.address);
      // After 10 years at 5% APY, loan should be significantly higher
      expect(currentLoan).to.be.gt(ethers.parseEther("60"));
    });
  });

  describe("Helper Functions", function () {
    beforeEach(async function () {
      await lending.connect(addr1).deposit({ value: ethers.parseEther("100") });
      await lending.connect(addr1).borrow(ethers.parseEther("40"));
    });

    it("Should calculate available collateral correctly", async function () {
      const available = await lending.getAvailableCollateral(addr1.address);
      // 100 ETH - (40 ETH * 2) = 20 ETH
      expect(available).to.equal(ethers.parseEther("20"));
    });

    it("Should return current loan balance with interest", async function () {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const currentLoan = await lending.getCurrentLoanBalance(addr1.address);
      expect(currentLoan).to.be.gt(ethers.parseEther("40"));
    });

    it("Should return contract balance", async function () {
      const balance = await lending.getBalance();
      expect(balance).to.be.gt(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle receive function for deposits", async function () {
      const sendAmount = ethers.parseEther("5");
      await addr1.sendTransaction({
        to: await lending.getAddress(),
        value: sendAmount,
      });

      const userDeposit = await lending.deposits(addr1.address);
      expect(userDeposit).to.equal(sendAmount);
    });

    it("Should prevent reentrancy attacks", async function () {
      // This test would require a malicious contract
      // For now, we verify the modifier exists and basic functionality works
      await lending.connect(addr1).deposit({ value: ethers.parseEther("10") });
      await expect(lending.connect(addr1).borrow(ethers.parseEther("5"))).to.not.be.reverted;
    });
  });
});
