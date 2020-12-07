let output = document.getElementById('output-lines');
let screen = document.getElementById("canvas");
let ongoingTouches = [];
let presstimer = null;

function startup() {
    screen.addEventListener("touchstart", handleStart, false);
    screen.addEventListener("touchend", handleEnd, false);
    screen.addEventListener("touchcancel", handleCancel, false);
    screen.addEventListener("touchmove", handleMove, false);
}

function handleStart(evt) {
    evt.preventDefault();
    log("Touch.event: start");
    let ctx = screen.getContext("2d");
    let touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        // log("touchstart:" + i + "...");
        ongoingTouches.push(copyTouch(touches[i]));
        let color = colorForTouch(touches[i]);
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fillStyle = color;
        ctx.fill();
        // log("touchstart:" + i + ".");
    }

    presstimer = setTimeout(function() {
        log("Long press detected");
    }, 1000);
}

function handleEnd(evt) {
    evt.preventDefault();
    log("Touch.event: end");
    let ctx = screen.getContext("2d");
    let touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let color = colorForTouch(touches[i]);
        let idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            ctx.lineWidth = 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);  // and a square at the end
            ongoingTouches.splice(idx, 1);  // remove it; we're done
        } else {
            log("Can't figure out which touch to end");
        }
    }

    clearPressTimeout();
}

function handleCancel(evt) {
    evt.preventDefault();
    log("Touch.event: cancel");
    let touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
}

function handleMove(evt) {
    evt.preventDefault();

    let ctx = screen.getContext("2d");
    log("Touch.event: move");
    let touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let color = colorForTouch(touches[i]);
        let idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            log("Continuing touch " + idx);
            ctx.beginPath();
            log("ctx.moveTo(" + ongoingTouches[idx].pageX + ", " + ongoingTouches[idx].pageY + ");");
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            log("ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.stroke();

            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
            log(".");
        } else {
            log("Can't figure out which touch to continue");
        }


        clearPressTimeout();
    }
}

function colorForTouch(touch) {
    let r = touch.identifier % 16;
    let g = Math.floor(touch.identifier / 3) % 16;
    let b = Math.floor(touch.identifier / 7) % 16;
    r = r.toString(16); // make it a hex digit
    g = g.toString(16); // make it a hex digit
    b = b.toString(16); // make it a hex digit
    let color = "#" + r + g + b;
    log("Color for touch with identifier " + touch.identifier + ": " + color);
    return color;
}

function copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        let id = ongoingTouches[i].identifier;

        if (id == idToFind) {
            return i;
        }
    }
    return -1;    // Not found
}

function clearPressTimeout(){
    if (presstimer !== null) {
        clearTimeout(presstimer);
        presstimer = null;
    }
}

function log(msg) {
    output.innerHTML += msg + "<br>";
}

document.addEventListener("DOMContentLoaded", startup);
