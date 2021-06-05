const { Car, Coordinate, Customer, RectArea } = require('./model.js');

class SimulationState {
    constructor(cars, customers, currentArea, startedAt = new Date(), lastUpdate = new Date(), carPlateCounter = 0, customerCounter = 0, lastTrips = []) {
        this._id = 1;
        this.cars = cars;
        this.customers = customers;
        this.currentArea = currentArea;
        this.startedAt = startedAt;
        this.lastUpdate = lastUpdate;
        this.carPlateCounter = carPlateCounter;
        this.customerCounter = customerCounter;
        this.lastTrips = lastTrips;
    }

    toString() {
        return `SimulationState(lastUpdate: ${this.lastUpdate}, cars: ${this.cars}, customers: ${this.customers}, startedAt: ${this.startedAt})`
    }
}

class SimulationConfig {
    constructor(carsOnMap, customersOnMap, currentArea, pricePerKM, speed) {
        this._id = 1;
        this.carsOnMap = carsOnMap;
        this.customersOnMap = customersOnMap;
        this.currentArea = currentArea;
        this.pricePerKM = pricePerKM;
        this.speed = speed;
    }

    toString() {
        return `SimulationConfig(carsOnMap: ${this.carsOnMap}, customersOnMap: ${this.customersOnMap}, currentArea: ${this.currentArea}, pricePerKM: ${this.pricePerKM}, speed: ${this.speed})`;
    }
}

class Simulation {

    constructor(resources) {
        const initialArea = new RectArea(new Coordinate(0, 0), new Coordinate(1000, 500));

        this.resources = resources;
        this.timerId = null;
        this.config = new SimulationConfig(2, 3, initialArea, 1, 2);

        if (this.isDatabaseAvailable()) {
            // this.loadState();
            this.loadConfig();
        }
    }

    setStepListener(stepCallback) {
        this.stepCallback = stepCallback;
    }

    updateConfig(config) {
        this.config = new SimulationConfig(config.carsOnMap, config.customersOnMap, config.currentArea, config.pricePerKM, config.speed);

        console.log(`Updated config ${this.config}`);
        this.reload();

        if (this.isDatabaseAvailable()) {
            this.saveConfig();
        }
    }

    reload() {
        console.log('Reloading Simulation');
        this.pause();

        if (this.config.speed != 0) {
            this.resume();
        }
    }

    start() {
        console.log('Starting simulation');

        this.initializeState();
        this.defineInterval();
    }

    pause() {
        console.log('Pausing the simulation');

        if (this.timerId) {
            clearInterval(this.timerId);
        }

        this.timerId = null;
    }

    resume() {
        console.log('Resuming the simulation');
        this.defineInterval();
    }

    defineInterval() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }

        this.timerId = setInterval(() => {
            this.step();

            if (this.stepCallback) {
                this.stepCallback();
            }

        }, 1000 / this.config.speed);
    }

    stop() {
        console.log('Stopping the simulation');
        this.pause();

        this.state = null;
    }

    updateCars() {
        const state = this.state;
        const carsOnMap = this.config.carsOnMap;
        if (carsOnMap != state.cars.length) {
            if (carsOnMap > state.cars.length) {
                const diff =  carsOnMap - state.cars.length;
                for (let i = 0; i < diff; i++) {
                    state.cars.push(this.randomCar());
                }
            } else {
                const diff = state.cars.length - carsOnMap;

                let count = 0;
                for (let i = 0; i < state.cars.length; i++) {
                    const car = state.cars[i];

                    if (car.customer == null) {
                        // removing unused car
                        state.cars.splice(i, 1);
                        count++;
                    }
                    if (count == diff) {
                        break;
                    }
                }
            }
        }
    }

    updateCustomers() {
        const state = this.state;
        const customersOnMap = this.config.customersOnMap;
        if (customersOnMap != state.customers.length) {
            if (customersOnMap > state.customers.length) {
                const diff =  customersOnMap - state.customers.length;
                for (let i = 0; i < diff; i++) {
                    state.customers.push(this.randomCustomer());
                }
            } else {
                const diff = state.customers.length - customersOnMap;

                let count = 0;
                for (let i = 0; i < state.customers.length; i++) {
                    const customer = state.customers[i];

                    if (customer.transportedBy == null) {
                        // removing unused car
                        state.customers.splice(i, 1);
                        count++;
                    }
                    if (count == diff) {
                        break;
                    }
                }
            }
        }
    }

    findCarByCustomer(customer) {
        const cars = this.state.cars;

        const found = cars.filter(car => {
            return (car.customer != null && car.customer.name == customer.name);
        })

        if (found.length == 0) {
            return null;
        }

        return found[0];
    }

    associateCarToWaitingCustomer(availableCustomers, availableCars) {
        if (availableCars.length > 0 && availableCustomers.length > 0) {
            availableCars.forEach(car => {
                if (availableCustomers.length > 0) {
                    const customer = availableCustomers.pop();
                    car.customer = customer;
                    car.fetchingCustomer = true;
                }
            });
        }
    }

    isInBounds(location, destination, tolerance) {
        const x1 = destination.x - tolerance;
        const x2 = destination.x + tolerance;

        const y1 = destination.y - tolerance;
        const y2 = destination.y + tolerance;

        const {x, y} = location;

        const minX = Math.min(x1, x2);
        const minY = Math.min(y1, y2);

        const maxX = Math.max(x1, x2);
        const maxY = Math.max(y1, y2);


        return ((x > minX && x < maxX) &&
            (y > minY && y < maxY));
    }

    calculateNewCoord(destination, location, amount) {
        //https://stackoverflow.com/questions/1934210/finding-a-point-on-a-line#1934226

        const x1 = location.x;
        const y1 = location.y;

        const x2 = destination.x;
        const y2 = destination.y;

        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const r = amount / distance;

        const x3 = r * x2 + (1 - r) * x1;
        const y3 = r * y2 + (1 - r) * y1;

        return new Coordinate(x3, y3);
    }

    stepCar(car) {
        const amount = 20;
        const customer = car.customer;
        const destination = car.fetchingCustomer ? customer.location : customer.destination;

        if (this.isInBounds(car.location, destination, amount)) {
            if (car.fetchingCustomer) {
                car.fetchingCustomer = false;
            } else {
                car.location = destination;
                car.customer = null;
                customer.location = destination;
            }

            return;
        }

        car.location = this.calculateNewCoord(destination, car.location, amount);
        // each amount is being considered as a km traveled, this can be changed
        customer.kmTraveled++;

        if (!car.fetchingCustomer) {
            customer.location = car.location;
        }
    }

    step() {
        // console.log(`Process each step of simulation ${new Date()} state: ${this.state}`);

        const state = this.state;
        this.config.currentArea = state.currentArea;

        this.updateCars();
        this.updateCustomers();

        const customers = state.customers;
        const cars = state.cars;
        const availableCustomers = customers.filter(customer => {return this.findCarByCustomer(customer) == null});
        const availableCars = cars.filter(car => {return car.customer == null});

        this.associateCarToWaitingCustomer(availableCustomers, availableCars);

        const occupiedCars = cars.filter(car => {return car.customer != null});

        occupiedCars.forEach(car => {
            this.stepCar(car);
        })

        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            if (customer.location == customer.destination) {
                state.customers.splice(i, 1);

                const price = customer.kmTraveled * this.config.pricePerKM;

                state.lastTrips.push(`Trip for '${customer.name}' ended (Cost: \$${price})`)
            }
        }
        state.lastUpdate = new Date();

        if (this.isDatabaseAvailable()) {
            this.saveState();
        }
    }

    reset() {
        console.log('resetting all states');
        this.initializeState();
    }

    isRunning() {
        return this.timerId != null;
    }

    isStopped() {
        // detect if it is initial state
        return !this.isRunning && this.state == null;
    }

    randomCustomer() {
        return new Customer(this.getRandomCoordinate(this.config.currentArea), this.getRandomCoordinate(this.config.currentArea), `User ${this.state.customerCounter++}`);
    }

    randomCar() {
        return new Car(this.getRandomCoordinate(this.config.currentArea), null, this.nextCarPlate());
    }

    nextCarPlate() {
        return `Taxi ${this.state.carPlateCounter++}`
    }

    initializeState(overrideState) {
        //read the last state from database

        if (overrideState) {
            this.state = new SimulationState(overrideState.cars,
                overrideState.customers,
                overrideState.currentArea,
                overrideState.startedAt,
                overrideState.lastUpdate,
                overrideState.carPlateCounter,
                overrideState.customerCounter,
                overrideState.lastTrips);
        } else {
            this.state = new SimulationState([], [], this.config.currentArea);
        }

        console.log(`initializing state: ${this.state}`);

        const cars = this.state.cars;
        for (let i = 0; i < this.config.carsOnMap; i++) {
            cars.push(this.randomCar());
        }

        const customers = this.state.customers;
        for (let i = 0; i < this.config.customersOnMap; i++) {
            customers.push(this.randomCustomer());
        }

    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomCoordinate(area) {
        const minX = Math.min(area.startPoint.x, area.endPoint.x);
        const minY = Math.min(area.startPoint.y, area.endPoint.y);

        const maxX = Math.max(area.startPoint.x, area.endPoint.x);
        const maxY = Math.max(area.startPoint.y, area.endPoint.y);

        return new Coordinate(this.getRandomInt(minX, maxX), this.getRandomInt(minY, maxY));
    }

    isDatabaseAvailable() {
        return this.resources.mongodb && this.resources.mongodb.client
    }

    saveConfig() {
    }

    loadConfig() {
    }

    saveState() {
    }

    loadState() {
    }

}



exports.Simulation = Simulation
