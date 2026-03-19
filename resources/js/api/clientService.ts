import axios from 'axios';
import { Client, Contract } from '../types';

export const clientService = {
    async getClients(): Promise<Client[]> {
        const response = await axios.get('/api/clients');
        return response.data.data || response.data;
    },

    async getClient(id: string): Promise<Client & { contracts: Contract[] }> {
        const response = await axios.get(`/api/clients/${id}`);
        return response.data;
    },

    async createClient(data: Partial<Client>): Promise<Client> {
        const response = await axios.post('/api/clients', data);
        return response.data;
    },

    async updateClient(id: string, data: Partial<Client>): Promise<Client> {
        const response = await axios.put(`/api/clients/${id}`, data);
        return response.data;
    },

    async deleteClient(id: string): Promise<void> {
        await axios.delete(`/api/clients/${id}`);
    }
};
