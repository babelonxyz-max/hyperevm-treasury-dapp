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

  // Memoized calculations
  const processedRequests = useMemo(() => {
    return withdrawalRequests.map((request, index) => {
      const isUnstaking = Boolean(request.isUnstaking);
      const isCompleted = Boolean(request.completed);
      const amount = parseFloat(request.amount) || 0;
      const formattedAmount = amount > 0 ? amount.toFixed(8) : '0.00000000';
      
      // Calculate days remaining
      const requestTimestamp = request.timestamp ? new Date(request.timestamp).getTime() : Date.now();
      const daysElapsed = Math.floor((Date.now() - requestTimestamp) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, UNSTAKING_PERIOD_DAYS - daysElapsed);
      
      return {
        id: `${request.user || account}-${index}`,
        isUnstaking,
        isCompleted,
        amount: formattedAmount,
        token: isUnstaking ? 'zHYPE' : 'HYPE',
        daysRemaining,
        requestDate: requestTimestamp,
        timestamp: request.timestamp || 'Unknown'
      };
    });
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

  const renderRequestItem = (request) => (
    <div key={request.id} className={`withdrawal-queue__item ${request.isCompleted ? 'completed' : 'pending'}`}>
      <div className="withdrawal-queue__item-header">
        <div className="withdrawal-queue__item-left">
          {renderRequestType(request.isUnstaking)}
          <div className="withdrawal-queue__amount">
            <span className="withdrawal-queue__amount-value">{request.amount}</span>
            <span className="withdrawal-queue__amount-token">{request.token}</span>
          </div>
        </div>
        <div className="withdrawal-queue__item-right">
          {renderStatusBadge(request.isCompleted, request.daysRemaining)}
        </div>
      </div>
      
      <div className="withdrawal-queue__item-details">
        <div className="withdrawal-queue__detail">
          <span className="withdrawal-queue__detail-label">Requested</span>
          <span className="withdrawal-queue__detail-value">{request.timestamp}</span>
        </div>
        <div className="withdrawal-queue__detail">
          <span className="withdrawal-queue__detail-label">Period</span>
          <span className="withdrawal-queue__detail-value">{UNSTAKING_PERIOD_DAYS} days</span>
        </div>
        {!request.isCompleted && request.daysRemaining > 0 && (
          <div className="withdrawal-queue__detail">
            <span className="withdrawal-queue__detail-label">Remaining</span>
            <span className="withdrawal-queue__detail-value time-remaining">{request.daysRemaining} days</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="withdrawal-queue-card">
      <div className="withdrawal-queue__header">
        <div className="withdrawal-queue__title">
          <h3>Withdrawal Queue</h3>
        </div>
        <div className="withdrawal-queue__header-actions">
          <span className="withdrawal-queue__count">{processedRequests.length} requests</span>
          <button 
            className="withdrawal-queue__refresh-btn" 
            onClick={handleRefresh}
            title="Refresh Queue"
            aria-label="Refresh withdrawal queue"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>
      
      <div className="withdrawal-queue__body">
        {processedRequests.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="withdrawal-queue__list">
            {processedRequests.map(renderRequestItem)}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalQueue;

