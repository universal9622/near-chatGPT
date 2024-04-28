// not yet implement storage_balance_of
import {
  KeyPair,
  keyStores,
  Near,
  Contract,
  connect,
  utils,
  Account
} from 'near-api-js'
import {
  FunctionCallAction,
  TransferAction,
  WalletSelector
} from '@near-wallet-selector/core'

export interface NEP141_Contract extends Contract {
  ft_balance_of: (args: { account_id: string }) => Promise<string>
  ft_transfer: (
    args: { receiver_id: string; amount: string; memo?: string },
    gas: string,
    attachedDeposit: string
  ) => Promise<void>
  storage_deposit: (args: { account_id: string }) => Promise<void>
  storage_balance_of: (args: { account_id: string }) => Promise<string>
}

export interface Payload {
  userId: string
  receiverId: string
  amount: string
  symbol: string
  // added:
  //memo: string | null;
}
const THIRTY_TGAS = '30000000000000'
const NO_DEPOSIT = '0'

export const TOKEN_LIST: { [key: string]: string } = {
  NEAR: 'NEAR',
  PTC: 'ft5.0xpj.testnet',
}

// export async function getBalance(contract: NEP141_Contract, payload: Payload): Promise<void> {
//     try {
//         const balance = await contract.ft_balance_of({ account_id: payload.userId });
//         console.log(`Balance of ${payload.symbol} in ${payload.userId}: ${balance}`);
//     } catch (error) {
//         console.error(`Failed to fetch balance of ${payload.symbol} for ${payload.userId}:`, error);
//     }
// }

export async function depositStorageForReceiver(
  walletSelector: WalletSelector,
  payload: Payload
): Promise<void> {
  const wallet = await walletSelector.wallet()
  const args = {
    account_id: payload.receiverId
  }
  const contractId = TOKEN_LIST[payload.symbol]

  const storage_deposit: FunctionCallAction = {
    type: 'FunctionCall',
    params: {
      methodName: 'storage_deposit',
      args: args,
      gas: '30000000000000', // This is an example gas amount; adjust based on contract requirements
      deposit: '1' // This should cover the storage cost, specified in yoctoNEAR
    }
  }

  try {
    // Use the wallet to sign and send the transaction with the function call action
    await wallet.signAndSendTransaction({
      receiverId: contractId, // The smart contract that handles the NEP-141 token
      actions: [storage_deposit]
    })

    console.log(
      `Successfully deposited storage fee for account ${payload.receiverId} at contract ${contractId}`
    )
  } catch (error) {
    console.error(
      `Failed to deposit storage fee for account ${payload.receiverId} at contract ${contractId}:`,
      error
    )
  }
}

export async function transferToken(
  walletSelector: WalletSelector,
  payload: Payload
): Promise<void> {
  const wallet = await walletSelector.wallet()
  const args = {
    reviever_id: payload.receiverId,
    amount: payload.amount.toString()
    // memo: payload.memo
  }
  const contractId = TOKEN_LIST[payload.symbol]

  // Create the transfer action
  const transfer: FunctionCallAction = {
    type: 'FunctionCall',
    params: {
      methodName: 'ft_transfer',
      args: args,
      gas: THIRTY_TGAS,
      deposit: '1' // Sender account is required to attach exactly 1 yoctoNEAR to the function call
    }
  }

  try {
    // Use the wallet to sign and send the transaction with the transfer action
    await wallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [transfer]
    })

    console.log(
      `Successfully transferred ${payload.amount.toString()} NEAR to ${payload.receiverId}`
    )
  } catch (error) {
    console.error(
      `Failed to transfer ${payload.amount.toString()} NEAR to ${payload.receiverId}:`,
      error
    )
  }
}

// export async function init(contractId: string, walletSelector: WalletSelector): Promise<NEP141_Contract> {
//     const wallet = await walletSelector.wallet();
//     const accounts = await wallet.getAccounts();
//     if (!accounts.length) {
//         throw new Error('No accounts found. Please connect to a NEAR wallet.');
//     }
//     const account = accounts[0];

//     return new Contract(
//         account,
//         contractId, // token contract id
//         {
//             viewMethods: ["ft_balance_of"],
//             changeMethods: ["mint", "ft_transfer", "storage_deposit", "storage_balance_of"],
//             //useLocalViewExecution: false,
//         }
//     ) as NEP141_Contract;
// }

export async function TransferNear(
  walletSelector: WalletSelector,
  payload: Payload
): Promise<void> {
  const wallet = await walletSelector.wallet()

  // Create the transfer action
  const transferAction: TransferAction = {
    type: 'Transfer',
    params: {
      deposit: (
        BigInt(payload.amount) * BigInt('1000000000000000000000000')
      ).toString() // Amount in yoctoNEAR
    }
  }

  try {
    // Use the wallet to sign and send the transaction with the transfer action
    const result = await wallet.signAndSendTransaction({
      receiverId: payload.receiverId,
      actions: [transferAction]
    })

    console.log(
      `Successfully transferred ${payload.amount.toString()} NEAR to ${payload.receiverId}`
    )
  } catch (error) {
    console.error(
      `Failed to transfer ${payload.amount.toString()} NEAR to ${payload.receiverId}:`,
      error
    )
  }
}
