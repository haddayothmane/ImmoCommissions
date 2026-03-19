import axios from "axios";
import { PaiementRecord } from "../types";

export const paiementService = {
    listPaiements: async (): Promise<PaiementRecord[]> => {
        const response = await axios.get("/api/paiements");
        return response.data;
    },
    
    downloadReceipt: async (paymentId: string) => {
        const response = await axios.get(`/api/paiements/${paymentId}/pdf`, {
            responseType: 'blob',
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `recu_${paymentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    createPaiement: async (data: any): Promise<PaiementRecord> => {
        const response = await axios.post("/api/paiements", data);
        return response.data;
    }
};
