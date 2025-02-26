import { AxiosError } from 'axios'

export const getErrData = (
  error: AxiosError<{ statusCode: number; message: string; error: string }>,
) => {
  const serverErrorCode = error?.response?.data.statusCode ?? 0
  const axiosErrorCode = error?.code ?? '서버'
  const serverErrorMsg = error?.response?.data.message ?? '문제발생'

  console.log(error)
  return {
    statusCode: serverErrorCode ? serverErrorCode : axiosErrorCode,
    message: serverErrorMsg,
  }
}

// export const handleError = (error: AxiosError) => {
//   const errorData = getErrData(error.response)
//   CustomToast({
//     status: errorData.statusCode,
//     message: errorData.message,
//   })
//   console.log(errorData.statusCode, errorData.message)
// }
