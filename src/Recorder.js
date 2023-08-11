
import React, { useEffect, useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

const Recorder = () => {

    const { status, startRecording, stopRecording, mediaBlobUrl } =
        useReactMediaRecorder({ audio: true });

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            BlobPropertyBag: { type: "audio/wav" }
        })
    }, [mediaBlobUrl]);

    async function setAudio() {
        stopRecording();
        const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
        console.log(audioBlob);
        const audiofile = new File([audioBlob], "audiofile.wav", { type: "audio/wav" })
        console.log(audiofile);
    }
    return (
        <div>
            <p>{status}</p>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={setAudio}>Stop Recording</button>
            {/* <video src={mediaBlobUrl} controls autoPlay loop /> */}
        </div>
    );
};

export default Recorder;