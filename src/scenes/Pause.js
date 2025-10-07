export class Pause extends Phaser.Scene {

    constructor() {
        super('Pause');
    }

    preload() {
        this.scene.bringToTop();
    }

    create() {
        const sceneRef = this;
        this.text = this.add.text(640, 240, "PAUSE", { fontSize: '48px', fill: '#FFF' });
        this.text.setOrigin(0.5, 1);
        this.text.setAlign("center");
        this.cameras.cameras[0].setVisible(false);
        this.pauseCam = this.cameras.add(0, 0, 1280, 720, false, "pause");
        this.pauseCam.setVisible(true);

        this.keyObjects = class {};
        
        this.keyObjects.up = this.input.keyboard.addKey("W");
        this.keyObjects.down = this.input.keyboard.addKey("S");
        this.keyObjects.right = this.input.keyboard.addKey("D");
        this.keyObjects.left = this.input.keyboard.addKey("A");
        this.keyObjects.escape = this.input.keyboard.addKey("ESC");
        this.buffer = this.registry.get("buffer");

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
        this.keyObjects.escape.on('up', function() {sceneRef.unpause()});
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

    unpause(){
        this.registry.set("buffer", this.buffer);
        this.scene.resume("Start");
        this.scene.sleep();
    }

    update() {

    }
}