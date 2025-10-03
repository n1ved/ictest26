import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import CertificateTemplate from './components/CertificateTemplate';
import {
  generateCertificateImage,
  uploadCertificateToSupabase,
  createCertificateRecord,
  getAllCertificates
} from './utils/certificateUtils';
import './AdminCertificates.css';

const AdminCertificates = () => {
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [certificateType, setCertificateType] = useState('participation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, current: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUser, setPreviewUser] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  const certificateRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    fetchPapers();
    fetchAuthors();
    fetchCertificates();
  }, []);

  // Refetch users when certificate type changes
  useEffect(() => {
    fetchUsers(certificateType);
  }, [certificateType]);

  // Define role mapping for certificate types
  const getCertificateRoles = (certType) => {
    const roleMapping = {
      'participation': ['author', 'participant', 'attendee', 'user'], // All participants (common role names)
      'author': [], // Handle separately with paper check
      'reviewer': ['reviewer'], // Only reviewers
      'session_chair': ['session_chair', 'chair'] // Session chairs
    };
    return roleMapping[certType] || [];
  };

  const fetchUsers = async (certType = certificateType) => {
    try {
      // Special handling for author certificates - only users with papers
      if (certType === 'author') {
        // Get users who have submitted papers
        const { data: paperUsers, error: paperError } = await supabase
          .from('paper')
          .select('login_id')
          .not('login_id', 'is', null);
        
        if (paperError) {
          console.error('Error fetching paper users:', paperError);
          throw paperError;
        }
        
        const userIds = [...new Set(paperUsers.map(p => p.login_id))]; // Remove duplicates
        
        if (userIds.length > 0) {
          const { data, error } = await supabase
            .from('login')
            .select('*')
            .in('login_id', userIds)
            .order('email');
          
          if (error) throw error;
          setUsers(data);
        } else {
          // No users with papers found
          setUsers([]);
        }
      } else {
        // Filter by roles based on certificate type
        const allowedRoles = getCertificateRoles(certType);
        let query = supabase.from('login').select('*').order('email');
        
        if (allowedRoles.length > 0) {
          // Check if role column exists, if not fall back to showing all users for participation
          if (certType === 'participation') {
            // For participation, show all users regardless of role
            const { data, error } = await query;
            if (error) throw error;
            setUsers(data);
          } else {
            // For reviewer and session_chair, filter by role
            const { data, error } = await query.in('role', allowedRoles);
            if (error) {
              console.error('Role filtering error:', error);
              // If role column doesn't exist, show empty list for reviewers/chairs
              if (certType === 'reviewer' || certType === 'session_chair') {
                setUsers([]);
              } else {
                throw error;
              }
            } else {
              setUsers(data || []);
            }
          }
        } else {
          // No role mapping defined, show empty list
          setUsers([]);
        }
      }
      
      // Clear selected users when filtering changes
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error details:', err.message);
      setError('Failed to fetch users: ' + err.message);
    }
  };

  const fetchPapers = async () => {
    try {
      const { data, error } = await supabase
        .from('paper')
        .select(`
          *,
          login:login_id(email)
        `)
        .order('paper_title');
      
      if (error) throw error;
      setPapers(data);
    } catch (err) {
      console.error('Error fetching papers:', err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from('author')
        .select(`
          *,
          paper:paper_id(paper_title)
        `)
        .order('author_name');
      
      if (error) throw error;
      setAuthors(data);
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const data = await getAllCertificates(supabase);
      setCertificates(data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  };

  const handleUserSelection = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.login_id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const getUserPaper = (userId) => {
    const paper = papers.find(p => p.login_id === userId);
    return paper ? paper.paper_title : '';
  };

  const getUserName = (userId) => {
    // Try to get name from authors table first
    const author = authors.find(a => {
      const paper = papers.find(p => p.paper_id === a.paper_id && p.login_id === userId);
      return paper;
    });
    
    if (author) {
      return author.author_name;
    }
    
    // Fallback to email from login table
    const user = users.find(u => u.login_id === userId);
    return user ? user.email.split('@')[0] : 'Unknown User';
  };

  const generateCertificatesForUsers = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setProgress({ completed: 0, total: selectedUsers.length, current: '' });

    try {
      let successCount = 0;
      
      // Generate certificates one by one
      for (let i = 0; i < selectedUsers.length; i++) {
        const userId = selectedUsers[i];
        const userName = getUserName(userId);
        const paperTitle = certificateType === 'author' ? getUserPaper(userId) : '';
        
        setProgress({
          completed: i,
          total: selectedUsers.length,
          current: `Processing: ${userName}`
        });

        const result = await generateSingleCertificate(userId, certificateType, userName, paperTitle);
        
        if (result.success) {
          successCount++;
        }
        
        // Update progress
        setProgress({
          completed: i + 1,
          total: selectedUsers.length,
          current: result.success ? `Completed: ${userName}` : `Failed: ${userName}`
        });
      }

      setSuccess(`Successfully generated ${successCount} certificates out of ${selectedUsers.length} selected users`);
      fetchCertificates(); // Refresh the certificates list
      
    } catch (err) {
      console.error('Error generating certificates:', err);
      setError('Failed to generate certificates: ' + err.message);
    } finally {
      setIsGenerating(false);
      setProgress({ completed: 0, total: 0, current: '' });
    }
  };

  const generateSingleCertificate = async (userId, type, recipientName, paperTitle = '') => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Certificate generation timeout after 60 seconds')), 60000); // Increased from 30 to 60 seconds
    });

    const generationPromise = async () => {
    try {
      // Create a temporary container with the certificate component
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.height = '297mm';
      document.body.appendChild(tempContainer);

      // Create the certificate element using React component
      const certificateElement = React.createElement(CertificateTemplate, {
        type: type,
        recipientName: recipientName,
        paperTitle: paperTitle,
        isPreview: false
      });

      // Render it to the temp container
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      root.render(certificateElement);

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate certificate image only (PNG matching template size)
      const imageBlob = await generateCertificateImage(tempContainer, `certificate_${type}_${recipientName.replace(/\s+/g, '_')}`);

      // Upload to storage
      const uploadResult = await uploadCertificateToSupabase(
        supabase,
        userId,
        type,
        imageBlob
      );

      // Save record to database
      await createCertificateRecord(supabase, {
        user_id: userId,
        certificate_type: type,
        recipient_name: recipientName,
        paper_title: paperTitle || null,
        pdf_url: null, // No PDF generated
        image_url: uploadResult.imageUrl,
        pdf_path: null, // No PDF generated
        image_path: uploadResult.imagePath,
        generated_by: JSON.parse(localStorage.getItem('ictest26_user'))?.login_id,
        created_at: new Date().toISOString()
      });

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);

      return { success: true, userId, type, recipientName };
    } catch (error) {
      console.error(`Error generating certificate for ${recipientName}:`, error);
      return { success: false, userId, type, recipientName, error: error.message };
    }
    };

    try {
      return await Promise.race([generationPromise(), timeoutPromise]);
    } catch (error) {
      console.error(`Certificate generation failed for ${recipientName}:`, error);
      return { success: false, userId, type, recipientName, error: error.message };
    }
  };

  const handlePreview = (userId) => {
    const user = users.find(u => u.login_id === userId);
    if (user) {
      setPreviewUser({
        id: userId,
        name: getUserName(userId),
        paperTitle: certificateType === 'author' ? getUserPaper(userId) : ''
      });
    }
  };

  const deleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;

      setSuccess('Certificate deleted successfully');
      fetchCertificates();
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setError('Failed to delete certificate');
    }
  };

  return (
    <div className="admin-certificates">
      <div className="certificates-header">
        <h2>Certificate Management</h2>
        <div className="tab-navigation">
          <button 
            className={activeTab === 'generate' ? 'active' : ''}
            onClick={() => setActiveTab('generate')}
          >
            Generate Certificates
          </button>
          <button 
            className={activeTab === 'manage' ? 'active' : ''}
            onClick={() => setActiveTab('manage')}
          >
            Manage Certificates
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === 'generate' && (
        <div className="generate-tab">
          <div className="certificate-controls">
            <div className="certificate-type-selector">
              <label>Certificate Type:</label>
              <select 
                value={certificateType} 
                onChange={(e) => setCertificateType(e.target.value)}
                disabled={isGenerating}
              >
                <option value="participation">Participation</option>
                <option value="author">Author Appreciation</option>
                <option value="reviewer">Reviewer Appreciation</option>
                <option value="session_chair">Session Chair Appreciation</option>
              </select>
            </div>

            <div className="user-selection-controls">
              <button onClick={selectAllUsers} disabled={isGenerating}>
                Select All Users
              </button>
              <button onClick={clearSelection} disabled={isGenerating}>
                Clear Selection
              </button>
              <span className="selection-count">
                {selectedUsers.length} of {users.length} users selected
              </span>
              {certificateType === 'author' && (
                <span className="filter-info">
                  (Showing only users with submitted papers)
                </span>
              )}
              {certificateType === 'reviewer' && (
                <span className="filter-info">
                  {users.length === 0 ? '(No reviewers assigned yet)' : '(Showing only users with reviewer role)'}
                </span>
              )}
              {certificateType === 'session_chair' && (
                <span className="filter-info">
                  {users.length === 0 ? '(No session chairs assigned yet)' : '(Showing only users with session chair role)'}
                </span>
              )}
              {certificateType === 'participation' && (
                <span className="filter-info">
                  (Showing all registered users)
                </span>
              )}
            </div>

            <button 
              className="generate-button"
              onClick={generateCertificatesForUsers}
              disabled={isGenerating || selectedUsers.length === 0}
            >
              {isGenerating ? 'Generating...' : 'Generate Certificates'}
            </button>
          </div>

          {isGenerating && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {progress.completed} of {progress.total} completed
                {progress.current && <span> - Processing: {progress.current}</span>}
              </div>
            </div>
          )}

          <div className="users-list">
            <div className="users-header">
              <h3>Select Users for Certificate Generation</h3>
            </div>
            <div className="users-grid">
              {users.length === 0 ? (
                <div className="no-users-message">
                  <div className="no-users-icon">👥</div>
                  <h4>No users available for {certificateType.replace('_', ' ')} certificates</h4>
                  {certificateType === 'author' && (
                    <p>No users have submitted papers yet.</p>
                  )}
                  {certificateType === 'reviewer' && (
                    <p>No users have been assigned the reviewer role yet.</p>
                  )}
                  {certificateType === 'session_chair' && (
                    <p>No users have been assigned the session chair role yet.</p>
                  )}
                  {certificateType === 'participation' && (
                    <p>No users are registered in the system yet.</p>
                  )}
                </div>
              ) : (
                users.map(user => (
                <div key={user.login_id} className="user-card">
                  <div className="user-checkbox">
                    <input
                      type="checkbox"
                      id={`user-${user.login_id}`}
                      checked={selectedUsers.includes(user.login_id)}
                      onChange={(e) => handleUserSelection(user.login_id, e.target.checked)}
                      disabled={isGenerating}
                    />
                    <label htmlFor={`user-${user.login_id}`}>
                      <div className="user-info">
                        <div className="user-name">{getUserName(user.login_id)}</div>
                        <div className="user-email">{user.email}</div>
                        {certificateType === 'author' && (
                          <div className="user-paper">{getUserPaper(user.login_id) || 'No paper found'}</div>
                        )}
                      </div>
                    </label>
                  </div>
                  <button 
                    className="preview-button"
                    onClick={() => handlePreview(user.login_id)}
                    disabled={isGenerating}
                  >
                    Preview
                  </button>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="manage-tab">
          <div className="certificates-list">
            <h3>Generated Certificates</h3>
            <div className="certificates-grid">
              {certificates.map(cert => (
                <div key={cert.id} className="certificate-card">
                  <div className="certificate-info">
                    <div className="certificate-recipient">{cert.recipient_name}</div>
                    <div className="certificate-type">{cert.certificate_type}</div>
                    <div className="certificate-date">
                      Generated: {new Date(cert.created_at).toLocaleDateString()}
                    </div>
                    {cert.paper_title && (
                      <div className="certificate-paper">Paper: {cert.paper_title}</div>
                    )}
                  </div>
                  <div className="certificate-actions">
                    <a 
                      href={cert.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      View Image
                    </a>
                    <button 
                      className="delete-button"
                      onClick={() => deleteCertificate(cert.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUser && (
        <div className="preview-modal" onClick={() => setPreviewUser(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>Certificate Preview - {previewUser.name}</h3>
              <button className="close-button" onClick={() => setPreviewUser(null)}>×</button>
            </div>
            <div className="preview-certificate" ref={certificateRef}>
              <CertificateTemplate
                type={certificateType}
                recipientName={previewUser.name}
                paperTitle={previewUser.paperTitle}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;