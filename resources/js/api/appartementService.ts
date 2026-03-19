import axios from "axios";

export const appartementService = {
    getAppartements: async (params = {}) => {
        const response = await axios.get("/api/appartements", { params });
        return response.data;
    },
    getAppartement: async (id: string) => {
        const response = await axios.get(`/api/appartements/${id}`);
        return response.data;
    },
    createAppartement: async (data: FormData) => {
        const response = await axios.post("/api/appartements", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    updateAppartement: async (id: string, data: FormData) => {
        const response = await axios.post(`/api/appartements/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
            params: { _method: "PUT" },
        });
        return response.data;
    },
    deleteAppartement: async (id: string) => {
        const response = await axios.delete(`/api/appartements/${id}`);
        return response.data;
    },
    deleteDocument: async (id: string, fileUrl: string) => {
        const response = await axios.delete(`/api/appartements/${id}/documents`, {
            data: { file_url: fileUrl },
        });
        return response.data;
    },
};
