export default function CRPGuideLines(){
  return (
    <div className="crp-container">
      <h1>ICTEST-2025 Camera-Ready Paper Guidelines</h1>

      <section className="format-section">
        <h2>Paper Preparation</h2>
        <div className="requirements">
          <h3>Formatting Requirements</h3>
          <ul>
            <li>IEEE two-column A4 format (templates provided)</li>
            <li>Max 6 pages (8 with fee) • 3MB PDF limit</li>
            <li>No headers/footers except copyright notice</li>
            <li>300dpi+ figures • Equation editor required</li>
          </ul>
        </div>

        <div className="checklist">
          <h3>Submission Checklist</h3>
          <ul>
            <li>✓ Author affiliations without titles/prefixes</li>
            <li>✓ Minimum 5 keywords included</li>
            <li>✓ IEEE citation format throughout</li>
            <li>✓ No first-person pronouns</li>
            <li>✓ Copyright notice: 979-8-3315-0537-0/25/$31.00 ©2025 IEEE</li>
          </ul>
        </div>
      </section>

      <section className="workflow-section">
        <div className="step-card">
          <h2>PDF Verification</h2>
          <p>Conference ID: <strong>64710X</strong></p>
          <div className="instructions">
            <h4>First-Time Users:</h4>
            <ol>
              <li>Create account at IEEE PDF eXpress</li>
              <li>Use conference ID 64710X</li>
            </ol>
          </div>
        </div>

        <div className="step-card">
          <h2>Final Submission</h2>
          <ul>
            <li>Filename: <code>PaperID_ictest25.pdf</code></li>
            <li>Submit through Microsoft CMT Author Console</li>
            <li>Author list must match original submission</li>
          </ul>
        </div>
      </section>

      <div className="important-note">
        <h3>Critical Requirements</h3>
        <ul>
          <li>❌ Max 30% plagiarism allowed</li>
          <li>📝 Separate registration per paper</li>
          <li>🔒 No author biography sections</li>
        </ul>
      </div>
    </div>

  )
}