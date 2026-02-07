import React, { useState, useEffect } from 'react';
import { plansApi } from '../services/api';

function Plans() {
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', tasks: '' });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const data = await plansApi.getAll();
    setPlans(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await plansApi.create({
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline || null,
      tasks: formData.tasks.split('\n').filter(t => t.trim())
    });

    setFormData({ title: '', description: '', deadline: '', tasks: '' });
    setShowForm(false);
    loadPlans();
  };

  const toggleTask = async (planId, taskId) => {
    await plansApi.toggleTask(planId, taskId);
    loadPlans();
  };

  const deletePlan = async (id) => {
    if (window.confirm('确定要删除这个计划吗？')) {
      await plansApi.delete(id);
      loadPlans();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>写作计划</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '新建计划'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>计划标题 *</label>
              <input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：完成毕业论文"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>描述</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="计划的详细描述..."
                style={{ minHeight: 80 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>截止日期</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>任务列表（每行一个）</label>
              <textarea
                value={formData.tasks}
                onChange={e => setFormData({ ...formData, tasks: e.target.value })}
                placeholder="收集资料&#10;完成初稿&#10;修改润色"
                style={{ minHeight: 100 }}
              />
            </div>
            <button className="btn btn-primary" type="submit">创建计划</button>
          </form>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          还没有写作计划，点击"新建计划"开始吧
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {plans.map(plan => (
            <div key={plan.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3>{plan.title}</h3>
                <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => deletePlan(plan.id)}>
                  删除
                </button>
              </div>
              {plan.description && <p style={{ color: '#6b7280', marginBottom: 12 }}>{plan.description}</p>}
              {plan.deadline && <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>截止：{plan.deadline}</p>}

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span>进度</span>
                  <span>{plan.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${plan.progress}%` }} />
                </div>
              </div>

              {plan.tasks && plan.tasks.length > 0 && (
                <div>
                  {plan.tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(plan.id, task.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <span style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: '2px solid',
                        borderColor: task.completed ? '#10b981' : '#d1d5db',
                        background: task.completed ? '#10b981' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12
                      }}>
                        {task.completed && '✓'}
                      </span>
                      <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#9ca3af' : '#333' }}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Plans;
