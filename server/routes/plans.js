const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');

function loadPlans() {
  try {
    if (fs.existsSync(PLANS_FILE)) {
      return JSON.parse(fs.readFileSync(PLANS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading plans:', e);
  }
  return { plans: [] };
}

function savePlans(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(PLANS_FILE, JSON.stringify(data, null, 2));
}

// Get all plans
router.get('/', (req, res) => {
  const data = loadPlans();
  res.json(data.plans);
});

// Create plan
router.post('/', (req, res) => {
  const { title, description, deadline, tasks } = req.body;
  const data = loadPlans();

  const plan = {
    id: uuidv4(),
    title,
    description: description || '',
    deadline: deadline || null,
    tasks: (tasks || []).map(t => ({ id: uuidv4(), text: t, completed: false })),
    createdAt: new Date().toISOString(),
    progress: 0
  };

  data.plans.push(plan);
  savePlans(data);
  res.json(plan);
});

// Update plan
router.put('/:id', (req, res) => {
  const data = loadPlans();
  const index = data.plans.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  data.plans[index] = { ...data.plans[index], ...req.body };
  const plan = data.plans[index];
  if (plan.tasks && plan.tasks.length > 0) {
    plan.progress = Math.round((plan.tasks.filter(t => t.completed).length / plan.tasks.length) * 100);
  }

  savePlans(data);
  res.json(data.plans[index]);
});

// Toggle task completion
router.patch('/:id/tasks/:taskId', (req, res) => {
  const data = loadPlans();
  const plan = data.plans.find(p => p.id === req.params.id);

  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  const task = plan.tasks.find(t => t.id === req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.completed = !task.completed;
  plan.progress = Math.round((plan.tasks.filter(t => t.completed).length / plan.tasks.length) * 100);

  savePlans(data);
  res.json(plan);
});

// Delete plan
router.delete('/:id', (req, res) => {
  const data = loadPlans();
  data.plans = data.plans.filter(p => p.id !== req.params.id);
  savePlans(data);
  res.json({ success: true });
});

module.exports = router;
