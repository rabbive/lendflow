"use client"

import { motion } from "framer-motion"
import { ArrowDownCircle, ArrowUpCircle, CreditCard, RefreshCw, Send } from "lucide-react"

interface ActionCardProps {
  title: string
  description: string
  icon: string
  inputValue: string
  onInputChange: (value: string) => void
  buttonText: string
  onButtonClick: () => void
  inputPlaceholder: string
  extraInput?: {
    value: string
    onChange: (value: string) => void
    placeholder: string
  }
}

export function ActionCard({
  title,
  description,
  icon,
  inputValue,
  onInputChange,
  buttonText,
  onButtonClick,
  inputPlaceholder,
  extraInput,
}: ActionCardProps) {
  // Map icon string to Lucide icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "arrow-down-circle":
        return <ArrowDownCircle className="card-icon" />
      case "arrow-up-circle":
        return <ArrowUpCircle className="card-icon" />
      case "credit-card":
        return <CreditCard className="card-icon" />
      case "refresh-cw":
        return <RefreshCw className="card-icon" />
      case "send":
        return <Send className="card-icon" />
      default:
        return <ArrowDownCircle className="card-icon" />
    }
  }

  return (
    <motion.div
      className="action-card"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <div className="card-header">
        {getIcon(icon)}
        <h3 className="card-title">{title}</h3>
      </div>

      <p className="card-description">{description}</p>

      <div className="card-inputs">
        {extraInput && (
          <input
            type="text"
            className="card-input"
            value={extraInput.value}
            onChange={(e) => extraInput.onChange(e.target.value)}
            placeholder={extraInput.placeholder}
          />
        )}

        <div className="input-with-button">
          <input
            type="text"
            className="card-input"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={inputPlaceholder}
          />

          <motion.button
            className="card-button"
            onClick={onButtonClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {buttonText}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
