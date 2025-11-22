import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import WellnessGoalCard from '../Common/WellnessGoalCard';
import HealthTipCard from '../Common/HealthTipCard';
import PreventiveCareReminder from '../Common/PreventiveCareReminder';
import { wellnessService, healthTipsService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import styles from './styles/patient.module.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [wellnessGoals, setWellnessGoals] = useState([]);
  const [dailyTip, setDailyTip] = useState(null);
  const [preventiveReminders, setPreventiveReminders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // 7, 30, 90 days

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch wellness goals
        const goalsResponse = await wellnessService.getWellnessGoals();
        setWellnessGoals(goalsResponse.data);

        // Fetch today's health tip
        const tipResponse = await healthTipsService.getDailyTip();
        setDailyTip(tipResponse.data);

        // Fetch preventive care reminders
        const remindersResponse = await wellnessService.getPreventiveReminders();
        setPreventiveReminders(remindersResponse.data);

        // Fetch chart data
        const chartResponse = await wellnessService.getMetricsChart(selectedPeriod);
        setChartData(chartResponse.data);

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  // Calculate overall wellness score
  const wellnessScore = wellnessGoals.length > 0
    ? Math.round(wellnessGoals.reduce((acc, goal) => acc + goal.progress, 0) / wellnessGoals.length)
    : 0;

  // Get step data
  const stepGoal = wellnessGoals.find(g => g.category === 'steps');
  const sleepGoal = wellnessGoals.find(g => g.category === 'sleep');
  const waterGoal = wellnessGoals.find(g => g.category === 'water');

  return (
    <div className={styles.dashboard}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Welcome back, {user?.firstName}! 👋</h1>
          <p className={styles.subtitle}>Here's your health overview</p>
        </div>
        <div className={styles.wellnessScore}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{wellnessScore}</span>
            <span className={styles.scoreLabel}>Wellness Score</span>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Quick Stats Section */}
      <section className={styles.quickStats}>
        <h2 className={styles.sectionTitle}>Quick Stats</h2>
        <div className={styles.statsGrid}>
          {stepGoal && (
            <WellnessGoalCard
              goal={stepGoal}
              icon="🚶"
              color="#4CAF50"
            />
          )}
          {sleepGoal && (
            <WellnessGoalCard
              goal={sleepGoal}
              icon="😴"
              color="#2196F3"
            />
          )}
          {waterGoal && (
            <WellnessGoalCard
              goal={waterGoal}
              icon="💧"
              color="#00BCD4"
            />
          )}
        </div>
      </section>

      {/* Charts Section */}
      <section className={styles.chartsSection}>
        <div className={styles.chartsHeader}>
          <h2 className={styles.sectionTitle}>Health Metrics Trend</h2>
          <div className={styles.periodToggle}>
            <button
              className={selectedPeriod === '7' ? styles.activePeriod : ''}
              onClick={() => setSelectedPeriod('7')}
            >
              7 Days
            </button>
            <button
              className={selectedPeriod === '30' ? styles.activePeriod : ''}
              onClick={() => setSelectedPeriod('30')}
            >
              30 Days
            </button>
            <button
              className={selectedPeriod === '90' ? styles.activePeriod : ''}
              onClick={() => setSelectedPeriod('90')}
            >
              90 Days
            </button>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className={styles.chartsContainer}>
            {/* Steps Chart */}
            <div className={styles.chartCard}>
              <h3>Steps Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="steps"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sleep Quality Chart */}
            <div className={styles.chartCard}>
              <h3>Sleep Hours</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sleepHours" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Water Intake */}
            <div className={styles.chartCard}>
              <h3>Water Intake (Liters)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="waterIntake"
                    stroke="#00BCD4"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* Preventive Care Reminders */}
      <section className={styles.remindersSection}>
        <h2 className={styles.sectionTitle}>Preventive Care Reminders</h2>
        {preventiveReminders.length > 0 ? (
          <div className={styles.remindersGrid}>
            {preventiveReminders.slice(0, 4).map((reminder) => (
              <PreventiveCareReminder
                key={reminder.id}
                reminder={reminder}
                onComplete={() => {
                  // Handle completion
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No pending preventive care reminders</p>
          </div>
        )}
      </section>

      {/* Daily Health Tip */}
      <section className={styles.tipSection}>
        <h2 className={styles.sectionTitle}>Health Tip of the Day</h2>
        {dailyTip && <HealthTipCard tip={dailyTip} />}
      </section>

      {/* Goals Progress */}
      <section className={styles.goalsSection}>
        <h2 className={styles.sectionTitle}>All Wellness Goals</h2>
        <div className={styles.goalsGrid}>
          {wellnessGoals.map((goal) => (
            <WellnessGoalCard
              key={goal.id}
              goal={goal}
              showDetails={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;