import '@/styles/global.css'
import { RouterProvider } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from 'react-toastify'
import { getErrData } from './utils/error-code'
import CustomToast from './components/common/CustomToast'
import { NotificationProvider } from './constants/notification-context'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      throwOnError: true,
    },
    mutations: {
      onError: (error: any) => {
        const errData = getErrData(error)
        CustomToast({
          status: errData.statusCode,
          message: errData.message,
        })
      },
    },
  },
})

function App() {
  return (
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={AppRouter} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <ToastContainer />
    </NotificationProvider>
  )
}

export default App
