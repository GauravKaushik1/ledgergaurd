import React, { useState, useEffect } from 'react';
import { executeIdempotentCharge, fetchLedger } from '../services/api';

export default function LedgerDashboard({ accountId, tenantName }) {
  const [entries, setEntries] = useState([]);
  const [amount, setAmount] = useState('');
  const [pendingKey, setPendingKey] = useState(() => crypto.randomUUID());
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    const { data } = await fetchLedger();
    setEntries(data.entries);
  };

  useEffect(() => { loadData(); }, []);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setNotification({ type: 'info', msg: 'Acquiring Redis lock & executing ACID transaction...' });

    try {
      const { data } = await executeIdempotentCharge(
        { accountId, amount: Number(amount), type: 'DEBIT', description: 'API Usage Charge' },
        pendingKey
      );

      setNotification({
        type: 'success',
        msg: data.cached
          ? 'Duplicate network call intercepted! Returned safe cached ledger state.'
          : `Transaction committed! New Balance: $${(data.newBalance / 100).toFixed(2)}`
      });

      // Only rotate idempotency key once transaction definitively succeeds
      setPendingKey(crypto.randomUUID());
      setAmount('');
      loadData();
    } catch (err) {
      setNotification({
        type: 'error',
        msg: `Rollback Triggered: ${err.response?.data?.error || 'Network Timeout'}`
      });
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>LedgerGuard — Isolated Cluster: [{tenantName}]</h2>

      {notification && (
        <div style={{ padding: '12px', marginBottom: '1rem', border: '1px solid #333' }}>
          <strong>[{notification.type.toUpperCase()}]</strong> {notification.msg}
        </div>
      )}

      <form onSubmit={handleTransaction} style={{ marginBottom: '2rem' }}>
        <input
          type="number"
          placeholder="Amount in cents (e.g. 2500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Charge Tenant (Key: {pendingKey.slice(0, 8)}...)</button>
      </form>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Idempotency Key</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((tx) => (
            <tr key={tx._id}>
              <td><code>{tx.idempotencyKey}</code></td>
              <td>{tx.type}</td>
              <td>${(tx.amount / 100).toFixed(2)}</td>
              <td>{tx.status}</td>
              <td>{new Date(tx.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
