// Модуль управления клиентами
const ClientsModule = {
    clients: [],
    currentClientId: null,

    init() {
        // Кнопка добавления клиента
        document.getElementById('add-client-btn').addEventListener('click', () => {
            this.openAddClientModal();
        });

        // Форма клиента
        document.getElementById('client-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleClientSubmit();
        });

        // Кнопка отмены
        document.getElementById('cancel-client-btn').addEventListener('click', () => {
            closeModal('client-modal');
        });
    },

    async loadClients() {
        try {
            console.log('Loading clients...');
            this.clients = await API.clients.getAll();
            console.log('Loaded clients:', this.clients);
            this.renderClients();
        } catch (error) {
            console.error('Error loading clients:', error);
            showNotification('Ошибка загрузки клиентов: ' + error.message, 'error');
        }
    },

    renderClients() {
        const container = document.getElementById('clients-list');

        if (this.clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <div class="empty-state-text">Нет клиентов</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.clients.map(client => `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${client.legal_form} "${client.name}"</div>
                        <div class="card-id">ID: ${client.id}</div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-secondary btn-small" onclick="ClientsModule.editClient('${client.id}')">
                            Редактировать
                        </button>
                        <button class="btn btn-danger btn-small" onclick="ClientsModule.deleteClient('${client.id}')">
                            Удалить
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-info">
                        <div class="info-row">
                            <span class="info-label">Требуемый профиль:</span>
                            <span class="info-value">
                                <span class="badge badge-info">${client.required_profile_name}</span>
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Менеджер:</span>
                            <span class="info-value">
                                ${client.manager_name || '<span style="color: #999;">Не назначен</span>'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    async openAddClientModal() {
        document.getElementById('client-modal-title').textContent = 'Добавить клиента';
        document.getElementById('client-id').value = 'Будет сгенерирован автоматически';
        document.getElementById('client-name').value = '';
        document.getElementById('client-legal-form').value = '';

        await ProfilesModule.fillProfileSelect('client-profile');
        await this.fillManagerSelect('client-manager');

        this.currentClientId = null;
        openModal('client-modal');
    },

    async editClient(id) {
        const client = this.clients.find(c => c.id === id);
        if (!client) return;

        document.getElementById('client-modal-title').textContent = 'Редактировать клиента';
        document.getElementById('client-id').value = client.id;
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-legal-form').value = client.legal_form;

        await ProfilesModule.fillProfileSelect('client-profile');
        document.getElementById('client-profile').value = client.required_profile_id;

        await this.fillManagerSelect('client-manager');
        document.getElementById('client-manager').value = client.manager_id || '';

        this.currentClientId = id;
        openModal('client-modal');
    },

    async handleClientSubmit() {
        const name = document.getElementById('client-name').value;
        const legal_form = document.getElementById('client-legal-form').value;
        const required_profile_id = document.getElementById('client-profile').value;
        const manager_id = document.getElementById('client-manager').value || null;

        console.log('Submitting client:', { name, legal_form, required_profile_id, manager_id });

        try {
            if (this.currentClientId) {
                // Обновление (без изменения менеджера через эту форму)
                console.log('Updating client:', this.currentClientId);
                await API.clients.update(this.currentClientId, { name, legal_form, required_profile_id });

                // Если нужно изменить менеджера
                const currentClient = this.clients.find(c => c.id === this.currentClientId);
                if (manager_id && manager_id !== currentClient.manager_id) {
                    console.log('Assigning to new manager:', manager_id);
                    await API.clients.assign(this.currentClientId, manager_id);
                } else if (!manager_id && currentClient.manager_id) {
                    console.log('Unassigning from manager');
                    await API.clients.unassign(this.currentClientId);
                }

                showNotification('Клиент успешно обновлен', 'success');
            } else {
                // Создание
                console.log('Creating new client');
                const result = await API.clients.create({ name, legal_form, required_profile_id, manager_id });
                console.log('Client created:', result);
                showNotification('Клиент успешно добавлен', 'success');
            }

            closeModal('client-modal');
            await this.loadClients();
            await ManagersModule.loadManagers();
        } catch (error) {
            console.error('Error submitting client:', error);
            showNotification('Ошибка: ' + error.message, 'error');
        }
    },

    async deleteClient(id) {
        if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
            return;
        }

        try {
            await API.clients.delete(id);
            showNotification('Клиент успешно удален', 'success');
            await this.loadClients();
            await ManagersModule.loadManagers();
        } catch (error) {
            console.error('Error deleting client:', error);
            showNotification('Ошибка удаления клиента: ' + error.message, 'error');
        }
    },

    async fillManagerSelect(selectId) {
        const managers = await API.managers.getAll();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Не назначен</option>' +
            managers.map(manager =>
                `<option value="${manager.id}">${manager.full_name} - ${manager.profile_name} (${manager.current_clients}/${manager.max_clients})</option>`
            ).join('');
    }
};
