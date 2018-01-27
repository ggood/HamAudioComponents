
keyer = null;
speed = 25;

$(function() {

  $("#send").click(function() {
    if (keyer == null) {
      context = new (window.AudioContext || window.webkitAudioContext)
      keyer = new Keyer();
      keyer.init(context, context.destination);
      keyer.setMonitorGain(1.0);
    }
    if (!keyer.isSending()) {
      keyer.setSpeed(speed);
      keyer.send(document.getElementById("send_text").value);
    }
  });

  $("#cancel").click(function() {
    if (keyer != null) {
      keyer.stop();
      keyer = null
    }
  });

  $("#pitch").on('input', function() {
    newPitch = $('#pitch').val();
    if (!isNaN(newPitch)) {
      keyer.setPitch(newPitch);
    }
  });

  $("#speed").on('input', function() {
    newSpeed = $('#speed').val();
    if (!isNaN(newSpeed)) {
      speed = newSpeed;
    }
  });
});
