import { useRef, useState } from "react";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];
    setAudioBlob(null);
    setDuration(0);

    recorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorderRef.current.onstop = () => {
      clearTimer();
      setAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      stream.getTracks().forEach((track) => track.stop());
    };

    recorderRef.current.start();
    setIsRecording(true);
    timerRef.current = window.setInterval(() => {
      setDuration((current) => current + 1);
    }, 1000);
  };

  const stop = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
    clearTimer();
  };

  const clearAudio = () => setAudioBlob(null);

  const reset = () => {
    clearTimer();
    setIsRecording(false);
    setAudioBlob(null);
    setDuration(0);
    recorderRef.current = null;
    chunksRef.current = [];
  };

  return { isRecording, audioBlob, duration, start, stop, clearAudio, reset };
}
