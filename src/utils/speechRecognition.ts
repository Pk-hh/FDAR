// Browser Web Speech API helper for mobile/desktop voice dictation

export interface SpeechRecognitionHelper {
  isSupported: boolean;
  start: (onResult: (text: string) => void, onError?: (err: string) => void) => void;
  stop: () => void;
}

export function createSpeechRecognizer(): SpeechRecognitionHelper {
  const isSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  let recognition: any = null;

  if (isSupported) {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
  }

  return {
    isSupported,
    start: (onResult, onError) => {
      if (!recognition) {
        onError?.('Speech recognition is not supported in this browser.');
        return;
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        onError?.(event.error || 'Speech input error');
      };

      try {
        recognition.start();
      } catch (err: any) {
        console.warn('Speech recognition start issue:', err);
      }
    },
    stop: () => {
      try {
        recognition?.stop();
      } catch (e) {}
    },
  };
}
