'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    p5: any;
  }
}

type Item = {
  id: number;
  type: 'text' | 'emoji' | 'image';
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
  fontFamily: string;
  angle: number;
  opacity: number;
  bgColor: string;
  bgOpacity: number;
};

export default function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textInput, setTextInput] = useState('');
  const [emojiInput, setEmojiInput] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const sketch = (p: any) => {
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current);
        p.background(bgColor);
      };

      p.draw = () => {
        p.background(bgColor);
        
        items.forEach(item => {
          p.push();
          p.translate(item.x, item.y);
          p.rotate(item.angle);
          p.textSize(item.size);
          p.textFont(item.fontFamily);
          p.fill(item.color);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(item.content, 0, 0);
          p.pop();
        });
      };

      p.mousePressed = () => {
        const clickedItem = items.find(item => {
          const d = p.dist(p.mouseX, p.mouseY, item.x, item.y);
          return d < item.size;
        });
        setSelectedItem(clickedItem || null);
      };
    };

    const p5Instance = new window.p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, [items, bgColor]);

  const addText = () => {
    if (!textInput) return;
    const newItem: Item = {
      id: Date.now(),
      type: 'text',
      content: textInput,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: 24,
      color: '#000000',
      fontFamily: 'Arial',
      angle: 0,
      opacity: 1,
      bgColor: 'transparent',
      bgOpacity: 0
    };
    setItems([...items, newItem]);
    setTextInput('');
  };

  const addEmoji = () => {
    if (!emojiInput) return;
    const newItem: Item = {
      id: Date.now(),
      type: 'emoji',
      content: emojiInput,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: 32,
      color: '#000000',
      fontFamily: 'Arial',
      angle: 0,
      opacity: 1,
      bgColor: 'transparent',
      bgOpacity: 0
    };
    setItems([...items, newItem]);
    setEmojiInput('');
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const newItem: Item = {
            id: Date.now(),
            type: 'image',
            content: event.target.result,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            size: 100,
            color: '#000000',
            fontFamily: 'Arial',
            angle: 0,
            opacity: 1,
            bgColor: 'transparent',
            bgOpacity: 0
          };
          setItems([...items, newItem]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const updateItem = (id: number, updates: Partial<Item>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const exportPNG = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'canvas.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const clearAll = () => {
    setItems([]);
    setSelectedItem(null);
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white p-4 rounded-lg shadow-lg">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="텍스트 입력"
          className="border p-2 rounded"
        />
        <button onClick={addText} className="bg-blue-500 text-white p-2 rounded">
          텍스트 추가
        </button>
        
        <input
          type="text"
          value={emojiInput}
          onChange={(e) => setEmojiInput(e.target.value)}
          placeholder="이모지 입력"
          className="border p-2 rounded"
        />
        <button onClick={addEmoji} className="bg-green-500 text-white p-2 rounded">
          이모지 추가
        </button>
        
        <button onClick={addImage} className="bg-purple-500 text-white p-2 rounded">
          이미지 추가
        </button>

        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-full h-10"
        />
        <span className="text-sm">배경색</span>

        <button onClick={exportPNG} className="bg-yellow-500 text-white p-2 rounded">
          PNG 내보내기
        </button>

        <button onClick={clearAll} className="bg-red-500 text-white p-2 rounded">
          전체 삭제
        </button>
      </div>

      {selectedItem && (
        <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min="10"
              max="100"
              value={selectedItem.size}
              onChange={(e) => updateItem(selectedItem.id, { size: Number(e.target.value) })}
            />
            <span>크기</span>

            <input
              type="range"
              min="0"
              max="360"
              value={selectedItem.angle}
              onChange={(e) => updateItem(selectedItem.id, { angle: Number(e.target.value) })}
            />
            <span>회전</span>

            <input
              type="color"
              value={selectedItem.color}
              onChange={(e) => updateItem(selectedItem.id, { color: e.target.value })}
            />
            <span>색상</span>

            <select
              value={selectedItem.fontFamily}
              onChange={(e) => updateItem(selectedItem.id, { fontFamily: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
            <span>글꼴</span>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
