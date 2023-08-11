// Transcription.js
export const startTranscription = (setTranscription) => {
    const recognition = new window.SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
    };
    recognition.start();
  };
  