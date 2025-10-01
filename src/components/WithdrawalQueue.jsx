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
              {withdrawalRequests.map((request, index) => {
                const isUnstaking = request.isUnstaking === true;
                const isCompleted = request.completed === true;
                const amount = parseFloat(request.amount).toFixed(8);
                
                return (
                  <div key={index} className={`request-item ${isCompleted ? 'processed' : 'pending'}`}>
                    <div className="request-info">
                      <div className="request-header">
                        <div className="request-amount">
                          <span className="amount">{amount}</span>
                          <span className="token">{isUnstaking ? 'zHYPE' : 'HYPE'}</span>
                        </div>
                        <div className="request-type">
                          {isUnstaking ? 'Unstaking' : 'Withdrawal'}
                        </div>
                      </div>
                      <div className="request-details">
                        <div className="request-time">
                          <span className="label">Requested:</span>
                          <span className="value">{request.timestamp || 'Unknown'}</span>
                        </div>
                        <div className="request-status">
                          <span className="label">Status:</span>
                          <span className="value">{isCompleted ? 'Completed' : 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="request-status">
                      {isCompleted ? (
                        <span className="status-badge processed">Completed</span>
                      ) : (
                        <span className="status-badge pending">Pending</span>
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

