"use client"

import { motion, AnimatePresence } from "framer-motion"
import { History, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface Transaction {
  type: string
  amount: string
  txHash: string
  timestamp: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      className="transaction-history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="history-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-title">
          <History className="history-icon" />
          <h3>Transaction History</h3>
        </div>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="history-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {transactions.length === 0 ? (
              <div className="no-transactions">No transactions yet.</div>
            ) : (
              <div className="transactions-list">
                {transactions.map((tx, i) => (
                  <motion.div
                    key={i}
                    className={`transaction-item ${tx.type.toLowerCase()}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <div className="tx-type">{tx.type}</div>
                    <div className="tx-amount">{tx.amount} ETH</div>
                    <div className="tx-hash">
                      tx: <code>{tx.txHash.slice(0, 10)}...</code>
                    </div>
                    <div className="tx-time">{tx.timestamp}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
