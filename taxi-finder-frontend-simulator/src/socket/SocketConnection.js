import openSocket from 'socket.io-client';

class SocketConnection {
    constructor() {
        this.socket = openSocket('http://localhost:8080');

        this.socket.on('step', (state) => {
            if (this.stepCallback) {
                this.stepCallback(state)
            }
        });
    }

    getAdminConfig(configCallback) {
        this.socket.on('configChanged', adminConfiguration => {
            configCallback(adminConfiguration)
        });
        this.socket.emit('needConfig')
    }

    setAdminConfig(adminConfiguration) {
        console.log(`setAdminConfig: ${adminConfiguration.speed}`)
        this.socket.emit('updateConfig', adminConfiguration)
    }

    stop() {
        this.socket.emit('stop');
    }

    start() {
        this.socket.emit('start');
    }

    pause() {
        this.socket.emit('pause');
    }

    resume() {
        this.socket.emit('resume');
    }

    setStepCallback(stepCallback) {
        this.stepCallback = stepCallback;
    }
}

export default SocketConnection;
