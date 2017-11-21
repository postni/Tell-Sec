
function openNav_machine() {
    document.getElementById("machine").style.width = "200px";
}

function closeNav_machine() {
    document.getElementById("machine").style.width = "0";
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

prob.oninput = function() {
  output.innerHTML = this.value;
}

// Slider2
var damage = document.getElementById("damage");
var outputd = document.getElementById("demod");
outputd.innerHTML = damage.value;

damage.oninput = function() {
  
  if(this.value===1){
    outputd.innerHTML = 'schlecht';
  }
    outputd.innerHTML = this.value;
}