import React from "react";
import { GameCard } from "../types";
interface CardProps {
  card: GameCard;
  onClick: (id: number) => void;
  index: number;
}

const Card: React.FC<CardProps> = ({ card, onClick, index }) => {
  return (
    <div
      className={`relative h-32 sm:h-40 w-full perspective-1000 cursor-pointer group ${card.isOpened ? "flipped" : ""}`}
      onClick={() => !card.isOpened && onClick(card.id)}
    >
      <div className="flip-card-inner relative w-full h-full text-center shadow-xl rounded-xl">
        {/* Front Side (Unopened Li Xi) */}
        <div className="flip-card-front absolute w-full h-full rounded-xl bg-gradient-to-br from-red-600 to-red-800 border-4 border-yellow-500 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/oriental-tiles.png')]"></div>
          <div className="relative z-10">
            <div className="text-yellow-400 font-festive text-4xl mb-1 drop-shadow-md">
              Lộc
            </div>
            <div className="text-yellow-200 text-xs font-bold uppercase tracking-widest">
              Bính Ngọ
            </div>
          </div>
          <div className="absolute top-2 right-2 text-yellow-500/30 text-xs italic">
            #{index + 1}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500/50"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/50"></div>
          {/* Shimmer effect */}
          <div className="shimmer absolute inset-0 opacity-30"></div>
        </div>

        {/* Back Side (Opened Value) */}
        <div className="flip-card-back absolute w-full h-full rounded-xl bg-white border-4 border-yellow-400 flex flex-col items-center justify-center shadow-inner overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
          <div className="z-10 px-2">
            <div className="text-red-700 font-bold text-xl sm:text-2xl leading-tight">
              {card.value}
            </div>
            <div className="mt-2 text-xs text-red-500/70 italic">
              Phát tài phát lộc
            </div>
          </div>
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-200"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-200"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-200"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-200"></div>
        </div>
      </div>
    </div>
  );
};

export default Card;
