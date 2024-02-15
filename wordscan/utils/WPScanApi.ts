import axios, { AxiosInstance } from 'axios';

interface Status {
    requests_remaining: number;
}

class WPScanAPI {
    private apiTokens: string[];
    private currentIndex: number;
    private baseUrl: string;
    private axiosInstance: AxiosInstance;

    constructor(apiTokens: string[]) {
        this.apiTokens = apiTokens;
        this.currentIndex = 0;
        this.baseUrl = "https://wpscan.com/api/v3/";
        this.axiosInstance = axios.create();
        this.setToken(apiTokens[this.currentIndex]);
    }

    private setToken(token: string): void {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Token token=${token}`;
    }

    private async getStatusAndRequest<T>(method: 'get', url: string): Promise<T> {
        try {
            const status: Status = await this.getStatus();
            if (status.requests_remaining > 0) {
                return (await this.axiosInstance[method]<T>(url)).data;
            } else if (this.currentIndex < this.apiTokens.length - 1) {
                this.currentIndex++;
                this.setToken(this.apiTokens[this.currentIndex]);
                return this.getStatusAndRequest(method, url);
            } else {
                throw new Error('Toutes les clés API ont épuisé leurs crédits.');
            }
        } catch (error) {
            throw error;
        }
    }

    private async getStatus(): Promise<Status> {
        try {
            const response = await this.axiosInstance.get<Status>(`${this.baseUrl}status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    public async getWordPressVulnerabilitiesByVersion(version: string): Promise<any> {
        try {
            const response = await this.getStatusAndRequest<any>('get', `${this.baseUrl}wordpresses/${version}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    public async getPluginVulnerabilitiesBySlug(slug: string): Promise<any> {
        try {
            const response = await this.getStatusAndRequest<any>('get', `${this.baseUrl}plugins/${slug}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    public async getThemeVulnerabilitiesBySlug(slug: string): Promise<any> {
        try {
            const response = await this.getStatusAndRequest<any>('get', `${this.baseUrl}themes/${slug}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    public async getTotalCredits(): Promise<number> {
        let totalCredits = 0;

        for (const token of this.apiTokens) {
            const axiosInstance = axios.create();
            axiosInstance.defaults.headers.common['Authorization'] = `Token token=${token}`;

            try {
                const response = await axiosInstance.get<Status>(`${this.baseUrl}status`);
                const status: Status = response.data;
                totalCredits += status.requests_remaining;
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        }

        return totalCredits;
    }
}

export default WPScanAPI;