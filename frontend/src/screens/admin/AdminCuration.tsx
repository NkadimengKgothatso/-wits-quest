import { useState } from 'react';

type Column = 'drafts' | 'review' | 'published' | 'retired';

interface ContentCard {
  id: number;
  text: string;
  author: string;
  date: string;
  failRate?: number;
  type: 'trivia' | 'card';
  col: Column;
}

const INITIAL_ITEMS: ContentCard[] = [
  { id: 1, text: 'What year was the Wits Medical School accredited?', author: 'Dr. Mokoena', date: 'Aug 1', type: 'trivia', col: 'drafts' },
  { id: 2, text: 'Card: Cullen Archive (Rare, Knowledge)', author: 'L. Dlamini', date: 'Aug 2', type: 'card', col: 'drafts' },
  { id: 3, text: 'What architectural style defines the Great Hall facade?', author: 'Prof. Sithole', date: 'Jul 30', failRate: 91, type: 'trivia', col: 'review' },
  { id: 4, text: 'Card: Origins Fossil (Common, Heritage)', author: 'A. Zulu', date: 'Jul 28', type: 'card', col: 'review' },
  { id: 5, text: 'In which year was the Wits Great Hall inaugurated?', author: 'Prof. Khumalo', date: 'Jul 20', failRate: 42, type: 'trivia', col: 'published' },
  { id: 6, text: 'Card: Great Hall Pillars (Legendary)', author: 'Admin', date: 'Jul 15', type: 'card', col: 'published' },
  { id: 7, text: 'Which sport does Wits not officially field?', author: 'B. Hadebe', date: 'Jun 10', failRate: 28, type: 'trivia', col: 'retired' },
];

const COLUMNS: { id: Column; label: string; color: string }[] = [
  { id: 'drafts', label: 'Drafts', color: '#dca668' },
  { id: 'review', label: 'Pending Review', color: '#e8c99a' },
  { id: 'published', label: 'Published', color: '#dca668' },
  { id: 'retired', label: 'Retired', color: '#6b7d2c' },
];

export default function AdminCuration() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function moveItem(id: number, to: Column) {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, col: to } : item));
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div style={{ padding: '16px', minHeight: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Curation Governance Board</h2>
        <p style={{ fontSize: 12, color: '#dca668', margin: 0 }}>Review, approve, and manage Wits campus content lifecycle</p>
      </div>

      {/* Campaign scheduler */}
      <div className="glass-dark" style={{ borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#dca668', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Campaign Scheduler — Bulk Activation
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
            <input type="date" className="input-glass" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ flex: 1 }} />
            <span style={{ color: '#dca668' }}>to</span>
            <input type="date" className="input-glass" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ flex: 1 }} />
          </div>
          <button className="btn-peach" style={{ fontSize: 12, padding: '10px 16px', whiteSpace: 'nowrap', borderRadius: 8 }}>
            Bulk Activate Campaign
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.col === col.id);
          return (
            <div key={col.id} className="kanban-col" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Column header */}
              <div style={{
                padding: '10px 12px',
                background: `${col.color}18`,
                border: `1px solid ${col.color}35`,
                borderRadius: '10px 10px 0 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: col.color }}>{col.label}</span>
                <span style={{
                  background: `${col.color}25`, color: col.color,
                  borderRadius: '99px', padding: '2px 8px', fontSize: 11, fontWeight: 800,
                }}>
                  {colItems.length}
                </span>
              </div>

              {/* Column body */}
              <div style={{
                flex: 1,
                background: 'rgba(84, 68, 27, 0.4)',
                border: `1px solid ${col.color}25`,
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                padding: 8,
                display: 'flex', flexDirection: 'column', gap: 8,
                minHeight: 200,
              }}>
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(107, 125, 44, 0.35)',
                      border: `1px solid ${item.failRate && item.failRate > 85 ? 'rgba(220, 166, 104, 0.5)' : 'rgba(220, 166, 104, 0.2)'}`,
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    {/* Failure rate alert */}
                    {item.failRate && item.failRate > 85 && (
                      <div style={{
                        background: 'rgba(220, 166, 104, 0.15)', borderRadius: 6,
                        padding: '3px 7px', marginBottom: 6,
                        fontSize: 9, color: '#dca668', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 4,
                        border: '1px solid rgba(220, 166, 104, 0.3)'
                      }}>
                        HIGH FAIL RATE ({item.failRate}%)
                      </div>
                    )}

                    <div style={{ fontSize: 11, fontWeight: 600, color: 'white', marginBottom: 6, lineHeight: 1.3 }}>
                      <span style={{ fontSize: 9, color: '#e8c99a', fontWeight: 700, marginRight: 4 }}>[{item.type.toUpperCase()}]</span>
                      {item.text}
                    </div>
                    <div style={{ fontSize: 9, color: '#dca668', marginBottom: 8 }}>
                      {item.author} · {item.date}
                      {item.failRate && <span style={{ marginLeft: 4, color: item.failRate > 85 ? '#dca668' : '#dca668' }}>· {item.failRate}% fail</span>}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {col.id === 'review' && (
                        <>
                          <button
                            onClick={() => moveItem(item.id, 'published')}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(220, 166, 104, 0.4)', background: 'rgba(220, 166, 104, 0.2)', color: '#dca668', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                          >Approve</button>
                          <button
                            onClick={() => moveItem(item.id, 'drafts')}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(232, 201, 154, 0.4)', background: 'rgba(232, 201, 154, 0.2)', color: '#e8c99a', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                          >Edit</button>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(220, 166, 104, 0.3)', background: 'rgba(107, 125, 44, 0.3)', color: '#dca668', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                          >Reject</button>
                        </>
                      )}
                      {col.id === 'drafts' && (
                        <button
                          onClick={() => moveItem(item.id, 'review')}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(232, 201, 154, 0.4)', background: 'rgba(232, 201, 154, 0.2)', color: '#e8c99a', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                        >Submit for Review</button>
                      )}
                      {col.id === 'published' && (
                        <button
                          onClick={() => moveItem(item.id, 'retired')}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(220, 166, 104, 0.3)', background: 'rgba(107, 125, 44, 0.3)', color: '#dca668', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                        >Archive</button>
                      )}
                    </div>
                  </div>
                ))}
                {colItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 20, color: 'rgba(220, 166, 104, 0.3)', fontSize: 12 }}>No items</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
