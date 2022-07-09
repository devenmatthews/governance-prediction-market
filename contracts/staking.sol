// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./mocks/GovTokenMock.sol";
import "./mocks/GovernorMock.sol";
import "hardhat/console.sol";

// title

contract Staking {

    address public owner;


    /// @dev amount of $PLEG tacked by a specific address, at a period of time for some length
    struct Position {
        uint positionId;
        address walletAddress; // address that created the position
        uint amount; // amount of governance tokens being staked
        uint support;
        bool open;// position is closed or not

    }

    Position position; // creates a position

    uint public currentPositionId; // will increment after each new position is created
    address public govTokenAddress;
    address public govContractAddress;
    GovTokenMock public govToken;
    GovernorMock public governor;
    uint public proposalId;
    bool public marketSettled;
    uint public totalYes;
    uint public totalNo;
    mapping(uint => Position) public positions;
    mapping(address => uint[]) public positionIdsByAddress; // ability for a user to query all the positions they created


    // constructor initializes with a new market
    constructor(address _govTokenAddress, address _govContractAddress, uint _proposalId) payable {
        govTokenAddress = _govTokenAddress;
        govContractAddress = _govContractAddress;
        govToken = GovTokenMock(_govTokenAddress);
        governor = GovernorMock(payable(_govContractAddress));
        proposalId = _proposalId;
        owner = msg.sender;
        currentPositionId = 0;
        marketSettled = false;
        totalNo = 0;
        totalYes = 0;
    }



    function stakeVote(uint amount, uint8 support) external payable {
        require(support == 1 || support == 0, "require voting be binary");
        //require(govContractAddress.balanceOf(msg.sender) >= amount, "stake amount must be less than user token balance");
        require(govToken.allowance(msg.sender, address(this)) >= amount, "stake amount must be less than approved transfer amount");
        console.log("proposal state: %s", uint(governor.state(proposalId)));
        require(uint256(governor.state(proposalId)) == 1, "proposal is no longer accepting votes");
        // create new position
        positions[currentPositionId] = Position(
            currentPositionId,
            msg.sender,
            amount,
            support,
            true
        );
        // store position and increment
        positionIdsByAddress[msg.sender].push(currentPositionId); 
        currentPositionId++;
        ////make transfer to no
        if (support == 0) {
            totalNo += amount;
            govToken.transferFrom(msg.sender, _noPool, amount);
        }
        //make transfer to yes
        if (support == 1) {
            totalYes += amount;
            govToken.transferFrom(msg.sender, _yesPool, amount);
        }
        // self-delegate and vote
        govToken.delegate(address(this));
        governor.castVote(proposalId, support);
    }
    

    // pure because it doesn't touch the blockchain
    function calculatePayout(uint positionAmount, uint positionSupport, uint8 winningSupport, uint totalWinning, uint totalLosing) private pure returns(uint) {
        if (positionSupport != winningSupport) {
            return 0;
        }
        return positionAmount + (positionAmount / totalWinning * totalLosing); // userPosition's fraction of the winning side, multiplied by the total payout from the losing side to calculate user position payout
    }

    function getPositionById(uint positionId) external view returns(Position memory) {
        return positions[positionId];
    }

    function getPositoinIdsForAddress(address walletAddress) external view returns(uint[] memory) {
        return positionIdsByAddress[walletAddress];
    }

    // close position and withdraw staked funds
    function closePosition(uint positionId) external {
        require(marketSettled, "market has not been settled yet");
        require(positions[positionId].walletAddress == msg.sender, "Only position creator may modify position");
        require(positions[positionId].open == true, "Position is closed");

        positions[positionId].open = false;
        uint proposalState = uint(governor.state(proposalId));
        if (proposalState == 2) { // cancelled, return funds
            govToken.transferFrom(address(this), msg.sender, positions[positionId].amount);
            return;
        }
        if (proposalState == 4) { // failed, no voters win
            uint userPayout = calculatePayout(positions[positionId].amount, positions[positionId].support, 0, totalNo, totalYes);
            govToken.transferFrom(address(this), msg.sender, userPayout);
        }
        if (proposalState == 7) { // executed, yes voters win
            uint userPayout = calculatePayout(positions[positionId].amount, positions[positionId].support, 1, totalYes, totalNo);
            govToken.transferFrom(address(this), msg.sender, userPayout);
        }
    }

    // settle market
    function settleMarket() external {
        require(marketSettled == false);
        uint proposalState = uint(governor.state(proposalId));
        require(proposalState == 2 || proposalState == 4 || proposalState == 7);
        marketSettled = true;
    }
}