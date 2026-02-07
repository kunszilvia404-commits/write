import React, { useState } from 'react';
import { diagnoseApi } from '../services/api';

function Diagnose() {
  const [article, setArticle] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (article.trim().length < 50) {
      setError('请输入至少50个字符的文章内容');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await diagnoseApi.analyze(article);
      setResult(data);
    } catch (err) {
      setError('分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const renderDimension = (title, data) => {
    if (!data) return null;
    return (
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4>{title}</h4>
          <span style={{ fontWeight: 'bold', color: data.score >= 80 ? '#10b981' : data.score >= 60 ? '#f59e0b' : '#ef4444' }}>
            {data.score}分
          </span>
        </div>
        <p style={{ color: '#6b7280', marginBottom: 12 }}>{data.feedback}</p>
        {data.suggestions && data.suggestions.length > 0 && (
          <div>
            <strong>建议：</strong>
            <ul style={{ marginLeft: 20, marginTop: 8 }}>
              {data.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {data.issues && data.issues.length > 0 && (
          <div>
            <strong>问题：</strong>
            <ul style={{ marginLeft: 20, marginTop: 8 }}>
              {data.issues.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="page-title">文章诊断</h1>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 20 }}>
        <div>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>输入文章</h3>
            <textarea
              value={article}
              onChange={e => setArticle(e.target.value)}
              placeholder="在此粘贴或输入你的文章内容（至少50个字符）..."
              style={{ minHeight: 300 }}
            />
            {error && <p style={{ color: '#ef4444', marginTop: 8 }}>{error}</p>}
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? '分析中...' : '开始诊断'}
            </button>
          </div>
        </div>

        {result && (
          <div>
            <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16 }}>总体评分</h3>
              <div className={`score-circle ${getScoreClass(result.score)}`} style={{ margin: '0 auto 16px' }}>
                {result.score}
              </div>
              <p style={{ color: '#6b7280' }}>{result.summary}</p>
            </div>

            {renderDimension('结构分析', result.structure)}
            {renderDimension('逻辑分析', result.logic)}
            {renderDimension('表达分析', result.expression)}
            {renderDimension('语法检查', result.grammar)}
          </div>
        )}
      </div>
    </div>
  );
}

export default Diagnose;
