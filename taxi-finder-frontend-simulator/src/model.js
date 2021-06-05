
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
    constructor(location, destination, name) {
        this.location = location
        this.destination = destination
        this.name = name
    }

    toString() {
        return `Customer(location: ${this.location}, destination: ${this.destination}, name: ${this.name})`
    }
}

class Taxi {
    constructor(location, customer, taxiPlate) {
        this.location = location
        this.customer = customer
        this.taxiPlate = taxiPlate
    }

    toString() {
        return `Taxi(location: ${this.location}, customer: ${this.customer}, taxiPlate: ${this.taxiPlate})`
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

export { Coordinate, RectArea, Taxi, Customer}
