// ecgController.js
import { broadcastECG } from "../sockets/socket.js";

const LEAD_NAMES = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];

let liveInterval = null;
let summaryInterval = null;
let BUFFER = [];

// Start ECG simulation
export const startECGSimulation = () => {
  if (liveInterval || summaryInterval) return; // Prevent multiple intervals
  BUFFER = [];

  const FINAL_INTERVAL = 30 * 1000; // 30 seconds
  const EMIT_INTERVAL = 250; // 4Hz

  // Live data emitter
  liveInterval = setInterval(() => {
    const timestamp = Date.now();
    const leads = {};
    LEAD_NAMES.forEach(lead => {
      leads[lead] = +(Math.random() * 0.3 - 0.15).toFixed(2);
    });

    const data = { timestamp, leads };
    BUFFER.push(data);

    broadcastECG(data);
  }, EMIT_INTERVAL);

  // Summary calculation emitter
  summaryInterval = setInterval(() => {
    if (BUFFER.length === 0) return;

    const summary = { timestamp: Date.now(), leads: {} };

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
    console.log('Summary sent:', summary);

    BUFFER.length = 0; // Clear buffer
  }, FINAL_INTERVAL);

  console.log("✅ ECG simulation started");
};

// Stop ECG simulation
export const stopECGSimulation = () => {
  if (liveInterval) clearInterval(liveInterval);
  if (summaryInterval) clearInterval(summaryInterval);

  liveInterval = null;
  summaryInterval = null;
  BUFFER = [];

  console.log("🛑 ECG simulation stopped");
};
