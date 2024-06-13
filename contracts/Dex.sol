// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dex is Ownable(msg.sender) {
    IERC20 public token1;
    IERC20 public token2;

    uint256 public reserve1;
    uint256 public reserve2;

    event LiquidityAdded(address indexed provider, uint256 amount1, uint256 amount2);
    event LiquidityRemoved(address indexed provider, uint256 amount1, uint256 amount2);
    event Swapped(address indexed swapper, address inputToken, uint256 inputAmount, address outputToken, uint256 outputAmount);

    constructor(address _token1, address _token2) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function addLiquidity(uint256 amount1, uint256 amount2) external onlyOwner {
        token1.transferFrom(msg.sender, address(this), amount1);
        token2.transferFrom(msg.sender, address(this), amount2);

        reserve1 += amount1;
        reserve2 += amount2;

        emit LiquidityAdded(msg.sender, amount1, amount2);
    }

    function removeLiquidity(uint256 amount1, uint256 amount2) external onlyOwner {
        require(reserve1 >= amount1, "Insufficient reserve1");
        require(reserve2 >= amount2, "Insufficient reserve2");

        token1.transfer(msg.sender, amount1);
        token2.transfer(msg.sender, amount2);

        reserve1 -= amount1;
        reserve2 -= amount2;

        emit LiquidityRemoved(msg.sender, amount1, amount2);
    }

    function swap(address inputToken, uint256 inputAmount) external {
        require(inputToken == address(token1) || inputToken == address(token2), "Invalid token");

        bool isToken1 = inputToken == address(token1);
        (IERC20 input, IERC20 output, uint256 inputReserve, uint256 outputReserve) = isToken1 
            ? (token1, token2, reserve1, reserve2) 
            : (token2, token1, reserve2, reserve1);

        input.transferFrom(msg.sender, address(this), inputAmount);

        uint256 inputAmountWithFee = inputAmount * 999; // Apply 0.1% fee
        uint256 outputAmount = (inputAmountWithFee * outputReserve) / (inputReserve * 1000 + inputAmountWithFee);

        require(outputAmount <= output.balanceOf(address(this)), "Insufficient liquidity for this trade");

        output.transfer(msg.sender, outputAmount);

        if (isToken1) {
            reserve1 += inputAmount;
            reserve2 -= outputAmount;
        } else {
            reserve2 += inputAmount;
            reserve1 -= outputAmount;
        }

        emit Swapped(msg.sender, inputToken, inputAmount, address(output), outputAmount);
    }

    function getSpotPrice(address inputToken) external view returns (uint256) {
        require(inputToken == address(token1) || inputToken == address(token2), "Invalid token");

        if (inputToken == address(token1)) {
            return (reserve2 * 1e18) / reserve1;
        } else {
            return (reserve1 * 1e18) / reserve2;
        }
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserve1, reserve2);
    }
}
