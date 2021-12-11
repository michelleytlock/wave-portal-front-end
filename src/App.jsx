import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';

const App = () => {

  // State variable to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [allDoughnuts, setAllDoughnuts] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = abi.abi;

  // const getAllDoughnuts = async () => {
  //   const { ethereum } = window;

  //   try {
  //     if (ethereum) {
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

  //       //Call getAllDoughnuts method from contract
  //       const doughnuts = await wavePortalContract.getAllDoughnuts();

  //       let doughnutsCleaned = [];
  //       doughnuts.map(doughnut => {
  //         return {
  //           address: doughnut.waver,
  //           timestamp: new Date(doughnut.timestamp * 1000),
  //           message: doughnut.message
  //         };
  //       });

  //       setAllDoughnuts(doughnutsCleaned);
  //     } else {
  //       console.log("Ethereum object doesn't exist!");
  //     }

  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const checkIfWalletIsConnected = async () => {

    try {
      // Make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have Metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      //Check if we're authorized to access user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts'});

      if (accounts.length!== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        getAllDoughnuts();
      } else {
        console.log('No authorized account found.')
      }
    } catch (error) {
      console.log(error);
    };
    
  };

  //connectWallet method
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get Metamask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts'});

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const doughnut = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalDoughnuts();
        console.log('Retrieved total doughnut count...', count.toNumber());

        // Execute doughnut from smart contract
        const doughnutTxn = await wavePortalContract.doughnut("this is a message", { gasLimit: 300000 });
        console.log("Mining...", doughnutTxn.hash);

        await doughnutTxn.wait();
        console.log("Mined --", doughnutTxn.hash);

        count = await wavePortalContract.getTotalDoughnuts();
        console.log("Retrieved total doughnut count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn' exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // This runs our function when the page loads.
  // useEffect(() => {
  //   let doughnutPortalContract;
  //   let onNewDoughnut;

  //   if(window.ethereum){
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner()
  //     doughnutPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

  //     onNewDoughnut = (from,timestamp,message)=>{
  //       console.log("On New Doughnut", from, timestamp, message);
  //       setAllDoughnuts(prevState => [...prevState,{
  //       address: from,
  //       timestamp: new Date(timestamp * 1000),
  //       message: message,
  //     }])}

  //     doughnutPortalContract.on('NewDoughnut', onNewDoughnut);

  //     return () => {
  //       if (doughnutPortalContract) {
  //       doughnutPortalContract.off('NewDoughnut', onNewDoughnut);
  //       }
  //     }
  //   }
  // }, []);

  useEffect(() => {
    let doughnutPortalContract;

    const onNewDoughnut = (from,timestamp,message)=>{
        console.log("On New Doughnut", from, timestamp, message);
        setAllDoughnuts(prevState => [...prevState,{
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      }])}

    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      doughnutPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      doughnutPortalContract.on('NewDoughnut', onNewDoughnut);
      }

      return () => {
        if (doughnutPortalContract) {
        doughnutPortalContract.off('NewDoughnut', onNewDoughnut);
        }
    }

  }, []);
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        🍩 Welcome to the  Doughnut Portal 🍩
        </div>

        <div className="bio">
        My name is Michelle and I like doughnuts, you do too right? Connect your Ethereum wallet and give me a doughnut!
        </div>

        <button className="doughnutButton" onClick={doughnut}>
          Give Me a Doughnut
        </button>

        {
          //If there is no currentAccount, render this button
          !currentAccount && (
            <button className="doughnutButton" onClick={connectWallet}> Connect Wallet </button>
          )
        }

        {
          allDoughnuts.map((doughnut, index) => {
            return (
              <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                <div>Address: {doughnut.address}</div>
                <div>Time: {doughnut.timestamp.toString()}</div>
                <div>Message: {doughnut.message}</div>
              </div>
            )})
        }
      </div>
    </div>
  );
}

export default App