import React, { useState, useEffect } from 'react';
import './AdminSettings.css';
import { supabase } from './supabaseClient';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    allowAuthorLogin: true,
    maintenanceMode: false,
    registrationOpen: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    target: '',
    confirmText: '',
    confirmPhrase: 'DELETE ALL DATA'
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Always fetch the row with id=1
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (error) {
          console.error('Error fetching settings:', error);
          
          // Check if the table doesn't exist
          if (error.code === '42P01') {
            setError('Admin settings table not found. Please run the database setup first. Using default values for now.');
            setSettings({
              allowAuthorLogin: true,
              maintenanceMode: false,
              registrationOpen: true,
            });
            setLoading(false);
            return;
          }

          // If no row exists, insert default row with id=1
          if (error.code === 'PGRST116' || error.message?.includes('Results contain 0 rows')) {
            try {
              const { error: insertError } = await supabase
                .from('admin_settings')
                .insert([{
                  id: 1,
                  allow_author_login: true,
                  maintenance_mode: false,
                  registration_open: true
                }]);
              if (insertError) throw insertError;
              setSettings({
                allowAuthorLogin: true,
                maintenanceMode: false,
                registrationOpen: true,
              });
              setSuccess('Default settings created successfully.');
              setTimeout(() => setSuccess(''), 3000);
            } catch (insertErr) {
              setError('Failed to create default settings: ' + insertErr.message);
            }
            setLoading(false);
            return;
          }

          setError('Failed to load settings.');
        } else if (data) {
          setSettings({
            allowAuthorLogin: data.allow_author_login ?? true,
            maintenanceMode: data.maintenance_mode ?? false,
            registrationOpen: data.registration_open ?? true,
          });
        }
      } catch (err) {
        console.error('Error in settings fetch/creation:', err);
        setError('Failed to initialize settings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Update a setting
  const updateSetting = async (key, value) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Map the React state key to database column name
      const dbKeyMap = {
        allowAuthorLogin: 'allow_author_login',
        maintenanceMode: 'maintenance_mode',
        registrationOpen: 'registration_open'
      };
      
      const { error } = await supabase
        .from('admin_settings')
        .update({ [dbKeyMap[key]]: value })
        .eq('id', 1);  // Assuming there's only one settings record with id=1
      
      if (error) throw error;
      
      // Update local state
      setSettings({
        ...settings,
        [key]: value
      });
      
      setSuccess(`${key.replace(/([A-Z])/g, ' $1').trim()} updated successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update setting: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Show delete confirmation
  const showDeleteConfirmation = (target, targetName) => {
    let confirmPhrase = 'DELETE ALL DATA';
    
    // Custom confirm phrase for specific targets
    switch(target) {
      case 'papers':
        confirmPhrase = 'DELETE ALL PAPERS';
        break;
      case 'authors':
        confirmPhrase = 'DELETE ALL AUTHORS';
        break;
      case 'messages':
        confirmPhrase = 'DELETE ALL MESSAGES';
        break;
      default:
        confirmPhrase = 'DELETE ALL DATA';
    }
    
    setConfirmDelete({
      show: true,
      target,
      confirmText: '',
      confirmPhrase,
      targetName
    });
  };
  
  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setConfirmDelete({
      show: false,
      target: '',
      confirmText: '',
      confirmPhrase: ''
    });
    setError('');
  };
  
  // Handle confirmation text change
  const handleConfirmTextChange = (e) => {
    setConfirmDelete({
      ...confirmDelete,
      confirmText: e.target.value
    });
  };
  
  // Handle database deletion operations
  const handleDelete = async () => {
    if (confirmDelete.confirmText !== confirmDelete.confirmPhrase) {
      setError(`Please type "${confirmDelete.confirmPhrase}" to confirm.`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let error;
      
      switch (confirmDelete.target) {
        case 'all':
          // For safety, we won't actually drop tables but truncate specific tables
          const tablesToClear = ['paper', 'author', 'message', 'message_action', 'attachment'];
          
          // Sequential truncation of tables
          for (const table of tablesToClear) {
            const { error: truncateError } = await supabase.rpc('truncate_table', { table_name: table });
            if (truncateError) throw new Error(`Failed to clear ${table}: ${truncateError.message}`);
          }
          
          setSuccess('All data has been deleted successfully!');
          break;
          
        case 'papers':
          ({ error } = await supabase.rpc('truncate_table', { table_name: 'paper' }));
          if (error) throw error;
          setSuccess('All papers have been deleted successfully!');
          break;
          
        case 'authors':
          ({ error } = await supabase.rpc('truncate_table', { table_name: 'author' }));
          if (error) throw error;
          setSuccess('All authors have been deleted successfully!');
          break;
          
        case 'messages':
          ({ error } = await supabase.rpc('truncate_table', { table_name: 'message' }));
          if (error) throw error;
          ({ error } = await supabase.rpc('truncate_table', { table_name: 'message_action' }));
          if (error) throw error;
          ({ error } = await supabase.rpc('truncate_table', { table_name: 'attachment' }));
          if (error) throw error;
          setSuccess('All messages have been deleted successfully!');
          break;
          
        default:
          setError('Invalid deletion target.');
          break;
      }
      
      // Reset confirmation state
      closeDeleteConfirmation();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Delete operation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-settings-container">
      <h2 className="admin-settings-title">Admin Settings</h2>
      
      {loading && (
        <div className="status-message status-loading">
          <span className="spinner">⟳</span> Loading settings...
        </div>
      )}
      
      {error && (
        <div className="status-message status-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="status-message status-success">
          {success}
        </div>
      )}
      
      <div className="settings-section">
        <h3 className="settings-section-title">Website Configuration</h3>
        
        <div className="settings-toggle-group">
          <div className="settings-toggle-label">
            <span>Author Login</span>
            <p className="settings-toggle-description">
              Allow authors to log in to the website. Disabling this will hide the login button.
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.allowAuthorLogin}
              onChange={() => updateSetting('allowAuthorLogin', !settings.allowAuthorLogin)}
              disabled={loading}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="settings-toggle-group">
          <div className="settings-toggle-label">
            <span>Maintenance Mode</span>
            <p className="settings-toggle-description">
              Put the website in maintenance mode. This will show a maintenance message on all pages.
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
              disabled={loading}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="settings-toggle-group">
          <div className="settings-toggle-label">
            <span>Registration</span>
            <p className="settings-toggle-description">
              Allow new registrations for authors and paper submissions.
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.registrationOpen}
              onChange={() => updateSetting('registrationOpen', !settings.registrationOpen)}
              disabled={loading}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <div className="settings-section danger-zone">
        <h3 className="danger-zone-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Danger Zone
        </h3>
        
        <div className="danger-action-group">
          <div className="danger-action-label">
            <span>Delete All Data</span>
            <p className="danger-action-description">
              Delete all papers, authors, messages, and related data from the database.
            </p>
          </div>
          <button 
            className="danger-button"
            onClick={() => showDeleteConfirmation('all', 'All Data')}
            disabled={loading}
          >
            Delete All
          </button>
        </div>
        
        <div className="danger-action-group">
          <div className="danger-action-label">
            <span>Delete All Papers</span>
            <p className="danger-action-description">
              Delete all papers from the database. Author data will remain.
            </p>
          </div>
          <button 
            className="danger-button"
            onClick={() => showDeleteConfirmation('papers', 'Papers')}
            disabled={loading}
          >
            Delete Papers
          </button>
        </div>
        
        <div className="danger-action-group">
          <div className="danger-action-label">
            <span>Delete All Authors</span>
            <p className="danger-action-description">
              Delete all author data from the database. Papers will remain.
            </p>
          </div>
          <button 
            className="danger-button"
            onClick={() => showDeleteConfirmation('authors', 'Authors')}
            disabled={loading}
          >
            Delete Authors
          </button>
        </div>
        
        <div className="danger-action-group">
          <div className="danger-action-label">
            <span>Delete All Messages</span>
            <p className="danger-action-description">
              Delete all messages, actions, and attachments from the database.
            </p>
          </div>
          <button 
            className="danger-button"
            onClick={() => showDeleteConfirmation('messages', 'Messages')}
            disabled={loading}
          >
            Delete Messages
          </button>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {confirmDelete.show && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3 className="confirm-dialog-title">Delete {confirmDelete.targetName}?</h3>
            <p className="confirm-dialog-message">
              This action cannot be undone. All {confirmDelete.targetName.toLowerCase()} will be permanently deleted.
            </p>
            
            <div className="confirm-dialog-input">
              <input
                type="text"
                value={confirmDelete.confirmText}
                onChange={handleConfirmTextChange}
                placeholder={`Type "${confirmDelete.confirmPhrase}" to confirm`}
                autoFocus
              />
              <p>Please type <strong>{confirmDelete.confirmPhrase}</strong> to confirm.</p>
            </div>
            
            <div className="confirm-dialog-actions">
              <button 
                className="confirm-dialog-button confirm-dialog-cancel"
                onClick={closeDeleteConfirmation}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-delete"
                onClick={handleDelete}
                disabled={loading || confirmDelete.confirmText !== confirmDelete.confirmPhrase}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
