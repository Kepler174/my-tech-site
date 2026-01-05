import React, { useState, useCallback, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import clsx from 'clsx';

// 配置参数：超大画布
// const numRows = 300;
// const numCols = 400;
// const cellSize = 2; // 极小尺寸，宏观视角

// 预设配置
const presets = {
  small: { rows: 60, cols: 80, size: 10, label: '标准 (60x80)' },
  medium: { rows: 120, cols: 160, size: 5, label: '高清 (120x160)' },
  large: { rows: 300, cols: 400, size: 2, label: '超大 (300x400)' },
};

// 邻居坐标偏移量
const operations = [
  [0, 1], [0, -1], [1, -1], [-1, 1],
  [1, 1], [-1, -1], [1, 0], [-1, 0]
];

const generateEmptyGrid = (rows, cols) => {
  const grid = [];
  for (let i = 0; i < rows; i++) {
    grid.push(Array.from(Array(cols), () => 0));
  }
  return grid;
};

// 预设图案数据
const patterns = {
  glider: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]], // 滑翔机
  pulsar: [ // 脉冲星 (周期3振荡器)
    [2, 4], [2, 5], [2, 6], [2, 10], [2, 11], [2, 12],
    [4, 2], [4, 7], [4, 9], [4, 14],
    [5, 2], [5, 7], [5, 9], [5, 14],
    [6, 2], [6, 7], [6, 9], [6, 14],
    [7, 4], [7, 5], [7, 6], [7, 10], [7, 11], [7, 12],
    [9, 4], [9, 5], [9, 6], [9, 10], [9, 11], [9, 12],
    [10, 2], [10, 7], [10, 9], [10, 14],
    [11, 2], [11, 7], [11, 9], [11, 14],
    [12, 2], [12, 7], [12, 9], [12, 14],
    [14, 4], [14, 5], [14, 6], [14, 10], [14, 11], [14, 12]
  ],
  gosper: [ // 高斯帕滑翔机枪 (无限发射滑翔机)
    [5, 1], [5, 2], [6, 1], [6, 2],
    [5, 11], [6, 11], [7, 11], [4, 12], [8, 12], [3, 13], [9, 13], [3, 14], [9, 14], [6, 15], [4, 16], [8, 16], [5, 17], [6, 17], [7, 17], [6, 18],
    [3, 21], [4, 21], [5, 21], [3, 22], [4, 22], [5, 22], [2, 23], [6, 23], [1, 25], [2, 25], [6, 25], [7, 25],
    [3, 35], [4, 35], [3, 36], [4, 36]
  ],
  lwss: [ // 轻量级飞船 (Lightweight spaceship) - 向左飞行 (修正版)
    [0, 1], [0, 4],
    [1, 0],
    [2, 0], [2, 4],
    [3, 0], [3, 1], [3, 2], [3, 3]
  ],
  diehard: [ // 死硬 (Diehard) - 130代后消失
    [0, 6],
    [1, 0], [1, 1],
    [2, 1], [2, 5], [2, 6], [2, 7]
  ],
  acorn: [ // 橡子 (Acorn) - 5206代后稳定
    [0, 1], [1, 3], [2, 0], [2, 1], [2, 4], [2, 5], [2, 6]
  ],
  copperhead: [ // 铜头蛇 (Copperhead) - 2016年发现的飞船
    [0, 1], [0, 2], [0, 5], [0, 6],
    [1, 0], [1, 7],
    [2, 0], [2, 7],
    [3, 0], [3, 3], [3, 4], [3, 7],
    [4, 0], [4, 7],
    [5, 0], [5, 7],
    [6, 0], [6, 7],
    [7, 1], [7, 6],
    [8, 2], [8, 3], [8, 4], [8, 5],
    [10, 3], [10, 4],
    [11, 3], [11, 4]
  ],
  r_pentomino: [ // R-五格骨牌 (R-pentomino) - 著名的玛土撒拉
    [0, 1], [0, 2],
    [1, 0], [1, 1],
    [2, 1]
  ],
  infinite: [ // 无限增长 (Infinite Growth)
    [0, 0], [0, 1], [0, 2], [0, 4],
    [1, 0],
    [2, 3], [2, 4],
    [3, 1], [3, 2], [3, 4],
    [4, 0], [4, 2], [4, 4]
  ]
};

export default function GameOfLife() {
  const [config, setConfig] = useState(presets.large);
  const configRef = useRef(config);
  configRef.current = config;

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid(presets.large.rows, presets.large.cols);
  });

  const [generation, setGeneration] = useState(0);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  const [speed, setSpeed] = useState(50);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  
  const canvasRef = useRef(null);

  // 绘制函数：使用 Canvas API
  const drawGrid = useCallback((currentGrid) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const { rows, cols, size } = configRef.current;

    // 清空画布
    ctx.clearRect(0, 0, cols * size, rows * size);
    
    // 绘制活细胞
    ctx.fillStyle = '#25c2a0';
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (currentGrid[i][j]) {
          ctx.fillRect(j * size, i * size, size - 1, size - 1); // 减1是为了留出一点缝隙，如果size太小可以不减
        }
      }
    }
    
    // 绘制网格线 (可选，为了性能可以不画，或者画一次背景)
    if (size >= 5) { // 只有格子够大才画线
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.beginPath();
      for (let i = 0; i <= rows; i++) {
        ctx.moveTo(0, i * size);
        ctx.lineTo(cols * size, i * size);
      }
      for (let j = 0; j <= cols; j++) {
        ctx.moveTo(j * size, 0);
        ctx.lineTo(j * size, rows * size);
      }
      ctx.stroke();
    }
  }, []);

  // 每次 grid 更新时重绘
  useEffect(() => {
    drawGrid(grid);
  }, [grid, drawGrid]);

  // 加载预设图案
  const loadPattern = (patternName) => {
    setRunning(false);
    setGeneration(0);
    const { rows, cols } = configRef.current;
    const newGrid = generateEmptyGrid(rows, cols);
    const pattern = patterns[patternName];
    
    // 动态居中偏移量
    let offsetX = Math.floor(rows / 2);
    let offsetY = Math.floor(cols / 2);
    
    // 针对特定图案的微调
    if (patternName === 'glider') { offsetX = 10; offsetY = 10; }
    if (patternName === 'gosper') { offsetX = 10; offsetY = 10; }
    if (patternName === 'lwss') { offsetX = Math.floor(rows / 2); offsetY = cols - 50; } // 放在右侧
    
    // 修正偏移量，使图案中心对齐
    // 简单起见，我们假设图案中心在 (0,0) 附近，或者手动微调
    // 大部分图案定义在 (0,0) 开始，所以减去一点
    if (['diehard', 'acorn', 'r_pentomino', 'infinite', 'copperhead'].includes(patternName)) {
       // 这些图案比较小，直接居中即可
    }

    pattern.forEach(([x, y]) => {
      if (x + offsetX < rows && y + offsetY < cols && x + offsetX >= 0 && y + offsetY >= 0) {
        newGrid[x + offsetX][y + offsetY] = 1;
      }
    });
    setGrid(newGrid);
  };

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    const { rows, cols } = configRef.current;

    setGrid((g) => {
      // 注意：如果 grid 尺寸和 config 不一致（比如刚切换尺寸），可能会报错，需要防御性编程
      if (!g || g.length !== rows || g[0].length !== cols) return g;

      const nextGrid = g.map(arr => [...arr]); // 稍微快一点的浅拷贝

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          let neighbors = 0;
          operations.forEach(([x, y]) => {
            const newI = i + x;
            const newJ = j + y;
            if (newI >= 0 && newI < rows && newJ >= 0 && newJ < cols) {
              neighbors += g[newI][newJ];
            }
          });

          if (neighbors < 2 || neighbors > 3) {
            nextGrid[i][j] = 0;
          } else if (g[i][j] === 0 && neighbors === 3) {
            nextGrid[i][j] = 1;
          }
        }
      }
      return nextGrid;
    });
    
    setGeneration((gen) => gen + 1);

    setTimeout(runSimulation, speedRef.current);
  }, []);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const { rows, cols, size } = configRef.current;
    
    // 计算缩放比例 (处理 CSS maxWidth 导致的缩放)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const col = Math.floor(x / size);
    const row = Math.floor(y / size);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const newGrid = JSON.parse(JSON.stringify(grid));
      newGrid[row][col] = grid[row][col] ? 0 : 1;
      setGrid(newGrid);
    }
  };

  const changePreset = (presetKey) => {
    setRunning(false);
    const newConfig = presets[presetKey];
    setConfig(newConfig);
    configRef.current = newConfig; // 立即更新 ref 以供回调使用
    setGrid(generateEmptyGrid(newConfig.rows, newConfig.cols));
    setGeneration(0);
  };

  return (
    <Layout title="生命游戏" description="Conway's Game of Life">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--3">
            <div style={{ position: 'sticky', top: '100px', textAlign: 'left' }}>
              <h3>📜 演化规则</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                <p style={{ marginBottom: '10px' }}><strong>1. 人口过少：</strong><br/>当周围低于2个活细胞时，该细胞死亡。</p>
                <p style={{ marginBottom: '10px' }}><strong>2. 正常：</strong><br/>当周围有2个或3个活细胞时，该细胞保持原样。</p>
                <p style={{ marginBottom: '10px' }}><strong>3. 人口过多：</strong><br/>当周围有3个以上活细胞时，该细胞死亡。</p>
                <p style={{ marginBottom: '10px' }}><strong>4. 繁殖：</strong><br/>当周围有3个活细胞时，该细胞变成活细胞。</p>
              </div>
            </div>
          </div>
          <div className="col col--9">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1>🧬 康威生命游戏 </h1>
              <p>点击画布设置初始状态，或者点击“随机生成”</p>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
          <button
            className={clsx('button', running ? 'button--danger' : 'button--success')}
            onClick={() => {
              setRunning(!running);
              if (!running) {
                runningRef.current = true;
                runSimulation();
              }
            }}
          >
            {running ? '停止' : '开始'}
          </button>

          <button
            className="button button--secondary"
            onClick={() => {
              const { rows, cols } = configRef.current;
              const newGrid = [];
              for (let i = 0; i < rows; i++) {
                newGrid.push(
                  Array.from(Array(cols), () => (Math.random() > 0.7 ? 1 : 0))
                );
              }
              setGrid(newGrid);
              setGeneration(0);
            }}
          >
            随机生成
          </button>

          <button
            className="button button--secondary"
            onClick={() => {
              const { rows, cols } = configRef.current;
              setGrid(generateEmptyGrid(rows, cols));
              setRunning(false);
              setGeneration(0);
            }}
          >
            清空
          </button>
          
          <a href="/tools" className="button button--link">← 返回实验室</a>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>画布大小:</span>
          <div className="button-group">
            {Object.keys(presets).map((key) => (
              <button
                key={key}
                className={clsx('button button--sm', config.label === presets[key].label ? 'button--primary' : 'button--outline button--secondary')}
                onClick={() => changePreset(key)}
              >
                {presets[key].label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>速度:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(100 * Math.log(speed / 500) / Math.log(0.02))}
              onChange={(e) => setSpeed(Math.round(500 * Math.pow(0.02, Number(e.target.value) / 100)))}
              style={{ width: '150px' }}
            />
            <span>{speed > 137 ? '正常' : speed > 37 ? '快' : '极速'}</span>
          </div>
          
          <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
            第 {generation} 代
          </div>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{alignSelf: 'center', fontWeight: 'bold'}}>经典图案：</span>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('glider')}>滑翔机</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('lwss')}>轻量级飞船</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('pulsar')}>脉冲星</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('gosper')}>高斯帕滑翔机枪</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('diehard')}>死硬</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('acorn')}>橡子</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('copperhead')}>铜头蛇</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('r_pentomino')}>R-五格</button>
          <button className="button button--outline button--primary button--sm" onClick={() => loadPattern('infinite')}>无限增长</button>
        </div>

        <canvas
          ref={canvasRef}
          width={config.cols * config.size}
          height={config.rows * config.size}
          onClick={handleCanvasClick}
          style={{
            border: '1px solid #333',
            cursor: 'crosshair',
            maxWidth: '100%',
            backgroundColor: '#fff'
          }}
        />
        


        <div className="row margin-top--xl" style={{maxWidth: '800px', textAlign: 'left'}}>
          <div className="col col--4">
            <h3>🚀 滑翔机 (Glider)</h3>
            <p>最简单的“飞船”。它会沿着对角线移动，每4个回合移动一格。这证明了生命游戏可以产生移动的物体。</p>
          </div>
          <div className="col col--4">
            <h3>� 轻量级飞船 (LWSS)</h3>
            <p>另一种常见的移动模式，比滑翔机移动得更快，并且是水平移动的。</p>
          </div>
          <div className="col col--4">
            <h3>💓 脉冲星 (Pulsar)</h3>
            <p>最常见的周期为3的振荡器。它看起来像一颗跳动的心脏，展示了生命游戏中的稳定循环结构。</p>
          </div>
          <div className="col col--4 margin-top--lg">
            <h3>🔫 高斯帕滑翔机枪</h3>
            <p>第一个被发现的“无限繁殖”模式。它会源源不断地发射滑翔机。这个发现证明了生命游戏可以无限增长。</p>
          </div>
          <div className="col col--4 margin-top--lg">
            <h3>💀 死硬 (Diehard)</h3>
            <p>一种“玛土撒拉”结构。它在消失之前会经历130代的演化，展示了简单的初始状态如何产生复杂的短期行为。</p>
          </div>
          <div className="col col--4 margin-top--lg">
            <h3>🌰 橡子 (Acorn)</h3>
            <p>超级“玛土撒拉”。虽然只有7个细胞，但它需要5206代才能稳定下来，并产生大量的“废墟”和滑翔机。</p>
          </div>
          <div className="col col--4 margin-top--lg">
            <h3>🐍 铜头蛇 (Copperhead)</h3>
            <p>2016年才被发现的飞船。它非常特别，因为它是第一个被发现的c/10正交飞船，移动非常缓慢且优雅。</p>
          </div>
          <div className="col col--4 margin-top--lg">
            <h3>🎲 R-五格骨牌</h3>
            <p>最著名的玛土撒拉之一。虽然只有5个细胞，但它会演化很久，产生大量的后续结构。</p>
          </div>
          <div className="col col--4 margin-top--lg">
            <h3>📈 无限增长 (Infinite)</h3>
            <p>一个非常简单的初始结构，但它会以线性速度无限增长，留下一条“尾迹”。</p>
          </div>
        </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}