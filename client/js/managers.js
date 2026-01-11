// Модуль управления менеджерами
const ManagersModule = {
    managers: [],
    currentManagerId: null,

    init() {
        // Кнопка добавления менеджера
        document.getElementById('add-manager-btn').addEventListener('click', () => {
            this.openAddManagerModal();
        });

        // Форма менеджера
        document.getElementById('manager-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleManagerSubmit();
        });

        // Кнопка отмены
        document.getElementById('cancel-manager-btn').addEventListener('click', () => {
            closeModal('manager-modal');
        });

        // Модальное окно клиентов менеджера
        document.getElementById('add-manager-client-btn').addEventListener('click', () => {
            this.openAssignClientModal();
        });

        // Форма назначения клиента
        document.getElementById('assign-client-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAssignClient();
        });

        // Кнопка отмены назначения
        document.getElementById('cancel-assign-btn').addEventListener('click', () => {
            closeModal('assign-client-modal');
        });
    },

    async loadManagers() {
        try {
            this.managers = await API.managers.getAll();
            this.renderManagers();
        } catch (error) {
            showNotification('Ошибка загрузки менеджеров: ' + error.message, 'error');
        }
    },

    renderManagers() {
        const container = document.getElementById('managers-list');

        if (this.managers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">Нет менеджеров</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.managers.map(manager => {
            const utilizationPercent = (manager.current_clients / manager.max_clients * 100).toFixed(0);
            let utilizationBadge = 'badge-success';
            if (utilizationPercent >= 80) utilizationBadge = 'badge-danger';
            else if (utilizationPercent >= 60) utilizationBadge = 'badge-warning';

            return `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${manager.full_name}</div>
                            <div class="card-id">ID: ${manager.id}</div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-small" onclick="ManagersModule.viewManagerClients('${manager.id}')">
                                Клиенты
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="ManagersModule.editManager('${manager.id}')">
                                Редактировать
                            </button>
                            <button class="btn btn-danger btn-small" onclick="ManagersModule.deleteManager('${manager.id}')">
                                Удалить
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-info">
                            <div class="info-row">
                                <span class="info-label">Профиль обслуживания:</span>
                                <span class="info-value">${manager.profile_name}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Максимум клиентов:</span>
                                <span class="info-value">${manager.max_clients}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Текущее количество клиентов:</span>
                                <span class="info-value">
                                    ${manager.current_clients}
                                    <span class="badge ${utilizationBadge}">${utilizationPercent}%</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async openAddManagerModal() {
        document.getElementById('manager-modal-title').textContent = 'Добавить менеджера';
        document.getElementById('manager-id').value = 'Будет сгенерирован автоматически';
        document.getElementById('manager-name').value = '';
        document.getElementById('manager-max-clients').value = '10';

        await ProfilesModule.fillProfileSelect('manager-profile');

        this.currentManagerId = null;
        openModal('manager-modal');
    },

    async editManager(id) {
        const manager = this.managers.find(m => m.id === id);
        if (!manager) return;

        document.getElementById('manager-modal-title').textContent = 'Редактировать менеджера';
        document.getElementById('manager-id').value = manager.id;
        document.getElementById('manager-name').value = manager.full_name;
        document.getElementById('manager-max-clients').value = manager.max_clients;

        await ProfilesModule.fillProfileSelect('manager-profile');
        document.getElementById('manager-profile').value = manager.profile_id;

        this.currentManagerId = id;
        openModal('manager-modal');
    },

    async handleManagerSubmit() {
        const full_name = document.getElementById('manager-name').value;
        const profile_id = document.getElementById('manager-profile').value;
        const max_clients = parseInt(document.getElementById('manager-max-clients').value);

        try {
            if (this.currentManagerId) {
                // Обновление
                await API.managers.update(this.currentManagerId, { full_name, profile_id, max_clients });
                showNotification('Менеджер успешно обновлен', 'success');
            } else {
                // Создание
                await API.managers.create({ full_name, profile_id, max_clients });
                showNotification('Менеджер успешно добавлен', 'success');
            }

            closeModal('manager-modal');
            await this.loadManagers();
        } catch (error) {
            showNotification('Ошибка: ' + error.message, 'error');
        }
    },

    async deleteManager(id) {
        if (!confirm('Вы уверены, что хотите удалить этого менеджера? Все его клиенты будут отвязаны.')) {
            return;
        }

        try {
            await API.managers.delete(id);
            showNotification('Менеджер успешно удален', 'success');
            await this.loadManagers();
            await ClientsModule.loadClients();
        } catch (error) {
            showNotification('Ошибка удаления менеджера: ' + error.message, 'error');
        }
    },

    async viewManagerClients(managerId) {
        this.currentManagerId = managerId;
        const manager = this.managers.find(m => m.id === managerId);

        document.getElementById('manager-clients-title').textContent =
            `Клиенты менеджера: ${manager.full_name}`;

        try {
            const clients = await API.managers.getClients(managerId);
            this.renderManagerClients(clients);
            openModal('manager-clients-modal');
        } catch (error) {
            showNotification('Ошибка загрузки клиентов: ' + error.message, 'error');
        }
    },

    renderManagerClients(clients) {
        const container = document.getElementById('manager-clients-list');

        if (clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📄</div>
                    <div class="empty-state-text">У этого менеджера пока нет клиентов</div>
                </div>
            `;
            return;
        }

        container.innerHTML = clients.map(client => `
            <div class="client-item">
                <div class="client-item-header">
                    <div>
                        <div class="client-item-title">${client.legal_form} "${client.name}"</div>
                        <div class="card-id">ID: ${client.id}</div>
                        <div style="margin-top: 5px;">
                            <span class="badge badge-info">${client.required_profile_name}</span>
                        </div>
                    </div>
                    <div class="client-item-actions">
                        <button class="btn btn-secondary btn-small" onclick="ManagersModule.transferClient('${client.id}')">
                            Перевести
                        </button>
                        <button class="btn btn-danger btn-small" onclick="ManagersModule.removeClient('${client.id}')">
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    async openAssignClientModal() {
        // Получаем всех клиентов без менеджера или с другими менеджерами
        const allClients = await API.clients.getAll();
        const availableClients = allClients.filter(c => !c.manager_id || c.manager_id !== this.currentManagerId);

        const select = document.getElementById('assign-client-select');
        select.innerHTML = '<option value="">Выберите клиента</option>' +
            availableClients.map(client =>
                `<option value="${client.id}">${client.legal_form} "${client.name}" - ${client.required_profile_name}</option>`
            ).join('');

        openModal('assign-client-modal');
    },

    async handleAssignClient() {
        const clientId = document.getElementById('assign-client-select').value;

        try {
            await API.clients.assign(clientId, this.currentManagerId);
            showNotification('Клиент успешно назначен менеджеру', 'success');
            closeModal('assign-client-modal');
            await this.viewManagerClients(this.currentManagerId);
            await this.loadManagers();
            await ClientsModule.loadClients();
        } catch (error) {
            showNotification('Ошибка назначения клиента: ' + error.message, 'error');
        }
    },

    async removeClient(clientId) {
        if (!confirm('Вы уверены, что хотите удалить связь этого клиента с менеджером?')) {
            return;
        }

        try {
            await API.clients.unassign(clientId);
            showNotification('Клиент отвязан от менеджера', 'success');
            await this.viewManagerClients(this.currentManagerId);
            await this.loadManagers();
            await ClientsModule.loadClients();
        } catch (error) {
            showNotification('Ошибка удаления связи: ' + error.message, 'error');
        }
    },

    async transferClient(clientId) {
        const client = await API.clients.getById(clientId);
        const availableManagers = this.managers.filter(m =>
            m.id !== this.currentManagerId &&
            m.profile_id === client.required_profile_id
        );

        if (availableManagers.length === 0) {
            showNotification('Нет доступных менеджеров с подходящим профилем', 'error');
            return;
        }

        const select = document.getElementById('transfer-manager-select');
        select.innerHTML = '<option value="">Выберите менеджера</option>' +
            availableManagers.map(manager =>
                `<option value="${manager.id}">${manager.full_name} (${manager.current_clients}/${manager.max_clients})</option>`
            ).join('');

        // Сохраняем ID клиента для передачи
        document.getElementById('transfer-client-form').dataset.clientId = clientId;

        openModal('transfer-client-modal');
    }
};

// Обработка формы перевода клиента
document.getElementById('transfer-client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const clientId = e.target.dataset.clientId;
    const newManagerId = document.getElementById('transfer-manager-select').value;

    try {
        await API.clients.assign(clientId, newManagerId);
        showNotification('Клиент успешно переведен другому менеджеру', 'success');
        closeModal('transfer-client-modal');
        await ManagersModule.viewManagerClients(ManagersModule.currentManagerId);
        await ManagersModule.loadManagers();
        await ClientsModule.loadClients();
    } catch (error) {
        showNotification('Ошибка перевода клиента: ' + error.message, 'error');
    }
});

document.getElementById('cancel-transfer-btn').addEventListener('click', () => {
    closeModal('transfer-client-modal');
});