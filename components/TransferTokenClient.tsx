'use client';
import { FunctionCallAction } from '@near-wallet-selector/core';
import { useWalletSelector } from '@/components/contexts/WalletSelectorContext';
import { useEffect, useState } from 'react';
import { TransferAction } from '@near-wallet-selector/core';
import * as nearAPI from "near-api-js";
const { utils } = nearAPI;

const THIRTY_TGAS = '30000000000000';
const TOKEN_LIST: { [key: string]: string } = {
  NEAR: 'NEAR',
  PTC: 'ft5.0xpj.testnet',
  USDC: 'usdc.fakes.testnet'
  // Add other token symbols and their contract IDs
};

interface Payload {
  userId: string;
  receiverId: string;
  amount: string;
  symbol: string;
}

export function TransferToken({ payload }: { payload: Payload }) {
  const { selector, modal, accounts } = useWalletSelector();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (payload && selector && modal && accounts.length > 0 && confirmTransfer) {
      transferToken(payload);
    }
  }, [payload, selector, modal, accounts, confirmTransfer]);

  async function handleConfirm() {
    setConfirmTransfer(true);
    setCancelled(false);
  }

  async function handleCancel() {
    setConfirmTransfer(false);
    setCancelled(true);
  }

  async function transferToken(payload: Payload) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    console.log(JSON.stringify(payload));
    try {
      const wallet = await selector.wallet();
      const accountId = accounts.find((account) => account.active)?.accountId;
      if (!accountId) {
        throw new Error('No active account found');
      }
      const args = {
        receiver_id: payload.receiverId,
        amount: BigInt(Math.round(parseFloat(payload.amount) * 1e6)).toString(),
      };
      const contractId = TOKEN_LIST[payload.symbol];
      console.log("Contract ID: ", contractId);
      console.log("The args sent: ", args);
 
      const transferAction: TransferAction = {
        type: 'Transfer',
        params: {
          // @ts-ignore
          deposit: utils.format.parseNearAmount(payload.amount.toString())
        }
      };

      const transfer: FunctionCallAction = {
        type: 'FunctionCall',
        params: {
          methodName: 'ft_transfer',
          args: args,
          gas: THIRTY_TGAS,
          deposit: '1'
        }
      }
    
 if (payload.symbol == 'NEAR')
 {
      await wallet.signAndSendTransaction({
        receiverId: payload.receiverId,
        actions: [transferAction],
      });

    }
else 
   { 
    await wallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [transfer]
    })

  }

      setSuccess(true);
      console.log(
        `Successfully transferred ${payload.amount.toString()} ${
          payload.symbol
        } to ${payload.receiverId}`
      );
    } catch (error) {
      // @ts-ignore
      setError(error.message);
      console.error(
        `Failed to transfer ${payload.amount.toString()} ${payload.symbol} to ${
          payload.receiverId
        }:`,
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='text-black'>
      {loading && <p>Transferring tokens... for payload: {`${JSON.stringify(payload)}`}</p>}
      {/* {error && <p className="text-red-500">Error: {error}</p>} */}
      {success && <p className="text-green-500">Token transfer successful!</p>}
      {cancelled && <p className="text-red-500">Transaction Cancelled</p>}

      {!confirmTransfer && !cancelled && (
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            onClick={handleConfirm}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}

      {confirmTransfer && (
        <p className="text-center mt-2">Please approve the transaction on your wallet...</p>
      )}
    </div>
  );
}