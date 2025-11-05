"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet } from "lucide-react"

interface WalletSelectorProps {
  privateKeys: { label: string; key: string }[]
  selectedKey: string
  onSelectKey: (key: string) => void
}

export function WalletSelector({ privateKeys, selectedKey, onSelectKey }: WalletSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedAccount = privateKeys.find((pk) => pk.key === selectedKey)?.label || "Select Wallet"

  return (
    <div className="wallet-selector">
      <motion.button
        className="wallet-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wallet className="wallet-icon" />
        <span>{selectedAccount}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          className="wallet-dropdown"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {privateKeys.map(({ key, label }) => (
            <motion.div
              key={key}
              className={`wallet-option ${key === selectedKey ? "selected" : ""}`}
              onClick={() => {
                onSelectKey(key)
                setIsOpen(false)
              }}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              {label}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
