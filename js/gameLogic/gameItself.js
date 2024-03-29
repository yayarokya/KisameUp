var GameItself = function(game){

};

var velocityOfTileMoving = 15,
    speedOfPlayerMovingRightLeft = 150,
    facing = 'left',
    sizeOfPlayer = 0.5,
    me,
    spaceBar,
    jumpTimer = 0,
    background,
    enemySpeed = 50,
    lastNumberOfPicture = numberOfBackgroundPictures,
    kisameAttackAud, kisameAttackMagicAud, kisameJumpAud, kisameRunAud,
    maxNumberOfEnemies = 2,
    previousHole,
    platformsWereJustAdded = false;

GameItself.prototype = {

	create: function()
    {
		resetAllGlobalVariables();

		me = this;

		me.gameIsRunning = true;

        spaceBar = me.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		//The spacing for the initial platforms
		me.spacing = 200;

		//Set the initial score
		me.score = 0;

		var tileStyle = getRandomTileStyle();

		//Get the dimensions of the tile we are using
		me.tileWidth = me.game.cache.getImage(tileStyle).width;
		me.tileHeight = me.game.cache.getImage(tileStyle).height;

        background = me.game.add.tileSprite(0, 0, me.game.width, me.game.height, getRandomInt(0, lastNumberOfPicture));

		//Enable the Arcade physics system
		me.game.physics.startSystem(Phaser.Physics.ARCADE);

		//Add a platforms group to hold all of our tiles, and create a bunch of them
		me.platforms = me.game.add.group();
		me.platforms.enableBody = true;
		me.platforms.createMultiple(100, tileStyle);

        me.enemies = me.game.add.group();
        me.enemies.enableBody = true;

		//Add the player to the screen
		me.createPlayer();
		//Create the inital on screen platforms
		me.initPlatforms();


		//Create the score label
		me.createScore();

        game.time.events.loop(Phaser.Timer.SECOND * 40, me.changePicture, me);

        game.time.events.loop(Phaser.Timer.SECOND * 20, me.incrementLevelDifficulty, me);

	    //Enable cursor keys so we can create some controls
	    me.cursors = me.game.input.keyboard.createCursorKeys();


	    addAudio();

        me.game.input.keyboard.onDownCallback = somethingWasPressed;
	},

    incrementLevelDifficulty: function()
    {
        maxNumberOfEnemies+=1;
        velocityOfTileMoving *= 1.4;

        this.speedUpAllExistingPlatforms(me.platforms.children);
    },

    speedUpAllExistingPlatforms: function(tiles)
    {
        tiles.forEach(function(tile)
        {
            tile.body.velocity.y = velocityOfTileMoving;
        });

    },

    changePicture: function()
    {
        var numberOfThePicture = getRandomInt(0, lastNumberOfPicture);
        background.loadTexture(numberOfThePicture + "");
    },

	update: function()
    {
        background.tilePosition.y += 1;

		me.game.physics.arcade.collide(me.player, me.platforms);
        me.game.physics.arcade.collide(me.enemies, me.platforms);
        me.game.physics.arcade.collide(me.enemies, me.player);

        if(touchesTheBottom(me.playerForAnimation))
        {me.gameOver();}

        if(me.cursors.left.isDown)
        {animateRunLeft();}
        else if(me.cursors.right.isDown)
        {animateRunRight();}
        else if(!animating())
        {beIdle();}

        if(jumpHasToOccur())
        {animateJump();}

        me.enemies.children.forEach(function(enemy)
        {
            playerAttacksBottomIsTouching(enemy);
            if(enemy.notFight && !enemy.jumping && !enemy.idle)
            {enemyLogic(enemy);}
        });
	},

	gameOver: function()
    {
        me.game.input.keyboard.onDownCallback = null;
        stopAllSounds();
        saveRecord();
        this.game.state.start('GameOver');
	},

	addTile: function(x, y)
    {
		//Get a tile that is not currently on screen
	    var tile = me.platforms.getFirstDead();

	    //Reset it to the specified coordinates
	    tile.reset(x, y);
	    tile.body.velocity.y = velocityOfTileMoving;
	    tile.body.immovable = true;

	    //When the tile leaves the screen, kill it
	    tile.checkWorldBounds = true;
	    tile.outOfBoundsKill = true;

	    tile.events.onOutOfBounds.add(this.addPlatformsAfterSomeTime, this);
	},

    addPlatformsAfterSomeTime: function()
    {
        if(platformsWereJustAdded)
        {return;}

        platformsWereJustAdded = true;
        me.addPlatform();
        setTimeout(function(){platformsWereJustAdded = false;}, 400);
    },

	addPlatform: function(y)
    {
		//If no y position is supplied, render it just outside of the screen
		if(typeof(y) == "undefined")
		{
			y = -me.tileHeight;
			//Increase the players score
			me.incrementScore();
		}

		//Work out how many tiles we need to fit across the whole screen
		var tilesNeeded = Math.ceil(me.game.world.width / me.tileWidth);

		//Add a hole randomly somewhere
        var hole;
        if(previousHole)
        {
            hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;
	        while(hole == previousHole)
            {hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;}
        }
        else
        {
            hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;
        }
        previousHole = hole;

	    //Keep creating tiles next to each other until we have an entire row
	    //Don't add tiles where the random hole is
	    for(var i = 0; i < tilesNeeded; i++)
	    {
	        if(i != hole)
	        {
	            this.addTile(i * me.tileWidth, y);
	        }
	    }

	    var numberOfEnemies = getRandomInt(1, maxNumberOfEnemies);
	    for(var i = 0; i < numberOfEnemies; i++)
        {
            var enemy = me.enemies.create(getRandomInt(5, parseInt(me.game.world.width - 10, 10)), y, getRandomEnemy(), 'stance/0.png');
            configureEnemy(enemy);
        }
	},

	initPlatforms: function()
    {

        var bottom = me.game.world.height - me.tileHeight,
        top = me.tileHeight;

		//Keep creating platforms until they reach (near) the top of the screen
		for(var y = bottom; y > top - me.tileHeight; y = y - me.spacing)
		{me.addPlatform(y);}
	},

	createPlayer: function()
    {
        me.player = me.game.add.physicsGroup(Phaser.Physics.ARCADE);
        me.player.enableBody = true;
        me.playerForAnimation = me.game.make.sprite(0, 0, 'kisameSprite', 'stance/0.png');
        me.player.addChild(me.playerForAnimation);
        me.playerForAnimation.scale.setTo(sizeOfPlayer);
        me.playerForAnimation.activeAttack = false;

        me.game.physics.arcade.enable(me.player);
		me.playerForAnimation.body.gravity.y = 2000;
		me.playerForAnimation.body.collideWorldBounds = true;
		me.playerForAnimation.body.bounce.y = 0.1;

        me.playerForAnimation.animations.add('attackMagic', Phaser.Animation.generateFrameNames('attackMagic/', 0, 24, '.png', 1), 7, false, true);
        me.playerForAnimation.animations.add('attack', Phaser.Animation.generateFrameNames('attack/', 0, 5, '.png', 1), 10, false, true);
        me.playerForAnimation.animations.add('run', Phaser.Animation.generateFrameNames('run/', 0, 4, '.png', 1), 10, true, true);
        me.playerForAnimation.animations.add('idle', Phaser.Animation.generateFrameNames('stance/', 0, 3, '.png', 1), 10, true, true);
        me.playerForAnimation.animations.add('jump', Phaser.Animation.generateFrameNames('jump/', 0, 3, '.png', 1), 10, false, true);

	},

	createScore: function(){


		var scoreFont = "100px Arial";

		me.scoreLabel = me.game.add.text((me.game.world.centerX), 100, "0", {font: scoreFont, fill: "#5bc0de"});
		me.scoreLabel.anchor.setTo(0.5, 0.5);
		me.scoreLabel.align = 'center';

	},

	incrementScore: function()
    {
		me.score += 1;
		me.scoreLabel.text = me.score;
	},
};

function animateRunRight()
{

    playRunSound();

    me.playerForAnimation.body.velocity.x = speedOfPlayerMovingRightLeft;

    if(facing != 'right')
    {
        me.playerForAnimation.scale.setTo(sizeOfPlayer, sizeOfPlayer);

        me.playerForAnimation.animations.play('run');
        facing = 'right';
    }
}

function playRunSound()
{
    if(!kisameRunAud.isPlaying)
    {
        stopAllSounds();
        kisameRunAud.restart();
    }
}

function animateRunLeft()
{
    playRunSound();

    me.playerForAnimation.body.velocity.x = -speedOfPlayerMovingRightLeft;

    if(facing != 'left')
    {
        me.playerForAnimation.scale.setTo(-sizeOfPlayer, sizeOfPlayer);

        me.playerForAnimation.animations.play('run');

        facing = 'left';
    }
}

function beIdle()
{
    me.playerForAnimation.body.velocity.x = 0;

    me.playerForAnimation.animations.play('idle');

    facing = 'idle';
}

function jumpHasToOccur()
{
    var jumButtonClicked = me.cursors.up.isDown || spaceBar.isDown;
    var alreadyOnFloor = me.playerForAnimation.body.touching.down  && me.game.time.now > jumpTimer;
    return jumButtonClicked && alreadyOnFloor;
}

function somethingWasPressed(keyCode)
{
    if(keyEqualTo(keyCode, "a") || keyEqualTo(keyCode, "ф") || keyEqualTo(keyCode, "A") || keyEqualTo(keyCode, "Ф"))
    {animateAttack();}

    if(keyEqualTo(keyCode, "m") || keyEqualTo(keyCode, "ь") || keyEqualTo(keyCode, "M") || keyEqualTo(keyCode, "Ь"))
    {animateAttackMagic();}
}

function keyEqualTo(keyCode, key)
{
    var equalKey = (keyCode.key == key);
    return equalKey;
}

function animateAttack()
{
    if(!kisameAttackAud.isPlaying)
    {
        stopAllSounds();
        kisameAttackAud.restart();
    }
    me.playerForAnimation.animations.play('attack', 10, false, false);
    me.playerForAnimation.animations.currentAnim.onComplete.add(beIdle,this);
    facing = "attack";
}

function animateAttackMagic()
{
    if(!kisameAttackMagicAud.isPlaying)
    {
        stopAllSounds();
        kisameAttackMagicAud.restart();
    }
    me.playerForAnimation.animations.play('attackMagic', 3, false, false);
    me.playerForAnimation.animations.currentAnim.onComplete.add(beIdle,this);
    facing = "attackMagic";
}

function animating()
{
    var animating = (facing == "attack")||(facing == "attackMagic") || (facing == "jump");
    return animating;
}

function animateJump()
{

    if(!kisameJumpAud.isPlaying)
    {
        stopAllSounds();
        kisameJumpAud.restart();
    }

    me.playerForAnimation.body.velocity.y = -1150;

    me.playerForAnimation.animations.play('jump', 1, false, false);

    facing = "jump";

    me.game.time.events.add(Phaser.Timer.SECOND * 1.450, function()
    {
        // me.playerForAnimation.animations.play('idle');
        facing = "idle";
    }, this);

    jumpTimer = me.game.time.now + 750;
}


function getRandomInt(min, max)
{return Math.floor(Math.random() * (max - min + 1)) + min;}

function getRandomEnemy()
{
    var number = getRandomInt(1, 10);
    if(number > 5)
    {return "kabutoSprite";}
    else(number > 5)
    {return "narutoSprite";}
}

function configureEnemy(enemy)
{
    enemy.enableBody = true;
    enemy.notFight = true;
    enemy.jumping = false;
    enemy.idle = false;

    enemy.body.collideWorldBounds = true;

    enemy.body.gravity.y = 2000;
    enemy.body.bounce.y = 0.1;

    enemy.animations.add('attackMagic', Phaser.Animation.generateFrameNames('attackMagic/', 0, 24, '.png', 1), 7, false, true);
    enemy.animations.add('attack', Phaser.Animation.generateFrameNames('attack/', 0, 5, '.png', 1), 10, false, true);
    enemy.animations.add('run', Phaser.Animation.generateFrameNames('run/', 0, 4, '.png', 1), 10, true, true);
    enemy.animations.add('idle', Phaser.Animation.generateFrameNames('stance/', 0, 3, '.png', 1), 10, true, true);
    enemy.animations.add('jump', Phaser.Animation.generateFrameNames('jump/', 0, 3, '.png', 1), 10, false, true);

    enemy.outOfBoundsKill = true;

    populateWithSound(enemy);

    enemyLogic(enemy);
}

function populateWithSound(enemy)
{
    if(itIs("narutoSprite", enemy))
    {
        enemy.runAud = me.game.add.audio('narutoRun');
    }
    else
    {
        enemy.runAud = me.game.add.audio('kabutoRun');
    }
}

function getRandomAttack()
{
    if(getRandomInt(0, 1) == 0)
    {return "attack";}
    else
    {return "attackMagic";}
}


function itIs(name, sprite)
{
    return sprite.key == name;
}

function enemyLogic(enemy)
{
    var difBetweenEnemyAndPlayerHorizontal = enemy.x - me.playerForAnimation.x;
    if(Math.abs(difBetweenEnemyAndPlayerHorizontal) > 5)
    {
        if(difBetweenEnemyAndPlayerHorizontal < 0)
        {runRightUntilMeetPlayer(enemy);}
        else if(difBetweenEnemyAndPlayerHorizontal > 0)
        {runLeftUntilMeetPlayer(enemy);}
    }
    else
    {
        var difBetweenEnemyAndPlayerVertical = enemy.y - me.playerForAnimation.y;
        if(difBetweenEnemyAndPlayerVertical > 0)
        {jumpEnemy(enemy);}
        else
        {beIdleEnemy(enemy);}
    }
}

function jumpEnemy(enemy)
{
    enemy.jumping = true;
    enemy.scale.setTo(-1, 1);
    enemy.body.velocity.x = -enemySpeed;
    enemy.body.velocity.y = -1000;
    enemy.animations.play('jump', 10, false, false);

    me.game.time.events.add(Phaser.Timer.SECOND * 2, function(){enemy.body.velocity.y = 0; enemy.animations.play('idle');}, this);
    me.game.time.events.add(Phaser.Timer.SECOND * 5, function(){enemy.jumping = false;}, this);
}

function runRightUntilMeetPlayer(enemy)
{
    playRunSoundEnemy(enemy);
    enemy.scale.setTo(1, 1);
    enemy.body.velocity.x = enemySpeed;
    enemy.animations.play('run', 10, false, false);
}

function runLeftUntilMeetPlayer(enemy)
{
    playRunSoundEnemy(enemy);
    enemy.scale.setTo(-1, 1);
    enemy.body.velocity.x = -enemySpeed;
    enemy.animations.play('run', 10, false, false);
}

function playRunSoundEnemy(enemy)
{
    if(!enemy.runAud.isPlaying)
    {
        stopAllSoundsEnemy(enemy);
        enemy.runAud.restart();
    }
}

function runRight(enemy)
{
    playRunEnemy(enemy);

    enemy.scale.setTo(1, 1);
    enemy.body.velocity.x = enemySpeed;
    enemy.animations.play('run');
    me.game.time.events.add(Phaser.Timer.SECOND * 5, function(){if(!enemy.fighting)beIdleEnemy(enemy);}, this);
}

function  playRunEnemy(enemy)
{
    if(!enemy.runAud.isPlaying)
    {
        stopAllSoundsEnemy(enemy);
        enemy.runAud.restart();
    }
}

function stopAllSoundsEnemy(enemy)
{
    enemy.runAud.pause();
}

function beIdleEnemy(enemy)
{
    enemy.idle = true;
    enemy.body.velocity.x = 0;
    enemy.animations.play("idle", 5, false, false);
    enemy.animations.currentAnim.onComplete.add(function()
    {
        enemy.idle = false;
    },this);
}

function runLeft(enemy)
{
    playRunEnemy(enemy);
    enemy.scale.setTo(-1, 1);
    enemy.body.velocity.x = -enemySpeed;
    enemy.animations.play('run');
    me.game.time.events.add(Phaser.Timer.SECOND * 5, function(){if(!enemy.fighting)jumpLeft(enemy);}, this);
}

function jumpLeft(enemy)
{
    enemy.scale.setTo(-1, 1);
    enemy.body.velocity.x = -enemySpeed;
    enemy.body.velocity.y = -1000;
    enemy.animations.play('jump');
    me.game.time.events.add(Phaser.Timer.SECOND * 2, function(){enemy.body.velocity.y = 0; enemy.animations.play('idle');}, this);
    me.game.time.events.add(Phaser.Timer.SECOND * 5, function(){if(!enemy.fighting)jumpRight(enemy);}, this);
}

function jumpRight(enemy)
{
    enemy.scale.setTo(1, 1);
    enemy.body.velocity.x = enemySpeed;
    enemy.body.velocity.y = -1000;
    enemy.animations.play('jump');
    me.game.time.events.add(Phaser.Timer.SECOND * 2, function(){enemy.body.velocity.y = 0; enemy.animations.play('idle');}, this);
    me.game.time.events.add(Phaser.Timer.SECOND * 5, function(){if(!enemy.fighting)runRight(enemy);}, this);
}

function getRandomTileStyle()
{
    var number = getRandomInt(0, 8);
    return "tile" + number;
}

function playerAttacksBottomIsTouching(enemy)
{
    if(touchesTheBottom(enemy))
    {
        deleteEnemy(enemy);
        return;
    }

    if(enemy.overlap(me.playerForAnimation))
    {
        if(facing == "attack" || facing == "attackMagic")
        {
                deleteEnemy(enemy);
                me.incrementScore();
        }
        else if(enemy.notFight)
        {
            enemy.notFight = false;
            enemy.animations.play(getRandomAttack());
            enemy.animations.currentAnim.onComplete.add(function()
            {
                enemy.notFight = true;
                if(enemy.overlap(me.playerForAnimation))
                {me.gameOver();}
            },this);
        }
    }
}

function deleteEnemy(enemy)
{
    enemy.kill();
    me.enemies.remove(enemy);
}

function touchesTheBottom(who)
{
    return who.body.position.y >= me.game.world.height - who.body.height;
}


function addAudio()
{
    kisameAttackAud = me.game.add.audio('kisameAttack');
    kisameAttackMagicAud = me.game.add.audio('kisameAttackMagic');
    kisameJumpAud = me.game.add.audio('kisameJump');
    kisameRunAud = me.game.add.audio('kisameRun');
}

function stopAllSounds()
{
    kisameAttackAud.pause();
    kisameAttackMagicAud.pause();
    kisameJumpAud.pause();
    kisameRunAud.pause();
}

function saveRecord()
{
   var key = "kisameUpAchievements",
   arrOfAchievements = basil.get(key);
   if(!arrOfAchievements)
   {arrOfAchievements = [];}

   arrOfAchievements.push(me.score);

    function sortNumber(a,b)
    {return a - b;}

   arrOfAchievements.sort(sortNumber);

   if(arrOfAchievements.lenght > 10)
   {arrOfAchievements.shift();}

   basil.set(key, arrOfAchievements);
};

function resetAllGlobalVariables()
{
        velocityOfTileMoving = 15,
        speedOfPlayerMovingRightLeft = 150,
        facing = 'left',
        jumpTimer = 0,
        maxNumberOfEnemies = 2,
        previousHole = null;
        platformsWereJustAdded = false;
}


















