"use client"

import { useEffect, useState, useCallback } from "react"
import Web3 from "web3"
import LendingABI from "./LendingABI.json"
import { TransactionPopup } from "@/components/transaction-popup"
import { WalletSelector } from "@/components/wallet-selector"
import { BalanceCard } from "@/components/balance-card"
import { ActionCard } from "@/components/action-card"
import { TransactionHistory } from "@/components/transaction-history"
import { BackgroundAnimation } from "@/components/background-animation"
import { motion } from "framer-motion"

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// Hardhat local private keys
const PRIVATE_KEYS = [
  {
    label: "Account #0",
    key: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    label: "Account #1",
    key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  {
    label: "Account #2",
    key: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
  {
    label: "Account #3",
    key: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  },
  {
    label: "Account #4",
    key: "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
  },
  {
    label: "Account #5",
    key: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
  },
  {
    label: "Account #6",
    key: "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
  },
  {
    label: "Account #7",
    key: "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
  },
  {
    label: "Account #8",
    key: "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
  },
  {
    label: "Account #9",
    key: "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
  },
  {
    label: "Account #10",
    key: "0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897",
  },
  {
    label: "Account #11",
    key: "0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82",
  },
  {
    label: "Account #12",
    key: "0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1",
  },
  {
    label: "Account #13",
    key: "0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd",
  },
  {
    label: "Account #14",
    key: "0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa",
  },
  {
    label: "Account #15",
    key: "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61",
  },
  {
    label: "Account #16",
    key: "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0",
  },
  {
    label: "Account #17",
    key: "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd",
  },
  {
    label: "Account #18",
    key: "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0",
  },
  {
    label: "Account #19",
    key: "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
  },
]

export default function DeFiLendingApp() {
  const [web3, setWeb3] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState("")
  const [depositBalance, setDepositBalance] = useState("0")
  const [loanBalance, setLoanBalance] = useState("0")
  const [ethBalance, setEthBalance] = useState("0")
  const [accruedInterest, setAccruedInterest] = useState("0")
  const [healthFactor, setHealthFactor] = useState("0")

  const [depositAmount, setDepositAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [repayAmount, setRepayAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const [receiver, setReceiver] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [receiverBalance, setReceiverBalance] = useState("0")
  const [availableCollateral, setAvailableCollateral] = useState("0")

  const [selectedKey, setSelectedKey] = useState(PRIVATE_KEYS[0].key)
  const [txHistory, setTxHistory] = useState([])

  // Transaction popup state
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({ type: "", amount: "", status: "pending" })

  // Initialize web3 + contract when private key changes
  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = new Web3("http://localhost:8545")
        const acc = web3Instance.eth.accounts.privateKeyToAccount(selectedKey)
        web3Instance.eth.accounts.wallet.clear()
        web3Instance.eth.accounts.wallet.add(acc)
        web3Instance.eth.defaultAccount = acc.address

        const lendingInstance = new web3Instance.eth.Contract(LendingABI, CONTRACT_ADDRESS, { from: acc.address })

        setWeb3(web3Instance)
        setContract(lendingInstance)
        setAccount(acc.address)
      } catch (err) {
        console.error("Failed to initialize Web3:", err)
      }
    }

    init()
  }, [selectedKey])

  const updateBalances = useCallback(async () => {
    if (!contract || !account || !web3) return
    try {
      const d = await contract.methods.deposits(account).call()
      const l = await contract.methods.loans(account).call()
      const eth = await web3.eth.getBalance(account)
      const available = await contract.methods.getAvailableCollateral(account).call()
      const interest = await contract.methods.getAccruedInterest(account).call()
      const hf = await contract.methods.getHealthFactor(account).call()

      setDepositBalance(web3.utils.fromWei(d, "ether"))
      setLoanBalance(web3.utils.fromWei(l, "ether"))
      setEthBalance(web3.utils.fromWei(eth, "ether"))
      setAvailableCollateral(web3.utils.fromWei(available, "ether"))
      setAccruedInterest(web3.utils.fromWei(interest, "ether"))

      // Health factor is returned as percentage * 100, so divide by 100 to get the actual value
      const hfValue = Number(hf)
      if (hfValue === Number.MAX_VALUE || hfValue > 1000000) {
        setHealthFactor("∞")
      } else {
        setHealthFactor((hfValue / 100).toFixed(2))
      }

      if (receiver) {
        const rBal = await web3.eth.getBalance(receiver)
        setReceiverBalance(web3.utils.fromWei(rBal, "ether"))
      }
    } catch (err) {
      console.error("Error fetching balances:", err)
    }
  }, [contract, account, web3, receiver])

  useEffect(() => {
    updateBalances()
  }, [updateBalances])

  const showTransactionPopup = (type, amount, status = "pending") => {
    setPopupData({ type, amount, status })
    setShowPopup(true)

    if (status === "pending") {
      // Auto-update to success after 2 seconds for demo purposes
      setTimeout(() => {
        setPopupData((prev) => ({ ...prev, status: "success" }))
        // Auto-hide after 3 more seconds
        setTimeout(() => setShowPopup(false), 3000)
      }, 2000)
    }
  }

  const addTxLog = (type, amount, txHash) => {
    setTxHistory((prev) => [{ type, amount, txHash, timestamp: new Date().toLocaleTimeString() }, ...prev])
  }

  const deposit = async () => {
    if (!depositAmount) return alert("Enter deposit amount")
    try {
      showTransactionPopup("Deposit", depositAmount)

      const tx = await contract.methods.deposit().send({
        from: account,
        value: web3.utils.toWei(depositAmount, "ether"),
      })

      updateBalances()
      addTxLog("Deposit", depositAmount, tx.transactionHash)
      setDepositAmount("")
    } catch (err) {
      console.error("Deposit error:", err)
      setPopupData((prev) => ({ ...prev, status: "error" }))
    }
  }

  const borrow = async () => {
    if (!borrowAmount) return alert("Enter borrow amount")
    try {
      showTransactionPopup("Borrow", borrowAmount)

      const tx = await contract.methods.borrow(web3.utils.toWei(borrowAmount, "ether")).send({ from: account })

      updateBalances()
      addTxLog("Borrow", borrowAmount, tx.transactionHash)
      setBorrowAmount("")
    } catch (err) {
      console.error("Borrow error:", err)
      setPopupData((prev) => ({ ...prev, status: "error" }))
    }
  }

  const repay = async () => {
    if (!repayAmount) return alert("Enter repay amount")
    try {
      showTransactionPopup("Repay", repayAmount)

      const tx = await contract.methods.repay().send({
        from: account,
        value: web3.utils.toWei(repayAmount, "ether"),
      })

      updateBalances()
      addTxLog("Repay", repayAmount, tx.transactionHash)
      setRepayAmount("")
    } catch (err) {
      console.error("Repay error:", err)
      setPopupData((prev) => ({ ...prev, status: "error" }))
    }
  }

  const withdraw = async () => {
    if (!withdrawAmount) return alert("Enter withdraw amount")
    try {
      showTransactionPopup("Withdraw", withdrawAmount)

      const tx = await contract.methods.withdraw(web3.utils.toWei(withdrawAmount, "ether")).send({ from: account })

      updateBalances()
      addTxLog("Withdraw", withdrawAmount, tx.transactionHash)
      setWithdrawAmount("")
    } catch (err) {
      console.error("Withdraw error:", err)
      setPopupData((prev) => ({ ...prev, status: "error" }))
    }
  }

  const sendETH = async () => {
    if (!receiver || !sendAmount) return alert("Enter receiver and amount")
    try {
      showTransactionPopup("Send", sendAmount)

      const tx = await web3.eth.sendTransaction({
        from: account,
        to: receiver,
        value: web3.utils.toWei(sendAmount, "ether"),
      })

      updateBalances()
      addTxLog("Send", sendAmount, tx.transactionHash)
      setSendAmount("")
    } catch (err) {
      console.error("Send ETH error:", err)
      setPopupData((prev) => ({ ...prev, status: "error" }))
    }
  }

  return (
    <div className="defi-app">
      <BackgroundAnimation />

      {showPopup && (
        <TransactionPopup
          type={popupData.type}
          amount={popupData.amount}
          status={popupData.status}
          onClose={() => setShowPopup(false)}
        />
      )}

      <motion.div
        className="app-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="app-header">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <span className="gradient-text">BlockChain</span> DeFi Lending
          </motion.h1>

          <WalletSelector privateKeys={PRIVATE_KEYS} selectedKey={selectedKey} onSelectKey={setSelectedKey} />
        </header>

        <BalanceCard
          account={account}
          ethBalance={ethBalance}
          depositBalance={depositBalance}
          loanBalance={loanBalance}
          accruedInterest={accruedInterest}
          healthFactor={healthFactor}
          receiverAddress={receiver}
          receiverBalance={receiverBalance}
        />

        <div className="action-cards-container">
          <motion.div
            className="action-cards-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <ActionCard
              title="Deposit ETH"
              description="Deposit your ETH to earn interest"
              icon="arrow-down-circle"
              inputValue={depositAmount}
              onInputChange={setDepositAmount}
              buttonText="Deposit"
              onButtonClick={deposit}
              inputPlaceholder="Amount in ETH"
            />

            <ActionCard
              title="Withdraw Collateral"
              description={`Available: ${availableCollateral} ETH`}
              icon="arrow-up-circle"
              inputValue={withdrawAmount}
              onInputChange={setWithdrawAmount}
              buttonText="Withdraw"
              onButtonClick={withdraw}
              inputPlaceholder="Amount in ETH"
            />

            <ActionCard
              title="Borrow ETH"
              description="Borrow against your deposits"
              icon="credit-card"
              inputValue={borrowAmount}
              onInputChange={setBorrowAmount}
              buttonText="Borrow"
              onButtonClick={borrow}
              inputPlaceholder="Amount in ETH"
            />

            <ActionCard
              title="Repay ETH"
              description="Repay your outstanding loans"
              icon="refresh-cw"
              inputValue={repayAmount}
              onInputChange={setRepayAmount}
              buttonText="Repay"
              onButtonClick={repay}
              inputPlaceholder="Amount in ETH"
            />

            <ActionCard
              title="Send ETH"
              description="Transfer ETH to another wallet"
              icon="send"
              inputValue={sendAmount}
              onInputChange={setSendAmount}
              buttonText="Send"
              onButtonClick={sendETH}
              inputPlaceholder="Amount in ETH"
              extraInput={{
                value: receiver,
                onChange: setReceiver,
                placeholder: "Receiver Address",
              }}
            />
          </motion.div>
        </div>

        <TransactionHistory transactions={txHistory} />
      </motion.div>
    </div>
  )
}
