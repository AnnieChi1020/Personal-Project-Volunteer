import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { increment, decrement } from "./actions";

import Header from "./Components/Header.js";
import CreateEvent from "./Pages/CreateEventPage/CreateEvent.js";
import EventDetail from "./Pages/EventDetailPage/EventDetailPage.js";
import ProfilePage from "./Pages/ProfilePage/ProfilePage.js";

import { BrowserRouter as Router, Route } from "react-router-dom";

function App() {
  // const counter = useSelector((state) => state.counter);
  // const isLogged = useSelector((state) => state.isLogged);
  // const dispatch = useDispatch();
  return (
    <Router>
      <div className="App">
        <Header />
        <Route exact path="/"  />
        <Route exact path="/createEvent" component={CreateEvent} />

        <Route exact path="/events/:id" component={EventDetail} />
        <Route exact path="/profile" component={ProfilePage} />
        {/* <h1>Counter {counter}</h1>
      <button onClick={() => dispatch(increment(5))}>+</button>
      <button onClick={() => dispatch(decrement(5))}>-</button>

      {isLogged ? <h3>information</h3> : ""} */}
      </div>
    </Router>
  );
}

export default App;
