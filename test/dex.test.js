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

        console.log("Adding liquidity...");
        await dex.addLiquidity(web3.utils.toWei('100', 'ether'), web3.utils.toWei('100', 'ether'), { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();
        const spotPriceToken1Before = await dex.getSpotPrice(myToken.address);
        const spotPriceToken2Before = await dex.getSpotPrice(stableCoin.address);

        console.log("Reserve 1:", reserve1.toString());
        console.log("Reserve 2:", reserve2.toString());
        console.log("Spot Price Token 1 (Before):", web3.utils.fromWei(spotPriceToken1Before.toString(), 'ether'));
        console.log("Spot Price Token 2 (Before):", web3.utils.fromWei(spotPriceToken2Before.toString(), 'ether'));

        expect(reserve1.toString()).to.equal(web3.utils.toWei('100', 'ether'));
        expect(reserve2.toString()).to.equal(web3.utils.toWei('100', 'ether'));
    });

    it("should swap tokens", async () => {
        const amountIn = web3.utils.toWei('10', 'ether');
        await myToken.approve(dex.address, amountIn, { from: accounts[0] });

        console.log("Swapping tokens...");
        await dex.swap(myToken.address, amountIn, { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();
        const spotPriceToken1After = await dex.getSpotPrice(myToken.address);
        const spotPriceToken2After = await dex.getSpotPrice(stableCoin.address);

        console.log("Reserve 1:", reserve1.toString());
        console.log("Reserve 2:", reserve2.toString());
        console.log("Spot Price Token 1 (After):", web3.utils.fromWei(spotPriceToken1After.toString(), 'ether'));
        console.log("Spot Price Token 2 (After):", web3.utils.fromWei(spotPriceToken2After.toString(), 'ether'));

        expect(Number(reserve1.toString())).to.equal(Number(web3.utils.toWei('110', 'ether')));
        expect(Number(reserve2.toString())).to.be.below(Number(web3.utils.toWei('100', 'ether')));
    });

    it("should get spot price", async () => {
        const spotPriceToken1 = await dex.getSpotPrice(myToken.address);
        const spotPriceToken2 = await dex.getSpotPrice(stableCoin.address);

        console.log("Spot Price Token 1:", web3.utils.fromWei(spotPriceToken1.toString(), 'ether'));
        console.log("Spot Price Token 2:", web3.utils.fromWei(spotPriceToken2.toString(), 'ether'));

        expect(Number(spotPriceToken1)).to.be.above(0);
        expect(Number(spotPriceToken2)).to.be.above(0);
    });


    it("should remove liquidity", async () => {
        const initialReserve1 = await dex.reserve1();
        const initialReserve2 = await dex.reserve2();

        console.log("Removing liquidity...");
        await dex.removeLiquidity(web3.utils.toWei('50', 'ether'), web3.utils.toWei('50', 'ether'), { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();
        const spotPriceToken1Before = await dex.getSpotPrice(myToken.address);
        const spotPriceToken2Before = await dex.getSpotPrice(stableCoin.address);

        console.log("Reserve 1:", reserve1.toString());
        console.log("Reserve 2:", reserve2.toString());
        console.log("Spot Price Token 1 (Before):", web3.utils.fromWei(spotPriceToken1Before.toString(), 'ether'));
        console.log("Spot Price Token 2 (Before):", web3.utils.fromWei(spotPriceToken2Before.toString(), 'ether'));

        expect(reserve1.toString()).to.equal(initialReserve1.sub(new web3.utils.BN(web3.utils.toWei('50', 'ether'))).toString());
        expect(reserve2.toString()).to.equal(initialReserve2.sub(new web3.utils.BN(web3.utils.toWei('50', 'ether'))).toString());
    });
});
