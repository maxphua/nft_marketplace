import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
import { create as ipfsHttpClient } from 'ipfs-http-client';

import { MarketAddress, MarketAddressABI } from './constants';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const nftCurrency = 'ETH';
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);

    const provider = new ethers.providers.JsonRpcProvider();
    const contract = fetchContract(provider); // we want to fetch all the nft from the marketplace, not a person nft

    const data = await contract.fetchMarketItems(); // getting an array of promisses that contain nft data
    // console.log(data);  // return array[5], means one nft inside, got 5 attribute

    // fetch all nft simultaneously, all at the same time, and map all of it
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);

      // format from a human unreadable format, that big number into human readable format
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether'); // 0x4b3b4ca85a86c47a098a224000000000

      return {
        price,
        tokenId: tokenId.toNumber(),
        id: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));

    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner(); // who is making this sale, who is creating a nft

    const contract = fetchContract(signer);

    const data = type === 'fetchItemListed'
      ? await contract.fetchItemsListed()
      : await contract.fetchMyNFTs();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);

      // format from a human unreadable format, that big number into human readable format
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether'); // 0x4b3b4ca85a86c47a098a224000000000

      return {
        price,
        tokenId: tokenId.toNumber(),
        id: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));

    return items;
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner(); // who is making this sale, who is creating a nft

    const price = ethers.utils.parseUnits(formInputPrice, 'ether'); // format from a human readable format into ethereum
    const contract = fetchContract(signer);
    // console.log(contract); // to view our contract properties

    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
      ? await contract.createToken(url, price, { value: listingPrice.toString() })
      : await contract.resellToken(id, price, { value: listingPrice.toString() });

    setIsLoadingNFT(true);

    await transaction.wait();
  };

  const buyNFT = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner(); // who is making this sale, who is creating a nft

    const contract = fetchContract(signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(nft.tokenId, { value: price });

    setIsLoadingNFT(true);

    await transaction.wait();

    setIsLoadingNFT(false);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    setCurrentAccount(accounts[0]);

    window.location.reload();
  };

  // accounts: Array(0) means no account, or no item
  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert('Please connect MetaMask'); // console log window.ethereum

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    // console.log({ accounts });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No accounts found');
    }
  };

  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });

      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      return url;
    } catch (error) {
      console.log('Error uploading file to IPFS');
    }
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      // console.log(1);

      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      // console.log(2);

      await createSale(url, price);
      // console.log(3);

      router.push('/');
    } catch (error) {
      console.log(error);
      console.log('Error uploading file to IPFS.');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <NFTContext.Provider value={{
      nftCurrency,
      connectWallet,
      currentAccount,
      uploadToIPFS,
      createNFT,
      fetchNFTs,
      fetchMyNFTsOrListedNFTs,
      buyNFT,
      createSale,
      isLoadingNFT,
    }}
    >
      {children}
    </NFTContext.Provider>
  );
};
