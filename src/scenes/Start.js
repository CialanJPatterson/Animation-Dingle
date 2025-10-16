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
        this.load.image('grassTiles', 'assets/tilesets/grassTiles.png');
        this.load.image('potIcon', 'assets/pot-icon.png');
        this.load.image('wKey', 'assets/wKey.png');
        this.load.image('upKey', 'assets/upKey.png');
        this.load.spritesheet('healthbar', 'assets/healthbar.png', { frameWidth: 64, frameHeight:12 });
        this.load.spritesheet('phiast', 'assets/anPhiast.png', { frameWidth: 48, frameHeight: 64 });
        this.load.spritesheet('phiastPot', 'assets/anPhiastPot.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('blob', 'assets/blob.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        const sceneRef = this;
        this.TILESIZE = 24;
        /**@type {Number[]} */
        //this.debugArray = [];
        let debugString = "debug";
        this.debugText = this.add.text(5000, 0, debugString, { fontSize: '16px', fill: '#FFF' });
        this.debugText.setVisible(false);
        this.healthbar = this.add.sprite(5000, 600, 'healthbar');
        this.healthbar.setScale(5);
        this.healthbar.setOrigin(1, 0.5);
        this.healthbar.setCrop(0, 0, 64, 12);
        //this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        //const logo = this.add.image(640, 200, 'logo');
        const mapDebug = this.make.tilemap({key:'levelDebug'});
        const tilesDebug = mapDebug.addTilesetImage('grassTiles');
        this.layerDebug = mapDebug.createLayer(0, tilesDebug, 0, 260);
        this.layerDebug.setCollisionFromCollisionGroup();

        this.shapeGraphics = this.add.graphics();
        this.drawCollisionShapes(this.shapeGraphics);

        this.matter.world.convertTilemapLayer(this.layerDebug);
        this.matter.world.setBounds(mapDebug.widthInPixels, mapDebug.heightInPixels);
        
        this.primaryCam = this.cameras.main;
        this.pixelCam = this.cameras.add(0, 0, 1280, 720, true, "pixel");
        this.pixelCam.setDeadzone(32, 40);
        this.pixelCam.setLerp(0.4, 0.8);
        this.pixelCam.zoom = 4;
        this.pixelCam.setBounds(this.layerDebug.getTopLeft().x, 0, this.layerDebug.getBottomRight().x - this.layerDebug.getTopLeft().x, this.layerDebug.getBottomRight().y, true);
        this.pixelCam.useBounds = true;

        this.textCam = this.cameras.add(0, 620, 1280, 100, false, "debug");
        this.textCam.startFollow(this.debugText);

        this.healthCam = this.cameras.add(0, 20, 640, 60, false, "health");
        this.healthCam.startFollow(this.healthbar);

        for (let i = 0; i < this.cameras.cameras.length; i++){
            this.cameras.cameras[i].setVisible(false);
        }
        this.pixelCam.setVisible(true);
        this.textCam.setVisible(true);
        this.healthCam.setVisible(true);

        this.potIcon = this.add.sprite(0, 0, 'potIcon', 0);
        this.potIcon.startingTile = {x:7, y:14.5};
        this.potIcon.setPosition(this.TILESIZE * this.potIcon.startingTile.x, this.TILESIZE * this.potIcon.startingTile.y);

        this.wKey = this.add.sprite(0, 0, 'wKey', 0);
        this.wKey.startingTile = {x:2, y:13.5};
        this.wKey.setPosition(this.TILESIZE * this.wKey.startingTile.x, this.TILESIZE * this.wKey.startingTile.y);

        this.upKey = this.add.sprite(0, 0, 'upKey', 0);
        this.upKey.startingTile = {x:2.6, y:13.5};
        this.upKey.setPosition(this.TILESIZE * this.upKey.startingTile.x, this.TILESIZE * this.upKey.startingTile.y);

        this.anPhiast = this.add.sprite(0, 0, 'phiast', 0);
        this.anPhiast.startingTile = {x:5, y:11};
        this.anPhiast.setOrigin(0.5, 1);
        this.anPhiast.setScale(0.375);
        this.anPhiast.maxVelocity = 50;
        this.anPhiast.setVisible(true);
        this.anPhiast.setPosition(this.TILESIZE * this.anPhiast.startingTile.x, this.TILESIZE * this.anPhiast.startingTile.y);
        this.anPhiast.isGrounded = false;
        this.anPhiast.canJump = false;
        this.anPhiast.currentPower = "none";
        this.anPhiast.collectedPowers = [];
        this.anPhiast.collectedPowers.push(this.anPhiast.currentPower);
        this.anPhiast.deltax = 0;
        this.anPhiast.deltay = 0;
        this.anPhiast.health = 64;

        this.anPhiastPot = this.add.sprite(0, 0, 'phiastPot', 0);
        this.anPhiastPot.setOrigin(0.5, 1);
        this.anPhiastPot.setVisible(false);
        this.anPhiastPot.setPosition(this.anPhiast.x,this.anPhiast.y);

        this.pixelCam.startFollow(this.anPhiast);

        this.enemies = [];
        this.populateEnemies(this.TILESIZE, 40);

        //this.sample = this.sound.add("sample");
        //this.sample.play();
        
        this.buffer = [];
        this.addKeyInputs();
        this.curTime = Date.now();
        this.events.on("resume", function() { sceneRef.handleUnpause() });
        this.textBoxFadeOut = 0;
        this.coyoteTime = 0;
    }

    /** Adds enemies to the map equal to num
     * @param {number} tile size of tiles
     * @param {number} num number of enemies to add, default 1
     */
    populateEnemies(tile, num = 1) {
        if (num < 1) return;
        num = Math.trunc(num);
        for (let i = 0; i < num; i++) {
            const tilePos = { x:Math.floor(Math.random()*40)/2 + 10, y:Math.floor(Math.random()*20) + 10 };
            const truePos = { x:tile*tilePos.x, y:tile*tilePos.y};
            const newEnemy = this.add.sprite(truePos.x, truePos.y, 'blob');
            newEnemy.setScale(0.875);
            newEnemy.setOrigin(0.5, 1);
            newEnemy.startingTile = tilePos;
            newEnemy.health = 2;
            newEnemy.takeDamage = function() {
                this.health -= 2;
                if (this.health <= 0){
                    this.setPosition(1000, 850);
                    this.destroy(true);
                }
            }
            //this.physics.world.enable(newEnemy);
            this.enemies.push(newEnemy);
            //this.debugText.text = tilePos.x;
            //newEnemy.destroy();
        }
    }

    drawCollisionShapes (graphics)
    {
        graphics.clear();

        // Loop over each tile and visualize its collision shape (if it has one)
        this.layerDebug.forEachTile(tile =>
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
        const sceneRef = this;
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
        }

        //add inputs to the buffer when pressed 
        {
            //WASD Movement
            this.keyObjects.right.on('down', function() {sceneRef.bufferInput("r")});
            this.keyObjects.left.on('down', function() {sceneRef.bufferInput("l")});
            this.keyObjects.up.on('down', function() {sceneRef.bufferInput("u")});
            this.keyObjects.down.on('down', function() {sceneRef.bufferInput("d")});
            //Arrow Key Movement
            this.keyObjects.rightArrow.on('down', function() {sceneRef.bufferInput("r")});
            this.keyObjects.leftArrow.on('down', function() {sceneRef.bufferInput("l")});
            this.keyObjects.upArrow.on('down', function() {sceneRef.bufferInput("u")});
            this.keyObjects.downArrow.on('down', function() {sceneRef.bufferInput("d")});
            //Other Actions
            this.keyObjects.jump.on('down', function() {sceneRef.bufferInput("j")});
            this.keyObjects.ability.on('down', function() {sceneRef.bufferInput("a")});
            this.keyObjects.cycleright.on('down', function() {sceneRef.bufferInput(">")});
            this.keyObjects.cycleleft.on('down', function() {sceneRef.bufferInput("<")});
        }

        //remove inputs from the buffer when unpressed
        {
            //WASD Movement
            this.keyObjects.right.on('up', function() {sceneRef.debufferInput("r")});
            this.keyObjects.left.on('up', function() {sceneRef.debufferInput("l")});
            this.keyObjects.up.on('up', function() {sceneRef.debufferInput("u")});
            this.keyObjects.down.on('up', function() {sceneRef.debufferInput("d")});
            //Arrow Key Movement
            this.keyObjects.rightArrow.on('up', function() {sceneRef.debufferInput("r")});
            this.keyObjects.leftArrow.on('up', function() {sceneRef.debufferInput("l")});
            this.keyObjects.upArrow.on('up', function() {sceneRef.debufferInput("u")});
            this.keyObjects.downArrow.on('up', function() {sceneRef.debufferInput("d")});
            //Other Actions
            this.keyObjects.jump.on('up', function() {sceneRef.debufferInput("j")});
            this.keyObjects.ability.on('up', function() {sceneRef.debufferInput("a")});
            this.keyObjects.cycleright.on('up', function() {sceneRef.debufferInput(">")});
            this.keyObjects.cycleleft.on('up', function() {sceneRef.debufferInput("<")});
            //Pause
            this.keyObjects.pause.on('up', function() {sceneRef.forcePause()});
        }
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
        let acc = 0.075;
        if (this.anPhiast.isGrounded){
            acc += 0.075;
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
       let acc = 0.075;
        if (this.anPhiast.isGrounded){
            acc += 0.075;
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
        this.anPhiast.canJump = false;
        this.anPhiast.deltay = 5;
    }

    /** OLD
     * @param {number} dt deltatime
     */
    handleGravity(dt) {
        this.gravity = 0.2;
        this.anPhiast.airResistance = 1.05;
        let dY = this.anPhiast.deltay;
        if (this.buffer.includes("j") && dY > 0){
            dY -= this.gravity * .25 * dt;
        }
        else {
            dY -= this.gravity * 2 * dt;
        }
        dY *= 1 / this.anPhiast.airResistance;
        this.anPhiast.deltay = dY;
        //this.debugText.text = this.anPhiast.deltay;
    }

    /** Handles accel/decel and eventual movement
     * @param {number} deltatime the time in milliseconds since the last update
     */
    movePlayer(deltatime){
        let dX = this.anPhiast.deltax; // initialise local variable to avoid corrupting class member
        if (this.anPhiast.currentPower == "pot"){
            dX *= 0.98;
            if (Math.abs(dX) >= 3.5){
                this.anPhiastPot.isCharging = true;
                this.anPhiastPot.setTint(0xff4000);
                this.anPhiastPot.cooldown = 30;
            }
            else {
                this.anPhiastPot.cooldown -= deltatime;
                if (this.anPhiastPot.cooldown <= 0){
                    this.anPhiastPot.isCharging = false;
                    this.anPhiastPot.clearTint();
                }
            }
        }
        else {
            dX *= 0.95; // deccelerate
        }
        if (dX >= 0.001) {
            dX -= 0.001;
        }
        else if (dX <= -0.001) {
            dX += 0.001;
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
        // this.debugText.text = this.buffer.length; DEBUG
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
        
        //move
        this.anPhiast.y -= this.anPhiast.deltay;

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
                    if (this.anPhiastPot.isCharging && this.anPhiast.currentPower == "pot"){
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
        
        this.layerDebug.forEachTile(tile => {
            if (tile.index == -1) return;
            //tile.tint = 0xff0000;
            const tBounds = {
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
            const containsMidX = (tBounds.l <= boundsPlayer.x - (boundsPlayer.w * (1 / 8)) 
                && tBounds.r >= boundsPlayer.x - (boundsPlayer.w * (1 / 8)))
                || (tBounds.l <= boundsPlayer.x + (boundsPlayer.w * (1 / 8)) 
                && tBounds.r >= boundsPlayer.x + (boundsPlayer.w * (1 / 8)))
                || (tBounds.l <= boundsPlayer.x && tBounds.r >= boundsPlayer.x);
            const containsPhiastY = (tBounds.t <= boundsPlayer.y && tBounds.b >= boundsPlayer.y) || containsPhiastB || containsPhiastT;
            const containsPhiastX = (tBounds.l <= boundsPlayer.x && tBounds.r >= boundsPlayer.x) || containsPhiastL || containsPhiastR;

            if (tile.index == 42) {
                if (containsPhiastX && containsPhiastY){
                    this.wKey.setVisible(true);
                    this.wKey.setPosition(tBounds.l, tBounds.t - tBounds.s);
                    this.upKey.setVisible(true);
                    this.upKey.setPosition(tBounds.r, tBounds.t - tBounds.s);

                    if (this.buffer.includes("u")){
                        let message = "";
                        if (tBounds.r < 20){
                            message = "Wow, you made that difficult jump... or you just climbed.";
                        }
                        else if (tBounds.r < 70){
                            message = "WASD or Arrow Keys to move.";
                        }
                        else if (tBounds.r < 250){
                            message = "Space to jump, hold it down to jump higher."
                        }
                        else {
                            message = "congrats! Did you know you can climb walls?"
                        }
                        this.debugText.setVisible(true);
                        this.debugText.text = message;
                        this.debugText.setPadding(50,25,25,50);
                        this.debugText.setFixedSize(1000, 100);
                        this.debugText.setBackgroundColor("#082060a8");
                        this.debugText.setFontSize("24px");
                        //this.debugText.tintFill = true;
                        this.debugText.setOrigin(0.5);
                        this.textBoxFadeOut = 200;
                    }
                }
                return;
            }

            if (containsPhiastB && (containsMidX || containsPhiastX) && this.anPhiast.deltay <= 0) {
                if (containsMidX) {
                    if (curY > tBounds.t){
                        curY = tBounds.t - cPad;
                        this.anPhiast.y = curY;
                    }
                }
                if (containsPhiastX){
                    isCollideY = true;
                }
                //this.debugText.text = "land";
            }
            else if (containsMidX && containsPhiastT && this.anPhiast.deltay >= 0) {
                isCollideUnderPlat = true;
                curY = tBounds.b + boundsPlayer.h;
            }
            else if (containsPhiastY && (containsPhiastR || containsPhiastL)) {
                if (containsPhiastR && this.anPhiast.deltax >= 0) {
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
                if (containsPhiastL && this.anPhiast.deltax <= 0) {
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

        // this.debugText.text = this.anPhiast.deltax; DEBUG
        if (this.anPhiast.y > 800) {
            this.respawnAnPhiast();
        }

        const containsPotIconX = this.anPhiast.getTopLeft().x < this.potIcon.x && this.anPhiast.getBottomRight().x > this.potIcon.x;
        const containsPotIconY = this.anPhiast.getTopLeft().y < this.potIcon.y && this.anPhiast.getBottomRight().y > this.potIcon.y;
        if (containsPotIconX && containsPotIconY && !this.anPhiast.collectedPowers.includes("pot")){
            this.anPhiast.collectedPowers.push("pot");
            this.anPhiast.currentPower = "pot";
            this.healthbar.setScale(10, 5);
            this.healthbar.setOrigin(0.5, 0.5);
            this.anPhiast.setVisible(false);
            this.anPhiastPot.setVisible(true);
        }
        this.anPhiastPot.setPosition(this.anPhiast.x, this.anPhiast.y);
        this.anPhiastPot.setFlip(this.anPhiast.flipX);
    }

    damagePhiast() {
        if (this.anPhiast.currentPower == "pot"){
            this.anPhiast.health -= 1;
        }
        else {
            this.anPhiast.health -= 2;
        }

        if (this.anPhiast.health < 0) {
            this.respawnAnPhiast();
        }
        this.healthbar.setCrop(0, 0, this.anPhiast.health, 12);
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
            this.layerDebug.forEachTile(tile => {
                if (tile.index == -1 || tile.index == 42) return;
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
                    //this.debugText.text = "land";
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
            if (!collideY){ curY = 800 }
            enemy.setPosition(curX, curY);
        }, this);
    }

    respawnAnPhiast() {
        this.anPhiast.setPosition(this.TILESIZE * this.anPhiast.startingTile.x, this.TILESIZE * this.anPhiast.startingTile.y);
        this.anPhiast.collectedPowers = [];
        this.anPhiast.currentPower = "none";
        this.anPhiast.collectedPowers.push(this.anPhiast.currentPower);
        this.anPhiast.setVisible(true);
        this.anPhiastPot.setVisible(false);
        this.anPhiast.isGrounded = false;
        this.anPhiast.canJump = false;
        this.anPhiast.deltax = 0;
        this.anPhiast.deltay = 0;
        this.anPhiast.health = 64;
        this.healthbar.setScale(5, 5);
        this.healthbar.setOrigin(1, 0.5);
        this.healthbar.setCrop(0, 0, 64, 12);
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
        //this.debugText.text = debug.toLocaleString();
    }

    unexpectedError() {
        this.add.text(0, 0, 'error encountered', { fontSize: '16px', fill: '#FFF' });
        this.debugText.text = "error";
    }

    update() {
        const prevTime = this.curTime;
        this.curTime = Date.now();
        const deltatime = (this.curTime - prevTime) * this.MS_TO_FPS; //should be around 1

        this.coyoteTime -= deltatime;
        this.textBoxFadeOut -= deltatime;
        if (this.coyoteTime < 0){
            this.coyoteTime = 0;
            this.anPhiast.canJump = false;
        }
        if (this.textBoxFadeOut < 0){
            this.textBoxFadeOut = 0;
            this.debugText.setVisible(false);
        }

        this.movePlayer(deltatime);
        this.moveAllEnemies();
        //this.background.tilePositionX += 2;
    }
}