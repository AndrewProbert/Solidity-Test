let expect;

before(async () => {
    // Dynamically import chai
    const chai = await import('chai');
    expect = chai.expect;
});

const MyToken = artifacts.require("MyToken");
const StableCoin = artifacts.require("StableCoin");
const Dex = artifacts.require("Dex");

contract("Dex", accounts => {
    let myToken;
    let stableCoin;
    let dex;

    before(async () => {
        myToken = await MyToken.deployed();
        stableCoin = await StableCoin.deployed();
        dex = await Dex.deployed();
    });

    it("should add liquidity", async () => {
        await myToken.approve(dex.address, web3.utils.toWei('100', 'ether'), { from: accounts[0] });
        await stableCoin.approve(dex.address, web3.utils.toWei('100', 'ether'), { from: accounts[0] });

        await dex.addLiquidity(web3.utils.toWei('100', 'ether'), web3.utils.toWei('100', 'ether'), { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();

        expect(reserve1.toString()).to.equal(web3.utils.toWei('100', 'ether'));
        expect(reserve2.toString()).to.equal(web3.utils.toWei('100', 'ether'));

        console.log("Add Liquidity Details:");
        
        console.log("Reserve 1:", web3.utils.fromWei(reserve1.toString(), 'ether'), "MyToken");
        console.log("Reserve 2:", web3.utils.fromWei(reserve2.toString(), 'ether'), "StableCoin");
        console.log("Price:", (reserve1 / reserve2).toString());


    });

    it("should swap tokens", async () => {
        const amountIn = web3.utils.toWei('10', 'ether');
        await myToken.approve(dex.address, amountIn, { from: accounts[0] });

        await dex.swap(myToken.address, amountIn, { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();

        expect(Number(reserve1.toString())).to.equal(Number(web3.utils.toWei('110', 'ether')));
        expect(Number(reserve2.toString())).to.be.below(Number(web3.utils.toWei('100', 'ether')));

        console.log("Swap Details:");
        console.log("Amount In:", web3.utils.fromWei(amountIn, 'ether'), "MyToken");
        console.log("Reserve 1:", web3.utils.fromWei(reserve1.toString(), 'ether'), "MyToken");
        console.log("Reserve 2:", web3.utils.fromWei(reserve2.toString(), 'ether'), "StableCoin");
        console.log("Price:", (reserve1 / reserve2).toString());
    });

    it("should remove liquidity", async () => {
        const initialReserve1 = await dex.reserve1();
        const initialReserve2 = await dex.reserve2();

        await dex.removeLiquidity(web3.utils.toWei('50', 'ether'), web3.utils.toWei('50', 'ether'), { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();

        expect(reserve1.toString()).to.equal(initialReserve1.sub(new web3.utils.BN(web3.utils.toWei('50', 'ether'))).toString());
        expect(reserve2.toString()).to.equal(initialReserve2.sub(new web3.utils.BN(web3.utils.toWei('50', 'ether'))).toString());

        console.log("Remove Liquidity Details:");
        console.log("Initial Reserve 1:", web3.utils.fromWei(initialReserve1.toString(), 'ether'), "MyToken");
        console.log("Initial Reserve 2:", web3.utils.fromWei(initialReserve2.toString(), 'ether'), "StableCoin");
        console.log("Reserve 1:", web3.utils.fromWei(reserve1.toString(), 'ether'));
        console.log("Reserve 2:", web3.utils.fromWei(reserve2.toString(), 'ether'));
        console.log("Price:", (reserve1 / reserve2).toString());



    });
});
