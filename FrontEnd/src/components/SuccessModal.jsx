function SuccessModal({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '48px',
          color: '#22c55e',
          marginBottom: '16px'
        }}>
          ✓
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#1f2937'
        }}>
          Success!
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '10px 24px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
