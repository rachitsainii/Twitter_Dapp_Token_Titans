import React, {useState, useRef} from "react";
import "./Home.css";
import { Avatar, Loading, useNotification } from '@web3uikit/core';
import {Image} from '@web3uikit/icons';
import {defaultImgs} from "../defaultImgs";
import TweetInFeed from "../components/TweetInFeed";
import Web3Modal from 'web3modal';
import { TwitterContractAddress,Web3StorageAPI } from "../config";
import TwitterAbi from '../abi/Twitter.json';
import { Web3Storage} from 'web3.storage';

const Home = () =>{
   const ethers = require("ethers");
   const inputFile = useRef(null);
   const [selectedImage, setSelectedImage] = useState();
   const [tweetText, setTweetText] = useState('');
   const userImage = JSON.parse(localStorage.getItem('userImage'));
   const [selectedFile, setSelectedFile] = useState();
   const [uploading, setUploading] = useState(false);
   let ipfsUploadedUrl = '';
   const notification = useNotification();

   async function storeFile () {
      const client = new Web3Storage({token: Web3StorageAPI});
      const rootCid = await client.put(selectedFile);
      ipfsUploadedUrl= `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
   }

   const onImageClick = () => {
      inputFile.current.click();
   }

   const changeHandler = (event) =>{
      const imgFile = event.target.files[0];
      setSelectedImage(URL.createObjectURL(imgFile));
      setSelectedFile(event.target.files);
   }

   async function addTweet(){
      if(tweetText.trim().length < 5){
         notification({
            type: 'warning',
            message: 'Minimum 5 characters',
            title: 'Tweet Field required',
            position: 'topR'
         });
         return;
      }
      setUploading(true);
      if(selectedImage){
         await storeFile();
      }
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(TwitterContractAddress, TwitterAbi.abi, signer);
      const tweetValue = "0.01";
      const price = ethers.utils.parseEther(tweetValue);
      try{
         const transaction = await contract.addTweet(tweetText, ipfsUploadedUrl, {value:price});
         await transaction.wait();
         notification({
            type: 'success',
            title: 'Tweet Added Successfully',
            position: 'topR'
         });

         setSelectedImage(null);
         setTweetText('');
         setSelectedFile(null);
         setUploading(false);
      }catch(error){
         notification({
            type: 'error',
            title: 'Transaction Error!',
            message: error.message,
            position: 'topR'
         });
         setUploading(false);
      }
   }

    return (
        <>
         <div className="mainContent">
            <div className="profileTweet">
               <div className="tweetSection">
                  <Avatar isRounded image={userImage} theme="image" size={60}/>
                  <textarea value = {tweetText} classname="textArea" placeholder="What's going on?" className="textArea" onChange={(e)=>setTweetText(e.target.value)}></textarea>
               </div>
               <div className="tweetSection">
                  <div className="imgDiv" onClick={onImageClick}>
                     <input type="file" ref={inputFile} onChange={changeHandler} style={{display:"none"}} />
                     {selectedImage ? <img src={selectedImage} width={150} /> : <Image fontSize={25} fill="#ffffff"/>}
                  </div>
                  <div className="tweet" onClick={addTweet}>{uploading ? <Loading /> : 'Tweet'}</div>
               </div>
            </div>
           <TweetInFeed profile = {false} reload={uploading}/>
         </div>
        </>
    );
}

export default Home;