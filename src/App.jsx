import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [requests, setRequests] = useState([]);

  const [stats, setStats] = useState({
    totalRequests: 0,
    suspiciousRequests: 0,
  });

  const [ipStats, setIpStats] = useState([]);

  const [formData, setFormData] = useState({
    ipAddress: "",
    endpoint: "",
    method: "GET",
    statusCode: 200,
  });

  const [message, setMessage] = useState("");
  const [apiOnline, setApiOnline] = useState(false);

  // ==========================================
  // FETCH REQUEST LOGS
  // ==========================================

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests`
      );

      if (!response.ok) {
        throw new Error(
          `Requests API failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }

      setApiOnline(true);
    } catch (error) {
      console.error(
        "Error fetching requests:",
        error
      );

      setApiOnline(false);
    }
  };

  // ==========================================
  // FETCH OVERALL STATS
  // ==========================================

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stats`
      );

      if (!response.ok) {
        throw new Error(
          `Stats API failed: ${response.status}`
        );
      }

      const data = await response.json();

      setStats({
        totalRequests:
          Number(data.totalRequests) || 0,

        suspiciousRequests:
          Number(data.suspiciousRequests) || 0,
      });

      setApiOnline(true);
    } catch (error) {
      console.error(
        "Error fetching stats:",
        error
      );
    }
  };

  // ==========================================
  // FETCH IP STATISTICS
  // ==========================================

  const fetchIpStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/stats/ip`
      );

      if (!response.ok) {
        throw new Error(
          `IP Stats API failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setIpStats(data);
      } else {
        setIpStats([]);
      }
    } catch (error) {
      console.error(
        "Error fetching IP statistics:",
        error
      );

      setIpStats([]);
    }
  };

  // ==========================================
  // REFRESH ALL DASHBOARD DATA
  // ==========================================

  const refreshDashboard = () => {
    fetchRequests();
    fetchStats();
    fetchIpStats();
  };

  // ==========================================
  // INITIAL LOAD + AUTO REFRESH
  // ==========================================

  useEffect(() => {
    refreshDashboard();

    const interval = setInterval(() => {
      refreshDashboard();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SEND TEST TRAFFIC
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/test`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            "X-Test-IP":
              formData.ipAddress,

            "X-Test-Endpoint":
              formData.endpoint,

            "X-Test-Method":
              formData.method,
          },

          body: JSON.stringify({
            statusCode: Number(
              formData.statusCode
            ),
          }),
        }
      );

      // ==========================================
      // RATE LIMIT RESPONSE
      // ==========================================

      if (response.status === 429) {
        setMessage(
          "⚠ Rate limit exceeded — request blocked."
        );
      }

      // ==========================================
      // OTHER ERROR RESPONSE
      // ==========================================

      else if (!response.ok) {
        setMessage(
          `Request returned status ${response.status}.`
        );
      }

      // ==========================================
      // SUCCESS
      // ==========================================

      else {
        setMessage(
          "Request logged successfully."
        );
      }

      // ==========================================
      // RESET FORM
      // ==========================================

      setFormData({
        ipAddress: "",
        endpoint: "",
        method: "GET",
        statusCode: 200,
      });

      // ==========================================
      // REFRESH DASHBOARD
      // ==========================================

      refreshDashboard();

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Error creating test request:",
        error
      );

      setMessage(
        "Unable to send test request."
      );
    }
  };

  // ==========================================
  // DASHBOARD CALCULATIONS
  // ==========================================

  const totalRequests =
    stats.totalRequests;

  const suspiciousRequests =
    stats.suspiciousRequests;

  const normalRequests =
    Math.max(
      totalRequests -
        suspiciousRequests,
      0
    );

  const suspiciousPercentage =
    totalRequests > 0
      ? Math.round(
          (suspiciousRequests /
            totalRequests) *
            100
        )
      : 0;

  const uniqueIps =
    ipStats.filter(
      (item) => item.ipAddress
    ).length;

  // ==========================================
  // FIND TOP RISKY IP
  // ==========================================

  const topRiskyIp =
    ipStats.length > 0
      ? [...ipStats].sort(
          (a, b) =>
            (b.riskScore ?? 0) -
            (a.riskScore ?? 0)
        )[0]
      : null;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="app-shell">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            A
          </div>

          <div>
            <h1>API Sentinel</h1>
            <p>Security Monitor</p>
          </div>

        </div>

        <nav className="navigation">

          <div className="nav-item active">
            <span>▦</span>
            Overview
          </div>

          <div className="nav-item">
            <span>◉</span>
            Request Logs
          </div>

          <div className="nav-item">
            <span>!</span>
            Detection
          </div>

        </nav>

        <div className="sidebar-bottom">

          <div className="system-label">
            SYSTEM
          </div>

          <div className="system-status">

            <span></span>

            {apiOnline
              ? "Monitoring active"
              : "API offline"}

          </div>

          <p>
            API Abuse Detection MVP
          </p>

        </div>

      </aside>


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <div>

            <div className="eyebrow">
              SECURITY OPERATIONS
            </div>

            <h2>
              Traffic Overview
            </h2>

            <p>
              Monitor API traffic and identify
              unusual request behaviour.
            </p>

          </div>

          <div className="connection">

            <span className="connection-dot"></span>

            {apiOnline
              ? "API ONLINE"
              : "API OFFLINE"}

          </div>

        </header>


        {/* ======================================
            METRICS
        ====================================== */}

        <section className="metrics">

          {/* TOTAL REQUESTS */}

          <div className="metric-card">

            <div className="metric-top">

              <span>
                Total Requests
              </span>

              <span className="metric-icon">
                ↗
              </span>

            </div>

            <strong>
              {totalRequests}
            </strong>

            <p>
              Recorded API traffic
            </p>

          </div>


          {/* NORMAL TRAFFIC */}

          <div className="metric-card">

            <div className="metric-top">

              <span>
                Normal Traffic
              </span>

              <span className="metric-icon green">
                ✓
              </span>

            </div>

            <strong>
              {normalRequests}
            </strong>

            <p>
              Requests within threshold
            </p>

          </div>


          {/* SUSPICIOUS */}

          <div className="metric-card danger-card">

            <div className="metric-top">

              <span>
                Suspicious
              </span>

              <span className="metric-icon red">
                !
              </span>

            </div>

            <strong>
              {suspiciousRequests}
            </strong>

            <p>
              Requests flagged by detection
            </p>

          </div>


          {/* SUSPICIOUS RATE */}

          <div className="metric-card">

            <div className="metric-top">

              <span>
                Suspicious Rate
              </span>

              <span className="metric-icon">
                %
              </span>

            </div>

            <strong>
              {suspiciousPercentage}%
            </strong>

            <p>
              Of recorded traffic
            </p>

          </div>

        </section>


        {/* ======================================
            TOP RISKY IP
        ====================================== */}

        {topRiskyIp && (

          <section className="top-risk-card">

            <div>

              <span className="eyebrow">
                HIGHEST RISK SOURCE
              </span>

              <h3>
                {topRiskyIp.ipAddress ||
                  "Unknown"}
              </h3>

              <p>
                Highest calculated risk based
                on suspicious activity and
                failed logins.
              </p>

            </div>

            <div className="top-risk-score">

              <strong>
                {topRiskyIp.riskScore ?? 0}
              </strong>

              <span>
                {topRiskyIp.riskLevel ||
                  "LOW"}
              </span>

            </div>

          </section>

        )}


        {/* ======================================
            WORKSPACE
        ====================================== */}

        <section className="workspace">


          {/* ====================================
              REQUEST ACTIVITY
          ==================================== */}

          <div className="panel traffic-panel">

            <div className="panel-heading">

              <div>

                <h3>
                  Request Activity
                </h3>

                <p>
                  Live records from the API
                  monitoring service
                </p>

              </div>

              <div className="record-count">
                {totalRequests} RECORDS
              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      IP ADDRESS
                    </th>

                    <th>
                      ENDPOINT
                    </th>

                    <th>
                      METHOD
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      RISK
                    </th>

                    <th>
                      TIME
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {requests
                    .slice()
                    .reverse()
                    .map((request) => (

                      <tr
                        key={request.id}
                      >

                        <td className="request-id">
                          #{request.id}
                        </td>


                        <td className="ip">

                          {request.ipAddress ||
                            "Unknown"}

                        </td>


                        <td className="endpoint">

                          {request.endpoint ||
                            "Unknown"}

                        </td>


                        <td>

                          <span className="method">

                            {request.method ||
                              "—"}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              request.statusCode >=
                              400
                                ? "status-code error"
                                : "status-code success"
                            }
                          >

                            {request.statusCode}

                          </span>

                        </td>


                        <td>

                          {request.suspicious ? (

                            <span className="risk suspicious">

                              <span></span>

                              Suspicious

                            </span>

                          ) : (

                            <span className="risk normal">

                              <span></span>

                              Normal

                            </span>

                          )}

                        </td>


                        <td className="time">

                          {request.timestamp
                            ? new Date(
                                request.timestamp
                              ).toLocaleTimeString()
                            : "—"}

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>


              {requests.length === 0 && (

                <div className="empty-state">

                  No API traffic recorded yet.

                </div>

              )}

            </div>

          </div>


          {/* ====================================
              RIGHT COLUMN
          ==================================== */}

          <div className="right-column">


            {/* DETECTION RULES */}

            <div className="panel detection-panel">

              <div className="panel-heading compact">

                <div>

                  <h3>
                    Detection Rules
                  </h3>

                  <p>
                    Active monitoring logic
                  </p>

                </div>

              </div>


              {/* RULE 1 */}

              <div className="rule">

                <div className="rule-number">
                  01
                </div>

                <div>

                  <strong>
                    IP Request Threshold
                  </strong>

                  <p>
                    Flag an IP after repeated
                    requests cross the
                    configured threshold.
                  </p>

                </div>

                <span className="rule-status">
                  ACTIVE
                </span>

              </div>


              {/* RULE 2 */}

              <div className="rule">

                <div className="rule-number">
                  02
                </div>

                <div>

                  <strong>
                    Request Logging
                  </strong>

                  <p>
                    Store IP, endpoint,
                    method, status and
                    timestamp for analysis.
                  </p>

                </div>

                <span className="rule-status">
                  ACTIVE
                </span>

              </div>


              {/* RULE 3 */}

              <div className="rule">

                <div className="rule-number">
                  03
                </div>

                <div>

                  <strong>
                    Failed Login Detection
                  </strong>

                  <p>
                    Detect repeated failed
                    authentication attempts
                    from the same IP.
                  </p>

                </div>

                <span className="rule-status">
                  ACTIVE
                </span>

              </div>


              {/* RULE 4 */}

              <div className="rule">

                <div className="rule-number">
                  04
                </div>

                <div>

                  <strong>
                    IP Risk Scoring
                  </strong>

                  <p>
                    Calculate a risk score
                    using suspicious requests
                    and failed logins.
                  </p>

                </div>

                <span className="rule-status">
                  ACTIVE
                </span>

              </div>

            </div>


            {/* ==================================
                TEST TRAFFIC
            ================================== */}

            <div className="panel simulator-panel">

              <div className="panel-heading compact">

                <div>

                  <h3>
                    Test Traffic
                  </h3>

                  <p>
                    Generate a request for
                    detection testing
                  </p>

                </div>

              </div>


              <form
                onSubmit={handleSubmit}
              >

                {/* IP */}

                <label>

                  IP Address

                  <input
                    type="text"
                    name="ipAddress"
                    value={
                      formData.ipAddress
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="10.0.0.5"
                    required
                  />

                </label>


                {/* ENDPOINT */}

                <label>

                  Endpoint

                  <input
                    type="text"
                    name="endpoint"
                    value={
                      formData.endpoint
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="/api/auth/login"
                    required
                  />

                </label>


                {/* METHOD + STATUS */}

                <div className="form-row">

                  <label>

                    Method

                    <select
                      name="method"
                      value={
                        formData.method
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="GET">
                        GET
                      </option>

                      <option value="POST">
                        POST
                      </option>

                      <option value="PUT">
                        PUT
                      </option>

                      <option value="DELETE">
                        DELETE
                      </option>

                    </select>

                  </label>


                  <label>

                    Status

                    <input
                      type="number"
                      name="statusCode"
                      value={
                        formData.statusCode
                      }
                      onChange={
                        handleChange
                      }
                      min="100"
                      max="599"
                      required
                    />

                  </label>

                </div>


                <button type="submit">

                  Send Test Request

                  <span>
                    →
                  </span>

                </button>


                {message && (

                  <div className="form-message">
                    {message}
                  </div>

                )}

              </form>

            </div>


            {/* ==================================
                NETWORK SUMMARY
            ================================== */}

            <div className="network-summary">

              <span>
                UNIQUE IPs
              </span>

              <strong>
                {uniqueIps}
              </strong>

            </div>


            {/* ==================================
                IP STATISTICS
            ================================== */}

            <div className="panel">

              <div className="panel-heading compact">

                <div>

                  <h3>
                    IP Statistics
                  </h3>

                  <p>
                    Traffic grouped by source IP
                  </p>

                </div>

              </div>


              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        IP
                      </th>

                      <th>
                        REQUESTS
                      </th>

                      <th>
                        SUSPICIOUS
                      </th>

                      <th>
                        FAILED LOGINS
                      </th>

                      <th>
                        RISK SCORE
                      </th>

                      <th>
                        RISK LEVEL
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {ipStats.map(
                      (item, index) => (

                        <tr
                          key={`${item.ipAddress}-${index}`}
                        >

                          <td className="ip">

                            {item.ipAddress ||
                              "Unknown"}

                          </td>


                          <td>

                            {item.totalRequests ??
                              0}

                          </td>


                          <td>

                            {item.suspiciousRequests ??
                              0}

                          </td>


                          <td>

                            {item.failedLogins ??
                              0}

                          </td>


                          <td>

                            <strong>
                              {item.riskScore ??
                                0}
                            </strong>

                          </td>


                          <td>

                            <span
                              className={
                                item.riskLevel ===
                                "HIGH"
                                  ? "risk suspicious"
                                  : item.riskLevel ===
                                    "MEDIUM"
                                  ? "risk medium"
                                  : "risk normal"
                              }
                            >

                              <span></span>

                              {item.riskLevel ||
                                "LOW"}

                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>


                {ipStats.length === 0 && (

                  <div className="empty-state">

                    No IP statistics available.

                  </div>

                )}

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;