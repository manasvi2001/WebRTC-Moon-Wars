(function() {
	// global variables
	var canvas, ctx, w, h,
		channel_name, pubnub,
		player1X, player2X, centerY, radius, asteroidRadius,
		dirX, dirY, angle1, angle2, angleStep, moveStep,
		turn, team, currIndex1, moveIndex1, currIndex2, moveIndex2, score,
		backImg;

	// init channel name
	channel_name = "MyGame-765";

	// init function
	function init() {
		canvas = document.getElementById('testCanvas');
		ctx = canvas.getContext('2d');
		w = canvas.width;
		h = canvas.height;

		player1X = w/4;
		player2X = 3*(w/4);
		centerY = h-27;
		radius = 25;
		asteroidRadius = 4;

		dirX = 1;
		dirY = -1;
		angle1 = 0;
		angle2 = Math.PI;
		angleStep = Math.PI/40;
		moveStep = 2;

		turn = 0 ;
		team = 'none';
		currIndex1 = {x: 0, y: 0};
		moveIndex1 = {x: -10, y: -10};
		currIndex2 = {x: 0, y: 0};
		moveIndex2 = {x: -10, y: -10};
		score= {P1: 0, P2: 0};

		window.onkeydown = keyEvent;

		addBackground();
	}

	// reinit function
	function reinit() {
		dirX = 1;
		dirY = -1;
		moveIndex1 = {x: -10, y: -10};
		moveIndex2 = {x: -10, y: -10};
		if(turn) {
			$('#WhoseTurn').text('BLUE\'s Turn');
		} else {
			$('#WhoseTurn').text('RED\'s Turn');
		}
		return;
	}

	// Draw Board and Refresh
	backImg = new Image();

	backImg.onload = function() {
		ctx.drawImage(backImg, 0, 0, w, h);
		drawLayout();
		drawPlayer1(player1X, centerY, angle1);
		drawPlayer2(player2X, centerY, angle2);
		if(!turn && moveIndex1.x!=-10 && moveIndex1.y!=-10) {
			launchAsteroid(moveIndex1);
		} else if (turn && moveIndex2.x!=-10 && moveIndex2.y!=-10) {
			launchAsteroid(moveIndex2);
		}
	}

	function addBackground() {
		backImg.src = "back.jpeg";
	}

	// Update score
	function updateScoreP1() {
		$('#Player1Score').text(Number($('#Player1Score').text()) + 1);
	}

	function updateScoreP2() {
		$('#Player2Score').text(Number($('#Player2Score').text()) + 1);
	}

	// Draw layout, player 1 & player 2
	function drawLayout() {
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.strokeRect(0, 0, w, h);
		ctx.strokeStyle = "white";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(w/2, h);
		ctx.lineTo(w/2, h-100);
		ctx.stroke();
	}

	function drawPlayer1(x, y, angle) {
		currIndex1.x = x + 35*Math.cos(angle);
		currIndex1.y = y - 35*Math.sin(angle);
		ctx.strokeStyle = "#DA0000";
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(currIndex1.x,currIndex1.y);
		ctx.stroke();
		var grd = ctx.createRadialGradient(x+8, y-8, 2, x, y, radius);
		grd.addColorStop(0, '#FA8072');
		grd.addColorStop(1, '#DA0000');
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2*Math.PI, false);
		ctx.fillStyle = grd;
		ctx.fill();
	}

	function drawPlayer2(x, y, angle) {
		currIndex2.x = x + 35*Math.cos(angle);
		currIndex2.y = y - 35*Math.sin(angle);
		ctx.strokeStyle = "#004CB3";
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(currIndex2.x,currIndex2.y);
		ctx.stroke();
		var grd = ctx.createRadialGradient(x+8, y-8, 2, x, y, radius);
		grd.addColorStop(0, '#8ED6FF');
		grd.addColorStop(1, '#004CB3');
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2*Math.PI, false);
		ctx.fillStyle = grd;
		ctx.fill();
	}

	// Keyboard Event
	function keyEvent(e) {
		e.stopImmediatePropagation();
		if((!turn && team=="blue") || (turn && team=="red") || (team=="none")) {
			return;
		}
		var keyCode =  e.which;
		if(keyCode == 37) { // Left
			if(!turn) {
				if(player1X-40 > 0) {
					player1X = player1X - moveStep;
				}
			} else {
				if(player2X-40 > 502) {
					player2X = player2X - moveStep;
				}
			}
			addBackground();
		} else if(keyCode == 39) { // Right
			if(!turn) {
				if(player1X+40 < 498) {
					player1X = player1X + moveStep;
				}
			} else {
				if(player2X+40 < 999) {
					player2X = player2X + moveStep;
				}
			}
			addBackground();
		} else if(keyCode == 38) { // Anticlockwise
			if(!turn) {
				if(angle1+angleStep<Math.PI) {
					angle1 = angle1 + angleStep;
				} else {
					angle1 = Math.PI;
				}
			} else {
				if(angle2+angleStep<Math.PI) {
					angle2 = angle2 + angleStep;
				} else {
					angle2 = Math.PI;
				}
			}
			addBackground();
		} else if(keyCode == 40) { // Clockwise
			if(!turn) {
				if(angle1-angleStep>=0) {
					angle1 = angle1 - angleStep;
				} else {
					angle1 = 0;
				}
			} else {
				if(angle2-angleStep>=0) {
					angle2 = angle2 - angleStep;
				} else {
					angle2 = 0;
				}
			}
			addBackground();
		} else if(keyCode == 32) {
			// pubnub publishing.
			pubnub.publish({
				channel: channel_name,
				message: {
					turn: turn,
					centerX: turn?player2X:player1X,
					angle: turn?angle2:angle1,
					currIndex: turn?currIndex2:currIndex1,
					score: score
				}
			}, function (status, response) {
		        if (status.error) {
		            console.log(status)
		        } else {
		            console.log("message Published w/ timetoken", response.timetoken)
		        }
		    });
		}
	}

	// PubNub subscribing
	pubnub = new PubNub({
		subscribeKey: "sub-c-10108ee6-f5b4-11e6-861a-0619f8945a4f",
	    publishKey: "pub-c-4d3e61ad-3000-403d-846f-34e065573c82"
	});

	pubnub.subscribe({
		channels: [channel_name]
	});

	pubnub.addListener({
		message: function(message) {
			console.log(message);
			var message = message.message;
			turn = message.turn;
			score = message.score;
			if(turn) {
				player2X = message.centerX;
				angle2 = message.angle;
				currIndex2 = message.currIndex;
			} else {
				player1X = message.centerX;
				angle1 = message.angle;
				currIndex1 = message.currIndex;
			}
			launchAsteroid(message.currIndex);
		}
	})

	pubnub.hereNow({
		channels: [channel_name],
		includeUUIDs: false
	}, function(status, response) {
		console.log(response);
		if(response.totalOccupancy == 0) {
			team = "red";
			$('#PlayerTeam').text('You are RED');
			$('#WhoseTurn').text('RED\'s Turn');
			$('#Controls').css("color", "#DA0000");
		} else if(response.totalOccupancy == 1) {
			team = "blue";
			$('#PlayerTeam').text('You are BLUE');
			$('#WhoseTurn').text('RED\'s Turn');
			$('#Controls').css("color", "#004CB3");
		} else {
			team = "none";
		}
	})

	// Move Asteroid and collision detection
	function detectCollision(x1,y1,r1,x2,y2,r2) {
		var dist2 = ((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
		if(dist2 <= ((r2+r1)*(r2+r1)))
			return true;
		return false;
	}
	function launchAsteroid(index) {
		console.log(index);
		// Collision Detection asteroid and player
		if(detectCollision(index.x, index.y, asteroidRadius, player1X, centerY, radius)) {
			score.P2 += 1;
			updateScoreP2();
			turn = 1 - turn;
			reinit();
			return;
		} else if(detectCollision(index.x, index.y, asteroidRadius, player2X, centerY, radius)) {
			score.P1 += 1;
			updateScoreP1();
			turn = 1 - turn;
			reinit();
			return;
		}
		// Collision Detection asteroid and boundary
		if(index.x>=(w/2)-2 && index.x<=(w/2)+2 && index.y>=h-100 && index.y<=h) {
			dirX = -dirX;
		} else if(index.x<0) {
			dirX = -dirX;
		} else if(index.x>w-1) {
			dirX = -dirX;
		} else if(index.y<0) {
			dirY = -dirY;
		} else if(index.y>h-1) {
			turn = 1 - turn;
			reinit();
			return;
		}

		if(!turn) {
			moveIndex1.x = index.x + dirX*Math.cos(angle1);
			moveIndex1.y = index.y + dirY*Math.sin(angle1);
		} else {
			moveIndex2.x = index.x + dirX*Math.cos(angle2);
			moveIndex2.y = index.y + dirY*Math.sin(angle2);
		}
		ctx.beginPath();
		if(!turn) {
			ctx.arc(moveIndex1.x, moveIndex1.y, asteroidRadius, 0, 2*Math.PI, false);
		} else {
			ctx.arc(moveIndex2.x, moveIndex2.y, asteroidRadius, 0, 2*Math.PI, false);
		}
		ctx.fillStyle = "yellow";
		ctx.fill();

		setTimeout(function() {
			addBackground();
		}, 4);
	}

	// call init
	init();
}());