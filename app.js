var canvas = document.getElementById('testCanvas');
var ctx = canvas.getContext('2d');
window.onkeydown = keydownControl;
var w = canvas.width;
var h = canvas.height;
var centerX = w/4;
var centerY = 473;
var dirX = 1;
var dirY = 1;
var angle1 = 0;
var angle2 = Math.PI;
var step = Math.PI/40;
var lockMovement = false;
var beginGame = false;
var currIndex1 = {
	x: 0,
	y: 0
};
var moveIndex1 = {
	x: 0,
	y: 0
}
var currIndex2 = {
	x: 0,
	y: 0
};
var player1X = centerX;
var player2X = 3 * centerX;
var Radius = 25;
var backImg = new Image();
backImg.onload = function() {
	ctx.drawImage(backImg,0,0,w,h);
	drawLayout();
	drawPlayer1Cannon(player1X,centerY,angle1);
	drawPlayer2Cannon(player2X,centerY,angle2);
	if(lockMovement) {
		launchAsteroid(moveIndex1);
	}
}

function addBackground() {
	backImg.src = "back.jpeg";
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
	ctx.beginPath();
	ctx.moveTo(x,y);
	ctx.lineTo(x+35*Math.cos(angle),y-35*Math.sin(angle));
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

function detectCollision(x1,y1,r1,x2,y2,r2) {
	var dist2 = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);
	if(dist2 < (r2-r1)*(r2-r1))
		return true;
	return false;
}

function launchAsteroid(index) {
	if(detectCollision(index.x,index.y,4,player1X,centerY,Radius)) {
		alert("Lost the game!!");
		lockMovement = false;
		dirX = 1;
		dirY = 1;
		return;
	}
	if(detectCollision(index.x,index.y,4,player2X,centerY,Radius)) {
		alert("Won the game!!");
		lockMovement = false;
		dirX = 1;
		dirY = 1;
		return;
	}
	if(index.x>=498 && index.x<502 && index.y>=400 && index.y<=500)
		dirX=-dirX
	if(index.y<0)
		dirY = -dirY;
	if(index.x<0)
		dirX = -dirX;
	if(index.x>1000)
		dirX = -dirX;
	if(index.y>500) {
		lockMovement = false;
		dirX = 1;
		dirY = 1;
		return;
	}
	moveIndex1.x = index.x + dirX*3*Math.cos(angle1);
	moveIndex1.y = index.y - dirY*3*Math.sin(angle1);
	ctx.beginPath();
	ctx.arc(moveIndex1.x, moveIndex1.y, 4, 0, 2 * Math.PI, false);
	ctx.fillStyle = "yellow";
	ctx.fill();
	setTimeout(function() {
		addBackground();
	}, 4);
}

function keydownControl(e) {
	if(lockMovement || !beginGame) {
		return;
	}
	if(e.keyCode == 37) {
		if(player1X-40 > 0)
			player1X = player1X - 2;
        addBackground();
    }
    else if(e.keyCode == 39) {
    	if(player1X+40 < 498)
			player1X = player1X + 2;
        addBackground();
    }
    if(e.keyCode == 38) {
		if(angle1+step<Math.PI)
			angle1 = angle1 + step;
		else
			angle1 = Math.PI;
        addBackground();
    }
    else if(e.keyCode == 40) {
    	if(angle1-step>0)
			angle1 = angle1 - step;
		else
			angle1 = 0;
        addBackground();
    }
    if(e.keyCode == 32) {
    	lockMovement = true;
    	launchAsteroid(currIndex1);
    }
}
addBackground();

var pubnub = new PubNub({
    subscribeKey: "sub-c-10108ee6-f5b4-11e6-861a-0619f8945a4f",
    publishKey: "pub-c-4d3e61ad-3000-403d-846f-34e065573c82"
})

var new_channel = $('#input-button1');

new_channel.click(function() {
	var channel_name = 'UI5CN-' + $('#input-username').val();
	pubnub.publish({
		channel: channel_name,
		message: "Hey There"
	});
	$('#input-username').val('');
});