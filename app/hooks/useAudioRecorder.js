import { useState, useRef, useEffect } from "react";

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

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      requestMicrophonePermission();
    }
  }, []);

  const handleAudio = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        let options = {};

        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
        } else {
          console.warn('Ningún tipo de MIME específico es compatible, se usará el formato predeterminado.');
        }

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        // Aquí es donde se agrega la espera de un minuto antes de comenzar la grabación
        mediaRecorder.start(1000 * 60);
        setRecording(true);
        console.log("Recording started");
      } catch (error) {
        audioChunksRef.current = [];
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        setRecording(false);
        console.error("Error during processing:", error);
        alert(`Error during processing: ${error.message || error.name}`);
      }
    } else {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current.mimeType || "audio/webm",
        });

        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");

        const transcription = await fetch("/api/speech-to-text", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => data.transcription);

        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ prompt: transcription }),
        })
          .then((res) => res.json())
          .then((data) => data.response);

        console.log("Chat: ", chatResponse);

        const token = localStorage.getItem("token");

        const saveConversationResponse = await fetch("api/saveConversation", {
          method: "POST",
          body: JSON.stringify({ text: chatResponse, token: token }),
        }).then((res) => res.json());

        const audioUrl = saveConversationResponse.audioUrl;

        const audioIA = new Audio(audioUrl);
        audioIA.play();

        audioChunksRef.current = [];
      };

      console.log("Stop recording");
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  return { recording, handleAudio };
};
