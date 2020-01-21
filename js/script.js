window.addEventListener('DOMContentLoaded', function() {
	const canvas = document.getElementById('canvas');
	const gameOver = document.getElementById('game-over');
	const startMenu = document.getElementById('start-menu');
	const newGame = document.getElementsByClassName('new-game');
	const score = document.getElementById('score');
	const ctx = canvas.getContext('2d');
	const width = canvas.width;
	const height = canvas.height;
	const centerX = width / 2;
	const centerY = height / 2;
	const blockNum = 15;
	const blockWidth = width / blockNum;
	const blockHeight = height / blockNum;
	const directions = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};
	let myScore;
	let nextRecord;
	let speed;
	let stop;
	let spawn;

	function drawField() {
		ctx.fillStyle = '#eee600';
		ctx.fillRect(0, 0, width, height);

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, blockHeight); // up
		ctx.fillRect(width - blockWidth, 0, blockWidth, height); // right
		ctx.fillRect(0, 0, blockWidth, height); // left
		ctx.fillRect(0, height - blockHeight, width, blockHeight); // down
	}

	function drawScore() {
		let fontSize = width / 20;
		ctx.font = `${fontSize}px Fantasy`;
		ctx.lineWidth = fontSize / 20;
		ctx.textBaseline = 'top';
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#000';

		ctx.fillText('Score: ' + myScore, blockWidth * 1.25, blockHeight * 1.25);
		ctx.strokeText('Score: ' + myScore, blockWidth * 1.25, blockHeight * 1.25);
	}

	function callGameOver() {
		gameOver.style.display = 'flex';
		score.textContent = myScore;
	}

	function setSpeed() {
		if (myScore === nextRecord && speed > 100) {
			speed -= 50;
			nextRecord += 10;
		}
		return speed;
	}

	function getRandomNum(min, max, num) {
		if (num <= 1 || num === undefined) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}

		let arr = [];

		for (let i = 0; i < num; i++) {
			arr[i] = Math.floor(Math.random() * (max - min + 1) + min);
		}
		return arr;
	}

	function getRandomDirection() {
		return directions[getRandomNum(37, 40)];
	}

	let Block = function (col, row) {
		this.col = col;
		this.row = row;
	};

	Block.prototype.drawSquare = function (color, border) {
		let x = this.col * blockWidth;
		let y = this.row * blockHeight;
		let lineWidth = 0;
		let sizeError = 0;

		if (!!border) {
			lineWidth = blockWidth / 3.5;
			sizeError = lineWidth / 2;
			ctx.strokeStyle = border;
		}

		ctx.fillStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.fillRect(x + sizeError, y + sizeError, blockWidth - lineWidth, blockHeight - lineWidth);

		if (!!border) {
			ctx.strokeRect(x + sizeError, y + sizeError, blockWidth - lineWidth, blockHeight - lineWidth);
		}
	};

	Block.prototype.drawCircle = function (color, border) {
		let centerX = this.col * blockWidth + blockWidth / 2;
		let centerY = this.row * blockHeight + blockHeight / 2;
		let lineWidth = 0;
		let sizeError = 0;

		if (!!border) {
			lineWidth = blockWidth / 6;
			sizeError = lineWidth / 2;
			ctx.strokeStyle = border;
		}

		ctx.fillStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.arc(centerX, centerY, blockWidth / 2 - sizeError, 0, Math.PI * 2, false);
		ctx.fill();

		if (!!border) {
			ctx.stroke();
		}
	};

	Block.prototype.equal = function (otherBlock) {
		return this.col === otherBlock.col && this.row === otherBlock.row;
	};

	let Snake = function () {
		this.segments = [
			new Block(3, 1),
			new Block(2, 1),
			new Block(1, 1)
		];
		this.direction = 'right';
		this.nextDirection = 'right';
	};

	Snake.prototype.draw = function () {
		this.segments[0].drawSquare('#1f461f', '#17a017');

		for (let i = 1; i < this.segments.length; i++) {
			this.segments[i].drawSquare('#17a017', '#1f461f');
		}
	};

	Snake.prototype.move = function () {
		let head = this.segments[0];
		let newHead;
		this.direction = this.nextDirection;

		if (this.direction === 'right') {
			newHead = new Block(head.col + 1, head.row);
		} else if (this.direction === 'down') {
			newHead = new Block(head.col, head.row + 1);
		} else if (this.direction === 'left') {
			newHead = new Block(head.col - 1, head.row);
		} else if (this.direction === 'up') {
			newHead = new Block(head.col, head.row - 1);
		}

		if (this.checkCollisition(newHead)) {
			stop = true;
			// gameOver();
			return;
		}

		this.segments.unshift(newHead);

		if (newHead.equal(apple.position)) {
			myScore++;
			apple.move();
		} else {
			this.segments.pop();
		}
	};

	Snake.prototype.checkCollisition = function (head) {
		let wallCollisition = false;
		let selfCollisition = false;

		if (head.col === 0 || head.row === 0 || head.col === blockNum - 1 || head.row === blockNum - 1) {
			wallCollisition = true;
		}

		for (let i = 0; i < this.segments.length; i++) {
			if (head.equal(this.segments[i])) {
				selfCollisition = true;
			}
		}

		return wallCollisition || selfCollisition;
	};

	Snake.prototype.setDirection = function (newDirection) {
		if (this.direction === 'up' && newDirection === 'down') {
			return;
		} else if (this.direction === 'right' && newDirection === 'left') {
			return;
		} else if (this.direction === 'down' && newDirection === 'up') {
			return;
		} else if (this.direction === 'left' && newDirection === 'right') {
			return;
		}

		this.nextDirection = newDirection;
	};

	Snake.prototype.spawn = function () {
		let head;
		let segments = [];

		this.direction = getRandomDirection();
		this.nextDirection = this.direction;

		if (this.direction === 'up') {
			head = new Block(getRandomNum(1, blockNum - 2), getRandomNum(4, blockNum - 6));
			segments[0] = head;
			segments[1] = new Block(head.col, head.row + 1);
			segments[2] = new Block(head.col, head.row + 2);

		} else if (this.direction === 'right') {
			head = new Block(getRandomNum(4, blockNum - 6), getRandomNum(1, blockNum - 2));
			segments[0] = head;
			segments[1] = new Block(head.col - 1, head.row);
			segments[2] = new Block(head.col - 2, head.row);

		} else if (this.direction === 'down') {
			head = new Block(getRandomNum(1, blockNum - 2), getRandomNum(4, blockNum - 6));
			segments[0] = head;
			segments[1] = new Block(head.col, head.row - 1);
			segments[2] = new Block(head.col, head.row - 2);

		} else if (this.direction === 'left') {
			head = new Block(getRandomNum(4, blockNum - 6), getRandomNum(1, blockNum - 2));
			segments[0] = head;
			segments[1] = new Block(head.col + 1, head.row);
			segments[2] = new Block(head.col + 2, head.row);
		}

		this.segments = segments;
	};

	let Apple = function () {
		this.position = new Block(5, 5);
	};

	Apple.prototype.draw = function () {
		this.position.drawCircle('#f00', '#bd0000');
	};

	Apple.prototype.move = function () {
		let randomCol = getRandomNum(1, blockNum - 2);
		let randomRow = getRandomNum(1, blockNum - 2);

		this.position = new Block(randomCol, randomRow);

		for (let i = 0; i < snake.segments.length; i++) {
			if (this.position.equal(snake.segments[i])) {
				this.move();
				break;
			}
		}
	};


	let snake = new Snake();
	let apple = new Apple();

	drawField();
	startMenu.style.display = 'flex';


	for (let i = 0; i < newGame.length; i++) {
		newGame[i].addEventListener('click', function() {
			startMenu.style.display = 'none';
			gameOver.style.display = 'none';

			myScore = 0;
			nextRecord = 10;
			speed = 300;
			stop = false;
			spawn = true;

			let timerId = setTimeout(function animation() {
				ctx.clearRect(0, 0, width, height);
				drawField();
				if (!!spawn) {
					snake.spawn();
					apple.move();
					spawn = false;
				}
				snake.move();
				snake.draw();
				apple.draw();
				drawScore();
				if (!stop) {
					timerId = setTimeout(animation, setSpeed());
				} else {
					callGameOver();
				}
			}, speed);
		});
	}

	window.addEventListener('keydown', function (event) {
		let newDirection = directions[event.keyCode];
		if (newDirection !== undefined) snake.setDirection(newDirection);
	});
});