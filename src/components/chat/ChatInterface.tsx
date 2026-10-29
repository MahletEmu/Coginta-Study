"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, StudyMaterial } from "@/types";
import { INITIAL_CHAT_MESSAGES, INITIAL_DEMO_MATERIALS } from "@/lib/mock-data";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { PromptPill } from "@/components/chat/PromptPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { getMaterialText } from "@/lib/document-text-service";
import { AIChatRequest, AIChatResponse, AIStatusResponse } from "@/types/ai";
import { useAuth } from "@/context/AuthContext";
import { getOrCreateChatSession, saveCloudChatMessage } from "@/lib/database-service";
import {
  Send,
  Sparkles,
  Loader2,
  RotateCcw,
  BookOpen,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function ChatInterface() {
  const { t, language } = useLanguage();
  const { user, isConfigured: isSupabaseReady } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("all");
  const [isKeyConfigured, setIsKeyConfigured] = useState<boolean | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [enteredKey, setEnteredKey] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveKeyStatus, setSaveKeyStatus] = useState<{ success: boolean; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSaveApiKey = async () => {
    if (!enteredKey.trim()) return;
    setIsSavingKey(true);
    setSaveKeyStatus(null);

    try {
      const res = await fetch("/api/ai/save-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: enteredKey.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsKeyConfigured(true);
        setSaveKeyStatus({
          success: true,
          message:
            language === "am"
              ? "የ Gemini API ቁልፍ በተሳካ ሁኔታ ተገናኝቷል! አሁን መወያየት ይችላሉ።"
              : "Gemini API Key successfully connected! Live AI features are now active.",
        });
        setTimeout(() => {
          setShowSetupModal(false);
          setSaveKeyStatus(null);
          setEnteredKey("");
        }, 1500);
      } else {
        setSaveKeyStatus({
          success: false,
          message: data.error || "Failed to save API key.",
        });
      }
    } catch {
      setSaveKeyStatus({
        success: false,
        message: "Network error saving API key.",
      });
    } finally {
      setIsSavingKey(false);
    }
  };

  // Load materials from localStorage and auto-select active course document
  useEffect(() => {
    let mats = INITIAL_DEMO_MATERIALS;
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ai_study_materials");
        if (stored) {
          mats = JSON.parse(stored);
        }
      }
    } catch {
      // ignore
    }
    setMaterials(mats);

    // Check if URL has ?materialId=
    let targetMatId = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      targetMatId = params.get("materialId") || "";
    }

    if (targetMatId && mats.some((m) => m.id === targetMatId)) {
      setSelectedMaterialId(targetMatId);
    } else if (mats.length > 0) {
      const userUploaded = mats.find((m) => !m.isDemo);
      setSelectedMaterialId(userUploaded ? userUploaded.id : "all");
    }
  }, []);

  // Check Gemini API Configuration Status
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/ai/status");
        if (res.ok) {
          const data = (await res.json()) as AIStatusResponse;
          setIsKeyConfigured(data.isConfigured);
        }
      } catch {
        setIsKeyConfigured(false);
      }
    }
    checkStatus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const promptSuggestions = language === "am" ? [
    selectedMaterial
      ? `የ "${selectedMaterial.title.slice(0, 25)}" ዋና ዋና ነጥቦች ምንድን ናቸው?`
      : "የዌብ ዲዛይን (Web Design) መሰረታዊ መርሆችን አብራራልኝ",
    "የ CSS Flexbox እና Grid ልዩነት ምንድን ነው?",
    "የዳይክስትራ አልጎሪዝምን አብራራልኝ",
  ] : [
    selectedMaterial
      ? `What are the key concepts of "${selectedMaterial.title.slice(0, 25)}"?`
      : "Explain core Web Design principles & UI/UX",
    "Difference between CSS Flexbox and Grid",
    "Explain Dijkstra's algorithm step-by-step",
  ];

  const handleSendMessage = async (contentToSend?: string) => {
    const text = (contentToSend || inputPrompt).trim();
    if (!text || isThinking) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsThinking(true);

    let currentSessionId = activeSessionId;
    if (user && isSupabaseReady) {
      getOrCreateChatSession(user.id, selectedMaterial?.id, text.slice(0, 30)).then((sessId) => {
        if (sessId) {
          currentSessionId = sessId;
          setActiveSessionId(sessId);
          saveCloudChatMessage(sessId, user.id, userMessage).catch(() => {});
        }
      });
    }

    try {
      let contextText = "";
      const activeMat =
        selectedMaterialId !== "all"
          ? materials.find((m) => m.id === selectedMaterialId)
          : undefined;

      if (activeMat) {
        const extracted = await getMaterialText(activeMat);
        contextText = extracted.text;
      }

      // Prepare conversation history (last 6 messages)
      const history = messages.slice(-6).map((msg) => ({
        role: (msg.role === "assistant" ? "model" : "user") as "user" | "model",
        parts: [{ text: msg.content }],
      }));

      const payload: AIChatRequest = {
        message: text,
        materialId: activeMat?.id,
        materialTitle: activeMat?.title,
        contextText: contextText || undefined,
        history,
        language: language as "en" | "am",
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as AIChatResponse;

      if (!res.ok || !data.success) {
        if (data.requiresApiKey) {
          setIsKeyConfigured(false);
        }

        const errorMessage: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          role: "assistant",
          content:
            data.error ||
            (language === "am"
              ? "ይቅርታ፣ ከ AI ሞዴሉ መልስ ማግኘት አልተቻለም።"
              : "Failed to receive a response from the AI model."),
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      // Success: add real AI reply
      const assistantMessage: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        groundedInDocument: data.groundedInDocument,
        materialTitle: selectedMaterial?.title,
        suggestedFollowUps: language === "am" ? [
          "ዋና ዋና ፅንሰ-ሀሳቦችን አጠቃልልኝ",
          "የፈተና ልምምድ ጥያቄዎችን አውጣልኝ",
        ] : [
          "Explain this with a practical example",
          "Generate test revision questions for this",
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (user && isSupabaseReady && currentSessionId) {
        saveCloudChatMessage(currentSessionId, user.id, assistantMessage).catch(() => {});
      }
    } catch (err) {
      console.error("Chat send error:", err);
      const networkErrorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content:
          language === "am"
            ? "የግንኙነት ችግር ተፈጥሯል። እባክዎ ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።"
            : "Network error occurred while communicating with the AI service. Please check your connection and retry.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };
      setMessages((prev) => [...prev, networkErrorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_CHAT_MESSAGES);
  };

  return (
    <>
      <Card className="flex flex-col h-[680px] overflow-hidden border-stone-200/90 shadow-sm">
        {/* Top Header with Document Grounding Selector */}
        <div className="px-4 sm:px-5 py-3 border-b border-stone-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                  {t("chat.title")}
                </h3>
                {isKeyConfigured === false && (
                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <KeyRound className="h-3 w-3" />
                    <span>{language === "am" ? "API ቁልፍ አስገባ" : "Set API Key"}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {language === "am"
                  ? "የጥናት ማስታወሻዎችን መሰረት ያደረገ እውነተኛ የ AI ውይይት"
                  : "Grounded AI Study Partner (Gemini 2.5 Flash)"}
              </p>
            </div>
          </div>

          {/* Material Context Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-violet-50/80 border border-violet-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[11px] font-semibold text-violet-800 shrink-0 hidden sm:inline">
                {language === "am" ? "የጥናት ኮርስ፦" : "Course:"}
              </span>
              <BookOpen className="h-3.5 w-3.5 text-violet-600 shrink-0" />
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="bg-transparent text-xs text-violet-950 font-bold outline-none cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
              >
                <option value="all" className="text-slate-800 font-bold">
                  {language === "am"
                    ? "🌐 አጠቃላይ የጥናት ረዳት (ማንኛውም ርዕስ / Web Design...)"
                    : "🌐 General Tutor (All Subjects / Web Design...)"}
                </option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id} className="text-slate-800 font-medium">
                    📄 {m.title} ({m.subject})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClearChat}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("chat.clear")}</span>
            </button>
          </div>
        </div>

        {/* API Key Missing Notice Bar */}
        {isKeyConfigured === false && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                {language === "am"
                  ? "የ Gemini API ቁልፍ በ .env.local ፋይል ውስጥ አልተገኘም።"
                  : "Gemini API key is not configured in .env.local on your server."}
              </span>
            </div>
            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer shrink-0"
            >
              {language === "am" ? "የአዘገጃጀት መመሪያ" : "Setup Instructions"}
            </button>
          </div>
        )}

        {/* Suggestion Strip */}
        <div className="bg-stone-50/70 px-4 py-2 border-b border-stone-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">
            {t("chat.tryAsking")}
          </span>
          <div className="flex items-center gap-1.5">
            {promptSuggestions.map((prompt) => (
              <PromptPill
                key={prompt}
                label={prompt}
                onClick={(p) => handleSendMessage(p)}
              />
            ))}
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F6]">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={(s) => handleSendMessage(s)}
              onSetupKeyClick={() => setShowSetupModal(true)}
            />
          ))}

          {isThinking && (
            <div className="flex items-center gap-3 animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-xs bg-white border border-stone-200/80 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
                <span>
                  {selectedMaterial
                    ? language === "am"
                      ? `"${selectedMaterial.title.slice(0, 20)}" ማስታወሻን በመመርመር ላይ...`
                      : `Grounded in "${selectedMaterial.title.slice(0, 20)}"...`
                    : t("chat.thinking")}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3.5 bg-white border-t border-stone-100">
          <div className="relative">
            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedMaterial
                  ? language === "am"
                    ? `ስለ "${selectedMaterial.title}" ማንኛውንም ጥያቄ ጠይቅ...`
                    : `Ask anything about "${selectedMaterial.title}"...`
                  : t("chat.placeholder")
              }
              className="w-full pl-3 pr-20 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 focus:bg-white text-slate-900 resize-none transition-all"
            />

            <div className="absolute right-2.5 bottom-3 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isThinking}
                isLoading={isThinking}
                className="gap-1 text-xs h-7 px-3"
              >
                <span>{t("chat.send")}</span>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* API Key Setup Instructions Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title={
          language === "am"
            ? "የ Gemini API ቁልፍ አዘገጃጀት መመሪያ"
            : "Gemini API Key Setup Guide"
        }
        description={
          language === "am"
            ? "እውነተኛ AI ውይይት፣ ማጠቃለያ እና የፈተና አመንጪን ለመጠቀም የሚከተሉትን 2 እርምጃዎች ይከተሉ፦"
            : "Follow these 2 simple steps to enable live Gemini AI study features:"
        }
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px]">
                1
              </span>
              <span>{language === "am" ? "ነጻ የ Gemini API ቁልፍ ያግኙ" : "Get a Free Gemini API Key"}</span>
            </div>
            <p className="text-slate-600 pl-7 leading-relaxed">
              {language === "am"
                ? "ወደ Google AI Studio በመሄድ በነጻ የራስዎን API Key ይውሰዱ፦"
                : "Open Google AI Studio and generate your free API key in seconds:"}
            </p>
            <div className="pl-7">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs transition-colors"
              >
                <span>Google AI Studio API Key</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px]">
                2
              </span>
              <span>
                {language === "am"
                  ? "የ API ቁልፍዎን እዚህ ያስገቡና ወዲያውኑ ያግብሩ"
                  : "Paste API Key & Activate Instantly"}
              </span>
            </div>
            <p className="text-slate-600 pl-7 text-[11px]">
              {language === "am"
                ? "ከ Google AI Studio የወሰዱትን የ API ቁልፍ (በ AIzaSy... የሚጀምር) እዚህ ያስገቡ፦"
                : "Paste your Google AI Studio API key (starts with AIzaSy...) below to connect immediately:"}
            </p>
            <div className="pl-7 space-y-2">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={enteredKey}
                  onChange={(e) => setEnteredKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 font-mono"
                />
                <Button
                  size="sm"
                  onClick={handleSaveApiKey}
                  disabled={isSavingKey || !enteredKey.trim().startsWith("AIzaSy")}
                  className="shrink-0 text-xs"
                >
                  {isSavingKey ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : language === "am" ? (
                    "አግብር"
                  ) : (
                    "Activate"
                  )}
                </Button>
              </div>

              {saveKeyStatus && (
                <div
                  className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                    saveKeyStatus.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {saveKeyStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{saveKeyStatus.message}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {language === "am"
                ? "አንዴ ቁልፉን ካስገቡ በኋላ ገጹን ሪፍሬሽ ሲያደርጉት AIው ወዲያውኑ መስራት ይጀምራል!"
                : "Next.js automatically reloads environment variables. Once saved, refresh the browser to chat live with your documents!"}
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-stone-100">
            <Button size="sm" onClick={() => setShowSetupModal(false)}>
              {language === "am" ? "ተረድቻለሁ" : "Got It"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
