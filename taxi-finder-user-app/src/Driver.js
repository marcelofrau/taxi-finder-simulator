import { Component } from 'react';
import openSocket from 'socket.io-client';

class Driver extends Component {

  constructor() {
    super()

    this.socket = openSocket('http://localhost:8080');

    this.driver = {
      driverId: `${Date.now()}`.slice(-2),
      location: this.getRandomCoordinate(),
    }

    this.socket.on('driver/request', (userRequestTaxi) => {

      if (userRequestTaxi.driverId == this.driver.driverId) {

        this.lastEvent = userRequestTaxi

        this.setState({
          message: `User ${userRequestTaxi.user.userId} requested a taxi`,
          requested: true
        })
      }

    })

    this.socket.on('driver/endRide', (userRequestTaxi) => {

      if (userRequestTaxi.driverId == this.driver.driverId) {

        this.lastEvent = userRequestTaxi

        this.setState({
          started: true,
          requested: false,
          message: 'Waiting for customer...'
        })
      }

    })

    this.state = this.initialState()
  }

  getRandomCoordinate() {
    const area = {
      startPoint: {x: 0, y:0},
      endPoint: {x:1000, y:500}
    };

    const minX = Math.min(area.startPoint.x, area.endPoint.x);
    const minY = Math.min(area.startPoint.y, area.endPoint.y);

    const maxX = Math.max(area.startPoint.x, area.endPoint.x);
    const maxY = Math.max(area.startPoint.y, area.endPoint.y);

    return {x: this.getRandomInt(minX, maxX), y: this.getRandomInt(minY, maxY)};
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  initialState() {
    return {
        message: 'Idle...',
        requested: false,
        started: false
    }
  }

  startJourney() {
    this.socket.emit('driver/register', this.driver)
    this.setState({
      started: true,
      message: 'Waiting for customer...'
    })
  }

  accept() {

    const e = this.lastEvent

    this.socket.emit('driver/accept', {
      user: e.user,
      driver: this.driver,
      userId: e.user.userId,
      driverId: this.driver.driverId,
      source: e.source,
      destination: e.destination,
      pendingDrivers: e.pendingDrivers
    })

    this.setState({
      message: 'Taking user into destination',
      requested: false,
      started: true
    })
  }

  reject() {
    const e = this.lastEvent

    this.socket.emit('driver/reject', {
      user: e.user,
      driver: this.driver,
      userId: e.user.userId,
      driverId: this.driver.driverId,
      source: e.source,
      destination: e.destination,
      pendingDrivers: e.pendingDrivers
    })

    this.setState({
      started: true,
      requested: false,
      message: 'Waiting for customer...'
    })
  }


  render() {


    return (
      <div className="Driver">
        <h1>Taxi Finder Driver APP</h1>
        <button onClick={ e => { e.preventDefault(); this.startJourney(); } } disabled={this.state.started}>
          Start Journey
        </button>
        <button onClick={ e => { e.preventDefault(); this.accept(); } } disabled={!this.state.requested}>
          Accept
        </button>
        <button onClick={ e => { e.preventDefault(); this.reject(); } } disabled={!this.state.requested}>
          Reject
        </button>
        <p>Driver: {this.driver.driverId}</p>
        <p>Current status: {this.state.message}</p>
      </div>
    );
  }
}

export default Driver;
