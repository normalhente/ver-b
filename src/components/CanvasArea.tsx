'use client';

import React, { useState } from 'react';

type Item = {
  id: number;
  content: string;
  x: number;
  y: number;
};

export default function CanvasArea() {
  const [items, setItems] = useState<Item[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [draggingOffset, setDraggingOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (id: number) => (e: React.MouseEvent) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setDraggingId(id);
    setDraggingOffset({ x: e.clientX - item.x, y: e.clientY - item.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null) return;

    const newX = e.clientX - draggingOffset.x;
    const newY = e.clientY - draggingOffset.y;

    setItems(prev =>
      prev.map(item =>
        item.id === draggingId ? { ...item, x: newX, y: newY } : item
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const addItem = (text: string) => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        content: text,
        x: 50,
        y: 50,
      },
    ]);
  };

  return (
    <div className="p-4">
      <button onClick={() => addItem('🌀')} className="mr-2 px-2 py-1 bg-blue-200">+ Emoji</button>
      <button onClick={() => addItem('Text')} className="px-2 py-1 bg-green-200">+ Text</button>

      <div
        className="relative w-[400px] h-[500px] bg-white border mt-4"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {items.map(item => (
          <div
            key={item.id}
            className="absolute px-2 py-1 bg-gray-100 rounded shadow cursor-move select-none"
            style={{ left: item.x, top: item.y }}
            onMouseDown={handleMouseDown(item.id)}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
