import { ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import { contractABI, contractAddress } from "../utils/constant";

export const TransactionContext = createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [connectedAccount, setConnectedAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);
  const handleChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    console.log(formData);
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const transactionContract = getEthereumContract();
      const availableTransactions =
        await transactionContract.getAllTransactions();
      const structuredTransactions = availableTransactions.map((t) => ({
        addressTo: t.receiver,
        addressFrom: t.sender,
        timestamp: new Date(t.timestamp.toNumber() * 1000).toLocaleString(),
        message: t.message,
        keyword: t.keyword,
        amount: parseInt(t.amount._hex) / 10 ** 18,
      }));
      setTransactions(structuredTransactions);
      console.log(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const isWalletConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setConnectedAccount(accounts[0]);

        getAllTransactions();
      } else console.log("No accounts found");
    } catch (e) {
      console.log(error);
      throw new Error("No ethereum object!");
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionsCount();
      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object!");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask!");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setConnectedAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object!");
    }
  };
  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask!");

      const { addressTo, amount, keyword, message } = formData;
      console.log(addressTo, message);
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: connectedAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });
      const transactionHash = await transactionContract.addToBlockChain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionsCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object!");
    }
  };

  useEffect(() => {
    isWalletConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        connectedAccount,
        sendTransaction,
        formData,
        handleChange,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
