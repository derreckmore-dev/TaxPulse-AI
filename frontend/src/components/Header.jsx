import React, { useState } from 'react';
import { Search, Bell, Shield, CheckCircle, AlertTriangle, AlertCircle, Bookmark } from 'lucide-react';
import { useTax } from '../context/TaxContext';

const Header = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    markNotificationsAsRead,
    bookmarks,
    regulations,
    setSelectedRegId,
    activeView,
    setActiveView
  } = useTax();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowBookmarks(false);
    if (!showNotifications) {
      markNotificationsAsRead();
    }
  };

  const handleBookmarkClick = () => {
    setShowBookmarks(!showBookmarks);
    setShowNotifications(false);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertCircle size={16} className="text-danger" style={{ color: 'var(--color-danger)' }} />;
      case 'warning': return <AlertTriangle size={16} className="text-warning" style={{ color: 'var(--color-warning)' }} />;
      default: return <CheckCircle size={16} className="text-success" style={{ color: 'var(--color-success)' }} />;
    }
  };

  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="text-muted" />
        <input 
          type="text" 
          placeholder="Search tax amendments, regulations, authorities..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="header-actions">
        {/* Bookmarks Toggle */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={handleBookmarkClick}
            title="Bookmarked Circulars"
          >
            <Bookmark size={20} />
            {bookmarks.length > 0 && <span className="btn-dot" style={{ backgroundColor: 'var(--color-primary)' }} />}
          </button>

          {showBookmarks && (
            <div 
              style={{
                position: 'absolute',
                top: '45px',
                right: '0',
                width: '300px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 100
              }}
            >
              <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                Bookmarked Regulations ({bookmarks.length})
              </h4>
              {bookmarks.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px 0' }}>
                  No bookmarked items.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {bookmarks.map(bId => {
                    const reg = regulations.find(r => r.id === bId);
                    if (!reg) return null;
                    return (
                      <div 
                        key={bId}
                        style={{
                          fontSize: '0.8rem',
                          padding: '8px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-sm)',
                          cursor: 'pointer',
                          backgroundColor: 'var(--bg-primary)'
                        }}
                        onClick={() => {
                          setSelectedRegId(bId);
                          setShowBookmarks(false);
                        }}
                      >
                        <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {reg.title}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {reg.taxType} • {reg.riskLevel} Risk
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Center */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={handleNotificationClick}
            title="Smart Compliance Alerts"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="btn-dot" />}
          </button>

          {showNotifications && (
            <div 
              style={{
                position: 'absolute',
                top: '45px',
                right: '0',
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <h4 style={{ fontSize: '0.9rem' }}>Smart Compliance Alerts</h4>
                <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>Live Feed</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div 
                    key={n.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      fontSize: '0.8rem',
                      padding: '8px',
                      borderBottom: '1px solid var(--bg-primary)'
                    }}
                  >
                    {getAlertIcon(n.type)}
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="user-profile">
          <div className="user-avatar">
            CM
          </div>
          <Shield size={16} className="text-secondary" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    </header>
  );
};

export default Header;
