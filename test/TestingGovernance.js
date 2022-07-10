const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe('Voting', function(){
    
    beforeEach(async function(){
        [signer1, signer2] = await ethers.getSigners(); //instances that act on behalf of wallets

        GovToken = await ethers.getContractFactory('GovTokenMock', signer1);

        govToken = await GovToken.deploy({})

        Governor = await ethers.getContractFactory('GovernorMock', signer1);

        governor = await Governor.deploy(
            govToken.address
        )

        //distribute tokens
        govToken.mint(signer1.address, 100)
        govToken.mint(signer2.address, 500)
        govToken.mint(governor.address, 100)
        expect(await govToken.balanceOf(signer1.address)).to.equal(100)
        expect(await govToken.balanceOf(governor.address)).to.equal(100)
        expect(await govToken.balanceOf(signer2.address)).to.equal(500)

        //self-delegate
        govToken.connect(signer1).delegate(signer1.address)
        govToken.connect(signer2).delegate(signer2.address)
        await ethers.provider.send('evm_mine');
        expect(await govToken.getVotes(signer1.address)).to.equal(100)
        expect(await govToken.getVotes(signer2.address)).to.equal(500)

        //create proposal to tranfer 100 tokens to signer2
        transferCalldata = govToken.interface.encodeFunctionData('transfer', [signer2.address, 100]);
        //propose
        propId = await governor.propose(
            [govToken.address],
            [0],
            [transferCalldata],
            "Proposal #1: give signer2 100 tokens",
            );
        //calculate proposal hash
        descriptionHash = ethers.utils.id("Proposal #1: give signer2 100 tokens");
        _hashProposal = governor.hashProposal(
            [govToken.address],
            [0],
            [transferCalldata],
            descriptionHash,
            )
        
        //check state for pending and no votes
        expect(await governor.state(_hashProposal)).to.equals(0)
        expect(await governor.hasVoted(_hashProposal, signer1.address)).to.equal(false)
    })

    describe('Proposal Tests', function(){
        it('simply passed proposal', async function() {
            //vote yes
            await governor.connect(signer1).castVote(_hashProposal, 1)
            await governor.connect(signer2).castVote(_hashProposal, 1)
            await ethers.provider.send('evm_mine');

            //check vote history
            const latestBlock = await ethers.provider.getBlock("latest")
            await ethers.provider.send('evm_mine');
            const votes1 = await governor.getVotes(signer1.address, latestBlock.number)
            const hasVoted1 = await governor.hasVoted(_hashProposal, signer1.address,)
            expect(hasVoted1).to.equal(true)
            expect(votes1).to.equal(100)

            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');
            await ethers.provider.send('evm_mine');


             //check proposal has successfully passed
            expect(await governor.state(_hashProposal)).to.equals(4)
            //execute
            await governor.execute(
                [govToken.address],
                [0],
                [transferCalldata],
                descriptionHash,
            )
            //check state for executed
            expect(await governor.state(_hashProposal)).to.equals(7)
            //verify executed action
            expect(await govToken.balanceOf(signer2.address)).to.equal(600)

        })

        it('simply failed proposal', async function() {
            //vote yes
            await governor.connect(signer1).castVote(_hashProposal, 0)
            await governor.connect(signer2).castVote(_hashProposal, 0)
            await ethers.provider.send('evm_mine');

            //check vote history
            const latestBlock = await ethers.provider.getBlock("latest")
            await ethers.provider.send('evm_mine');
            const votes1 = await governor.getVotes(signer1.address, latestBlock.number)
            const hasVoted1 = await governor.hasVoted(_hashProposal, signer1.address)
            expect(hasVoted1).to.equal(true)
            expect(votes1).to.equal(100)

        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');


             //check proposal has successfully failed
            expect(await governor.state(_hashProposal)).to.equals(3)
            //verify has not executed
            expect(await govToken.balanceOf(signer2.address)).to.equal(500)
        })
    })
})


describe('Staking', function(){
    
    beforeEach(async function(){
        [signer1, signer2] = await ethers.getSigners(); //instances that act on behalf of wallets

        GovToken = await ethers.getContractFactory('GovTokenMock', signer1);

        govToken = await GovToken.deploy({})

        Governor = await ethers.getContractFactory('GovernorMock', signer1);

        governor = await Governor.deploy(
            govToken.address
        )

        //distribute tokens
        govToken.mint(signer1.address, 100)
        govToken.mint(signer2.address, 500)
        govToken.mint(governor.address, 100)
        expect(await govToken.balanceOf(signer1.address)).to.equal(100)
        expect(await govToken.balanceOf(governor.address)).to.equal(100)
        expect(await govToken.balanceOf(signer2.address)).to.equal(500)

        //self-delegate
        govToken.connect(signer1).delegate(signer1.address)
        govToken.connect(signer2).delegate(signer2.address)
        await ethers.provider.send('evm_mine');
        expect(await govToken.getVotes(signer1.address)).to.equal(100)
        expect(await govToken.getVotes(signer2.address)).to.equal(500)

        //create proposal to tranfer 100 tokens to signer2
        transferCalldata = govToken.interface.encodeFunctionData('transfer', [signer2.address, 100]);
        //propose
        propId = await governor.propose(
            [govToken.address],
            [0],
            [transferCalldata],
            "Proposal #1: give signer2 100 tokens",
            );
        //calculate proposal hash
        descriptionHash = ethers.utils.id("Proposal #1: give signer2 100 tokens");
        _hashProposal = governor.hashProposal(
            [govToken.address],
            [0],
            [transferCalldata],
            descriptionHash,
            )
        
        //check state for pending and no votes
        expect(await governor.state(_hashProposal)).to.equals(0)
        expect(await governor.hasVoted(_hashProposal, signer1.address)).to.equal(false)
    })

describe('Staking Tests', function(){
    it('Passed proposal Staking Test', async function() {

        stateU = await governor.state(_hashProposal)
        console.log(stateU)

        Staking = await ethers.getContractFactory('Staking', signer1);

        staking = await Staking.deploy(
            govToken.address,
            governor.address,
            _hashProposal
        )

        stateU = await governor.state(_hashProposal)
        console.log(stateU)

        //approve gov Tokens
        await govToken.connect(signer1).approve(staking.address, 10)
        await govToken.connect(signer2).approve(staking.address, 500)
        await ethers.provider.send('evm_mine');

        //signer1 stakes 100 No; signer2 stakes 500 Yes
        stateU = await governor.state(_hashProposal)
        console.log(stateU)
        await staking.connect(signer1).stakeVote(10, 0)

       //await ethers.provider.send('evm_mine')
        await staking.connect(signer2).stakeVote(500, 1)
        await ethers.provider.send('evm_mine')
        //check vote history
        staking.connect(signer2).settleMarket()
        await ethers.provider.send('evm_mine');
        const latestBlock = await ethers.provider.getBlock("latest")
        await ethers.provider.send('evm_mine');
        const hasVoted1 = await governor.hasVoted(_hashProposal, await staking.getYesPool())
        expect(hasVoted1).to.equal(true)

        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');


         //check proposal has successfully passed
        expect(await governor.state(_hashProposal)).to.equals(3)
        //execute
        // await governor.execute(
        //     [govToken.address],
        //     [0],
        //     [transferCalldata],
        //     descriptionHash,
        // )
        // check state for executed
        //expect(await governor.state(_hashProposal)).to.equals(7)
        // verify executed action
        //expect(await govToken.balanceOf(signer2.address)).to.equal(600)
        //await ethers.provider.send('evm_mine');
        // settle market and close positions
        previousBalance = await govToken.balanceOf(signer1.address);
        staking.connect(signer1).closePosition(0);
        console.log(previousBalance)
        await ethers.provider.send('evm_mine');
        console.log(await govToken.balanceOf(signer1.address))
        //require((await govToken.balanceOf(signer2.address)) > previousBalance);


    })
})
})