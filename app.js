document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    let isCurrentlyActive = false;
    
    const addLogEntry = (name, status) => {
        const date = new Date();
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}:${date.getMilliseconds().toString().padStart(3, '0')}`;
        
        let icon = '✅';
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `${icon} <span class="event-name">${name}</span>: <span class="event-date">${formattedDate}</span>`;
        logList.appendChild(listItem);
    };

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js', { scope: '/ServiceWorker/' })
                .then(registration => {
                    console.log('Service Worker registrado con éxito:', registration);
                    addLogEntry('Registrado', 'registered');
                    
                    if (navigator.serviceWorker.controller) {
                        if (!isCurrentlyActive) {
                            addLogEntry('Activo', 'active');
                            isCurrentlyActive = true;
                        }
                    }

                    registration.addEventListener('updatefound', () => {
                        const newSW = registration.installing;
                        if (newSW) {
                            addLogEntry('Instalado/wait', 'waiting');
                        }
                    });
                })
                .catch(error => {
                    console.error('Fallo el registro del Service Worker:', error);
                });

            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'LOG_EVENT') {
                    const eventStatus = event.data.status;
                    const eventName = event.data.name;

                    if (eventStatus === 'installed' || eventStatus === 'activating' || eventStatus === 'fetching') {
                        addLogEntry(eventName, eventStatus);
                        isCurrentlyActive = (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state === 'activated');
                    } else if (eventStatus === 'registered') {
                        addLogEntry(eventName, eventStatus);
                    }
                }
            });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (navigator.serviceWorker.controller && !isCurrentlyActive) {
                    addLogEntry('Activo', 'active');
                    isCurrentlyActive = true;
                }
            });
            
            setInterval(() => {
                const controller = navigator.serviceWorker.controller;
                if (!controller) {
                    addLogEntry('Ocioso', 'idle');
                } else if (!isCurrentlyActive) {
                    addLogEntry('Activo', 'active');
                    isCurrentlyActive = true;
                }
            }, 3000);
        });
    } else {
        console.log('El navegador no soporta Service Workers.');
    }
});
