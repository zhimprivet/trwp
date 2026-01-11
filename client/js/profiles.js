// Модуль управления профилями
const ProfilesModule = {
    profiles: [],

    init() {
        // Кнопка добавления профиля
        document.getElementById('add-profile-btn').addEventListener('click', () => {
            this.openAddProfileModal();
        });

        // Форма добавления профиля
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileSubmit();
        });

        // Кнопка отмены
        document.getElementById('cancel-profile-btn').addEventListener('click', () => {
            closeModal('profile-modal');
        });
    },

    async loadProfiles() {
        try {
            this.profiles = await API.profiles.getAll();
            this.renderProfiles();
        } catch (error) {
            showNotification('Ошибка загрузки профилей: ' + error.message, 'error');
        }
    },

    renderProfiles() {
        const container = document.getElementById('profiles-list');

        if (this.profiles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">Нет профилей обслуживания</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.profiles.map(profile => `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${profile.name}</div>
                        <div class="card-id">ID: ${profile.id}</div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-danger btn-small" onclick="ProfilesModule.deleteProfile('${profile.id}')">
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    openAddProfileModal() {
        document.getElementById('profile-name').value = '';
        openModal('profile-modal');
    },

    async handleProfileSubmit() {
        const name = document.getElementById('profile-name').value;

        try {
            await API.profiles.create({ name });
            showNotification('Профиль успешно добавлен', 'success');
            closeModal('profile-modal');
            await this.loadProfiles();

            // Обновляем списки профилей в других модулях
            await ManagersModule.loadManagers();
            await ClientsModule.loadClients();
        } catch (error) {
            showNotification('Ошибка добавления профиля: ' + error.message, 'error');
        }
    },

    async deleteProfile(id) {
        if (!confirm('Вы уверены, что хотите удалить этот профиль?')) {
            return;
        }

        try {
            await API.profiles.delete(id);
            showNotification('Профиль успешно удален', 'success');
            await this.loadProfiles();

            // Обновляем списки в других модулях
            await ManagersModule.loadManagers();
            await ClientsModule.loadClients();
        } catch (error) {
            showNotification('Ошибка удаления профиля: ' + error.message, 'error');
        }
    },

    // Вспомогательная функция для заполнения селектов профилей
    async fillProfileSelect(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Выберите профиль</option>' +
            this.profiles.map(profile =>
                `<option value="${profile.id}">${profile.name}</option>`
            ).join('');
    }
};