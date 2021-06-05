
class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `Coordinate(${this.x}, ${this.y})`
    }
}

class Customer {
    constructor(location, destination, name, transportedBy = null, kmTraveled = 0) {
        this.location = location
        this.destination = destination
        this.name = name
        this.transportedBy = transportedBy
        this.kmTraveled = kmTraveled
    }

    toString() {
        return `Customer(location: ${this.location}, destination: ${this.destination}, name: ${this.name})`
    }
}

class Car {
    constructor(location, customer, carPlate, fetchingCustomer = false) {
        this.location = location
        this.customer = customer
        this.carPlate = carPlate
        this.fetchingCustomer = fetchingCustomer
    }

    toString() {
        return `Car(location: ${this.location}, customer: ${this.customer}, carPlate: ${this.carPlate})`
    }
}

// initially the are will be only a rectangle, this needs to be changed in the future.
class RectArea {
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint
        this.endPoint = endPoint
    }
    toString() {
        return `RectArea(start: ${this.startPoint}, end: ${this.endPoint})`
    }
}

exports.Coordinate = Coordinate
exports.Car = Car
exports.Customer = Customer
exports.RectArea = RectArea