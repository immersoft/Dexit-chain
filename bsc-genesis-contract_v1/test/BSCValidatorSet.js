const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let addr5;
    let addr6;
    let addr7;
    let addr8;
    let addrs;
    let zeroAddress = `0x0000000000000000000000000000000000000000`;

    beforeEach(async function () {
        bscVali = await ethers.getContractFactory("BSCValidatorSet");
        // const arr = await ethers.getSigners();
        // console.log("Addresses", arr);
        [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, ...addrs] = await ethers.getSigners();
        bscValidatorSet = await bscVali.deploy();
        await bscValidatorSet.init();

    });

    /***************************Zero addresses**********************/
    describe("Zero Address Cases", async () => {
        it("Owner address can't be Zero Address", async () => {
            await expect(bscValidatorSet.owner + " ").not.be.equal(zeroAddress);
        });

        it("Validator address can't be Zero Address", async () => {
            await expect(bscValidatorSet.connect(zeroAddress).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })).to.be.reverted;
        });

        it("Delegator address can't be Zero address", async () => {
            await expect(bscValidatorSet.connect(zeroAddress).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })).to.be.reverted;
        });

        it("Validator unstake address can't be Zero Address", async () => {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await expect(bscValidatorSet.connect(zeroAddress).unstakeValidator()).to.be.reverted;
        });

        it("Delegator unstake address can't be Zero Address", async () => {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })
            await expect(bscValidatorSet.connect(zeroAddress).unstakeDelegators(addr1.address)).to.be.reverted;
        })
    });

    /**********************Init() Method**********************/
    describe("For init", function () {
        it("Address should not empty", async function () {
            //console.log("Address of bsc", bscValidatorSet.address);
            expect(await bscValidatorSet.address).not.be.empty;
        });
        it("Mesdemeanor Threshold should 20", async function () {
            expect(await bscValidatorSet.misdemeanorThreshold()).to.equal(2);
        });

        it("Felony Threshold should 40", async function () {
            expect(await bscValidatorSet.felonyThreshold()).to.equal(4);
        });

        it("Maximum Validator should 4", async function () {
            expect(await bscValidatorSet.MaxValidators()).to.equal(4);
        });
        it("Expire time second gap", async function () {
            expect(await bscValidatorSet.expireTimeSecondGap()).to.equal(1000);
        });
        it("Minimum Stake amount", async function () {
            const min = await bscValidatorSet.minimumStakeAmount();
            expect(min + "").to.equal("10000000000000000000");
        });
        it("Proposal Lasting period", async function () {
            expect(await bscValidatorSet.proposalLastingPeriod()).to.equal(3000);
        });
        it("Genesis address", async function () {
            const valInfo = await bscValidatorSet.getValidatorInfo("0x95eEcd42Ec27db6ea66c45c21289dA4D9092f475");
            expect(valInfo[0]).to.equal("0x95eEcd42Ec27db6ea66c45c21289dA4D9092f475");
        });
        it("Status of genesis", async function () {
            const valInfo = await bscValidatorSet.getValidatorInfo("0x95eEcd42Ec27db6ea66c45c21289dA4D9092f475");
            expect(valInfo[1]).to.equal(0);
        });
    });

    /*********************Stake Validator********************/
    describe("For stakeValidator", function () {
        it("Validator Should Stake", async function () {
            await bscValidatorSet.stakeValidator({
                value: ethers.utils.parseEther("10"),
            });
            const valInfo = await bscValidatorSet.getValidatorInfo(owner.address);

            expect(valInfo[2].toString()).to.equal("10000000000000000000"); //Compare the amount
            expect(valInfo[3].toString()).to.equal("10000000000000000000"); //Compare the coins
        });

        it("Validator can stake multiple times", async function () {
            await bscValidatorSet.stakeValidator({
                value: ethers.utils.parseEther("10"),
            });
            await bscValidatorSet.stakeValidator({
                value: ethers.utils.parseEther("5"),
            });
            const valInfo = await bscValidatorSet.getValidatorInfo(owner.address);
            expect(valInfo[2].toString()).to.equal("15000000000000000000"); //Compare the amount
            expect(valInfo[3].toString()).to.equal("15000000000000000000"); //Compare the coins
        });

        it("Validator Status Should Staked", async function () {
            await bscValidatorSet.stakeValidator({
                value: ethers.utils.parseEther("10"),
            });
            await bscValidatorSet.stakeValidator({
                value: ethers.utils.parseEther("5"),
            });
            const valInfo = await bscValidatorSet.getValidatorInfo(owner.address);
            expect(valInfo[1]).to.equal(2); //Comapre the status
        });

        it("Should revert if stake amount is less then min amount", async function () {
            await expect(bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("9"),
            })).to.be.reverted;
        });

        it("Should revert if stake amount is zero", async function () {
            await expect(bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("0"),
            })).to.be.reverted;
        });

        it("Check HighestValidator", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            const highVal = await bscValidatorSet.getHighestValidators();
            // console.log("High vali", highVal[0]); 
            expect(highVal[0]).to.equal(addr1.address);
            expect(highVal[1]).to.equal(addr2.address);
            expect(highVal[2]).to.equal(addr3.address);
            expect(highVal[3]).to.equal(addr4.address);
        });

        it("Validator Should Not Come In HighestValidator", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("40"),
            })

            const highVal = await bscValidatorSet.getHighestValidators();
            // console.log("validator should not High vali", highVal.length); 
            // console.log("addr1", addr1.address, addr2.address, addr3.address, addr4.address, addr5.address);

            expect(highVal[1]).not.equal(addr2.address);
        });

        it("Validator Should Come In HighestValidator if He Stake more than one time and his coins go high", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("7"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("40"),
            })

            const highVal = await bscValidatorSet.getHighestValidators();
            // console.log("validator should not High vali", highVal.length); 
            // console.log("addr1", addr1.address, addr2.address, addr3.address, addr4.address, addr5.address);
          
            expect(highVal[1]).to.equal(addr2.address);
        });

        it("Check CurrentValidator", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("35"),
            })
            const currVal = await bscValidatorSet.getCurrentValidators();
            //console.log("curr vali", currVal[0]); 
            expect(currVal[0]).to.equal(addr1.address);
            expect(currVal[1]).to.equal(addr2.address);
            expect(currVal[2]).to.equal(addr3.address);
            expect(currVal[3]).to.equal(addr4.address);
            expect(currVal[4]).to.equal(addr5.address);
        });

        it("Check Total DXT", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("35"),
            })

            const total = await bscValidatorSet.totalDXTStake();
            expect(total).to.equal("125000000000000000000");
        });
    });

    /********************UnStake validator*******************/
    describe("For Unstake And Withdraw Validator", function () {
        it("Should unstake", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            //const ownerBalance = await betting.balanceOf(owner.address);//To check the amount of perticular address

            const highVal = await bscValidatorSet.getHighestValidators();
            // console.log("Check HVL", highVal[0]);

            await bscValidatorSet.connect(addr1).unstakeValidator();

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr1.address, addr1.address);

            //console.log("Unstake block", stakeInfo[2]);
            //expect(stakeInfo[2]).to.equal("56");
            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
        });

        it("Should Not Withdraw Until Locking Period Expired", async function () {
            const addrAmt1 = await bscValidatorSet.getBalance(addr1.address);
            //console.log("Before Stake amt is:", addrAmt1);

            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"), })
                
            const addrAmt2 = await bscValidatorSet.getBalance(addr1.address);
            //console.log("After Stake, amt is:", addrAmt2);

            const blockNum = await bscValidatorSet.getBlockNumber();
            //console.log("Before unstak block Number", blockNum);

            await bscValidatorSet.connect(addr1).unstakeValidator(); 

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
           // console.log("addr1 amt:", valInfo[2]);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr1.address, addr1.address);

            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            expect(valInfo[2]).to.equal("20000000000000000000");
        });

        it("Should Withdraw After Locking Period Expired", async function () {
            const addrAmt1 = await bscValidatorSet.getBalance(addr1.address);
            //console.log("Before Stake amt is:", addrAmt1);

            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"), })
                
            const addrAmt2 = await bscValidatorSet.getBalance(addr1.address);
            //console.log("After Stake, amt is:", addrAmt2);

            const blockNum = await bscValidatorSet.getBlockNumber();
            //console.log("Before unstak block Number", blockNum);

            await bscValidatorSet.connect(addr1).unstakeValidator(); 

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
           // console.log("addr1 amt:", valInfo[2]);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr1.address, addr1.address);

            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            const blockNum2 = await bscValidatorSet.getBlockNumber();
           // console.log("Before unstak block Number", blockNum2);
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000")).to.be.reverted;

            const blockNum3 = await bscValidatorSet.getBlockNumber();
            //console.log("Before unstak block Number", blockNum3);

            await bscValidatorSet.connect(addr1).withdrawValidatorStaking("7000000000000000000");
            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            //console.log("After withdrawaddr1 amt:", valInfo1[2]);
            expect(valInfo1[2]).to.equal("13000000000000000000");
        });

        it("Should Revert If His remaining amount less than 10 when he tries to withdraw", async function () {
            const addrAmt1 = await bscValidatorSet.getBalance(addr1.address);
            //console.log("Before Stake amt is:", addrAmt1);

            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"), })
                
            const addrAmt2 = await bscValidatorSet.getBalance(addr1.address);
            //console.log("After Stake, amt is:", addrAmt2);

            const blockNum = await bscValidatorSet.getBlockNumber();
            //console.log("Before unstak block Number", blockNum);

            await bscValidatorSet.connect(addr1).unstakeValidator(); 

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
           // console.log("addr1 amt:", valInfo[2]);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr1.address, addr1.address);

            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            const blockNum2 = await bscValidatorSet.getBlockNumber();
            //console.log("Before unstak block Number", blockNum2);
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;

            const blockNum3 = await bscValidatorSet.getBlockNumber();
            //console.log("Before unstak block Number", blockNum3);

            await expect(bscValidatorSet.connect(addr1).withdrawValidatorStaking("17000000000000000000")).to.be.reverted;
            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            //console.log("After withdrawaddr1 amt:", valInfo1[2]);
            expect(valInfo1[2]).to.equal("20000000000000000000");
        });

        it("Should Change the Status unstaked", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            //const ownerBalance = await betting.balanceOf(owner.address);//To check the amount of perticular address

            await bscValidatorSet.connect(addr1).unstakeValidator();

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr1.address, addr1.address);

            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo[1]).to.equal(3);//Check the status(should Unstaked)
        });

        it("Should remove from Highest Validator List", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })

            const highVal = await bscValidatorSet.getHighestValidators();
            //console.log("HVL length", highVal.length);
            // console.log("Check HVL", highVal[0]);

            await bscValidatorSet.connect(addr1).unstakeValidator();
            const highVal1 = await bscValidatorSet.getHighestValidators();
            //console.log("HVL length After Unstake", highVal1.length);

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr1.address, addr1.address);
            expect(highVal1[0]).not.equal(addr1.address);
            //console.log("Address of addr1", highVal1[0]);
            //expect(stakeInfo[2]).to.equal("56");
            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
        });

        it("Should Not Remove From Current Validator List", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })

            const currVal = await bscValidatorSet.getCurrentValidators();
            //console.log("CVL length", currVal.length);
            // console.log("Check CVL", currVal[0]);

            await bscValidatorSet.connect(addr1).unstakeValidator();
            const currVal1 = await bscValidatorSet.getCurrentValidators();
            //console.log("CVL length After Unstake", currVal1.length);

            expect(currVal1[0]).to.equal(addr1.address);
        });

        it("Should not change the Total DXT after Unstake", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })

            const totalDXT = await bscValidatorSet.totalDXTStake();
            //console.log("Before totalDXT", totalDXT);
            expect(totalDXT).to.equal("90000000000000000000");

            await bscValidatorSet.connect(addr1).unstakeValidator();
            expect(totalDXT).to.equal("90000000000000000000");
            //console.log("After totalDXT", totalDXT);
        });

        it("Validator Can't Unstake If HVL is 3", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await expect(bscValidatorSet.connect(addr1).unstakeValidator()).to.be.reverted;

        });
    });

    /************************Stake Delegator************************/
    describe("For Stake Delegator", function () {
        it("Should Delegate", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            //const ownerBalance = await betting.balanceOf(owner.address);//To check the amount of perticular address

            const highVal = await bscValidatorSet.getHighestValidators();

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            expect(stakeInfo[1]).to.equal("5000000000000000000");
            //console.log("Amount",valInfo);
            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo[1]).to.equal(2);
            expect(valInfo[6][0]).to.equal(addr5.address);
        });

        it("Should Delegator Stake Multiple Times", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            //const ownerBalance = await betting.balanceOf(owner.address);//To check the amount of perticular address

            const highVal = await bscValidatorSet.getHighestValidators();

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("6"),
            })
            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("4"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            expect(stakeInfo[1]).to.equal("10000000000000000000");//Delegator Amount
            //console.log("Amount",valInfo);
            expect(valInfo[3]).to.equal("30000000000000000000"); //Compare the coins
            expect(valInfo[1]).to.equal(2);
            expect(valInfo[6][0]).to.equal(addr5.address);
        });

        it("Should Multiple Delegators Stake in Particular Validator", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            //const ownerBalance = await betting.balanceOf(owner.address);//To check the amount of perticular address

            const highVal = await bscValidatorSet.getHighestValidators();

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("6"),
            })
            await bscValidatorSet.connect(addr6).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("4"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            const stakeInfo1 = await bscValidatorSet.getStakingInfo(addr6.address, addr1.address);
            expect(stakeInfo[1]).to.equal("6000000000000000000");//Delegator Amount
            expect(stakeInfo1[1]).to.equal("4000000000000000000");//Delegator Amount
            //console.log("Amount",valInfo);
            expect(valInfo[3]).to.equal("30000000000000000000"); //Compare the coins
            expect(valInfo[1]).to.equal(2);
            expect(valInfo[6][0]).to.equal(addr5.address);
            expect(valInfo[6][1]).to.equal(addr6.address);
        });

        it("Should Update the Coins", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })

            const highVal = await bscValidatorSet.getHighestValidators();

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);

            expect(stakeInfo[1]).to.equal("5000000000000000000");
            expect(valInfo[3]).to.equal("25000000000000000000");//Coins
        });

        it("Should Update the TotalDXT", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })

            const totalDxt = await bscValidatorSet.totalDXTStake();
            expect(totalDxt).to.equal("90000000000000000000");

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const totalDxt1 = await bscValidatorSet.totalDXTStake();
            expect(totalDxt1).to.equal("95000000000000000000");
        });

        it("Should revert if Delegator stake amount is zero", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await expect(bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("0"),
            })).to.be.reverted;
        });

        it("Should revert if Validator not exist stake amount is zero", async function () {
            await expect(bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })).to.be.reverted;
        });
    });

    /**************************Unstake Delegator*************************/
    describe("Unstake Delegator", function () {
        it("Should Unstake By the Delegator", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr3).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })
            await bscValidatorSet.connect(addr4).stakeValidator({
                value: ethers.utils.parseEther("30"),
            })
            //const ownerBalance = await betting.balanceOf(owner.address);//To check the amount of perticular address

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);

            await bscValidatorSet.connect(addr5).unstakeDelegators(addr1.address);
            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo1 = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            expect(stakeInfo1[1]).to.equal("5000000000000000000");
            //console.log("Amount",valInfo);
            expect(valInfo1[2]).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo1[3]).to.equal("25000000000000000000");//Coins
            expect(valInfo1[1]).to.equal(2);
            expect(stakeInfo[2]).to.equal("0");
            expect(valInfo1[6][0]).to.equal(addr5.address);
        });

        it("Unstake Delegator should not change the totalDXT, amount & Coins", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            const totalDXT = await bscValidatorSet.totalDXTStake();
            expect(totalDXT).to.equal("25000000000000000000")
            expect(stakeInfo[1]).to.equal("5000000000000000000");
            //console.log("Amount",valInfo);
            expect(valInfo[2]).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo[3]).to.equal("25000000000000000000");//Coins
            expect(valInfo[1]).to.equal(2);
            expect(valInfo[6][0]).to.equal(addr5.address);

            await bscValidatorSet.connect(addr5).unstakeDelegators(addr1.address);
            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            const stakeInfo1 = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            const totalDxt1 = await bscValidatorSet.totalDXTStake();
            expect(totalDxt1).to.equal("25000000000000000000")
            expect(stakeInfo1[1]).to.equal("5000000000000000000");
            //console.log("Amount",valInfo);
            expect(valInfo1[2]).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo1[3]).to.equal("25000000000000000000");//Coins
            expect(valInfo1[1]).to.equal(2);
            expect(stakeInfo[2]).to.equal("0");
            expect(valInfo1[6][0]).to.equal(addr5.address);
        });

        it("Should not stake by the delegator if val is not exist", async function () {
            await expect(bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })).to.be.reverted;
        });

    });

    describe("Withdraw Delegator", function () {
        it("Deligator Should Withdraw The Amount", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })
            const totalDXT = await bscValidatorSet.totalDXTStake();
            expect(totalDXT).to.equal("25000000000000000000");

            await bscValidatorSet.connect(addr5).unstakeDelegators(addr1.address);

            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            expect(stakeInfo[1]).to.equal("5000000000000000000"); //Compare the amount

            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000")).to.be.reverted;

            const blockNum3 = await bscValidatorSet.getBlockNumber();
           // console.log("Before unstak block Number", blockNum3);

            await bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"3000000000000000000");

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            //console.log("After withdrawaddr1 Coins are:", valInfo1[3]);
            expect(valInfo1[3]).to.equal("22000000000000000000");

            const totalDXT2 = await bscValidatorSet.totalDXTStake();
            expect(totalDXT2).to.equal("22000000000000000000");

           
            const stakeInfo1 = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            //console.log("After withdrawaddr1 Deligator amt is", stakeInfo1[1]);
            expect(stakeInfo1[1]).to.equal("2000000000000000000");
        });

        it("Deligator Should Not Withdraw The More Amount Then Stake Amount", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })
            const totalDXT = await bscValidatorSet.totalDXTStake();
            expect(totalDXT).to.equal("25000000000000000000");

            await bscValidatorSet.connect(addr5).unstakeDelegators(addr1.address);

            const stakeInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            expect(stakeInfo[1]).to.equal("5000000000000000000"); //Compare the amount

            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;
            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;

            const blockNum3 = await bscValidatorSet.getBlockNumber();
            //console.log("Before unstak block Number", blockNum3);

            await expect(bscValidatorSet.connect(addr5).withdrawDelegatorStaking(addr1.address,"15000000000000000000")).to.be.reverted;

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            //console.log("After withdrawaddr1 Coins are:", valInfo1[3]);
            expect(valInfo1[3]).to.equal("25000000000000000000");

            const totalDXT2 = await bscValidatorSet.totalDXTStake();
            expect(totalDXT2).to.equal("25000000000000000000");

           
            const stakeInfo1 = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            //console.log("After withdrawaddr1 Deligator amt is", stakeInfo1[1]);
            expect(stakeInfo1[1]).to.equal("5000000000000000000");
        });
    })

    /**************************Deposit***********************/
    describe("Deposit or Income", function () {
        it("Should Validator Get the income", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })

            await bscValidatorSet.connect(addr5).deposit(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);

            expect(valInfo[2]).to.equal("20000000000000000000");
            expect(valInfo[4]).to.equal("5000000000000000000");
            //console.log("Addr1 Income", valInfo[4]);
        });

        it("Should Validator & Delegator Get The Income", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr2).stakeValidator({
                value: ethers.utils.parseEther("25"),
            })

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("15"),
            })
            await bscValidatorSet.connect(addr6).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("10"),
            })

            await bscValidatorSet.connect(addr8).deposit(addr1.address, {
                value: ethers.utils.parseEther("45"),
            })

            const Addr8Balance1 = await bscValidatorSet.getBalance(addr8.address);
            //console.log("After addr8 balance", Addr8Balance1);

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            const delInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            const delInfo1 = await bscValidatorSet.getStakingInfo(addr6.address, addr1.address);

            expect(valInfo[2]).to.equal("20000000000000000000");
            expect(valInfo[4]).to.equal("19800000000000000000");
            expect(delInfo[4]).to.equal("15120000000000000000");
            expect(delInfo1[4]).to.equal("10080000000000000000");
            // console.log("Addr1 Income", valInfo[4]);
            // console.log("Addr5 Income", delInfo[4]);
            // console.log("addr6 Income", delInfo1[4]);
        });

        it("Should Validator Claim The Income", async function () {
            const Addr1Balance = await bscValidatorSet.getBalance(addr1.address);
            //console.log("Before addr1 balance", Addr1Balance);

            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            const Addr1Balance2 = await bscValidatorSet.getBalance(addr1.address);
            //console.log("After Stake addr1 balance", Addr1Balance2);

            await bscValidatorSet.connect(addr8).deposit(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(valInfo[4]).to.equal("5000000000000000000");

            //console.log("Address1 Income", valInfo[4]);

            await bscValidatorSet.connect(addr1).claimValidatorReward();
            const Addr5Balance1 = await bscValidatorSet.getBalance(addr1.address);
           // console.log("Before addr5 balance", Addr5Balance1);

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(valInfo1[4]).to.equal("0000000000000000000");
            
           // console.log("After Claim Address1 Income", valInfo[4]);
        });

        it("Validator Should Not Claim The Income Until The Locking Period Expired", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"), })

            await bscValidatorSet.connect(addr8).deposit(addr1.address, {
                value: ethers.utils.parseEther("5"), })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(valInfo[4]).to.equal("5000000000000000000");

            //console.log("Expect Addr1 Income", valInfo[4]);
            const AddrBalance = await bscValidatorSet.getBalance(addr1.address);
            // console.log("Before", AddrBalance);

            const claim = await bscValidatorSet.connect(addr1).claimValidatorReward();
            //expect(valInfo[4]).to.equal("000000000000000000");
            const Addr1Balance = await bscValidatorSet.getBalance(addr1.address);
            //console.log("After", Addr1Balance);
            const income = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(income[4]).to.equal("0000000000000000000");
            //console.log("Income", income[4]);

            await bscValidatorSet.connect(addr8).deposit(addr1.address, {
                value: ethers.utils.parseEther("7"), })

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(valInfo1[4]).to.equal("7000000000000000000");
            await expect(bscValidatorSet.connect(addr1).claimValidatorReward()).to.be.reverted;

            const valInfo2 = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(valInfo2[4]).to.equal("7000000000000000000");
            //console.log("Second time income", valInfo2[4]);
        });

        it("Daligator Should Not Claim The Income Until Locking Perioed Expired", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"), })

            await bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("15"), })

                const Addr1Balance2 = await bscValidatorSet.getBalance(addr5.address);
            //console.log("After Stake addr1 balance", Addr1Balance2);

            await bscValidatorSet.connect(addr8).deposit(addr1.address, {
                value: ethers.utils.parseEther("35"), })

            const valInfo = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            //console.log("Address1 Income", valInfo[4]); 

            await bscValidatorSet.connect(addr5).claimDelegatorReward(addr1.address);

            const Addr5Balance1 = await bscValidatorSet.getBalance(addr6.address);
            //console.log("After addr5 balance", Addr5Balance1);

            await bscValidatorSet.connect(addr8).deposit(addr1.address, {
                value: ethers.utils.parseEther("15"), })

            const delInfo1 = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);
            await expect(bscValidatorSet.connect(addr5).claimDelegatorReward(addr1.address)).to.be.reverted;
            const delInfo2 = await bscValidatorSet.getStakingInfo(addr5.address, addr1.address);

            expect(delInfo2[4]).to.equal("6450000000000000000");
        
            // console.log("After Claim Address5 Income", delInfo1[4]);
            // console.log("After Claim Address6 Income", delInfo2[4]);
        });

    });

    describe("Punish Or Jailing", function () {
        it("Validator Status Should Jail At FelonyThreshold", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })
            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);

            expect(valInfo[2].toString()).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo[1]).to.equal(2);

            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(valInfo1[2].toString()).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo1[1]).to.equal(4);
        });

        it("Validator Income Should Distribute To Other Validators At MisdemeanorThreshold", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })

            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })

            await bscValidatorSet.connect(addr6).deposit(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);
            expect(valInfo[1]).to.equal(2);
            expect(valInfo[4]).to.equal("5000000000000000000")

            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            const valInfo2 = await bscValidatorSet.getValidatorInfo(addr5.address);
            expect(valInfo2[4]).to.equal("5000000000000000000");
            // console.log("address 5 Income:", valInfo2[4]);
            expect(valInfo1[1]).to.equal(2);
            //console.log("Addr1 Income after MistThre:", valInfo1[4]);
            expect(valInfo1[4]).to.equal("0000000000000000000")
        });

        it("Validator Should Not Stake After Jail At FelonyThreshold", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })

            await bscValidatorSet.connect(addr6).deposit(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);

            expect(valInfo[2].toString()).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo[1]).to.equal(2); //Comapre the Status

            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            const valInfo2 = await bscValidatorSet.getValidatorInfo(addr5.address);
            expect(valInfo2[4]).to.equal("5000000000000000000");
            expect(valInfo1[1]).to.equal(4);
            
            await expect(bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })).to.be.reverted;
        });

        it("Validator Should Not UnStake After Jail At FelonyThreshold", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })

            await bscValidatorSet.connect(addr6).deposit(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);

            expect(valInfo[2].toString()).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo[1]).to.equal(2); //Comapre the Status

            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            const valInfo2 = await bscValidatorSet.getValidatorInfo(addr5.address);
            expect(valInfo2[4]).to.equal("5000000000000000000");
            expect(valInfo1[1]).to.equal(4);
            
            await expect(bscValidatorSet.connect(addr1).unstakeValidator()).to.be.reverted;
        });

        it("Deligator Should Not Stake In Jailed Validator", async function () {
            await bscValidatorSet.connect(addr1).stakeValidator({
                value: ethers.utils.parseEther("20"),
            })
            await bscValidatorSet.connect(addr5).stakeValidator({
                value: ethers.utils.parseEther("15"),
            })

            await bscValidatorSet.connect(addr6).deposit(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })

            const valInfo = await bscValidatorSet.getValidatorInfo(addr1.address);

            expect(valInfo[2].toString()).to.equal("20000000000000000000"); //Compare the amount
            expect(valInfo[1]).to.equal(2); //Comapre the Status

            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);
            await bscValidatorSet.connect(addr5).slash(addr1.address);

            const valInfo1 = await bscValidatorSet.getValidatorInfo(addr1.address);
            const valInfo2 = await bscValidatorSet.getValidatorInfo(addr5.address);
            expect(valInfo2[4]).to.equal("5000000000000000000");
            expect(valInfo1[1]).to.equal(4);

            await expect(bscValidatorSet.connect(addr5).stakeDelegator(addr1.address, {
                value: ethers.utils.parseEther("5"),
            })).to.be.reverted;
        });

    });


});

