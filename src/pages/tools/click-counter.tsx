import React, {useState} from 'react';
import Layout from '@theme/Layout';

export default function ClickCounter() {
  const [count, setCount] = useState(0);

  return (
    <Layout title="点击计数器" description="简单的计数器示例">
      <div className="container margin-vert--xl" style={{textAlign: 'center'}}>
        <h1>点击计数器</h1>
        <p>这是一个最基础的 React 交互示例。</p>
        
        <div style={{fontSize: '4rem', fontWeight: 'bold', margin: '2rem 0', fontFamily: 'monospace'}}>
          {count}
        </div>

        <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
          <button 
            className="button button--danger button--lg"
            onClick={() => setCount(count - 1)}>
            减少 (-)
          </button>
          <button 
            className="button button--secondary button--lg"
            onClick={() => setCount(0)}>
            重置
          </button>
          <button 
            className="button button--primary button--lg"
            onClick={() => setCount(count + 1)}>
            增加 (+)
          </button>
        </div>
        
        <div className="margin-top--xl">
          <a href="/tools" className="button button--link">← 返回实验室</a>
        </div>
      </div>
    </Layout>
  );
}
