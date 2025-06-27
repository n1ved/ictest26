import React from "react";

export default function LoadingSpinner({
  text = "Loading...",
  size = "default",
  fullScreen = true,
}) {
  const spinnerSizes = {
    small: 20,
    default: 32,
    large: 48,
  };

  const spinnerSize = spinnerSizes[size];

  const containerStyles = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 26, 51, 0.9)",
        zIndex: 1000,
      }
    : {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        width: "100%",
      };

  const cardStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    padding: "2rem",
    borderRadius: "12px",
    backgroundColor: "#001a33",
    border: "2px solid #375a7f",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    minWidth: "200px",
  };

  const spinnerStyles = {
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    border: "3px solid #375a7f",
    borderTop: "3px solid #ffe066",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const textStyles = {
    color: "#b3c6e0",
    fontSize: "1rem",
    fontWeight: "600",
    margin: 0,
    textAlign: "center",
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={containerStyles}>
        <div style={cardStyles}>
          <div style={spinnerStyles}></div>
          {text && <p style={textStyles}>{text}</p>}
        </div>
      </div>
    </>
  );
}

// Demo component showing how it works with your existing code
function AddPaperDemo() {
  const [loading, setLoading] = React.useState(true);
  const [step, setStep] = React.useState(1);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else {
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [step]);

  const getLoadingText = () => {
    switch (step) {
      case 1:
        return "Checking for papers...";
      case 2:
        return "Loading tracks...";
      case 3:
        return "Finalizing...";
      default:
        return "Loading...";
    }
  };

  if (loading) {
    return <LoadingSpinner text={getLoadingText()} fullScreen={false} />;
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #001a33 0%, #003366 100%)",
        minHeight: "100vh",
        padding: "2rem",
        color: "#e6eaff",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#001a33",
          border: "2px solid #375a7f",
          borderRadius: "18px",
          padding: "2rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h3
          style={{
            color: "#fff",
            marginBottom: "1.5rem",
            fontWeight: 800,
            fontSize: "1.5rem",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Add Paper
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              color: "#b3c6e0",
              fontWeight: 600,
              marginBottom: "6px",
              fontSize: "1.08rem",
              letterSpacing: "0.5px",
              display: "block",
            }}
          >
            Paper Title <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter the paper title"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "1.1rem",
              borderRadius: "8px",
              border: "1.5px solid #375a7f",
              fontSize: "1.1rem",
              background: "#001a33",
              color: "#fff",
            }}
          />
        </div>

        <button
          onClick={() => setLoading(true)}
          style={{
            width: "100%",
            background: "#003366",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "0.9rem 0",
            fontWeight: 800,
            fontSize: "1.15rem",
            cursor: "pointer",
            marginTop: "1rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          Test Loading Spinner
        </button>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "rgba(255, 224, 102, 0.1)",
            border: "1px solid #ffe066",
            borderRadius: "8px",
            fontSize: "0.9rem",
            color: "#ffe066",
          }}
        >
          <strong>How to use in your AddPaper component:</strong>
          <pre
            style={{
              margin: "0.5rem 0 0 0",
              color: "#b3c6e0",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
            }}
          >
          </pre>
        </div>
      </div>
    </div>
  );
}
