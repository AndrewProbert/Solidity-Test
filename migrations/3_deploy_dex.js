const Dex = artifacts.require("Dex");
const MyToken = artifacts.require("MyToken");
const StableCoin = artifacts.require("StableCoin");

module.exports = async function(deployer) {
    const myToken = await MyToken.deployed();
    const stableCoin = await StableCoin.deployed();

    await deployer.deploy(Dex, myToken.address, stableCoin.address);
};
