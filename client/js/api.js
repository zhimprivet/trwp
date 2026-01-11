// API модуль для взаимодействия с сервером
const API_BASE_URL = 'http://localhost:3000/api';

const API = {
    // Менеджеры
    managers: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/managers`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch managers');
            }
            return response.json();
        },
        getById: async (id) => {
            const response = await fetch(`${API_BASE_URL}/managers/${id}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch manager');
            }
            return response.json();
        },
        getClients: async (id) => {
            const response = await fetch(`${API_BASE_URL}/managers/${id}/clients`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch clients');
            }
            return response.json();
        },
        create: async (data) => {
            const response = await fetch(`${API_BASE_URL}/managers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create manager');
            }
            return response.json();
        },
        update: async (id, data) => {
            const response = await fetch(`${API_BASE_URL}/managers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update manager');
            }
            return response.json();
        },
        delete: async (id) => {
            const response = await fetch(`${API_BASE_URL}/managers/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete manager');
            }
            return response.json();
        }
    },

    // Клиенты
    clients: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/clients`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch clients');
            }
            return response.json();
        },
        getById: async (id) => {
            const response = await fetch(`${API_BASE_URL}/clients/${id}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch client');
            }
            return response.json();
        },
        create: async (data) => {
            const response = await fetch(`${API_BASE_URL}/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create client');
            }
            return response.json();
        },
        update: async (id, data) => {
            const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update client');
            }
            return response.json();
        },
        assign: async (clientId, managerId) => {
            const response = await fetch(`${API_BASE_URL}/clients/${clientId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manager_id: managerId })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to assign client');
            }
            return response.json();
        },
        unassign: async (clientId) => {
            const response = await fetch(`${API_BASE_URL}/clients/${clientId}/unassign`, {
                method: 'POST'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to unassign client');
            }
            return response.json();
        },
        delete: async (id) => {
            const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete client');
            }
            return response.json();
        }
    },

    // Профили
    profiles: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/profiles`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch profiles');
            }
            return response.json();
        },
        getById: async (id) => {
            const response = await fetch(`${API_BASE_URL}/profiles/${id}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch profile');
            }
            return response.json();
        },
        create: async (data) => {
            const response = await fetch(`${API_BASE_URL}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create profile');
            }
            return response.json();
        },
        delete: async (id) => {
            const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete profile');
            }
            return response.json();
        }
    }
};
