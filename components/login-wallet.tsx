import Image from 'next/image'
import { useWalletSelector } from './contexts/WalletSelectorContext'
import { IoIosSettings } from 'react-icons/io'

export default function LoginWallet() {
  const { modal, accounts } = useWalletSelector()

  const onLoginWallet = () => {
    modal.show()
  }

  console.log("account connected : ",accounts)

  return (
    <div className="h-10 w-full justify-center  text-white px-4 shadow-none rounded-3xl border-none transition-colors  dark:bg-zinc-900">
      {accounts[0] ? (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white  ">
            <Image src={'/user.png'} alt="user" width={36} height={36} />
            {accounts[0] && accounts[0].accountId? accounts[0].accountId:""}
          </div>
          <IoIosSettings />
        </div>
      ) : (
        <button
          onClick={onLoginWallet}
          className="w-full bg-sky-500 py-2 rounded-2xl px-8"
        >
          Login
        </button>
      )}
    </div>
  )
}
