import { useContext } from 'react'
import { ModalContext, ModalContextType } from '../contexts/ModalContext'

/**
 * Custom hook for modal management
 * Moved to separate file for React Fast Refresh compliance
 */
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export default useModal