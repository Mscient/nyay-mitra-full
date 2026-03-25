import React, { useState, useRef } from "react";
import { Mic, Square, Loader2, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { StateWrapper } from "./ui/state-wrapper";

// ── Supported languages ──────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", label: "EN", fullName: "English" },
  { code: "hi-IN", label: "हि", fullName: "हिंदी" },
  { code: "mr-IN", label: "मर", fullName: "मराठी" },
  { code: "bn-IN", label: "বা", fullName: "বাংলা" },
  { code: "ta-IN", label: "தமி", fullName: "தமிழ்" },
  { code: "te-IN", label: "తెలు", fullName: "తెలుగు" },
] as const;

export type SarvamLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string, language: SarvamLanguageCode) => void;
  isDisabled?: boolean;
  /** Pre-selected language; defaults to 'en-IN' */
  defaultLanguage?: SarvamLanguageCode;
}

export function VoiceRecorder({
  onTranscriptionComplete,
  isDisabled,
  defaultLanguage = "en-IN",
}: VoiceRecorderProps) {
  const [selectedLang, setSelectedLang] = useState<SarvamLanguageCode>(defaultLanguage);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    setErrorDetails(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setErrorDetails(err.message || "Could not access the microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("language_code", selectedLang);

      const token = localStorage.getItem("token");
      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to transcribe audio.");
      }

      const data = await res.json();
      if (data.text) {
        onTranscriptionComplete(data.text, selectedLang);
      } else {
        setErrorDetails("No speech could be recognized.");
      }
    } catch (err: any) {
      setErrorDetails(err.message);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Language selector pill bar */}
      <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Select recording language">
        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            disabled={isRecording || isTranscribing || isDisabled}
            onClick={() => setSelectedLang(lang.code)}
            aria-pressed={selectedLang === lang.code}
            title={lang.fullName}
            className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition-all
              ${selectedLang === lang.code
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
              }
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Recorder */}
      <StateWrapper
        isLoading={isTranscribing}
        isError={!!errorDetails}
        errorMessage={errorDetails || ""}
        isEmpty={false}
        isDisabled={isDisabled}
        skeleton={
          <div className="flex items-center space-x-2 text-primary" role="status" aria-live="polite">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">
              Transcribing speech ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.fullName})…
            </span>
          </div>
        }
      >
        <div className="flex items-center space-x-2">
          {!isRecording ? (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-sm hover:border-sidebar-primary hover:text-sidebar-primary transition-all active:scale-95"
              onClick={startRecording}
              disabled={isDisabled}
              aria-label={`Start recording voice in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.fullName}`}
              title="Start recording voice"
            >
              <Mic className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full shadow-sm relative"
              onClick={stopRecording}
              aria-label="Stop recording"
              title="Stop recording"
            >
              <span className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-75"></span>
              <Square className="h-4 w-4 fill-current relative z-10" />
            </Button>
          )}

          {isRecording && (
            <span className="text-sm font-medium text-destructive animate-pulse" role="status" aria-live="polite">
              Listening ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.fullName})…
            </span>
          )}
        </div>
      </StateWrapper>
    </div>
  );
}
