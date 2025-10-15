export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    layer;
    shapeGraphics;
    debugGraphics;
    controls;

    preload() {
        //this.physics.enableUpdate();
        /* OLD: Phaser doesn't like enums in js ¯\_(ツ)_/¯
        this.DIRECTION = {
            up: 1,
            down: 2,
            right: 3,
            left: 4
        }
        */
        this.FPS = 60;
        this.MS_TO_FPS = this.FPS * .001;
        
        //this.load.image('phiast', 'assets/space.png');
        //this.load.image('logo', 'assets/phaser.png');
        //this.load.atlas('grassTiles', 'assets/tilesets/grassTiles.png', 'assets/tilesets/grassTiles.json');
        this.load.tilemapTiledJSON('levelDebug', 'assets/tilemaps/levelDebug.json');
        this.load.image('grassTiles', 'assets/tilesets/grassTiles.png');
        this.load.spritesheet('phiast', 'assets/anPhiast.png', { frameWidth: 48, frameHeight: 64 });
        this.load.spritesheet('blob', 'assets/blob.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        const sceneRef = this;
        this.TILESIZE = 24;
        /**@type {Number[]} */
        //this.debugArray = [];
        let debugString = "debug";
        this.debugText = this.add.text(5000, 0, debugString, { fontSize: '16px', fill: '#FFF' });
        this.textCam = this.cameras.add(0, 620, 1280, 100, false, "debug");
        this.textCam.startFollow(this.debugText);
        //this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        //const logo = this.add.image(640, 200, 'logo');
        const mapDebug = this.make.tilemap({key:'levelDebug'});
        const tilesDebug = mapDebug.addTilesetImage('grassTiles');
        this.layerDebug = mapDebug.createLayer(0, tilesDebug, 0, 260);
        //const tileBodies = this.physics.add.existing(this.layerDebug.layer.bodies);
        //this.layerDebug.setTintFill(0xff0000);
        
        //this.platforms = [];
        /* for (let i = 0; i < this.layerDebug.layer.width; i++){
            for (let j = 0; j < this.layerDebug.layer.height; j++){
                const testTile = this.layerDebug.getTileAt(i, j, true).index;
                if (testTile != 41 && testTile != -1){
                    const collisionRect = this.physics.add.body(i * 16 + 8, j * 16 + 188, 16, 16);
                    collisionRect.setImmovable(true);
                    collisionRect.debugBodyColor = 0xff0000;
                    collisionRect.debugShowBody = true;
                    collisionRect.checkCollision.down = true;
                    collisionRect.checkCollision.left = true;
                    collisionRect.checkCollision.up = true;
                    collisionRect.checkCollision.right = true;
                    collisionRect.willCollideWith(1);
                    this.platforms.push(collisionRect);
                }
            }
        } */

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
        //this.pixelCam.clampY(360);

        for (let i = 0; i < this.cameras.cameras.length; i++){
            this.cameras.cameras[i].setVisible(false);
        }
        this.pixelCam.setVisible(true);
        this.textCam.setVisible(true);

        this.anPhiast = this.matter.add.sprite(0, 0, 'phiast', 0, { angle: 0, restitution: 0, density: 50 });
        this.anPhiast.startingTile = {x:5, y:11};
        this.anPhiast.setPosition(this.TILESIZE * this.anPhiast.startingTile.x, this.TILESIZE * this.anPhiast.startingTile.y);
        this.anPhiast.setScale(0.5);
        this.anPhiast.isGrounded = true;
        this.anPhiast.maxVelocity = 5;
        this.anPhiast.deltax = 0;
        this.anPhiast.deltay = 0;
        this.anPhiast.setVisible(true);
        this.anPhiast.setBounce(0);
        this.anPhiast.setFixedRotation();
        this.anPhiast.setIgnoreGravity(true);
        this.anPhiast.setOnCollide(function () {this.isGrounded = true;})

        this.pixelCam.startFollow(this.anPhiast);
        /*this.anPhiast.addCollidesWith(1);
        this.anPhiast.body.checkCollision.down = true;
        this.anPhiast.body.checkCollision.left = true;
        this.anPhiast.body.checkCollision.up = true;
        this.anPhiast.body.checkCollision.right = true;*/

        this.enemies = [];
        this.populateEnemies(this.TILESIZE);

        // // Drop bouncy, Matter balls on pointer down
        // this.input.on('pointerdown', function ()
        // {
        //     const worldPoint = sceneRef.input.activePointer.positionToCamera(sceneRef.pixelCam);
        //     for (let i = 0; i < 4; i++)
        //     {
        //         const x = worldPoint.x + Phaser.Math.RND.integerInRange(-5, 5);
        //         const y = worldPoint.y + Phaser.Math.RND.integerInRange(-5, 5);
        //         const frame = Phaser.Math.RND.integerInRange(0, 5);
        //         sceneRef.matter.add.image(x, y, 'blob', 0, { restitution: 1 });
        //     }
        // });

        //this.sample = this.sound.add("sample");
        //this.sample.play();
        
        //anPhiast.anims.create({
            //key: 'idle',
            //frames: this.anims.generateFrameNumbers('anPhiast', { start: 0, end: 2 }),
            //frameRate: 15,
            //repeat: -1
        //});
        //anPhiast.play('idle');
        /*
        this.tweens.add({
            targets: this.anPhiast,
            y: '-=2',
            x: '+=500',
            duration: 5000,
            flipX: true,
            ease: 'Sine.inOut',
            yoyo: true,    
            loop: -1
        });
        */

        this.buffer = [];
        this.addKeyInputs();

        this.curTime = Date.now();
        this.events.on("resume", function() { sceneRef.handleUnpause() });
    }

    /** Adds enemies to the map equal to num
     * @param {number} tile size of tiles
     * @param {number} num number of enemies to add, default 1
     */
    populateEnemies(tile, num = 1) {
        if (num < 1) return;
        num = Math.trunc(num);
        for (let i = 0; i < num; i++) {
            const tilePos = { x:Math.floor(Math.random()*40)/2 + 10, y:11.5 };
            const truePos = { x:tile*tilePos.x, y:tile*tilePos.y};
            const newEnemy = this.add.sprite(truePos.x, truePos.y, 'blob');
            newEnemy.setScale(1.5);
            newEnemy.setOrigin(0.5, 1);
            newEnemy.startingTile = tilePos;
            //this.physics.world.enable(newEnemy);
            this.enemies.push(newEnemy);
            this.debugText.text = tilePos.x;
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
        
        // OLD
        // const arr = this.buffer;
        // if (arr.includes("u") && up.isUp) {
        //     spliceBadInput("u");
        // }
        // if (arr.includes("d") && this.keyObjects.down.isUp) {
        //     spliceBadInput("d");
        // }
        // if (arr.includes("r") && this.keyObjects.right.isUp) {
        //     spliceBadInput("r");
        // }
        // if (arr.includes("l") && this.keyObjects.left.isUp) {
        //     spliceBadInput("l");
        // }
        // //this.debugText.text = this.buffer.toLocaleString();

        // function spliceBadInput(input){
        //     do {
        //         //const l = arr.length
        //         const i = arr.indexOf(input);
        //         arr.splice(i, 1);
        //         //if (l == arr.length) break;
        //     } while (arr.includes(input));
        // } 
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
        this.anPhiast.isGrounded = false;
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
        this.debugText.text = this.anPhiast.deltay;
    }

    /** Handles accel/decel and eventual movement
     * @param {number} deltatime the time in milliseconds since the last update
     */
    movePlayer(deltatime){
        let dX = this.anPhiast.deltax; // initialise local variable to avoid corrupting class member
        dX *= 0.95; // decelerate
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
        if (this.anPhiast.isGrounded){
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
        const collisionArray = [];
        //this.layerDebug.forEachTile(tile => { 
            //if (this.matter.containsPoint(this.matter.getMatterBodies(this.layerDebug), this.anPhiast.getWorldPoint().x, this.anPhiast.getWorldPoint().y)){
                //collisionArray.push(tile);
            //}
            //});
        //const collision = this.matter.containsPoint(collisionArray, this.anPhiast.getWorldPoint().x, this.anPhiast.getWorldPoint().x);
        //if (this.anPhiast.deltay <= 0 && collision) {
            this.anPhiast.isGrounded = true;
            this.anPhiast.deltay = 0;
            this.debugText.text = "ground";
        //}
        //move
        this.anPhiast.x += this.anPhiast.deltax;
        this.anPhiast.y -= this.anPhiast.deltay;
        // this.debugText.text = this.anPhiast.deltax; DEBUG
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
        else if (this.anPhiast.isGrounded && (input == "jump" || input == "space" || input == "j") && !this.buffer.includes("j")){
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
        
        /* DEBUG
        const dt_sec = 1000 / (this.curTime - prevTime);

        this.debugArray.push(dt_sec);
        
        if (this.debugArray.length % 60 == 0){
            let sum = 0;
            for (let i = 0; i < this.debugArray.length; i++){
                sum += this.debugArray[i];
            }
            let avg = sum / this.debugArray.length;
            avg = Math.trunc(avg * 100);
            this.debugArray = [];
            this.debugText.text = avg / 100;
        }
        */

        this.movePlayer(deltatime);
        //this.background.tilePositionX += 2;
    }
    
}
