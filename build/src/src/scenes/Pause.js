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

        this.buffer = this.registry.get("buffer");
        this.addKeyInputs();
    }
    
    /** Creates the keyObjects class and calls the buffer and debuffer functions
     */
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
            this.keyObjects.pause.on('up', function() {sceneRef.unpause()});
        }
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
        else if (input == "jump" || input == "space" || input == "j" && !this.buffer.includes("j")){
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
        else if (input == "ability" || input == "POWER_KEY" /* TODO: add key */ || input == "a"){
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

    unpause(){
        this.registry.set("buffer", this.buffer);
        this.scene.resume("Start");
        this.scene.sleep();
    }

    update() {

    }
}