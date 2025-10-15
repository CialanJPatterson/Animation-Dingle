import { Start } from './scenes/Start.js';
import { Pause } from './scenes/Pause.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: true,
    physics: {
        default: 'matter',
        arcade: {
        x: 0,
        y: 0,
        gravity: {
        x: 0,
        y: 2
        },
        checkCollision: {
        up: true,
        down: true,
        left: true,
        right: true
        },
        customUpdate: true
        }
    },
    scene: [
        Start,
        Pause
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);