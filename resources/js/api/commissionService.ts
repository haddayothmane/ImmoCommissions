import axios from "axios";
import { Commission, CommissionPayment } from "../types";

export const commissionService = {
    listCommissions: async (params?: any): Promise<{ data: Commission[], current_page: number, last_page: number, total: number }> => {
        const response = await axios.get("/api/commissions", { params });
        return response.data;
    },

    getCommission: async (id: string): Promise<Commission> => {
        const response = await axios.get(`/api/commissions/${id}`);
        return response.data;
    },

    createCommission: async (data: any): Promise<Commission> => {
        const response = await axios.post("/api/commissions", data);
        return response.data;
    },

    addPayment: async (id: string, data: any): Promise<CommissionPayment> => {
        const response = await axios.post(`/api/commissions/${id}/payments`, data);
        return response.data;
    },

    deleteCommission: async (id: string): Promise<void> => {
        await axios.delete(`/api/commissions/${id}`);
    }
};
