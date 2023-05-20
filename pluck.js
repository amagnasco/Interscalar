// load this after musicmath.js

// setup 
const context = new AudioContext;
const volume = context.createGain();
const panNode = context.createStereoPanner();

// wiring 
volume.connect(panNode);
panNode.connect(context.destination);

// produce a {freqL}hz tone on left then a {freqR} tone on right, for {dur} seconds total
// only plays once, not sure why
pluck2stereo = (freqL,freqR,dur) => {
    // set play button
    const start = html`<button>${"Play "+freqL+" Hz on L then "+freqR+" Hz on R for "+dur+" sec total"}`;
    start.onclick = () => {
      // start engine
      const oscillator = context.createOscillator();
      oscillator.connect(volume);
      oscillator.type = "sine";
      // set frequencies and durations
      oscillator.frequency.setValueAtTime(freqL, 0);
      panNode.pan.setValueAtTime(-1,0);
      oscillator.frequency.setValueAtTime(freqR, dur/2);
      panNode.pan.setValueAtTime(1,dur/2);
      // run through steps
      oscillator.start(0);
      oscillator.stop(dur);
    };
    return start;
  }

// produce a {freqL}hz tone on left then a {freqR} tone on right, for {dur} seconds total
// only plays once, not sure why
pluck2by2 = (freqL,ratioL,freqR,ratioR,dur) => {  
    // set play button
    const start = html`<button>${"Play "+ratioL+"*"+freqL+" Hz (L), "+ratioR+"*"+freqR+" Hz (R), "+dur+"s total"}`;
    start.onclick = () => {
      // start engine
      const oscillator1 = context.createOscillator();
      oscillator1.connect(volume);
      oscillator1.type = "sine";
      const oscillator2 = context.createOscillator();
      oscillator2.connect(volume);
      oscillator2.type = "sine";
      // set frequencies and durations
      oscillator1.frequency.setValueAtTime(freqL, 0);
      oscillator2.frequency.setValueAtTime(freqL*ratioL, 0);
      panNode.pan.setValueAtTime(-1,0);
      oscillator1.frequency.setValueAtTime(freqR, dur/2);
      oscillator2.frequency.setValueAtTime(freqR*ratioR, dur/2);
      panNode.pan.setValueAtTime(1,dur/2);
      // run through steps
      oscillator1.start(0);
      oscillator2.start(0);
      oscillator1.stop(dur);
      oscillator2.stop(dur);
    };
    return start;
  }