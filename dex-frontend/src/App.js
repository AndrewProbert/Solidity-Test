import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import Dex from './contracts/Dex.json';
import MyToken from './contracts/MyToken.json';
import StableCoin from './contracts/StableCoin.json';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [dex, setDex] = useState(null);
  const [myToken, setMyToken] = useState(null);
  const [stableCoin, setStableCoin] = useState(null);
  const [amount, setAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [outputToken, setOutputToken] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    const init = async () => {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
      setWeb3(web3);
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Dex.networks[networkId];
      const dexInstance = new web3.eth.Contract(
        Dex.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setDex(dexInstance);

      const myTokenInstance = new web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[networkId] && MyToken.networks[networkId].address,
      );
      setMyToken(myTokenInstance);

      const stableCoinInstance = new web3.eth.Contract(
        StableCoin.abi,
        StableCoin.networks[networkId] && StableCoin.networks[networkId].address,
      );
      setStableCoin(stableCoinInstance);
    };
    init();
  }, []);

  const handleSwap = async () => {
    try {
      if (!amount || !inputToken || !outputToken) {
        throw new Error('Amount and token selections are required');
      }
      const amountInWei = web3.utils.toWei(amount, 'ether');
      const receipt = await dex.methods
        .swap(inputToken, amountInWei)
        .send({ from: accounts[0] });

      const { sender, inputToken: inputTokenAddress, outputToken: outputTokenAddress, inputAmount, outputAmount } = receipt.events.Swap.returnValues;
      setOutputAmount(web3.utils.fromWei(outputAmount, 'ether'));
      setTransactionDetails({
        sender,
        inputToken: inputTokenAddress,
        outputToken: outputTokenAddress,
        inputAmount: web3.utils.fromWei(inputAmount, 'ether'),
        outputAmount: web3.utils.fromWei(outputAmount, 'ether'),
      });
    } catch (error) {
      console.error('Error during swap:', error);
    }
  };

  return (
    <div>
      <h1>DEX Frontend</h1>
      <div>
        <label>
          Input Token:
          <select value={inputToken} onChange={(e) => setInputToken(e.target.value)}>
            <option value="">Select Token</option>
            <option value={myToken ? myToken.options.address : ''}>MyToken</option>
            <option value={stableCoin ? stableCoin.options.address : ''}>StableCoin</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Output Token:
          <select value={outputToken} onChange={(e) => setOutputToken(e.target.value)}>
            <option value="">Select Token</option>
            <option value={myToken ? myToken.options.address : ''}>MyToken</option>
            <option value={stableCoin ? stableCoin.options.address : ''}>StableCoin</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Amount to swap:
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button onClick={handleSwap}>Swap</button>
      </div>
      {outputAmount && (
        <div>
          <p>Output Amount: {outputAmount}</p>
        </div>
      )}
      {transactionDetails && (
        <div>
          <h3>Transaction Details</h3>
          <pre>{JSON.stringify(transactionDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
