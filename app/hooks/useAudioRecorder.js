import { useState, useRef } from "react";
import Recorder from "recorder-js";

export const useAudioRecorder = () => {
  const [recording, setIsRecording] = useState(false);
  const audioContextRef = useRef(null);
  const recorderRef = useRef(null);
  const [processingAudio, setProcessingAudio] = useState(false);

  const toggleRecording = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (!recorderRef.current) {
      recorderRef.current = new Recorder(audioContextRef.current);
    }

    async function startRecording() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      await recorderRef.current.init(stream);
      await recorderRef.current.start();
      setIsRecording(true);
    }

    async function stopRecordAndGetBlob() {
      const { blob } = await recorderRef.current.stop();
      recorderRef.current.stream.getTracks().forEach((track) => track.stop());
      const arrayBuffer = await blob.arrayBuffer();
      return arrayBuffer;
    }

    async function getTranscription(buffer) {
      const transcriptionResponse = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
        },
        body: buffer,
      })
        .then((res) => res.json())
        .then((data) => data.transcription);

      return transcriptionResponse;
    }

    async function getChatTextResponse(transcription) {
      const chatTextResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: transcription }),
      })
        .then((res) => res.json())
        .then((data) => data.response);

      return chatTextResponse;
    }

    async function getAudioResponse(chatTextResponse) {
      const audioResponse = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: chatTextResponse }),
      })
        .then((res) => res.json())
        .then((data) => data.dataBuffer);
      return audioResponse;
    }

    async function saveConversation(chatTextResponse, token) {
      const saveConversationResponse = await fetch("/api/saveConversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: chatTextResponse, token }),
      });
      const saveConversationData = await saveConversationResponse.json();
      return saveConversationData;
    }

    async function playAudio(dataBuffer) {
      console.log(dataBuffer);

      //console.time("playAudioExecutionTime");
      const audioBuffer = new Uint8Array(Object.values(dataBuffer)).buffer;
      const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      //console.timeEnd("playAudioExecutionTime");
    }

    try {
      if (!recording) {
        await startRecording();
      } else {
        setProcessingAudio(true);
        const buffer = await stopRecordAndGetBlob();
        const transcription = await getTranscription(buffer);
        const chatResponse = await getChatTextResponse(transcription);
        const audioResponse = await getAudioResponse(chatResponse);
        const token = localStorage.getItem("token");
        if (token) {
          // Obtiene el audio de la IA, el audio lo guarda en UploadCare y asocia
          // un usuario a una url de UploadCare y reproduce el audio
          const { message } = await saveConversation(
            audioResponse,
            chatResponse,
            token
          );
          console.log(message);
        }
        playAudio(audioResponse);
        setIsRecording(false);
        setProcessingAudio(false);
      }
    } catch (error) {
      console.error("Error handle recording:", error);
      alert(`Error handle recording: ${error.message || error.name}`);
      setIsRecording(false);
      setProcessingAudio(false);
    }
  };

  return {
    recording,
    toggleRecording,
    processingAudio,
    setProcessingAudio,
  };
};
