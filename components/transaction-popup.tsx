"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useEffect } from "react"

interface TransactionPopupProps {
  type: string
  amount: string
  status: "pending" | "success" | "error"
  onClose: () => void
}

export function TransactionPopup({ type, amount, status, onClose }: TransactionPopupProps) {
  useEffect(() => {
    // Auto-close after 5 seconds if status is success or error
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  return (
    <AnimatePresence>
      <motion.div
        className="transaction-popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`transaction-popup ${status}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="popup-status-icon">
            {status === "pending" && <Loader2 className="animate-spin" />}
            {status === "success" && <CheckCircle />}
            {status === "error" && <XCircle />}
          </div>

          <div className="popup-content">
            <h3 className="popup-title">
              {status === "pending" && "Processing Transaction"}
              {status === "success" && "Transaction Successful"}
              {status === "error" && "Transaction Failed"}
            </h3>

            <div className="popup-details">
              <div className="popup-type">{type}</div>
              <div className="popup-amount">{amount} ETH</div>
            </div>

            <div className="popup-message">
              {status === "pending" && "Please wait while your transaction is being processed..."}
              {status === "success" && "Your transaction has been confirmed on the blockchain."}
              {status === "error" && "There was an error processing your transaction. Please try again."}
            </div>
          </div>

          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
