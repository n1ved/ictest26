import React, { useState } from "react";

export default function PaperSelectionModal({
  isOpen,
  onClose,
  papers = [], // array of objects with paper_id and paper_title
  setPaperId, // function to set the selected paper ID
  modalTitle = "Select Paper",
  curr = null,
}) {
  const [selected, setSelected] = useState(curr);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selected !== null && setPaperId) {
      setPaperId(selected); // Set the paper ID
      onClose(false); // Close modal after setting ID
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 26, 51, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: "#001a33",
          border: "2px solid #375a7f",
          borderRadius: "18px",
          padding: "2rem",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => onClose(false)}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#b3c6e0",
            fontSize: "24px",
            fontWeight: 300,
            lineHeight: 1,
            padding: "4px",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#ffe066";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#b3c6e0";
          }}
        >
          ×
        </button>

        {/* Modal Title */}
        <h3
          style={{
            color: "#fff",
            textAlign: "center",
            marginBottom: "1.5rem",
            marginTop: "0.5rem",
            fontWeight: 800,
            fontSize: "1.8rem",
            letterSpacing: "1px",
            textShadow: "0 2px 8px #00336655",
          }}
        >
          {modalTitle}
        </h3>

        {/* Radio Button List */}
        <div
          style={{
            marginBottom: "2rem",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {papers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#b3c6e0",
                fontSize: "1rem",
                padding: "2rem",
              }}
            >
              No papers available
            </div>
          ) : (
            papers.map((paper, index) => (
              <label
                key={paper.paper_id || index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "0.8rem",
                  marginBottom: "0.5rem",
                  borderRadius: "8px",
                  border:
                    selected === paper.paper_id
                      ? "2px solid #ffe066"
                      : "1px solid #375a7f",
                  background:
                    selected === paper.paper_id
                      ? "rgba(255, 224, 102, 0.1)"
                      : "rgba(55, 90, 127, 0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (selected !== paper.paper_id) {
                    e.target.style.background = "rgba(55, 90, 127, 0.2)";
                    e.target.style.borderColor = "#4a6fa5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected !== paper.paper_id) {
                    e.target.style.background = "rgba(55, 90, 127, 0.1)";
                    e.target.style.borderColor = "#375a7f";
                  }
                }}
              >
                <input
                  type="radio"
                  name="paperSelection"
                  value={paper.paper_id}
                  checked={selected === paper.paper_id}
                  onChange={(e) => setSelected(parseInt(e.target.value))}
                  style={{
                    marginTop: "2px",
                    accentColor: "#ffe066",
                    width: "16px",
                    height: "16px",
                  }}
                />
                <span
                  style={{
                    color: selected === paper.paper_id ? "#fff" : "#b3c6e0",
                    fontSize: "1rem",
                    lineHeight: "1.4",
                    fontWeight: selected === paper.paper_id ? 600 : 400,
                  }}
                >
                  {paper.paper_title}
                </span>
              </label>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => onClose(false)}
            style={{
              background: "transparent",
              color: "#b3c6e0",
              border: "1px solid #375a7f",
              borderRadius: "8px",
              padding: "0.7rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#375a7f";
              e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#b3c6e0";
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={selected === null}
            style={{
              background: selected !== null ? "#375a7f" : "#2a3f5f",
              color: selected !== null ? "#fff" : "#7a8ba3",
              border: "none",
              borderRadius: "8px",
              padding: "0.7rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: selected !== null ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              if (selected !== null) {
                e.target.style.background = "#003366";
              }
            }}
            onMouseLeave={(e) => {
              if (selected !== null) {
                e.target.style.background = "#375a7f";
              }
            }}
          >
            <i className="fa fa-check" style={{ fontSize: "14px" }}></i>
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
