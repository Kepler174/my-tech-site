import React, { useEffect, useState, useRef } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';

interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
  location: number;
  modifiers: string[];
  timestamp: number;
}

interface KeyDef {
  code: string;
  label: string;
  width?: number;
  spacer?: boolean;
}

const keyboardLayout: KeyDef[][] = [
  // Row 1
  [
    { code: 'Escape', label: 'Esc' },
    { code: 'spacer', label: '', width: 1 }, // Spacer
    { code: 'F1', label: 'F1' },
    { code: 'F2', label: 'F2' },
    { code: 'F3', label: 'F3' },
    { code: 'F4', label: 'F4' },
    { code: 'spacer', label: '', width: 0.5 }, // Spacer
    { code: 'F5', label: 'F5' },
    { code: 'F6', label: 'F6' },
    { code: 'F7', label: 'F7' },
    { code: 'F8', label: 'F8' },
    { code: 'spacer', label: '', width: 0.5 }, // Spacer
    { code: 'F9', label: 'F9' },
    { code: 'F10', label: 'F10' },
    { code: 'F11', label: 'F11' },
    { code: 'F12', label: 'F12' },
  ],
  // Row 2
  [
    { code: 'Backquote', label: '`' },
    { code: 'Digit1', label: '1' },
    { code: 'Digit2', label: '2' },
    { code: 'Digit3', label: '3' },
    { code: 'Digit4', label: '4' },
    { code: 'Digit5', label: '5' },
    { code: 'Digit6', label: '6' },
    { code: 'Digit7', label: '7' },
    { code: 'Digit8', label: '8' },
    { code: 'Digit9', label: '9' },
    { code: 'Digit0', label: '0' },
    { code: 'Minus', label: '-' },
    { code: 'Equal', label: '=' },
    { code: 'Backspace', label: 'Backspace', width: 2 },
  ],
  // Row 3
  [
    { code: 'Tab', label: 'Tab', width: 1.5 },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '[' },
    { code: 'BracketRight', label: ']' },
    { code: 'Backslash', label: '\\', width: 1.5 },
  ],
  // Row 4
  [
    { code: 'CapsLock', label: 'Caps', width: 1.75 },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ';' },
    { code: 'Quote', label: "'" },
    { code: 'Enter', label: 'Enter', width: 2.25 },
  ],
  // Row 5
  [
    { code: 'ShiftLeft', label: 'Shift', width: 2.25 },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ',' },
    { code: 'Period', label: '.' },
    { code: 'Slash', label: '/' },
    { code: 'ShiftRight', label: 'Shift', width: 2.75 },
  ],
  // Row 6
  [
    { code: 'ControlLeft', label: 'Ctrl', width: 1.25 },
    { code: 'MetaLeft', label: 'Win', width: 1.25 },
    { code: 'AltLeft', label: 'Alt', width: 1.25 },
    { code: 'Space', label: 'Space', width: 6.25 },
    { code: 'AltRight', label: 'Alt', width: 1.25 },
    { code: 'MetaRight', label: 'Win', width: 1.25 },
    { code: 'ContextMenu', label: 'Menu', width: 1.25 },
    { code: 'ControlRight', label: 'Ctrl', width: 1.25 },
  ],
];

export default function KeyboardTester() {
  const [lastKey, setLastKey] = useState<KeyInfo | null>(null);
  const [history, setHistory] = useState<KeyInfo[]>([]);
  const [isListening, setIsListening] = useState(true);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [apm, setApm] = useState(0);
  const [apmHistory, setApmHistory] = useState<number[]>(new Array(30).fill(0));
  
  const keyPressTimestamps = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // APM Calculation Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Keep timestamps within last 3 seconds for calculation
      keyPressTimestamps.current = keyPressTimestamps.current.filter(t => now - t <= 3000);
      
      // Calculate APM based on 3s window (projected to minute)
      // count * (60s / 3s) = count * 20
      const currentApm = Math.round(keyPressTimestamps.current.length * 20);
      
      setApm(currentApm);
      // Update graph history (keep last 3 seconds worth of data points at 100ms interval = 30 points)
      setApmHistory(prev => [...prev.slice(1), currentApm]);
    }, 100); // Update every 100ms for smoother graph
    return () => clearInterval(interval);
  }, []);

  const playSound = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      let code = e.code;

      // 根据 location 强制修正修饰键 code
      // 只要 location 不是 1 (左)，就判定为右 (解决部分设备右 Shift 报告为 Left 的问题)
      if (e.key === 'Shift') {
        code = e.location === 1 ? 'ShiftLeft' : 'ShiftRight';
      } else if (e.key === 'Control') {
        code = e.location === 1 ? 'ControlLeft' : 'ControlRight';
      } else if (e.key === 'Alt') {
        code = e.location === 1 ? 'AltLeft' : 'AltRight';
      } else if (e.key === 'Meta') {
        code = e.location === 1 ? 'MetaLeft' : 'MetaRight';
      }

      // Record key press for APM
      if (!e.repeat) {
        playSound();
        keyPressTimestamps.current.push(Date.now());
      }
      
      // Mark as pressed (light green)
      if (code) {
        setPressedKeys(prev => new Set(prev).add(code));
      }

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.altKey) modifiers.push('Alt');
      if (e.metaKey) modifiers.push('Meta');

      const keyInfo: KeyInfo = {
        key: e.key,
        code: code || 'Unknown',
        keyCode: e.keyCode,
        location: e.location,
        modifiers: modifiers,
        timestamp: Date.now(),
      };

      setLastKey(keyInfo);
      setHistory((prev) => [...prev.slice(-19), keyInfo]);
      if (code) {
        setActiveKeys((prev) => new Set(prev).add(code));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      
      let code = e.code;
      
      // 同样在松开时修正 code，确保高亮能正确消失
      if (e.key === 'Shift') {
        code = e.location === 1 ? 'ShiftLeft' : 'ShiftRight';
      } else if (e.key === 'Control') {
        code = e.location === 1 ? 'ControlLeft' : 'ControlRight';
      } else if (e.key === 'Alt') {
        code = e.location === 1 ? 'AltLeft' : 'AltRight';
      } else if (e.key === 'Meta') {
        code = e.location === 1 ? 'MetaLeft' : 'MetaRight';
      }

      if (code) {
        setActiveKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(code);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, isSoundEnabled]);

  const clearHistory = () => {
    setHistory([]);
    setLastKey(null);
    setActiveKeys(new Set());
    setPressedKeys(new Set());
    keyPressTimestamps.current = [];
    setApm(0);
    setApmHistory(new Array(30).fill(0));
  };

  // Simple Sparkline Component
  const Sparkline = ({ data, width, height, color }: { data: number[], width: number, height: number, color: string }) => {
    const max = Math.max(...data, 10); // Minimum scale of 10
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <Layout title="键盘键值测试器" description="Keyboard KeyCode Tester">
      <div className="container margin-vert--md">
        <div className="row">
          <div className="col col--12 text--center">
            <h2>⌨️ 键盘键值测试器</h2>
            
            <div className="margin-bottom--sm">
              <button 
                className={clsx('button button--sm margin-right--sm', isListening ? 'button--danger' : 'button--success')}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? '停止监听' : '开始监听'}
              </button>
              <button 
                className={clsx('button button--sm margin-right--sm', isSoundEnabled ? 'button--primary' : 'button--secondary')}
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                title="开关键盘音效"
              >
                {isSoundEnabled ? '🔊 音效开' : '🔇 音效关'}
              </button>
              <button className="button button--sm button--secondary" onClick={clearHistory}>
                清空历史
              </button>
              <a href="/tools" className="button button--sm button--link">← 返回实验室</a>
            </div>
          </div>
        </div>

        <div className="row margin-top--sm">
          {/* 左侧区域：键盘 + 显示 + 详情 */}
          <div className="col col--9">
            {/* 虚拟键盘显示区域 */}
            <div className="card shadow--md padding--sm margin-bottom--sm" style={{ overflowX: 'auto' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px', 
                minWidth: '720px',
                margin: '0 auto',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}>
                {keyboardLayout.map((row, rowIndex) => (
                  <div key={rowIndex} style={{ display: 'flex', gap: '4px' }}>
                    {row.map((key, keyIndex) => {
                      const baseSize = 42; // 调整按键尺寸
                      if (key.code === 'spacer') {
                        return <div key={keyIndex} style={{ width: `${(key.width || 1) * baseSize}px` }} />;
                      }
                      const isActive = activeKeys.has(key.code);
                      const isPressed = pressedKeys.has(key.code);
                      
                      let bgColor = '#fff';
                      let textColor = '#333';
                      let transform = 'none';
                      let boxShadow = '0 1px 0 #ccc';

                      if (isActive) {
                        bgColor = 'var(--ifm-color-primary)';
                        textColor = '#fff';
                        transform = 'translateY(1px)';
                        boxShadow = 'inset 0 0 5px rgba(0,0,0,0.3)';
                      } else if (isPressed) {
                        bgColor = '#e6f7e6'; // 浅绿色表示已按过
                        textColor = '#006600';
                      }

                      return (
                        <div
                          key={key.code}
                          style={{
                            width: `${(key.width || 1) * baseSize}px`,
                            height: `${baseSize}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: bgColor,
                            color: textColor,
                            border: '1px solid #999',
                            borderRadius: '3px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: boxShadow,
                            transform: transform,
                            transition: 'all 0.05s',
                            userSelect: 'none'
                          }}
                        >
                          {key.label}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* 主要显示区域 */}
            <div className="card shadow--md margin-bottom--sm" style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', padding: '1rem', gap: '2rem' }}>
              {lastKey ? (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ifm-color-primary)', lineHeight: 1 }}>
                      {lastKey.key === ' ' ? '(Space)' : lastKey.key}
                    </div>
                    {lastKey.modifiers.length > 0 && (
                      <div className="margin-top--xs">
                        {lastKey.modifiers.map(mod => (
                          <span key={mod} className="badge badge--warning margin-right--xs" style={{ fontSize: '0.6rem' }}>{mod}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ borderLeft: '1px solid #ccc', height: '40px' }}></div>
                  <div style={{ fontSize: '1.1rem', color: 'var(--ifm-color-emphasis-600)' }}>
                    <div>Code: <strong>{lastKey.code}</strong></div>
                    <div>KeyCode: <strong>{lastKey.keyCode}</strong></div>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '1.5rem', color: 'var(--ifm-color-emphasis-400)' }}>
                  等待输入...
                </div>
              )}
            </div>

            {/* 详细信息卡片 */}
            {lastKey && (
              <div className="row">
                <div className="col col--3">
                  <div className="card">
                    <div className="card__header padding-vert--xs padding-horiz--sm"><h3>event.key</h3></div>
                    <div className="card__body padding-vert--xs padding-horiz--sm">
                      <h3 className="margin-bottom--none">{lastKey.key}</h3>
                    </div>
                  </div>
                </div>
                <div className="col col--3">
                  <div className="card">
                    <div className="card__header padding-vert--xs padding-horiz--sm"><h3>event.code</h3></div>
                    <div className="card__body padding-vert--xs padding-horiz--sm">
                      <h3 className="margin-bottom--none">{lastKey.code}</h3>
                    </div>
                  </div>
                </div>
                <div className="col col--3">
                  <div className="card">
                    <div className="card__header padding-vert--xs padding-horiz--sm"><h3>event.which</h3></div>
                    <div className="card__body padding-vert--xs padding-horiz--sm">
                      <h3 className="margin-bottom--none">{lastKey.keyCode}</h3>
                    </div>
                  </div>
                </div>
                <div className="col col--3">
                  <div className="card">
                    <div className="card__header padding-vert--xs padding-horiz--sm"><h3>Location</h3></div>
                    <div className="card__body padding-vert--xs padding-horiz--sm">
                      <h3 className="margin-bottom--none">{lastKey.location}</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧区域：APM + 历史记录 */}
          <div className="col col--3">
            {/* APM Widget */}
            <div className="card shadow--md margin-bottom--sm">
              <div className="card__body padding--sm text--center">
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>⚡ APM (Actions Per Minute)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ifm-color-primary)', lineHeight: 1 }}>
                  {apm}
                </div>
                <div style={{ height: '40px', marginTop: '10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Sparkline data={apmHistory} width={150} height={40} color="var(--ifm-color-primary)" />
                </div>
              </div>
            </div>

            {/* 历史记录 */}
            <div className="card shadow--md" style={{ height: 'calc(100vh - 350px)', maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
              <div className="card__header padding-vert--sm">
                <h3 className="margin-bottom--none">📜 历史</h3>
              </div>
              <div className="card__body" style={{ overflowY: 'auto', flex: 1, padding: '0' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {history.map((item, index) => (
                    <li key={index} style={{ 
                      padding: '5px 10px', 
                      borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                      backgroundColor: index === history.length - 1 ? 'var(--ifm-color-emphasis-100)' : 'transparent',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8em', color: '#999', fontFamily: 'monospace' }}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <strong style={{ color: 'var(--ifm-color-primary)' }}>{item.key === ' ' ? 'Space' : item.key}</strong>
                        </div>
                        <code>{item.code}</code>
                      </div>
                    </li>
                  ))}
                  {history.length === 0 && <li className="padding--md text--center text--secondary">暂无记录</li>}
                </ul>
                <div ref={historyEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
