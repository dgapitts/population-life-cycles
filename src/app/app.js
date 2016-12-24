import React, { Component } from 'react'; // eslint-disable-line no-unused-vars

import * as C from '../constants';
import { now } from '../utils/now';
import { ageMobs } from '../mob/age-mobs';
import { addMobs } from '../mob/add-mobs';
import { scrollToBottom } from '../utils/scroll-to-bottom';
import './app.scss';

// Main starting point of the game.
export default class App extends Component {
  componentWillMount() {
    // Mobs that are currently alive.
    this.mobs = [];

    // Mobs that used to be alive but are now dead.
    this.graveyard = [];

    // In heartbeat, tick measures if enough time has elapsed since the last tick.
    // Note: the very first tick is triggered when tick has its initial default value of undefined.
    this.tick = undefined;

    // Keep track of all log messages.
    this.setState({
      // In heartbeat, lastTime keeps track of the last time the function was run.
      lastTime: undefined,
      log: [],
    });

    // Functions of the game.
    this.heartbeat = this.heartbeat.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  componentDidMount() {
    this.heartbeat(); // Start the heartbeat.
  }

  componentDidUpdate(prevProps, prevState) {
    // Has log changed?
    if (this.state.log.length !== prevState.log.length) {
      scrollToBottom(this.refs.logWindow);
    }
  }

  // Called every "tick", see C.ONE_TICK for this length of time.
  updateGame() {
    // Log another tick in the world.
    this.updateLog(`[world tick] ${now()}.`);

    // Age all mobs by 1 year.
    this.mobs = ageMobs(this.mobs, 1, this.graveyard);
  }

  updateLog(message) {
    this.setState({
      log: this.state.log.concat([ message ]),
    })
  }

  // Heartbeat runs faster than the ticks and guarentees
  // an animation consistent with as smooth a framerate as possible.
  heartbeat(currentTime) {
    window.requestAnimationFrame(this.heartbeat);

    // Delta is amount of time since last heartbeat,
    // which can be fast depending on the client.
    const delta = this.state.lastTime === undefined ? 0 : currentTime - this.state.lastTime;
    this.setState({
      lastTime: currentTime,
    })

    // Update the game every tick (regular intervals),
    // not every heartbeat (too fast and varies based on client).
    if (this.tick === undefined || this.tick >= C.ONE_TICK) {
      // The heartbeat is not allowed to make any game update
      // or any DOM operation, only other functions called by updateGame can.
      this.updateGame();
      this.tick = 0; // Reset the tick.
    }

    // todo: create a separate, faster "tick" for animations (250 milliseconds, i.e. .25 of a second?)
    // like objects moving, camera controls or handling keyboard input.

    // note: for an animation, movements should be related to the delta.
    // see http://creativejs.com/resources/requestanimationframe/

    // Increment the tick by the delta.
    this.tick = this.tick + delta;
  }

  submitForm(event) {
    addMobs(event, this.mobs);
  }

  render() {
    let key = 0;
    const logMessages = this.state.log.map(message => {
      key = key + 1;
      return <li key={key}>{message}</li>
    });

    return (
      <div>
        <form id="main-controls" action="#" onSubmit={this.submitForm}>
          <input type="number" id="number-mobs-to-add" defaultValue="1" />
          <select name="mob-category" id="mob-category">
            <option value="Orc">Orcs</option>
            <option value="Cat">Cats</option>
          </select>
          <input type="submit" value="Add" />
        </form>

        <ul className="horizontal center">
          <li>Population <span id="total-population">{this.mobs.length.toString()}</span></li>
          <li>Graveyard <span id="total-graveyard">{this.graveyard.length.toString()}</span></li>
        </ul>

        <ol className="scrollable-window" ref="logWindow">
          {logMessages}
        </ol>
      </div>
    );
  }
}
