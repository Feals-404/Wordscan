import { ScanListResult,ConfigData,Plugin,Theme,ScanResult,WPScanAPIResponse  } from '@/types/types';
import axios, { AxiosResponse } from 'axios';

const BASE_URL = '/api';

export const getConfig = (): Promise<AxiosResponse<ConfigData>> => {
  return axios.get<ConfigData>(`${BASE_URL}/config`);
};

export const updateConfig = (config: any): Promise<AxiosResponse<any>> => {
  return axios.put(`${BASE_URL}/config`, { config });
};

export const getWPScanCredits = (): Promise<AxiosResponse<WPScanAPIResponse>> => {
  return axios.get<WPScanAPIResponse>(`${BASE_URL}/config/credits`);
};

export const getAllScanResults = (): Promise<AxiosResponse<{ scan_results: Record<string, ScanListResult> }>> => {
  return axios.get<{ scan_results: Record<string, ScanListResult> }>(`${BASE_URL}/scan`);
};

export const launchScan = (url: string): Promise<AxiosResponse<{ success: boolean, message: string, scan_id?: string }>> => {
  return axios.post<{ success: boolean, message: string, scan_id?: string }>(`${BASE_URL}/scan`, { url });
};

export const deleteScanResult = (id: string): Promise<AxiosResponse<{ success: boolean, message: string }>> => {
  return axios.delete<{ success: boolean, message: string, scan_id?: string }>(`${BASE_URL}/scan/${id}`, {});
};

export const downloadScanResult = (id: string): Promise<AxiosResponse<any>> => {
  return axios.get(`${BASE_URL}/scan/${id}/download`, { responseType: 'blob' });
};

export const getScanResult = (id: string): Promise<AxiosResponse<{ success: boolean, scan_result?: ScanResult, message?: string }>> => {
  return axios.get<{ success: boolean, scan_result?: ScanResult, message?: string }>(`${BASE_URL}/scan/${id}`);
};

export const updateWordPressDb = (): Promise<AxiosResponse<any>> => {
  return axios.get(`${BASE_URL}/wordpressdb/update`);
};

export const listPlugins = (): Promise<AxiosResponse<{ plugins: string[] }>> => {
  return axios.get<{ plugins: string[] }>(`${BASE_URL}/wordpressdb/list/plugins`);
};

export const listThemes = (): Promise<AxiosResponse<{ themes: string[] }>> => {
  return axios.get<{ themes: string[] }>(`${BASE_URL}/wordpressdb/list/themes`);
};
