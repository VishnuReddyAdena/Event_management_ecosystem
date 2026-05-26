import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, Plus, DollarSign, Calendar, FileText } from 'lucide-react';

export default function BudgetCharts({ event }) {
  const { updateBudget } = useApp();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const budget = event.budget || { income: 0, expenses: 0, items: [] };
  const items = budget.items || [];
  const income = budget.income || 0;
  const expenses = budget.expenses || 0;
  const balance = income - expenses;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

  const handleAddLedger = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    setLoading(true);
    try {
      await updateBudget(event._id, {
        description,
        amount: Number(amount),
        type
      });
      setDescription('');
      setAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // SVG dimensions for a simple visual cash flow chart
  const svgWidth = 500;
  const svgHeight = 120;
  const padding = 20;

  // Let's plot some visual bars dynamically representing budget allocations
  const maxAmount = Math.max(income, expenses, 100);
  const incomeWidth = (income / maxAmount) * (svgWidth - padding * 2);
  const expenseWidth = (expenses / maxAmount) * (svgWidth - padding * 2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '24px' }}>
      {/* Analytics Panel */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} /> Financial Overview
        </h3>

        {/* Mini stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Revenue</span>
            <h4 style={{ fontSize: '1.15rem', marginTop: '4px', color: '#ffffff' }}>${income}</h4>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Expenses</span>
            <h4 style={{ fontSize: '1.15rem', marginTop: '4px', color: '#ffffff' }}>${expenses}</h4>
          </div>
          <div style={{
            padding: '12px', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '10px'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Net Reserve</span>
            <h4 style={{ fontSize: '1.15rem', marginTop: '4px', color: balance >= 0 ? '#ffffff' : '#8e8e93' }}>
              {balance >= 0 ? `$${balance}` : `-$${Math.abs(balance)}`}
            </h4>
          </div>
        </div>

        {/* Dynamic SVG Visualizer */}
        <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px 12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Ratio Comparison</span>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* Background grids */}
            <line x1={padding} y1={30} x2={svgWidth - padding} y2={30} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
            <line x1={padding} y1={75} x2={svgWidth - padding} y2={75} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
            
            {/* Income Bar (White) */}
            <rect x={padding} y={15} width={Math.max(10, incomeWidth)} height={24} rx={4} fill="#ffffff" opacity={0.9} />
            <text x={padding + 10} y={31} fill="#0a0a0c" fontSize="10" fontWeight="bold">REVENUE: ${income}</text>

            {/* Expense Bar (Translucent Glass Gray) */}
            <rect x={padding} y={60} width={Math.max(10, expenseWidth)} height={24} rx={4} fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
            <text x={padding + 10} y={76} fill="#ffffff" fontSize="10" fontWeight="bold">EXPENSES: ${expenses}</text>
            
            {/* Ratios text */}
            <text x={padding} y={110} fill="#9ca3af" fontSize="10">
              Allocated Expense Ratio: {expenseRatio.toFixed(1)}% of total revenue
            </text>
          </svg>
        </div>

        {/* Form to append ledger item */}
        <form onSubmit={handleAddLedger} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 'bold' }}>Record New Transaction</span>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
            <input
              className="input-glass"
              type="text"
              placeholder="Description (e.g. Venue decor, ticket sales)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              className="input-glass"
              type="number"
              placeholder="Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
            <select
              className="input-glass"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ background: 'rgba(10, 10, 12, 0.8)', color: '#ffffff' }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button type="submit" className="btn-solid" disabled={loading} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Plus size={16} /> Append Transaction Ledger
          </button>
        </form>
      </div>

      {/* Ledger Records List */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} /> Transaction Ledger
        </h3>
        <div style={{ flex: 1, maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.length === 0 ? (
            <div style={{ textCombineUpright: 'center', color: '#9ca3af', padding: '40px 0', fontSize: '0.9rem', textAlign: 'center' }}>
              No transactions logged yet. Add one to see it here.
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#ffffff' }}>{item.description}</p>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af' }}>
                    {item.type}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    color: item.type === 'income' ? '#ffffff' : '#b2b2b2'
                  }}>
                    {item.type === 'income' ? '+' : '-'}${item.amount}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
