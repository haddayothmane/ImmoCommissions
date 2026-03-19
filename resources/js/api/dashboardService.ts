import axios from 'axios';

export interface DashboardStats {
    total_sales: number;
    total_paid: number;
    remaining: number;
    late_milestones: number;
    active_contracts: number;
    completed_contracts: number;
    daily_payments: {
        period: string;
        total: number;
    }[];
    monthly_payments: {
        period: string;
        total: number;
    }[];
    yearly_payments: {
        period: string;
        total: number;
    }[];
    late_milestones_list?: {
        id: string;
        contract_id: string;
        label: string;
        due_date: string;
        amount: number;
        client_name: string;
        client_phone: string;
    }[];
}

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        const response = await axios.get('/api/dashboard/stats');
        return response.data;
    }
};
