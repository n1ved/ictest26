import React, { useState, useEffect } from 'react';
import './AdminMessages.css';

const AdminMessages = () => {
  const [papers, setPapers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [messageType, setMessageType] = useState('general');
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMessageList, setShowMessageList] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch admin ID on mount
  useEffect(() => {
    const fetchAdminId = async () => {
      const email = localStorage.getItem("ictest26_user");
      if (!email) return;
      
      try {
        const { data, error } = await window.supabase
          .from("login")
          .select("login_id")
          .eq("email", email)
          .single();
        
        if (error) throw error;
        setAdminId(data.login_id);
      } catch (err) {
        console.error('Error fetching admin ID:', err);
      }
    };
    
    fetchAdminId();
  }, []);

  // Fetch all papers
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const { data, error } = await window.supabase
          .from("paper")
          .select(`
            paper_id, 
            paper_title, 
            has_admin_comments,
            has_unread_messages,
            login_id,
            login:login_id (email)
          `)
          .order("paper_id", { ascending: true });
        
        if (error) throw error;
        setPapers(data || []);
      } catch (err) {
        console.error('Error fetching papers:', err);
        setError('Failed to load papers');
      }
    };
    
    fetchPapers();
  }, []);

  // Fetch authors for selected paper
  useEffect(() => {
    if (selectedPaper) {
      const fetchAuthors = async () => {
        try {
          const { data, error } = await window.supabase
            .from("author")
            .select("author_id, salutation, author_name, email_id, verification_status, has_admin_comments")
            .eq("paper_id", selectedPaper.paper_id)
            .order("author_id", { ascending: true });
          
          if (error) throw error;
          setAuthors(data || []);
        } catch (err) {
          console.error('Error fetching authors:', err);
          setError('Failed to load authors');
        }
      };
      
      fetchAuthors();
    }
  }, [selectedPaper]);

  // Fetch messages for selected paper
  const fetchMessages = async () => {
    if (!selectedPaper) return;
    
    try {
      const { data, error } = await window.supabase
        .from("message_details")
        .select("*")
        .eq("paper_id", selectedPaper.paper_id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
      setShowMessageList(true);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingFile(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `message_${Date.now()}.${fileExt}`;
      
      const { data, error } = await window.supabase.storage
        .from('message_attachments')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: publicUrlData } = window.supabase.storage
        .from('message_attachments')
        .getPublicUrl(fileName);
      
      const attachment = {
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_type: file.type,
        file_size: file.size
      };
      
      setAttachments(prev => [...prev, attachment]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!selectedPaper || !subject.trim() || !messageContent.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Determine receiver based on message type
      let receiverId;
      if (messageType === 'author_comment' && selectedAuthor) {
        // For author-specific messages, we need to find the author's login_id
        // This assumes authors have their own login accounts
        receiverId = selectedPaper.login_id; // For now, send to paper owner
      } else {
        receiverId = selectedPaper.login_id; // Send to paper owner
      }
      
      // Insert message
      const { data: messageData, error: messageError } = await window.supabase
        .from("messages")
        .insert([{
          paper_id: selectedPaper.paper_id,
          sender_id: adminId,
          receiver_id: receiverId,
          message_type: messageType,
          subject: subject,
          message_content: messageContent
        }])
        .select()
        .single();
      
      if (messageError) throw messageError;
      
      // Insert attachments if any
      if (attachments.length > 0) {
        const attachmentData = attachments.map(att => ({
          message_id: messageData.message_id,
          ...att
        }));
        
        const { error: attachmentError } = await window.supabase
          .from("message_attachments")
          .insert(attachmentData);
        
        if (attachmentError) throw attachmentError;
      }
      
      // Update paper status
      const updates = {
        has_admin_comments: true,
        has_unread_messages: true
      };
      
      await window.supabase
        .from("paper")
        .update(updates)
        .eq("paper_id", selectedPaper.paper_id);
      
      // Update author status if author-specific message
      if (messageType === 'author_comment' && selectedAuthor) {
        await window.supabase
          .from("author")
          .update({ has_admin_comments: true })
          .eq("author_id", selectedAuthor.author_id);
      }
      
      setSuccess('Message sent successfully!');
      setSubject('');
      setMessageContent('');
      setAttachments([]);
      setSelectedAuthor(null);
      
      // Refresh papers list
      const { data: updatedPapers } = await window.supabase
        .from("paper")
        .select(`
          paper_id, 
          paper_title, 
          has_admin_comments,
          has_unread_messages,
          login_id,
          login:login_id (email)
        `)
        .order("paper_id", { ascending: true });
      setPapers(updatedPapers || []);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Message type options
  const messageTypeOptions = [
    { value: 'general', label: 'General Message' },
    { value: 'paper_comment', label: 'Paper Comment' },
    { value: 'author_comment', label: 'Author Comment' },
    { value: 'system', label: 'System Notification' }
  ];

  return (
    <div className="admin-messages-container">
      <div className="admin-messages-header">
        <h2>Admin Messages</h2>
        <div className="header-actions">
          <button 
            className="view-messages-btn"
            onClick={fetchMessages}
            disabled={!selectedPaper}
          >
            <i className="fa fa-envelope-o"></i> View Messages
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-messages-error">
          <i className="fa fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-messages-success">
          <i className="fa fa-check-circle"></i>
          {success}
        </div>
      )}

      <div className="admin-messages-content">
        {/* Message Composition Form */}
        <div className="message-compose-section">
          <h3>Send Message</h3>
          
          <form onSubmit={handleSendMessage} className="message-form">
            {/* Paper Selection */}
            <div className="form-group">
              <label>Select Paper *</label>
              <select 
                value={selectedPaper?.paper_id || ''} 
                onChange={(e) => {
                  const paper = papers.find(p => p.paper_id === parseInt(e.target.value));
                  setSelectedPaper(paper);
                  setSelectedAuthor(null);
                }}
                required
              >
                <option value="">Choose a paper...</option>
                {papers.map(paper => (
                  <option key={paper.paper_id} value={paper.paper_id}>
                    [{paper.paper_id}] {paper.paper_title}
                    {paper.has_unread_messages && ' (Has Unread)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Type Selection */}
            <div className="form-group">
              <label>Message Type *</label>
              <select 
                value={messageType} 
                onChange={(e) => setMessageType(e.target.value)}
                required
              >
                {messageTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Selection (only for author-specific messages) */}
            {messageType === 'author_comment' && selectedPaper && (
              <div className="form-group">
                <label>Select Author (optional)</label>
                <select 
                  value={selectedAuthor?.author_id || ''} 
                  onChange={(e) => {
                    const author = authors.find(a => a.author_id === parseInt(e.target.value));
                    setSelectedAuthor(author);
                  }}
                >
                  <option value="">All authors</option>
                  {authors.map(author => (
                    <option key={author.author_id} value={author.author_id}>
                      {author.salutation} {author.author_name}
                      {author.has_admin_comments && ' (Has Comments)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject */}
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                required
              />
            </div>

            {/* Message Content */}
            <div className="form-group">
              <label>Message Content *</label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your message..."
                required
                rows="6"
              />
            </div>

            {/* File Attachments */}
            <div className="form-group">
              <label>Attachments (optional)</label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                disabled={uploadingFile}
              />
              {uploadingFile && <span>Uploading...</span>}
              
              {attachments.length > 0 && (
                <div className="attachments-list">
                  {attachments.map((att, index) => (
                    <div key={index} className="attachment-item">
                      <i className="fa fa-paperclip"></i>
                      <span>{att.file_name}</span>
                      <button 
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="send-message-btn">
              {loading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> Sending...
                </>
              ) : (
                <>
                  <i className="fa fa-send"></i> Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Messages List */}
        {showMessageList && (
          <div className="messages-list-section">
            <h3>Messages for: {selectedPaper?.paper_title}</h3>
            
            {messages.length === 0 ? (
              <div className="no-messages">
                <i className="fa fa-comment-o"></i>
                <p>No messages found for this paper</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map(message => (
                  <div key={message.message_id} className="message-item">
                    <div className="message-header">
                      <div className="message-info">
                        <span className="sender">
                          {message.sender_role === 'admin' ? 'Admin' : message.sender_email}
                        </span>
                        <span className="date">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                        <span className={`status ${message.is_read ? 'read' : 'unread'}`}>
                          {message.is_read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <span className={`type-badge ${message.message_type}`}>
                        {message.message_type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="message-subject">
                      <strong>{message.subject}</strong>
                    </div>
                    
                    <div className="message-content">
                      {message.message_content}
                    </div>
                    
                    {message.actions_taken && (
                      <div className="message-actions">
                        <small>Actions: {message.actions_taken}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
