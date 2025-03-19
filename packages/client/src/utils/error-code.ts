import { AxiosError } from 'axios'

type ErrorCodeType = {
  [key: string]: { statusCode: number; message: string }
}

const ERROR_CODE: ErrorCodeType = {
  // axios 에러
  ERR_NETWORK: {
    statusCode: 500,
    message:
      '서버가 응답하지 않습니다. \n프로그램을 재시작하거나 관리자에게 연락하세요.',
  },
  ECONNABORTED: {
    statusCode: 408,
    message: '요청 시간을 초과했습니다.',
  },

  // 알 수 없는 에러
  UNKNOWN: { statusCode: 404, message: '알 수 없는 오류가 발생했습니다.' },
} as const

export const getErrData = (
  error: AxiosError<{ error: string; message: string; statusCode: number }>,
) => {
  if (error instanceof AxiosError) {
    const serverErrorCode = error.response?.data.error
    const axiosErrorCode = error.status

    if (serverErrorCode && error.response) {
      return {
        statusCode: error.response.data.statusCode,
        message: error.response.data.message,
      }
    } else if (axiosErrorCode! in ERROR_CODE) {
      return ERROR_CODE[axiosErrorCode as keyof typeof ERROR_CODE]
    }
  }

  return ERROR_CODE.UNKNOWN
}
