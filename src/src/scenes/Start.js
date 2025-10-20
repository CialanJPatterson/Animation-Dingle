export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    layer;
    shapeGraphics;
    debugGraphics;
    controls;

    preload() {
        this.FPS = 60;
        this.MS_TO_FPS = this.FPS * .001;
        
        this.load.tilemapTiledJSON('levelDebug', 'assets/tilemaps/levelDebug.json');
        this.load.tilemapTiledJSON('levelTutorial', 'assets/tilemaps/levelTutorial.json');
        this.load.image('grassTiles', 'assets/tilesets/grassTiles.png');
        this.load.image('coarseTiles', 'assets/tilesets/coarseTiles.png');
        this.load.image('sandTiles', 'assets/tilesets/sandTiles.png');
        this.load.image('potIcon', 'assets/pot-icon.png');
        this.load.image('cowboyIcon', 'assets/hat-icon.png');
        this.load.image('wKey', 'assets/wKey.png');
        this.load.image('upKey', 'assets/upKey.png');
        this.load.image('sky', 'assets/background/Layer1_Sky.png');
        this.load.image('moon', 'assets/background/Layer2_Moon.png');
        this.load.image('hills', 'assets/background/Layer3_Hills.png');
        this.load.image('cactus0', 'assets/background/Layer4_CactusBack.png');
        this.load.image('sand0', 'assets/background/Layer5_SandBack.png');
        this.load.image('cactus1', 'assets/background/Layer6_CactusFront.png');
        this.load.image('sand1', 'assets/background/Layer7_SandFront.png');
        this.load.spritesheet('healthbar', 'assets/healthbarSprite.png', { frameWidth: 1000, frameHeight:200 });
        this.load.spritesheet('phiast', 'assets/anPhiast200x200.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('phiastCowboy', 'assets/anPhiastCowboy.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('blob', 'assets/blob.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.TILESIZE = 96;
        /**@type {Number[]} */
        //this.debugArray = [];
        let debugString = "debug";
        this.powerupCycleText = this.add.text(-20000, 6000, debugString, { fontSize: '16px', fill: '#FFF' });
        this.dialogueText = this.add.text(-20000, 5200, "", { fontSize: '16px', fill: '#FFF' });
        this.dialogueText.setVisible(false);
        this.dialogueArr = [];
        this.pressEnterToSkip = this.add.text(-20000, 5400, "press enter to skip", { fontSize: '12px', fill: '#FFF' });
        this.pressEnterToSkip.setOrigin(1, 1);
        this.pressEnterToSkip.setVisible(false);

        this.bgHealthbar = this.add.sprite(-20000, 5600, 'healthbar', 1);
        this.bgHealthbar.setScale(0.5);
        this.bgHealthbar.setCrop(0, 0, 800, 200);
        this.healthbar = this.add.sprite(-20000, 5600, 'healthbar', 0);
        this.healthbar.setScale(0.5);
        this.healthbar.setCrop(0, 0, 800, 200);
        //this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        //const logo = this.add.image(640, 200, 'logo');
        const mapDebug = this.make.tilemap({key:'levelTutorial'});
        const tilesDebug = mapDebug.addTilesetImage('sandTiles');
        this.layerTutorial = mapDebug.createLayer(0, tilesDebug, 0, 0);
        this.layerTutorial.setScale(4);
        this.layerTutorial.setPosition(0, 720 - this.layerTutorial.height * this.layerTutorial.scale);
        //this.layerTutorial.setCollisionFromCollisionGroup();
        this.layerTutorial.setDepth(1);

        this.skyLayer = this.add.tileSprite(1280, 360, this.layerTutorial.width * this.layerTutorial.scale, 720, 'sky');
        this.skyLayer.setScrollFactor(0.1, 0);
        this.moonLayer = this.add.tileSprite(1280, 360, this.layerTutorial.width * this.layerTutorial.scale, 720, 'moon');
        this.moonLayer.setScrollFactor(0.2, 0);
        this.hillsLayer = this.add.tileSprite(1280, 360, this.layerTutorial.width * this.layerTutorial.scale, 720, 'hills');
        this.hillsLayer.setScrollFactor(0.3, 0);
        this.cactusBackLayer = this.add.tileSprite(1280, 360, this.layerTutorial.width * this.layerTutorial.scale, 720, 'cactus0');
        this.cactusBackLayer.setScrollFactor(0.4, 0);
        this.sandBackLayer = this.add.tileSprite(1280, 360, this.layerTutorial.width * this.layerTutorial.scale, 720, 'sand0');
        this.sandBackLayer.setScrollFactor(0.5, 0);
        this.cactusFrontLayer = this.add.tileSprite(1280, 360, this.layerTutorial.width * this.layerTutorial.scale, 720, 'cactus1');
        this.cactusFrontLayer.setScrollFactor(0.6, 0);
        this.sandFrontLayer = this.add.tileSprite(1280, 360, this.layerTutorial.width * this.layerTutorial.scale, 720, 'sand1');
        this.sandFrontLayer.setScrollFactor(0.9, 0);

        this.layerTutorial.setAbove(this.sandFrontLayer);

        this.shapeGraphics = this.add.graphics();
        this.drawCollisionShapes(this.shapeGraphics);

        this.matter.world.convertTilemapLayer(this.layerTutorial);
        this.matter.world.setBounds(mapDebug.widthInPixels, mapDebug.heightInPixels);
        
        this.primaryCam = this.cameras.main;
        this.pixelCam = this.cameras.add(0, 0, 1280, 720, true, "pixel");
        this.pixelCam.setDeadzone(32, 40);
        this.pixelCam.setLerp(0.4, 0.8);
        this.pixelCam.setBounds(0, this.layerTutorial.getTopLeft().y, this.layerTutorial.width * this.layerTutorial.scale, this.layerTutorial.height * this.layerTutorial.scale);
        this.pixelCam.useBounds = true;

        this.healthCam = this.cameras.add(20, 20, 500, 100, false, "health");
        this.healthCam.startFollow(this.healthbar);

        this.textCam = this.cameras.add(640, 20, 620, 100, false, "errorMessage");
        this.textCam.startFollow(this.powerupCycleText);
        this.textCam.setOrigin(1, 0);
        this.powerupCycleText.setOrigin(1, 0);

        this.textboxCam = this.cameras.add(0, 620, 1280, 100, false, "dialogue");
        this.textboxCam.startFollow(this.dialogueText);

        for (let i = 0; i < this.cameras.cameras.length; i++){
            this.cameras.cameras[i].setVisible(false);
        }
        this.pixelCam.setVisible(true);
        this.textCam.setVisible(true);
        this.textboxCam.setVisible(true);
        this.healthCam.setVisible(true);

        this.potIcon = this.add.sprite(0, 0, 'potIcon', 0);
        this.potIcon.startingTile = {x:12.5, y:1.5};
        this.potIcon.setPosition(this.TILESIZE * this.potIcon.startingTile.x, 720 - this.TILESIZE * this.potIcon.startingTile.y);
        this.potIcon.setDepth(2);

        this.cowboyIcon = this.add.sprite(0, 0, 'cowboyIcon', 0);
        this.cowboyIcon.startingTile = {x:16.5, y:6.5};
        this.cowboyIcon.setScale(4);
        this.cowboyIcon.setPosition(this.TILESIZE * this.cowboyIcon.startingTile.x, 720 - this.TILESIZE * this.cowboyIcon.startingTile.y);
        this.cowboyIcon.setDepth(2);

        this.wKey = this.add.sprite(0, 0, 'wKey', 0);
        this.wKey.startingTile = {x:2, y:13.5};
        this.wKey.setScale(4);
        this.wKey.setPosition(this.TILESIZE * this.wKey.startingTile.x, 720 - this.TILESIZE * this.wKey.startingTile.y);
        this.wKey.setDepth(2);

        this.upKey = this.add.sprite(0, 0, 'upKey', 0);
        this.upKey.startingTile = {x:2.6, y:13.5};
        this.upKey.setScale(4);
        this.upKey.setPosition(this.TILESIZE * this.upKey.startingTile.x, 720 - this.TILESIZE * this.upKey.startingTile.y);
        this.upKey.setDepth(2);

        this.anPhiast = this.add.sprite(0, 0, 'phiast', 0);
        this.anPhiast.startingTile = {x:2, y:3};
        this.anPhiast.setOrigin(0.5, 1);
        this.anPhiast.setScale(0.5);
        this.anPhiast.maxVelocity = 50;
        this.anPhiast.setVisible(true);
        this.anPhiast.setPosition(this.TILESIZE * this.anPhiast.startingTile.x, 720 - this.TILESIZE * this.anPhiast.startingTile.y);
        this.anPhiast.isGrounded = false;
        this.anPhiast.canJump = false;
        this.anPhiast.currentPower = "none";
        this.anPhiast.collectedPowers = [];
        this.anPhiast.collectedPowers.push(this.anPhiast.currentPower);
        this.setPowerupText();
        this.anPhiast.deltax = 0;
        this.anPhiast.deltay = 0;
        this.anPhiast.health = 200;
        this.anPhiast.setDepth(2);
        
        this.anPhiast.pot = {};
        this.anPhiast.pot.isCharging = false;
        this.anPhiast.pot.needsTutorial = true;

        this.anPhiast.cowboy = this.add.sprite(0, 0, 'phiastCowboy', 0);
        this.anPhiast.cowboy.setScale(4);
        this.anPhiast.cowboy.setOrigin(0.5, 1);
        this.anPhiast.cowboy.setVisible(false);
        this.anPhiast.cowboy.setPosition(this.anPhiast.x,this.anPhiast.y);
        this.anPhiast.cowboy.isAttacking = false;
        this.anPhiast.cowboy.needsTutorial = true;

        this.whip = this.add.rectangle(this.anPhiast.getRightCenter().x, this.anPhiast.getRightCenter().y, this.anPhiast.width * this.anPhiast.scaleX, this.anPhiast.height * this.anPhiast.scaleY * 1.5, 0x00ffa0);
        this.whip.setAlpha(0.5);
        this.whip.setVisible(false);
        this.whip.setDepth(2);

        this.anims.create({
            key: "phiastWalk",
            frames: [
                { key: 'phiast', frame: 1 },
                { key: 'phiast', frame: 2 },
                { key: 'phiast', frame: 3 },
                { key: 'phiast', frame: 4 },
                { key: 'phiast', frame: 0 }
            ],
            frameRate: 2,
        });
        this.anims.create({
            key: "phiastIdle",
            frames: [
                { key: 'phiast', frame: 5 },
                { key: 'phiast', frame: 6 },
                { key: 'phiast', frame: 7 },
                { key: 'phiast', frame: 8 },
                { key: 'phiast', frame: 9 },
                { key: 'phiast', frame: 10 },
                { key: 'phiast', frame: 11 },
                { key: 'phiast', frame: 12 }
            ],
            frameRate: 5
        });
        this.anims.create({
            key: "phiastStationary",
            frames: [
                { key: 'phiast', frame: 5 }
            ],
            frameRate: 2,
        });
        this.anims.create({
            key: "phiastPotWalk",
            frames: [
                { key: 'phiast', frame: 15 },
                { key: 'phiast', frame: 16 },
                { key: 'phiast', frame: 17 },
                { key: 'phiast', frame: 18 },
                { key: 'phiast', frame: 19 }
            ],
            frameRate: 2
        });
        this.anims.create({
            key: "phiastPotIdle",
            frames: [
                { key: 'phiast', frame: 15 }
            ],
            frameRate: 2
        });
        
        this.anPhiast.play('phiastWalk');

        this.pixelCam.startFollow(this.anPhiast);

        this.enemies = [];
        //this.populateEnemies(5);
        this.createEnemy(13,15);
        this.createEnemy(20,5);
        this.createEnemy(24,15);
        this.createEnemy(25,15);
        this.createEnemy(4.5,15);

        //this.sample = this.sound.add("sample");
        //this.sample.play();
        
        this.buffer = [];
        this.addKeyInputs();
        this.curTime = Date.now();
        this.events.on("resume", function() {this.handleUnpause()}, this);
        this.textboxFadeoutTime = 0;
        this.textboxFadeoutControl = true;
        this.coyoteTime = 0;
        this.powerupCyclingTutorial = true;
    }

    createEnemy(tileX, tileY) {
        const tilePos = { x:tileX, y:tileY };
        const truePos = { x:this.TILESIZE*tilePos.x, y:720-this.TILESIZE*tilePos.y};
        const newEnemy = this.add.sprite(truePos.x, truePos.y, 'blob');
        newEnemy.setScale(3.5);
        newEnemy.setOrigin(0.5, 1);
        newEnemy.startingTile = tilePos;
        newEnemy.health = 2;
        newEnemy.setDepth(2);
        newEnemy.takeDamage = function() {
            this.health -= 2;
            if (this.health <= 0){
                this.setPosition(-1000, 850);
                this.destroy(true);
            }
        }
        //this.physics.world.enable(newEnemy);
        this.enemies.push(newEnemy);
    }

    /** Adds enemies to the map equal to num
     * @param {number} num number of enemies to add, default 1
     */
    populateEnemies(num = 1) {
        if (num < 1) return;
        num = Math.trunc(num);
        for (let i = 0; i < num; i++) {
            this.createEnemy(Math.floor(Math.random()*40)/2 + 10, Math.floor(Math.random()*20));
        }
    }

    drawCollisionShapes (graphics)
    {
        graphics.clear();

        // Loop over each tile and visualize its collision shape (if it has one)
        this.layerTutorial.forEachTile(tile =>
        {
            const tileWorldX = tile.getLeft();
            const tileWorldY = tile.getTop();
            const collisionGroup = tile.getCollisionGroup();

            // console.log(collisionGroup);

            if (!collisionGroup || collisionGroup.objects.length === 0) { return; }

            // The group will have an array of objects - these are the individual collision shapes
            const objects = collisionGroup.objects;

            for (let i = 0; i < objects.length; i++)
            {
                const object = objects[i];
                const objectX = tileWorldX + object.x;
                const objectY = tileWorldY + object.y;

                // When objects are parsed by Phaser, they will be guaranteed to have one of the
                // following properties if they are a rectangle/ellipse/polygon/polyline.
                if (object.rectangle)
                {
                    graphics.strokeRect(objectX, objectY, object.width, object.height);
                }
                else if (object.ellipse)
                {
                    // Ellipses in Tiled have a top-left origin, while ellipses in Phaser have a center
                    // origin
                    graphics.strokeEllipse(
                        objectX + object.width / 2, objectY + object.height / 2,
                        object.width, object.height
                    );
                }
                else if (object.polygon || object.polyline)
                {
                    const originalPoints = object.polygon ? object.polygon : object.polyline;
                    const points = [];
                    for (let j = 0; j < originalPoints.length; j++)
                    {
                        const point = originalPoints[j];
                        points.push({
                            x: objectX + point.x,
                            y: objectY + point.y
                        });
                    }
                    graphics.strokePoints(points);
                }
            }
        });
    }


    addKeyInputs() {
        this.keyObjects = class {};
        //Add Keys to KeyObject class
        {
            //WASD Movement
            this.keyObjects.up = this.input.keyboard.addKey("W");
            this.keyObjects.down = this.input.keyboard.addKey("S");
            this.keyObjects.right = this.input.keyboard.addKey("D");
            this.keyObjects.left = this.input.keyboard.addKey("A");
            //Arrow Key Movement
            this.keyObjects.upArrow = this.input.keyboard.addKey("Up");
            this.keyObjects.downArrow = this.input.keyboard.addKey("Down");
            this.keyObjects.rightArrow = this.input.keyboard.addKey("Right");
            this.keyObjects.leftArrow = this.input.keyboard.addKey("Left");
            //Other Actions
            this.keyObjects.jump = this.input.keyboard.addKey("Space");
            this.keyObjects.ability = this.input.keyboard.addKey("F");
            this.keyObjects.cycleright = this.input.keyboard.addKey("E");
            this.keyObjects.cycleleft = this.input.keyboard.addKey("Q");
            //Pause
            this.keyObjects.pause = this.input.keyboard.addKey("ESC");
            this.keyObjects.skip = this.input.keyboard.addKey("Enter");
        }

        //add inputs to the buffer when pressed 
        {
            //WASD Movement
            this.keyObjects.right.on('down', function() {this.bufferInput("r")}, this);
            this.keyObjects.left.on('down', function() {this.bufferInput("l")}, this);
            this.keyObjects.up.on('down', function() {this.bufferInput("u")}, this);
            this.keyObjects.down.on('down', function() {this.bufferInput("d")}, this);
            //Arrow Key Movement
            this.keyObjects.rightArrow.on('down', function() {this.bufferInput("r")}, this);
            this.keyObjects.leftArrow.on('down', function() {this.bufferInput("l")}, this);
            this.keyObjects.upArrow.on('down', function() {this.bufferInput("u")}, this);
            this.keyObjects.downArrow.on('down', function() {this.bufferInput("d")}, this);
            //Other Actions
            this.keyObjects.jump.on('down', function() {this.bufferInput("j")}, this);
            this.keyObjects.ability.on('down', function() {this.bufferInput("a")}, this);
            this.keyObjects.cycleright.on('down', function() {this.bufferInput(">"); this.cyclePower(true)}, this);
            this.keyObjects.cycleleft.on('down', function() {this.bufferInput("<"); this.cyclePower(false)}, this);
            //Skip Dialogue
            this.keyObjects.skip.on('down', function() {this.attemptNextDialogue()}, this);
        }

        //remove inputs from the buffer when unpressed
        {
            //WASD Movement
            this.keyObjects.right.on('up', function() {this.debufferInput("r")}, this);
            this.keyObjects.left.on('up', function() {this.debufferInput("l")}, this);
            this.keyObjects.up.on('up', function() {this.debufferInput("u")}, this);
            this.keyObjects.down.on('up', function() {this.debufferInput("d")}, this);
            //Arrow Key Movement
            this.keyObjects.rightArrow.on('up', function() {this.debufferInput("r")}, this);
            this.keyObjects.leftArrow.on('up', function() {this.debufferInput("l")}, this);
            this.keyObjects.upArrow.on('up', function() {this.debufferInput("u")}, this);
            this.keyObjects.downArrow.on('up', function() {this.debufferInput("d")}, this);
            //Other Actions
            this.keyObjects.jump.on('up', function() {this.debufferInput("j")}, this);
            this.keyObjects.ability.on('up', function() {this.debufferInput("a")}, this);
            this.keyObjects.cycleright.on('up', function() {this.debufferInput(">")}, this);
            this.keyObjects.cycleleft.on('up', function() {this.debufferInput("<")}, this);
            //Pause
            this.keyObjects.pause.on('up', function() {this.forcePause()}, this);
        }
    }

    //**@param {boolean} forwards default value true. Controls the direction that you iterate through the array */
    cyclePower(forwards = true) {
        const arr = this.anPhiast.collectedPowers
        const index = arr.indexOf(this.anPhiast.currentPower);
        let newIndex = -1;

        if (index == -1) return;

        if (forwards){
            newIndex = index + 1;
            if (newIndex >= arr.length) {
                newIndex = 0;
            }
        }
        else {
            newIndex = index - 1;
            if (newIndex < 0) {
                newIndex = arr.length - 1;
            }
        }
        this.anPhiast.currentPower = arr[newIndex];
        this.setPowerupText();

        if (this.anPhiast.currentPower == "none"){
            this.anPhiast.anims.pause();
            this.anPhiast.setFrame(0);
        }

        if (this.anPhiast.currentPower == "pot"){
            this.anPhiast.anims.pause();
            this.anPhiast.setFrame(15);
            this.healthbar.setCrop(0, 0, this.anPhiast.health * 5, 200);
            this.bgHealthbar.setCrop(0, 0, 1000, 200);
        }
        else {
            this.healthbar.setCrop(0, 0, this.anPhiast.health * 4, 200);
            this.bgHealthbar.setCrop(0, 0, 800, 200);
        }

        if (this.anPhiast.currentPower == "cowboy"){
            this.anPhiast.cowboy.setVisible(true);
            this.anPhiast.setVisible(false);
        }
        else {
            this.anPhiast.cowboy.setVisible(false);
            this.anPhiast.cowboy.isAttacking = false;
            this.anPhiast.setVisible(true);
            this.whip.setVisible(false);
        }
    }

    setPowerupText() {
        const index = this.anPhiast.collectedPowers.indexOf(this.anPhiast.currentPower);
        const length = this.anPhiast.collectedPowers.length;
        const prev = this.anPhiast.collectedPowers[(index + length - 1) % length];
        const next = this.anPhiast.collectedPowers[(index + 1) % length];
        this.powerupCycleText.text = prev + " <- Q | current powerup: " + this.anPhiast.currentPower + " | E -> " + next;
        // this.powerupCycleText.text = prev + " | >" + this.anPhiast.currentPower + " | " + next;
    }

    handleUnpause() {
        this.curTime = Date.now();
        this.buffer = this.registry.get("buffer");
    }

    forcePause() {
        this.registry.set("buffer", this.buffer);
        this.scene.run("Pause");
        this.scene.pause();
    }

    /**
     * @param {number} dt deltatime
     */
    accelerateRight(dt) {
        let acc = 0.075 * this.layerTutorial.scale;
        if (this.anPhiast.isGrounded){
            acc += 0.075 * this.layerTutorial.scale;
        }
        acc *= dt;
        this.anPhiast.deltax += acc;
        if (Math.abs(this.anPhiast.deltax) > this.anPhiast.maxVelocity){
            this.anPhiast.deltax = this.anPhiast.maxVelocity;
        }
    }

    /**
     * @param {number} dt deltatime
     */
    accelerateLeft(dt) {
       let acc = 0.075 * this.layerTutorial.scale;
        if (this.anPhiast.isGrounded){
            acc += 0.075 * this.layerTutorial.scale;
        }
        acc *= dt;
        this.anPhiast.deltax -= acc;
        if (Math.abs(this.anPhiast.deltax) > this.anPhiast.maxVelocity){
            this.anPhiast.deltax = -this.anPhiast.maxVelocity;
        }
    }

    /**
     * @param {number} dt deltatime
     */
    jump(dt) {
        if (this.anPhiast.deltay <= 1){
            this.anPhiast.canJump = false;
            this.anPhiast.deltay = 3 * this.layerTutorial.scale;
        }
    }

    /** OLD
     * @param {number} dt deltatime
     */
    handleGravity(dt) {
        this.gravity = 0.2;
        this.anPhiast.airResistance = 1.1;
        let dY = this.anPhiast.deltay;
        if (this.buffer.includes("j") && dY > 0){
            dY -= this.gravity * .25 * this.layerTutorial.scale * dt;
        }
        else {
            dY -= this.gravity * 3 * this.layerTutorial.scale * dt;
        }
        dY *= 1 / this.anPhiast.airResistance;
        this.anPhiast.deltay = dY;
    }

    /** Handles accel/decel and eventual movement
     * @param {number} deltatime the time in milliseconds since the last update
     */
    playerMove(deltatime){
        let dX = this.anPhiast.deltax; // initialise local variable to avoid corrupting class member
        if (this.anPhiast.currentPower == "pot"){
            dX *= 0.98;
            if (Math.abs(dX) >= 4 * this.layerTutorial.scale && this.anPhiast.isGrounded){
                this.anPhiast.pot.isCharging = true;
                this.anPhiast.setTint(0xff4000);
                this.anPhiast.pot.cooldown = 20;
            }
            else if (this.anPhiast.isGrounded) {
                this.anPhiast.pot.cooldown -= deltatime;
                if (this.anPhiast.pot.cooldown <= 0){
                    this.anPhiast.pot.cooldown = 0;
                    this.anPhiast.pot.isCharging = false;
                }
                if (this.anPhiast.pot.cooldown <= 2){
                    this.anPhiast.clearTint();
                }
            }
        }
        else {
            this.anPhiast.pot.isCharging = false;
            this.anPhiast.clearTint();
            dX *= 0.95; // deccelerate
        }
        if (dX >= 0.005) {
            dX -= 0.005;
        }
        else if (dX <= -0.005) {
            dX += 0.005;
        }
        else {
            dX = 0;
        }
        //set class member to dX
        this.anPhiast.deltax = dX;

        if (this.buffer.includes("r")) {
            this.accelerateRight(deltatime);
        }
        if (this.buffer.includes("l")) {
            this.accelerateLeft(deltatime);
        }
        if (this.anPhiast.canJump){
            if (this.buffer.includes("j")) {
                this.jump(deltatime);
            }
            if (this.anPhiast.deltax > 0){
                this.anPhiast.setFlipX(false);
            }
            else if (this.anPhiast.deltax < 0){
                this.anPhiast.setFlipX(true);
            }
        }
        else {
            this.handleGravity(deltatime);
        }
        
        const boundsPlayer = {
            y:this.anPhiast.getCenter().y,
            x:this.anPhiast.x,
            l:this.anPhiast.getLeftCenter().x,
            r:this.anPhiast.getRightCenter().x,
            t:this.anPhiast.getTopCenter().y,
            b:this.anPhiast.getBottomCenter().y,
            h:this.anPhiast.height * this.anPhiast.scale,
            w:this.anPhiast.width * this.anPhiast.scale
        }
        let isCollideY = false;
        this.anPhiast.isGrounded = false;
        let isCollideUnderPlat = false;
        let isCollideX = false;
        let curY = this.anPhiast.y;
        let curX = this.anPhiast.x;
        this.wKey.setVisible(false);
        this.upKey.setVisible(false);
        const playerColPoints = [];
        playerColPoints.push(this.anPhiast.getTopLeft());
        playerColPoints.push(this.anPhiast.getTopCenter());
        playerColPoints.push(this.anPhiast.getTopRight());
        playerColPoints.push(this.anPhiast.getLeftCenter());
        playerColPoints.push(this.anPhiast.getCenter());
        playerColPoints.push(this.anPhiast.getRightCenter());
        playerColPoints.push(this.anPhiast.getBottomLeft());
        playerColPoints.push(this.anPhiast.getBottomCenter());
        playerColPoints.push(this.anPhiast.getBottomRight());

        this.enemies.forEach(enemy => {
            let playerDamage = false;
            for (let i = 0; i < playerColPoints.length; i++) {
                if (enemy.getLeftCenter().x < playerColPoints[i].x && enemy.getRightCenter().x > playerColPoints[i].x
                && enemy.getTopCenter().y < playerColPoints[i].y && enemy.getBottomCenter().y > playerColPoints[i].y) {
                    if (this.anPhiast.pot.isCharging && this.anPhiast.currentPower == "pot"){
                        enemy.takeDamage();
                    }
                    else {
                        playerDamage = true;
                    }
                }
            }
            if (playerDamage) {
                this.damagePhiast();
            }
        })
        
        this.layerTutorial.forEachTile(tile => {
            if (tile.index == -1) return;
            //tile.tint = 0xff0000;
            const tBounds = {
                i:tile.x,
                t:tile.getTop(),
                b:tile.getBottom(),
                l:tile.getLeft(),
                r:tile.getRight(),
                s:tile.height
            }
            const cPad = 0.01;
            //const dX = 2 * Math.abs(this.anPhiast.deltax) + cPad;
            //const dY = 2 * Math.abs(this.anPhiast.deltay);
            const containsPhiastB = tBounds.t <= boundsPlayer.b && tBounds.b >= boundsPlayer.b;
            const containsPhiastT = tBounds.t <= boundsPlayer.t && tBounds.b >= boundsPlayer.t;
            const containsPhiastR = tBounds.l <= boundsPlayer.r && tBounds.r >= boundsPlayer.r;
            const containsPhiastL = tBounds.l <= boundsPlayer.l && tBounds.r >= boundsPlayer.l;
            const wouldContainPhiastB = tBounds.t <= boundsPlayer.b + this.anPhiast.deltay && tBounds.b >= boundsPlayer.b + this.anPhiast.deltay;
            const wouldContainPhiastT = tBounds.t <= boundsPlayer.t + this.anPhiast.deltay && tBounds.b >= boundsPlayer.t + this.anPhiast.deltay;
            const wouldContainPhiastR = tBounds.l <= boundsPlayer.r + this.anPhiast.deltax && tBounds.r >= boundsPlayer.r + this.anPhiast.deltax;
            const wouldContainPhiastL = tBounds.l <= boundsPlayer.l + this.anPhiast.deltax && tBounds.r >= boundsPlayer.l + this.anPhiast.deltax;
            const containsMidX = (tBounds.l <= boundsPlayer.x - (boundsPlayer.w * (1 / 8)) 
                && tBounds.r >= boundsPlayer.x - (boundsPlayer.w * (1 / 8)))
                || (tBounds.l <= boundsPlayer.x + (boundsPlayer.w * (1 / 8)) 
                && tBounds.r >= boundsPlayer.x + (boundsPlayer.w * (1 / 8)))
                || (tBounds.l <= boundsPlayer.x && tBounds.r >= boundsPlayer.x);
            const containsPhiastY = (tBounds.t <= boundsPlayer.y && tBounds.b >= boundsPlayer.y) || containsPhiastB || containsPhiastT;
            const containsPhiastX = (tBounds.l <= boundsPlayer.x && tBounds.r >= boundsPlayer.x) || containsPhiastL || containsPhiastR;

            if (tile.index == 27) {
                if (containsPhiastX && containsPhiastY){
                    this.wKey.setVisible(true);
                    this.wKey.setPosition(tBounds.l, tBounds.t - tBounds.s);
                    this.upKey.setVisible(true);
                    this.upKey.setPosition(tBounds.r, tBounds.t - tBounds.s);

                    if (this.buffer.includes("u")){
                        let message = "";
                        if (tBounds.i < 2){
                            message = "Wow, you made that difficult jump... or you used the pot.";
                        }
                        else if (tBounds.i < 5){
                            message = "WASD or Arrow Keys to move.";
                        }
                        else if (tBounds.i < 20){
                            message = "Space to jump, hold it down to jump higher.";
                        }
                        else {
                            message = "congrats! You beat the tutorial level.";
                        }
                        this.createDialogue(message);
                    }
                }
                return;
            }

            if (containsPhiastX && (wouldContainPhiastT || containsPhiastT) && this.anPhiast.deltay >= 0) {
                isCollideUnderPlat = true;
                curY = tBounds.b + boundsPlayer.h + cPad * 5;
                this.anPhiast.deltay = 0;
            }
            else if ((containsPhiastY && this.anPhiast.isGrounded) || (containsPhiastY && !containsPhiastB) && (containsPhiastR || containsPhiastL || wouldContainPhiastR || wouldContainPhiastL)) {
                if ((containsPhiastR && this.anPhiast.deltax >= 0) || wouldContainPhiastR) {
                    if (!isCollideX){
                        isCollideX = true;
                    }
                    else if (boundsPlayer.r > tBounds.l){
                        curX = tBounds.l - boundsPlayer.w/2 - cPad;
                    }
                    else if (curX > tBounds.l - boundsPlayer.w/2){
                        curX = tBounds.l - boundsPlayer.w/2 - cPad;
                    }
                }
                if ((containsPhiastL && this.anPhiast.deltax <= 0) || wouldContainPhiastL) {
                    if (!isCollideX){
                        isCollideX = true;
                    }
                    else if (boundsPlayer.l < tBounds.r){
                        curX = tBounds.r + boundsPlayer.w/2 + cPad;
                    }
                    else if (curX < tBounds.r + boundsPlayer.w/2){
                        curX = tBounds.r + boundsPlayer.w/2 + cPad;
                    }
                }
                this.anPhiast.deltax = 0;
            }
            if (wouldContainPhiastB || (containsPhiastB && this.anPhiast.deltay <= 0) && (containsMidX || containsPhiastX) ) {
                if (containsMidX) {
                    if (curY > tBounds.t){
                        curY = tBounds.t - cPad;
                        this.anPhiast.y = curY;
                    }
                }
                if (containsPhiastX){
                    isCollideY = true;
                }
            }
        }, this)
        
        if (isCollideX){
            this.anPhiast.deltax = 0;
            this.anPhiast.x = curX;
        }

        if (isCollideUnderPlat){
            this.anPhiast.y = curY;
            this.anPhiast.deltay = -0.001 * deltatime;
        }

        if (isCollideY){
            // this.anPhiast.y = this.anPhiast.collideY;
            this.anPhiast.deltay *= 0.9;
            this.anPhiast.canJump = true;
            this.anPhiast.isGrounded = true;
            this.coyoteTime = 10;
        }

        else {
            this.anPhiast.isGrounded = false;
        }

        // For some reason splitting the x and y movement gives the effect I want
        this.anPhiast.x += this.anPhiast.deltax;
        this.anPhiast.y -= this.anPhiast.deltay;

        if (this.anPhiast.y > 800) {
            this.respawnAnPhiast();
        }

        const containsPotIconX = this.anPhiast.getTopLeft().x < this.potIcon.x && this.anPhiast.getBottomRight().x > this.potIcon.x;
        const containsPotIconY = this.anPhiast.getTopLeft().y < this.potIcon.y && this.anPhiast.getBottomRight().y > this.potIcon.y;
        const containsHatIconX = this.anPhiast.getTopLeft().x < this.cowboyIcon.x && this.anPhiast.getBottomRight().x > this.cowboyIcon.x;
        const containsHatIconY = this.anPhiast.getTopLeft().y < this.cowboyIcon.y && this.anPhiast.getBottomRight().y > this.cowboyIcon.y;
        if (containsPotIconX && containsPotIconY && !this.anPhiast.collectedPowers.includes("pot")){
            this.anPhiast.collectedPowers.push("pot");
            this.anPhiast.currentPower = "pot";
            this.healthbar.setCrop(0, 0, this.anPhiast.health * 5, 200);
            this.bgHealthbar.setCrop(0, 0, 1000, 200);;
            this.anPhiast.setVisible(true);
            this.anPhiast.cowboy.setVisible(false);
            this.anPhiast.cowboy.isAttacking = false;
            this.whip.setVisible(false);
            this.anPhiast.anims.pause();
            this.anPhiast.setFrame(15);
            this.setPowerupText();
            if (this.powerupCyclingTutorial) {
                this.powerupCyclingTutorial = false;
                this.createDialogue("You can press Q and E to cycle between your collected powerups");
            }
            this.createDialogue("You got the powerup 'pot'. Gain speed to charge into enemies.", this.anPhiast.pot.needsTutorial, 3000);
        }
        if (containsHatIconX && containsHatIconY && !this.anPhiast.collectedPowers.includes("cowboy")){
            this.anPhiast.collectedPowers.push("cowboy");
            this.anPhiast.currentPower = "cowboy";
            this.healthbar.setCrop(0, 0, this.anPhiast.health * 4, 200);
            this.bgHealthbar.setCrop(0, 0, 800, 200);
            this.anPhiast.setVisible(false);
            this.anPhiast.anims.pause();
            this.anPhiast.setFrame(0);
            this.anPhiast.cowboy.setVisible(true);
            this.setPowerupText();
            if (this.powerupCyclingTutorial) {
                this.powerupCyclingTutorial = false;
                this.createDialogue("You can press Q and E to cycle between your collected powerups");
            }
            this.createDialogue("You got the powerup 'cowboy'. Press F to attack with your whip.", this.anPhiast.cowboy.needsTutorial, 3000);
        }
        this.anPhiast.cowboy.setPosition(this.anPhiast.x, this.anPhiast.y);
        this.anPhiast.cowboy.setFlip(this.anPhiast.flipX);
    }

    playerAttack(deltatime) {
        if (this.anPhiast.currentPower == "cowboy") {
            if (this.buffer.includes("a") && !this.anPhiast.cowboy.isAttacking) {
                this.whip.setScale(4);
                this.anPhiast.cowboy.isAttacking = true;
                this.anPhiast.cowboy.cooldown = 60;
                this.whip.setVisible(true);
            }
            if (this.anPhiast.cowboy.isAttacking) {
                const whipPos = { 
                    x:0, 
                    y:0 
                };
                const whipScale = {
                    x:this.whip.scaleX,
                    y:this.whip.scaleY
                }
                const pBounds = { 
                    x: this.anPhiast.displayWidth,
                    y: this.anPhiast.displayHeight
                }
                this.anPhiast.cowboy.cooldown -= deltatime * 2;
                if (this.anPhiast.cowboy.cooldown <= 5) {
                    whipPos.x += pBounds.x / 5;
                    whipPos.y += pBounds.y / 2;
                    whipScale.y *= 1.02 * deltatime;
                }
                else if (this.anPhiast.cowboy.cooldown <= 10) {
                    whipPos.x += pBounds.x / 2;
                    whipPos.y += pBounds.y / 3;
                    whipScale.x *= 0.95 * deltatime;
                    whipScale.y *= 1.03 * deltatime;
                }
                else if (this.anPhiast.cowboy.cooldown <= 20){
                    whipPos.x += pBounds.x;
                    whipPos.y += pBounds.y / 8;
                    whipScale.x *= 0.95 * deltatime;
                    whipScale.y *= 1.02 * deltatime;
                }
                else if (this.anPhiast.cowboy.cooldown <= 25) {
                    whipPos.x += pBounds.x * 1.2;
                    whipPos.y -= pBounds.y / 8;
                    whipScale.x *= 1.02 * deltatime;
                    whipScale.y *= 0.97 * deltatime;
                }
                else if (this.anPhiast.cowboy.cooldown <= 30) {
                    whipPos.x += pBounds.x;
                    whipPos.y -= pBounds.y / 3;  
                    whipScale.x *= 1.12 * deltatime;
                    whipScale.y *= 0.9 * deltatime;
                }
                else if (this.anPhiast.cowboy.cooldown <= 40) {
                    whipPos.x -= pBounds.x / 2;
                    whipPos.y -= pBounds.y / 3;
                    whipScale.y *= 1.05 * deltatime;
                }
                else if (this.anPhiast.cowboy.cooldown <= 50) {
                    whipPos.x -= pBounds.x;
                    whipPos.y += pBounds.y / 6;
                    whipScale.x *= 0.95 * deltatime;
                    whipScale.y *= 1.05 * deltatime;
                }
                else {
                    whipPos.x -= pBounds.x;
                    whipPos.y += pBounds.y / 3;
                    whipScale.y = 0.25;
                    whipScale.x = 2;
                }

                if (this.anPhiast.cowboy.flipX) {
                    whipPos.x = this.anPhiast.cowboy.getLeftCenter().x - whipPos.x;
                    whipPos.y = this.anPhiast.cowboy.getLeftCenter().y + whipPos.y;
                }
                else {
                    whipPos.x = this.anPhiast.cowboy.getRightCenter().x + whipPos.x;
                    whipPos.y = this.anPhiast.cowboy.getRightCenter().y + whipPos.y;
                }
                this.whip.setScale(whipScale.x, whipScale.y);
                this.whip.setPosition(whipPos.x, whipPos.y);

                const whipDims = {
                    left: this.whip.getTopLeft().x,
                    top: this.whip.getTopLeft().y,
                    right: this.whip.getBottomRight().x,
                    bottom: this.whip.getBottomRight().y
                }

                this.enemies.forEach(enemy => {
                    const dims = {
                        p: enemy.getCenter(),
                        w: enemy.displayWidth / 2,
                        h: enemy.displayHeight / 2
                    };
                    const whipContainsY = (whipDims.top - dims.h < dims.p.y) && (whipDims.bottom + dims.h > dims.p.y);
                    const whipContainsX = (whipDims.left - dims.w < dims.p.x) && (whipDims.right + dims.w > dims.p.x);
                    if (whipContainsX && whipContainsY) {
                        enemy.takeDamage();
                    }
                });
            }
            if (this.anPhiast.cowboy.cooldown <= 0){
                this.anPhiast.cowboy.isAttacking = false;
                this.anPhiast.cowboy.cooldown = 0;
                this.whip.setVisible(false);
            }
        }
    }
    
    /** Adds Dialogue to dialogue array 
     * @param {String|String[]} strMess the message to display
     * @param {Boolean} useTimer controls if the timer is used or not. Default:`true`
     * @param {Number} timer the length of time the message will display in ms. Default:`2000`
     * @param {(String|Number)} fSize the size of the font, can be a string with a valid CSS unit or a number. Default:`24px`
     * @param {Number} padL textbox left padding. Default:`20`
     * @param {Number} padT textbox top padding. Default:`8`
     * @param {Number} padR textbox right padding. Default:`padL`
     * @param {Number} padB textbox bottom padding. Default:`padT`
     * @param {String} bgColor the background color of the textbox, hex code (e.g. "#fff") or css color (e.g. "black"). Default:`#082060a8`
     */
    createDialogue(strMess, useTimer = true, timer = 2000, fSize = "24px", padL = 20, padT = 8, padR = padL, padB = padT, bgColor = "#082060a8") {
        if (this.dialogueText.text === strMess) return;
        for (let i = 0; i < this.dialogueArr.length; i++) {
            if (this.dialogueArr[i].text === strMess) {
                return;
            }
        }
        const newDialogue = {};
        newDialogue.text = strMess;
        newDialogue.useTime = useTimer;
        newDialogue.time = timer;
        newDialogue.fontSize = fSize;
        newDialogue.padding = {
            left:padL,
            right:padR,
            top:padT,
            bottom:padB
        }
        newDialogue.boxColor = bgColor;
        this.dialogueArr.push(newDialogue);
    }

    attemptNextDialogue() {
        if (this.dialogueArr[0]){
            this.nextDialogue();
        }
        else {
            this.removeDialogueBox();
        }
        this.dialogueArr.splice(0,1);
    }

    removeDialogueBox() {
        this.dialogueText.setText("");
        this.dialogueText.setVisible(false);
        this.pressEnterToSkip.setVisible(false);
        this.textboxFadeoutTime = 0;
        this.textboxFadeoutControl = true;
    }

    nextDialogue() {
        const textboxObj = this.dialogueArr[0];
        this.dialogueText.setVisible(true);
        this.dialogueText.setPadding(textboxObj.padding.left,textboxObj.padding.top,textboxObj.padding.right,textboxObj.padding.bottom);
        this.dialogueText.setFixedSize(1000, 100);
        this.dialogueText.setWordWrapWidth(1000 - textboxObj.padding.left - textboxObj.padding.right);
        this.dialogueText.setBackgroundColor(textboxObj.boxColor);
        this.dialogueText.setFontSize(textboxObj.fontSize);
        this.dialogueText.setOrigin(0.5);
        this.dialogueText.setText(textboxObj.text);

        const botRight = this.dialogueText.getBottomRight();
        this.pressEnterToSkip.setVisible(true);
        this.pressEnterToSkip.setOrigin(1, 1);
        this.pressEnterToSkip.setPosition(botRight.x, botRight.y);
        this.pressEnterToSkip.setPadding(textboxObj.padding.left,textboxObj.padding.top,textboxObj.padding.right,textboxObj.padding.bottom);
        //strMess = that.dialogueText.advancedWordWrap(textboxObj.text, that.dialogueText.context, 1000 - textboxObj.padding.left - textboxObj.padding.right);
        this.textboxFadeoutTime = textboxObj.time;
        this.textboxFadeoutControl = textboxObj.useTime;
    }

    damagePhiast() {
        if (this.anPhiast.currentPower == "pot"){
            this.anPhiast.health -= 8;
            this.healthbar.setCrop(0, 0, this.anPhiast.health * 5, 200);
        }
        else {
            this.anPhiast.health -= 10;
            this.healthbar.setCrop(0, 0, this.anPhiast.health * 4, 200);
        }

        if (this.anPhiast.health < 0) {
            this.respawnAnPhiast();
        }
    }

    moveAllEnemies() {
        this.enemies.forEach(enemy => {
            const eBounds = {
                y:enemy.getCenter().y,
                x:enemy.x,
                l:enemy.getLeftCenter().x,
                r:enemy.getRightCenter().x,
                t:enemy.getTopCenter().y,
                b:enemy.getBottomCenter().y,
                h:enemy.height * enemy.scale,
                w:enemy.width * enemy.scale
            }
            let collideY = false;
            let overhang = false;
            let curX = enemy.x;
            let curY = enemy.y;
            this.layerTutorial.forEachTile(tile => {
                if (tile.index == -1 || tile.index == 27) return;
                //tile.tint = 0xff0000;
                const tBounds = {
                    t:tile.getTop(),
                    b:tile.getBottom(),
                    l:tile.getLeft(),
                    r:tile.getRight(),
                    s:tile.height
                }
                const cPad = 0.01;
                //const dX = 2 * Math.abs(enemy.deltax) + cPad;
                //const dY = 2 * Math.abs(enemy.deltay);
                const containsEnemyB = tBounds.t <= eBounds.b && tBounds.b >= eBounds.b;
                const aboveTile = tBounds.t >= eBounds.b;
                const containsEnemyT = tBounds.t <= eBounds.t && tBounds.b >= eBounds.t;
                const containsEnemyR = tBounds.l <= eBounds.r && tBounds.r >= eBounds.r;
                const containsEnemyL = tBounds.l <= eBounds.l && tBounds.r >= eBounds.l;
                const containsMidX = (tBounds.l <= eBounds.x - (eBounds.w * (1 / 8)) 
                    && tBounds.r >= eBounds.x - (eBounds.w * (1 / 8)))
                    || (tBounds.l <= eBounds.x + (eBounds.w * (1 / 8)) 
                    && tBounds.r >= eBounds.x + (eBounds.w * (1 / 8)))
                    || (tBounds.l <= eBounds.x && tBounds.r >= eBounds.x);
                const containsEnemyY = (tBounds.t <= eBounds.y && tBounds.b >= eBounds.y) || containsEnemyB || containsEnemyT;
                const containsEnemyCenterX = tBounds.l <= eBounds.x && tBounds.r >= eBounds.x;
                const containsEnemyX = containsEnemyCenterX || containsEnemyL || containsEnemyR;
                const aboveLeft = containsEnemyL && !containsEnemyCenterX && (containsEnemyB || tBounds.t <= eBounds.b + eBounds.h / 3 && tBounds.b >= eBounds.b + eBounds.h / 3);
                const aboveRight = containsEnemyR && !containsEnemyCenterX && (containsEnemyB || tBounds.t <= eBounds.b + eBounds.h / 3 && tBounds.b >= eBounds.b + eBounds.h / 3);

                if (aboveTile && containsEnemyX && !collideY) {
                    curY = tBounds.t - cPad;
                    curX = tile.getCenterX();
                    enemy.y = curY;
                    collideY = true;
                }
                else if (containsEnemyY && containsEnemyX && !collideY) {
                    curY = tBounds.t - cPad;
                    enemy.y = curY;
                    collideY = true;
                }
                if (aboveLeft || aboveRight){
                    enemy.curX = tile.getCenterX();
                }
            }, this);
            if (!collideY){ enemy.takeDamage() }
            enemy.setPosition(curX, curY);
        }, this);
    }

    respawnAnPhiast() {
        this.anPhiast.setPosition(this.TILESIZE * this.anPhiast.startingTile.x, 720 - this.TILESIZE * this.anPhiast.startingTile.y);
        this.anPhiast.collectedPowers = [];
        this.anPhiast.currentPower = "none";
        this.anPhiast.collectedPowers.push(this.anPhiast.currentPower);
        this.anPhiast.setVisible(true);
        this.anPhiast.anims.pause();
        this.anPhiast.setFrame(0);
        this.anPhiast.cowboy.setVisible(false);
        this.anPhiast.cowboy.isAttacking = false;
        this.anPhiast.isGrounded = false;
        this.anPhiast.canJump = false;
        this.anPhiast.deltax = 0;
        this.anPhiast.deltay = 0;
        this.anPhiast.health = 200;
        this.healthbar.setCrop(0, 0, 800, 200);
        this.bgHealthbar.setCrop(0, 0, 800, 200);
        this.whip.setVisible(false);
        this.setPowerupText();
    }

    /** Adds inputs to the buffer 
     * @param {String} input directional input to add 
     */
    bufferInput(input){
        input = input.toLowerCase();
        if (input == "up" || input == "u" && !this.buffer.includes("u")){
            this.buffer.push("u");
        }
        else if (input == "down" || input == "d" && !this.buffer.includes("d")){
            this.buffer.push("d");
        }
        else if (input == "left" || input == "l" && !this.buffer.includes("l")){
            this.buffer.push("l");
        }
        else if (input == "right" || input == "r" && !this.buffer.includes("r")){
            this.buffer.push("r");
        }
        else if (this.anPhiast.canJump && (input == "jump" || input == "space" || input == "j") && !this.buffer.includes("j")){
            this.buffer.push("j");
        }
        else if (input == "ability" || input == "ABILITY_KEY" /* TODO: add key */ || input == "a" && !this.buffer.includes("a")){
            this.buffer.push("a");
        }
        else if (input == "cycleleft" || input == "q" || input == "<" && !this.buffer.includes("<")){
            this.buffer.push("<");
        }
        else if (input == "cycleright" || input == "e" || input == ">" && !this.buffer.includes(">")){
            this.buffer.push(">");
        }
    }

    /** Removes inputs from the buffer 
     * @param {String} input directional input to remove 
     */
    debufferInput(input){
        let i = -1;
        input = input.toLowerCase();
        if (input == "up" || input == "u"){
            i = this.buffer.indexOf("u");
        }
        else if (input == "down" || input == "d"){
            i = this.buffer.indexOf("d");
        }
        else if (input == "left" || input == "l"){
            i = this.buffer.indexOf("l");
        }
        else if (input == "right" || input == "r"){
            i = this.buffer.indexOf("r");
        }
        else if (input == "jump" || input == "space" || input == "j"){
            i = this.buffer.indexOf("j");
        }
        else if (input == "ability" || input == "ABILITY_KEY" /* TODO: add key */ || input == "a"){
            i = this.buffer.indexOf("a");
        }
        else if (input == "cycleleft" || input == "q" || input == "<"){
            i = this.buffer.indexOf("<");
        }
        else if (input == "cycleright" || input == "e" || input == ">"){
            i = this.buffer.indexOf(">");
        }
        else return -1; //bad arg
        if (i == -1) return 0; //not in buffer
        const debug = this.buffer.splice(i, 1);
    }

    handlePlayerAnims() {
        if (this.anPhiast.anims.isPlaying && this.anPhiast.anims.hasStarted) return;

        if (this.anPhiast.currentPower == "none"){
            if (Math.abs(this.anPhiast.deltax) > 0.05){
                this.anPhiast.play('phiastWalk');
            }
            else if (!this.anPhiast.anims.isPlaying){
                this.anPhiast.playAfterDelay('phiastIdle', 5000);
            }
            else{
                this.anPhiast.setFrame(12);
            }
        }
        else if (this.anPhiast.currentPower == "pot"){
            if (Math.abs(this.anPhiast.deltax) > 0.05){
                this.anPhiast.play('phiastPotWalk');
            }
            else if (!this.anPhiast.anims.isPlaying){
                this.anPhiast.setFrame(15);
            }
        }
    }

    unexpectedError() {
        this.add.text(0, 0, 'error encountered', { fontSize: '16px', fill: '#FFF' });
    }

    update() {
        const prevTime = this.curTime;
        this.curTime = Date.now();
        const deltatimeMilliseconds = (this.curTime - prevTime);
        const deltatime = deltatimeMilliseconds * this.MS_TO_FPS; //should be around 1

        this.coyoteTime -= deltatime;
        this.textboxFadeoutTime -= deltatimeMilliseconds;

        if (this.coyoteTime < 0){
            this.coyoteTime = 0;
            this.anPhiast.canJump = false;
        }
        if (this.dialogueArr[0]) {
            this.pressEnterToSkip.text = "press enter to skip";
        }
        else {
            this.pressEnterToSkip.text = "press enter to close this textbox";
        }
        if (this.textboxFadeoutTime < 0 && (this.textboxFadeoutControl || this.dialogueArr[0])){
            this.textboxFadeoutTime = 0;
            this.attemptNextDialogue();
        }

        this.playerMove(deltatime);
        this.moveAllEnemies();
        this.playerAttack(deltatime);

        this.handlePlayerAnims();
    }
}