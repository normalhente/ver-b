// src/app/page.tsx
'use client';

import { useEffect, useRef, useReducer, useState } from 'react';
import html2canvas from 'html2canvas';

type Item = {
  id: number;
  type: 'text' | 'emoji' | 'image';
  content?: string;
  x: number;
  y: number;
  size: number;         // 텍스트·이모지 폰트 크기, 이미지 너비
  angle: number;
  color: string;        // 글자색/이모지색
  opacity: number;      // 전체 불투명도
  bgColor: string;      // 배경색 (hex)
  bgOpacity: number;    // 배경 투명도 0~1
  fontFamily?: string;  // 글꼴
  isSelected?: boolean; // 선택 상태
};

type State = {
  items: Item[];
  history: Item[][];
  future: Item[][];
  bgImage?: string;
  canvasBg: string;
};

type Action =
  | { type: 'ADD'; item: Item }
  | { type: 'UPDATE'; id: number; patch: Partial<Item> }
  | { type: 'REMOVE'; id: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_ALL'; items: Item[] }
  | { type: 'SET_BG_IMAGE'; url?: string }
  | { type: 'SET_CANVAS_BG'; color: string };

const reducer = (state: State, action: Action): State => {
  const { items, history, future } = state;
  switch (action.type) {
    case 'ADD': {
      const next = [...items, action.item];
      return { ...state, items: next, history: [...history, items], future: [] };
    }
    case 'UPDATE': {
      const next = items.map(i => i.id === action.id ? { ...i, ...action.patch } : i);
      return { ...state, items: next, history: [...history, items], future: [] };
    }
    case 'REMOVE': {
      const next = items.filter(i => i.id !== action.id);
      return { ...state, items: next, history: [...history, items], future: [] };
    }
    case 'UNDO': {
      if (!history.length) return state;
      const prev = history[history.length - 1];
      return { ...state, items: prev, history: history.slice(0, -1), future: [items, ...future] };
    }
    case 'REDO': {
      if (!future.length) return state;
      const nxt = future[0];
      return { ...state, items: nxt, history: [...history, items], future: future.slice(1) };
    }
    case 'SET_ALL':
      return { ...state, items: action.items };
    case 'SET_BG_IMAGE':
      return { ...state, bgImage: action.url };
    case 'SET_CANVAS_BG':
      return { ...state, canvasBg: action.color };
  }
};

const EMOJI_OPTIONS = {
  '표정': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
  '동물': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️', '🕸️', '🦂', '🦟', '🦠', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🦔'],
  '음식': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍷', '🥂', '🥃', '🍸', '🍹', '🧉', '🍾'],
  '활동': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥊', '🥋', '⛳', '⛸️', '🎣', '🤿', '🎽', '🛹', '🛷', '⛷️', '🏂', '🏋️‍♀️', '🏋️', '🤼‍♀️', '🤼', '🤸‍♀️', '🤸', '⛹️‍♀️', '⛹️', '🤾‍♀️', '🤾', '🏌️‍♀️', '🏌️', '🏄‍♀️', '🏄', '🏊‍♀️', '🏊', '🤽‍♀️', '🤽', '🚣‍♀️', '🚣', '🏇', '🧘‍♀️', '🧘', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🎲', '🎯', '🎳', '🎮', '🎰', '🧩', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🪝', '🧲', '🔫', '💣', '🪃', '🏹', '🪄', '🔮', '🧿', '🪬', '📿', '🧸', '🪆', '🪅', '🪩', '🎈', '🎉', '🎊', '🎎', '🎏', '🎐', '🪭', '🎀', '🎁'],
  '자연': ['🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️']
};

// 중복 제거 함수
const removeDuplicates = (arr: string[]) => Array.from(new Set(arr));

// 중복이 제거된 EMOJI_OPTIONS 생성
const UNIQUE_EMOJI_OPTIONS = Object.fromEntries(
  Object.entries(EMOJI_OPTIONS).map(([category, emojis]) => [
    category,
    removeDuplicates(emojis)
  ])
);

const FONT_OPTIONS = [
  { name: '기본', value: 'system-ui' },
  { name: '나눔고딕', value: 'var(--font-nanum-gothic)' },
  { name: '나눔명조', value: 'var(--font-nanum-myeongjo)' },
  { name: '나눔펜', value: 'var(--font-nanum-pen)' },
  { name: 'Noto Sans KR', value: 'var(--font-noto-sans-kr)' },
  { name: 'Noto Serif KR', value: 'var(--font-noto-serif-kr)' },
  { name: 'Pretendard', value: 'Pretendard' },
  { name: 'Gaegu', value: 'var(--font-gaegu)' },
  { name: 'Black Han Sans', value: 'var(--font-black-han-sans)' },
  { name: 'Do Hyeon', value: 'var(--font-do-hyeon)' },
  { name: 'Jua', value: 'var(--font-jua)' },
  { name: 'Poor Story', value: 'var(--font-poor-story)' }
];

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const bgRef   = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(reducer, {
    items: [], history: [], future: [], bgImage: undefined, canvasBg: '#ffffff'
  });
  const [exporting, setExporting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // hex → {r,g,b}
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return { r, g, b };
  };

  // load from localStorage
  useEffect(() => {
    const m = localStorage.getItem('verB-meta');
    if (m) dispatch({ type: 'SET_ALL', items: JSON.parse(m) });
    const bi = localStorage.getItem('verB-bg-image');
    if (bi) dispatch({ type: 'SET_BG_IMAGE', url: bi });
    const cb = localStorage.getItem('verB-canvas-bg');
    if (cb) dispatch({ type: 'SET_CANVAS_BG', color: cb });
  }, []);

  // save meta, bgImage, canvasBg
  useEffect(() => {
    try {
      const meta = state.items.map(i => {
        const { id, type, x, y, size, angle, opacity, bgColor, bgOpacity } = i;
        if (type === 'image') {
          return { id, type, x, y, size, angle, opacity, bgColor, bgOpacity };
        }
        const { content, color } = i;
        return { id, type, content, x, y, size, angle, color, opacity, bgColor, bgOpacity };
      });
      localStorage.setItem('verB-meta', JSON.stringify(meta));
      if (state.bgImage) localStorage.setItem('verB-bg-image', state.bgImage);
      localStorage.setItem('verB-canvas-bg', state.canvasBg);
    } catch {}
  }, [state.items, state.bgImage, state.canvasBg]);

  // add new item
  const addItem = (type: Item['type'], content: string) => {
    const item: Item = {
      id: Date.now(),
      type, content,
      x: 100, y: 100,
      size: type === 'image' ? 100 : 24,
      angle: 0,
      color: '#000000',
      opacity: 1,
      bgColor: '#ffffff',
      bgOpacity: 1,
      fontFamily: 'system-ui',
      isSelected: false
    };
    dispatch({ type: 'ADD', item });
  };

  // image upload
  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => addItem('image', r.result as string);
    r.readAsDataURL(f);
  };

  // background image upload
  const onBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => dispatch({ type: 'SET_BG_IMAGE', url: r.result as string });
    r.readAsDataURL(f);
  };

  // canvas background color change
  const onCanvasBg = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'SET_CANVAS_BG', color: e.target.value });

  // export PNG
  const exportPNG = async () => {
    setExporting(true);
    const el = document.getElementById('canvas')!;
    const prevOverflow = el.style.overflow;
    el.style.overflow = 'visible';
    
    // 캔버스 크기를 약간 더 크게 설정
    const canvasWidth = el.offsetWidth;
    const canvasHeight = el.offsetHeight;
    el.style.width = `${canvasWidth + 40}px`;
    el.style.height = `${canvasHeight + 40}px`;
    
    await new Promise(r => setTimeout(r, 100)); // 렌더링 대기
    const cv = await html2canvas(el, {
      scale: 2, // 해상도 2배로 설정
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });
    
    // 원래 크기로 복구
    el.style.width = `${canvasWidth}px`;
    el.style.height = `${canvasHeight}px`;
    el.style.overflow = prevOverflow;
    
    const url = cv.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.png';
    a.click();
    setExporting(false);
  };

  // drag logic
  const dragId   = useRef<number|null>(null);
  const startM   = useRef({ x: 0, y: 0 });
  const startBox = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (dragId.current == null) return;
      const dx = e.clientX - startM.current.x;
      const dy = e.clientY - startM.current.y;
      dispatch({
        type: 'UPDATE',
        id: dragId.current,
        patch: { x: startBox.current.x + dx, y: startBox.current.y + dy }
      });
    };
    const up = () => { dragId.current = null; };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  const onMouseDown = (id:number, e:React.MouseEvent) => {
    e.stopPropagation();
    dragId.current = id;
    startM.current = { x: e.clientX, y: e.clientY };
    const it = state.items.find(i => i.id===id)!;
    startBox.current = { x: it.x, y: it.y };
  };

  // 선택된 항목 찾기
  const selectedItem = state.items.find(item => item.isSelected);

  // 항목 선택 처리
  const selectItem = (id: number) => {
    dispatch({ type: 'SET_ALL', items: state.items.map(item => ({
      ...item,
      isSelected: item.id === id
    }))});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 상단 툴바 */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        padding: '12px 24px', 
        background: '#f5f5f5', 
        borderBottom: '1px solid #ddd',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* 왼쪽: 기본 도구 */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          paddingRight: 16, 
          borderRight: '1px solid #ddd',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => addItem('text', '텍스트')}
            style={{ padding: '8px 16px', borderRadius: 4 }}
          >
            텍스트
          </button>
          <button 
            onClick={() => setShowEmojiPicker(true)}
            style={{ padding: '8px 16px', borderRadius: 4 }}
          >
            이모지
          </button>
          <button 
            onClick={() => document.getElementById('imageUpload')?.click()}
            style={{ padding: '8px 16px', borderRadius: 4 }}
          >
            이미지
          </button>
          <button 
            onClick={() => document.getElementById('bgUpload')?.click()}
            style={{ padding: '8px 16px', borderRadius: 4 }}
          >
            배경
          </button>
          <input type="file" id="imageUpload" accept="image/*" onChange={onImage} style={{ display:'none' }}/>
          <input type="file" id="bgUpload" accept="image/*" onChange={onBgImage} style={{ display:'none' }}/>
        </div>

        {/* 중앙: 선택된 항목의 옵션 */}
        {selectedItem && (
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center'
          }}>
            {/* 크기 조절 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>크기</span>
              <button 
                onClick={() => dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { size: selectedItem.size - 4 } })}
                style={{ padding: '4px 8px', borderRadius: 4 }}
              >
                -
              </button>
              <input
                type="number"
                value={selectedItem.size}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { size: value } });
                  }
                }}
                style={{ 
                  width: '60px',
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #ddd',
                  textAlign: 'center'
                }}
              />
              <button 
                onClick={() => dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { size: selectedItem.size + 4 } })}
                style={{ padding: '4px 8px', borderRadius: 4 }}
              >
                +
              </button>
            </div>

            {/* 회전 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>회전</span>
              <button 
                onClick={() => dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { angle: selectedItem.angle - 15 } })}
                style={{ padding: '4px 8px', borderRadius: 4 }}
              >
                ↶
              </button>
              <input
                type="number"
                value={selectedItem.angle}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { angle: value } });
                  }
                }}
                style={{ 
                  width: '60px',
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #ddd',
                  textAlign: 'center'
                }}
              />
              <button 
                onClick={() => dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { angle: selectedItem.angle + 15 } })}
                style={{ padding: '4px 8px', borderRadius: 4 }}
              >
                ↷
              </button>
            </div>

            {/* 색상 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>색상</span>
              <input 
                type="color" 
                value={selectedItem.color}
                onChange={e => dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { color: e.target.value } })}
                style={{ width: 32, height: 32, padding: 0, border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>

            {/* 텍스트 전용 옵션 */}
            {selectedItem.type === 'text' && (
              <select 
                value={selectedItem.fontFamily} 
                onChange={e => dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { fontFamily: e.target.value } })}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.name}</option>
                ))}
              </select>
            )}

            {/* 이모지 전용 옵션 */}
            {selectedItem.type === 'emoji' && (
              <select
                value={selectedItem.content}
                onChange={e => dispatch({ type: 'UPDATE', id: selectedItem.id, patch: { content: e.target.value } })}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ddd' }}
              >
                {Object.entries(UNIQUE_EMOJI_OPTIONS).map(([category, emojis]) => (
                  <optgroup key={category} label={category}>
                    {emojis.map((emoji, idx) => (
                      <option key={`${category}-${emoji}-${idx}`} value={emoji}>{emoji}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}

            {/* 삭제 버튼 */}
            <button 
              onClick={() => dispatch({ type: 'REMOVE', id: selectedItem.id })}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 4,
                color: 'white',
                background: '#ff4444',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              삭제
            </button>
          </div>
        )}

        {/* 오른쪽: 캔버스 설정 */}
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          alignItems: 'center',
          marginLeft: 'auto'
        }}>
          {/* 배경색 */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>배경색</span>
            <input 
              type="color" 
              value={state.canvasBg} 
              onChange={onCanvasBg}
              style={{ width: 32, height: 32, padding: 0, border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>

          {/* 실행 취소/다시 실행 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => dispatch({ type: 'UNDO' })} 
              disabled={!state.history.length}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 4,
                opacity: state.history.length ? 1 : 0.5
              }}
            >
              ↶
            </button>
            <button 
              onClick={() => dispatch({ type: 'REDO' })} 
              disabled={!state.future.length}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 4,
                opacity: state.future.length ? 1 : 0.5
              }}
            >
              ↷
            </button>
          </div>

          {/* PNG 내보내기 */}
          <button 
            onClick={exportPNG}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 4,
              background: '#007AFF',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            PNG 내보내기
          </button>
        </div>
      </div>

      {/* 이모지 선택기 모달 */}
      {showEmojiPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            maxWidth: '80vw',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>이모지 선택</h3>
              <button onClick={() => setShowEmojiPicker(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(UNIQUE_EMOJI_OPTIONS).map(([category, emojis]) => (
                <div key={category}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{category}</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {emojis.map((emoji, idx) => (
                      <button
                        key={`${category}-${emoji}-${idx}`}
                        onClick={() => {
                          addItem('emoji', emoji);
                          setShowEmojiPicker(false);
                        }}
                        style={{
                          fontSize: '24px',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 메인 에디터 영역 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* 캔버스 */}
        <div
          id="canvas"
          style={{
            position: 'relative',
            width: 800, height: 600, margin: 'auto',
            background: state.bgImage ? `url(${state.bgImage}) center/cover` : state.canvasBg,
            border: '1px solid #ccc',
            overflow: 'hidden'
          }}
        >
          {state.items.map(item => {
            // background rgba
            const { r,g,b } = hexToRgb(item.bgColor);
            const bgRgba = `rgba(${r},${g},${b},${item.bgOpacity})`;
            return (
              <div
                key={item.id}
                onMouseDown={e => onMouseDown(item.id, e)}
                onClick={() => selectItem(item.id)}
                style={{
                  position: 'absolute',
                  left: item.x, top: item.y,
                  transform: `rotate(${item.angle}deg)`,
                  opacity: item.opacity,
                  cursor: 'move',
                  userSelect: 'none',
                  backgroundColor: 'transparent',
                  padding: 4,
                  borderRadius: 4,
                  border: item.isSelected ? '2px solid #007AFF' : 'none'
                }}
              >
                {/* 텍스트 */}
                {item.type === 'text' && (
                  <textarea
                    value={item.content ?? ''}
                    onChange={e => dispatch({ type: 'UPDATE', id: item.id, patch: { content: e.target.value } })}
                    style={{
                      fontSize: item.size,
                      width: 'auto',
                      minWidth: '100px',
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: item.color,
                      fontFamily: item.fontFamily,
                      padding: '4px 8px',
                      lineHeight: '1.2',
                      height: `${item.size * 1.5}px`,
                      boxSizing: 'border-box',
                      resize: 'none',
                      overflow: 'hidden',
                    }}
                    rows={1}
                    onInput={e => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                )}

                {/* 이모지 */}
                {item.type === 'emoji' && (
                  <div style={{ 
                    fontSize: item.size, 
                    color: item.color,
                    background: 'transparent'
                  }}>
                    {item.content}
                  </div>
                )}

                {/* 이미지 */}
                {item.type === 'image' && (
                  <img 
                    src={item.content} 
                    width={item.size} 
                    draggable={false}
                    style={{ background: 'transparent' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
