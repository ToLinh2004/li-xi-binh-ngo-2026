
import React from 'react';

export const INITIAL_NOTES = [
  "Chúc mừng năm mới Bính Ngọ 2026!",
  "Lật mỗi bao lì xì để nhận lộc đầu năm.",
  "Tìm bao lì xì 500.000đ để nhận pháo hoa rực rỡ!",
  "Vận may đang chờ đón bạn."
];

export const CARD_VALUES = [
  { text: "10.000 đ", amount: 10000 },
  { text: "20.000 đ", amount: 20000 },
  { text: "50.000 đ", amount: 50000 },
  { text: "100.000 đ", amount: 100000 },
  { text: "200.000 đ", amount: 200000 },
  { text: "500.000 đ", amount: 500000 },
  { text: "Lộc Xuân 2026", amount: 300000 },
  { text: "Lộc Phát - 68", amount: 600000 },
  { text: "Phát Lộc - 86", amount: 800000 },
  { text: "Lộc Lộc - 66", amount: 660000 },
  { text: "May Mắn - 5.000", amount: 5000 },
  { text: "Tài Lộc - 12.000", amount: 12000 },
  { text: "An Khang - 15.000", amount: 15000 },
  { text: "Thịnh Vượng - 88.000", amount: 88000 }
];

// Generate 35 cards for a nice grid
export const generateGameCards = () => {
  const cards = [];
  for (let i = 0; i < 35; i++) {
    const randomVal = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
    cards.push({
      id: i,
      value: randomVal.text,
      amount: randomVal.amount,
      isOpened: false
    });
  }
  // Shuffle cards
  return cards.sort(() => Math.random() - 0.5);
};
