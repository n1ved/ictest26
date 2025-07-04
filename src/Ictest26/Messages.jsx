import React, { useState, useEffect } from 'react';
import './Messages.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [paperId, setPaperId] = useState(null);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'paper', 'author'

  // Fetch user info and papers on component mount
  useEffect(() => {
    const fetchUserAndPapers = async () => {
      const email = localStorage.getItem("ictest26_user");
      const role = localStorage.getItem("ictest26_role");
      setUserRole(role);
      
      if (!email) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        // Get user login_id
        const { data: loginData, error: loginError } = await window.supabase
          .from("login")
          .select("login_id")
          .eq("email", email)
          .single();
        
        if (loginError) throw loginError;
        setUserId(loginData.login_id);

        // Fetch papers for this user (if not admin)
        if (role !== 'admin') {
          const { data: paperData, error: paperError } = await window.supabase
            .from("paper")
            .select("paper_id, paper_title, has_admin_comments, has_unread_messages")
            .eq("login_id", loginData.login_id)
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
        .from("message_details")
        .select("*")
        .eq("paper_id", paperId)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filter === 'unread') {
        query = query.eq("is_read", false);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const { error } = await window.supabase
        .from("messages")
        .update({ is_read: true })
        .eq("message_id", messageId);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === messageId 
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    try {
      // Get receiver_id (opposite of sender)
      const receiverId = selectedMessage.sender_id === userId 
        ? selectedMessage.receiver_id 
        : selectedMessage.sender_id;

      const { error } = await window.supabase
        .from("messages")
        .insert([{
          paper_id: paperId,
          sender_id: userId,
          receiver_id: receiverId,
          message_type: selectedMessage.message_type,
          subject: `Re: ${selectedMessage.subject}`,
          message_content: replyText,
          parent_message_id: selectedMessage.message_id
        }]);

      if (error) throw error;

      setReplyText('');
      setShowReplyForm(false);
      setSelectedMessage(null);
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply');
    }
  };

  const handleAction = async (messageId, actionType, note = '') => {
    try {
      const { error } = await window.supabase
        .from("message_actions")
        .insert([{
          message_id: messageId,
          user_id: userId,
          action_type: actionType,
          action_note: note
        }]);

      if (error) throw error;

      fetchMessages(); // Refresh to show updated actions
    } catch (err) {
      console.error('Error performing action:', err);
      setError('Failed to perform action');
    }
  };

  const getMessageStatusColor = (message) => {
    if (!message.is_read) return '#ff6b6b';
    if (message.actions_taken && message.actions_taken.includes('completed')) return '#51cf66';
    if (message.actions_taken && message.actions_taken.includes('acknowledged')) return '#74c0fc';
    return '#868e96';
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
                  {paper.has_unread_messages && ' (New)'}
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
            <div key={message.message_id} className={`message-item ${!message.is_read ? 'unread' : ''}`}>
              <div className="message-header">
                <div className="message-info">
                  <span className="message-sender">
                    From: {message.sender_email} ({message.sender_role})
                  </span>
                  <span className="message-date">{formatDateTime(message.created_at)}</span>
                  <span 
                    className="message-status"
                    style={{ color: getMessageStatusColor(message) }}
                  >
                    {!message.is_read ? 'New' : 
                     message.actions_taken?.includes('completed') ? 'Completed' :
                     message.actions_taken?.includes('acknowledged') ? 'Acknowledged' : 'Read'}
                  </span>
                </div>
                <div className="message-type">
                  <span className={`type-badge ${message.message_type}`}>
                    {message.message_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="message-subject">
                <strong>{message.subject}</strong>
              </div>
              
              <div className="message-content">
                {message.message_content}
              </div>

              {/* Message actions */}
              <div className="message-actions">
                {!message.is_read && (
                  <button 
                    className="action-btn read-btn"
                    onClick={() => markAsRead(message.message_id)}
                  >
                    <i className="fa fa-eye"></i> Mark as Read
                  </button>
                )}
                
                <button 
                  className="action-btn reply-btn"
                  onClick={() => {
                    setSelectedMessage(message);
                    setShowReplyForm(true);
                  }}
                >
                  <i className="fa fa-reply"></i> Reply
                </button>

                {/* Action buttons for authors */}
                {userRole !== 'admin' && (
                  <>
                    <button 
                      className="action-btn acknowledge-btn"
                      onClick={() => handleAction(message.message_id, 'acknowledged', 'Message acknowledged')}
                    >
                      <i className="fa fa-check"></i> Acknowledge
                    </button>
                    
                    <button 
                      className="action-btn complete-btn"
                      onClick={() => handleAction(message.message_id, 'completed', 'Changes completed')}
                    >
                      <i className="fa fa-check-circle"></i> Mark Complete
                    </button>
                  </>
                )}
              </div>

              {/* Show actions taken */}
              {message.actions_taken && (
                <div className="actions-taken">
                  <small>Actions: {message.actions_taken}</small>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply form modal */}
      {showReplyForm && selectedMessage && (
        <div className="reply-modal">
          <div className="reply-form">
            <h3>Reply to: {selectedMessage.subject}</h3>
            <form onSubmit={handleReply}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                required
                rows="4"
              />
              <div className="reply-actions">
                <button type="submit" className="send-btn">
                  <i className="fa fa-send"></i> Send Reply
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowReplyForm(false);
                    setSelectedMessage(null);
                    setReplyText('');
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
  );
};

export default Messages;
