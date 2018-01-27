// Create the clobal audio co ntext
context = new (window.AudioContext || window.webkitAudioContext)();

// Some cross-platform bulletproofing
if (!context.createGain) {
  context.createGain = context.createGainNode;
}
if (!context.createDelay)
  context.createDelay = context.createDelayNode;
if (!context.createScriptProcessor)
  context.createScriptProcessor = context.createJavaScriptNode;

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  function( callback ){
  window.setTimeout(callback, 1000 / 60);
};
})();
// end cross-platform bulletproofing

var stn1 = new Station("F5IN", "sp");
stn1.init(context, context.destination);
var stn2 = new Station("W6YX", "sp");
stn2.init(context, context.destination);

setPitch = function(newPitch, station) {
  if (!isNaN(newPitch)) {
    station.keyer.setPitch(newPitch);
  }
}

setSpeed = function(newSpeed, station) {
  if (!isNaN(newSpeed)) {
    station.keyer.setSpeed(newSpeed);
  }
}

setGain = function(newGain, station) {
  if (!isNaN(newGain)) {
    newGain = newGain / 100.0;
    station.keyer.setMonitorGain(newGain);
  }
}

setNoiseGain = function(newGain) {
  if (!isNaN(newGain)) {
    newGain = newGain / 100.0;
  }
}

$( document ).ready(function() {
  console.log("READY");
  setPitch($('#pitch1').val(), stn1);
  setSpeed($('#speed1').val(), stn1);
  setGain($('#gain1').val(), stn1);

  setPitch($('#pitch2').val(), stn2);
  setSpeed($('#speed2').val(), stn2);
  setGain($('#gain2').val(), stn2);

});

$(function() {

  $("#send1").click(function() {
    if (stn1.keyer.isSending()) {
        console.log("Can't send now, keyer 1 sending");
    } else {
        stn1.keyer.send(document.getElementById("send_text1").value);
    }
  });

  $("#send2").click(function() {
    console.log("click 2");
    if (stn2.keyer.isSending()) {
        console.log("Can't send now, keyer 2 sending");
    } else {
        stn2.keyer.send(document.getElementById("send_text2").value);
    }
  });

  $("#cancel1").click(function() {
    stn1.keyer.abortMessage();
  });

  $("#cancel2").click(function() {
    stn2.keyer.abortMessage();
  });

  $("#pitch1").on('input', function() {
    newPitch = $('#pitch1').val();
    setPitch(newPitch, stn1);
  });

  $("#pitch2").on('input', function() {
    newPitch = $('#pitch2').val();
    setPitch(newPitch, stn2);
  });

  $("#speed1").on('input', function() {
    newSpeed = $('#speed1').val();
    setSpeed(newSpeed, stn1);
  });

  $("#speed2").on('input', function() {
    newSpeed = $('#speed2').val();
    setSpeed(newSpeed, stn2);
  });

  $("#gain1").on('input', function() {
    newGain = $('#gain1').val();
    if (newGain > 100) {
      newGain = 100;
      $("#gain1").val(newGain);
    }
    setGain(newGain, stn1);
  });

  $("#gain2").on('input', function() {
    newGain = $('#gain2').val();
    if (newGain > 100) {
      newGain = 100;
      $("#gain2").val(newGain);
    }
    setGain(newGain, stn2);
  });

  $("#noise").change(function() {
    noise.setEnabled(this.checked);
  });

  $("#noise_gain").on('input', function() {
    newGain = $('#noise_gain').val();
    if (newGain > 100) {
      newGain = 100;
      $("#noise_gain").val(newGain);
    }
    setNoiseGain(newGain);
  });
});
