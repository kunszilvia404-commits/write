const plans = new Map();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url.replace('/api/plans', '');

  try {
    if (method === 'GET' && path === '') {
      return res.json(Array.from(plans.values()));
    }

    if (method === 'POST' && path === '') {
      const { title, description, deadline, tasks } = req.body;
      const id = Date.now().toString();

      const plan = {
        id,
        title,
        description: description || '',
        deadline: deadline || null,
        tasks: (tasks || []).map((t, i) => ({
          id: `${id}-${i}`,
          text: typeof t === 'string' ? t : t.text,
          completed: false
        })),
        createdAt: new Date().toISOString(),
        progress: 0
      });

      plans.set(id, plan);
      return res.json(plan);
    }

    const idMatch = path.match(/^\/([^/]+)$/);
    if (idMatch) {
      const id = idMatch[1];
      const plan = plans.get(id);

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      if (method === 'GET') {
        return res.json(plan);
      }

      if (method === 'PUT') {
        const updatedPlan = { ...plan, ...req.body };
        if (updatedPlan.tasks && updatedPlan.tasks.length > 0) {
          updatedPlan.progress = Math.round((updatedPlan.tasks.filter(t => t.completed).length / updatedPlan.tasks.length) * 100);
        }
        plans.set(id, updatedPlan);
        return res.json(updatedPlan);
      }

      if (method === 'DELETE') {
        plans.delete(id);
        return res.json({ success: true });
      }
    }

    const taskMatch = path.match(/^\/([^/]+)\/tasks\/([^/]+)$/);
    if (method === 'PATCH' && taskMatch) {
      const [_, planId, taskId] = taskMatch;
      const plan = plans.get(planId);

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const task = plan.tasks.find(t => t.id === taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      task.completed = !task.completed;
      plan.progress = Math.round((plan.tasks.filter(t => t.completed).length / plan.tasks.length) * 100);

      return res.json(plan);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Plans error:', error);
    return res.status(500).json({ error: error.message });
  }
};
