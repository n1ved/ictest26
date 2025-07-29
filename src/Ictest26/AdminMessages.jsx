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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch messages for selected paper
  const fetchMessages = async (paperObj) => {
    const paper = paperObj || selectedPaper;
    if (!paper) {
      setMessages([]);
      return;
    }
    try {
      const { data, error } = await window.supabase
        .from("messages")
        .select(`
          *,
          paper:paper_id(paper_title),
          author:author_id(author_name, email_id),
          admin:admin_id(email),
          attachments(*)
        `)
        .eq("paper_id", paper.paper_id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Group messages by thread (original message and its replies)
      const messageThreads = groupMessagesByThread(data || []);
      setMessages(messageThreads);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    }
  };

  // Fetch admin ID on mount
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const userDataString = localStorage.getItem("ictest26_user");
        if (!userDataString || userDataString === 'undefined' || userDataString === 'null') {
          console.error('No user data found in localStorage');
          return;
        }
        let userData;
        try {
          userData = JSON.parse(userDataString);
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          return;
        }
        if (!userData.login_id) return;
        setAdminId(userData.login_id);
      } catch (err) {
        console.error('Error in fetchAdminId:', err);
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

  // Fetch authors and messages for selected paper
  useEffect(() => {
    if (selectedPaper) {
      const fetchAuthors = async () => {
        try {
          const { data, error } = await window.supabase
            .from("author")
            .select("author_id, salutation, author_name, email_id")
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
      fetchMessages(selectedPaper);
    } else {
      setAuthors([]);
      setMessages([]);
    }
  }, [selectedPaper]);

  // ...existing code...

  // Group messages into threads
  const groupMessagesByThread = (messages) => {
    const threads = [];
    const processedMessageIds = new Set();
    
    messages.forEach(message => {
      if (processedMessageIds.has(message.id)) return;
      
      // If this is a root message (no parent_message_id) or we haven't seen its parent
      if (!message.parent_message_id || !messages.find(m => m.id === message.parent_message_id)) {
        const thread = {
          ...message,
          replies: []
        };
        
        // Find all replies to this message
        const findReplies = (parentId, depth = 1) => {
          return messages.filter(m => m.parent_message_id === parentId).map(reply => {
            processedMessageIds.add(reply.id);
            return {
              ...reply,
              depth,
              replies: findReplies(reply.id, depth + 1)
            };
          });
        };
        
        thread.replies = findReplies(message.id);
        processedMessageIds.add(message.id);
        threads.push(thread);
      }
    });
    
    return threads.reverse(); // Show newest threads first
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
        .from('attachments')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: publicUrlData } = window.supabase.storage
        .from('attachments')
        .getPublicUrl(fileName);
      
      const attachment = {
        file_name: file.name,
        file_url: publicUrlData.publicUrl
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
    
    e.preventDefault();
    if (!selectedPaper || !subject.trim() || !messageContent.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Insert message
      const { data: messageData, error: messageError } = await window.supabase
        .from("messages")
        .insert([{
          paper_id: selectedPaper.paper_id,
          author_id: selectedAuthor ? selectedAuthor.author_id : null,
          admin_id: adminId,
          type: messageType,
          subject: subject,
          content: messageContent,
          status: 'unread'
        }])
        .select()
        .single();
      if (messageError) throw messageError;
      // Insert attachments if any
      if (attachments.length > 0) {
        const attachmentData = attachments.map(att => ({
          message_id: messageData.id,
          file_url: att.file_url
        }));
        const { error: attachmentError } = await window.supabase
          .from("attachments")
          .insert(attachmentData);
        if (attachmentError) throw attachmentError;
      }
      setSuccess('Message sent successfully!');
      // Clear form fields after send
      setSubject('');
      setMessageContent('');
      setAttachments([]);
      setSelectedAuthor(null);
      setMessageType('general');
      // Optionally reset selectedPaper if you want
      // setSelectedPaper(null);
      // Always refresh messages after sending
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim() || !replyingTo) {
      setError('Please enter a reply message');
      return;
    }
    
    setSendingReply(true);
    setError('');
    
    try {
      // Insert reply message
      const { data: replyData, error: replyError } = await window.supabase
        .from("messages")
        .insert([{
          paper_id: selectedPaper.paper_id,
          author_id: replyingTo.author_id,
          admin_id: adminId,
          type: replyingTo.type,
          subject: `Re: ${replyingTo.subject}`,
          content: replyContent,
          status: 'unread',
          parent_message_id: replyingTo.id
        }])
        .select()
        .single();
      
      if (replyError) throw replyError;
      
      // Insert reply attachments if any
      if (replyAttachments.length > 0) {
        const attachmentData = replyAttachments.map(att => ({
          message_id: replyData.id,
          file_url: att.file_url
        }));
        
        const { error: attachmentError } = await window.supabase
          .from("attachments")
          .insert(attachmentData);
        
        if (attachmentError) throw attachmentError;
      }
      
      setSuccess('Reply sent successfully!');
      setReplyContent('');
      setReplyAttachments([]);
      setReplyingTo(null);
      
      // Refresh messages
      fetchMessages();
      
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Message type options
  const messageTypeOptions = [
    { value: 'general', label: 'General Message' },
    { value: 'paper_comment', label: 'Paper Comment' },
    { value: 'author_comment', label: 'Author Comment' },
    { value: 'system', label: 'System Notification' }
  ];

  // Status helper functions
  const getMessageStatusColor = (message) => {
    switch (message.status) {
      case 'unread': return '#ff6b6b';
      case 'read': return '#51cf66';
      case 'acknowledged': return '#339af0';
      case 'completed': return '#40c057';
      default: return '#51cf66';
    }
  };

  const getMessageStatusText = (message) => {
    switch (message.status) {
      case 'unread': return 'Awaiting Review';
      case 'read': return 'Under Review';
      case 'acknowledged': return 'Acknowledged by Author';
      case 'completed': return 'Completed by Author';
      default: return 'Under Review';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread': return 'fa-envelope';
      case 'read': return 'fa-envelope-open';
      case 'acknowledged': return 'fa-check';
      case 'completed': return 'fa-check-circle';
      default: return 'fa-envelope-open';
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'unread': return 25;
      case 'read': return 50;
      case 'acknowledged': return 75;
      case 'completed': return 100;
      default: return 50;
    }
  };

  const getStatusSteps = () => {
    return [
      { key: 'unread', label: 'Sent', icon: 'fa-paper-plane' },
      { key: 'read', label: 'Read', icon: 'fa-envelope-open' },
      { key: 'acknowledged', label: 'Acknowledged', icon: 'fa-check' },
      { key: 'completed', label: 'Completed', icon: 'fa-check-circle' }
    ];
  };

  // Render individual message
  const renderMessage = (message, isReply = false, depth = 0) => {
    return (
      <div key={message.id} className={`message-item status-${message.status} ${isReply ? 'reply-message' : 'main-message'}`} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="message-header">
          <div className="message-info">
            <div className="sender-info">
              <i className={`fa ${message.admin_id ? 'fa-user-shield' : 'fa-user'}`}></i>
              <span className="sender">
                {message.admin_id 
                  ? (message.admin && message.admin.email ? `Admin (${message.admin.email})` : 'System')
                  : (message.author ? `${message.author.author_name} (${message.author.email_id})` : 'Author')
                }
              </span>
              {isReply && <span className="reply-indicator">↳ Reply</span>}
            </div>
            <div className="message-timing">
              <i className="fa fa-clock"></i>
              <span className="date">
                {new Date(message.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="message-meta">
            <span className={`type-badge ${message.type}`}>
              <i className="fa fa-tag"></i>
              {message.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="message-status-info">
            <span className={`status-badge status-${message.status}`}
                  style={{
                    background: message.status === 'completed' ? '#40c057' : '#868e96',
                    color: '#fff',
                    padding: '0.3em 1em',
                    borderRadius: '20px',
                    fontWeight: 600
                  }}>
              {message.status === 'completed' ? 'Completed' : 'Not Completed'}
            </span>
          </div>
        </div>
        <div className="message-subject">
          <strong>{message.subject}</strong>
        </div>
        <div className="message-content">
          {message.content}
        </div>
        {message.author && (
          <div className="message-author-info">
            <i className="fa fa-user"></i> 
            <span>To: <strong>{message.author.author_name}</strong> ({message.author.email_id})</span>
          </div>
        )}
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            <div className="attachments-header">
              <i className="fa fa-paperclip"></i>
              <strong>Attachments ({message.attachments.length})</strong>
            </div>
            <div className="attachments-list">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="attachment-link">
                  <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-download"></i> 
                    Attachment {index + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Reply button for admin */}
        {!message.admin_id && (
          <div className="message-actions">
            <button 
              className="reply-btn"
              onClick={() => setReplyingTo(message)}
            >
              <i className="fa fa-reply"></i> Reply
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render message thread
  const renderMessageThread = (thread) => {
    const renderReplies = (replies, depth = 1) => {
      return replies.map(reply => (
        <div key={reply.id}>
          {renderMessage(reply, true, depth)}
          {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, depth + 1)}
        </div>
      ));
    };

    return (
      <div key={thread.id} className="message-thread">
        {renderMessage(thread, false, 0)}
        {thread.replies && thread.replies.length > 0 && (
          <div className="thread-replies">
            {renderReplies(thread.replies)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-messages-container">
      <div className="admin-messages-header">
        <h2>Admin Messages</h2>
      </div>

      {/* Common Paper Selection Dropdown */}
      <div className="form-group" style={{ maxWidth: 400, margin: '0 auto 2rem auto' }}>
        <label>Select Paper *</label>
        <select
          value={selectedPaper?.paper_id || ''}
          onChange={e => {
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
            </option>
          ))}
        </select>
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
            {/* Paper selection removed from here, now at top */}

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
        {selectedPaper && (
          <div className="messages-list-section">
            <h3>Message Threads for: {selectedPaper?.paper_title}</h3>
            {messages.length === 0 ? (
              <div className="no-messages">
                <i className="fa fa-comment-o"></i>
                <p>No messages found for this paper</p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map(thread => renderMessageThread(thread))}
              </div>
            )}
            {/* Reply Modal */}
            {replyingTo && (
              <div className="reply-modal">
                <div className="reply-form">
                  <div className="reply-header">
                    <h3>Reply to: {replyingTo.subject}</h3>
                    <button 
                      className="close-reply-btn"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                        setReplyAttachments([]);
                      }}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                  <div className="original-message">
                    <h4>Original Message:</h4>
                    <div className="original-content">
                      <strong>From:</strong> {replyingTo.author ? `${replyingTo.author.author_name} (${replyingTo.author.email_id})` : 'Author'}<br/>
                      <strong>Subject:</strong> {replyingTo.subject}<br/>
                      <strong>Content:</strong> {replyingTo.content}
                    </div>
                  </div>
                  <form onSubmit={handleSendReply}>
                    <div className="form-group">
                      <label>Reply Content *</label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply..."
                        required
                        rows="4"
                      />
                    </div>
                    <div className="form-group">
                      <label>Attachments (optional)</label>
                      <input
                        type="file"
                        onChange={handleReplyFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        disabled={uploadingFile}
                      />
                      {uploadingFile && <span>Uploading...</span>}
                      {replyAttachments.length > 0 && (
                        <div className="attachments-list">
                          {replyAttachments.map((att, index) => (
                            <div key={index} className="attachment-item">
                              <i className="fa fa-paperclip"></i>
                              <span>{att.file_name}</span>
                              <button 
                                type="button"
                                onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== index))}
                              >
                                <i className="fa fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="reply-actions">
                      <button type="submit" disabled={sendingReply} className="send-reply-btn">
                        {sendingReply ? (
                          <>
                            <i className="fa fa-spinner fa-spin"></i> Sending...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-send"></i> Send Reply
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-reply-btn"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                          setReplyAttachments([]);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
