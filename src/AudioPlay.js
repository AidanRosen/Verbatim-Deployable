import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import './AudioPlay.css';
import { startRecording, stopRecording } from "./Recorder"; // Update the path if needed

var audioElement;

const AudioPlay = () => {
  const [buttonName, setButtonName] = useState("Play");
  const [audio, setAudio] = useState();
  const [file, setFile] = useState();
  const [enhancedBackgroundRemoval, setEnhancedBackgroundRemoval] = useState();
  const [backgroundRemoval, setBackgroundRemoval] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isDestuttering, setIsDestuttering] = useState(false);

  const {
    startRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder
  } = useAudioRecorder();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: true
    });

    if (audioElement) {
      audioElement.pause();
      audioElement = null;
      setButtonName("Play");
    }

    if (audio) {
      audioElement = new Audio(audio);
      audioElement.onended = () => {
        setButtonName("Play");
      };
    }

    if (!recordingBlob) return;
  }, [audio, enhancedBackgroundRemoval, recordingBlob]);

  const processBackgroundRemoval = async () => {
    if (!backgroundRemoval || isProcessing) return;

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", file, "noisy.wav");

    try {
      const response = await axios.post(
        "http://localhost:8000/process",
        formData,
        {
          responseType: "blob"
        }
      );

      const wav = new Blob([response.data], { type: 'audio/wav' });
      const url = window.URL.createObjectURL(wav);
      const result = new Audio(url);
      setEnhancedBackgroundRemoval(result);
      result.play();
    } catch (error) {
      console.error("Error processing background removal:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (audio && buttonName === "Play") {
      audioElement.play();
      setButtonName("Pause");
    } else if (audio && buttonName === "Pause") {
      audioElement.pause();
      setButtonName("Play");
    }
  };

  const playEnhanced = () => {
    enhancedBackgroundRemoval.play();
  };

  const exportAudio = () => {
    if (enhancedBackgroundRemoval) {
      const blob = new Blob([enhancedBackgroundRemoval.src], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'enhanced_audio.wav';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const addFile = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setAudio(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleTranscription = async () => {
    if (!isProcessing) {
      setIsTranscribing(true);

      try {
        const formData = new FormData();
        formData.append("file", file, "noisy.wav");
        const response = await axios.post(
          "http://localhost:8000/transcribe",
          formData
        );
        setTranscript(response.data);

        // Auto-export transcript if background removal is enabled
        if (backgroundRemoval) {
          processBackgroundRemoval();
        }
      } catch (error) {
        console.error("Error during transcription:", error);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleDestuttering = () => {
    // Implement destuttering logic here
  };

  return (
    <div className="audio-play-container">
      <div className="audio-play-left">
        <div className="toggle-switch-container">
          <div className="toggle-switch">
            <label className="switch">
              <input
                type="checkbox"
                onChange={() => setIsTranscribing(!isTranscribing)}
              />
              <span className="slider"></span>
            </label>
            <label className="toggle-label">Transcription</label>
          </div>
          <div className="toggle-switch">
            <label className="switch">
              <input
                type="checkbox"
                onChange={handleDestuttering}
              />
              <span className="slider"></span>
            </label>
            <label className="toggle-label">Destuttering</label>
          </div>
          <div className="toggle-switch">
            <label className="switch">
              <input
                type="checkbox"
                onChange={() => {
                  if (!isProcessing) {
                    setBackgroundRemoval(!backgroundRemoval);
                    processBackgroundRemoval();
                  }
                }}
              />
              <span className={`slider ${isProcessing ? 'processing' : ''}`}></span>
            </label>
            <label className="toggle-label">Background Noise Removal</label>
          </div>
        </div>
      </div>
      <div className="audio-play-right">
        <div className="record-container">
          <input id="fileInput" type="file" onChange={addFile} style={{ display: "none" }} />
          <div className="record-button">
            <div className="record-button-inner">Record</div>
          </div>
          <div className="upload-button" onClick={() => document.getElementById("fileInput").click()}>Upload</div>
        </div>
        <div className="play-buttons">
          <button onClick={handleClick} disabled={!audio || file === null}>
            {buttonName}
          </button>
          {enhancedBackgroundRemoval && (
            <div>
              <button onClick={playEnhanced}>Play Enhanced Audio</button>
              <button onClick={exportAudio}>Export Enhanced Audio</button>
            </div>
          )}
        </div>
        {isTranscribing && (
          <div className="transcription-container">
            <button onClick={handleTranscription} disabled={isProcessing || isRecording}>
              {isTranscribing ? "Transcribing..." : "Transcribe"}
            </button>
          </div>
        )}
      </div>
      <div className="transcript-container">
        <h2>Transcription:</h2>
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default AudioPlay;
