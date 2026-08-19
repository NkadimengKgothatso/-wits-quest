//AdminEvents.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getCards,
  type CampusEvent,
  type Card,
} from '../../services/apiClient';

const WITS_CENTER: [number, number] = [-26.192885679106496, 28.030521047594373];
const DEFAULT_ZOOM = 18;



const selectedIcon = new L.DivIcon({
  className: 'admin-selected-marker',
  html: `<div class="admin-selected-pin"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function getEventHeatIcon(inRange: boolean) {
  return new L.DivIcon({
    className: 'event-heat-marker',
    html: `
      <div class="event-heat-pin ${inRange ? 'in-range' : 'out-of-range'}">
        <span class="event-icon" style="display: block; width: 12px; height: 12px; border-radius: 50%; background: white;"></span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function haversineDistance(
  pos1: [number, number],
  pos2: [number, number]
): number {
  const R = 6371000;
  const lat1 = (pos1[0] * Math.PI) / 180;
  const lat2 = (pos2[0] * Math.PI) / 180;
  const deltaLat = ((pos2[0] - pos1[0]) * Math.PI) / 180;
  const deltaLon = ((pos2[1] - pos1[1]) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return R * (2 * Math.asin(Math.sqrt(a)));
}

const userLocationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `
    <div class="user-location-pin">
      <div class="user-location-glow"></div>
      <div class="user-location-head">
        <div class="user-location-dot"></div>
      </div>
      <div class="user-location-point"></div>
    </div>
  `,
  iconSize: [42, 50],
  iconAnchor: [21, 47],
  popupAnchor: [0, -42],
});

function MapResizeHandler() {
  const map = useMap();
  useState(() => {
    setTimeout(() => map.invalidateSize(), 100);
  });
  return null;
}

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, DEFAULT_ZOOM, { animate: true, duration: 1 });
  }, [center, map]);
  return null;
}

function EventPlacementHandler({
  onPick,
}: {
  onPick: (position: [number, number]) => void;
}) {
  useMap().on('click', (e) => {
    onPick([e.latlng.lat, e.latlng.lng]);
  });
  return null;
}

function todayInputValue(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDateInput(date: string | Date | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

const THEME = {
  bg: '#7a5c3e',
  card: '#f5ecd7',
  cardDark: '#e8d9b8',
  text: '#4a3620',
  muted: '#7a6644',
  accent: '#D37A32',
  border: '#4a3620',
  danger: '#b3261e',
  success: '#2e7d32',
};

export default function AdminEvents() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eventName, setEventName] = useState('');
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState(25);
  const [startDate, setStartDate] = useState(todayInputValue());
  const [endDate, setEndDate] = useState(todayInputValue());
  const [cardReward, setCardReward] = useState('');
  const [xpAward, setXpAward] = useState(100);
  const [essenceAward, setEssenceAward] = useState(50);
  const [active, setActive] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [data, cardsData] = await Promise.all([getEvents(), getCards()]);
      setEvents(data);
      setAvailableCards(cardsData);
    } catch {
      setEvents([]);
      setAvailableCards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setEventName('');
    setPosition(null);
    setRadius(25);
    setStartDate(todayInputValue());
    setEndDate(todayInputValue());
    setCardReward('');
    setXpAward(100);
    setEssenceAward(50);
    setActive(true);
    setSavedMsg('');
    setErrorMsg('');
    setFormOpen(false);
  }

  function openNewForm() {
    setEditingId(null);
    setEventName('');
    setPosition(null);
    setRadius(25);
    setStartDate(todayInputValue());
    setEndDate(todayInputValue());
    setCardReward('');
    setXpAward(100);
    setEssenceAward(50);
    setActive(true);
    setSavedMsg('');
    setErrorMsg('');
    setFormOpen(true);
  }

  function populateForEdit(evt: CampusEvent) {
    setEditingId(evt.id);
    setEventName(evt.name);
    setPosition([evt.lat, evt.lng]);
    setRadius(evt.radius);
    setStartDate(formatDateInput(evt.startDate));
    setEndDate(formatDateInput(evt.endDate));
    setCardReward(evt.cardReward || '');
    setXpAward(evt.xpAward || 100);
    setEssenceAward(evt.essenceAward || 50);
    setActive(evt.active === 1);
    setSavedMsg('');
    setErrorMsg('');
    setFormOpen(true);
  }

  function handleMapClick(pos: [number, number]) {
    if (!formOpen) {
      openNewForm();
    }
    setPosition(pos);
    setSavedMsg('');
    setErrorMsg('');
  }



  async function handleSave() {
    if (!position) {
      setErrorMsg('Please select a location on the map');
      return;
    }
    if (!eventName.trim()) {
      setErrorMsg('Event name is required');
      return;
    }

    setIsSaving(true);
    setSavedMsg('');
    setErrorMsg('');

    const data = {
      name: eventName.trim(),
      lat: position[0],
      lng: position[1],
      radius,
      startDate,
      endDate,
      active,
      cardReward: cardReward.trim() || undefined,
      xpAward,
      essenceAward,
    };

    try {
      if (editingId) {
        await updateEvent(editingId, data);
        setSavedMsg('Event updated successfully!');
      } else {
        await createEvent(data);
        setSavedMsg('Event created successfully!');
      }
      resetForm();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
      if (editingId === id) resetForm();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete event');
    }
  }

  const mapCenter = position ?? userLoc ?? WITS_CENTER;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: THEME.bg,
        padding: '90px 24px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'Georgia, serif',
        color: THEME.text,
      }}
    >
      <style>{`

        .admin-selected-pin {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #D37A32;
          border: 3px solid #fffefc;
          box-shadow: 0 0 0 4px rgba(211, 122, 50, 0.25), 0 2px 8px rgba(0,0,0,0.4);
        }
        .adventure-tiles {
          filter: sepia(0.4) saturate(1.3) hue-rotate(-10deg) contrast(1.05);
        }

        .user-location-pin {
          position: relative;
          width: 42px;
          height: 50px;
        }

        .user-location-glow {
          position: absolute;
          width: 34px;
          height: 34px;
          top: 1px;
          left: 4px;
          border-radius: 50%;
          background: rgba(211, 122, 50, 0.35);
          filter: blur(7px);
          animation: admin-location-glow 2s ease-in-out infinite;
        }

        .user-location-head {
          position: absolute;
          top: 2px;
          left: 8px;
          width: 26px;
          height: 26px;
          border-radius: 50% 50% 50% 0;
          background: #D37A32;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-location-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #fffefc;
          transform: rotate(45deg);
        }

        .user-location-point {
          position: absolute;
          display: none;
        }

        @keyframes admin-location-glow {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.9;
          }
        }

        .event-heat-pin {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 3px solid #fffefc;
          transition: all 0.3s ease;
        }

        .event-heat-pin.in-range {
          background: #2e7d32;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.4), 0 2px 8px rgba(0,0,0,0.4);
          animation: event-heat-pulse-in 1.5s infinite;
        }

        .event-heat-pin.out-of-range {
          background: #b3261e;
          box-shadow: 0 0 0 4px rgba(179, 38, 30, 0.4), 0 2px 8px rgba(0,0,0,0.4);
          animation: event-heat-pulse-out 2s infinite;
        }

        @keyframes event-heat-pulse-in {
          0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.6); }
          70% { box-shadow: 0 0 0 15px rgba(46, 125, 50, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
        }

        @keyframes event-heat-pulse-out {
          0% { box-shadow: 0 0 0 0 rgba(179, 38, 30, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(179, 38, 30, 0); }
          100% { box-shadow: 0 0 0 0 rgba(179, 38, 30, 0); }
        }
      `}</style>

      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fffefc' }}>
          Campus Event Management
        </h2>
        <p style={{ margin: '4px 0 0', color: '#e8d9b8', fontSize: 13 }}>
          Create, edit, and delete location-gated events across Wits.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 16,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Full-height Map with floating form */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: 'relative',
            border: `2px solid ${THEME.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#f0e2c0',
          }}
        >
          <MapContainer
            center={WITS_CENTER}
            zoom={DEFAULT_ZOOM}
            maxZoom={19}
            style={{ width: '100%', height: '100%' }}
          >
            <MapCenter center={mapCenter} />
            <MapResizeHandler />
            <EventPlacementHandler onPick={handleMapClick} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              className="adventure-tiles"
            />

            {userLoc && (
              <Marker
                position={userLoc}
                icon={userLocationIcon}
              />
            )}
            {events.map((evt) => {
              const distance = userLoc ? haversineDistance(userLoc, [evt.lat, evt.lng]) : null;
              const inRange = distance !== null && distance <= evt.radius;
              return (
                <Marker
                  key={`${evt.id}-marker`}
                  position={[evt.lat, evt.lng]}
                  icon={getEventHeatIcon(inRange)}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                      populateForEdit(evt);
                    },
                  }}
                />
              );
            })}
            {position && (
              <Marker position={position} icon={getEventHeatIcon(false)} />
            )}
          </MapContainer>

          {/* Floating form panel */}
          {formOpen && (
            <div
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                bottom: 16,
                width: 340,
                background: THEME.card,
                border: `2px solid ${THEME.border}`,
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                zIndex: 1000,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  {editingId ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: THEME.muted,
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                  title="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {position && (
                <p style={{ margin: 0, fontSize: 12, color: THEME.muted }}>
                  Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Event Name</label>
                <input
                  style={inputStyle}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Great Hall History Challenge"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Card Reward</label>
                <select
                  style={inputStyle}
                  value={cardReward}
                  onChange={(e) => setCardReward(e.target.value)}
                >
                  <option value="">-- No Card Reward --</option>
                  {availableCards.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.rarity})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>XP Award</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min={0}
                    value={xpAward}
                    onChange={(e) => setXpAward(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Essence Award</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min={0}
                    value={essenceAward}
                    onChange={(e) => setEssenceAward(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Radius (m)</label>
                <input
                  style={inputStyle}
                  type="number"
                  min={5}
                  max={500}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Start</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>End</label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="active-event"
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <label htmlFor="active-event" style={{ fontSize: 13, fontWeight: 700 }}>
                  Active
                </label>
              </div>

              {savedMsg && (
                <div style={{ color: THEME.success, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {savedMsg}
                </div>
              )}
              {errorMsg && (
                <div style={{ color: THEME.danger, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    background: eventName.trim() ? '#4a3620' : '#a8987a',
                    color: '#f5ecd7',
                    fontWeight: 700,
                    border: 'none',
                    cursor: eventName.trim() && !isSaving ? 'pointer' : 'not-allowed',
                    fontSize: 14,
                  }}
                >
                  {isSaving ? 'Saving…' : editingId ? 'Update Event' : 'Create Event'}
                </button>
                {editingId && (
                  <button
                    onClick={() => handleDelete(editingId)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: THEME.danger,
                      color: '#fff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '2px solid #caa25c',
  background: '#fffefc',
  color: '#4a3620',
  outline: 'none',
  fontSize: 14,
  boxSizing: 'border-box',
  marginTop: 4,
  fontFamily: 'Georgia, serif',
};