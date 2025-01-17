import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AXIOS_TIMEOUT, BASE_API_URL } from 'src/helpers/const';

const baseApi = axios.create({ baseURL: BASE_API_URL, timeout: AXIOS_TIMEOUT });
export const getApi = <Response>(url: string, config?: AxiosRequestConfig) =>
    baseApi.get<Response>(url, config)

export const postApi = <Response, PostData>(url: string, data: PostData, config?: AxiosRequestConfig) =>
    baseApi.post<Response, AxiosResponse<Response>, PostData>(url, data, config)

export const patchApi = <Response, PatchData>(url: string, data: PatchData, config?: AxiosRequestConfig) =>
    baseApi.patch<Response, AxiosResponse<Response>, PatchData>(url, data, config)

export const deleteApi = <Response>(url: string, config?: AxiosRequestConfig) =>
    baseApi.delete<Response>(url, config)
export const isSuccess = (response: AxiosResponse) => {
    return response.status < 400 && response.status >= 200
}
export const isFail = (response: AxiosResponse) => {
    return !isSuccess(response)
}