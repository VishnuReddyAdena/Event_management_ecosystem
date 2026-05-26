import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, User, ArrowRight, CheckCircle, RotateCw } from 'lucide-react';

export default function KanbanBoard({ event }) {
  const { tasks, loadTasks, createTask, updateTaskStatus, user } = useApp();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event?._id) {
      loadTasks(event._id);
    }
  }, [event, tasks.length]); // reload if event or task count changes

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !event?._id) return;

    setLoading(true);
    try {
      await createTask({
        title: taskTitle,
        description: taskDesc,
        assignedTo: assigneeId || null,
        eventId: event._id
      });
      setTaskTitle('');
      setTaskDesc('');
      setAssigneeId('');
      setShowAddForm(false);
      loadTasks(event._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>Select an event to load Kanban desk.</div>;

  const eventTasks = tasks.filter(t => 
    (t.eventId?._id || t.eventId || t.event?._id || t.event) === event._id
  );
  const todoTasks = eventTasks.filter(t => t.status === 'todo');
  const inProgressTasks = eventTasks.filter(t => t.status === 'inProgress');
  const completedTasks = eventTasks.filter(t => t.status === 'done');

  const isOrganizer = user && user.role === 'organizer' && String(event.organizer || event.organizationId) === String(user._id);

  // Columns data
  const columns = [
    { id: 'todo', title: 'To Do', items: todoTasks },
    { id: 'inProgress', title: 'In Progress', items: inProgressTasks },
    { id: 'done', title: 'Completed', items: completedTasks }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dashboard Sub-header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Operations Desk</h3>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Manage operational tasks for {event.title}.</p>
        </div>
        
        {isOrganizer && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-glass"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Allocate New Task
          </button>
        )}
      </div>

      {/* Task Creation Form (frosted modal dropdown) */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>Configure Operation Task</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '12px' }}>
            <input
              className="input-glass"
              type="text"
              placeholder="Task summary (e.g. Set up registration tables)"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
            <input
              className="input-glass"
              type="text"
              placeholder="Description details (optional)"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
            <select
              className="input-glass"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              style={{ background: 'rgba(10, 10, 12, 0.8)', color: '#ffffff' }}
            >
              <option value="">Unassigned</option>
              {(event.volunteers || []).map(vol => {
                const id = vol._id || vol;
                const name = vol.name || `Volunteer [${String(id).substr(0,4)}]`;
                return <option key={id} value={id}>{name}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-glass" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-solid" disabled={loading} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Kanban Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', minHeight: '400px' }}>
        {columns.map(col => (
          <div
            key={col.id}
            className="glass-panel"
            style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.015)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxHeight: '550px',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 'bold' }}>{col.title}</h4>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                {col.items.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {col.items.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '12px', minHeight: '100px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Column empty</span>
                </div>
              ) : (
                col.items.map(task => {
                  const assigneeName = task.assignedToUser?.name || 
                                       (task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo.name : null) || 
                                       (event.volunteers?.find(v => String(v._id || v) === String(task.assignedTo))?.name) ||
                                       'Unassigned';
                  
                  const isAssignedToSelf = user && String(task.assignedTo) === String(user._id);
                  const showTransitionActions = isAssignedToSelf || isOrganizer;

                  return (
                    <div
                      key={task._id}
                      style={{
                        padding: '14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        position: 'relative',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      <div>
                        <h5 style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '4px' }}>{task.title}</h5>
                        {task.description && (
                          <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineClamp: 2, overflow: 'hidden' }}>
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Handler Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#d1d5db', marginTop: '4px' }}>
                        <User size={12} />
                        <span>{assigneeName}</span>
                      </div>

                      {/* Operations Flow Actions */}
                      {showTransitionActions && task.status !== 'done' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: '4px' }}>
                          {task.status === 'todo' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'inProgress')}
                              className="btn-glass"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px', background: 'rgba(255,255,255,0.08)' }}
                            >
                              Start <ArrowRight size={12} />
                            </button>
                          )}
                          {task.status === 'inProgress' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'done')}
                              className="btn-solid"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                            >
                              Finish <CheckCircle size={12} />
                            </button>
                          )}
                        </div>
                      )}
                      
                      {task.status === 'done' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '6px' }}>
                          Completed 🎉
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
