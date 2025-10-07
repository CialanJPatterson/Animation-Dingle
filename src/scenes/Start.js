export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.DIRECTION = [{
            up: 1,
            down: 2,
            right: 3,
            left: 4
        }]
        this.ERROR_CODES = [{
            moveError: 1
        }]
        this.FPS = 60;
        this.MS_TO_FPS = this.FPS * .001;

        //this.load.image('phiast', 'assets/space.png');
        //this.load.image('logo', 'assets/phaser.png');
        this.load.atlas('grassTiles', 'assets/tilesets/grassTiles.png', 'assets/tilesets/grassTiles.json');
        this.load.tilemapCSV('levelDebug', 'assets/tilemaps/levelDebug.csv');
        this.load.spritesheet('phiast', 'assets/anPhiast.png', { frameWidth: 48, frameHeight: 64 });
    }

    create() {
        const sceneRef = this;
        /**@type {Number[]} */
        //this.debugArray = [];
        let debugString = "debug";
        this.debugText = this.add.text(5000, 0, debugString, { fontSize: '16px', fill: '#FFF' });
        this.textCam = this.cameras.add(0, 620, 1280, 100, false, "debug");
        this.textCam.startFollow(this.debugText);
        //this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        //const logo = this.add.image(640, 200, 'logo');
        const mapDebug = this.add.tilemap('levelDebug',16,16);
        const tilesDebug = mapDebug.addTilesetImage('grassTiles');
        this.map = mapDebug.createLayer(0, tilesDebug, 0, 180);
        //this.map.setTintFill(0xff0000);
        this.platforms = [];
        for (let i = 0; i < this.map.layer.width; i++){
            for (let j = 0; j < this.map.layer.height; j++){
                const testTile = this.map.getTileAt(i, j, true).index;
                if (testTile != 41 && testTile != -1){
                    const collisionRect = this.add.rectangle(i * 16 + 8, j * 16 + 188, 16, 16, 0xff0000, 0.5);
                    this.platforms.push(collisionRect);
                }
            }
        }

        this.anPhiast = this.add.sprite(120, 260, 'phiast');
        this.anPhiast.scale = 0.5;
        this.anPhiast.isGrounded = true;
        this.anPhiast.maxVelocity = 5;
        this.anPhiast.deltax = 0;

        this.primaryCam = this.cameras.main;
        this.pixelCam = this.cameras.add(0, 0, 1280, 720, true, "pixel");
        this.pixelCam.setDeadzone(32, 40);
        this.pixelCam.setLerp(0.4, 0.8);
        this.pixelCam.zoom = 4;
        this.pixelCam.startFollow(this.anPhiast);

        for (let i = 0; i < this.cameras.cameras.length; i++){
            this.cameras.cameras[i].setVisible(false);
        }
        this.pixelCam.setVisible(true);
        this.textCam.setVisible(true);
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

        this.keyObjects = class {};
        
        this.keyObjects.up = this.input.keyboard.addKey("W");
        this.keyObjects.down = this.input.keyboard.addKey("S");
        this.keyObjects.right = this.input.keyboard.addKey("D");
        this.keyObjects.left = this.input.keyboard.addKey("A");
        this.keyObjects.escape = this.input.keyboard.addKey("ESC");
        this.buffer = [];

        //add inputs to the buffer when pressed
        this.keyObjects.right.on('down', function() {sceneRef.bufferInput("r")});
        this.keyObjects.left.on('down', function() {sceneRef.bufferInput("l")});
        this.keyObjects.up.on('down', function() {sceneRef.bufferInput("u")});
        this.keyObjects.down.on('down', function() {sceneRef.bufferInput("d")});

        //remove inputs from the buffer when unpressed
        this.keyObjects.right.on('up', function() {sceneRef.debufferInput("r")});
        this.keyObjects.left.on('up', function() {sceneRef.debufferInput("l")});
        this.keyObjects.up.on('up', function() {sceneRef.debufferInput("u")});
        this.keyObjects.down.on('up', function() {sceneRef.debufferInput("d")});
        this.keyObjects.escape.on('up', function() {sceneRef.forcePause()});
        this.curTime = Date.now();
        

        this.events.on("resume", function() { sceneRef.handleUnpause() });
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

    accelerateRight(dt) {
        let acc = 0.05;
        if (this.anPhiast.isGrounded){
            acc += 0.1;
        }
        acc *= dt;
        this.anPhiast.deltax += acc;
        if (Math.abs(this.anPhiast.deltax) > this.anPhiast.maxVelocity){
            this.anPhiast.deltax = this.anPhiast.maxVelocity;
        }
    }

    accelerateLeft(dt) {
       let acc = 0.05;
        if (this.anPhiast.isGrounded){
            acc += 0.1;
        }
        acc *= dt;
        this.anPhiast.deltax -= acc;
        if (Math.abs(this.anPhiast.deltax) > this.anPhiast.maxVelocity){
            this.anPhiast.deltax = -this.anPhiast.maxVelocity;
        }
    }

    /** Handles accel/decel and eventual movement
     * @param {number} deltatime the time in milliseconds since the last update
     */
    movePlayer(deltatime){
        let dX = this.anPhiast.deltax; // initialise local variable to avoid corrupting class member
        if (dX == 0 && this.buffer.length == 0) {
            //this.anPhiast.play(idle)
            return;
        }
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

        if (this.buffer.includes("r")){
            this.accelerateRight(deltatime);
        }
        if (this.buffer.includes("l")) {
            this.accelerateLeft(deltatime);
        }
        // this.debugText.text = this.buffer.length; DEBUG
        if (this.anPhiast.isGrounded){
            if (this.anPhiast.deltax > 0){
                this.anPhiast.setFlipX(false);
            }
            else if (this.anPhiast.deltax < 0){
                this.anPhiast.setFlipX(true);
            }
        }
        //move
        this.anPhiast.x += this.anPhiast.deltax;
        // this.debugText.text = this.anPhiast.deltax; DEBUG
    }

    /** Adds inputs to the buffer 
     * @param {String} dir directional input to add 
     */
    bufferInput(dir){
        if (dir == "up" || dir == "u" && !this.buffer.includes("u")){
            this.buffer.push("u");
        }
        else if (dir == "down" || dir == "d" && !this.buffer.includes("d")){
            this.buffer.push("d");
        }
        else if (dir == "left" || dir == "l" && !this.buffer.includes("l")){
            this.buffer.push("l");
        }
        else if (dir == "right" || dir == "r" && !this.buffer.includes("r")){
            this.buffer.push("r");
        }
    }

    /** Removes inputs from the buffer 
     * @param {String} dir directional input to remove 
     */
    debufferInput(dir){
        let i = -1;
        if (dir == "up" || dir == "u"){
            i = this.buffer.indexOf("u");
        }
        else if (dir == "down" || dir == "d"){
            i = this.buffer.indexOf("d");
        }
        else if (dir == "left" || dir == "l"){
            i = this.buffer.indexOf("l");
        }
        else if (dir == "right" || dir == "r"){
            i = this.buffer.indexOf("r");
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
