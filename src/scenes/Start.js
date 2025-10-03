export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        //this.load.image('phiast', 'assets/space.png');
        //this.load.image('logo', 'assets/phaser.png');
        this.load.atlas('grassTiles', 'assets/tilesets/grassTiles.png', 'assets/tilesets/grassTiles.json');
        this.load.tilemapCSV('levelDebug', 'assets/tilemaps/levelDebug.csv');
        this.load.spritesheet('phiast', 'assets/anPhiast.png', { frameWidth: 48, frameHeight: 64 });
    }

    create() {
        //this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        //const logo = this.add.image(640, 200, 'logo');
        const mapDebug = this.add.tilemap('levelDebug',16,16);
        const tilesDebug = mapDebug.addTilesetImage('grassTiles');
        this.map = mapDebug.createLayer(0, tilesDebug, 0, 180);
        const anPhiast = this.add.sprite(320, 120, 'phiast');

        //ship.anims.create({
            //key: 'fly',
            //frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            //frameRate: 15,
            //repeat: -1
        //});

        //ship.play('fly');

        this.tweens.add({
            targets: anPhiast,
            y: 240,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });
    }

    update() {
        //this.background.tilePositionX += 2;
    }
    
}
