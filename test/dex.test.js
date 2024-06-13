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

        assert.equal(reserve1.toString(), web3.utils.toWei('100', 'ether'));
        assert.equal(reserve2.toString(), web3.utils.toWei('100', 'ether'));
    });

    it("should swap tokens", async () => {
        const amountIn = web3.utils.toWei('10', 'ether');
        await myToken.approve(dex.address, amountIn, { from: accounts[0] });

        await dex.swap(myToken.address, amountIn, { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();

        assert.equal(reserve1.toString(), web3.utils.toWei('110', 'ether'));
        assert(reserve2.toString() < web3.utils.toWei('100', 'ether'));
    });

    it("should remove liquidity", async () => {
        await dex.removeLiquidity(web3.utils.toWei('50', 'ether'), web3.utils.toWei('50', 'ether'), { from: accounts[0] });

        const reserve1 = await dex.reserve1();
        const reserve2 = await dex.reserve2();

        assert.equal(reserve1.toString(), web3.utils.toWei('60', 'ether'));
        assert.equal(reserve2.toString(), web3.utils.toWei('60', 'ether'));
    });
});
