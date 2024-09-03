import { useState, useRef } from "react";
import Recorder from "recorder-js";

export const useAudioRecorder = () => {
  const [recording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const recorderRef = useRef(null);

  const toggleRecording = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (!recorderRef.current) {
      recorderRef.current = new Recorder(audioContextRef.current);
    }

    try {
      if (!recording) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        await recorderRef.current.init(stream);
        await recorderRef.current.start();
        setIsRecording(true);
      } else {
        const { blob } = await recorderRef.current.stop();

        // Convierte el blob en un ArrayBuffer para enviar el audio en binario
        const arrayBuffer = await blob.arrayBuffer();

        // Realiza la transcripción del audio mediante Whisper
        const transcriptionResponse = await fetch("/api/speech-to-text", {
          method: "POST",
          headers: {
            "Content-Type": "audio/wav",
          },
          body: arrayBuffer, // Envía el ArrayBuffer directamente
        });
        const transcription = await transcriptionResponse.json();

        // Realiza la consulta al chat con la transcripción
        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: transcription.transcription }),
        });
        const chatData = await chatResponse.json();

        console.log("Chat: ", chatData.response);

        const token = localStorage.getItem("token");

        // Guarda la conversación y obtiene la respuesta de audio
        const saveConversationResponse = await fetch("/api/saveConversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: chatData.response, token: token }),
        });
        const saveConversationData = await saveConversationResponse.json();

        // Reproduce el audio generado por la IA
        const audioIA = new Audio(saveConversationData.audioUrl);
        audioIA.play();

        setIsRecording(false);
      }
    } catch (error) {
      console.error("Error during processing:", error);
      alert(`Error during processing: ${error.message || error.name}`);
      setIsRecording(false);
    }
  };

  return {
    recording,
    toggleRecording,
  };
};
