// ecgController.js - Ultra-Realistic ECG Generator
import { broadcastECG } from "../sockets/socket.js";

const LEAD_NAMES = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];

let liveInterval = null;
let summaryInterval = null;
let BUFFER = [];
let timeIndex = 0;
let currentHeartRate = 75 + Math.random() * 17; // 75-92 bpm

// ECG waveform parameters matching your image
const ECG_PARAMS = {
  get heartRate() { return currentHeartRate; },
  baseline: 1.7,           // Baseline around 1.7 like in your image
  p_wave: { 
    amplitude: 0.15,       // Small rounded P wave
    duration: 0.08 
  },
  qrs_complex: { 
    q_depth: -0.6,         // Deep Q dip
    r_height: 1.2,         // TALL sharp R spike (above baseline)
    s_depth: -0.7,         // Deep S dip (below baseline)
    duration: 0.08 
  },
  t_wave: { 
    amplitude: 0.35,       // Moderate rounded T wave
    duration: 0.16 
  },
  noise: 0.015,            // Minimal noise for smooth curves
  baselineWander: 0.03     // Subtle drift
};

// Lead-specific amplitude multipliers
const LEAD_MULTIPLIERS = {
  'I': 1.0, 'II': 1.3, 'III': 0.8,
  'aVR': -0.9, 'aVL': 0.7, 'aVF': 1.1,
  'V1': 0.7, 'V2': 1.0, 'V3': 1.4,
  'V4': 1.6, 'V5': 1.2, 'V6': 0.9
};

/**
 * Generate ultra-realistic ECG waveform matching the reference image
 * @param {number} t - Time in seconds
 * @param {number} multiplier - Lead-specific amplitude multiplier
 * @returns {number} ECG value in mV
 */
function generateECGPoint(t, multiplier = 1.0) {
  const bpm = ECG_PARAMS.heartRate;
  const period = 60 / bpm;
  const phase = (t % period) / period;

  let value = ECG_PARAMS.baseline;
  
  // Subtle baseline wander
  value += ECG_PARAMS.baselineWander * Math.sin(2 * Math.PI * t / 5);

  // P wave (0 to 0.12) - Small rounded bump
  if (phase >= 0.02 && phase < 0.14) {
    const pPhase = (phase - 0.02) / 0.12;
    value += ECG_PARAMS.p_wave.amplitude * Math.sin(Math.PI * pPhase) * multiplier;
  }
  
  // PR segment (0.14 to 0.20) - Flat baseline
  
  // QRS complex (0.20 to 0.30) - Sharp triple spike like your image
  else if (phase >= 0.20 && phase < 0.30) {
    const qrsPhase = (phase - 0.20) / 0.10;
    
    // Q wave - Quick small dip (0 to 0.2)
    if (qrsPhase < 0.2) {
      const qPhase = qrsPhase / 0.2;
      const qValue = ECG_PARAMS.qrs_complex.q_depth * Math.sin(Math.PI * qPhase);
      value += qValue * multiplier;
    }
    // R wave - TALL SHARP SPIKE (0.2 to 0.5)
    else if (qrsPhase >= 0.2 && qrsPhase < 0.5) {
      const rPhase = (qrsPhase - 0.2) / 0.3;
      // Very sharp peak using high power
      const rValue = ECG_PARAMS.qrs_complex.r_height * Math.pow(Math.sin(Math.PI * rPhase), 0.5);
      value += rValue * multiplier;
    }
    // S wave - Quick deep dip (0.5 to 1.0)
    else {
      const sPhase = (qrsPhase - 0.5) / 0.5;
      const sValue = ECG_PARAMS.qrs_complex.s_depth * Math.sin(Math.PI * sPhase);
      value += sValue * multiplier;
    }
  }
  
  // ST segment (0.30 to 0.42) - Return to baseline
  else if (phase >= 0.30 && phase < 0.42) {
    // Gradual return to baseline
    const stPhase = (phase - 0.30) / 0.12;
    value += 0.05 * (1 - stPhase);
  }
  
  // T wave (0.42 to 0.68) - Rounded dome
  else if (phase >= 0.42 && phase < 0.68) {
    const tPhase = (phase - 0.42) / 0.26;
    value += ECG_PARAMS.t_wave.amplitude * Math.sin(Math.PI * tPhase) * multiplier;
  }
  
  // TP segment (0.68 to 1.0) - Return to baseline
  
  // Add minimal noise
  value += (Math.random() - 0.5) * ECG_PARAMS.noise;
  
  // Clamp to realistic range
  value = Math.max(0.5, Math.min(3.5, value));
  
  return +value.toFixed(3);
}

/**
 * Start ultra-realistic ECG simulation
 */
export const startECGSimulation = () => {
  if (liveInterval || summaryInterval) return;
  
  BUFFER = [];
  timeIndex = 0;
  
  // Random heart rate between 75-92 bpm
  currentHeartRate = 75 + Math.random() * 17;
  console.log(`💓 ECG started - Heart Rate: ${Math.round(currentHeartRate)} bpm`);

  const FINAL_INTERVAL = 30 * 1000;
  const EMIT_INTERVAL = 20; // 50Hz for smoother curves like your image
  const TIME_STEP = EMIT_INTERVAL / 1000;

  // Live data emitter
  liveInterval = setInterval(() => {
    const timestamp = Date.now();
    const leads = {};
    
    // Subtle heart rate variation (±1-2 bpm)
    if (Math.random() < 0.02) {
      const variation = (Math.random() - 0.5) * 3;
      currentHeartRate = Math.max(75, Math.min(92, currentHeartRate + variation));
    }
    
    // Generate for each lead
    LEAD_NAMES.forEach(lead => {
      const multiplier = LEAD_MULTIPLIERS[lead];
      leads[lead] = generateECGPoint(timeIndex * TIME_STEP, multiplier);
    });

    const data = { timestamp, leads };
    BUFFER.push(data);
    broadcastECG(data);
    
    timeIndex++;
  }, EMIT_INTERVAL);

  // Summary every 30 seconds
  summaryInterval = setInterval(() => {
    if (BUFFER.length === 0) return;

    const summary = { 
      timestamp: Date.now(), 
      leads: {},
      bpm: Math.round(currentHeartRate)
    };

    LEAD_NAMES.forEach(lead => {
      const values = BUFFER.map(d => d.leads[lead]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      summary.leads[lead] = {
        min: +min.toFixed(3),
        max: +max.toFixed(3),
        avg: +avg.toFixed(3)
      };
    });

    broadcastECG({ type: 'summary', data: summary });
    console.log(`📊 Summary - BPM: ${summary.bpm}, Samples: ${BUFFER.length}`);

    BUFFER = [];
  }, FINAL_INTERVAL);

  console.log("✅ Ultra-realistic ECG simulation started");
};

/**
 * Stop ECG simulation
 */
export const stopECGSimulation = () => {
  if (liveInterval) clearInterval(liveInterval);
  if (summaryInterval) clearInterval(summaryInterval);

  liveInterval = null;
  summaryInterval = null;
  BUFFER = [];
  timeIndex = 0;
  
  currentHeartRate = 75 + Math.random() * 17;

  console.log("🛑 ECG simulation stopped");
};