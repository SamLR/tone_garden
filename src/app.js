/*
 * Based on https://github.com/mdn/violent-theremin/blob/gh-pages/scripts/app.js
 */

(function () {
    'use strict';
    // constants
    var WIDTH = 800;
    var HEIGHT = 600;
    var BOX_SIZE = 50;
    var MAX_GAIN = 0.02;
    var MIN_FREQUENCY = 2000;
    var MAX_FREQUENCY = 5000;

    // derived values
    var freqScaler = (MAX_FREQUENCY - MIN_FREQUENCY)/WIDTH;
    var gainScaler = 1.0/HEIGHT;

    // Set up our canvas & context
    var canvas = document.querySelector('#garden');
    var canvasCtx = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // Create audio context (check which version to use)
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Have individual tone boxes attach to a master volume controller
    var masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = MAX_GAIN;

    // List of the current tone boxes
    var toneBoxes = [];

    // Mute functionality
    function mute() {
        if (muteBtn.getAttribute('data-muted') === "false") {
            masterGainNode.disconnect(audioCtx.destination);
            muteBtn.setAttribute('data-muted', 'true');
            muteBtn.innerHTML = "unmute";
        } else {
            masterGainNode.connect(audioCtx.destination);
            muteBtn.setAttribute('data-muted', 'false');
            muteBtn.innerHTML = "mute";
        }
    }
    // get the button
    var muteBtn = document.querySelector('#mute');
    muteBtn.onclick = mute;
    // Run twice to ensure initialised according to index.html
    mute(); 
    mute();

    // Complete reset
    function reset() {
        for (var i = toneBoxes.length - 1; i >= 0; i--) {
            toneBoxes[i].stopTone();
        }

        toneBoxes = [];
        resetCanvas();
    }
    // Initialise the resetBtn
    var resetBtn = document.querySelector('#reset');
    resetBtn.onclick = reset;

    // Function to empty the canvas
    function resetCanvas () {
        canvasCtx.fillStyle = "#FFFFFF";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.strokeRect(1, 1, WIDTH-1, HEIGHT-1);
    }
    // Start as we mean to go on
    resetCanvas();

    // Function that adds or removes the ton boxes
    canvas.onclick = updatePage;
    function updatePage (event) {
        var point = getMousePosition(event);
        var toRemove, box, i;

        resetCanvas();

        for (i = toneBoxes.length - 1; i >= 0; i--) {
            box = toneBoxes[i];

            if (box.contains(point)) {
            // If the clicked point is in a box, flag it for removal
                toRemove = i;
            } else {
            // otherwise just draw the box
                box.draw();
            }
        }

        if (toRemove !== undefined) {
        // If we have a box to remove, shut it up and remove it
            toneBoxes[toRemove].stopTone();
            toneBoxes.splice(toRemove, 1);
        } else {
        // If there is no box to remove, add one and draw it
            box = getToneBoxAtPoint(point, BOX_SIZE);
            toneBoxes.push(box);
            box.draw();
        }
    }

    // Get the mouse position in the canvas co-ordinates
    function getMousePosition (event) {
        return {
            x : event.pageX - canvas.offsetLeft,
            y : event.pageY - canvas.offsetTop
        };
    }

    // Returns a tone box object
    function getToneBoxAtPoint (point, sideLength) {
        var x1 = point.x - sideLength/2;
        var y1 = point.y - sideLength/2;
        var x2 = x1 + sideLength;
        var y2 = y1 + sideLength;
        var oscillatorNode = audioCtx.createOscillator();
        var gainNode = audioCtx.createGain();

        // Initialise the oscillator and gain
        gainNode.gain.value = point.y * gainScaler;
        oscillatorNode.type = 'sine';
        oscillatorNode.frequency.value = point.x * freqScaler;

        // connect everything and bring the noise.
        oscillatorNode.connect(gainNode);
        gainNode.connect(masterGainNode);
        oscillatorNode.start();

        // return the box object
        return {
            // Is the point, p, inside the tone box
            contains: function (p) {
                if ( (x1 < p.x) && (p.x < x2) ) {

                    if ( (y1 < p.y) && (p.y < y2) ) {
                        return true;
                    }
                } 
                return false;
            },
            // Draw the tone box
            draw: function() {
                canvasCtx.fillStyle = "#FF0000";
                canvasCtx.fillRect(x1, y1, sideLength, sideLength);
            },
            // Shut the tone box up
            stopTone: function () {
                oscillatorNode.stop();
                gainNode.disconnect(masterGainNode);
                oscillatorNode.disconnect(gainNode);
            }
        };
    }

}());