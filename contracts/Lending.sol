// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Lending {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;

    event Deposit(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        deposits[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function borrow(uint256 amount) public {
        require(amount > 0, "Borrow amount must be greater than 0");
        require(deposits[msg.sender] > 0, "No deposits found");
        require(deposits[msg.sender] >= amount * 2, "Insufficient collateral (need 200%)");
        require(address(this).balance >= amount, "Insufficient contract balance");

        loans[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
        emit Borrow(msg.sender, amount);
    }

    function repay() public payable {
        require(msg.value > 0, "Repay amount must be greater than 0");
        require(loans[msg.sender] > 0, "No outstanding loans");
        require(msg.value <= loans[msg.sender], "Repay amount exceeds loan");

        loans[msg.sender] -= msg.value;
        emit Repay(msg.sender, msg.value);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {
        deposit();
    }
}
