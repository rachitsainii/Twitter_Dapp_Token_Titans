import React, {useState, useEffect} from 'react';
import {Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Rightbar from './components/Rightbar';
import './App.css';
import {Button, useNotification, Loading} from '@web3uikit/core';
import { Twitter, Metamask } from '@web3uikit/icons';
import Web3Modal from 'web3modal';
import {TwitterContractAddress} from './config';
import TwitterAbi from './abi/Twitter.json';
import { utils } from 'ethers';
var toonavatar = require('cartoon-avatar');




function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [provider,setProvider] = useState(window.ethereum);
  const notificaton = useNotification();
  const [loading,setLoadingState] = useState(false);
  const ethers = require("ethers");


  const warningNotification = () =>{
    notificaton({
      type: 'warning',
      message: 'Change network to Polygon to visit this site',
      title: 'Switch to Polygon Network',
      position: 'topR'
    });
  };

  const infoNotification = (accountNum) =>{
    notificaton({
      type: 'info',
      message: accountNum,
      title: 'Connected to Polygon Account',
      position: 'topR'
    });
  };

  useEffect(()=>{
    if(!provider){
      window.alert("No MetaMask Installed");
      window.location.replace("https://metamask.io");
    }

    connectWallet();

    const handleAccountsChanged = (accounts) => {
      if(provider.chainId === "0x13881"){
        infoNotification(accounts[0]);
      }
      // Just to prevent reloading twice for the very first time
      if(JSON.parse(localStorage.getItem('activeAccount')) != null){
        setTimeout(()=>{window.location.reload()}, 3000);
      }
    };

    const handleChainChanged = (chainId)=>{
      if(chainId !== "0x13881"){
        warningNotification();
      }
      window.location.reload();
    };

    const handleDisconnect= ()=>{};

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);
  },[]);

  const connectWallet = async () =>{
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    let provider = new ethers.providers.Web3Provider(connection);
    const getnetwork = await provider.getNetwork();
    const polygonChainId = 80001;
    if(getnetwork.chainId !== polygonChainId){
      warningNotification();
      try{
        await provider.provider.request({
          method:"wallet_switchEthereumChain",
          params: [{ chainId: utils.hexValue(polygonChainId) }]
        }).then(()=>window.location.reload());

      }catch(switchError){
      //This error code indicates that the chain has not been added to MetaMask.
      // So we will add polygon network to their Metamask
      if(switchError.code === 4902){
        try{
          await provider.provider.request({
            method:"wallet_addEthereumChain",
            params: [
              {
              chainId: utils.hexValue(polygonChainId),
              chainName: "Mumbai",
              rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
              blockExplorerUrls: ["https://mumbai.polygonscan.com"],
              nativeCurrency : {
                symbol:"MATIC",
                decimals:18
              }
            }
          ]
          }).then(()=>window.location.reload());

        }catch(addError){
          throw addError;
        }
      }
      }
    }else{
        // It will execute if polygon chain is connected
        //Here we will verify if user exists or not in our blockchain or else we will update user details in our contract as well as local storage
        const signer = provider.getSigner();
        const signerAddress = await signer.getAddress();
        const contract = new ethers.Contract(TwitterContractAddress,TwitterAbi.abi,signer);
        const getUserDetail = await contract.getUser(signerAddress);

        if(getUserDetail['profileImg']){
          //If User Exists
          window.localStorage.setItem("activeAccount", JSON.stringify(signerAddress));
          window.localStorage.setItem("userName", JSON.stringify(getUserDetail['name']));
          window.localStorage.setItem("userBio", JSON.stringify(getUserDetail['bio']));
          window.localStorage.setItem("userImage", JSON.stringify(getUserDetail['profileImg']));
          window.localStorage.setItem("userBanner", JSON.stringify(getUserDetail['profileBanner']));
        }else{
          // First Time User
          // Gets Random avatar and update in the contract
          setLoadingState(true);
          let avatar = toonavatar.generate_avatar();
          let defaultBanner = "https://pbs.twimg.com/media/FDT5DkOXMAgzz38?format=jpg&name=large";
          window.localStorage.setItem("activeAccount", JSON.stringify(signerAddress));
          window.localStorage.setItem("userName", JSON.stringify(''));
          window.localStorage.setItem("userBio", JSON.stringify(''));
          window.localStorage.setItem("userImage", JSON.stringify(avatar));
          window.localStorage.setItem("userBanner", JSON.stringify(defaultBanner));
          
          try{
            const transaction = await contract.updateUser('', '', avatar, defaultBanner);
            await transaction.wait();
          }catch(error){
            console.log("ERROR", error);
            notificaton({
              type: 'warning',
              message: 'Get test MATIC from Polygon faucet',
              title: 'Require Minimum 0.1 MATIC',
              position: 'topR'
            });
            setLoadingState(false);
            return;
          }

        }

        setProvider(provider);
        setIsAuthenticated(true);
    }
  }

  return (
   <>
   {isAuthenticated ? (<div className='page'>
    <div className='sideBar'>
      <Sidebar/>
    </div>
    <div className='mainWindow'>
      <Routes>
        <Route path = '/' element={<Home />} />
        <Route path = '/profile' element={<Profile />} />
        <Route path = '/settings' element={<Settings />} />
      </Routes>
    </div>
    <div className='rightBar'>
      <Rightbar />
    </div>
   </div>): (
    <div className='loginPage'>
      <Twitter fill='#ffffff' fontSize={80} />
      { loading ? <Loading size={50} spinnerColor='green'/> : <Button onClick={connectWallet} size="xl" text = "Login with MetaMask" theme="primary" icon={<Metamask/>} />}
      
    </div>
   )}
   
   </>
  );
}

export default App;
