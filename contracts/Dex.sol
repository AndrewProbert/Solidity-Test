// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dex is Ownable(msg.sender) {
    IERC20 public token1;
    IERC20 public token2;

    uint256 public reserve1;
    uint256 public reserve2;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    event LiquidityAdded(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidityMinted);
    event LiquidityRemoved(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidityBurned);
    event Swapped(address indexed swapper, address inputToken, uint256 inputAmount, address outputToken, uint256 outputAmount);

    constructor(address _token1, address _token2) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function addLiquidity(uint256 amount1, uint256 amount2) external returns (uint256 liquidityMinted) {
        require(amount1 > 0 && amount2 > 0, "Amount must be greater than 0");

        // Check balances
        uint256 balance1 = token1.balanceOf(msg.sender);
        uint256 balance2 = token2.balanceOf(msg.sender);
        require(balance1 >= amount1, "Insufficient token1 balance");
        require(balance2 >= amount2, "Insufficient token2 balance");

        // Check allowances
        uint256 allowance1 = token1.allowance(msg.sender, address(this));
        uint256 allowance2 = token2.allowance(msg.sender, address(this));
        require(allowance1 >= amount1, "Insufficient token1 allowance");
        require(allowance2 >= amount2, "Insufficient token2 allowance");

        if (totalLiquidity == 0) {
            liquidityMinted = sqrt(amount1 * amount2);
        } else {
            uint256 amount2Optimal = (amount1 * reserve2) / reserve1;
            require(amount2 >= amount2Optimal, "Insufficient amount2 provided");

            liquidityMinted = (amount1 * totalLiquidity) / reserve1;
        }

        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;

        reserve1 += amount1;
        reserve2 += amount2;

        require(token1.transferFrom(msg.sender, address(this), amount1), "Token1 transfer failed");
        require(token2.transferFrom(msg.sender, address(this), amount2), "Token2 transfer failed");

        emit LiquidityAdded(msg.sender, amount1, amount2, liquidityMinted);
        return liquidityMinted;
    }

    function removeLiquidity(uint256 liquidityAmount) external returns (uint256 amount1, uint256 amount2) {
        require(liquidityAmount > 0, "Liquidity must be greater than 0");
        require(liquidity[msg.sender] >= liquidityAmount, "Insufficient liquidity");

        amount1 = (liquidityAmount * reserve1) / totalLiquidity;
        amount2 = (liquidityAmount * reserve2) / totalLiquidity;

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;

        reserve1 -= amount1;
        reserve2 -= amount2;

        require(token1.transfer(msg.sender, amount1), "Token1 transfer failed");
        require(token2.transfer(msg.sender, amount2), "Token2 transfer failed");

        emit LiquidityRemoved(msg.sender, amount1, amount2, liquidityAmount);
    }

    function swap(address inputToken, uint256 inputAmount) external returns (uint256 outputAmount) {
        require(inputToken == address(token1) || inputToken == address(token2), "Invalid token");

        bool isToken1 = inputToken == address(token1);
        (IERC20 input, IERC20 output, uint256 inputReserve, uint256 outputReserve) = isToken1 
            ? (token1, token2, reserve1, reserve2) 
            : (token2, token1, reserve2, reserve1);

        require(inputAmount > 0, "Input amount must be greater than 0");
        require(inputReserve > 0 && outputReserve > 0, "Insufficient reserves");

        uint256 inputAmountWithFee = inputAmount * 997 / 1000; // Apply 0.3% fee
        outputAmount = (inputAmountWithFee * outputReserve) / (inputReserve + inputAmountWithFee);

        require(outputAmount <= output.balanceOf(address(this)), "Insufficient liquidity for this trade");

        require(input.transferFrom(msg.sender, address(this), inputAmount), "Input token transfer failed");
        require(output.transfer(msg.sender, outputAmount), "Output token transfer failed");

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

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
