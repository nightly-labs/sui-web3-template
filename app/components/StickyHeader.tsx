/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import { toast } from 'sonner'
import { getAdapter } from '../misc/adapter'
import ActionStarryButton from './ActionStarryButton'
import StarryButton from './StarryButton'
import { WalletAccount } from '@mysten/wallet-standard'
import { TransactionBlock } from '@mysten/sui.js/transactions'

const StickyHeader: React.FC = () => {
  const [userAccount, setUserAccount] = React.useState<WalletAccount | undefined>()
  useEffect(() => {
    const init = async () => {
      const adapter = await getAdapter()
      if (await adapter.canEagerConnect()) {
        try {
          await adapter.connect()
          const account = await adapter.getAccounts()
          if (account[0]) {
            setUserAccount(account[0])
          }
        } catch (error) {
          await adapter.disconnect().catch(() => {})
          console.log(error)
        }
      }
    }
    init()
    // Try eagerly connect
  }, [])
  return (
    <header className='fixed top-0 left-0 w-full bg-opacity-50  p-6 z-10'>
      <div className='flex items-center justify-between'>
        <div>
          {/* <Image
            style={{ width: '200px', cursor: 'pointer' }}
            src={NightlyLogo}
            alt='logo'
            onClick={() => {
              // redirect to nightly.app
              window.location.href = 'https://nightly.app'
            }}
          /> */}
        </div>
        <div className='flex flex-col space-y-4'>
          <StarryButton
            connected={userAccount?.address !== undefined}
            onConnect={async () => {
              const adapter = await getAdapter()
              try {
                await adapter.connect()
                const account = await adapter.getAccounts()
                if (account[0]) {
                  setUserAccount(account[0])
                }
              } catch (error) {
                // If error, disconnect ignore error
                await adapter.disconnect().catch(() => {})
              }
            }}
            onDisconnect={async () => {
              try {
                const adapter = await getAdapter()
                await adapter.disconnect()
                setUserAccount(undefined)
              } catch (error) {
                console.log(error)
              }
            }}
            publicKey={userAccount?.address}
          />
          {userAccount?.address && (
            <>
              <ActionStarryButton
                onClick={async () => {
                  const signTransaction = async () => {
                    const adapter = await getAdapter()
                    const transactionBlock = new TransactionBlock()
                    const coin = transactionBlock.splitCoins(transactionBlock.gas, [
                      transactionBlock.pure(50_000_000),
                    ])
                    transactionBlock.transferObjects(
                      [coin],
                      transactionBlock.pure(
                        '0x5635a39dfd0b9e2302453695497b1979fa1af481a0fbfed9d0dd5a99accb2fc0'
                      )
                    )
                    const txid = await adapter.signAndExecuteTransactionBlock({
                      transactionBlock: transactionBlock as any,
                      chain: 'sui:mainnet',
                      account: userAccount,
                    })
                    console.log(txid)
                    toast.success('Transaction send!', {
                      action: {
                        label: 'Show Transaction ',
                        onClick: () => {
                          // Open url in a new tab
                          window.open(`https://suiscan.xyz/mainnet/tx/${txid.digest}`, '_blank')
                        },
                      },
                    })
                  }
                  toast.promise(signTransaction, {
                    loading: 'Signing Transaction...',
                    success: (_) => {
                      return `Transaction signed!`
                    },
                    error: 'Operation has been rejected!',
                  })
                }}
                name='Sign Transaction'
              ></ActionStarryButton>
              <ActionStarryButton
                onClick={async () => {
                  const signMessage = async () => {
                    const adapter = await getAdapter()
                    await adapter.signPersonalMessage({
                      message: new TextEncoder().encode('I love Nightly 🦊'),
                      account: userAccount,
                    })
                  }
                  toast.promise(signMessage, {
                    loading: 'Signing message...',
                    success: (_) => {
                      return `Message signed!`
                    },
                    error: 'Operation has been rejected!',
                  })
                }}
                name='Sign Message'
              ></ActionStarryButton>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default StickyHeader
