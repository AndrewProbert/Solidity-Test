const MyToken = artifacts.require("MyToken");
const StableCoin = artifacts.require("StableCoin");

module.exports = async function(deployer) {
    await deployer.deploy(MyToken, web3.utils.toWei('100', 'ether'));
    await deployer.deploy(StableCoin, web3.utils.toWei('100', 'ether'));
};
