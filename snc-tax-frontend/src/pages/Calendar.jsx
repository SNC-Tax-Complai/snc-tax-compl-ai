import { useState, useEffect, useMemo } from 'react';
import { useComplianceStore } from '../stores/complianceStore';
import './PageStyles.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const CATEGORY_COLORS = {
  SARS: '#e74c3c', CIPC: '#3498db', 'B-BBEE': '#2ecc71',
  Labour: '#f39c12', OHS: '#9b59b6', POPIA: '#1abc9c',
  Municipal: '#e67e22', General: '#95a5a6',
};

// Map regulation codes/names to calendar category and colour
function categorise(code = '', name = '') {
  const u = (code + name).toUpperCase();
  if (u.includes('SARS') || u.includes('EMP') || u.includes('VAT') || u.includes('ITR') || u.includes('IRP') || u.includes('PAYE')) return 'SARS';
  if (u.includes('CIPC')) return 'CIPC';
  if (u.includes('BBEE') || u.includes('BBBEE')) return 'B-BBEE';
  if (u.includes('COIDA') || u.includes('COID') || u.includes('LABOUR') || u.includes('UIF')) return 'Labour';
  if (u.includes('OHS') || u.includes('HEALTH') || u.includes('SAFETY')) return 'OHS';
  if (u.includes('POPIA') || u.includes('PAIA')) return 'POPIA';
  if (u.includes('MUNICIPAL') || u.includes('LICENCE') || u.includes('LICENSE')) return 'Municipal';
  return 'General';
}

// Determine if a date string is past/today/upcoming
function eventStatus(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  if (eventDate < today) return 'overdue';
  const diff = Math.ceil((eventDate - today) / 86400000);
  if (diff <= 7) return 'upcoming';
  return 'future';
}

export default function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const { dashboardData, fetchDashboardData } = useComplianceStore();

  useEffect(() => {
    if (!dashboardData) fetchDashboardData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build events from real dashboard data
  const complianceEvents = useMemo(() => {
    const events = [];
    const seen = new Set();

    const addEvent = (dateStr, title, category) => {
      const key = `${dateStr}|${title}`;
      if (!seen.has(key) && dateStr) {
        seen.add(key);
        events.push({ date: dateStr, title, category, status: eventStatus(dateStr) });
      }
    };

    // Real upcoming deadlines
    (dashboardData?.upcomingDeadlines || []).forEach((d) => {
      if (d.next_due_date || d.formatted_due_date) {
        const raw = d.next_due_date || d.formatted_due_date;
        const dateStr = raw.includes('T') ? raw.split('T')[0] : raw;
        addEvent(dateStr, d.regulation_name || d.regulation_code, categorise(d.regulation_code, d.regulation_name));
      }
    });

    // Real overdue items (show as past-due on their original date if available, else today)
    (dashboardData?.overdueItems || []).forEach((o) => {
      const dateStr = o.next_due_date
        ? (o.next_due_date.includes('T') ? o.next_due_date.split('T')[0] : o.next_due_date)
        : null;
      if (dateStr) {
        addEvent(dateStr, o.regulation_name || o.regulation_code, categorise(o.regulation_code, o.regulation_name));
      }
    });

    return events.sort((a, b) => a.date.localeCompare(b.date));
  }, [dashboardData]);

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return complianceEvents.filter((e) => e.date === dateStr);
  };

  const getMonthEvents = () => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return complianceEvents.filter((e) => e.date.startsWith(monthStr));
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : getMonthEvents();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📅 Compliance Calendar</h1>
        <p>Track your South African SMME compliance deadlines — sourced from your live compliance data</p>
      </div>

      <div className="calendar-controls">
        <div className="cal-nav">
          <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>←</button>
          <h2>{MONTHS[month]} {year}</h2>
          <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>→</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="view-btn" onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
          <div className="view-toggles">
            <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="calendar-grid-wrapper">
          <div className="calendar-grid">
            {DAYS.map((d) => <div key={d} className="cal-header-cell">{d}</div>)}
            {calendarDays.map((day, i) => {
              const events = day ? getEventsForDate(day) : [];
              return (
                <div
                  key={i}
                  className={`cal-cell ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${selectedDate === day ? 'selected' : ''}`}
                  onClick={() => day && setSelectedDate(selectedDate === day ? null : day)}
                >
                  {day && (
                    <>
                      <span className="cal-day">{day}</span>
                      {events.length > 0 && (
                        <div className="cal-dots">
                          {events.slice(0, 3).map((e, j) => (
                            <span key={j} className="cal-dot" style={{ background: CATEGORY_COLORS[e.category] || '#666' }} title={e.title} />
                          ))}
                          {events.length > 3 && <span className="cal-dot-more">+{events.length - 3}</span>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="events-list-view">
          {complianceEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>No compliance events loaded yet.</p>
              <p style={{ fontSize: 13 }}>Set up your company profile to see your compliance calendar.</p>
            </div>
          ) : (
            complianceEvents.map((event, i) => (
              <div key={i} className={`event-list-item ${event.status}`}>
                <div className="event-date-badge" style={{ borderLeftColor: CATEGORY_COLORS[event.category] }}>
                  {new Date(event.date + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                </div>
                <div className="event-info">
                  <strong>{event.title}</strong>
                  <span className="event-cat">{event.category}</span>
                </div>
                <span className={`status-badge ${event.status}`}>{event.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      <div className="calendar-sidebar-events">
        <h3>
          {selectedDate
            ? `Events on ${selectedDate} ${MONTHS[month]}`
            : `${MONTHS[month]} ${year} — All Events`}
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="no-events">
            {complianceEvents.length === 0
              ? 'Set up your company compliance profile to see events.'
              : 'No compliance events on this date.'}
          </p>
        ) : (
          selectedEvents.map((event, i) => (
            <div key={i} className={`event-card ${event.status}`}>
              <div className="event-color-bar" style={{ background: CATEGORY_COLORS[event.category] }} />
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>
                  {event.category} · {new Date(event.date + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <span className={`status-badge ${event.status}`}>{event.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="legend-bar">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <span key={cat} className="legend-item">
            <span className="legend-dot" style={{ background: color }} /> {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
