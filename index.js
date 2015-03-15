// Constants
var KEY_1 = 49;
var KEY_V = 86;
var PLAYER1KEYCODE = KEY_1;
var PLAYER2KEYCODE = KEY_V;
var PLAYER1COLOR = 'red';
var PLAYER2COLOR = 'blue';

// Audio Clips
var switchService = new Audio('switch.mp3');
var ping = new Audio('ping.mp3');
var win = new Audio('win.mp3');
var deuce = new Audio('deuce.mp3');

// Slice Function
function slice(array) {
  return Array.prototype.slice.call(array);
}

// Score Keeper
function Score() {
  if (!(this instanceof Score)) {
    return new Score();
  }

  this._score = {one: 0, two: 0};
  this.callback = function () {};
}

Object.defineProperties(Score.prototype, {
  one: {
    get: function () {
      return this._score.one;
    },
    set: function (value) {
      this._score.one = value;
      this.callback(this._score);
      return value;
    }
  },
  two: {
    get: function () {
      return this._score.two;
    },
    set: function (value) {
      this._score.two = value;
      this.callback(this._score);
      return value;
    }
  }
});

Score.prototype.watch = function(callback) {
  this.callback = callback;
};

Score.prototype.zeros = function() {
  this._score = {one: 0, two: 0};
  this.callback(this._score);
};

Score.prototype.deuces = function() {
  this._score = {one: "D", two: "D"};
  this.callback(this._score);
};

// App Vars
var score = Score();
var player1 = document.getElementById('player-one');
var player2 = document.getElementById('player-two');
var meta = {
  one: {
    resetCounter: 0,
    reset: false,
    lastTime: null,
  },
  two: {
    resetCounter: 0,
    reset: false,
    lastTime: null
  }
};

// Calculate and set the font-size
slice(document.querySelectorAll('.player')).map(function (player) {
  var fontSize = player.offsetHeight / 2;
  player.style.fontSize = fontSize + 'px';
});

// Render the score to the page
function render(players) {
  player1.innerHTML = players.one;
  player2.innerHTML = players.two;
}

// Watch the score for changes
score.watch(function (players) {
  var playersSum = players.one + players.two;

  render(players);

  if (playersSum === 40) {
    deuce.play();
    startDeuce();
  } else if((playersSum % 5) === 0 && playersSum !== 0) {
    switchService.play();
  }
});

// Flash the background-color when a player scores
// The color can be either red or blue
function flash(color) {
  document.body.className += ' ' + color;
  setTimeout(function () {
    document.body.className = document.body.className.replace(color, '').trim();
  }, 250);
}

// Game Handlers
function gameKeyupHandler(event) {
  var newPlayer1Score;
  var newPlayer2Score;
  // player 1
  //-----------------
  if ((Date.now() - meta.one.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  } else if (event.keyCode === PLAYER1KEYCODE && !meta.one.reset) {
    ping.play();
    score.one += 1;
    if(score.one > 20) {
    flash(PLAYER1COLOR);
      score.one = 0;
    }
    meta.one.lastTime = Date.now();
    meta.one.resetCounter = 0;
  } else if (meta.one.reset) {
    meta.one.reset = false;
    meta.one.resetCounter = 0;
  }

  // player 2
  //-----------------
  if ((Date.now() - meta.two.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  } else if (event.keyCode === PLAYER2KEYCODE && !meta.two.reset) {
    ping.play();
    score.two += 1;
    if(score.two > 20) {
    flash(PLAYER2COLOR);
      score.two = 0;
    }
    meta.two.lastTime = Date.now();
    meta.two.resetCounter = 0;
  } else if (meta.two.reset) {
    meta.two.reset = false;
    meta.two.resetCounter = 0;
  }
}

function gameKeydownHandler(event) {
  if (event.keyCode === PLAYER1KEYCODE) {
    meta.one.resetCounter++;
    if (meta.one.resetCounter === 10) {
      ping.play();
      meta.one.reset = true;
      score.one = 0;
    }
  }

  if (event.keyCode === PLAYER2KEYCODE) {
    meta.two.resetCounter++;
    if (meta.two.resetCounter === 10) {
      ping.play();
      meta.two.reset = true;
      score.two = 0;
    }
  }
}

// Deuce Handlers
function deuceKeyupHandler(event) {
  // player 1
  //-----------------
  if ((Date.now() - meta.one.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  } else if (event.keyCode === PLAYER1KEYCODE && !meta.one.reset) {
    ping.play();
    flash(PLAYER1COLOR);
    if (score.one === "D" && score.two === "D") {
      ping.play();
      score.one = "A";
    } else if (score.one === "D" && score.two === "A") {
      ping.play();
      score.two = "D";
    } else {
      win.play();
      startGame();
    }
    meta.one.lastTime = Date.now();
    meta.one.resetCounter = 0;
  } else if (meta.one.reset) {
    meta.one.reset = false;
    meta.one.resetCounter = 0;
  }

  // player 2
  //-----------------
  if ((Date.now() - meta.two.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  } else if (event.keyCode === PLAYER2KEYCODE && !meta.two.reset) {
    ping.play();
    flash(PLAYER2COLOR);
    if (score.two === "D" && score.one === "D") {
      ping.play();
      score.two = "A";
    } else if (score.two === "D" && score.one === "A") {
      ping.play();
      score.one = "D";
    } else {
      win.play();
      startGame();
    }
    meta.two.lastTime = Date.now();
    meta.two.resetCounter = 0;
  } else if (meta.two.reset) {
    meta.two.reset = false;
    meta.two.resetCounter = 0;
  }
}

function deuceKeydownHandler(event) {
  if (event.keyCode === PLAYER1KEYCODE || event.keyCode === PLAYER2KEYCODE) {
    meta.one.resetCounter++;
    meta.two.resetCounter++;
    if (meta.one.resetCounter === 10 || meta.two.resetCounter === 10) {
      ping.play();
      meta.one.reset = true;
      meta.two.reset = true;
      endDeuce();
      startGame();
    }
  }
}

// Game Event Listeners
function startGame() {
  endDeuce();
  score.zeros();
  document.addEventListener('keydown', gameKeydownHandler, false);
  document.addEventListener('keyup', gameKeyupHandler, false);
}

function endGame() {
  document.removeEventListener('keydown', gameKeydownHandler, false);
  document.removeEventListener('keyup', gameKeyupHandler, false);
}

// Deuce Event Listeners
function startDeuce() {
  endGame();
  score.deuces();
  document.addEventListener('keydown', deuceKeydownHandler, false);
  document.addEventListener('keyup', deuceKeyupHandler, false);
}

function endDeuce() {
  document.removeEventListener('keydown', deuceKeydownHandler, false);
  document.removeEventListener('keyup', deuceKeyupHandler, false);
}

// Start the Game!!
startGame();
