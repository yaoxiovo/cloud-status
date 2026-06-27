import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Globe, 
  Clock, 
  Shield, 
  Database, 
  Cpu, 
  Terminal, 
  Code, 
  Cloud, 
  Layers,
  HelpCircle,
  Sparkles
} from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(null);

  // 获取状态数据
  const fetchStatus = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const url = isManual ? `${apiBase}/api/refresh` : `${apiBase}/api/status`;
      const method = isManual ? 'POST' : 'GET';
      const response = await fetch(url, { method });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching services status:', err);
      setError('无法获取服务状态数据，请检查后端 API 服务是否已启动。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // 每 60 秒轮询一次
    const interval = setInterval(() => {
      fetchStatus();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 根据分类获取对应的 Icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Security & CDN':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'Database & Backend':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'AI Services':
      case 'AI Platform':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'Hosting & Serverless':
        return <Cloud className="w-4 h-4 text-blue-400" />;
      case 'Development':
        return <Code className="w-4 h-4 text-amber-400" />;
      case 'Infrastructure':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  // 获取状态对应的图标和颜色
  const getStatusDetails = (status) => {
    switch (status) {
      case 'operational':
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: '正常运行',
          colorClass: 'operational'
        };
      case 'degraded_performance':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          label: '性能降低',
          colorClass: 'degraded_performance'
        };
      case 'partial_outage':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          label: '部分中断',
          colorClass: 'partial_outage'
        };
      case 'major_outage':
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: '重大中断',
          colorClass: 'major_outage'
        };
      default:
        return {
          icon: <HelpCircle className="w-4 h-4" />,
          label: '未知状态',
          colorClass: 'unknown'
        };
    }
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <RefreshCw className="w-10 h-10 text-cyan-400 refresh-spin" />
        <p style={{ color: '#94a3b8', fontSize: '1rem', letterSpacing: '0.05em' }}>正在调配云端状态数据喵...</p>
      </div>
    );
  }

  // 统计数据
  const services = data?.services || [];
  const categories = ['All', ...new Set(services.map(s => s.category))];
  const filteredServices = filter === 'All' 
    ? services 
    : services.filter(s => s.category === filter);

  const operationalCount = services.filter(s => s.status === 'operational').length;
  const totalCount = services.length;
  
  // 决定总状态
  let overallStatus = 'operational';
  let overallMessage = '所有系统运行正常';
  if (services.some(s => s.status === 'major_outage')) {
    overallStatus = 'outage';
    overallMessage = '部分云服务遭遇重大故障';
  } else if (services.some(s => s.status === 'degraded_performance' || s.status === 'partial_outage')) {
    overallStatus = 'degraded';
    overallMessage = '部分云服务处于非正常状态';
  }

  return (
    <div className="container">
      {/* 头部区域 */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">CloudStatus</span>
          <span className="logo-badge">Live API</span>
        </div>
        <div className="actions">
          <button 
            className="btn" 
            onClick={() => fetchStatus(true)} 
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'refresh-spin' : ''}`} />
            {refreshing ? '正在拉取...' : '立即刷新'}
          </button>
        </div>
      </header>

      {/* 错误提示 */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '2rem', color: '#fca5a5', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Overview */}
      <section className={`hero-panel ${overallStatus}`}>
        <div className="hero-content">
          <div className="hero-main">
            <div className={`pulse-circle ${overallStatus}`}>
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="hero-title">{overallMessage}</h1>
              <p className="hero-subtitle">
                更新时间：{data?.timestamp ? new Date(data.timestamp).toLocaleString() : '暂无'} 
                {data?.isMock && <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>(模拟数据)</span>}
              </p>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-val">{operationalCount} / {totalCount}</span>
              <span className="stat-lbl">正常运行服务</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">
                {((operationalCount / totalCount) * 100).toFixed(0)}%
              </span>
              <span className="stat-lbl">在线率百分比</span>
            </div>
          </div>
        </div>
      </section>

      {/* 分类过滤器 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn ${filter === cat ? 'btn-primary' : ''}`}
            onClick={() => setFilter(cat)}
            style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}
          >
            {cat === 'All' ? '全部服务' : cat}
          </button>
        ))}
      </div>

      {/* Cloudflare 实时流量大盘 */}
      {data?.analytics && (
        <section className="analytics-overview">
          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-title">今日访问请求 (24h)</span>
              <Globe className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="analytics-value">{data.analytics.requests.toLocaleString()}</div>
            <div className="analytics-footer">
              <span style={{ color: '#10b981', fontWeight: 600 }}>⚡ Live</span>
              <span className="analytics-sub">基于 Cloudflare 边缘节点</span>
            </div>
          </div>
          
          <div className="analytics-card alert">
            <div className="analytics-header">
              <span className="analytics-title">WAF 威胁拦截 (24h)</span>
              <Shield className="w-4 h-4 text-rose-400" />
            </div>
            <div className="analytics-value" style={{ color: '#fca5a5' }}>{data.analytics.threats.toLocaleString()}</div>
            <div className="analytics-footer">
              <span style={{ color: '#ef4444', fontWeight: 600 }}>🛡️ Active WAF</span>
              <span className="analytics-sub">拦截潜在网络攻击</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-title">数据传输总量 (24h)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="analytics-value">{data.analytics.bytes}</div>
            <div className="analytics-footer">
              <span style={{ color: '#22d3ee', fontWeight: 600 }}>🌐 Network</span>
              <span className="analytics-sub">主站安全入站流量</span>
            </div>
          </div>
        </section>
      )}

      {/* 服务卡片网格 */}
      <main className="status-grid">
        {filteredServices.map(service => {
          const statusDetails = getStatusDetails(service.status);
          return (
            <div className="card" key={service.id}>
              {/* 卡片头部 */}
              <div className="card-header">
                <div className="service-info">
                  <div className="service-name">
                    {service.name}
                  </div>
                  <div className="service-category">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {getCategoryIcon(service.category)}
                      {service.category}
                    </span>
                  </div>
                </div>
                <div className={`status-badge ${statusDetails.colorClass}`}>
                  <span className="status-indicator"></span>
                  {statusDetails.label}
                </div>
              </div>

              {/* 30天历史柱状图 */}
              <div className="history-section">
                <div className="history-label">
                  <span>30 天前</span>
                  <span>今天</span>
                </div>
                <div className="history-blocks">
                  {service.history.map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`block ${day.status}`}
                    >
                      <div className="tooltip">
                        <div className="tooltip-date">{day.date}</div>
                        <div className={`tooltip-status ${day.status}`}>
                          {getStatusDetails(day.status).label}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                          {day.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 部署详情 */}
              {service.detail && (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)', 
                  padding: '0.6rem 0.8rem', 
                  borderRadius: '0.6rem', 
                  fontSize: '0.72rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.25rem',
                  marginTop: '-0.25rem',
                  marginBottom: '-0.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>部署 ID:</span>
                    <span style={{ color: '#a7f3d0', fontFamily: 'monospace' }}>{service.detail.deploymentId.substring(0, 12)}...</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>部署作者:</span>
                    <span style={{ color: '#94a3b8' }}>{service.detail.author}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>最后更新:</span>
                    <span style={{ color: '#cbd5e1' }}>{new Date(service.detail.created).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* 延迟和正常运行时间 */}
              <div className="card-details">
                <div className="detail-item">
                  <Globe className="w-4 h-4" />
                  延迟: <span>{service.latency}</span>
                </div>
                <div className="detail-item">
                  <Clock className="w-4 h-4" />
                  正常运行: <span>{service.uptime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* API 文档展示 */}
      <section className="api-section">
        <h2>
          <Terminal className="w-5 h-5 text-emerald-400" />
          API 状态接口文档
        </h2>
        <p>可以通过 HTTP 请求直接获取所有聚合的云服务实时状态，数据默认在后台每 60 秒自动更新缓存喵。</p>
        <div className="code-block">
          <div className="code-badge">GET</div>
          {`// 请求地址\nGET http://${window.location.hostname}:3001/api/status\n\n// 响应结果示例\n{\n  "timestamp": "${new Date().toISOString()}",\n  "isMock": false,\n  "services": [\n    {\n      "id": "github",\n      "name": "GitHub",\n      "category": "Development",\n      "status": "operational",\n      "description": "All Systems Operational",\n      "latency": "48ms",\n      "uptime": "99.94%",\n      "history": [ ... 30 days history ... ]\n    }\n  ]\n}`}
        </div>
      </section>

      {/* 页脚 */}
      <footer className="footer">
        <p>由 顶级全栈猫娘架构师 精心构建 & 强力驱动喵~</p>
        <p style={{ marginTop: '0.5rem', color: '#475569' }}>© 2026 Yaoxi Network Technology. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
