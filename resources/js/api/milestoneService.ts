import axios from 'axios';
import { PaymentMilestone } from '../types';

export const milestoneService = {
    async addMilestone(contractId: string, data: {
        label: string;
        amount: number;
        due_date: string;
    }): Promise<PaymentMilestone> {
        const response = await axios.post(`/api/contracts/${contractId}/milestones`, data);
        return response.data;
    },

    async updateMilestone(milestoneId: string, data: {
        label?: string;
        amount?: number;
        due_date?: string;
    }): Promise<PaymentMilestone> {
        const response = await axios.patch(`/api/milestones/${milestoneId}`, data);
        return response.data;
    },

    async deleteMilestone(milestoneId: string): Promise<void> {
        await axios.delete(`/api/milestones/${milestoneId}`);
    },
};
