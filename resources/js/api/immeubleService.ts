import axios from 'axios';

export const immeubleService = {
  getImmeubles: async (params?: any) => {
    const response = await axios.get('/api/immeubles', { params });
    return response.data;
  },
  
  createImmeuble: async (data: FormData) => {
    const response = await axios.post('/api/immeubles', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updateImmeuble: async (id: string, data: FormData) => {
    // Add spoofing since PHP doesn't handle multipart on PUT
    data.append('_method', 'PUT');
    const response = await axios.post(`/api/immeubles/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteImmeuble: async (id: string) => {
    const response = await axios.delete(`/api/immeubles/${id}`);
    return response.data;
  },
  
  deleteDocument: async (id: string, fileUrl: string) => {
    const response = await axios.delete(`/api/immeubles/${id}/documents`, {
      data: { file_url: fileUrl },
    });
    return response.data;
  },
};
