import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  // ============================================================
  // CURRENT CONDITIONS
  // ============================================================

  const [formData, setFormData] = useState({
    temperature_c: 20,
    rain_1h: 0,
    snow_1h: 0,
    clouds_all: 40,
    weather_main: "Clear",
    hour: 18,
    day_of_week: 4,
    month: 10,
    year: 2016,
    day_of_month: 7,
    is_weekend: 0,
    holiday: "None",
  });

  // ============================================================
  // CURRENT PREDICTION
  // ============================================================

  const [result, setResult] = useState(null);

  // ============================================================
  // MODEL INSIGHTS
  // ============================================================

  const [insights, setInsights] = useState([]);

  // ============================================================
  // LOADING / ERROR
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // WHAT-IF SCENARIO
  // ============================================================

  const [scenarioData, setScenarioData] = useState({
    temperature_c: 20,
    rain_1h: 0,
    snow_1h: 0,
    clouds_all: 40,
    weather_main: "Clear",
    hour: 18,
    day_of_week: 4,
    month: 10,
    year: 2016,
    day_of_month: 7,
    is_weekend: 0,
    holiday: "None",
  });

  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);

  // ============================================================
  // PREDICTION HISTORY
  // ============================================================

  const [predictionHistory, setPredictionHistory] = useState([]);

  // ============================================================
  // LOAD SAVED HISTORY
  // ============================================================

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(
        "trafficSenseHistory"
      );

      if (savedHistory) {
        setPredictionHistory(
          JSON.parse(savedHistory)
        );
      }
    } catch (err) {
      console.error(
        "Failed to load prediction history:",
        err
      );
    }
  }, []);

  // ============================================================
  // SAVE HISTORY
  // ============================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "trafficSenseHistory",
        JSON.stringify(predictionHistory)
      );
    } catch (err) {
      console.error(
        "Failed to save prediction history:",
        err
      );
    }
  }, [predictionHistory]);

  // ============================================================
  // LOAD MODEL INSIGHTS
  // ============================================================

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/insights`
        );

        setInsights(
          response.data.top_features || []
        );
      } catch (err) {
        console.error(
          "Failed to load model insights:",
          err
        );
      }
    };

    loadInsights();
  }, []);

  // ============================================================
  // CURRENT INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "weather_main" ||
        name === "holiday"
          ? value
          : Number(value),
    }));
  };

  // ============================================================
  // SCENARIO SLIDER CHANGE
  // ============================================================

  const handleScenarioChange = (e) => {
    const { name, value } = e.target;

    setScenarioData((previous) => ({
      ...previous,
      [name]: Number(value),
    }));

    setScenarioResult(null);
  };

  // ============================================================
  // MAIN TRAFFIC ANALYSIS
  // ============================================================

  const analyzeTraffic = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        `${API_URL}/predict`,
        formData
      );

      const prediction = response.data;

      setResult(prediction);

      // Start new scenario from current conditions
      setScenarioData({
        ...formData,
      });

      setScenarioResult(null);

      // ========================================================
      // SAVE PREDICTION TO HISTORY
      // ========================================================

      const historyItem = {
        id: Date.now(),

        traffic:
          prediction.predicted_traffic_volume,

        risk:
          prediction.risk_level,

        hour:
          formData.hour,

        weather:
          formData.weather_main,

        temperature:
          formData.temperature_c,

        rainfall:
          formData.rain_1h,

        clouds:
          formData.clouds_all,

        timestamp:
          new Date().toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
      };

      setPredictionHistory((previous) => {
        const updated = [
          historyItem,
          ...previous,
        ];

        return updated.slice(0, 10);
      });
    } catch (err) {
      console.error(
        "Prediction error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.detail ||
            "Traffic prediction failed. Please check your input values."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to TrafficSense AI backend. Make sure FastAPI is running."
        );
      } else {
        setError(
          "Something went wrong while analyzing traffic."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // WHAT-IF SIMULATION
  // ============================================================

  const simulateScenario = async () => {
    setScenarioLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/predict`,
        scenarioData
      );

      setScenarioResult(
        response.data
      );
    } catch (err) {
      console.error(
        "Simulation error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.detail ||
            "Traffic simulation failed. Please check the scenario values."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to TrafficSense AI backend. Make sure FastAPI is running."
        );
      } else {
        setError(
          "Something went wrong while running the simulation."
        );
      }
    } finally {
      setScenarioLoading(false);
    }
  };

  // ============================================================
  // CLEAR HISTORY
  // ============================================================

  const clearHistory = () => {
    setPredictionHistory([]);
  };

  // ============================================================
  // RISK CLASS
  // ============================================================

  const getRiskClass = (risk) => {
    if (!risk) return "";

    return risk.toLowerCase();
  };

  // ============================================================
  // AI RECOMMENDATION
  // ============================================================

  const getRecommendation = () => {
    if (!result) return "";

    if (result.risk_level === "HIGH") {
      return "Heavy traffic expected. Consider avoiding peak hours or choosing an alternate route.";
    }

    if (result.risk_level === "MEDIUM") {
      return "Moderate traffic expected. Allow some extra travel time.";
    }

    return "Traffic conditions look relatively clear. Normal travel conditions are expected.";
  };

  // ============================================================
  // FORMAT FEATURE NAME
  // ============================================================

  const formatFeatureName = (name) => {
    const names = {
      hour: "Hour of Day",
      day_of_week: "Day of Week",
      is_weekend: "Weekend",
      temperature_c: "Temperature",
      day_of_month: "Day of Month",
      month: "Month",
      year: "Year",
      clouds_all: "Cloud Coverage",
      rain_1h: "Rainfall",
      snow_1h: "Snowfall",
    };

    return names[name] || name;
  };

  // ============================================================
  // TRAFFIC DIFFERENCE
  // ============================================================

  const getTrafficDifference = () => {
    if (!result || !scenarioResult) {
      return null;
    }

    const difference =
      scenarioResult.predicted_traffic_volume -
      result.predicted_traffic_volume;

    const percentage =
      result.predicted_traffic_volume === 0
        ? 0
        : (difference /
            result.predicted_traffic_volume) *
          100;

    return {
      difference,
      percentage,
    };
  };

  const trafficDifference =
    getTrafficDifference();

  // ============================================================
  // KPI CALCULATIONS
  // ============================================================

  const totalAnalyses =
    predictionHistory.length;

  const averageTraffic =
    predictionHistory.length > 0
      ? Math.round(
          predictionHistory.reduce(
            (sum, item) =>
              sum + item.traffic,
            0
          ) /
            predictionHistory.length
        )
      : 0;

  const highRiskCount =
    predictionHistory.filter(
      (item) =>
        item.risk === "HIGH"
    ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="app">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="header">

        <div className="logo">

          <div className="logo-icon">
            TS
          </div>

          <div>
            <h1>
              TrafficSense AI
            </h1>

            <p>
              Traffic Intelligence System
            </p>
          </div>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          AI Model Online

        </div>

      </header>


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="hero">

        <div className="hero-content">

          <span className="badge">
            AI-POWERED TRAFFIC ANALYTICS
          </span>

          <h2>
            Predict Traffic.
            <br />

            <span>
              Understand Risk.
            </span>
          </h2>

          <p>
            Analyze weather and time
            conditions to predict traffic
            volume and congestion risk
            using machine learning.
          </p>

        </div>

      </section>


      {/* ======================================================
          DASHBOARD
      ====================================================== */}

      <main className="dashboard">

        {/* ====================================================
            INPUT CARD
        ==================================================== */}

        <section className="card input-card">

          <div className="card-header">

            <div>

              <span className="section-label">
                PREDICTION ENGINE
              </span>

              <h3>
                Traffic Conditions
              </h3>

            </div>

            <div className="icon-box">
              ⚙
            </div>

          </div>


          <div className="form-grid">

            {/* TEMPERATURE */}

            <div className="input-group">

              <label>
                Temperature °C
              </label>

              <input
                type="number"
                name="temperature_c"
                value={
                  formData.temperature_c
                }
                onChange={handleChange}
              />

            </div>


            {/* RAINFALL */}

            <div className="input-group">

              <label>
                Rainfall (mm)
              </label>

              <input
                type="number"
                step="0.1"
                min="0"
                name="rain_1h"
                value={
                  formData.rain_1h
                }
                onChange={handleChange}
              />

            </div>


            {/* SNOWFALL */}

            <div className="input-group">

              <label>
                Snowfall (mm)
              </label>

              <input
                type="number"
                step="0.1"
                min="0"
                name="snow_1h"
                value={
                  formData.snow_1h
                }
                onChange={handleChange}
              />

            </div>


            {/* CLOUDS */}

            <div className="input-group">

              <label>
                Cloud Coverage %
              </label>

              <input
                type="number"
                min="0"
                max="100"
                name="clouds_all"
                value={
                  formData.clouds_all
                }
                onChange={handleChange}
              />

            </div>


            {/* WEATHER */}

            <div className="input-group">

              <label>
                Weather
              </label>

              <select
                name="weather_main"
                value={
                  formData.weather_main
                }
                onChange={handleChange}
              >

                <option value="Clear">
                  Clear
                </option>

                <option value="Clouds">
                  Clouds
                </option>

                <option value="Rain">
                  Rain
                </option>

                <option value="Snow">
                  Snow
                </option>

                <option value="Mist">
                  Mist
                </option>

                <option value="Haze">
                  Haze
                </option>

                <option value="Fog">
                  Fog
                </option>

                <option value="Thunderstorm">
                  Thunderstorm
                </option>

              </select>

            </div>


            {/* HOUR */}

            <div className="input-group">

              <label>
                Hour (0–23)
              </label>

              <input
                type="number"
                min="0"
                max="23"
                name="hour"
                value={
                  formData.hour
                }
                onChange={handleChange}
              />

            </div>


            {/* DAY OF WEEK */}

            <div className="input-group">

              <label>
                Day of Week
              </label>

              <select
                name="day_of_week"
                value={
                  formData.day_of_week
                }
                onChange={handleChange}
              >

                <option value="0">
                  Monday
                </option>

                <option value="1">
                  Tuesday
                </option>

                <option value="2">
                  Wednesday
                </option>

                <option value="3">
                  Thursday
                </option>

                <option value="4">
                  Friday
                </option>

                <option value="5">
                  Saturday
                </option>

                <option value="6">
                  Sunday
                </option>

              </select>

            </div>


            {/* WEEKEND */}

            <div className="input-group">

              <label>
                Weekend
              </label>

              <select
                name="is_weekend"
                value={
                  formData.is_weekend
                }
                onChange={handleChange}
              >

                <option value="0">
                  No
                </option>

                <option value="1">
                  Yes
                </option>

              </select>

            </div>

          </div>


          <button
            className="analyze-btn"
            onClick={analyzeTraffic}
            disabled={loading}
          >

            {loading
              ? "Analyzing Traffic..."
              : "Analyze Traffic →"}

          </button>


          {error && (
            <div className="error">
              {error}
            </div>
          )}

        </section>


        {/* ====================================================
            RESULT CARD
        ==================================================== */}

        <section className="result-section">

          {!result ? (

            <div className="empty-result">

              <div className="empty-icon">
                ◈
              </div>

              <h3>
                Ready for Analysis
              </h3>

              <p>
                Configure the traffic
                conditions and click
                <strong>
                  {" "}Analyze Traffic{" "}
                </strong>
                to generate an AI
                prediction.
              </p>

            </div>

          ) : (

            <>

              {/* RESULT HEADER */}

              <div className="result-header">

                <div>

                  <span className="section-label">
                    AI PREDICTION
                  </span>

                  <h3>
                    Traffic Analysis
                  </h3>

                </div>

                <span
                  className={`risk-badge ${getRiskClass(
                    result.risk_level
                  )}`}
                >
                  {result.risk_level} RISK
                </span>

              </div>


              {/* METRICS */}

              <div className="metrics">

                <div className="metric-card">

                  <span className="metric-label">
                    PREDICTED TRAFFIC
                  </span>

                  <div className="metric-value">

                    {result
                      .predicted_traffic_volume
                      .toLocaleString()}

                  </div>

                  <span className="metric-unit">
                    vehicles / hour
                  </span>

                </div>


                <div
                  className={`metric-card risk-card ${getRiskClass(
                    result.risk_level
                  )}`}
                >

                  <span className="metric-label">
                    CONGESTION RISK
                  </span>

                  <div className="metric-risk">
                    {result.risk_level}
                  </div>

                  <span className="metric-unit">
                    Threshold-based risk
                    assessment
                  </span>

                </div>

              </div>


              {/* RECOMMENDATION */}

              <div className="recommendation">

                <div className="recommendation-icon">
                  ✦
                </div>

                <div>

                  <span>
                    AI RECOMMENDATION
                  </span>

                  <p>
                    {getRecommendation()}
                  </p>

                </div>

              </div>


              {/* MODEL INFO */}

              <div className="model-info">

                <div>

                  <span>
                    MODEL
                  </span>

                  <strong>
                    Random Forest
                  </strong>

                </div>

                <div>

                  <span>
                    R² SCORE
                  </span>

                  <strong>
                    0.9385
                  </strong>

                </div>

                <div>

                  <span>
                    INPUT TYPE
                  </span>

                  <strong>
                    Weather + Time
                  </strong>

                </div>

              </div>


              {/* ==================================================
                  MODEL EXPLAINABILITY
              ================================================== */}

              <div className="insights-card">

                <div className="insights-header">

                  <div>

                    <span className="section-label">
                      MODEL EXPLAINABILITY
                    </span>

                    <h3>
                      Why This Prediction?
                    </h3>

                  </div>

                  <div className="insights-icon">
                    ✦
                  </div>

                </div>


                <p className="insights-description">
                  These features had the
                  highest influence on the
                  Random Forest model's
                  predictions.
                </p>


                <div className="feature-list">

                  {insights.map(
                    (item, index) => (

                      <div
                        className="feature-row"
                        key={item.feature}
                      >

                        <div className="feature-info">

                          <span>

                            {index + 1}.
                            {" "}
                            {formatFeatureName(
                              item.feature
                            )}

                          </span>

                          <strong>
                            {item.importance}%
                          </strong>

                        </div>


                        <div className="feature-bar">

                          <div
                            className="feature-fill"
                            style={{
                              width: `${Math.min(
                                item.importance,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            </>

          )}

        </section>


        {/* ====================================================
            KPI SECTION
        ==================================================== */}

        <section className="kpi-section">

          <div className="kpi-card">

            <span className="kpi-label">
              TOTAL ANALYSES
            </span>

            <strong className="kpi-value">
              {totalAnalyses}
            </strong>

            <span className="kpi-description">
              Recent predictions
            </span>

          </div>


          <div className="kpi-card">

            <span className="kpi-label">
              AVG TRAFFIC
            </span>

            <strong className="kpi-value">

              {averageTraffic.toLocaleString()}

            </strong>

            <span className="kpi-description">
              vehicles / hour
            </span>

          </div>


          <div className="kpi-card">

            <span className="kpi-label">
              HIGH RISK
            </span>

            <strong className="kpi-value">
              {highRiskCount}
            </strong>

            <span className="kpi-description">
              High congestion predictions
            </span>

          </div>

        </section>


        {/* ====================================================
            ANALYTICS HISTORY
        ==================================================== */}

        <section className="history-card">

          <div className="history-header">

            <div>

              <span className="section-label">
                ANALYTICS HISTORY
              </span>

              <h3>
                Recent Predictions
              </h3>

            </div>

            {predictionHistory.length > 0 && (
              <button
                className="clear-history-btn"
                onClick={clearHistory}
              >
                Clear
              </button>
            )}

          </div>


          {predictionHistory.length === 0 ? (

            <div className="history-empty">
              No prediction history yet.
            </div>

          ) : (

            <div className="history-list">

              {predictionHistory.map(
                (item, index) => (

                  <div
                    className="history-row"
                    key={item.id}
                  >

                    <span className="history-index">
                      #{predictionHistory.length - index}
                    </span>


                    <div className="history-main">

                      <strong>
                        {item.traffic.toLocaleString()}
                      </strong>

                      <span>
                        vehicles/hour
                      </span>

                    </div>


                    <div className="history-details">

                      <span>
                        {item.weather}
                      </span>

                      <span>
                        {item.temperature}°C
                      </span>

                      <span>
                        {item.hour}:00
                      </span>

                    </div>


                    <span
                      className={`history-risk ${getRiskClass(
                        item.risk
                      )}`}
                    >
                      {item.risk}
                    </span>


                    <span className="history-time">
                      {item.timestamp}
                    </span>

                  </div>

                )
              )}

            </div>

          )}


          {/* ==================================================
              TRAFFIC TREND
          ================================================== */}

          <div className="trend-section">

            <div className="trend-header">

              <div>

                <span className="section-label">
                  TRAFFIC TREND
                </span>

                <h3>
                  Prediction Volume
                </h3>

              </div>

              <span className="trend-count">
                {predictionHistory.length}
                {" "}
                {predictionHistory.length === 1
                  ? "prediction"
                  : "predictions"}
              </span>

            </div>


            {predictionHistory.length === 0 ? (

              <div className="trend-empty">
                Run predictions to see the
                traffic trend.
              </div>

            ) : (

              <div className="trend-chart">

                {[
                  ...predictionHistory,
                ]
                  .reverse()
                  .map(
                    (item) => {

                      const maxTraffic =
                        Math.max(
                          ...predictionHistory.map(
                            (entry) =>
                              entry.traffic
                          ),
                          1
                        );

                      const height =
                        Math.max(
                          12,
                          (item.traffic /
                            maxTraffic) *
                            100
                        );

                      return (
                        <div
                          className="trend-item"
                          key={`trend-${item.id}`}
                        >

                          <span className="trend-value">
                            {item.traffic.toLocaleString()}
                          </span>

                          <div
                            className={`trend-bar ${getRiskClass(
                              item.risk
                            )}`}
                            style={{
                              height: `${height}%`,
                            }}
                          />

                          <span className="trend-time">
                            {item.timestamp}
                          </span>

                        </div>
                      );
                    }
                  )}

              </div>

            )}

          </div>

        </section>


        {/* ====================================================
            WHAT-IF SIMULATOR
        ==================================================== */}

        <section className="simulator-card">

          <div className="simulator-header">

            <div>

              <span className="section-label">
                SCENARIO SIMULATION
              </span>

              <h3>
                What-If Traffic Simulator
              </h3>

              <p>
                Change weather and time
                conditions without changing
                your current prediction.
              </p>

            </div>

            <div className="simulator-icon">
              ⚡
            </div>

          </div>


          {/* SIMULATOR CONTROLS */}

          <div className="simulator-controls">

            {/* TEMPERATURE */}

            <div className="slider-group">

              <div className="slider-info">

                <label>
                  Temperature
                </label>

                <strong>
                  {scenarioData.temperature_c}°C
                </strong>

              </div>

              <input
                type="range"
                min="-10"
                max="40"
                step="1"
                name="temperature_c"
                value={
                  scenarioData.temperature_c
                }
                onChange={
                  handleScenarioChange
                }
              />

            </div>


            {/* RAINFALL */}

            <div className="slider-group">

              <div className="slider-info">

                <label>
                  Rainfall
                </label>

                <strong>
                  {scenarioData.rain_1h} mm
                </strong>

              </div>

              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                name="rain_1h"
                value={
                  scenarioData.rain_1h
                }
                onChange={
                  handleScenarioChange
                }
              />

            </div>


            {/* CLOUD COVERAGE */}

            <div className="slider-group">

              <div className="slider-info">

                <label>
                  Cloud Coverage
                </label>

                <strong>
                  {scenarioData.clouds_all}%
                </strong>

              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                name="clouds_all"
                value={
                  scenarioData.clouds_all
                }
                onChange={
                  handleScenarioChange
                }
              />

            </div>


            {/* HOUR */}

            <div className="slider-group">

              <div className="slider-info">

                <label>
                  Hour
                </label>

                <strong>
                  {scenarioData.hour}:00
                </strong>

              </div>

              <input
                type="range"
                min="0"
                max="23"
                step="1"
                name="hour"
                value={
                  scenarioData.hour
                }
                onChange={
                  handleScenarioChange
                }
              />

            </div>

          </div>


          <button
            className="simulate-btn"
            onClick={simulateScenario}
            disabled={scenarioLoading}
          >

            {scenarioLoading
              ? "Simulating Scenario..."
              : "Simulate Scenario →"}

          </button>


          {/* ==================================================
              CURRENT VS SCENARIO
          ================================================== */}

          {scenarioResult && result && (

            <div className="comparison-section">

              <div className="comparison-header">

                <div>

                  <span className="section-label">
                    SCENARIO COMPARISON
                  </span>

                  <h3>
                    Current vs What-If
                  </h3>

                </div>


                {trafficDifference && (

                  <div
                    className={
                      trafficDifference.difference > 0
                        ? "change-badge increase"
                        : trafficDifference.difference < 0
                        ? "change-badge decrease"
                        : "change-badge neutral"
                    }
                  >

                    {trafficDifference.difference > 0
                      ? "↑"
                      : trafficDifference.difference < 0
                      ? "↓"
                      : "→"}

                    {" "}

                    {Math.abs(
                      trafficDifference.difference
                    ).toLocaleString()}

                    {" vehicles/hour"}

                  </div>

                )}

              </div>


              <div className="comparison-grid">

                {/* CURRENT */}

                <div className="comparison-card current">

                  <div className="comparison-card-title">

                    <span>
                      CURRENT CONDITIONS
                    </span>

                    <span className="current-dot"></span>

                  </div>


                  <div className="comparison-volume">

                    {result
                      .predicted_traffic_volume
                      .toLocaleString()}

                    <span>
                      vehicles/hour
                    </span>

                  </div>


                  <span
                    className={`risk-badge ${getRiskClass(
                      result.risk_level
                    )}`}
                  >
                    {result.risk_level} RISK
                  </span>


                  <div className="comparison-details">

                    <div>
                      <span>
                        Temperature
                      </span>

                      <strong>
                        {formData.temperature_c}°C
                      </strong>
                    </div>


                    <div>
                      <span>
                        Rainfall
                      </span>

                      <strong>
                        {formData.rain_1h} mm
                      </strong>
                    </div>


                    <div>
                      <span>
                        Clouds
                      </span>

                      <strong>
                        {formData.clouds_all}%
                      </strong>
                    </div>


                    <div>
                      <span>
                        Hour
                      </span>

                      <strong>
                        {formData.hour}:00
                      </strong>
                    </div>

                  </div>

                </div>


                {/* ARROW */}

                <div className="comparison-arrow">
                  →
                </div>


                {/* SCENARIO */}

                <div className="comparison-card scenario">

                  <div className="comparison-card-title">

                    <span>
                      WHAT-IF SCENARIO
                    </span>

                    <span className="scenario-dot"></span>

                  </div>


                  <div className="comparison-volume">

                    {scenarioResult
                      .predicted_traffic_volume
                      .toLocaleString()}

                    <span>
                      vehicles/hour
                    </span>

                  </div>


                  <span
                    className={`risk-badge ${getRiskClass(
                      scenarioResult.risk_level
                    )}`}
                  >
                    {scenarioResult.risk_level} RISK
                  </span>


                  <div className="comparison-details">

                    <div>
                      <span>
                        Temperature
                      </span>

                      <strong>
                        {scenarioData.temperature_c}°C
                      </strong>
                    </div>


                    <div>
                      <span>
                        Rainfall
                      </span>

                      <strong>
                        {scenarioData.rain_1h} mm
                      </strong>
                    </div>


                    <div>
                      <span>
                        Clouds
                      </span>

                      <strong>
                        {scenarioData.clouds_all}%
                      </strong>
                    </div>


                    <div>
                      <span>
                        Hour
                      </span>

                      <strong>
                        {scenarioData.hour}:00
                      </strong>
                    </div>

                  </div>

                </div>

              </div>


              {/* CHANGE SUMMARY */}

              {trafficDifference && (

                <div className="change-summary">

                  <div className="change-summary-icon">

                    {trafficDifference.difference > 0
                      ? "↑"
                      : trafficDifference.difference < 0
                      ? "↓"
                      : "→"}

                  </div>


                  <div>

                    <span>
                      TRAFFIC CHANGE
                    </span>

                    <p>

                      The scenario predicts{" "}

                      <strong>
                        {Math.abs(
                          trafficDifference.difference
                        ).toLocaleString()}
                      </strong>

                      {" "}

                      {trafficDifference.difference > 0
                        ? "more"
                        : trafficDifference.difference < 0
                        ? "fewer"
                        : "the same number of"}

                      {" "}
                      vehicles per hour
                      compared with the
                      current prediction.

                      {" "}

                      (
                      {trafficDifference.percentage >= 0
                        ? "+"
                        : ""}

                      {trafficDifference.percentage.toFixed(
                        1
                      )}
                      %)

                    </p>

                  </div>

                </div>

              )}

            </div>

          )}


          {/* SCENARIO ONLY RESULT */}

          {scenarioResult && !result && (

            <div className="scenario-only-result">

              <span>
                SCENARIO RESULT
              </span>

              <strong>

                {scenarioResult
                  .predicted_traffic_volume
                  .toLocaleString()}

                {" "}
                vehicles/hour

              </strong>

              <small>
                {scenarioResult.risk_level}
                {" "}
                RISK
              </small>

            </div>

          )}

        </section>

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer>

        <span>
          TrafficSense AI
        </span>

        <span>
          Machine Learning • FastAPI • React
        </span>

      </footer>

    </div>
  );
}

export default App;