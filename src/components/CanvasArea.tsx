'use client';

import React, { useEffect, useRef, useState } from 'react';

type Item = {
  id: number;
  type: 'text' | 'emoji' | 'image';
  content: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  fontFamily?: string;
  angle?: number;
  opacity?: number;
  bgColor?: string;
  bgOpacity?: number;
};

export default function CanvasArea() {
  const [items, setItems] = useState<Item[]>([]);
  const draggingId = useRef<number | null>(null);
  const startMouse = useRef({ x: 0, y: 0 });
  const startBoxPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (draggingId.current == null) return;
      const newX = e.clientX - startMouse.current.x + startBoxPos.current.x;
      const newY = e.clientY - startMouse.current.y + startBoxPos.current.y;
      setItems(prev =>
        prev.map(i =>
          i.id === draggingId.current
            ? { ...i, x: newX, y: newY }
            : i
        )
      );
    };
    const onPointerUp = () => {
      draggingId.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const onPointerDownItem = (id: number, e: React.PointerEvent) => {
    e.stopPropagation();
    draggingId.current = id;
    startMouse.current = { x: e.clientX, y: e.clientY };
    const itm = items.find(i => i.id === id)!;
    startBoxPos.current = { x: itm.x, y: itm.y };
  };

  const addItem = (type: Item['type'], content: string) => {
    const newItem: Item = {
      id: Date.now(),
      type,
      content,
      x: 100,
      y: 100,
      size: type === 'image' ? 200 : 24,
      color: '#000000',
      fontFamily: 'system-ui',
      angle: 0,
      opacity: 1,
      bgColor: '#ffffff',
      bgOpacity: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateText = (id: number, content: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, content } : i
    ));
  };

  const adjustImageSize = (id: number, size: number) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, size } : i
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="toolbar" style={{
        padding: '12px 24px',
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
      }}>
        <button onClick={() => addItem('text', '텍스트')}>텍스트</button>
        <button onClick={() => addItem('emoji', '😊')}>이모지</button>
        <button onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                addItem('image', e.target?.result as string);
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }}>이미지</button>
      </div>

      <div className="canvas" style={{
        flex: 1,
        position: 'relative',
        background: '#ffffff',
        overflow: 'hidden'
      }}>
        {items.map(item => (
          <div
            key={item.id}
            onPointerDown={e => onPointerDownItem(item.id, e)}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              transform: `rotate(${item.angle}deg)`,
              opacity: item.opacity,
              backgroundColor: item.bgColor,
              padding: '4px',
              borderRadius: '4px',
              touchAction: 'none',
              cursor: 'move',
              userSelect: 'none'
            }}
          >
            {item.type === 'text' && (
              <textarea
                value={item.content}
                onChange={e => updateText(item.id, e.target.value)}
                style={{
                  fontSize: item.size,
                  fontFamily: item.fontFamily,
                  color: item.color,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  width: 'auto',
                  minWidth: '100px'
                }}
              />
            )}
            {item.type === 'emoji' && (
              <div style={{
                fontSize: item.size,
                color: item.color
              }}>
                {item.content}
              </div>
            )}
            {item.type === 'image' && (
              <img
                src={item.content}
                width={item.size}
                height={item.size}
                style={{ objectFit: 'contain' }}
                draggable={false}
              />
            )}
            <button
              onClick={() => removeItem(item.id)}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
