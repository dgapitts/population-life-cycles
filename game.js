const log = [];
const numberMobsToAdd = document.getElementById('number-mobs-to-add');
const displayLog = document.getElementById('display-log');
const totalPopulation = document.getElementById('total-population');
const lastUpdate = document.getElementById('last-update');
const mobs = [];

const guid = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);

  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

const C = {
  MALE: 'male',
  FEMALE: 'female',
  YOUNG: 'pawn',
  ADULT: 'mob',
  MIN_AGE: 3,
  MAX_MOB_LONGEVITY: 17,
  MAX_ORC_LONGEVITY: 30,
}

class Mob {
  constructor(input) {
    Object.assign(this, input);
    this.id = guid();
    this.gender = this.gender || this.randomGender();
    this.age = this.randomNumber(0, C.MIN_AGE);
    this.created = Date.now();
    this.longevity = this.randomNumber(C.MIN_AGE, this.maxLongevity());
    this.category = this.getCategory();

    this.updateLog();
  }

  young() {
    return C.YOUNG;
  }

  adult() {
    return C.ADULT;
  }

  maxLongevity() {
    return C.MAX_MOB_LONGEVITY;
  }

  randomNumber(min, max) {
    return Math.floor(Math.random(Date.now()) * max) + min;
  }

  randomGender() {
    return this.randomNumber(0, 90) >= 50 ? C.MALE : C.FEMALE;
  }

  isAlive() {
    return this.age < this.longevity;
  }

  canProcreate() {
    return this.age > 1 && this.isAlive();
  }

  canBecomePregnant() {
    return this.gender === C.FEMALE && this.canProcreate();
  }

  getCategory() {
    return this.age < 1 ? this.young() : this.adult();
  }

  updateLog() {
    const age = this.age > 0 ? `${this.age} ${this.age > 1 ? 'years' : 'year'} old` : 'newborn';
    updateLog(`Pop ${this.gender} ${this.category} (${age}, \u2625${this.longevity}).`);
  }
}

class Cat extends Mob {
  young() {
    return 'kitten';
  }

  adult() {
    return 'cat';
  }
}

class Orc extends Mob {
  young() {
    return 'orc pawn';
  }

  adult() {
    return 'orc';
  }

  maxLongevity() {
    return C.MAX_ORC_LONGEVITY;
  }
}

const updateGame = () => {
  const updated = new Date().toLocaleString('fr');
  updateLog(`game is updated ${updated}.`);

  totalPopulation.textContent = mobs.length.toString();
  lastUpdate.textContent = updated;
}

// Called every "tick", i.e. every 6 seconds.
let start;
let last;
const heartbeat = () => {
  const now = Date.now();
  const delta = now - last || 0;
  last = now;

  if (delta > 30) {
    updateGame();
  }

  window.requestAnimationFrame(heartbeat);
};

const updateLog = message => {
  log.push(message);
  const li = document.createElement('li');
  const text = document.createTextNode(message);
  li.appendChild(text);
  displayLog.appendChild(li);
}

const addCats = event => {
  event.preventDefault();

  const toAdd = Number(numberMobsToAdd.value);

  if (!toAdd ||  toAdd === 0) {
    throw new Error(`Invalid number of mobs to add: ${toAdd}.`)
  }

  for (let i = 0; i < toAdd; i++) {
    mobs.push(new Cat());
  }
};

// todo: addOrcs is the same as addCats so they should be refactored into a single function.
const addOrcs = event => {
  event.preventDefault();

  const toAdd = Number(numberMobsToAdd.value);

  if (!toAdd ||  toAdd === 0) {
    throw new Error(`Invalid number of mobs to add: ${toAdd}.`)
  }

  for (let i = 0; i < toAdd; i++) {
    mobs.push(new Orc());
  }
};

const addCatsButton = document.getElementById('add-cats');
addCatsButton.addEventListener('click', addCats, false);

const addOrcsButton = document.getElementById('add-orcs');
addOrcsButton.addEventListener('click', addOrcs, false);

// Start the heartbeat.
window.requestAnimationFrame(heartbeat);
