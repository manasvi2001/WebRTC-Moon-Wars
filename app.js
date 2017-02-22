(function() {
	// Initialize global variables
	var canvas, ctx, w, h,
		channel_name,
		centerX, centerY, player1X, player2X, Radius,
		dirX, dirY, angle1, angle2, step, turn,
		team, currIndex1, moveIndex1, currIndex2, moveIndex2, score,
		backImg;

	channel_name = "UI5CN_bloop10";

	// Init Function
	function init() {
		canvas = document.getElementById('testCanvas');
		ctx = canvas.getContext('2d');
		w = canvas.width;
		h = canvas.height;
		centerX = w/4;
		centerY = 473;
		player1X = centerX;
		player2X = 3 * centerX;
		Radius = 25;
		dirX = 1;
		dirY = 1;
		angle1 = 0;
		angle2 = Math.PI;
		step = Math.PI/40;
		turn = 0;
		team = '';
		currIndex1 = {
			x: 0,
			y: 0
		};
		moveIndex1 = {
			x: -10,
			y: -10
		};
		currIndex2 = {
			x: 0,
			y: 0
		};
		moveIndex2 = {
			x: -10,
			y: -10
		};
		score = {
			P1: 0,
			P2: 0
		};
		window.onkeydown = keydownControl;
		addBackground();
	}

	// Reinit function
	function reinit() {
		dirX = 1;
		dirY = 1;
		moveIndex1 = {
			x: -10,
			y: -10
		};
		moveIndex2 = {
			x: -10,
			y: -10
		};
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
		ctx.drawImage(backImg,0,0,w,h);
		drawLayout();
		drawPlayer1Cannon(player1X,centerY,angle1);
		drawPlayer2Cannon(player2X,centerY,angle2);
		if(!turn && moveIndex1.x!=-10 && moveIndex1.y!=-10) {
			launchAsteroid(moveIndex1);
		}
		else if(turn && moveIndex2.x!=-10 && moveIndex2.y!=-10) {
			launchAsteroid(moveIndex2);
		}
	}

	function addBackground() {
		backImg.src = "back.jpeg";
	}

	function updateScoreP1() {
		$('#Player1Score').text(String(Number($('#Player1Score').text()) + 1));
	}

	function updateScoreP2() {
		$('#Player2Score').text(String(Number($('#Player2Score').text()) + 1));
	}

	function drawLayout() {
		ctx.strokeStyle = "black";
		ctx.lineWidth = 4;
		ctx.strokeRect(0,0,w,h);
		ctx.beginPath();
		ctx.moveTo(w/2, 500);
		ctx.lineTo(w/2, 400);
		ctx.lineWidth = 4;
		ctx.strokeStyle = "white";
		ctx.stroke();
	}

	function drawPlayer1Cannon(x,y,angle) {
		currIndex1.x = x+35*Math.cos(angle);
		currIndex1.y = y-35*Math.sin(angle);
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(currIndex1.x, currIndex1.y);
		ctx.strokeStyle = "#DA0000";
		ctx.stroke();
		drawPlayer1(x,y);
	}

	function drawPlayer2Cannon(x,y,angle) {
		currIndex2.x = x+35*Math.cos(angle);
		currIndex2.y = y-35*Math.sin(angle);
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(currIndex2.x, currIndex2.y);
		ctx.strokeStyle = "#004CB3";
		ctx.stroke();
		drawPlayer2(x,y);
	}

	function drawPlayer1(x,y) {
		ctx.beginPath();
		ctx.arc(x, y, Radius, 0, 2 * Math.PI, false);
		var grd = ctx.createRadialGradient(x+8, y-8, 2, x, y, Radius);
		grd.addColorStop(0, '#FA8072');
		grd.addColorStop(1, '#DA0000');
		ctx.fillStyle = grd;
		ctx.fill();
	}

	function drawPlayer2(x,y) {
		ctx.beginPath();
		ctx.arc(x, y, Radius, 0, 2 * Math.PI, false);
		var grd = ctx.createRadialGradient(x+8, y-8, 2, x, y, Radius);
		grd.addColorStop(0, '#8ED6FF');
		grd.addColorStop(1, '#004CB3');
		ctx.fillStyle = grd;
		ctx.fill();
	}

	// Asteroid Movement and Collision
	function detectCollision(x1,y1,r1,x2,y2,r2) {
		var dist2 = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
		if(dist2 < (r2-r1)*(r2-r1))
			return true;
		return false;
	}

	function launchAsteroid(index) {
		if(detectCollision(index.x,index.y,4,player1X,centerY,Radius)) {
			score.P2 += 1;
			updateScoreP2();
			turn = 1-turn;
			reinit();
			return;
		}
		if(detectCollision(index.x,index.y,4,player2X,centerY,Radius)) {
			score.P1 += 1;
			updateScoreP1();
			turn = 1-turn;
			reinit();
			return;
		}
		if(index.x>=498 && index.x<502 && index.y>=400 && index.y<=500)
			dirX = -dirX
		if(index.y<0)
			dirY = -dirY;
		if(index.x<0)
			dirX = -dirX;
		if(index.x>1000)
			dirX = -dirX;
		if(index.y>500) {
			turn = 1-turn;
			reinit();
			return;
		}
		if(!turn) {
			moveIndex1.x = index.x + dirX*3*Math.cos(angle1);
			moveIndex1.y = index.y - dirY*3*Math.sin(angle1);
		} else {
			moveIndex2.x = index.x + dirX*3*Math.cos(angle2);
			moveIndex2.y = index.y - dirY*3*Math.sin(angle2);
		}
		ctx.beginPath();
		if(!turn) {
			ctx.arc(moveIndex1.x, moveIndex1.y, 4, 0, 2 * Math.PI, false);
		} else {
			ctx.arc(moveIndex2.x, moveIndex2.y, 4, 0, 2 * Math.PI, false);
		}
		ctx.fillStyle = "yellow";
		ctx.fill();
		setTimeout(function() {
			addBackground();
		}, 4);
	}

	// Pubnub Subscribe
	var pubnub = new PubNub({
	    subscribeKey: "sub-c-10108ee6-f5b4-11e6-861a-0619f8945a4f",
	    publishKey: "pub-c-4d3e61ad-3000-403d-846f-34e065573c82"
	});

	pubnub.subscribe({
		channels: [channel_name] // our channel name
	});

	pubnub.addListener({
		message: function (message) {
		    console.log(message.message);
		    var mess = message.message;
		    turn = mess.player;
		    score = mess.score;
		    if(turn) {
		    	angle2 = mess.angle;
		    	player2X = mess.centerX;
		    	currIndex2 = mess.currIndex;
		    } else {
		    	angle1 = mess.angle;
		    	player1X = mess.centerX;
		    	currIndex1 = mess.currIndex;
		    }
		    launchAsteroid(mess.currIndex);
		}
	});

	pubnub.hereNow({
	    channels: [channel_name],
	    includeUUIDs: false
	}, function (status, response) {
	    // handle status, response
	    console.log(response);
	    if(response.totalOccupancy == 0) {
			team = 'blue';
			$('#PlayerTeam').text('You are BLUE');
			$('#WhoseTurn').text('RED\'s Turn');
			$('#Controls').css("color", "#004CB3");
		} else if(response.totalOccupancy == 1) {
			team = 'red';
			$('#PlayerTeam').text('You are RED');
			$('#WhoseTurn').text('RED\'s Turn');
			$('#Controls').css("color", "#DA0000");
		} else {
			team = 'none';
		}
	});

	// Keyboard Control and Pubnub Publish
	function keydownControl(e) {
		e.stopImmediatePropagation();
		if((turn && team=="red") || (!turn && team=="blue") || team == "none") {
			return;
		}

		if(e.which == 37) {
			if(!turn) {
				if(player1X-40 > 0) {
					player1X = player1X - 2;
				}
			} else {
				if(player2X-40 > 502) {
					player2X = player2X - 2;
				}
			}
			console.log("player1X :: " + player1X + " player2X :: " + player2X);
	        addBackground();
	    } else if(e.which == 39) {
	    	console.log(turn);
	    	if(!turn) {
				if(player1X+40 < 498) {
					player1X = player1X + 2;
				}
			} else {
				if(player2X+40 < 999) {
					player2X = player2X + 2;
				}
			}
			console.log("player1X :: " + player1X + " player2X :: " + player2X);
	        addBackground();
	    } else if(e.which == 38) {
	    	if(!turn) {
				if(angle1+step<Math.PI) {
					angle1 = angle1 + step;
				} else {
					angle1 = Math.PI;
				}
			} else {
				if(angle2+step<Math.PI) {
					angle2 = angle2 + step;
				} else {
					angle2 = Math.PI;
				}
			}
			console.log("player1X :: " + player1X + " player2X :: " + player2X);
	        addBackground();
	    } else if(e.which == 40) {
	    	if(!turn) {
				if(angle1-step>0) {
					angle1 = angle1 - step;
				} else {
					angle1 = 0;
				}
			} else {
				if(angle2-step>0) {
					angle2 = angle2 - step;
				} else {
					angle2 = 0;
				}
			}
			console.log("player1X :: " + player1X + " player2X :: " + player2X);
	        addBackground();
	    } else if(e.which == 32) {
	    	pubnub.publish({
				channel: channel_name,
				message: {
					player: turn,
					centerX: turn?player2X:player1X,
					centerY: centerY,
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

	// Start Game
	init();
}());