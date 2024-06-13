// contracts/Dex.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
    IERC20 public token1;
    IERC20 public token2;

    uint256 public reserve1;
    uint256 public reserve2;

    constructor(address _token1, address _token2) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function addLiquidity(uint256 amount1, uint256 amount2) public {
        token1.transferFrom(msg.sender, address(this), amount1);
        token2.transferFrom(msg.sender, address(this), amount2);

        reserve1 += amount1;
        reserve2 += amount2;
    }

    function removeLiquidity(uint256 amount1, uint256 amount2) public {
        require(reserve1 >= amount1, "Insufficient liquidity");
        require(reserve2 >= amount2, "Insufficient liquidity");

        token1.transfer(msg.sender, amount1);
        token2.transfer(msg.sender, amount2);

        reserve1 -= amount1;
        reserve2 -= amount2;
    }

    function swap(address inputToken, uint256 inputAmount) public {
        require(inputToken == address(token1) || inputToken == address(token2), "Invalid token");

        bool isInputToken1 = inputToken == address(token1);
        IERC20 input = isInputToken1 ? token1 : token2;
        IERC20 output = isInputToken1 ? token2 : token1;

        uint256 inputReserve = isInputToken1 ? reserve1 : reserve2;
        uint256 outputReserve = isInputToken1 ? reserve2 : reserve1;

        uint256 outputAmount = (inputAmount * outputReserve) / (inputReserve + inputAmount);

        input.transferFrom(msg.sender, address(this), inputAmount);
        output.transfer(msg.sender, outputAmount);

        if (isInputToken1) {
            reserve1 += inputAmount;
            reserve2 -= outputAmount;
        } else {
            reserve2 += inputAmount;
            reserve1 -= outputAmount;
        }
    }
}
