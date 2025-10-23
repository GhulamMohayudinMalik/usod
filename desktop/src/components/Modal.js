import React from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-in-out'
    }}
    onClick={onClose}
    >
      <div style={{
        background: 'rgba(31, 41, 55, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0.5rem',
        padding: '2rem',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid rgba(55, 65, 81, 0.3)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        animation: 'slideUp 0.3s ease-out',
        ...sizeStyles[size]
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(55, 65, 81, 0.3)'
        }}>
          <div style={{ flex: 1 }}>
            {typeof title === 'string' ? (
              <h2 style={{ 
                color: 'white', 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                margin: 0 
              }}>
                {title}
              </h2>
            ) : (
              title
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              marginLeft: '1rem',
              transition: 'color 0.2s',
              lineHeight: 1
            }}
            onMouseEnter={(e) => e.target.style.color = 'white'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ marginBottom: footer ? '1.5rem' : 0 }}>
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div style={{ 
            borderTop: '1px solid rgba(55, 65, 81, 0.3)', 
            paddingTop: '1rem' 
          }}>
            {footer}
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              transform: translateY(20px);
              opacity: 0;
            }
            to { 
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}} />
      </div>
    </div>
  );
};

export default Modal;

