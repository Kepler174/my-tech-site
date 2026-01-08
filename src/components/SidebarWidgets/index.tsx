import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css'; // Minimal local styles for layout, reusing global for boxes

const tags = [
  { label: 'Git', permalink: '/blog/tags/git', count: 10 },
  { label: 'Pro Git 笔记', permalink: '/blog/tags/progit', count: 6 },
  { label: 'C语言', permalink: '/blog/tags/c-lang', count: 5 },
  { label: 'CLI', permalink: '/blog/tags/cli', count: 4 },
  { label: '读书笔记', permalink: '/blog/tags/reading-notes', count: 3 },
  { label: '配置详解', permalink: '/blog/tags/config', count: 2 },
  { label: '安装指南', permalink: '/blog/tags/installation', count: 1 },
];

export function TagWidget() {
  return (
    <div className="blog-widget-box">
      <div className="blog-widget-header">
        <span>🏷️ 热门标签</span>
      </div>
      <div className={styles.tagCloud}>
        {tags.map((tag) => (
          <Link
            key={tag.permalink}
            to={tag.permalink}
            className={styles.tagItem}
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DateTimeWidget() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const today = date.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today;
    days.push(
      <div key={d} className={`${styles.calendarDay} ${isToday ? styles.today : ''}`}>
        {d}
      </div>
    );
  }

  const formatTime = (i: number) => (i < 10 ? `0${i}` : i);
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  return (
    <div className="blog-widget-box">
      <div className="blog-widget-header">
        <span>📅 时间与日历</span>
      </div>
      
      {/* Clock Section */}
      <div className={styles.clockDisplay} style={{ marginBottom: '1rem', paddingBottom: '1rem' }}>
        <div className={styles.timeText}>
          {formatTime(date.getHours())}:
          {formatTime(date.getMinutes())}:
          {formatTime(date.getSeconds())}
        </div>
        <div className={styles.dateText}>
          {date.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Calendar Section */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--ifm-color-primary)' }}>
        {year}年 {monthNames[month]}
      </div>
      <div className={styles.calendarGrid}>
        <div className={styles.weekDay}>日</div>
        <div className={styles.weekDay}>一</div>
        <div className={styles.weekDay}>二</div>
        <div className={styles.weekDay}>三</div>
        <div className={styles.weekDay}>四</div>
        <div className={styles.weekDay}>五</div>
        <div className={styles.weekDay}>六</div>
        {days}
      </div>
    </div>
  );
}

export function HitokotoWidget() {
  const [quote, setQuote] = useState({ hitokoto: '正在加载...', from: '', from_who: '' });
  const [loading, setLoading] = useState(false);

  const fetchQuote = () => {
    if (loading) return;
    setLoading(true);
    fetch('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=i&max_length=50')
      .then(res => res.json())
      .then(data => {
        setQuote(data);
        setLoading(false);
      })
      .catch(() => {
        setQuote({ hitokoto: '今天也要开心哦！', from: 'System', from_who: null });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="blog-widget-box">
      <div className="blog-widget-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>💬 每日一言</span>
        <button 
          onClick={fetchQuote} 
          title="换一句"
          style={{ 
            cursor: 'pointer', 
            border: 'none', 
            background: 'transparent', 
            fontSize: '1.2rem',
            opacity: 0.6,
            transition: 'transform 0.3s'
          }}
          className={loading ? styles.spin : ''}
        >
          🔄
        </button>
      </div>
      <div style={{ fontSize: '0.95rem', lineHeight: '1.6', fontFamily: '"KaiTi", "楷体", serif' }}>
        <p style={{ marginBottom: '0.8rem', fontStyle: 'italic' }}>“ {quote.hitokoto} ”</p>
        <p style={{ textAlign: 'right', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.85rem', margin: 0 }}>
          —— {quote.from_who ? `${quote.from_who} ` : ''}《{quote.from}》
        </p>
      </div>
    </div>
  );
}

export function SiteInfoWidget() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    // 假设建站日期为 2025-01-01
    const start = new Date('2025-01-01').getTime();
    const now = new Date().getTime();
    setDays(Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  }, []);

  return (
    <div className="blog-widget-box">
      <div className="blog-widget-header">
        <span>📊 站点统计</span>
      </div>
      <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>运行天数：</span>
          <span style={{ fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>{days} 天</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>文章总数：</span>
          <span style={{ fontWeight: 'bold' }}>12 篇</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>最后更新：</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function RightSidebar() {
  return (
    <div className={styles.rightSidebar}>
      <TagWidget />
      <HitokotoWidget />
      <DateTimeWidget />
    </div>
  );
}
