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

    setFormData({
      ...formData,
      [name]: value,
    });
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
      .then((response) => response.json())
      .then(() => {
        setMessage("Request recorded successfully.");

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
        setMessage("Failed to record request.");
      });
  };

  const totalRequests = requests.length;

  const suspiciousRequests = requests.filter(
    (request) => request.suspicious
  ).length;

  const normalRequests = totalRequests - suspiciousRequests;

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>API Abuse Detector</h1>
          <p>API security monitoring dashboard</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Backend Connected
        </div>
      </header>

      <section className="stats">
        <div className="card">
          <span>Total Requests</span>
          <strong>{totalRequests}</strong>
        </div>

        <div className="card">
          <span>Normal Requests</span>
          <strong>{normalRequests}</strong>
        </div>

        <div className="card suspicious-card">
          <span>Suspicious Requests</span>
          <strong>{suspiciousRequests}</strong>
        </div>
      </section>

      <section className="form-section">
        <div className="section-header">
          <div>
            <h2>Simulate API Request</h2>
            <span>Send a request to test the abuse detection system</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label>IP Address</label>
            <input
              type="text"
              name="ipAddress"
              value={formData.ipAddress}
              onChange={handleChange}
              placeholder="192.168.1.10"
              required
            />
          </div>

          <div className="form-group">
            <label>Endpoint</label>
            <input
              type="text"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleChange}
              placeholder="/login"
              required
            />
          </div>

          <div className="form-group">
            <label>Method</label>
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
          </div>

          <div className="form-group">
            <label>Status Code</label>
            <input
              type="number"
              name="statusCode"
              value={formData.statusCode}
              onChange={handleChange}
              min="100"
              max="599"
              required
            />
          </div>

          <button type="submit">Send Request</button>
        </form>

        {message && <p className="message">{message}</p>}
      </section>

      <section className="table-section">
        <div className="section-header">
          <h2>Recent API Requests</h2>
          <span>{totalRequests} records</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>IP Address</th>
                <th>Endpoint</th>
                <th>Method</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td>{request.ipAddress}</td>
                  <td>{request.endpoint}</td>
                  <td>
                    <span className="method">{request.method}</span>
                  </td>
                  <td>{request.statusCode}</td>
                  <td>
                    {request.suspicious ? (
                      <span className="badge danger">Suspicious</span>
                    ) : (
                      <span className="badge safe">Normal</span>
                    )}
                  </td>
                  <td>
                    {new Date(request.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {requests.length === 0 && (
            <div className="empty">No request logs found.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;