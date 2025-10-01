import React from 'react';

const WithdrawalQueue = ({
  withdrawalRequests,
  loadWithdrawalRequests,
  account,
  isConnected,
  unstakingQueueContract,
  showNotification
}) => {
  return (
    <div className="withdrawal-queue-card">
      <div className="card-header">
        <h3 className="card-title">Withdrawal Queue</h3>
        <button 
          className="refresh-btn" 
          onClick={loadWithdrawalRequests}
          title="Refresh Queue"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
      </div>
      <div className="card-body">
        <div className="withdrawal-queue">
          {withdrawalRequests.length === 0 ? (
            <div className="no-requests">
              <p>No withdrawal or unstaking requests</p>
            </div>
          ) : (
            <div className="requests-list">
              {withdrawalRequests.map((request) => {
                const isUnstaking = request.isUnstaking === true;
                const isReady = request.isReady;
                
                return (
                  <div key={request.id} className={`request-item ${request.processed ? 'processed' : isReady ? 'ready' : 'pending'}`}>
                    <div className="request-info">
                      <div className="request-header">
                        <div className="request-amount">
                          <span className="amount">{request.amount}</span>
                          <span className="token">{isUnstaking ? 'zHYPE' : 'HYPE'}</span>
                        </div>
                        <div className="request-type">
                          {isUnstaking ? 'Unstaking' : 'Withdrawal'}
                        </div>
                      </div>
                      <div className="request-details">
                        <div className="request-time">
                          <span className="label">Requested:</span>
                          <span className="value">{new Date(request.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="request-time">
                          <span className="label">Ready:</span>
                          <span className="value">{new Date(request.readyTime).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="request-status">
                      {request.processed ? (
                        <span className="status-badge processed">Completed</span>
                      ) : isReady ? (
                        <button 
                          className="status-badge ready"
                          onClick={() => {
                            // Handle completion logic here
                            showNotification('Withdrawal completed!', 'success');
                          }}
                        >
                          Ready to Complete!
                        </button>
                      ) : (
                        <span className="status-badge pending">
                          {Math.ceil((request.readyTime - Date.now()) / (1000 * 60 * 60 * 24))} days left
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalQueue;

