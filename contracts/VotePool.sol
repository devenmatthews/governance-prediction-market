// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./mocks/GovTokenMock.sol";
import "./mocks/GovernorMock.sol";
import "hardhat/console.sol";

// title

contract VotePool {

   address _owner;
//    address public _govToken;
//    address public _governor;
    GovTokenMock public GovToken;
    GovernorMock public Governor;
   uint8 public _support;
   uint public _proposalId;

    modifier govBetsOnly{
        require(msg.sender == _owner);
        _;
    }

    constructor(address governor, address govToken, uint8 support, uint proposalId) {
        _owner = msg.sender;
        _support = support;
        _proposalId = proposalId;
        Governor = GovernorMock(payable(governor));
        GovToken = GovTokenMock(govToken);
    }

    function vote() govBetsOnly public {
        GovToken.delegate(address(this));
        Governor.castVote(_proposalId, _support);
    }

    function transfer(address recipient, uint value) govBetsOnly public {
        GovToken.transfer(recipient, value);
    }
}