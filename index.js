var switchService = new Audio('switch.mp3');
var ping = new Audio('ping.mp3');
var win = new Audio('win.mp3');
var duece = new Audio('duece.mp3');

function slice(array) {
  return Array.prototype.slice.call(array);
}

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

Score.prototype.dueces = function() {
  this._score = {one: "D", two: "D"};
  this.callback(this._score);
};

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
var score = Score();
var players = slice(document.querySelectorAll('.player div'));
var player1 = players[0];
var player2 = players[1];
var player1KeyCode = 49;
var player2KeyCode = 86;

function render(players) {
  player1.innerHTML = players.one;
  player2.innerHTML = players.two;
}

score.watch(function (players) {
  var playersSum = players.one + players.two;
  render(players);

  if (playersSum === 40) {
    duece.play();
    startDuece();
  } else if((playersSum % 5) === 0 && playersSum !== 0) {
    switchService.play();
  }

});

slice(document.querySelectorAll('.player')).map(function (player) {
  var fontSize = player.offsetHeight / 2;
  player.style.fontSize = fontSize + 'px';
});

function flash(color) {
  document.body.className += ' ' + color;
  setTimeout(function () {
    document.body.className = document.body.className.replace(color, '').trim();
  }, 250);
}

function gameKeyupHandler(event) {
  // player 1
      //-----------------
  if((Date.now() - meta.one.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  }
  else if(event.keyCode === player1KeyCode && !meta.one.reset) {
    ping.play();
    flash('red');
    score.one += 1;
    if(score.one > 20) {
      score.one = 0;
    }
    meta.one.lastTime = Date.now();
    meta.one.resetCounter = 0;
  }
  else if(meta.one.reset) {
    meta.one.reset = false;
    meta.one.resetCounter = 0;
  }

  // player 2
  //-----------------
  if((Date.now() - meta.two.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  }
  else if(event.keyCode === player2KeyCode && !meta.two.reset) {
    ping.play();
    flash('blue');
    score.two += 1;
    if(score.two > 20) {
      score.two = 0;
    }
    meta.two.lastTime = Date.now();
    meta.two.resetCounter = 0;
  }
  else if(meta.two.reset) {
    meta.two.reset = false;
    meta.two.resetCounter = 0;
  }
}

function gameKeydownHandler(event) {
  if(event.keyCode === player1KeyCode) {
    meta.one.resetCounter++;
    if(meta.one.resetCounter === 10) {
      ping.play();
      meta.one.reset = true;
      score.one = 0;
    }
  }

  if(event.keyCode === player2KeyCode) {
    meta.two.resetCounter++;
    if(meta.two.resetCounter === 10) {
      ping.play();
      meta.two.reset = true;
      score.two = 0;
    }
  }
}

function dueceKeyupHandler(event) {
  // player 1
  //-----------------
  if((Date.now() - meta.one.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  }
  else if(event.keyCode === player1KeyCode && !meta.one.reset) {
    ping.play();
    flash('red');
    if(score.one === "D" && score.two === "D") {
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
  }
  else if(meta.one.reset) {
    meta.one.reset = false;
    meta.one.resetCounter = 0;
  }

  // player 2
  //-----------------
  if((Date.now() - meta.two.lastTime) < 500) {
    // do nothing: prevents them hitting it twice on accident
  }
  else if(event.keyCode === player2KeyCode && !meta.two.reset) {
    ping.play();
    flash('blue');
    if(score.two === "D" && score.one === "D") {
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
  }
  else if(meta.two.reset) {
    meta.two.reset = false;
    meta.two.resetCounter = 0;
  }
}

function dueceKeydownHandler(event) {
  if(event.keyCode === player1KeyCode || event.keyCode === player2KeyCode) {
    meta.one.resetCounter++;
    meta.two.resetCounter++;
    if(meta.one.resetCounter === 10 || meta.two.resetCounter === 10) {
      ping.play();
      meta.one.reset = true;
      meta.two.reset = true;
      endDuece();
      startGame();
    }
  }
}

function startGame() {
  endDuece();
  score.zeros();
  document.addEventListener('keydown', gameKeydownHandler, false);
  document.addEventListener('keyup', gameKeyupHandler, false);
}

function endGame() {
  document.removeEventListener('keydown', gameKeydownHandler, false);
  document.removeEventListener('keyup', gameKeyupHandler, false);
}

function startDuece() {
  endGame();
  score.dueces();
  document.addEventListener('keydown', dueceKeydownHandler, false);
  document.addEventListener('keyup', dueceKeyupHandler, false);
}

function endDuece() {
  document.removeEventListener('keydown', dueceKeydownHandler, false);
  document.removeEventListener('keyup', dueceKeyupHandler, false);
}

startGame();
