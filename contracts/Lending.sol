// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Lending {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;
    mapping(address => uint256) public lastInterestUpdate;

    // Reentrancy guard
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;

    // Interest rate: 5% APY = 5e16 (5 * 10^16) per year
    // Divided by seconds in a year (31536000) = ~1585489599 per second
    uint256 public constant INTEREST_RATE_PER_SECOND = 1585489599; // 5% APY

    event Deposit(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event InterestAccrued(address indexed user, uint256 interestAmount);

    constructor() {
        _status = NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != ENTERED, "ReentrancyGuard: reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }

    function accrueInterest(address user) internal {
        if (loans[user] > 0 && lastInterestUpdate[user] > 0) {
            uint256 timeElapsed = block.timestamp - lastInterestUpdate[user];
            // Interest = principal * rate * time / 1e18 (to handle decimals)
            uint256 interest = (loans[user] * INTEREST_RATE_PER_SECOND * timeElapsed) / 1e18;

            if (interest > 0) {
                loans[user] += interest;
                emit InterestAccrued(user, interest);
            }
        }
        lastInterestUpdate[user] = block.timestamp;
    }

    function getAccruedInterest(address user) public view returns (uint256) {
        if (loans[user] == 0 || lastInterestUpdate[user] == 0) {
            return 0;
        }
        uint256 timeElapsed = block.timestamp - lastInterestUpdate[user];
        return (loans[user] * INTEREST_RATE_PER_SECOND * timeElapsed) / 1e18;
    }

    function getCurrentLoanBalance(address user) public view returns (uint256) {
        return loans[user] + getAccruedInterest(user);
    }

    function deposit() public payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        deposits[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function borrow(uint256 amount) public nonReentrant {
        accrueInterest(msg.sender);

        // CHECKS
        require(amount > 0, "Borrow amount must be greater than 0");
        require(deposits[msg.sender] > 0, "No deposits found");
        require(address(this).balance >= amount, "Insufficient contract balance");

        // Check collateral against current loan balance (including accrued interest)
        uint256 currentLoan = loans[msg.sender];
        uint256 newLoanTotal = currentLoan + amount;
        require(deposits[msg.sender] >= newLoanTotal * 2, "Insufficient collateral (need 200%)");

        // EFFECTS
        loans[msg.sender] = newLoanTotal;

        // INTERACTIONS
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Borrow(msg.sender, amount);
    }

    function repay() public payable nonReentrant {
        accrueInterest(msg.sender);
        require(msg.value > 0, "Repay amount must be greater than 0");
        require(loans[msg.sender] > 0, "No outstanding loans");
        require(msg.value <= loans[msg.sender], "Repay amount exceeds loan");

        loans[msg.sender] -= msg.value;
        emit Repay(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public nonReentrant {
        accrueInterest(msg.sender);

        // CHECKS
        require(amount > 0, "Withdraw amount must be greater than 0");
        require(deposits[msg.sender] >= amount, "Insufficient deposit balance");
        require(address(this).balance >= amount, "Insufficient contract balance");

        // Calculate available collateral (excess beyond loan requirements)
        uint256 requiredCollateral = loans[msg.sender] * 2;
        uint256 availableCollateral = deposits[msg.sender] > requiredCollateral
            ? deposits[msg.sender] - requiredCollateral
            : 0;

        require(availableCollateral >= amount, "Insufficient available collateral");

        // EFFECTS
        deposits[msg.sender] -= amount;

        // INTERACTIONS
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    function getAvailableCollateral(address user) public view returns (uint256) {
        // Use current loan balance including accrued interest for accurate calculation
        uint256 currentLoan = getCurrentLoanBalance(user);
        uint256 requiredCollateral = currentLoan * 2;
        return deposits[user] > requiredCollateral
            ? deposits[user] - requiredCollateral
            : 0;
    }

    // Health Factor: Returns value with 2 decimal precision (e.g., 150 = 1.50)
    // Health Factor < 100 (1.0) means position can be liquidated
    // Health Factor >= 100 (1.0) means position is healthy
    function getHealthFactor(address user) public view returns (uint256) {
        if (loans[user] == 0) {
            return type(uint256).max; // No loan = infinite health factor
        }

        uint256 currentLoan = getCurrentLoanBalance(user);
        if (currentLoan == 0) {
            return type(uint256).max;
        }

        // Health Factor = (deposits / currentLoan) * 100
        // This gives us percentage with 2 decimal places
        // Example: 200 ETH deposits / 100 ETH loan = 200 (2.00x)
        return (deposits[user] * 100) / currentLoan;
    }

    function isHealthy(address user) public view returns (bool) {
        if (loans[user] == 0) {
            return true;
        }
        // Position is healthy if collateral is at least 2x the loan (200%)
        return getHealthFactor(user) >= 200;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        deposits[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
