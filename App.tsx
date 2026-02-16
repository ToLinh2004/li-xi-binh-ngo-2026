import React, { useState, useEffect, useRef } from "react";
import { GameCard, GameState } from "./types";
import { generateGameCards, INITIAL_NOTES } from "./constants";
import Card from "./components/Card";
import { getFestiveWish } from "./services/geminiService";

const MUSIC_URL = "./music-lunar-new-year.mp3"; // Placeholder for festive loop

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    cards: generateGameCards(),
    total: 0,
    notes: INITIAL_NOTES,
    openedIndices: [],
    isThinking: false,
    currentWish: "Chúc bạn một năm mới Mã Đáo Thành Công!",
  });

  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(MUSIC_URL); // Using a cheerful generic loop
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (!isMuted && hasInteracted) {
        audioRef.current
          .play()
          .catch((e) => console.log("Autoplay prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted, hasInteracted]);

  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsMuted(false);
    }
  };

  const handleFlip = async (id: number) => {
    handleFirstInteraction();
    const cardIndex = state.cards.findIndex((c) => c.id === id);
    if (cardIndex === -1 || state.cards[cardIndex].isOpened) return;

    const targetCard = state.cards[cardIndex];

    // Update state locally first for UI responsiveness
    const newCards = [...state.cards];
    newCards[cardIndex] = { ...targetCard, isOpened: true };

    const newTotal = state.total + targetCard.amount;

    setState((prev) => ({
      ...prev,
      cards: newCards,
      total: newTotal,
      openedIndices: [...prev.openedIndices, id],
      isThinking: true,
    }));

    // Festive effects
    if (targetCard.amount >= 500000 || targetCard.value.includes("Lộc")) {
      // @ts-ignore
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FF0000", "#FFFFFF"],
      });
    }

    // Get AI Wish
    const wish = await getFestiveWish(targetCard.amount, targetCard.value);
    setState((prev) => ({ ...prev, currentWish: wish, isThinking: false }));
  };

  const resetGame = () => {
    handleFirstInteraction();
    setState({
      cards: generateGameCards(),
      total: 0,
      notes: INITIAL_NOTES,
      openedIndices: [],
      isThinking: false,
      currentWish: "Sẵn sàng đón lộc mới!",
    });
  };

  const toggleMute = () => {
    handleFirstInteraction();
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="min-h-screen relative pb-20 overflow-hidden bg-[#7a0000]"
      onClick={handleFirstInteraction}
    >
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-red-400/10 blur-[100px] rounded-full"></div>

        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
          >
            🌸
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="font-festive text-5xl md:text-7xl text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-2">
            Lộc Xuân Bính Ngọ 2026
          </h1>
          <p className="text-yellow-200 text-lg md:text-xl font-semibold tracking-wide uppercase italic">
            Mã Đáo Thành Công - Vạn Sự Như Ý
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-red-900/40 backdrop-blur-md border-2 border-yellow-600/50 p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center">
            <span className="text-yellow-400 text-sm uppercase font-bold mb-1">
              Tổng Lộc Nhận Được
            </span>
            <span className="text-4xl font-bold text-white tracking-tighter">
              {state.total.toLocaleString("vi-VN")}{" "}
              <span className="text-xl">đ</span>
            </span>
          </div>

          <div className="bg-red-900/40 backdrop-blur-md border-2 border-yellow-600/50 p-6 rounded-2xl shadow-2xl md:col-span-2 relative">
            <div className="absolute -top-3 left-6 bg-yellow-500 px-3 py-1 rounded-full text-red-900 font-bold text-xs uppercase">
              Lời Chúc Từ Ông Đồ AI
            </div>
            <p
              className={`text-xl md:text-2xl font-festive text-yellow-100 transition-opacity duration-300 ${state.isThinking ? "opacity-50" : "opacity-100"}`}
            >
              "{state.currentWish}"
            </p>
            {state.isThinking && (
              <div className="absolute bottom-2 right-4 flex space-x-1">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
          </div>
          <button
            onClick={resetGame}
            className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 uppercase tracking-wider"
          >
            Gieo lộc lại
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 md:gap-6">
          {state.cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              onClick={handleFlip}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl inline-block mb-8">
            <div className="flex flex-wrap justify-center gap-4 text-yellow-300/80 text-sm">
              {state.notes.map((note, i) => (
                <span key={i} className="flex items-center">
                  <span className="mr-1">🧧</span> {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Music Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-red-900 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-red-900"
        title={isMuted ? "Bật nhạc" : "Tắt nhạc"}
      >
        {isMuted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        )}
      </button>

      <div className="fixed bottom-0 left-0 w-full h-12 bg-gradient-to-t from-red-900 to-transparent flex items-center justify-center pointer-events-none">
        <p className="text-yellow-600/50 text-xs font-bold uppercase tracking-[0.5em]">
          Chúc Mừng Năm Mới 2026
        </p>
      </div>
    </div>
  );
};

export default App;
