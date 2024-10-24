import axios, { AxiosInstance } from "axios"
import axiosRetry from "axios-retry"
import { HTTP } from "./http";

export class AxiosWrapper implements HTTP {
    httpClient: AxiosInstance;
    constructor(baseUrl: string, token: string) {
        this.httpClient = axios.create({
            baseURL: baseUrl,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })

        // Wrap our Axios HTTP client in an Axios retry object to automatically
        // handle rate limiting.  By default, this logic will retry a given
        // API call 3 times before failing.  Read the documentation for 
        // axios-retry on NPM to see more configuration options.
        axiosRetry(this.httpClient, {
            retries: 15,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                // Only retry if the API call recieves an error code of 429
                if (error.response) {
                    if (error.response.status === 429) {
                        console.log('Rate limited, retrying...')
                        return true;
                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
            }

        })
    }

    async get<T = any>(url: string, data?: any) {
        return this.httpClient.get<T>(url, data);
    }

    async post<T = any>(url: string, data?: any) {
        return this.httpClient.post<T>(url, data);
    }

    async patch<T = any>(url: string, data?: any) {
        return this.httpClient.patch<T>(url, data);
    }

    async delete<T = any>(url: string, data?: any) {
        return this.httpClient.delete<T>(url, data);
    }

    async put<T = any>(url: string, data?: any) {
        return this.httpClient.put<T>(url, data);
    }

    async putFormData<T = any>(url: string, data?: any, headers?: any) {
        const formData = new URLSearchParams();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        return this.httpClient.put<T>(url, formData.toString(), { headers: headers });
    }

    // Update the authentication wtih the latest access token
    async updateAuth() {
        this.httpClient = axios.create({
            baseURL: globalThis.__BASE_URL,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + globalThis.__ACCESS_TOKEN
            }
        })
    }
}