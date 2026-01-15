import React, { useMemo, useCallback } from 'react';
import { Clock, CheckCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const WithdrawalQueue = ({
  withdrawalRequests = [],
  loadWithdrawalRequests,
  account,
  isConnected,
  unstakingQueueContract,
  showNotification
}) => {
  // Constants
  const UNSTAKING_PERIOD_DAYS = 7;

  // Debug logging
  console.log('🔍 WithdrawalQueue received withdrawalRequests:', withdrawalRequests);
  console.log('🔍 WithdrawalQueue withdrawalRequests length:', withdrawalRequests.length);

  // Memoized calculations
  const processedRequests = useMemo(() => {
    console.log('🔍 Processing withdrawalRequests in useMemo:', withdrawalRequests);
    const processed = withdrawalRequests.map((request, index) => {
      const isUnstaking = Boolean(request.isUnstaking);
      const isCompleted = Boolean(request.completed);
      const amount = parseFloat(request.amount) || 0;
      const formattedAmount = amount >= 0.0001 ? amount.toFixed(4).replace(/\.?0+$/, '') : '0';
      
      // Calculate days remaining
      const requestTimestamp = request.timestamp ? new Date(request.timestamp).getTime() : Date.now();
      const daysElapsed = Math.floor((Date.now() - requestTimestamp) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, UNSTAKING_PERIOD_DAYS - daysElapsed);
      
      return {
        id: `${request.user || account}-${index}`,
        isUnstaking,
        completed: isCompleted,
        amount: formattedAmount,
        token: isUnstaking ? 'zHYPE' : 'HYPE',
        daysRemaining,
        requestDate: requestTimestamp,
        timestamp: request.timestamp || 'Unknown'
      };
    });
    console.log('🔍 Processed requests result:', processed);
    return processed;
  }, [withdrawalRequests, account]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    if (loadWithdrawalRequests) {
      loadWithdrawalRequests();
    }
  }, [loadWithdrawalRequests]);

  const handleClaimRequest = useCallback((requestId) => {
    // TODO: Implement claim functionality
    showNotification?.('Claim functionality coming soon', 'info');
  }, [showNotification]);

  // Render helpers
  const renderEmptyState = () => (
    <div className="withdrawal-queue__empty">
      <div className="withdrawal-queue__empty-icon">
        <Clock size={32} />
      </div>
      <h4>No withdrawal requests</h4>
      <p>Your withdrawal queue is empty</p>
    </div>
  );

  const renderRequestType = (isUnstaking) => (
    <div className={`withdrawal-queue__type-badge ${isUnstaking ? 'unstaking' : 'withdrawal'}`}>
      {isUnstaking ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
      <span>{isUnstaking ? 'zHYPE Unstaking' : 'HYPE Withdrawal'}</span>
    </div>
  );

  const renderStatusBadge = (isCompleted, daysRemaining) => {
    if (isCompleted) {
      return (
        <div className="withdrawal-queue__status-badge completed">
          <CheckCircle size={12} />
          <span>Completed</span>
        </div>
      );
    }

    return (
      <div className="withdrawal-queue__status-badge pending">
        <div className="withdrawal-queue__pending-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Ready to claim'}</span>
      </div>
    );
  };

  const renderRequestItem = (request) => {
    // Calculate hours remaining for more precise time display
    const requestTimestamp = new Date(request.timestamp).getTime();
    const now = Date.now();
    const hoursElapsed = Math.floor((now - requestTimestamp) / (1000 * 60 * 60));
    const hoursRemaining = Math.max(0, (UNSTAKING_PERIOD_DAYS * 24) - hoursElapsed);
    const daysRemaining = Math.floor(hoursRemaining / 24);
    const hoursLeft = hoursRemaining % 24;
    
    const timeDisplay = request.completed 
      ? 'Ready' 
      : hoursRemaining > 0 
        ? `${daysRemaining}d ${hoursLeft}h`
        : 'Ready';

    const statusClass = request.completed ? 'completed' : hoursRemaining > 0 ? 'pending' : 'ready';

    return (
      <div key={request.id} className={`withdrawal-queue__item ${statusClass}`}>
        <div className="withdrawal-queue__item-content">
          <div className="withdrawal-queue__item-left">
            <div className="withdrawal-queue__type">
              {request.isUnstaking ? (
                <>
                  <ArrowDownLeft size={14} className="withdrawal-queue__type-icon" />
                  <span>zHYPE</span>
                </>
              ) : (
                <>
                  <ArrowUpRight size={14} className="withdrawal-queue__type-icon" />
                  <span>HYPE</span>
                </>
              )}
            </div>
            
            <div className="withdrawal-queue__amount">
              <span className="withdrawal-queue__amount-value">
                {parseFloat(request.amount).toFixed(4).replace(/\.?0+$/, '')}
              </span>
            </div>
          </div>
          
          <div className="withdrawal-queue__item-right">
            <div className={`withdrawal-queue__time ${statusClass}`}>
              {timeDisplay}
            </div>
            {!request.completed && hoursRemaining > 0 && (
              <div className="withdrawal-queue__progress">
                <div className="withdrawal-queue__progress-bar">
                  <div 
                    className="withdrawal-queue__progress-fill"
                    style={{ 
                      width: `${Math.min(100, ((UNSTAKING_PERIOD_DAYS * 24 - hoursRemaining) / (UNSTAKING_PERIOD_DAYS * 24)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="withdrawal-queue-card">
      <div className="withdrawal-queue__header">
        <h3>Withdrawal Queue</h3>
      </div>
      
      <div className="withdrawal-queue__body">
        {(() => {
          console.log('🔍 Rendering withdrawal queue body, processedRequests.length:', processedRequests.length);
          console.log('🔍 processedRequests:', processedRequests);
          return processedRequests.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="withdrawal-queue__list">
              {processedRequests.map(renderRequestItem)}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default WithdrawalQueue;

