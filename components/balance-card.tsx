"use client"

import { motion } from "framer-motion"
import { Wallet, Database, CreditCard, ArrowRight, TrendingUp, Heart } from "lucide-react"

interface BalanceCardProps {
  account: string
  ethBalance: string
  depositBalance: string
  loanBalance: string
  accruedInterest?: string
  healthFactor?: string
  receiverAddress?: string
  receiverBalance?: string
}

export function BalanceCard({
  account,
  ethBalance,
  depositBalance,
  loanBalance,
  accruedInterest,
  healthFactor,
  receiverAddress,
  receiverBalance,
}: BalanceCardProps) {
  // Determine health factor color based on value
  const getHealthFactorColor = (hf: string) => {
    if (hf === "∞") return "#10b981" // Green for infinite
    const value = parseFloat(hf)
    if (value >= 2.0) return "#10b981" // Green for healthy (>= 200%)
    if (value >= 1.5) return "#f59e0b" // Orange for warning (150-200%)
    return "#ef4444" // Red for danger (< 150%)
  }

  const getHealthFactorStatus = (hf: string) => {
    if (hf === "∞") return "No Loan"
    const value = parseFloat(hf)
    if (value >= 2.0) return "Healthy"
    if (value >= 1.5) return "Warning"
    return "Danger"
  }
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

        {accruedInterest && parseFloat(accruedInterest) > 0 && (
          <motion.div
            className="balance-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <TrendingUp className="balance-icon" style={{ color: "#f59e0b" }} />
            <div className="balance-label">Accrued Interest (5% APY)</div>
            <div className="balance-value" style={{ color: "#f59e0b" }}>
              {parseFloat(accruedInterest).toFixed(6)} <span className="eth-symbol">ETH</span>
            </div>
          </motion.div>
        )}

        {healthFactor && healthFactor !== "0" && (
          <motion.div
            className="balance-item"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Heart className="balance-icon" style={{ color: getHealthFactorColor(healthFactor) }} />
            <div className="balance-label">
              Health Factor - {getHealthFactorStatus(healthFactor)}
            </div>
            <div className="balance-value" style={{ color: getHealthFactorColor(healthFactor) }}>
              {healthFactor === "∞" ? "∞" : `${healthFactor}x`}
            </div>
          </motion.div>
        )}
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
