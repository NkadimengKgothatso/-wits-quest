import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Users, Swords, Filter, ArrowUpDown, Radio, Shield, Zap, Sparkles } from 'lucide-react';
import { MockUser, getRegisteredStudentOpponents } from '../services/mockDbClient';

interface StudentOpponentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  selectedOpponentId?: string;
  onSelectStudent: (student: MockUser) => void;
}

type SortOption = 'online_first' | 'elo_desc' | 'level_desc' | 'name_asc';
type TierFilter = 'ALL' | 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

const TIER_COLORS: Record<string, string> = {
  DIAMOND: '#b0cbe6',
  PLATINUM: '#a4b5d1',
  GOLD: '#fed6ce',
  SILVER: '#9ca3af',
  BRONZE: '#496894',
};

export default function StudentOpponentDrawer({
  isOpen,
  onClose,
  currentUserId,
  selectedOpponentId,
  onSelectStudent,
}: StudentOpponentDrawerProps) {
  const [students, setStudents] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('online_first');

  // Load registered students from database
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadOpponents() {
      setLoading(true);
      try {
        const list = await getRegisteredStudentOpponents(currentUserId);
        if (isMounted) {
          setStudents(list);
        }
      } catch (err) {
        console.error('[OpponentDrawer] Error querying student opponents:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOpponents();
    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUserId]);

  // Compute live online & total counts
  const onlineCount = useMemo(() => students.filter((s) => s.isOnline).length, [students]);
  const totalCount = students.length;

  // Filter & Sort student list dynamically
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search query filter (name, username, student number)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          s.username.toLowerCase().includes(q) ||
          s.studentNumber.includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    // Tier filter
    if (selectedTier !== 'ALL') {
      result = result.filter((s) => s.divisionTier === selectedTier);
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'online_first') {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return b.eloRating - a.eloRating;
      }
      if (sortBy === 'elo_desc') return b.eloRating - a.eloRating;
      if (sortBy === 'level_desc') return b.level - a.level;
      if (sortBy === 'name_asc') {
        const nameA = a.name || a.username;
        const nameB = b.name || b.username;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return result;
  }, [students, searchQuery, selectedTier, sortBy]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 18, 36, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'all 0.3s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Side Drawer Panel */}
      <div
        className="glass-modal slide-up"
        style={{
          width: '100%',
          maxWidth: 480,
          height: '100vh',
          background: 'radial-gradient(ellipse at 80% 10%, #1e365d 0%, #13223f 60%, #0d162a 100%)',
          borderLeft: '1px solid rgba(254, 214, 206, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '20px 20px 14px',
          borderBottom: '1px solid rgba(164, 181, 209, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} color="#fed6ce" />
              <h2 style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '0.02em' }}>
                Campus Student Directory
              </h2>
            </div>
            <div style={{ fontSize: 11, color: '#a4b5d1', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#4ade80', fontWeight: 700 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
                  boxShadow: '0 0 8px #4ade80', display: 'inline-block'
                }} />
                {onlineCount} Online Now
              </span>
              <span>•</span>
              <span>{totalCount} Database Registered</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(73, 104, 148, 0.3)',
              border: '1px solid rgba(164, 181, 209, 0.25)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a4b5d1',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(164, 181, 209, 0.12)' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search
              size={15}
              color="#a4b5d1"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search student by name, @username, or student #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 36px',
                borderRadius: 10,
                background: 'rgba(15, 26, 46, 0.8)',
                border: '1px solid rgba(164, 181, 209, 0.25)',
                color: 'white',
                fontSize: 12,
                fontFamily: 'Outfit, sans-serif',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#a4b5d1', cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Division Tier Filter Pills */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a4b5d1', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={10} color="#a4b5d1" /> FILTER BY DIVISION TIER:
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {(['ALL', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'] as const).map((tier) => {
                const isActive = selectedTier === tier;
                const tierColor = TIER_COLORS[tier] || '#fed6ce';
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: `1px solid ${isActive ? tierColor : 'rgba(164,181,209,0.2)'}`,
                      background: isActive ? `${tierColor}25` : 'rgba(15, 26, 46, 0.6)',
                      color: isActive ? tierColor : '#a4b5d1',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tier}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Order Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a4b5d1', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpDown size={10} color="#a4b5d1" /> SORT ORDER:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                background: 'rgba(15, 26, 46, 0.8)',
                border: '1px solid rgba(164, 181, 209, 0.25)',
                color: '#fed6ce',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="online_first">Online First (Highest Elo)</option>
              <option value="elo_desc">Highest Elo Rating</option>
              <option value="level_desc">Highest Level</option>
              <option value="name_asc">Name (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Student List View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#fed6ce', fontSize: 13, fontWeight: 700 }}>
              <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: '#fed6ce' }} />
              Querying Database Student Registry...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#a4b5d1', fontSize: 12 }}>
              No registered students match your search filter criteria.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = selectedOpponentId === student.id;
              const tierColor = TIER_COLORS[student.divisionTier] || '#fed6ce';
              const name = student.name || student.username;
              const initials = student.initials || name.substring(0, 2).toUpperCase();

              return (
                <div
                  key={student.id}
                  onClick={() => {
                    onSelectStudent(student);
                    onClose();
                  }}
                  style={{
                    background: isSelected ? 'rgba(254, 214, 206, 0.16)' : 'rgba(17, 30, 54, 0.7)',
                    border: `1.5px solid ${isSelected ? '#fed6ce' : 'rgba(164, 181, 209, 0.2)'}`,
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(254, 214, 206, 0.2)' : 'none',
                  }}
                >
                  {/* Left: Avatar with Online indicator */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b5984, #1d3156)',
                        border: `2px solid ${tierColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: tierColor,
                        fontSize: 14,
                      }}
                    >
                      {initials}
                    </div>
                    {/* Status Dot */}
                    <div
                      title={student.isOnline ? 'Online Now' : 'Offline'}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: student.isOnline ? '#4ade80' : '#64748b',
                        border: '2px solid #0f1a2e',
                        boxShadow: student.isOnline ? '0 0 8px #4ade80' : 'none',
                      }}
                    />
                  </div>

                  {/* Middle: Student Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: `${tierColor}20`,
                          color: tierColor,
                          border: `1px solid ${tierColor}40`,
                        }}
                      >
                        {student.divisionTier}
                      </span>
                    </div>

                    <div style={{ fontSize: 10, color: '#a4b5d1', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>@{student.username}</span>
                      <span>•</span>
                      <span>#{student.studentNumber}</span>
                    </div>

                    <div style={{ fontSize: 10, color: '#fed6ce', marginTop: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>Lv.{student.level} Explorer</span>
                      <span>{student.eloRating.toLocaleString()} Elo</span>
                      <span style={{ color: '#a4b5d1' }}>
                        {student.pvpWins}W / {student.pvpLosses}L
                      </span>
                    </div>
                  </div>

                  {/* Right: Challenge CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStudent(student);
                      onClose();
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: isSelected ? '#fed6ce' : student.isOnline ? 'rgba(254,214,206,0.2)' : 'rgba(73,104,148,0.3)',
                      border: `1px solid ${isSelected ? '#fed6ce' : student.isOnline ? '#fed6ce' : 'rgba(164,181,209,0.3)'}`,
                      color: isSelected ? '#1d3156' : student.isOnline ? '#fed6ce' : '#a4b5d1',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Swords size={12} />
                    <span>{isSelected ? 'Selected' : 'Challenge'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
