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
        <div className="card-title">
          <h3>Withdrawal Queue</h3>
          <span className="request-count">{withdrawalRequests.length} requests</span>
        </div>
        <button 
          className="refresh-btn" 
          onClick={loadWithdrawalRequests}
          title="Refresh Queue"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
      </div>
      
      <div className="card-body">
        {withdrawalRequests.length === 0 ? (
          <div className="no-requests">
            <div className="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
                <path d="M6 12H3a2 2 0 0 0-2 2v1"/>
              </svg>
            </div>
            <p>No withdrawal requests</p>
            <span className="empty-subtitle">Your withdrawal queue is empty</span>
          </div>
        ) : (
          <div className="requests-container">
            <div className="requests-list">
              {withdrawalRequests.map((request, index) => {
                const isUnstaking = request.isUnstaking === true;
                const isCompleted = request.completed === true;
                const amount = parseFloat(request.amount);
                const formattedAmount = amount > 0 ? amount.toFixed(8) : '0.00000000';
                
                // Calculate days left (assuming 7-day unstaking period)
                const unstakingPeriod = 7; // days
                const requestDate = new Date(request.timestamp || Date.now());
                const daysLeft = Math.max(0, unstakingPeriod - Math.floor((Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <div key={index} className={`request-item ${isCompleted ? 'completed' : 'pending'}`}>
                    <div className="request-main">
                      <div className="request-header">
                        <div className="request-type-section">
                          <div className={`request-type-badge ${isUnstaking ? 'unstaking' : 'withdrawal'}`}>
                            {isUnstaking ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                  <path d="M21 3v5h-5"/>
                                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                  <path d="M3 21v-5h5"/>
                                </svg>
                                zHYPE Unstaking
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                  <path d="M21 3v5h-5"/>
                                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                  <path d="M3 21v-5h5"/>
                                </svg>
                                HYPE Withdrawal
                              </>
                            )}
                          </div>
                          <div className="request-amount">
                            <span className="amount-value">{formattedAmount}</span>
                            <span className="token-symbol">{isUnstaking ? 'zHYPE' : 'HYPE'}</span>
                          </div>
                        </div>
                        
                        <div className="request-status-section">
                          {isCompleted ? (
                            <div className="status-badge completed">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                              Completed
                            </div>
                          ) : (
                            <div className="status-badge pending">
                              <div className="pending-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                              {daysLeft > 0 ? `${daysLeft} days left` : 'Ready to claim'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="request-details">
                        <div className="detail-item">
                          <span className="detail-label">Requested</span>
                          <span className="detail-value">{request.timestamp || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Unstaking Period</span>
                          <span className="detail-value">7 days</span>
                        </div>
                        {!isCompleted && daysLeft > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">Time Remaining</span>
                            <span className="detail-value time-remaining">{daysLeft} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalQueue;

