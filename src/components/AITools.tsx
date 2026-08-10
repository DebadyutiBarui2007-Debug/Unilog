import { useState, useRef, useEffect } from 'react';
import { Mic, Search, MapPin, Image as ImageIcon, Video, Upload, Send, History } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function AITools() {
  const [activeTool, setActiveTool] = useState<'voice' | 'search' | 'maps' | 'image' | 'transcribe' | 'history'>('voice');
  
  return (
    <div className="flex-1 flex flex-col p-8 space-y-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl text-white font-bold uppercase tracking-wider">Multi-modal AI Workspace</h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">Voice reasoning, grounded web search, geolocation specs, and image vision studio</p>
        </div>
      </div>
      
      <div id="ai-tools-switcher" className="flex gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl w-max shadow-lg">
        {[
          { id: 'voice', label: '🎙 Voice Reasoning' },
          { id: 'search', label: '🔍 Grounded Search' },
          { id: 'maps', label: '📍 Facility Location' },
          { id: 'image', label: '🖼 Image Vision Studio' },
          { id: 'transcribe', label: '🎧 Audio Transcribe' },
          { id: 'history', label: '📜 Activity History' }
        ].map((tool) => (
          <button
            key={tool.id}
            id={`ai-tool-btn-${tool.id}`}
            onClick={() => setActiveTool(tool.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTool === tool.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {activeTool === 'voice' && <VoiceChat />}
        {activeTool === 'search' && <WebSearch />}
        {activeTool === 'maps' && <MapsSearch />}
        {activeTool === 'image' && <ImageGen />}
        {activeTool === 'transcribe' && <TranscribeAudio />}
        {activeTool === 'history' && <ActivityHistory />}
      </div>
    </div>
  );
}

// Utility to log activity
const logActivity = async (text: string) => {
  if (!auth.currentUser) return;
  try {
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'messages'), {
      text,
      sender: 'system',
      createdAt: serverTimestamp(),
      userId: auth.currentUser.uid
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};

// Activity History
function ActivityHistory() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'users', auth.currentUser.uid, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  return (
    <div className="flex flex-col h-full space-y-4">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">My Activity Log</h3>
      <div className="flex-1 bg-[#0A0B0E] border border-[#2D2F36] p-4 rounded overflow-y-auto space-y-3">
        {logs.length === 0 && <p className="text-gray-500 font-mono text-xs">No activity yet. (Must be signed in)</p>}
        {logs.map(log => (
          <div key={log.id} className="border-b border-[#1F2937] pb-2 mb-2">
            <span className="text-[10px] text-gray-500 font-mono">{log.createdAt?.toDate().toLocaleString()}</span>
            <p className="text-xs text-gray-300 font-mono mt-1 whitespace-pre-wrap">{log.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Voice Chat (Live API)
function VoiceChat() {
  const [status, setStatus] = useState('Disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startLive = async () => {
    try {
      setStatus('Connecting...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          const buffer = new ArrayBuffer(pcm16.length * 2);
          const view = new DataView(buffer);
          for (let i = 0; i < pcm16.length; i++) {
            view.setInt16(i * 2, pcm16[i], true);
          }
          let binary = '';
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          const base64 = btoa(binary);
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);

      let nextStartTime = 0;
      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio) {
          const binaryString = atob(msg.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          
          const audioBuffer = await outputCtx.decodeAudioData(bytes.buffer.slice(0));
          const source = outputCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputCtx.destination);
          
          const currentTime = outputCtx.currentTime;
          if (nextStartTime < currentTime) nextStartTime = currentTime;
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
        }
        if (msg.interrupted) {
          nextStartTime = 0;
        }
      };

      ws.onopen = () => setStatus('Connected - Speak Now');
      ws.onclose = () => stopLive();
    } catch (e: any) {
      console.error(e);
      setStatus('Error: ' + e.message);
    }
  };

  const stopLive = () => {
    if (wsRef.current) wsRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
    if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
    setStatus('Disconnected');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="w-24 h-24 rounded-full bg-[#1C1E26] flex items-center justify-center border border-[#3B82F6]">
        <Mic className={`w-10 h-10 ${status.includes('Connected') ? 'text-green-500 animate-pulse' : 'text-[#3B82F6]'}`} />
      </div>
      <p className="text-gray-300 font-mono text-sm">{status}</p>
      {status === 'Disconnected' ? (
        <button onClick={startLive} className="bg-[#3B82F6] text-white px-6 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-blue-600">Start Voice Chat</button>
      ) : (
        <button onClick={stopLive} className="bg-red-600 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-red-700">Stop</button>
      )}
    </div>
  );
}

// Web Search
function WebSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResult(data.text);
      await logActivity(`Web Search: ${query}\nResult snippet: ${data.text.substring(0, 50)}...`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-2">
        <input 
          id="ai-search-input"
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Ask anything, powered by Google Search..."
          className="flex-1 bg-[#0A0B0E] border border-[#2D2F36] rounded-sm px-4 py-2 text-sm text-white"
        />
        <button id="ai-search-btn" onClick={search} className="bg-[#3B82F6] text-white px-4 py-2 rounded-sm"><Search size={18} /></button>
      </div>
      <div className="flex-1 bg-[#0A0B0E] border border-[#2D2F36] p-4 rounded text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
        {loading ? 'Searching web...' : result || 'Results will appear here.'}
      </div>
    </div>
  );
}

// Maps Search
function MapsSearch() {
  const [location, setLocation] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location })
      });
      const data = await res.json();
      setResult(data.text);
      await logActivity(`Maps Search: ${location}\nFound: ${data.text.substring(0, 50)}...`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-2">
        <input 
          id="ai-maps-input"
          value={location} onChange={e => setLocation(e.target.value)}
          placeholder="Search for locations (e.g. hardware stores in Chicago)..."
          className="flex-1 bg-[#0A0B0E] border border-[#2D2F36] rounded-sm px-4 py-2 text-sm text-white"
        />
        <button id="ai-maps-btn" onClick={search} className="bg-[#3B82F6] text-white px-4 py-2 rounded-sm"><MapPin size={18} /></button>
      </div>
      <div className="flex-1 bg-[#0A0B0E] border border-[#2D2F36] p-4 rounded text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
        {loading ? 'Searching maps...' : result || 'Map results will appear here.'}
      </div>
    </div>
  );
}

// Image Generation
function ImageGen() {
  const [prompt, setPrompt] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if(data.image) {
        setImgUrl(data.image);
        await logActivity(`Generated Image for prompt: ${prompt}`);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-2">
        <input 
          id="ai-image-input"
          value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="Describe an image to generate..."
          className="flex-1 bg-[#0A0B0E] border border-[#2D2F36] rounded-sm px-4 py-2 text-sm text-white"
        />
        <button id="ai-image-btn" onClick={generate} className="bg-[#3B82F6] text-white px-4 py-2 rounded-sm"><ImageIcon size={18} /></button>
      </div>
      <div className="flex-1 flex items-center justify-center bg-[#0A0B0E] border border-[#2D2F36] rounded overflow-hidden">
        {loading ? <span className="text-gray-500 font-mono text-sm animate-pulse">Generating image...</span> : 
         imgUrl ? <img src={imgUrl} className="max-h-full max-w-full object-contain" /> :
         <span className="text-gray-500 font-mono text-sm">Generated image will appear here.</span>}
      </div>
    </div>
  );
}

// Transcribe Audio
function TranscribeAudio() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
        recorder.onstop = async () => {
          setLoading(true);
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64 })
            });
            const data = await res.json();
            setResult(data.text);
            setLoading(false);
          };
          reader.readAsDataURL(blob);
        };
        recorder.start();
        setRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-center py-8 border-b border-[#2D2F36]">
        <button 
          onClick={toggleRecording} 
          className={`flex items-center gap-2 px-6 py-3 rounded-sm font-bold uppercase tracking-wider text-white ${recording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-[#3B82F6] hover:bg-blue-600'}`}
        >
          <Mic size={18} />
          {recording ? 'Stop Recording' : 'Start Recording Audio'}
        </button>
      </div>
      <div className="flex-1 bg-[#0A0B0E] border border-[#2D2F36] p-4 rounded text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
        {loading ? 'Transcribing...' : result || 'Transcription will appear here.'}
      </div>
    </div>
  );
}
