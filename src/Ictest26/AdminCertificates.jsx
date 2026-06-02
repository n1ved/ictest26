import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import CertificateTemplate from './components/CertificateTemplate';
import {
  generateCertificatePdfBlob,
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

  // Reviewer upload workflow
  const [useReviewerUploadList, setUseReviewerUploadList] = useState(false);
  const [reviewerUploadFileName, setReviewerUploadFileName] = useState('');
  const [uploadedReviewers, setUploadedReviewers] = useState([]); // { name, email, institution }
  const [selectedUploadedReviewerIdxs, setSelectedUploadedReviewerIdxs] = useState([]);
  const [editingUploadedReviewerIdx, setEditingUploadedReviewerIdx] = useState(null);
  const [uploadedReviewerEdit, setUploadedReviewerEdit] = useState({ name: '', email: '', institution: '', certificateNumber: '' });

  const CERT_NUMBERING_STORAGE_KEY = 'ictest26_cert_numbering_v1';

  const normalizeKeyPart = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

  const getCertificateNumberingPrefix = (type) => {
    if (type === 'reviewer') return 'ICTEST26/REVR/';
    if (type === 'meta_reviewer') return 'ICTEST26/MRVR/';
    return '';
  };

  const loadCertificateNumberingState = () => {
    try {
      const raw = localStorage.getItem(CERT_NUMBERING_STORAGE_KEY);
      if (!raw) return { nextByPrefix: {}, assigned: {} };
      const parsed = JSON.parse(raw);
      return {
        nextByPrefix: parsed?.nextByPrefix && typeof parsed.nextByPrefix === 'object' ? parsed.nextByPrefix : {},
        assigned: parsed?.assigned && typeof parsed.assigned === 'object' ? parsed.assigned : {}
      };
    } catch {
      return { nextByPrefix: {}, assigned: {} };
    }
  };

  const saveCertificateNumberingState = (state) => {
    localStorage.setItem(CERT_NUMBERING_STORAGE_KEY, JSON.stringify(state));
  };

  const getCertificateIdentityKeys = ({ type, userId = '', email = '', recipientName = '', institution = '' }) => {
    const prefix = getCertificateNumberingPrefix(type);
    if (!prefix) return { prefix: '', uniqueKey: '', legacyKey: '' };

    const normalizedEmail = normalizeKeyPart(email);
    const normalizedName = normalizeKeyPart(recipientName);
    const normalizedInstitution = normalizeKeyPart(institution);

    const stableIdentity = userId
      ? `uid:${userId}`
      : normalizedEmail
        ? `email:${normalizedEmail}`
        : `name:${normalizedName}|inst:${normalizedInstitution}`;

    const uniqueKey = [prefix, type, stableIdentity].filter(Boolean).join('|');

    const legacyKey = [
      prefix,
      type,
      userId ? `uid:${userId}` : '',
      normalizedEmail ? `email:${normalizedEmail}` : '',
      `name:${normalizedName}`,
      `inst:${normalizedInstitution}`
    ]
      .filter(Boolean)
      .join('|');

    return { prefix, uniqueKey, legacyKey };
  };

  const peekAssignedCertificateNumber = ({ type, userId = '', email = '', recipientName = '', institution = '' }) => {
    const { prefix, uniqueKey, legacyKey } = getCertificateIdentityKeys({ type, userId, email, recipientName, institution });
    if (!prefix) return '';
    const state = loadCertificateNumberingState();
    const existing = state.assigned[uniqueKey] ?? state.assigned[legacyKey];
    if (existing && typeof existing === 'number') return `${prefix}${existing}`;
    return '';
  };

  const parseCertificateNumberInput = (type, inputValue) => {
    const prefix = getCertificateNumberingPrefix(type);
    const raw = String(inputValue || '').trim();
    if (!raw) return { ok: true, number: null, error: '' };
    const stripped = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
    const digits = stripped.replace(/\s+/g, '');
    if (!/^\d+$/.test(digits)) {
      return { ok: false, number: null, error: 'Certificate number must be digits (optionally with prefix).' };
    }
    const num = Number(digits);
    if (!Number.isFinite(num) || num < 1) {
      return { ok: false, number: null, error: 'Certificate number is invalid.' };
    }
    return { ok: true, number: num, error: '' };
  };

  const assignCertificateNumber = ({ type, userId = '', email = '', recipientName = '', institution = '', number }) => {
    const { prefix, uniqueKey, legacyKey } = getCertificateIdentityKeys({ type, userId, email, recipientName, institution });
    if (!prefix) return { ok: false, error: 'Certificate numbering not supported for this type.' };

    const state = loadCertificateNumberingState();
    const target = Number(number);
    if (!Number.isFinite(target) || target < 1) return { ok: false, error: 'Certificate number is invalid.' };

    // Collision check within this prefix.
    const takenKey = Object.keys(state.assigned || {}).find((k) => {
      if (!k.startsWith(prefix)) return false;
      return state.assigned[k] === target && k !== uniqueKey && k !== legacyKey;
    });
    if (takenKey) {
      return { ok: false, error: `Certificate number ${prefix}${target} is already assigned.` };
    }

    state.assigned[uniqueKey] = target;
    state.assigned[legacyKey] = target;

    const start = 101;
    const nextExisting = Number.isFinite(state.nextByPrefix[prefix]) ? state.nextByPrefix[prefix] : start;
    state.nextByPrefix[prefix] = Math.max(nextExisting, target + 1);

    saveCertificateNumberingState(state);
    return { ok: true, error: '' };
  };

  const migrateCertificateNumberIfNeeded = ({ type, oldIdentity, newIdentity }) => {
    const { prefix: oldPrefix, uniqueKey: oldKey, legacyKey: oldLegacyKey } = getCertificateIdentityKeys({
      type,
      ...oldIdentity
    });
    const { prefix: newPrefix, uniqueKey: newKey, legacyKey: newLegacyKey } = getCertificateIdentityKeys({
      type,
      ...newIdentity
    });
    if (!oldPrefix || !newPrefix) return;
    if (oldPrefix !== newPrefix) return;
    if (oldKey === newKey) return;

    const state = loadCertificateNumberingState();
    const existingOld = state.assigned[oldKey] ?? state.assigned[oldLegacyKey];
    const existingNew = state.assigned[newKey] ?? state.assigned[newLegacyKey];
    if (!existingOld || typeof existingOld !== 'number') return;
    if (existingNew && typeof existingNew === 'number') return;

    // Move mapping to the new identity to preserve number after edits.
    state.assigned[newKey] = existingOld;
    state.assigned[newLegacyKey] = existingOld;
    delete state.assigned[oldKey];
    if (oldLegacyKey !== oldKey) delete state.assigned[oldLegacyKey];
    saveCertificateNumberingState(state);
  };

  const getOrAssignCertificateNumber = ({ type, userId = '', email = '', recipientName = '', institution = '' }) => {
    const { prefix, uniqueKey, legacyKey } = getCertificateIdentityKeys({ type, userId, email, recipientName, institution });
    if (!prefix) return '';

    const state = loadCertificateNumberingState();
    const existing = state.assigned[uniqueKey] ?? state.assigned[legacyKey];
    if (existing && typeof existing === 'number') {
      // If the match came from legacyKey, promote it to the new key.
      if (state.assigned[uniqueKey] !== existing) {
        state.assigned[uniqueKey] = existing;
        saveCertificateNumberingState(state);
      }
      return `${prefix}${existing}`;
    }

    const start = 101;
    const next = Number.isFinite(state.nextByPrefix[prefix]) ? state.nextByPrefix[prefix] : start;
    state.assigned[uniqueKey] = next;
    state.nextByPrefix[prefix] = next + 1;
    saveCertificateNumberingState(state);
    return `${prefix}${next}`;
  };

  useEffect(() => {
    fetchUsers();
    fetchPapers();
    fetchAuthors();
    fetchCertificates();
  }, []);

  // Reset reviewer upload state when switching away from reviewer certificates
  useEffect(() => {
    if (certificateType !== 'reviewer' && certificateType !== 'meta_reviewer') {
      setUseReviewerUploadList(false);
      setReviewerUploadFileName('');
      setUploadedReviewers([]);
      setSelectedUploadedReviewerIdxs([]);
      setEditingUploadedReviewerIdx(null);
      setUploadedReviewerEdit({ name: '', email: '', institution: '', certificateNumber: '' });
    }
  }, [certificateType]);

  const startEditUploadedReviewer = (idx) => {
    const current = uploadedReviewers[idx];
    if (!current) return;
    const existingNumber = peekAssignedCertificateNumber({
      type: certificateType,
      email: current.email || '',
      recipientName: current.name || '',
      institution: current.institution || ''
    });
    setEditingUploadedReviewerIdx(idx);
    setUploadedReviewerEdit({
      name: current.name || '',
      email: current.email || '',
      institution: current.institution || '',
      certificateNumber: existingNumber
    });
  };

  const cancelEditUploadedReviewer = () => {
    setEditingUploadedReviewerIdx(null);
    setUploadedReviewerEdit({ name: '', email: '', institution: '', certificateNumber: '' });
  };

  const saveEditUploadedReviewer = () => {
    if (editingUploadedReviewerIdx === null) return;
    const nextName = String(uploadedReviewerEdit.name || '').trim();
    if (!nextName) {
      setError('Name cannot be empty');
      return;
    }

    const parsed = parseCertificateNumberInput(certificateType, uploadedReviewerEdit.certificateNumber);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    const idx = editingUploadedReviewerIdx;

    const prev = uploadedReviewers[idx];
    const nextEmail = String(uploadedReviewerEdit.email || '').trim();
    const nextInstitution = String(uploadedReviewerEdit.institution || '').trim();

    // Preserve existing assigned number when identity fields change.
    if (prev) {
      migrateCertificateNumberIfNeeded({
        type: certificateType,
        oldIdentity: {
          email: prev.email || '',
          recipientName: prev.name || '',
          institution: prev.institution || ''
        },
        newIdentity: {
          email: nextEmail,
          recipientName: nextName,
          institution: nextInstitution
        }
      });
    }

    // If user explicitly entered a number, force-assign it.
    if (parsed.number !== null) {
      const res = assignCertificateNumber({
        type: certificateType,
        email: nextEmail,
        recipientName: nextName,
        institution: nextInstitution,
        number: parsed.number
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
    }

    setUploadedReviewers((prev) =>
      prev.map((r, i) =>
        i === idx
          ? {
              ...r,
              name: nextName,
              email: nextEmail,
              institution: nextInstitution
            }
          : r
      )
    );
    setEditingUploadedReviewerIdx(null);
    setUploadedReviewerEdit({ name: '', email: '', institution: '', certificateNumber: '' });
  };

  // Refetch users when certificate type changes
  useEffect(() => {
    fetchUsers(certificateType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificateType]);

  // Define role mapping for certificate types
  const getCertificateRoles = (certType) => {
    const roleMapping = {
      participation: ['author', 'participant', 'attendee', 'user'],
      author: [],
      reviewer: ['reviewer'],
      meta_reviewer: ['meta_reviewer', 'meta reviewer', 'meta-reviewer', 'metareviewer'],
      session_chair: ['session_chair', 'chair']
    };
    return roleMapping[certType] || [];
  };

  const fetchUsers = async (certType = certificateType) => {
    try {
      // Special handling for author certificates - only users with papers
      if (certType === 'author') {
        const { data: paperUsers, error: paperError } = await supabase
          .from('paper')
          .select('login_id')
          .not('login_id', 'is', null);

        if (paperError) {
          console.error('Error fetching paper users:', paperError);
          throw paperError;
        }

        const userIds = [...new Set((paperUsers || []).map(p => p.login_id))];

        if (userIds.length > 0) {
          const { data, error } = await supabase
            .from('login')
            .select('*')
            .in('login_id', userIds)
            .order('email');

          if (error) throw error;
          setUsers(data || []);
        } else {
          setUsers([]);
        }
      } else {
        const allowedRoles = getCertificateRoles(certType);
        let query = supabase.from('login').select('*').order('email');

        if (allowedRoles.length > 0) {
          if (certType === 'participation') {
            // For participation, show all users regardless of role
            const { data, error } = await query;
            if (error) throw error;
            setUsers(data || []);
          } else {
            const { data, error } = await query.in('role', allowedRoles);
            if (error) {
              console.error('Role filtering error:', error);
              if (certType === 'reviewer' || certType === 'meta_reviewer' || certType === 'session_chair') {
                setUsers([]);
              } else {
                throw error;
              }
            } else {
              setUsers(data || []);
            }
          }
        } else {
          setUsers([]);
        }
      }

      setSelectedUsers([]);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users: ' + (err.message || err));
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

  const handleUploadedReviewerSelection = (idx, checked) => {
    if (checked) {
      setSelectedUploadedReviewerIdxs([...selectedUploadedReviewerIdxs, idx]);
    } else {
      setSelectedUploadedReviewerIdxs(selectedUploadedReviewerIdxs.filter(i => i !== idx));
    }
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.login_id));
  };

  const selectAllUploadedReviewers = () => {
    setSelectedUploadedReviewerIdxs(uploadedReviewers.map((_, idx) => idx));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const clearUploadedReviewerSelection = () => {
    setSelectedUploadedReviewerIdxs([]);
  };

  const isReviewerUploadMode = (certificateType === 'reviewer' || certificateType === 'meta_reviewer') && useReviewerUploadList;

  const selectedCount = isReviewerUploadMode ? selectedUploadedReviewerIdxs.length : selectedUsers.length;
  const totalCount = isReviewerUploadMode ? uploadedReviewers.length : users.length;

  const selectedUploadedReviewers = useMemo(() => {
    if (!isReviewerUploadMode) return [];
    return selectedUploadedReviewerIdxs
      .slice()
      .sort((a, b) => a - b)
      .map((idx) => uploadedReviewers[idx])
      .filter(Boolean);
  }, [isReviewerUploadMode, selectedUploadedReviewerIdxs, uploadedReviewers]);

  const normalizeHeader = (value) => String(value || '').toLowerCase().replace(/[\s_\-]/g, '');

  const extractReviewersFromRows = (rows) => {
    // rows: array of objects (header-based)
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const headers = Object.keys(rows[0] || {});
    const headerMap = new Map(headers.map((h) => [normalizeHeader(h), h]));

    const firstNameKey =
      headerMap.get('firstname') ||
      headerMap.get('first') ||
      headerMap.get('givenname') ||
      headerMap.get('given') ||
      headerMap.get('fname');

    const lastNameKey =
      headerMap.get('lastname') ||
      headerMap.get('last') ||
      headerMap.get('surname') ||
      headerMap.get('familyname') ||
      headerMap.get('lname');

    const nameKey =
      headerMap.get('name') ||
      headerMap.get('fullname') ||
      headerMap.get('reviewername') ||
      headerMap.get('reviewer') ||
      headerMap.get('reviewerfullname') ||
      headerMap.get('reviewer_full_name');

    const institutionKey =
      headerMap.get('institution') ||
      headerMap.get('institute') ||
      headerMap.get('organisation') ||
      headerMap.get('organization') ||
      headerMap.get('affiliation') ||
      headerMap.get('college') ||
      headerMap.get('university');

    const emailKey =
      headerMap.get('email') ||
      headerMap.get('emailid') ||
      headerMap.get('emailaddress') ||
      headerMap.get('mail') ||
      headerMap.get('email_id');

    const mapped = rows
      .map((row) => {
        const rawFirst = firstNameKey ? row[firstNameKey] : '';
        const rawLast = lastNameKey ? row[lastNameKey] : '';
        const combinedName = `${String(rawFirst || '').trim()} ${String(rawLast || '').trim()}`.trim();

        const rawName = nameKey ? row[nameKey] : (combinedName || row[headers[0]]);
        const rawEmail = emailKey ? row[emailKey] : row[headers[1]];
        const rawInstitution = institutionKey ? row[institutionKey] : row[headers[2]];

        const name = String(rawName || '').trim();
        const email = String(rawEmail || '').trim();
        const institution = String(rawInstitution || '').trim();

        return { name, email, institution };
      })
      .filter((r) => r.name);

    // Deduplicate by email if present, otherwise by name
    const seen = new Set();
    const deduped = [];
    for (const r of mapped) {
      const key = (r.email || r.name).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(r);
    }
    return deduped;
  };

  const parseReviewerFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // Try header-based parsing first
    const objectRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    let reviewers = extractReviewersFromRows(objectRows);

    // If header-based parsing fails, try as a simple row-based sheet (headerless)
    if (reviewers.length === 0) {
      const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const dataRows = matrix.slice(0).filter((r) => Array.isArray(r) && r.some((v) => String(v).trim() !== ''));
      // Remove a potential header row if it looks like one
      const maybeHeader = dataRows[0] || [];
      const headerLike = maybeHeader.some((v) => {
        const n = normalizeHeader(v);
        return (
          n.includes('name') ||
          n.includes('email') ||
          n.includes('reviewer') ||
          n.includes('firstname') ||
          n.includes('lastname') ||
          n.includes('institution') ||
          n.includes('affiliation')
        );
      });
      const startIdx = headerLike ? 1 : 0;
      reviewers = dataRows
        .slice(startIdx)
        .map((row) => {
          const cols = Array.isArray(row) ? row : [];
          const c0 = String(cols[0] || '').trim();
          const c1 = String(cols[1] || '').trim();
          const c2 = String(cols[2] || '').trim();
          const c3 = String(cols[3] || '').trim();

          // Common layouts:
          // - [firstName, lastName, institution]
          // - [firstName, lastName, institution, email]
          // - [name, email]
          // - [name]
          if (cols.length >= 4) {
            return {
              name: `${c0} ${c1}`.trim() || c0,
              institution: c2,
              email: c3
            };
          }

          if (cols.length === 3) {
            return {
              name: `${c0} ${c1}`.trim() || c0,
              institution: c2,
              email: ''
            };
          }

          if (cols.length === 2) {
            return {
              name: c0,
              institution: '',
              email: c1
            };
          }

          return {
            name: c0,
            institution: '',
            email: ''
          };
        })
        .filter((r) => r.name);
    }

    return reviewers;
  };

  const handleReviewerFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setReviewerUploadFileName(file.name);

    try {
      const reviewers = await parseReviewerFile(file);
      if (reviewers.length === 0) {
        setUploadedReviewers([]);
        setSelectedUploadedReviewerIdxs([]);
        setError('No reviewers found in the uploaded file. Expected columns like First Name, Last Name, Institution (email optional).');
        return;
      }

      setUploadedReviewers(reviewers);
      setSelectedUploadedReviewerIdxs(reviewers.map((_, idx) => idx)); // default: select all
      setUseReviewerUploadList(true);
      setSuccess(`Loaded ${reviewers.length} reviewer(s) from ${file.name}`);
    } catch (err) {
      console.error('Failed to parse reviewer file:', err);
      setUploadedReviewers([]);
      setSelectedUploadedReviewerIdxs([]);
      setError('Failed to parse Excel/CSV file. Please upload a valid .xlsx/.xls/.csv file.');
    }
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
      const isDownloadOnlyType = certificateType === 'reviewer' || certificateType === 'meta_reviewer';
      const filePrefix = certificateType === 'meta_reviewer' ? 'MetaReviewer' : 'Reviewer';
      
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

        if (isDownloadOnlyType) {
          const user = users.find(u => u.login_id === userId);
          const certificateNumber = getOrAssignCertificateNumber({
            type: certificateType,
            userId,
            email: user?.email || '',
            recipientName: userName,
            institution: ''
          });
          const safeName = userName.replace(/[^a-z0-9\-_ ]/gi, '').trim().replace(/\s+/g, '_') || 'recipient';
          const blob = await generateLocalCertificateBlob(certificateType, userName, '', '', certificateNumber);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filePrefix}_${safeName}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          successCount++;
        } else {
          const result = await generateSingleCertificate(userId, certificateType, userName, paperTitle, '');
          if (result.success) {
            successCount++;
          }
        }
        
        // Update progress
        setProgress({
          completed: i + 1,
          total: selectedUsers.length,
          current: isDownloadOnlyType ? `Completed (download): ${userName}` : `Completed: ${userName}`
        });
      }

      if (isDownloadOnlyType) {
        setSuccess(`Downloaded ${successCount} certificates out of ${selectedUsers.length} selected users`);
      } else {
        setSuccess(`Successfully generated ${successCount} certificates out of ${selectedUsers.length} selected users`);
        fetchCertificates(); // Refresh the certificates list
      }
      
    } catch (err) {
      console.error('Error generating certificates:', err);
      setError('Failed to generate certificates: ' + err.message);
    } finally {
      setIsGenerating(false);
      setProgress({ completed: 0, total: 0, current: '' });
    }
  };

  const generateLocalCertificateBlob = async (type, recipientName, paperTitle = '', institution = '', certificateNumber = '') => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '210mm';
    tempContainer.style.height = '297mm';
    document.body.appendChild(tempContainer);

    const certificateElement = React.createElement(CertificateTemplate, {
      type,
      recipientName,
      paperTitle,
      institution,
      certificateNumber,
      isPreview: false
    });

    const { createRoot } = await import('react-dom/client');
    const root = createRoot(tempContainer);
    root.render(certificateElement);

    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfBlob = await generateCertificatePdfBlob(tempContainer);

    root.unmount();
    document.body.removeChild(tempContainer);
    return pdfBlob;
  };

  const generateCertificatesForUploadedReviewers = async () => {
    const supportsUploadList = certificateType === 'reviewer' || certificateType === 'meta_reviewer';
    if (!supportsUploadList) {
      setError('Uploaded list generation is only available for reviewer/meta reviewer certificates.');
      return;
    }

    if (selectedUploadedReviewers.length === 0) {
      setError('Please select at least one reviewer from the uploaded list');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setProgress({ completed: 0, total: selectedUploadedReviewers.length, current: '' });

    try {
      let downloadedCount = 0;

      const label = certificateType === 'meta_reviewer' ? 'Meta Reviewer' : 'Reviewer';
      const filePrefix = certificateType === 'meta_reviewer' ? 'MetaReviewer' : 'Reviewer';

      for (let i = 0; i < selectedUploadedReviewers.length; i++) {
        const reviewer = selectedUploadedReviewers[i];
        const recipientName = reviewer.name;
        const institution = reviewer.institution;
        const email = reviewer.email;

        setProgress({
          completed: i,
          total: selectedUploadedReviewers.length,
          current: `Processing: ${recipientName}`
        });

        const safeName = recipientName.replace(/[^a-z0-9\-_ ]/gi, '').trim().replace(/\s+/g, '_') || 'recipient';

        const certificateNumber = getOrAssignCertificateNumber({
          type: certificateType,
          email,
          recipientName,
          institution
        });

        const blob = await generateLocalCertificateBlob(certificateType, recipientName, '', institution, certificateNumber);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filePrefix}_${safeName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        downloadedCount++;

        setProgress({
          completed: i + 1,
          total: selectedUploadedReviewers.length,
          current: `Completed (download): ${recipientName}`
        });
      }

      setSuccess(
        `${label} certificates done. Downloaded: ${downloadedCount}.`
      );
    } catch (err) {
      console.error('Error generating uploaded reviewer certificates:', err);
      setError('Failed to generate certificates from file: ' + (err.message || err));
    } finally {
      setIsGenerating(false);
      setProgress({ completed: 0, total: 0, current: '' });
    }
  };

  const generateSingleCertificate = async (userId, type, recipientName, paperTitle = '', institution = '') => {
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
        institution,
        isPreview: false
      });

      // Render it to the temp container
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      root.render(certificateElement);

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate certificate PDF (single-page)
      const pdfBlob = await generateCertificatePdfBlob(tempContainer);

      // Upload to storage
      const uploadResult = await uploadCertificateToSupabase(
        supabase,
        userId,
        type,
        pdfBlob,
        { ext: 'pdf', contentType: 'application/pdf' }
      );

      // Save record to database
      await createCertificateRecord(supabase, {
        user_id: userId,
        certificate_type: type,
        recipient_name: recipientName,
        paper_title: paperTitle || null,
        pdf_url: uploadResult.fileUrl,
        image_url: null,
        pdf_path: uploadResult.filePath,
        image_path: null,
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
        paperTitle: certificateType === 'author' ? getUserPaper(userId) : '',
        institution: ''
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
                <option value="meta_reviewer">Meta Reviewer Appreciation</option>
                <option value="session_chair">Session Chair Appreciation</option>
              </select>
            </div>

            {(certificateType === 'reviewer' || certificateType === 'meta_reviewer') && (
              <div className="reviewer-upload-controls">
                <div className="reviewer-upload-row">
                  <label className="reviewer-upload-toggle">
                    <input
                      type="checkbox"
                      checked={useReviewerUploadList}
                      onChange={(e) => setUseReviewerUploadList(e.target.checked)}
                      disabled={isGenerating}
                    />
                    Generate from uploaded Excel/CSV
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleReviewerFileChange}
                    disabled={isGenerating}
                  />
                </div>
                {useReviewerUploadList && (
                  <div className="reviewer-upload-hint">
                    {reviewerUploadFileName ? (
                      <span>Loaded file: <strong>{reviewerUploadFileName}</strong></span>
                    ) : (
                      <span>Upload a file with columns like <strong>First Name</strong>, <strong>Last Name</strong>, <strong>Institution</strong> (email optional).</span>
                    )}
                    <span className="reviewer-upload-note">
                      Certificates from uploaded lists are generated as direct PDF downloads (not stored to any user account).
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="user-selection-controls">
              {!isReviewerUploadMode ? (
                <>
                  <button onClick={selectAllUsers} disabled={isGenerating}>
                    Select All Users
                  </button>
                  <button onClick={clearSelection} disabled={isGenerating}>
                    Clear Selection
                  </button>
                </>
              ) : (
                <>
                  <button onClick={selectAllUploadedReviewers} disabled={isGenerating}>
                    Select All Reviewers
                  </button>
                  <button onClick={clearUploadedReviewerSelection} disabled={isGenerating}>
                    Clear Selection
                  </button>
                </>
              )}
              <span className="selection-count">
                {selectedCount} of {totalCount} selected
              </span>
              {certificateType === 'author' && (
                <span className="filter-info">
                  (Showing only users with submitted papers)
                </span>
              )}
              {certificateType === 'reviewer' && (
                <span className="filter-info">
                  {isReviewerUploadMode
                    ? '(Using uploaded reviewers list)'
                    : users.length === 0
                      ? '(No reviewers assigned yet)'
                      : '(Showing only users with reviewer role)'}
                </span>
              )}
              {certificateType === 'meta_reviewer' && (
                <span className="filter-info">
                  {isReviewerUploadMode
                    ? '(Using uploaded reviewers list)'
                    : users.length === 0
                      ? '(No meta reviewers assigned yet)'
                      : '(Showing only users with meta reviewer role)'}
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
              onClick={isReviewerUploadMode ? generateCertificatesForUploadedReviewers : generateCertificatesForUsers}
              disabled={isGenerating || selectedCount === 0}
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
                {progress.current && <span> - {progress.current}</span>}
              </div>
            </div>
          )}

          <div className="users-list">
            <div className="users-header">
              <h3>
                {isReviewerUploadMode
                  ? certificateType === 'meta_reviewer'
                    ? 'Select Meta Reviewers from Uploaded List'
                    : 'Select Reviewers from Uploaded List'
                  : 'Select Users for Certificate Generation'}
              </h3>
            </div>
            <div className="users-grid">
              {isReviewerUploadMode ? (
                uploadedReviewers.length === 0 ? (
                  <div className="no-users-message">
                    <div className="no-users-icon">📄</div>
                    <h4>No entries loaded</h4>
                    <p>Upload an Excel/CSV file to load the list.</p>
                  </div>
                ) : (
                  uploadedReviewers.map((reviewer, idx) => (
                    <div key={`${reviewer.email || reviewer.name}-${idx}`} className="user-card">
                      <div className="user-checkbox">
                        <input
                          type="checkbox"
                          id={`uploaded-reviewer-${idx}`}
                          checked={selectedUploadedReviewerIdxs.includes(idx)}
                          onChange={(e) => handleUploadedReviewerSelection(idx, e.target.checked)}
                          disabled={isGenerating}
                        />
                        <label htmlFor={`uploaded-reviewer-${idx}`}>
                          <div className="user-info">
                            <div className="user-name">{reviewer.name}</div>
                            <div className="user-email">{reviewer.email || '(no email)'}</div>
                            {reviewer.institution && (
                              <div className="user-paper">{reviewer.institution}</div>
                            )}
                          </div>
                        </label>
                      </div>

                      <div className="user-actions">
                        <button
                          className="preview-button"
                          onClick={() =>
                            setPreviewUser({
                              id: idx,
                              name: reviewer.name,
                              paperTitle: '',
                              institution: reviewer.institution,
                              certificateNumber: peekAssignedCertificateNumber({
                                type: certificateType,
                                email: reviewer.email || '',
                                recipientName: reviewer.name || '',
                                institution: reviewer.institution || ''
                              })
                            })
                          }
                          disabled={isGenerating}
                        >
                          Preview
                        </button>

                        {editingUploadedReviewerIdx === idx ? (
                          <>
                            <button
                              className="edit-button"
                              onClick={saveEditUploadedReviewer}
                              disabled={isGenerating}
                              type="button"
                            >
                              Save
                            </button>
                            <button
                              className="edit-button secondary"
                              onClick={cancelEditUploadedReviewer}
                              disabled={isGenerating}
                              type="button"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="edit-button"
                            onClick={() => startEditUploadedReviewer(idx)}
                            disabled={isGenerating}
                            type="button"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {editingUploadedReviewerIdx === idx && (
                        <div className="uploaded-reviewer-edit">
                          <div className="uploaded-reviewer-edit-row">
                            <label>
                              Name
                              <input
                                type="text"
                                value={uploadedReviewerEdit.name}
                                onChange={(e) => setUploadedReviewerEdit((prev) => ({ ...prev, name: e.target.value }))}
                                disabled={isGenerating}
                              />
                            </label>
                            <label>
                              Certificate No.
                              <input
                                type="text"
                                placeholder={`${getCertificateNumberingPrefix(certificateType)}101`}
                                value={uploadedReviewerEdit.certificateNumber}
                                onChange={(e) =>
                                  setUploadedReviewerEdit((prev) => ({ ...prev, certificateNumber: e.target.value }))
                                }
                                disabled={isGenerating}
                              />
                            </label>
                            <label>
                              Email
                              <input
                                type="text"
                                value={uploadedReviewerEdit.email}
                                onChange={(e) => setUploadedReviewerEdit((prev) => ({ ...prev, email: e.target.value }))}
                                disabled={isGenerating}
                              />
                            </label>
                            <label>
                              Institution
                              <input
                                type="text"
                                value={uploadedReviewerEdit.institution}
                                onChange={(e) =>
                                  setUploadedReviewerEdit((prev) => ({ ...prev, institution: e.target.value }))
                                }
                                disabled={isGenerating}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                users.length === 0 ? (
                  <div className="no-users-message">
                    <div className="no-users-icon">👥</div>
                    <h4>No users available for {certificateType.replace('_', ' ')} certificates</h4>
                    {certificateType === 'author' && (
                      <p>No users have submitted papers yet.</p>
                    )}
                    {certificateType === 'reviewer' && (
                      <p>No users have been assigned the reviewer role yet.</p>
                    )}
                    {certificateType === 'meta_reviewer' && (
                      <p>No users have been assigned the meta reviewer role yet.</p>
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
                      <div className="user-actions">
                        <button
                          className="preview-button"
                          onClick={() => handlePreview(user.login_id)}
                          disabled={isGenerating}
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))
                )
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
                      href={cert.pdf_url || cert.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-button"
                    >
                      {cert.pdf_url ? 'View PDF' : 'View Image'}
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
                institution={previewUser.institution}
                certificateNumber={previewUser.certificateNumber}
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