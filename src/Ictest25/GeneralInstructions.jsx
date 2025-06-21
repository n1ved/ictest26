import React from 'react';
import './GeneralInstructions.css';

const GeneralInstructions = () => {
    return (
        <div className="instructions-container">
            <h1>General Instructions for Camera-Ready Paper (CRP) Submission and Registration</h1>
            <h2>ICTEST-2025</h2>

            <p>After you have registered and paid in full for the conference, please follow the instructions below to prepare your final paper and upload it. Each accepted paper requires a separate registration. If an author has multiple papers, they must register for each paper individually.</p>

            {/* Step 1 */}
            <div className="instruction-section">
                <h3>Step 1: Final Camera-Ready Paper Preparation</h3>

                <h4>1. Formatting Guidelines</h4>
                <ul>
                    <li>Follow the IEEE two-column A4 size standard conference format for manuscript preparation.</li>
                    <li>IEEE Templates: <a href="https://www.ieee.org/conferences/publishing/templates.html">IEEE Templates</a></li>
                    <li>DO NOT ADD ANY PAGE NUMBERING, HEADER, OR FOOTER.</li>
                </ul>

                <h4>2. Review-Based Revisions</h4>
                <ul>
                    <li>Revise your paper as per reviewers' comments, available at <a href="https://cmt3.research.microsoft.com/ICTEST2025">ICTEST-2025 CMT</a>.</li>
                    <li>Log in with your registered email to access comments.</li>
                    <li>Ensure that all reviewer comments are thoroughly addressed and proofread carefully to eliminate the need for further revisions.</li>
                </ul>

                <h4>3. Page & File Requirements</h4>
                <ul>
                    <li>Maximum page limit: 6 pages (including references).</li>
                    <li>Additional pages (up to 8) require an extra charge of Rs. 500 ($25) per page.</li>
                    <li>Maximum file size: 3 MB.</li>
                    <li>File format: PDF (.pdf) (no encryption or password protection).</li>
                </ul>

                <h4>4. Plagiarism Policy</h4>
                <ul>
                    <li>Plagiarism above 30% is strictly prohibited. Papers exceeding this threshold will be rejected without a refund, even after registration.</li>
                </ul>
            </div>

            {/* Submission Checklist */}
            <div className="instruction-section">
                <h4>✅ Submission Checklist</h4>
                <ul>
                    <li>Title accurately reflects the paper’s content.</li>
                    <li>Author names & affiliations are correctly listed (No designations like Asst. Professor, Research Scholar, etc.).</li>
                    <li>No prefixes (Dr., Mr., Ms., etc.) before author names.</li>
                    <li>Clear and grammatically correct language.</li>
                    <li>At least five (5) keywords are provided.</li>
                    <li>Citations follow IEEE format throughout the paper.</li>
                    <li>Figures and graphs meet IEEE resolution standards (300dpi or above).</li>
                    <li>Equations are written using equation editor software.</li>
                    <li>References are in IEEE format (strictly followed).</li>
                    <li>No first-person pronouns (I, we, us, etc.) used.</li>
                </ul>
            </div>

            {/* Step 2 */}
            <div className="instruction-section">
                <h3>Step 2: IEEE Copyright Notice</h3>
                <p>Include the following IEEE copyright notice at the bottom of the first page of your paper:</p>
                <p className="copyright-notice">979-8-3315-0537-0/25/$31.00 ©2025 IEEE</p>
                <p>Ensure that the correct copyright notice is inserted before submission.</p>
            </div>

            {/* Step 3 */}
            <div className="instruction-section">
                <h3>Step 3: PDF eXpress Verification</h3>
                <p>Before submitting the final paper, it must be verified through <a href="https://ieee-pdf-express.org/">IEEE PDF eXpress</a>.</p>
                <p><strong>Conference ID:</strong> 64710X</p>

                <h4>Instructions for First-Time Users:</h4>
                <ol>
                    <li>Click “New Users – Click here”.</li>
                    <li>Enter:
                        <ul>
                            <li>Conference ID: 64710X</li>
                            <li>Your email address</li>
                            <li>Create a password</li>
                        </ul>
                    </li>
                    <li>Follow the instructions to complete the verification process.</li>
                </ol>

                <h4>For Returning Users:</h4>
                <ul>
                    <li>Log in with your existing credentials.</li>
                    <li>Ensure your contact details are up to date.</li>
                </ul>
            </div>

            {/* Step 4 */}
            <div className="instruction-section">
                <h3>Step 4: Camera-Ready Paper Submission</h3>
                <p>Once the paper passes PDF eXpress verification, submit the final version via Microsoft CMT Author Console.</p>
                <p><strong>File Naming Convention:</strong> PaperID_ictest25.pdf</p>
                <p><strong>Important:</strong></p>
                <ul>
                    <li>The title and author list must remain unchanged from the original submission.</li>
                    <li>No modifications to author order or names are allowed.</li>
                </ul>
            </div>

            {/* Step 5 */}
            <div className="instruction-section">
                <h3>Step 5: IEEE Copyright Form Submission</h3>
                <ol>
                    <li>Ensure all authors are registered in CMT with correct names and contact emails.</li>
                    <li>Click ‘Submit IEEE Copyright Form’ to access IEEE eCopyright page.</li>
                    <li>Complete the form, download it, and upload it back to CMT.</li>
                </ol>
            </div>

            {/* Registration */}
            <div className="instruction-section">
                <h3>ICTEST-2025 Registration</h3>
                <ul>
                    <li>Conference registration is mandatory for paper publication.</li>
                    <li>At least one author must register and complete full payment.</li>
                    <li><a href="https://ictest2025.org/registration">Register Here</a></li>
                </ul>
            </div>
        </div>
    );
}

export default GeneralInstructions;
