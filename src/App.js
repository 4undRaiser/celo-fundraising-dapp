import "./App.css";
import Home from "./components/home";
import { Campaigns } from "./components/Campaigns";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import celogram from "./contracts/fundraising.abi.json";
import IERC from "./contracts/IERC.abi.json";

const ERC20_DECIMALS = 18;
const contractAddress = "0xadB1C74ce3b79344D3587BB2BC8530d95cDEEAa2";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [campaigns, setCampaigns] = useState([]);

  const connectToWallet = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];
        kit.defaultAccount = user_address;

        await setAddress(user_address);
        await setKit(kit);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Error Occurred");
    }
  };

  const getBalance = useCallback(async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const contract = new kit.web3.eth.Contract(celogram, contractAddress);
      setcontract(contract);
      setcUSDBalance(USDBalance);
    } catch (error) {
      console.log(error);
    }
  }, [address, kit]);

  const getCampaigns = useCallback(async () => {
    const campaignsLength = await contract.methods.getCampaignLength().call();
    const campaigns = [];
    for (let index = 0; index < campaignsLength; index++) {
      let _campaigns = new Promise(async (resolve, reject) => {
        let campaign = await contract.methods.getCampaign(index).call();

        resolve({
          index: index,
          image: campaign[0],
          description: campaign[1],
          beneficiary: campaign[2],
          totalRaised: campaign[3],
          goal: campaign[4],
        });
      });
      campaigns.push(_campaigns);
    }

    const _campaigns = await Promise.all(campaigns);
    setCampaigns(_campaigns);
  }, [contract]);

  const addCampaign = async (_image, _description, _beneficiary, _goal) => {
    try {
      await contract.methods
        .createCampaign(_image, _description, _beneficiary, _goal)
        .send({ from: address });
      getCampaigns();
    } catch (error) {
      alert(error);
    }
  };

  const fundCampaign = async (_index, _ammount) => {
    try {
      const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);

      await cUSDContract.methods
        .approve(contractAddress, _ammount)
        .send({ from: address });
      await contract.methods
        .fundCampaign(_index, _ammount)
        .send({ from: address });
      getCampaigns();
      getBalance();
      alert("you have successfully sent cusd to this user");
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    connectToWallet();
  }, []);

  useEffect(() => {
    if (kit && address) {
      getBalance();
    }
  }, [kit, address, getBalance]);

  useEffect(() => {
    if (contract) {
      getCampaigns();
    }
  }, [contract, getCampaigns]);

  return (
    <div className="App">
      <Home cUSDBalance={cUSDBalance} addCampaign={addCampaign} />
      <Campaigns
        campaigns={campaigns}
        fundCampaign={fundCampaign}
        walletAddress={address}
      />
    </div>
  );
}

export default App;
