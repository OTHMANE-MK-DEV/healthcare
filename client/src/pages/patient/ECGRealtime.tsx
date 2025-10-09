import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { socket } from "@/sockets/socket";
import { useNavigate } from "react-router-dom";
import { startECG, stopECG } from "@/api/ecg";

const ECGRealtime = () => {
  const navigate = useNavigate();
  const [ecgData, setEcgData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [savingStatus, setSavingStatus] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  const dataBufferRef = useRef({});
  const analysisTimerRef = useRef(null);
  const heartRateCalcRef = useRef([]);
  const rawDataBufferRef = useRef([]);
  const lastPeakTimeRef = useRef(0);

  const [patientInfo] = useState({
    name: 'SUPTECH SANTE',
    gender: 'M',
    age: 55,
    patientId: '507f1f77bcf86cd799439011'
  });

  const [settings] = useState({
    gains: 10,
    highOut: '150Hz',
    lowOut: '0.15Hz',
    hum: '60Hz',
    pace: 'ON'
  });
  
  const BUFFER_SIZE = 100;
  const ANALYSIS_DURATION = 30000;
  const LEAD_NAMES = ['I','II','III','aVR','aVL','aVF','V1','V2','V3','V4','V5','V6'];
  
  const LEAD_COLORS = {
    'I': '#e74c3c', 'II': '#3498db', 'III': '#2ecc71',
    'aVR': '#f39c12', 'aVL': '#9b59b6', 'aVF': '#1abc9c',
    'V1': '#e67e22', 'V2': '#34495e', 'V3': '#95a5a6',
    'V4': '#c0392b', 'V5': '#8e44ad', 'V6': '#16a085'
  };

  // Initialize buffers
  useEffect(() => {
    const initialBuffer = {};
    LEAD_NAMES.forEach(lead => initialBuffer[lead] = []);
    dataBufferRef.current = initialBuffer;
    setEcgData(initialBuffer);
  }, []);

  // Socket connection
  useEffect(() => {
    if (!socket.connected) {
      console.log('Connecting socket...');
      socket.connect();
    } else {
      setIsConnected(true);
      console.log('Socket already connected');
    }

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Socket event handlers
  useEffect(() => {
    const handleEcgUpdate = (data) => {
      // Debug logging
      console.log('Received data:', data);
      
      // Check if it's a summary message
      if (data.type === 'summary') {
        console.log('📊 SUMMARY RECEIVED:', data.data);
        setDebugInfo('Summary received!');
        handleAnalysisSummary(data.data);
        return;
      }
      
      // Regular live data
      if (isAnalyzing) {
        updateECGData(data);
        calculateHeartRate(data);
        rawDataBufferRef.current.push(data);
        
        // Update debug info
        if (rawDataBufferRef.current.length % 20 === 0) {
          setDebugInfo(`Collected ${rawDataBufferRef.current.length} data points`);
        }
      }
    };

    socket.on("ecgUpdate", handleEcgUpdate);

    return () => {
      socket.off("ecgUpdate", handleEcgUpdate);
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, [isAnalyzing]);

  useEffect(() => {
    return () => {
      if (isAnalyzing) {
        stopAnalysis();
      }
    };
  }, []);


  
  const handleAnalysisSummary = (summaryData) => {
  console.log('Processing summary:', summaryData);
  console.log('Current heart rate:', heartRate);
  console.log('Peak count:', heartRateCalcRef.current.length);

  // Calculate HR one more time from collected peaks
  let finalBPM = heartRate;
  
  if (heartRateCalcRef.current.length >= 2) {
    const intervals = [];
    for (let i = 1; i < heartRateCalcRef.current.length; i++) {
      intervals.push(heartRateCalcRef.current[i] - heartRateCalcRef.current[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const calculatedBPM = Math.round(60000 / avgInterval);
    
    if (calculatedBPM >= 40 && calculatedBPM <= 180) {
      finalBPM = calculatedBPM;
      console.log('✓ Final calculated BPM:', finalBPM);
    }
  } else {
    console.warn('⚠️ Not enough peaks detected for HR calculation');
  }

  const finalSummary = { ...summaryData, bpm: finalBPM };

  setAnalysisResult(finalSummary);
  stopAnalysis();
  saveECGToDatabase(finalSummary);
};

  // Save ECG to database with detailed error handling
  const saveECGToDatabase = async (summaryData) => {
    console.log('💾 Attempting to save ECG...');
    setSavingStatus('saving');
    setDebugInfo('Saving to database...');
    
    try {
      console.log('Sending data:', {
        signal: summaryData,
        patientId: patientInfo.patientId
      });

      const response = await fetch('http://localhost:5001/api/ecg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signal: summaryData,
          patientId: patientInfo.patientId,
          bpm: summaryData.bpm || heartRate   // store bpm too
        })
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        setSavingStatus('saved');
        setDebugInfo('✓ Saved successfully');
        console.log('✅ ECG saved successfully');
        setTimeout(() => setSavingStatus(''), 5000);
      } else {
        throw new Error(result.error || 'Failed to save ECG');
      }
    } catch (error) {
      console.error('❌ Error saving ECG:', error);
      setSavingStatus('error');
      setDebugInfo(`Error: ${error.message}`);
      setTimeout(() => setSavingStatus(''), 5000);
    }
  };

 // Improved HR calculation
const calculateHeartRate = (data) => {
  if (!data.leads || data.leads['II'] === undefined) return;

  const leadIIValue = data.leads['II'];
  const now = Date.now();

  // Lower threshold to match your signal
  const threshold = 0.05;

  if (leadIIValue > threshold) {
    if (now - lastPeakTimeRef.current > 300) {
      heartRateCalcRef.current.push(now);
      lastPeakTimeRef.current = now;

      if (heartRateCalcRef.current.length > 8) {
        heartRateCalcRef.current.shift();
      }

      if (heartRateCalcRef.current.length >= 2) {
        const intervals = [];
        for (let i = 1; i < heartRateCalcRef.current.length; i++) {
          intervals.push(heartRateCalcRef.current[i] - heartRateCalcRef.current[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = Math.round(60000 / avgInterval);

        if (bpm >= 40 && bpm <= 180) {
          setHeartRate(bpm);
        }
      }
    }
  }
};


  // Update ECG data for charts
  const updateECGData = (data) => {
    if (!data.leads) return;
    
    const newBuffers = { ...dataBufferRef.current };

    LEAD_NAMES.forEach(lead => {
      const leadValue = data.leads[lead];
      if (leadValue === undefined) return;
      
      const newPoint = {
        timestamp: data.timestamp,
        value: leadValue,
        index: (newBuffers[lead]?.length || 0) % BUFFER_SIZE
      };

      const currentData = newBuffers[lead] || [];
      const newData = [...currentData, newPoint];
      if (newData.length > BUFFER_SIZE) newData.shift();

      newBuffers[lead] = newData;
    });

    dataBufferRef.current = newBuffers;
    setEcgData(newBuffers);
  };

  // Start analysis
  const startAnalysis = async () => {
    if (!isConnected) {
      alert("Not connected to server. Please check your connection.");
      return;
    }

    console.log('🎬 Starting analysis...');

    await startECG();
    
    // Clear previous data
    const clearBuffer = {};
    LEAD_NAMES.forEach(lead => {
      clearBuffer[lead] = [];
    });
    dataBufferRef.current = clearBuffer;
    setEcgData(clearBuffer);
    
    // Reset all states
    heartRateCalcRef.current = [];
    rawDataBufferRef.current = [];
    lastPeakTimeRef.current = 0;
    setHeartRate(0);
    setAnalysisResult(null);
    setSavingStatus('');
    setDebugInfo('Analysis started...');
    
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Backup timeout
    analysisTimerRef.current = setTimeout(() => {
      console.log('⏰ Timeout reached');
      if (isAnalyzing) {
        setDebugInfo('Timeout - calculating local summary');
        calculateLocalSummary();
      }
    }, ANALYSIS_DURATION + 2000);
  };

  // Calculate summary locally (backup)
  const calculateLocalSummary = () => {
  console.log('📊 Calculating local summary, data points:', rawDataBufferRef.current.length);

  if (rawDataBufferRef.current.length === 0) {
    alert('No data collected during analysis. Check if backend is sending data.');
    setDebugInfo('No data collected!');
    stopAnalysis();
    return;
  }

  const summary = { timestamp: Date.now(), leads: {} };

  LEAD_NAMES.forEach(lead => {
    const values = rawDataBufferRef.current.map(d => d.leads[lead]).filter(v => v !== undefined);

    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      summary.leads[lead] = {
        min: +min.toFixed(3),
        max: +max.toFixed(3),
        avg: +avg.toFixed(3)
      };
    }
  });

  // Add HR to local summary
  const finalSummary = { ...summary, bpm: heartRate };

  console.log('Local summary:', finalSummary);
  setAnalysisResult(finalSummary);
  setDebugInfo('Local summary calculated');
  stopAnalysis();
  saveECGToDatabase(finalSummary);
};

  // Stop analysis
  const stopAnalysis = async () => {
    console.log('⏹️ Stopping analysis');

    await stopECG();

    setIsAnalyzing(false);
    setAnalysisComplete(true);
    
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-white text-lg font-mono">
          {patientInfo.name} {patientInfo.gender} {patientInfo.age}
        </div>
        <div className="text-white text-lg font-mono">
          Gains x {settings.gains}
        </div>
      </div>
      
      {/* Settings row */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-400 text-sm font-mono">
          HighOut: {settings.highOut} LowOut: {settings.lowOut} Hum: {settings.hum} Pace: {settings.pace}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          } ${isConnected ? 'animate-pulse' : ''}`}></div>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Debug info */}
      {debugInfo && (
        <div className="mb-2 text-xs font-mono text-yellow-400 bg-gray-800 px-2 py-1 rounded">
          Debug: {debugInfo}
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-1 gap-4">
        {/* ECG Charts Grid */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          {LEAD_NAMES.map((lead) => (
            <div key={lead} className="bg-black rounded-lg p-2 border border-gray-700 relative">
              <div className="absolute top-2 left-4 z-10 text-sm font-mono font-bold" style={{ color: LEAD_COLORS[lead] }}>
                {lead}
              </div>
              {analysisResult && analysisResult.leads[lead] && (
                <div className="absolute top-2 right-4 z-10 text-xs font-mono text-green-400">
                  {analysisResult.leads[lead].avg.toFixed(3)}
                </div>
              )}
              <ResponsiveContainer width="100%" height={150}>
                <LineChart
                  data={ecgData[lead] || []}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#333" 
                    horizontal={true} 
                    vertical={false} 
                  />
                  <XAxis 
                    dataKey="index"
                    tick={false}
                    axisLine={{ stroke: '#666' }}
                  />
                  <YAxis 
                    domain={[-1.5, 1.5]}
                    tick={false}
                    axisLine={{ stroke: '#666' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={LEAD_COLORS[lead]}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
        
        {/* Side panel */}
        <div className="w-48 bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-white font-mono text-center mb-2">HR</div>
          <div className={`font-mono text-4xl font-bold ${heartRate > 0 ? 'text-red-500' : 'text-gray-600'}`}>
            {heartRate > 0 ? heartRate : '--'}
          </div>
          <div className="text-white font-mono text-center mt-2">bpm</div>
          
          {isAnalyzing && (
            <div className="mt-4 text-center">
              <div className="text-yellow-400 text-sm font-mono animate-pulse">● Recording...</div>
              <div className="text-gray-400 text-xs font-mono mt-1">30 seconds</div>
            </div>
          )}
          
          {analysisComplete && (
            <div className="mt-4 text-center">
              <div className="text-green-400 text-sm font-mono">✓ Complete</div>
              {savingStatus === 'saving' && (
                <div className="text-blue-400 text-xs font-mono mt-1 animate-pulse">Saving...</div>
              )}
              {savingStatus === 'saved' && (
                <div className="text-green-400 text-xs font-mono mt-1">Saved ✓</div>
              )}
              {savingStatus === 'error' && (
                <div className="text-red-400 text-xs font-mono mt-1">Failed ✗</div>
              )}
            </div>
          )}
          
          <div className="mt-8 flex flex-col gap-2 w-full">
            <button 
              className={`font-mono py-2 rounded transition-colors ${
                isAnalyzing || !isConnected
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={startAnalysis}
              disabled={isAnalyzing || !isConnected}
            >
              {isAnalyzing ? 'ANALYZING...' : 'ANALYZE'}
            </button>
            <button 
              onClick={() => navigate('/patient')} 
              className="bg-gray-700 text-white font-mono py-2 rounded hover:bg-gray-600"
            >
              MENU
            </button>
            <button 
              onClick={() => navigate('/patient')} 
              className="bg-gray-700 text-white font-mono py-2 rounded hover:bg-gray-600"
            >
              EXIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECGRealtime;