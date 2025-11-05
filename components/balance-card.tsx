"use client"

import { motion } from "framer-motion"
import { Wallet, Database, CreditCard, ArrowRight } from "lucide-react"

interface BalanceCardProps {
  account: string
  ethBalance: string
  depositBalance: string
  loanBalance: string
  receiverAddress?: string
  receiverBalance?: string
}

export function BalanceCard({
  account,
  ethBalance,
  depositBalance,
  loanBalance,
  receiverAddress,
  receiverBalance,
}: BalanceCardProps) {
  return (
    <motion.div
      className="balance-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="account-address">
        <div className="address-label">Connected Wallet</div>
        <div className="address-value">{account}</div>
      </div>

      <div className="balances-grid">
        <motion.div
          className="balance-item"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Wallet className="balance-icon" />
          <div className="balance-label">Wallet Balance</div>
          <div className="balance-value">
            {ethBalance} <span className="eth-symbol">ETH</span>
          </div>
        </motion.div>

        <motion.div
          className="balance-item"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Database className="balance-icon" />
          <div className="balance-label">Deposited</div>
          <div className="balance-value">
            {depositBalance} <span className="eth-symbol">ETH</span>
          </div>
        </motion.div>

        <motion.div
          className="balance-item"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <CreditCard className="balance-icon" />
          <div className="balance-label">Loan Balance</div>
          <div className="balance-value">
            {loanBalance} <span className="eth-symbol">ETH</span>
          </div>
        </motion.div>
      </div>

      {receiverAddress && (
        <motion.div
          className="receiver-balance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="receiver-info">
            <ArrowRight className="receiver-icon" />
            <div className="receiver-address">{receiverAddress}</div>
          </div>
          <div className="receiver-balance-value">
            {receiverBalance} <span className="eth-symbol">ETH</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
