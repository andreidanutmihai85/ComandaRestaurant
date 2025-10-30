
import React, { useState, useEffect } from 'react';
import { speakNumber } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
import NumpadButton from './components/NumpadButton';
import { BackspaceIcon, SpeakerWaveIcon } from './components/icons';

const App: React.FC = () => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeySelected, setIsKeySelected] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success and update UI to avoid race conditions.
      setIsKeySelected(true);
    }
  };

  const handleNumberClick = (num: string) => {
    if (displayValue.length < 20) {
      setDisplayValue(prev => prev + num);
      setError(null);
    }
  };

  const handleClearClick = () => {
    setDisplayValue('');
    setError(null);
  };
  
  const handleBackspaceClick = () => {
    setDisplayValue(prev => prev.slice(0, -1));
  };

  const handleEnterClick = async () => {
    if (!displayValue || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const base64Audio = await speakNumber(displayValue);
      if (base64Audio) {
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          outputAudioContext,
          24000,
          1,
        );
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.destination);
        source.start();
      } else {
        throw new Error("Received no audio data.");
      }
    } catch (err) {
      console.error("Error speaking number:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      if (errorMessage.includes("Requested entity was not found")) {
        setError("API Key error. Please select a valid key.");
        setIsKeySelected(false); // Re-prompt for key selection
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  if (!isKeySelected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto text-center bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">API Key Required</h1>
            <p className="text-gray-400 mt-2">
              Please select an API key to use the Numpad Speaker.
            </p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Select API Key
          </button>
           <p className="text-xs text-gray-500">
            For more information on billing, visit{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">
              ai.google.dev/gemini-api/docs/billing
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-xs mx-auto">
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-6 space-y-6">
          <div className="bg-gray-900/50 rounded-xl px-4 py-3 text-right h-20 flex flex-col justify-center">
            <span className="text-4xl font-light tracking-wider truncate">{displayValue || '0'}</span>
            {error && <span className="text-xs text-red-400 mt-1 truncate">{error}</span>}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {numpadKeys.map(key => (
              <NumpadButton key={key} onClick={() => handleNumberClick(key)}>
                {key}
              </NumpadButton>
            ))}
            
            <NumpadButton onClick={handleClearClick} className="text-yellow-400">
              C
            </NumpadButton>
            
            <NumpadButton onClick={() => handleNumberClick('0')}>
              0
            </NumpadButton>

            <NumpadButton onClick={handleBackspaceClick}>
              <BackspaceIcon className="h-6 w-6 mx-auto" />
            </NumpadButton>

            <NumpadButton 
              onClick={handleEnterClick} 
              className="col-span-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 disabled:text-gray-400"
              disabled={isLoading || !displayValue}
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2">
                   <SpeakerWaveIcon className="h-6 w-6" />
                   <span>Speak</span>
                </div>
              )}
            </NumpadButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
