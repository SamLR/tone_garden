/*
 * Based on https://github.com/mdn/violent-theremin/blob/gh-pages/scripts/app.js
 */

(function () {
    'use strict';
    // create web audio api context
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // create Oscillator node
    var tones = [];
    var masterGainNode = audioCtx.createGain();
    var BOX_SIZE = 50;
    var MAX_GAIN = 0.02;
    var MIN_FREQUENCY = 2000;
    var MAX_FREQUENCY = 5000;
    var WIDTH = 800;
    var HEIGHT = 600;

    var freqScaler = (MAX_FREQUENCY - MIN_FREQUENCY)/WIDTH;
    var gainScaler = 1.0/HEIGHT;

    masterGainNode.gain.value = MAX_GAIN;

    function addTone (point) {
        var oscillatorNode = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();

        gainNode.gain.value = point.y * gainScaler;

        oscillatorNode.type = 'sine';
        oscillatorNode.frequency.value = point.x * freqScaler;

        oscillatorNode.connect(gainNode);
        gainNode.connect(masterGainNode);

        oscillatorNode.start();

        // Return a clean up function
        return function () {
            oscillatorNode.stop();
            gainNode.disconnect(masterGainNode);
            oscillatorNode.disconnect(gainNode);
        };
    }

    var mute = document.querySelector('#mute');
    mute.onclick = function() {
        if (mute.getAttribute('data-muted') === "false") {
            masterGainNode.disconnect(audioCtx.destination);
            mute.setAttribute('data-muted', 'true');
            mute.innerHTML = "unmute";
        } else {
            masterGainNode.connect(audioCtx.destination);
            mute.setAttribute('data-muted', 'false');
            mute.innerHTML = "mute";
        }
    };

    var reset = document.querySelector('#reset');
    reset.onclick = function() {
        for (var i = tones.length - 1; i >= 0; i--) {
            tones[i].removeBox();
        }

        tones = [];
        resetCanvas();
    };

    var canvas = document.querySelector('#garden');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var canvasCtx = canvas.getContext('2d');

    function resetCanvas () {
        canvasCtx.fillStyle = "#FFFFFF";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.strokeRect(1, 1, WIDTH-1, HEIGHT-1);
    }

    resetCanvas();
    canvas.onclick = updatePage;

    function updatePage (e) {
        var bounding = canvas.getBoundingClientRect();
        var toRemove = null;
        var point = {
            x : e.clientX - canvas.offsetLeft,
            y : e.clientY - canvas.offsetTop
        };
        var box = {
            x1: point.x - BOX_SIZE/2,
            y1: point.y - BOX_SIZE/2,
            x2: point.x + BOX_SIZE/2,
            y2: point.y + BOX_SIZE/2
        };
        var tt, i;

        for (i = tones.length - 1; i >= 0; i--) {
            tt = tones[i];
            if (isInBox(point, tt.box)) {
                tt.removeBox();
                toRemove = i;
                break;
            }
        }

        if (toRemove !== null) {
            tones.splice(toRemove, 1);
        } else {
            tones.push({
                box:       box,
                removeBox: addTone(point)
            });
        }

        resetCanvas();
        canvasCtx.fillStyle = "#FF0000";
        for (i = tones.length - 1; i >= 0; i--) {
            tt = tones[i];
            canvasCtx.fillRect(tt.box.x1, tt.box.y1, BOX_SIZE, BOX_SIZE);
        }
    }

    function isInBox(point, box) {
        if (box.x1 < point.x && point.x < box.x2) {
            if (box.y1 < point.y && point.y < box.y2) {
                return true;
            }
        } 
        return false;
    }

}());