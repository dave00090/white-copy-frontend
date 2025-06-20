import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

function WhiteCopyEnterprises() {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({
    name: '',
    service: '',
    invoice: '',
    paid: '',
    ordered: '',
    delivery: '',
  });

  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch("https://white-copy-backend-1.onrender.com/api/clients")
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(() => setError("Cannot reach backend server."));
  }, []);

  const handleAddClient = () => {
    const clientData = {
      ...newClient,
      owed: Number(newClient.invoice) - Number(newClient.paid),
    };

    fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    })
      .then(res => res.json())
      .then(addedClient => {
        setClients([...clients, addedClient]);
        setNewClient({
          name: '',
          service: '',
          invoice: '',
          paid: '',
          ordered: '',
          delivery: '',
        });
      })
      .catch(() => setError("Failed to add client."));
  };

  const handleDownloadInvoice = (client) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("White Copy Enterprises", 20, 20);
    doc.setFontSize(12);
    doc.text(`Client: ${client.name}`, 20, 40);
    doc.text(`Service: ${client.service}`, 20, 50);
    doc.text(`Invoice: ${client.invoice}`, 20, 60);
    doc.text(`Paid: ${client.paid}`, 20, 70);
    doc.text(`Owed: ${client.owed}`, 20, 80);
    doc.text(`Order: ${client.ordered}`, 20, 90);
    doc.text(`Delivery: ${client.delivery}`, 20, 100);
    doc.text(`M-Pesa Paybill: 0720248732`, 20, 120);
    doc.save(`${client.name}_invoice.pdf`);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clients);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "White_Copy_Clients.xlsx");
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
        <h1>Admin Login - White Copy Enterprises</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
        />
        <br /><br />
        <button onClick={() => {
          if (passwordInput === 'whiteadmin123') {
            setIsLoggedIn(true);
          } else {
            alert('Incorrect password.');
          }
        }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>White Copy Enterprises</h1>
      <p><strong>M-Pesa Payment Number:</strong> 0720248732</p>
      <button onClick={() => setIsLoggedIn(false)}>Log Out</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Add New Client</h2>
      <input placeholder="Client Name" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} /><br />
      <input placeholder="Service Done / Part Delivered" value={newClient.service} onChange={e => setNewClient({ ...newClient, service: e.target.value })} /><br />
      <input type="number" placeholder="Invoice Amount" value={newClient.invoice} onChange={e => setNewClient({ ...newClient, invoice: e.target.value })} /><br />
      <input type="number" placeholder="Amount Paid" value={newClient.paid} onChange={e => setNewClient({ ...newClient, paid: e.target.value })} /><br />
      <input placeholder="Inks or Masters Ordered" value={newClient.ordered} onChange={e => setNewClient({ ...newClient, ordered: e.target.value })} /><br />
      <input placeholder="Delivery Status" value={newClient.delivery} onChange={e => setNewClient({ ...newClient, delivery: e.target.value })} /><br />
      <button onClick={handleAddClient}>Add Client</button>

      <h2 style={{ marginTop: '2rem' }}>Client List</h2>
      <button onClick={handleExportExcel}>Export to Excel</button>
      <h3>Search Clients:</h3>
      <input
        type="text"
        placeholder="Search by name, service or owed"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Name</th>
            <th>Service</th>
            <th>Invoice</th>
            <th>Paid</th>
            <th>Owed</th>
            <th>Order</th>
            <th>Delivery</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          {clients
            .filter(client =>
              client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(client.owed).includes(searchTerm)
            )
            .map((client, index) => (
              <tr key={index}>
                <td>{client.name}</td>
                <td>{client.service}</td>
                <td>{client.invoice}</td>
                <td>{client.paid}</td>
                <td>{client.owed}</td>
                <td>{client.ordered}</td>
                <td>{client.delivery}</td>
                <td>
                  <button onClick={() => handleDownloadInvoice(client)}>Download</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default WhiteCopyEnterprises;
