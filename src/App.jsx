import React, { useState, useEffect } from 'react';
import axios from 'axios';
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 16px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  },
  table: {
    color: "#333",
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    backgroundColor: "#f4f4f4",
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
  },
};
function App() {
  const [userText, setUserText] = useState('');
  const [entityName, setEntityName] = useState('');
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [records, setRecords] = useState([]);

 

  function extractFields(userInput) {
    const patterns = [
      /(?:inputs?\s+of|about|for)\s+(\w+).*like\s+(.+)/i,
      /create an app for (\w+).*fields?\s+(.+)/i,
      /create a form for (\w+).*fields?\s+(.+)/i,
      /develop a (\w+)\s+form.*accepts?\s+(.+)/i,
      /build a system.*input of (\w+).*like\s+(.+)/i,
      /form about (\w+).*including\s+(.+)/i,
      /capture\s+(\w+)\s+info.*[:]?(.+)/i,
      /(?:inputs of|form for|about|schema for|create|capture|develop form for|entity)\s+(\w+)\s+(?:like|with fields|with|having|info:|fields|:)?\s*(.+)/i,
      /collect\s+(\w+)\s+data[:\s]*([\w,\s]+)/i
    ];
  
    for (const pattern of patterns) {
      const match = userInput.match(pattern);
      if (match) {
        const entity = match[1].trim();
        const fieldsRaw = match[2].trim();
        const fields = fieldsRaw.split(",").map(f => f.trim());
        return { entity, fields };
      }
    }
  
    return { entity: null, fields: [] };
  }
  const parseText = (text) => {
    const match = text.toLowerCase().match(/(?:inputs of|about|for)\s+(\w+).*like\s+(.*)/);
    if (!match) return null;
    return {
      entity: match[1],
      fields: match[2].split(',').map(f => f.trim())
    };
  };

  const handleCreate = async () => {
    setEntityName('')
    setFields([]);
    setRecords([]);

    const parsed = extractFields(userText);
    if (!parsed || !parsed.entity || !parsed.fields || parsed.fields.length === 0) {
      return alert("Invalid input");
    }
    await axios.post("http://localhost:8080/api/entities", parsed);
    setEntityName(parsed.entity);
    
  };

  useEffect(() => {
    if (!entityName) return;
    axios.get(`http://localhost:8080/api/entities/${entityName}`)
      .then(res => setFields(res.data)).then(()=>{
        axios.get(`http://localhost:8080/api/entities/${entityName}/records`)
        .then(res => setRecords(res.data));
      });

    
  }, [entityName]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`http://localhost:8080/api/entities/${entityName}/submit`, formData);
    axios.get(`http://localhost:8080/api/entities/${entityName}/records`)
        .then(res => setRecords(res.data));
    alert("Submitted");
    setFormData({});
  };
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Dynamic App Generator</h2>
      <label style={styles.label}>Prompt:</label>
      <textarea value={userText} onChange={(e) => setUserText(e.target.value)}
        rows={3} cols={60} placeholder="e.g., Develop an app that takes inputs of employee like name, address, number" />
      <br />
      <button  style={styles.button} onClick={handleCreate}>Create App</button>

      {fields.length > 0 && (
        <form onSubmit={handleSubmit}>
          <h3>Fill {entityName} Form</h3>
          {fields.map(f => (
            <div key={f.fieldName}>
              <label style={styles.label}>{f.fieldName}:</label>
              <input
                type={f.fieldType === 'number' ? 'number' : 'text'}
                name={f.fieldName}
                value={formData[f.fieldName] || ''}
                onChange={handleChange}
                style={styles.input}
                 />
            </div>
          ))}
          <button  style={styles.button} type="submit">Submit</button>
        </form>
      )}

{records.length > 0 && (
        <div style={{ ...styles.heading, marginTop: "40px" }}>
          <h3>Submitted Records</h3>
          <table style={styles.table} border="1" cellPadding="5">
            <thead>
              <tr>
                {Object.keys(records[0]).map((col) => (
                  <th style={styles.th} key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key) => (
                    <td style={styles.td} key={key}>{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;