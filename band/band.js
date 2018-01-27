/*
  A Band object represents a frequency band used in a
  contest. The Band object manages the list of stations
  occupying the band and various noise sources (background
  noise, atmospheric noise bursts, and other various
  nasties). When the tuning frequency is set, the
  stations within the maximum bandwidth of the receiver
  are activated and audio from their simulated transmissions
  is sent to the audioSink.

  The Band object manages which of its stations are actually
  "turned on" (and therefore using CPU), so we model the
  frequency of the listener in the band object. This means
  that there can only one listener to each Band object.

  The Band object is responsible for the "rf gain" of all
  of the stations on the band.

  Band frequencies are in Hz offset from 0
 */
var Band = function(bandName) {
  this.bandName = bandName;
  this.cwPitch = 610;  // TODO make this come from the radio
  this.numRunners = 0;
  // TODO remove hardcoded kber list
  this.runners = [];
  this.stations = [];
};

Band.prototype.init = function(context, audioSink) {
  this.context = context;
  this.audioSink = audioSink;

  this.gainNode = context.createGain();
  this.gainNode.gain.value = 1.0;
  this.gainNode.connect(audioSink);

  this.noiseSource = new NoiseSource(this.gainNode);
  this.noiseSource.setEnabled(true);

  this.bandwidth = 30000;

  this.setListenFrequency(0);
}

Band.prototype.populateRandomly = function(stationCount) {
  this.numRunners = stationCount;
  for (var i = 0; i < this.numRunners; i++) {
    var callsign = document.callsigns[Math.floor(Math.random() * document.callsigns.length)];
    this.runners.push(callsign);
  }
  for (var i = 0; i < this.runners.length; i++) {
    this.stations.push(new Station(this.runners[i], "run"));
  }
  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].init(this.context, this.gainNode);
    this.stations[i].setFrequency(Math.random() * this.bandwidth);
    this.stations[i].keyer.setSpeed(Math.floor(Math.random() * 20) + 25);
    // TODO(ggood) don't model repeats this way. Model them as the stations
    // making the decision about when to send. That way, all of the state
    // transitions are initiated by the station or my inbound messages.
    // TODO ggood repeat is station behavior this.stations[i].keyer.setRepeatInterval(Math.random() + 1.5);
    this.stations[i].setRfGain(Math.random());
  }
  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].callCq();
  }

}

Band.prototype.radioDisconnected = function() {
  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].stop();
  }
  this.noiseSource.setEnabled(false);
}


Band.prototype.setListenFrequency = function(value) {
  this.listenFrequency = value;
  for (var i = 0; i < this.stations.length; i++) {
    station = this.stations[i];
    // Determine if we should be hearing this station, and
    // if so, cacluate the pitch.
    offset = station.getFrequency() - this.listenFrequency;
    if ((offset < this.cwPitch * 2) && (offset > -this.cwPitch) ){
      station.keyer.setPitch(offset + this.cwPitch);
      station.unMute();
    } else {
      station.mute();
    }
  }
}

Band.prototype.setNoiseGain = function(value) {
  this.noiseSource.setGain(value);
}

// TODO(ggood) do I need the following
//Band.prototype.startReceivingTransmission(senderCall, frequency, message) {
  // Indicate to the band that the local station is beginning to send
  // the given message at a particular freqeuncy.
//}

Band.prototype.finishReceivingTransmission = function(senderCall, frequency, message) {
  // Indicate to the band that the local station's message is now complete.
  // FInd all stations on the band that could hear this transmission and
  // forward the message to them.
}

Band.prototype.finishReceivingCQ = function(senderCall, frequency) {
  // Indicate to the band that our station has sent a CQ on the given
  // frequency. The band will determine if calling station(s) respond
  // to the CQ.
  // TODO(ggod) for how, just always have one station respond
  this.respondingStation = new Station("N5UM");
  this.respondingStation.setFrequency(frequency);
  this.respondingStation.setMode("sp");
  this.respondingStation.handleMessageEnd("CQ TEST " + senderCall);
}

Band.prototype.handleMessageEnd = function(message, frequency) {
  console.log(this.bandName + " handling message end " + message + " on frequency " + frequency);

  for (var i = 0; i < this.stations.length; i++) {
    offset = this.stations[i].getFrequency() - frequency;
    if (Math.abs(offset) < 100) {
      this.stations[i].handleMessageEnd(message);
    }
  }
}
