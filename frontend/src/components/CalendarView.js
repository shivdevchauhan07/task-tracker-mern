import React, { useMemo, useState, useRef } from "react";

const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

export default function CalendarView({ tasks = [] }) {
const today = new Date();
const [currentDate, setCurrentDate] = useState(today);
const touchStartX = useRef(0);

const handleTouchStart = (e) => {
  touchStartX.current = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  const diff = touchStartX.current - e.changedTouches[0].clientX;

  if (diff > 50) nextMonth();      // Swipe left
  if (diff < -50) prevMonth();     // Swipe right
};

const goToToday = () => {
  setCurrentDate(today);
  setSelectedDay(today.getDate());
};

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= totalDays; i++) arr.push(i);
    return arr;
  }, [firstDay, totalDays]);

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  const getTasks = (day) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });
  };

  return (
    <div
  className="calendar-card"
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}>
      <div className="calendar-header">
        <button onClick={prevMonth}>◀</button>
        <h2>{monthName}</h2>
        <button onClick={nextMonth}>▶</button>
      </div>
<div className="calendar-toolbar">
  <button className="calendar-today-btn" onClick={goToToday}>
    📍 Today
  </button>
</div>
<div className="calendar-task-list">
  <h3>
    📅 {selectedDay} {monthName.split(" ")[0]}
  </h3>

  {getTasks(selectedDay).length === 0 ? (
    <p className="calendar-empty">No tasks for this day.</p>
  ) : (
    getTasks(selectedDay).map(task => (
      <div key={task._id} className="calendar-task-item">
        <span
          className="calendar-task-color"
          style={{
            background:
              PRIORITY_COLORS[task.priority] || "#2563eb",
          }}
        />
        <div>
          <strong>{task.title}</strong>
          <p>{task.status}</p>
        </div>
      </div>
    ))
  )}
</div>
      <div className="calendar-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=>(
          <div key={day} className="calendar-day-name">{day}</div>
        ))}

        {days.map((day,index)=>(
          <div key={index} className={`calendar-cell ${day ? "" : "empty"}`}>
            {day && (
              <>
              <div
  className={`calendar-date ${
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
      ? "today"
      : ""
  } ${
    day === selectedDay ? "selected" : ""
  }`}
  onClick={() => setSelectedDay(day)}
>
  {day}
</div>
{getTasks(day).length > 0 && (
  <>
    <div className="calendar-dots-row">
      {getTasks(day).slice(0,3).map(task => (
        <span
          key={task._id}
          className="calendar-dot"
          style={{
            background: PRIORITY_COLORS[task.priority] || "#2563eb",
          }}
        />
      ))}
    </div>

    {getTasks(day).length > 3 && (
      <span className="calendar-more">
        +{getTasks(day).length - 3}
      </span>
    )}
  </>
)}
              </>
                
            )}
          </div>
        ))}
      </div>
    </div>
  );
}