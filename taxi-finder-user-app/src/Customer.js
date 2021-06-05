import { Component } from 'react';
import openSocket from 'socket.io-client';

class Customer extends Component {

  constructor() {
    super()

    this.socket = openSocket('http://localhost:8080');

    this.socket.on('user/endRide', (user) => {
      if (user.userId === this.user.userId) {
        this.setState(this.initialState())

      }
    })

    this.initUser()

    this.state = this.initialState()
  }

  initUser() {
    this.user = {
      userId: `${Date.now()}`.slice(-2),
      source: this.getRandomCoordinate(),
      destination: this.getRandomCoordinate()
    }
  }

  initialState() {
    this.initUser()

    return {
        message: 'Idle...',
        requested: false
    }
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

  requestTaxi() {

    this.socket.emit('user/requestTaxi', this.user)

    this.setState({
      message: 'Taxi requested! Please wait a nearby driver to pickup',
      requested: true
    })
  }

  cancelRequest() {
    this.setState(this.initialState())
  }

  render() {
    return (
      <div className="Customer">
        <h1>Taxi Finder Customer APP</h1>
        <button onClick={ e => { e.preventDefault(); this.requestTaxi(); } } disabled={this.state.requested}>
          I want a TAXI!
        </button>
        <p>Customer: {this.user.userId}</p>
        <p>Current status: {this.state.message}</p>
      </div>
    );
  }
}

export default Customer;
