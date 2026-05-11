import type { IProvider } from "@web3auth/base";
import Web3 from "web3";
import { ethers } from "ethers";

export default class EthereumRpc {
  private static globalProvider: IProvider | null = null;

  static setGlobalProvider(provider: IProvider) {
    EthereumRpc.globalProvider = provider;
  }

  private readonly provider: IProvider;

  constructor() {
    if (!EthereumRpc.globalProvider) {
      console.log("Global provider not set. Call setGlobalProvider before creating an instance.");
    }
    //@ts-ignore
    this.provider = EthereumRpc.globalProvider;
  }

  async waitForTransaction(txHash: string): Promise<any> {
    const web3 = new Web3(this.provider as IProvider);
    return web3.eth.getTransactionReceipt(txHash);
  }

  async getAccounts(): Promise<string[]> {
    try {
      if (!this.provider) {
        console.error('Provider not set');
        return [];
      }
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();
      return accounts || [];
    } catch (error: unknown) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not set');
      }
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      const balance = await web3.eth.getBalance(accounts[0]);
      return balance.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async sendEth(to: string, amount: string): Promise<string> {
    try {
      const web3 = new Web3(this.provider as IProvider);
      const accounts = await web3.eth.getAccounts();

      if (!web3.utils.isAddress(to)) {
        throw new Error('Invalid recipient address');
      }

      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error('Invalid amount');
      }

      const weiAmount = web3.utils.toWei(amount, "ether");
      const gasPrice = await web3.eth.getGasPrice();
      const gas = await web3.eth.estimateGas({
        from: accounts[0],
        to: to,
        value: weiAmount
      });

      const txRes = await web3.eth.sendTransaction({
        from: accounts[0],
        to: to,
        value: weiAmount,
        gas,
        gasPrice
      });

      return txRes.transactionHash.toString();
    } catch (error) {
      console.error('Error sending ETH:', error);
      throw error;
    }
  }
}


