import { useState } from 'react';
import './PageStyles.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const COMPLIANCE_EVENTS = [
  { date: '2026-04-07', title: 'EMP201 Monthly Payroll', category: 'SARS', type: 'filing', status: 'overdue' },
  { date: '2026-04-25', title: 'VAT201 Bi-Monthly Return', category: 'SARS', type: 'filing', status: 'upcoming' },
  { date: '2026-05-07', title: 'EMP201 Monthly Payroll', category: 'SARS', type: 'filing', status: 'upcoming' },
  { date: '2026-05-15', title: 'CIPC Annual Return', category: 'CIPC', type: 'filing', status: 'upcoming' },
  { date: '2026-05-31', title: 'Provisional Tax (IRP6)', category: 'SARS', type: 'tax', status: 'upcoming' },
  { date: '2026-06-07', title: 'EMP201 Monthly Payroll', category: 'SARS', type: 'filing', status: 'future' },
  { date: '2026-06-30', title: 'B-BBEE Affidavit Renewal', category: 'B-BBEE', type: 'renewal', status: 'future' },
  { date: '2026-06-30', title: 'EMP501 Reconciliation', category: 'SARS', type: 'filing', status: 'future' },
  { date: '2026-07-31', title: 'COIDA Return of Earnings', category: 'Labour', type: 'filing', status: 'future' },
  { date: '2026-08-31', title: 'Income Tax Return (ITR14)', category: 'SARS', type: 'tax', status: 'future' },
  { date: '2026-09-30', title: 'OHS Inspection Due', category: 'OHS', type: 'inspection', status: 'future' },
  { date: '2026-10-31', title: 'POPIA Compliance Review', category: 'POPIA', type: 'review', status: 'future' },
];

const CATEGORY_COLORS = {
  SARS: '#e74c3c', CIPC: '#3498db', 'B-BBEE': '#2ecc71',
  Labour: '#f39c12', OHS: '#9b59b6', POPIA: '#1abc9c',
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return COMPLIANCE_EVENTS.filter(e => e.date === dateStr);
  };

  const getMonthEvents = () => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return COMPLIANCE_EVENTS.filter(e => e.date.startsWith(monthStr));
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : getMonthEvents();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F4C5}'} Compliance Calendar</h1>
        <p>Track all South African SMME compliance deadlines in one place</p>
      </div>

      <div className="calendar-controls">
        <div className="cal-nav">
          <button className="btn-icon" onClick={prevMonth}>{'\u{2190}'}</button>
          <h2>{MONTHS[month]} {year}</h2>
          <button className="btn-icon" onClick={nextMonth}>{'\u{2192}'}</button>
        </div>
        <div className="view-toggles">
          <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
          <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="calendar-grid-wrapper">
          <div className="calendar-grid">
            {DAYS.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
            {calendarDays.map((day, i) => {
              const events = day ? getEventsForDate(day) : [];
              const isToday = day === 17 && month === 4 && year === 2026;
              return (
                <div
                  key={i}
                  className={`cal-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${selectedDate === day ? 'selected' : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <span className="cal-day">{day}</span>
                      {events.length > 0 && (
                        <div className="cal-dots">
                          {events.map((e, j) => (
                            <span key={j} className="cal-dot" style={{ background: CATEGORY_COLORS[e.category] || '#666' }} title={e.title} />
                          ))}
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
          {COMPLIANCE_EVENTS.map((event, i) => (
            <div key={i} className={`event-list-item ${event.status}`}>
              <div className="event-date-badge" style={{ borderLeftColor: CATEGORY_COLORS[event.category] }}>
                {new Date(event.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
              </div>
              <div className="event-info">
                <strong>{event.title}</strong>
                <span className="event-cat">{event.category}</span>
              </div>
              <span className={`status-badge ${event.status}`}>{event.status}</span>
            </div>
          ))}
        </div>
      )}

      <div className="calendar-sidebar-events">
        <h3>{selectedDate ? `Events on ${selectedDate} ${MONTHS[month]}` : `All Events in ${MONTHS[month]}`}</h3>
        {selectedEvents.length === 0 ? (
          <p className="no-events">No compliance events on this date</p>
        ) : (
          selectedEvents.map((event, i) => (
            <div key={i} className={`event-card ${event.status}`}>
              <div className="event-color-bar" style={{ background: CATEGORY_COLORS[event.category] }} />
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>{event.category} {'\u{2022}'} {event.type} {'\u{2022}'} {new Date(event.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
