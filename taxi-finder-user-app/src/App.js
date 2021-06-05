import './App.css';
import {Route, BrowserRouter as Router} from "react-router-dom";
import Customer from './Customer'
import Driver from './Driver'

function App() {

  return (
    <Router>
      <div className="App">
        <Route path="/Customer" component={Customer} />
        <Route path="/Driver" component={Driver} />
      </div>
    </Router>
  );
}

export default App;
