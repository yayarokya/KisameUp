var Preload = function(game){};

Preload.prototype = {

	preload: function()
    {
        this.preloadPlayerAndEnemies();
        this.preloadButtons();
        this.preloadBackgroundsTiles();
        this.preloadMusicAndSounds();
    },

    preloadPlayerAndEnemies: function()
    {
        this.game.load.atlasJSONHash('kisameSprite', 'assets/sprites/kisameSpriteSheet/kisameSpriteSheet.png', 'assets/sprites/kisameSpriteSheet/kisameSpriteSheet.json');
        this.game.load.atlasJSONHash('kabutoSprite', 'assets/sprites/kabutoSpriteSheet/kabutoSpriteSheet.png', 'assets/sprites/kabutoSpriteSheet/kabutoSpriteSheet.json');
        this.game.load.atlasJSONHash('narutoSprite', 'assets/sprites/narutoSpriteSheet/narutoSpriteSheet.png', 'assets/sprites/narutoSpriteSheet/narutoSpriteSheet.json');

        this.game.load.audio('kisameAttack', 'assets/audio/kisame/kisameAttack.wav');
        this.game.load.audio('kisameAttackMagic', 'assets/audio/kisame/kisameAttackMagic.mp3');
        this.game.load.audio('kisameJump', 'assets/audio/kisame/kisameJump.wav');
        this.game.load.audio('kisameRun', 'assets/audio/kisame/kisameRun.mp3');

        this.game.load.audio('narutoRun', 'assets/audio/naruto/narutoRun.mp3');

        this.game.load.audio('kabutoRun', 'assets/audio/kabuto/kabutoRun.wav');
    },

    preloadButtons: function()
    {
        this.game.load.spritesheet('buttonNewGameSprite', 'assets/sprites/buttons/buttonNewGameSprite.png', 166, 40);
        this.game.load.spritesheet('buttonAchievementsSprite', 'assets/sprites/buttons/buttonAchievementsSprite.png', 201, 40);
        this.game.load.spritesheet('buttonBackSprite', 'assets/sprites/buttons/buttonBackSprite.png', 97, 40);
        this.game.load.spritesheet('buttonResettingAchievementsSprite', 'assets/sprites/buttons/buttonResettingAchievementsSprite.png', 267, 40);
        this.game.load.spritesheet('buttonSettingsSprite', 'assets/sprites/buttons/buttonSettingsSprite.png', 130, 40);
        this.game.load.spritesheet('buttonOnSoundSprite', 'assets/sprites/buttons/buttonOnSoundSprite.png', 74, 40);
        this.game.load.spritesheet('buttonOffSoundSprite', 'assets/sprites/buttons/buttonOffSoundSprite.png', 78, 40);


        this.game.load.audio('buttonClickSound', 'assets/audio/buttonClickSounds/menuButtonClick.wav');
        this.game.load.audio('hoverButtonSound', 'assets/audio/buttonClickSounds/hoverButtonSound.wav');
    },

    preloadBackgroundsTiles: function()
    {
        for(var i = 0; i <= 8; i++)
        {this.game.load.image('tile' + i, "assets/tiles/" + i + ".png");}

        this.game.load.image('gameMenuBack', 'assets/images/gameMenu/gameBack.png');
        this.game.load.image('gameEndFirstBack', 'assets/images/gameMenu/gameEndFirstBack.jpg');
        this.game.load.image('gameEndSecondBack', 'assets/images/gameMenu/gameEndSecondBack.jpg');

        for(var i = 0; i <= numberOfBackgroundPictures; i++)
        {this.game.load.image(i + "", "assets/images/game/" + i + ".jpg");}
    },

    preloadMusicAndSounds: function()
    {
        this.game.load.audio('gameEndMusic', 'assets/audio/gameEvents/gameEndMusic.mp3');
    },

	create: function()
    {this.game.state.start("MainMenu");}
};