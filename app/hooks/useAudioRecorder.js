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

  requestMicrophonePermission();

  const handleAudio = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        let options = {};

        // Verificamos el soporte para diferentes tipos de MIME
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' };
        } else {
          console.warn('Ningún tipo de MIME específico es compatible, se usará el formato predeterminado.');
          // No especificar un MIME type para permitir que el navegador elija uno
        }

        // Crear el MediaRecorder con el MIME type apropiado
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.start();
        setRecording(true);
        console.log("Recording started");
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
          type: mediaRecorderRef.current.mimeType || "audio/webm", // Usar el MIME type que fue soportado
        });

        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");

        // Transcribir audio a texto
        const transcription = await fetch("/api/speech-to-text", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => data.transcription);

        // Obtener respuesta del chat
        const chatResponse = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ prompt: transcription }),
        })
          .then((res) => res.json())
          .then((data) => data.response);

        console.log("Chat: ", chatResponse);

        // Obtener token JWT
        const token = localStorage.getItem("token");

        // Guardar la conversación y obtener la URL de la respuesta de audio
        const saveConversationResponse = await fetch("api/saveConversation", {
          method: "POST",
          body: JSON.stringify({ text: chatResponse, token: token }),
        }).then((res) => res.json());

        const audioUrl = saveConversationResponse.audioUrl;

        // Reproducir la respuesta de audio
        const audioIA = new Audio(audioUrl);
        audioIA.play();

        // Limpiar para la próxima grabación
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
