import React, { useMemo } from "react";
import "../aashiq-styles/health-dashboard.css";

function generateLast30Days() {
  const today = new Date();
  const days = [];

  // Generate 30 days: oldest first, latest last
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    // Simple pattern-based mock data (not random, just varied)
    const dayIndex = 29 - i;

    const steps = 6500 + (dayIndex % 7) * 800; // 6500–12100
    const sleepHours = 6 + ((dayIndex % 5) * 0.5); // 6–8 h
    const waterLiters = 1.5 + ((dayIndex % 4) * 0.3); // 1.5–2.4 L

    days.push({
      date: d,
      steps,
      sleepHours,
      waterLiters,
    });
  }

  return days;
}

export default function HealthDashboard() {
  const last30Days = useMemo(() => generateLast30Days(), []);
  console.log({last30Days});

  const todayData = last30Days[last30Days.length - 1];

  const stepsGoal = 10000;
  const sleepGoal = 8;
  const waterGoal = 2.5;

  const avgSteps =
    last30Days.reduce((sum, d) => sum + d.steps, 0) / last30Days.length;
  const avgSleep =
    last30Days.reduce((sum, d) => sum + d.sleepHours, 0) /
    last30Days.length;
  const avgWater =
    last30Days.reduce((sum, d) => sum + d.waterLiters, 0) /
    last30Days.length;

  const stepsProgressToday = Math.min(
    100,
    Math.round((todayData.steps / stepsGoal) * 100)
  );
  const sleepProgressToday = Math.min(
    100,
    Math.round((todayData.sleepHours / sleepGoal) * 100)
  );
  const waterProgressToday = Math.min(
    100,
    Math.round((todayData.waterLiters / waterGoal) * 100)
  );

  const preventiveReminder = {
    title: "Time for your routine check-up",
    description:
      "Based on your activity and sleep patterns, it may be a good time to review your overall health with a doctor.",
    actions: ["Book a health check-up", "Review your blood tests", "Update vaccinations"],
    dueDate: "Within the next 2 weeks",
  };

  const healthTips = [
    "Drink a glass of water first thing in the morning to rehydrate.",
    "Aim for at least 30 minutes of light movement every day.",
    "Avoid screens 30 minutes before bed to improve sleep quality.",
    "Include a serving of fruit or veggies in every meal.",
    "Take short stretch breaks every hour when sitting for long periods.",
    "Deep breathing for 2 minutes can lower stress and heart rate.",
  ];

  const healthTipOfDay = useMemo(() => {
    const index = Math.floor(Math.random() * healthTips.length);
    return healthTips[index];
  }, [healthTips]);

  return (
    <div className="health-root">
      <header className="health-header">
        <div>
          <h1 className="health-title">Health Dashboard</h1>
          <p className="health-subtitle">
            Overview of your last 30 days (today + trends)
          </p>
        </div>
        <div className="health-date">
          {new Date().toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </div>
      </header>

      <main className="health-main">
        {/* Top cards: show today's data + 30-day avg */}
        <section className="health-grid">
          <div className="health-card">
            <div className="health-card-header">
              <h2>Steps (Today)</h2>
              <span className="health-tag">
                Goal: {stepsGoal.toLocaleString()}
              </span>
            </div>
            <p className="health-value">
              {todayData.steps.toLocaleString()}
            </p>
            <div className="health-progress">
              <div
                className="health-progress-bar"
                style={{ width: `${stepsProgressToday}%` }}
              />
            </div>
            <p className="health-progress-text">
              {stepsProgressToday}% of goal today • 30-day avg:{" "}
              {Math.round(avgSteps).toLocaleString()} steps
            </p>
          </div>

          <div className="health-card">
            <div className="health-card-header">
              <h2>Sleep (Today)</h2>
              <span className="health-tag">Goal: {sleepGoal} h</span>
            </div>
            <p className="health-value">
              {todayData.sleepHours.toFixed(1)} h
            </p>
            <div className="health-progress">
              <div
                className="health-progress-bar"
                style={{ width: `${sleepProgressToday}%` }}
              />
            </div>
            <p className="health-progress-text">
              {sleepProgressToday}% of goal today • 30-day avg:{" "}
              {avgSleep.toFixed(1)} h
            </p>
          </div>

          <div className="health-card">
            <div className="health-card-header">
              <h2>Water (Today)</h2>
              <span className="health-tag">
                Goal: {waterGoal.toFixed(1)} L
              </span>
            </div>
            <p className="health-value">
              {todayData.waterLiters.toFixed(1)} L
            </p>
            <div className="health-progress">
              <div
                className="health-progress-bar"
                style={{ width: `${waterProgressToday}%` }}
              />
            </div>
            <p className="health-progress-text">
              {waterProgressToday}% of goal today • 30-day avg:{" "}
              {avgWater.toFixed(1)} L
            </p>
          </div>
        </section>

        {/* Preventive care + tip of the day */}
        <section className="health-bottom">
          <div className="health-card health-preventive">
            <h2>Preventive Care Reminder</h2>
            <p className="health-preventive-title">
              {preventiveReminder.title}
            </p>
            <p className="health-preventive-description">
              {preventiveReminder.description}
            </p>

            <ul className="health-preventive-actions">
              {preventiveReminder.actions.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>

            <p className="health-preventive-due">
              Suggested timeframe:{" "}
              <span className="health-chip">
                {preventiveReminder.dueDate}
              </span>
            </p>

            <div className="health-preventive-buttons">
              <button
                type="button"
                className="health-button primary"
                onClick={() => alert("Open appointment booking flow")}
              >
                Schedule appointment
              </button>
              <button
                type="button"
                className="health-button ghost"
                onClick={() => alert("Mark reminder as done / snooze")}
              >
                Snooze
              </button>
            </div>
          </div>

          <div className="health-card health-tip">
            <h2>Health Tip of the Day</h2>
            <p className="health-tip-text">“{healthTipOfDay}”</p>
            <button
              type="button"
              className="health-button secondary"
              onClick={() => window.location.reload()}
            >
              New random tip
            </button>
          </div>
        </section>

        {/* 30-day history table */}
        <section className="health-card health-history">
          <div className="health-history-header">
            <h2>Last 30 Days</h2>
            <p>Daily breakdown of steps, sleep, and water</p>
          </div>

          <div className="health-history-table-wrapper">
            <table className="health-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Steps</th>
                  <th>Sleep (h)</th>
                  <th>Water (L)</th>
                </tr>
              </thead>
              <tbody>
                {last30Days.map((day) => (
                  <tr key={day.date.toISOString()}>
                    <td>
                      {day.date.toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td>{day.steps.toLocaleString()}</td>
                    <td>{day.sleepHours.toFixed(1)}</td>
                    <td>{day.waterLiters.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
