import React, { useState, useEffect, useRef } from "react";
import { GameCard, GameState, Denomination } from "./types";
import {
  generateGameCards,
  INITIAL_NOTES,
  DEFAULT_DENOMINATIONS,
} from "./constants";
import Card from "./components/Card";
import { getFestiveWish } from "./services/geminiService";

const CONFETTI_PALETTES = [
  { name: "Truyền thống", colors: ["#FFD700", "#FF0000", "#FFFFFF"] },
  { name: "Rực rỡ", colors: ["#FF007F", "#FFD700", "#00E5FF"] },
  { name: "Hoàng gia", colors: ["#FFD700", "#C0C0C0", "#8E24AA"] },
  { name: "Mùa xuân", colors: ["#4CAF50", "#FFEB3B", "#FF4081"] },
];

const TURN_LIMIT = 3;

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    cards: generateGameCards(DEFAULT_DENOMINATIONS),
    total: 0,
    notes: INITIAL_NOTES,
    openedIndices: [],
    isThinking: false,
    currentWish:
      "Chào mừng bạn! Hãy chọn 3 bao lì xì may mắn nhất để nhận lộc đầu năm.",
    denominations: DEFAULT_DENOMINATIONS,
  });

  const [hasAlreadyPlayed, setHasAlreadyPlayed] = useState(false);

  // UI State
  const [confettiConfig, setConfettiConfig] = useState({
    particleCount: 150,
    spread: 70,
    colors: CONFETTI_PALETTES[0].colors,
    shapes: ["circle", "square"],
  });
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"confetti" | "money">("confetti");

  // Audio State
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Use a royalty-free music link or ensure the local file exists
    audioRef.current = new Audio(
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
    );
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

  const triggerConfetti = () => {
    // @ts-ignore
    confetti({
      particleCount: confettiConfig.particleCount,
      spread: confettiConfig.spread,
      origin: { y: 0.6 },
      colors: confettiConfig.colors,
      shapes: confettiConfig.shapes,
    });
  };

  const handleFlip = async (id: number) => {
    if (hasAlreadyPlayed || state.openedIndices.length >= TURN_LIMIT) return;

    handleFirstInteraction();
    const cardIndex = state.cards.findIndex((c) => c.id === id);
    if (cardIndex === -1 || state.cards[cardIndex].isOpened) return;

    const targetCard = state.cards[cardIndex];
    const newCards = [...state.cards];
    newCards[cardIndex] = { ...targetCard, isOpened: true };
    const newTotal = state.total + targetCard.amount;
    const newOpenedIndices = [...state.openedIndices, id];
    const isNowFinished = newOpenedIndices.length >= TURN_LIMIT;

    setState((prev) => ({
      ...prev,
      cards: newCards,
      total: newTotal,
      openedIndices: newOpenedIndices,
      isThinking: true,
    }));

    if (targetCard.amount >= 200000 || isNowFinished) {
      triggerConfetti();
    }

    const wish = await getFestiveWish(targetCard.amount, targetCard.value);
    setState((prev) => ({ ...prev, currentWish: wish, isThinking: false }));

    if (isNowFinished) {
      setHasAlreadyPlayed(true);
    }
  };

  const resetGame = () => {
    handleFirstInteraction();
    setHasAlreadyPlayed(false);
    setState((prev) => ({
      ...prev,
      cards: generateGameCards(prev.denominations),
      total: 0,
      openedIndices: [],
      isThinking: false,
      currentWish: "Lộc mới đã sẵn sàng! Chúc bạn may mắn với 3 lượt chọn mới.",
    }));
  };

  const updateDenomination = (
    index: number,
    field: keyof Denomination,
    value: string | number,
  ) => {
    const newDenoms = [...state.denominations];
    newDenoms[index] = { ...newDenoms[index], [field]: value };
    setState((prev) => ({ ...prev, denominations: newDenoms }));
  };

  const addDenomination = () => {
    setState((prev) => ({
      ...prev,
      denominations: [...prev.denominations, { text: "1.000 đ", amount: 1000 }],
    }));
  };

  const removeDenomination = (index: number) => {
    if (state.denominations.length <= 1) return;
    const newDenoms = state.denominations.filter((_, i) => i !== index);
    setState((prev) => ({ ...prev, denominations: newDenoms }));
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
          <div className="flex flex-col items-center gap-2">
            <p className="text-yellow-200 text-lg md:text-xl font-semibold tracking-wide uppercase italic">
              {hasAlreadyPlayed
                ? "Chúc Mừng Bạn Đã Nhận Lộc!"
                : "Mã Đáo Thành Công - Vạn Sự Như Ý"}
            </p>
            <div className="bg-yellow-500 text-red-900 px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg border border-red-900/20">
              Lượt mở:{" "}
              <span className="text-lg">{state.openedIndices.length}</span> /{" "}
              {TURN_LIMIT}
            </div>
          </div>
        </header>

        {/* Info Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-red-900/40 backdrop-blur-md border-2 border-yellow-600/50 p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="text-yellow-400 text-sm uppercase font-bold mb-1 text-center relative z-10">
              {hasAlreadyPlayed ? "Tổng Lộc Đã Nhận" : "Tiền Lộc Hiện Tại"}
            </span>
            <span className="text-4xl font-bold text-white tracking-tighter relative z-10">
              {state.total.toLocaleString("vi-VN")}{" "}
              <span className="text-xl">đ</span>
            </span>
          </div>
          <div className="bg-red-900/40 backdrop-blur-md border-2 border-yellow-600/50 p-6 rounded-2xl shadow-2xl md:col-span-2 relative min-h-[120px] flex items-center">
            <div className="absolute -top-3 left-6 bg-yellow-500 px-3 py-1 rounded-full text-red-900 font-bold text-xs uppercase shadow-md">
              Lời Chúc Tết AI
            </div>
            <p
              className={`text-xl md:text-2xl font-festive text-yellow-100 transition-opacity duration-300 w-full ${state.isThinking ? "opacity-50" : "opacity-100"}`}
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
          {hasAlreadyPlayed && (
            <div className="mt-12 text-center animate-in fade-in zoom-in duration-1000 space-y-6">
              <div className="inline-block bg-yellow-500/10 border-2 border-yellow-500/50 backdrop-blur-md px-10 py-6 rounded-3xl shadow-2xl">
                <h2 className="font-festive text-4xl text-yellow-400 mb-2">
                  Chúc Mừng Năm Mới!
                </h2>
                <p className="text-yellow-200/80 text-sm max-w-md mx-auto italic mb-6">
                  Bạn đã sử dụng hết 3 lượt nhận lộc. Tổng số tiền may mắn của
                  bạn là {state.total.toLocaleString("vi-VN")}đ.
                </p>
                <button
                  onClick={resetGame}
                  className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold py-2 px-6 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 uppercase tracking-widest text-lg animate-pulse"
                >
                  Nhận Lộc Lượt Mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Game Grid */}
        <div
          className={`transition-all duration-700 ${hasAlreadyPlayed ? "opacity-50 grayscale pointer-events-none scale-95 blur-[1px]" : ""}`}
        >
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
        </div>

        {/* Final Message & Reset Action */}

        {!hasAlreadyPlayed && (
          <div className="mt-12 text-center">
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl inline-block">
              <div className="flex flex-wrap justify-center gap-6 text-yellow-300/80 text-sm">
                {state.notes.map((note, i) => (
                  <span key={i} className="flex items-center">
                    <span className="mr-1">🧧</span> {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {!hasAlreadyPlayed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className="w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 text-yellow-400 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 border border-yellow-500/30"
          >
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
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="w-12 h-12 bg-yellow-500 hover:bg-yellow-400 text-red-900 rounded-full flex items-center justify-center shadow-2xl border-2 border-red-900 transition-transform active:scale-90"
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 animate-pulse"
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
          )}
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && !hasAlreadyPlayed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-sm bg-red-900 border-2 border-yellow-500 rounded-3xl shadow-2xl p-6 text-white animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex border-b border-white/10 mb-4">
              <button
                onClick={() => setActiveTab("confetti")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === "confetti" ? "text-yellow-400 bg-white/5 border-b-2 border-yellow-500" : "text-white/40"}`}
              >
                Pháo Hoa
              </button>
              <button
                onClick={() => setActiveTab("money")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === "money" ? "text-yellow-400 bg-white/5 border-b-2 border-yellow-500" : "text-white/40"}`}
              >
                Mệnh Giá
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {activeTab === "confetti" ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] text-yellow-200/70 mb-2 uppercase font-semibold tracking-wider">
                      Bảng màu
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CONFETTI_PALETTES.map((p) => (
                        <button
                          key={p.name}
                          onClick={() =>
                            setConfettiConfig({
                              ...confettiConfig,
                              colors: p.colors,
                            })
                          }
                          className={`text-[10px] py-2 px-3 rounded-lg border flex items-center transition-all ${confettiConfig.colors === p.colors ? "bg-yellow-500 text-red-900 border-yellow-300 shadow-md" : "bg-white/5 border-white/10"}`}
                        >
                          <div className="flex -space-x-1 mr-2">
                            {p.colors.map((c) => (
                              <div
                                key={c}
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: c }}
                              ></div>
                            ))}
                          </div>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-yellow-200/70 mb-2 uppercase font-semibold tracking-wider">
                      Số lượng hạt ({confettiConfig.particleCount})
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={confettiConfig.particleCount}
                      onChange={(e) =>
                        setConfettiConfig({
                          ...confettiConfig,
                          particleCount: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-yellow-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-[10px] text-yellow-200/70 mb-2 uppercase font-semibold tracking-wider">
                    Danh sách mệnh giá lộc
                  </label>
                  {state.denominations.map((denom, i) => (
                    <div
                      key={i}
                      className="flex gap-2 items-center bg-white/5 p-2 rounded-lg border border-white/10"
                    >
                      <input
                        type="text"
                        value={denom.text}
                        onChange={(e) =>
                          updateDenomination(i, "text", e.target.value)
                        }
                        className="flex-1 bg-transparent border-none text-xs focus:ring-0 text-white"
                      />
                      <input
                        type="number"
                        value={denom.amount}
                        onChange={(e) =>
                          updateDenomination(
                            i,
                            "amount",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-16 bg-transparent border-none text-xs font-mono text-yellow-400 focus:ring-0"
                      />
                      <button
                        onClick={() => removeDenomination(i)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addDenomination}
                    className="w-full border border-dashed border-yellow-500/30 text-yellow-500/50 py-2 rounded-lg text-[10px] uppercase font-bold hover:bg-white/5"
                  >
                    + Thêm mệnh giá
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                resetGame();
                setShowSettings(false);
              }}
              className="w-full bg-yellow-500 text-red-900 font-bold py-3 rounded-2xl text-sm uppercase hover:bg-yellow-400 shadow-lg transition-all active:scale-95 mt-6"
            >
              Lưu & Chơi Lại Từ Đầu
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full h-12 bg-gradient-to-t from-red-900 to-transparent flex items-center justify-center pointer-events-none">
        <p className="text-yellow-600/50 text-xs font-bold uppercase tracking-[0.5em]">
          Chúc Mừng Năm Mới 2026
        </p>
      </div>
    </div>
  );
};

export default App;
