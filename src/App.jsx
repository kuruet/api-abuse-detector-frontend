import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [requests, setRequests] = useState([]);

  const [formData, setFormData] = useState({
    ipAddress: "",
    endpoint: "",
    method: "GET",
    statusCode: 200,
  });

  const [message, setMessage] = useState("");

  const fetchRequests = () => {
    fetch("http://localhost:8080/api/requests")
      .then((response) => response.json())
      .then((data) => setRequests(data))
      .catch((error) => console.error("Error fetching requests:", error));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch("http://localhost:8080/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        statusCode: Number(formData.statusCode),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }

        return response.json();
      })
      .then(() => {
        setMessage("Request logged successfully.");

        setFormData({
          ipAddress: "",
          endpoint: "",
          method: "GET",
          statusCode: 200,
        });

        fetchRequests();

        setTimeout(() => {
          setMessage("");
        }, 3000);
      })
      .catch((error) => {
        console.error("Error creating request:", error);
        setMessage("Unable to log request.");
      });
  };

  const totalRequests = requests.length;

  const suspiciousRequests = requests.filter(
    (request) => request.suspicious
  ).length;

  const normalRequests = totalRequests - suspiciousRequests;

  const suspiciousPercentage =
    totalRequests > 0
      ? Math.round((suspiciousRequests / totalRequests) * 100)
      : 0;

  const uniqueIps = new Set(
    requests
      .map((request) => request.ipAddress)
      .filter((ip) => ip)
  ).size;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>

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
          <div className="system-label">SYSTEM</div>

          <div className="system-status">
            <span></span>
            Monitoring active
          </div>

          <p>API Abuse Detection MVP</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">SECURITY OPERATIONS</div>
            <h2>Traffic Overview</h2>
            <p>
              Monitor API traffic and identify unusual request behaviour.
            </p>
          </div>

          <div className="connection">
            <span className="connection-dot"></span>
            API ONLINE
          </div>
        </header>

        <section className="metrics">
          <div className="metric-card">
            <div className="metric-top">
              <span>Total Requests</span>
              <span className="metric-icon">↗</span>
            </div>

            <strong>{totalRequests}</strong>

            <p>Recorded API traffic</p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <span>Normal Traffic</span>
              <span className="metric-icon green">✓</span>
            </div>

            <strong>{normalRequests}</strong>

            <p>Requests within threshold</p>
          </div>

          <div className="metric-card danger-card">
            <div className="metric-top">
              <span>Suspicious</span>
              <span className="metric-icon red">!</span>
            </div>

            <strong>{suspiciousRequests}</strong>

            <p>Requests flagged by detection</p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <span>Suspicious Rate</span>
              <span className="metric-icon">%</span>
            </div>

            <strong>{suspiciousPercentage}%</strong>

            <p>Of recorded traffic</p>
          </div>
        </section>

        <section className="workspace">
          <div className="panel traffic-panel">
            <div className="panel-heading">
              <div>
                <h3>Request Activity</h3>
                <p>Live records from the API monitoring service</p>
              </div>

              <div className="record-count">
                {totalRequests} RECORDS
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>IP ADDRESS</th>
                    <th>ENDPOINT</th>
                    <th>METHOD</th>
                    <th>STATUS</th>
                    <th>RISK</th>
                    <th>TIME</th>
                  </tr>
                </thead>

                <tbody>
                  {requests
                    .slice()
                    .reverse()
                    .map((request) => (
                      <tr key={request.id}>
                        <td className="request-id">
                          #{request.id}
                        </td>

                        <td className="ip">
                          {request.ipAddress || "Unknown"}
                        </td>

                        <td className="endpoint">
                          {request.endpoint || "Unknown"}
                        </td>

                        <td>
                          <span className="method">
                            {request.method || "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              request.statusCode >= 400
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
                          {new Date(
                            request.timestamp
                          ).toLocaleTimeString()}
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

          <div className="right-column">
            <div className="panel detection-panel">
              <div className="panel-heading compact">
                <div>
                  <h3>Detection Rules</h3>
                  <p>Active monitoring logic</p>
                </div>
              </div>

              <div className="rule">
                <div className="rule-number">01</div>

                <div>
                  <strong>IP Request Threshold</strong>
                  <p>
                    Flag an IP after repeated requests cross the
                    configured threshold.
                  </p>
                </div>

                <span className="rule-status">ACTIVE</span>
              </div>

              <div className="rule">
                <div className="rule-number">02</div>

                <div>
                  <strong>Request Logging</strong>
                  <p>
                    Store IP, endpoint, method, status and timestamp
                    for analysis.
                  </p>
                </div>

                <span className="rule-status">ACTIVE</span>
              </div>
            </div>

            <div className="panel simulator-panel">
              <div className="panel-heading compact">
                <div>
                  <h3>Test Traffic</h3>
                  <p>Generate a request for detection testing</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <label>
                  IP Address
                  <input
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    placeholder="10.0.0.5"
                    required
                  />
                </label>

                <label>
                  Endpoint
                  <input
                    type="text"
                    name="endpoint"
                    value={formData.endpoint}
                    onChange={handleChange}
                    placeholder="/login"
                    required
                  />
                </label>

                <div className="form-row">
                  <label>
                    Method
                    <select
                      name="method"
                      value={formData.method}
                      onChange={handleChange}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </label>

                  <label>
                    Status
                    <input
                      type="number"
                      name="statusCode"
                      value={formData.statusCode}
                      onChange={handleChange}
                      min="100"
                      max="599"
                      required
                    />
                  </label>
                </div>

                <button type="submit">
                  Send Test Request
                  <span>→</span>
                </button>

                {message && (
                  <div className="form-message">{message}</div>
                )}
              </form>
            </div>

            <div className="network-summary">
              <span>UNIQUE IPs</span>
              <strong>{uniqueIps}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

