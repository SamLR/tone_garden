/*
 * Based on https://github.com/mdn/violent-theremin/blob/gh-pages/scripts/app.js
 */

(function () {
    'use strict';
    // create web audio api context
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // create Oscillator node
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    var initialGain = 0.05;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.value = initialGain;

    oscillator.type = 'square';
    oscillator.frequency.value = 3000; // value in hertz
    oscillator.start();

    var mute = document.querySelector('#mute');
    mute.onclick = function() {
        if (gainNode.gain.value) {
            gainNode.disconnect(audioCtx.destination);
            mute.innerHTML = "unmute";
        } else {
            gainNode.connect(audioCtx.destination);
            mute.innerHTML = "mute";
        }
    };
}());