import { useState, useRef } from "react";

async function requestMicrophonePermission() {
  try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });

      if (permissionStatus.state === 'granted') {
          console.log('Permiso para usar el micrófono ya concedido');
      } else if (permissionStatus.state === 'prompt') {
          console.log('Se solicitará permiso para usar el micrófono');
          await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
          console.log('Permiso para usar el micrófono denegado');
      }

      permissionStatus.onchange = () => {
          console.log('El estado del permiso ha cambiado:', permissionStatus.state);
      };
  } catch (error) {
      console.error('Error al solicitar el permiso para el micrófono:', error);
  }
}

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  requestMicrophonePermission()

  const handleAudio = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    if (!recording) {
      try {
        // Solicitar permiso para usar el micrófono
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Solo si se obtiene el permiso, inicia la grabación
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.start();
        setRecording(true);
        console.log("Recording");
      } catch (error) {
        audioChunksRef.current = [];
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
        setRecording(false);
        console.error("Error during processing:", error);
        alert(`Error during processing: ${error.message || error.name}`);
      }
    } else {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");

        // Transcribe audio to text
        const transcription = await fetch("/api/speech-to-text", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => data.transcription);

        // Get the response from the chat
        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ prompt: transcription }),
        })
          .then((res) => res.json())
          .then((data) => data.response);

        console.log("Chat: ", chatResponse);

        // Get JWT token
        const token = localStorage.getItem("token");

        // Save conversation and get the audio response URL
        const saveConversationResponse = await fetch("api/saveConversation", {
          method: "POST",
          body: JSON.stringify({ text: chatResponse, token: token }),
        }).then((res) => res.json());

        const audioUrl = saveConversationResponse.audioUrl;

        // Play the audio response
        const audioIA = new Audio(audioUrl);
        audioIA.play();

        // Clean up for the next recording
        audioChunksRef.current = [];
      };

      console.log("Stop recording");
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setRecording(false);
    }
  };

  return { recording, handleAudio };
};
