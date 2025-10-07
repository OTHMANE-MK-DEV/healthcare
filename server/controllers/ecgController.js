// ecgController.js - CORRECTED VERSION
import { broadcastECG } from "../sockets/socket.js";

const LEAD_NAMES = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];

export const startECGSimulation = () => {
  const BUFFER = [];
  const FINAL_INTERVAL = 30 * 1000; // 30 seconds
  const EMIT_INTERVAL = 250; // 4Hz

  // Live data emitter
  setInterval(() => {
    const timestamp = Date.now();
    const leads = {};
    LEAD_NAMES.forEach(lead => {
      leads[lead] = +(Math.random() * 0.3 - 0.15).toFixed(2);
    });

    const data = { timestamp, leads };
    BUFFER.push(data);
    
    // Broadcast live ECG
    broadcastECG(data);
  }, EMIT_INTERVAL);

  // Summary calculation emitter
  setInterval(() => {
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

    // CRITICAL: Send summary with type identifier
    broadcastECG({ type: 'summary', data: summary });
    
    console.log('Summary sent:', summary);

    // Clear buffer
    BUFFER.length = 0;
  }, FINAL_INTERVAL);
};