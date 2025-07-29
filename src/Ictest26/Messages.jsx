import React, { useState, useEffect } from 'react';
import './Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Remove reply state, only admin can send messages
  const [paperId, setPaperId] = useState(null);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'paper', 'author'

  // Fetch user info and papers on component mount
  useEffect(() => {
    const fetchUserAndPapers = async () => {
      try {
        const userDataString = localStorage.getItem("ictest26_user");
        const role = localStorage.getItem("ictest26_role");
        
        if (!userDataString || userDataString === 'undefined' || userDataString === 'null') {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        let userData;
        try {
          userData = JSON.parse(userDataString);
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          setError('Invalid user data. Please login again.');
          setLoading(false);
          return;
        }

        setUserRole(role);
        
        if (!userData.login_id) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        setUserId(userData.login_id);

        // Fetch papers for this user (if not admin)
        if (role !== 'admin') {
          // For authors, only show their own papers (no change)
          const { data: paperData, error: paperError } = await window.supabase
            .from("paper")
            .select("paper_id, paper_title")
            .eq("login_id", userData.login_id)
            .order("paper_id", { ascending: true });
          if (paperError) throw paperError;
          setPapers(paperData || []);
          if (paperData && paperData.length > 0) {
            setSelectedPaper(paperData[0]);
            setPaperId(paperData[0].paper_id);
          }
        } else {
          // For admin, only show papers that are final submitted
          const { data: paperData, error: paperError } = await window.supabase
            .from("paper")
            .select("paper_id, paper_title")
            .eq("status", "final_submitted")
            .order("paper_id", { ascending: true });
          if (paperError) throw paperError;
          setPapers(paperData || []);
          if (paperData && paperData.length > 0) {
            setSelectedPaper(paperData[0]);
            setPaperId(paperData[0].paper_id);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPapers();
  }, []);

  // Fetch messages when paperId changes
  useEffect(() => {
    if (paperId && userId) {
      fetchMessages();
    }
  }, [paperId, userId, filter]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    
    try {
      let query = window.supabase
        .from("messages")
        .select(`
          *,
          paper:paper_id(paper_title),
          author:author_id(author_name, email_id),
          admin:admin_id(email),
          attachments(*)
        `)
        .eq("paper_id", paperId)
        .order("created_at", { ascending: true }); // Changed to ascending for proper threading

      // Apply filters
      if (filter === 'unread') {
        query = query.eq("status", "unread");
      } else if (filter === 'acknowledged') {
        query = query.eq("status", "acknowledged");
      } else if (filter === 'completed') {
        query = query.eq("status", "completed");
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group messages by thread (original message and its replies)
      const messageThreads = groupMessagesByThread(data || []);
      setMessages(messageThreads);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Group messages into threads (same function as AdminMessages)
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

  // Remove markAsRead for authors, only admin can send messages

  // Remove handleReply, only admin can send messages

  // Only allow 'completed' action for author
  const handleAction = async (messageId, actionType, note = '') => {
    if (actionType !== 'completed') return;
    try {
      const updateData = { status: 'completed' };
      const { error } = await window.supabase
        .from("messages")
        .update(updateData)
        .eq("id", messageId);
      if (error) throw error;
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, ...updateData }
            : msg
        )
      );
      fetchMessages();
    } catch (err) {
      console.error('Error performing action:', err);
      setError('Failed to perform action');
    }
  };

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
      case 'acknowledged': return 'Acknowledged';
      case 'completed': return 'Completed';
      default: return 'Under Review';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="messages-container">
        <div className="messages-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h2>Messages</h2>
        
        {/* Paper selector for authors */}
        {userRole !== 'admin' && papers.length > 1 && (
          <div className="paper-selector">
            <label>Select Paper:</label>
            <select 
              value={selectedPaper?.paper_id || ''} 
              onChange={(e) => {
                const paper = papers.find(p => p.paper_id === parseInt(e.target.value));
                setSelectedPaper(paper);
                setPaperId(paper.paper_id);
              }}
            >
              {papers.map(paper => (
                <option key={paper.paper_id} value={paper.paper_id}>
                  {paper.paper_title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter options */}
        <div className="message-filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={filter === 'acknowledged' ? 'active' : ''}
            onClick={() => setFilter('acknowledged')}
          >
            Acknowledged
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {error && (
        <div className="messages-error">
          <i className="fa fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Messages list */}
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="fa fa-comment-o"></i>
            <p>No messages found</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message-item status-${message.status} ${message.status === 'unread' ? 'unread' : ''}`}>
              <div className="message-header">
                <div className="message-info">
                  <div className="message-sender">
                    <i className="fa fa-user-shield"></i>
                    From: {message.admin && message.admin.email ? `Admin (${message.admin.email})` : 'System'}
                  </div>
                  <div className="message-date">
                    <i className="fa fa-clock"></i>
                    {formatDateTime(message.created_at)}
                  </div>
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
              
              <div className="message-type-section">
                <span className={`type-badge ${message.type}`}>
                  <i className="fa fa-tag"></i>
                  {message.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="message-subject">
                <strong>{message.subject}</strong>
              </div>
              
              <div className="message-content">
                {message.content}
              </div>

              {/* Show attachments if any */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                  <strong>Attachments:</strong>
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-link">
                      <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                        <i className="fa fa-paperclip"></i> Attachment {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Message actions */}
              <div className="message-actions">
                {userRole !== 'admin' && message.status !== 'completed' && (
                  <button 
                    className="action-btn complete-btn"
                    onClick={() => handleAction(message.id, 'completed', 'Marked as complete by author')}
                  >
                    <i className="fa fa-check-circle"></i> Mark as Complete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* No reply modal for authors, only admin can send messages */}
    </div>
  );
};

export default Messages;
