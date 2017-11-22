
function openNav_user() {
    document.getElementById("user").style.width = "200px";
}

function closeNav_user() {
    document.getElementById("user").style.width = "0";
}


function openNav_network() {
    document.getElementById("network").style.width = "200px";
}

function closeNav_network() {
    document.getElementById("network").style.width = "0";
}


// Slider1
var prob = document.getElementById("probability");
var output = document.getElementById("demo");
output.innerHTML = prob.value;

prob.oninput = function () {
    output.innerHTML = this.value;
}

// Slider2
var damage = document.getElementById("damage");
var outputd = document.getElementById("demod");
outputd.innerHTML = 'mittel';

damage.oninput = function (i) {
    console.log(i.target)
    if (parseInt(this.value) === 1) {
        console.log(outputd)

        outputd.innerHTML = 'sehr gering';
    } else if (parseInt(this.value) === 2) {
        console.log(outputd)

        outputd.innerHTML = 'gering';
    } else if (parseInt(this.value) === 3) {
        console.log(outputd)

        outputd.innerHTML = 'mittel';
    } else if (parseInt(this.value) === 4) {
        console.log(outputd)

        outputd.innerHTML = 'hoch';
    } else if (parseInt(this.value) === 5) {
        console.log(outputd)

        outputd.innerHTML = 'sehr hoch';

    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
var decision = getRandomInt(0, 100)
console.log(decision)


var good=document.getElementById('good');
var ok=document.getElementById('ok');
var stop=document.getElementById('stop');
if (decision >= 0 && decision <= 30) {
    good.style.display = "block";
} else if (decision >= 31 && decision <= 60) {
    ok.style.display = "block";
} else {
    stop.style.display = "block";
}