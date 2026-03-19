import axios from 'axios';
import { Contract } from '../types';

export const contractService = {
    async createContract(data: any): Promise<Contract> {
        const response = await axios.post('/api/contracts', data);
        return response.data;
    },

    async getContract(id: string): Promise<Contract> {
        const response = await axios.get(`/api/contracts/${id}`);
        return response.data;
    },

    async getRevenue(): Promise<any> {
        const response = await axios.get('/api/contracts/revenue');
        return response.data;
    },

    async listContracts(): Promise<Contract[]> {
        const response = await axios.get('/api/contracts');
        return response.data;
    },

    async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
        const response = await axios.patch(`/api/contracts/${id}`, data);
        return response.data;
    }
};
