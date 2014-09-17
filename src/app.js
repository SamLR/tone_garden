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
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;

    var CurX, CurY;

    oscillator.connect(gainNode);
    
    gainNode.gain.value = initialGain;

    oscillator.type = 'square';
    oscillator.frequency.value = 3000; // value in hertz
    oscillator.start();

    var mute = document.querySelector('#mute');
    mute.onclick = function() {
        if (mute.getAttribute('data-muted') === "false") {
            gainNode.disconnect(audioCtx.destination);
            mute.setAttribute('data-muted', 'true');
            mute.innerHTML = "unmute";
        } else {
            gainNode.connect(audioCtx.destination);
            mute.setAttribute('data-muted', 'false');
            mute.innerHTML = "mute";
        }
    };

    var canvas = document.querySelector('#garden');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var canvasCtx = canvas.getContext('2d');

    canvas.onclick = updatePage;

    function updatePage (e) {
        var bounding = canvas.getBoundingClientRect();
        CurX = e.clientX - canvas.offsetLeft;
        CurY = e.clientY - canvas.offsetTop;

        console.log(CurX, CurY);

        canvasCtx.fillStyle = "#FF0000";
        canvasCtx.fillRect(CurX-25, CurY-25, 50, 50);
    }

}());