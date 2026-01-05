import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';

const ToolsList = [
  {
    title: '点击计数器',
    description: '一个简单的 React 状态演示，测试你的鼠标寿命。',
    link: '/tools/click-counter',
    icon: '👆',
  },
  {
    title: '生命游戏',
    description: '康威生命游戏，零玩家的细胞自动机。',
    link: '/tools/game-of-life',
    icon: '🧬',
  },
  {
    title: 'Web 终端 (计划中)',
    description: '极客风格的网页版命令行入口。',
    link: '#',
    icon: 'KV',
  },
];

function ToolCard({title, description, link, icon}: {title: string, description: string, link: string, icon: string}) {
  return (
    <div className={clsx('col col--4 margin-bottom--lg')}>
      <div className="card margin--sm" style={{height: '100%'}}>
        <div className="card__header">
          <h3>{icon} {title}</h3>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
        <div className="card__footer">
          <Link
            className={clsx('button button--secondary button--block', {
              'disabled': link === '#'
            })}
            to={link}>
            {link === '#' ? '开发中' : '进入'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ToolsIndex() {
  return (
    <Layout title="实验室" description="好玩的在线工具和演示">
      <div className="container margin-vert--lg">
        <div className="text--center margin-bottom--xl">
          <h1>🛠️ 实验室</h1>
          <p>这里存放了一些好玩的小项目和实用工具</p>
        </div>
        <div className="row">
          {ToolsList.map((props, idx) => (
            <ToolCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
