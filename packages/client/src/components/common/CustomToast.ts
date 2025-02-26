import { toast, ToastContainerProps } from 'react-toastify'

interface IErrorCodeProps {
  status: string | number
  message: string
}

export default function CustomToast({ status, message }: IErrorCodeProps) {
  const defaultOptions: ToastContainerProps = {
    position: 'bottom-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeButton: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    progressStyle: { background: '#A2C083' },
    bodyStyle: { whiteSpace: 'pre-wrap', textAlign: 'center' },
    className: 'b-[6rem]',
  }

  return toast.error(`[${status}] ${message}`, defaultOptions)
}
