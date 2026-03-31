import React, { useState, useRef, useEffect } from 'react';
import "./Upload.css";
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '/home/prady/hoswap2/src/declarations/academic_certificate';
interface DocumentData {
  filename: string;
  uploadDate: string;
  content: File;
}

interface VerificationResponse {
  verified: boolean;
  confidence?: number;
  error?: string;
}

const Upload: React.FC = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<'upload' | 'retrieve'>('upload');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [verified, setVerified] = useState<boolean>(false);
  const [currentNFTId, setCurrentNFTId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' | '' }>({ message: '', type: '' });
  const [retrieveStatus, setRetrieveStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' | '' }>({ message: '', type: '' });
  const [nftIdInput, setNftIdInput] = useState<string>('');
  const [showNftResult, setShowNftResult] = useState<boolean>(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState<boolean>(false);
  const [previewContent, setPreviewContent] = useState<React.ReactNode | null>(null);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [downloadableContent, setDownloadableContent] = useState<{ data: string; filename: string } | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const uploadStatusRef = useRef<HTMLDivElement>(null);
  const retrieveStatusRef = useRef<HTMLDivElement>(null);

  // Internet Computer connection
  const [actor, setActor] = useState<any>(null);

  // Initialize IC actor on component mount
  useEffect(() => {
    const initActor = async () => {
      try {
        // Create an agent (use { host } config for production)
        const agent = new HttpAgent({ host: import.meta.env.CANISTER_HOST || 'http://localhost:4943' });
        
        // In development, we need to fetch the root key
        if (import.meta.env.NODE_ENV !== 'production') {
          await agent.fetchRootKey();
        }
        
        // Canister ID from your dfx.json or environment variables
        const canisterId = import.meta.env.ACADEMIC_CERTIFICATE_CANISTER_ID || '7sotd-p4lsj-o6vua-uh46q';
        
        // Create the actor
        const academicCertificateActor = Actor.createActor(idlFactory, {
          agent,
          canisterId,
        });
        
        setActor(academicCertificateActor);
        console.log('Actor initialized successfully');
      } catch (error) {
        console.error('Failed to initialize actor:', error);
        showStatus('upload', 'Failed to connect to the Internet Computer. Please check your connection.', 'error');
      }
    };
    
    initActor();
  }, []);

  // Handle tab switching
  const openTab = (tabName: 'upload' | 'retrieve') => {
    setActiveTab(tabName);
  };

  // Handle file selection
  const handleFileSelection = (file: File) => {
    setCurrentFile(file);
    showStatus('upload', `File selected: ${file.name}`, 'info');
    setVerified(false);
    setShowNftResult(false);
    setCurrentDocId(null);
    setCurrentNFTId(null);
  };

  // File drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = '#b62ff0';
      dropZoneRef.current.style.backgroundColor = 'rgba(182, 47, 240, 0.1)';
    }
  };

  const handleDragLeave = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      dropZoneRef.current.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragLeave();
    
    if (e.dataTransfer.files.length) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Calculate simple hash of file for tracking
  const calculateFileHash = async (file: File): Promise<string> => {
    // In a real app, use a proper hash function
    // This is a simplified version
    const arrayBuffer = await file.arrayBuffer();
    const hashArray = Array.from(new Uint8Array(arrayBuffer))
      .slice(0, 100) // Use just the first 100 bytes for demo
      .map(b => b.toString(16).padStart(2, '0'));
    
    return hashArray.join('').substring(0, 40); // Return first 40 chars of hash
  };

  // Show status message
  const showStatus = (type: 'upload' | 'retrieve', message: string, statusType: 'info' | 'success' | 'error') => {
    if (type === 'upload') {
      setUploadStatus({ message, type: statusType });
      if (uploadStatusRef.current) {
        uploadStatusRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      setRetrieveStatus({ message, type: statusType });
      if (retrieveStatusRef.current) {
        retrieveStatusRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // Handle document upload to IC
  const handleUploadDocument = async () => {
    if (!actor) {
      showStatus('upload', 'Connection to Internet Computer not established', 'error');
      return;
    }

    if (!currentFile) {
      showStatus('upload', 'Please select a file first', 'error');
      return;
    }

    showStatus('upload', 'Uploading document to Internet Computer...', 'info');

    try {
      // Convert file to base64 for storage
      const fileContent = await fileToBase64(currentFile);
      
      // Calculate file hash for tracking
      const fileHash = await calculateFileHash(currentFile);
      
      // Upload document to IC canister
      const docId = await actor.uploadDocument(currentFile.name, fileHash, fileContent);
      
      setCurrentDocId(Number(docId));
      showStatus('upload', `Document uploaded successfully! Document ID: ${docId}`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showStatus('upload', `Error uploading document: ${errorMessage}`, 'error');
    }
  };

  // Handle verify document
  const handleVerify = async () => {
    if (!actor) {
      showStatus('upload', 'Connection to Internet Computer not established', 'error');
      return;
    }

    if (!currentFile) {
      showStatus('upload', 'Please select a file first', 'error');
      return;
    }

    if (!currentDocId) {
      showStatus('upload', 'Please upload the document to the Internet Computer first', 'error');
      return;
    }
    
    showStatus('upload', 'Verifying document authenticity...', 'info');
    
    try {
      // Convert file to base64 for API
      const base64String = await fileToBase64(currentFile);
      // Extract just the base64 data without the data URL prefix
      const base64Data = base64String.split(',')[1];
      
      // Call the verification function on the IC canister
      const isVerified = await actor.verifyDocument(currentDocId, base64Data);
      
      if (isVerified) {
        setVerified(true);
        showStatus('upload', 'Document verified successfully!', 'success');
      } else {
        showStatus('upload', 'Verification failed. Document may not be authentic.', 'error');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showStatus('upload', `Error during verification: ${errorMessage}`, 'error');
    }
  };

  // Handle push to blockchain (mint NFT)
  const handlePushToBlockchain = async () => {
    if (!actor) {
      showStatus('upload', 'Connection to Internet Computer not established', 'error');
      return;
    }

    if (!verified) {
      showStatus('upload', 'Please verify your document first', 'error');
      return;
    }

    if (!currentDocId) {
      showStatus('upload', 'Document ID not found', 'error');
      return;
    }
    
    showStatus('upload', 'Minting NFT certificate...', 'info');
    
    try {
      // Call the mintCertificateNFT function on the canister
      const nftIdOpt = await actor.mintCertificateNFT(currentDocId);
      
      // Handle null case (Option type in Motoko returns null if None)
      if (nftIdOpt === null) {
        showStatus('upload', 'Failed to mint NFT. Document may not be verified.', 'error');
        return;
      }
      
      // Set the NFT ID in state
      const nftId = Number(nftIdOpt);
      setCurrentNFTId(`DOC${nftId}`);
      
      showStatus('upload', 'NFT certificate minted successfully!', 'success');
    } catch (error) {
      console.error('NFT minting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showStatus('upload', `Error minting NFT: ${errorMessage}`, 'error');
    }
  };

  // Handle fetch NFT ID
  const handleFetchNFTId = () => {
    if (!currentNFTId) {
      showStatus('upload', 'Please mint your NFT certificate first', 'error');
      return;
    }
    
    setShowNftResult(true);
    
    // Auto-fill the retrieval input for demo convenience
    setNftIdInput(currentNFTId);
  };

  // Parse NFT ID to get numeric ID
  const parseNftId = (nftId: string): number | null => {
    const match = nftId.match(/DOC(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  // Handle download document
  const handleDownloadDocument = async (documentId: number, filename: string) => {
    if (!actor) {
      showStatus('retrieve', 'Connection to Internet Computer not established', 'error');
      return;
    }
    
    setDownloadLoading(true);
    
    try {
      // Get document content from canister
      const documentContent = await actor.getDocumentContent(documentId);
      
      if (!documentContent) {
        showStatus('retrieve', 'Document content not found or you don\'t have permission to access it', 'error');
        setDownloadLoading(false);
        return;
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = documentContent;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showStatus('retrieve', 'Document downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showStatus('retrieve', `Error downloading document: ${errorMessage}`, 'error');
    } finally {
      setDownloadLoading(false);
    }
  };

  // Handle fetch document
  const handleFetchDocument = async () => {
    if (!actor) {
      showStatus('retrieve', 'Connection to Internet Computer not established', 'error');
      return;
    }

    const nftId = nftIdInput.trim();
    
    if (!nftId) {
      showStatus('retrieve', 'Please enter an NFT ID', 'error');
      return;
    }
    
    showStatus('retrieve', 'Fetching document from blockchain...', 'info');
    
    try {
      // Parse the NFT ID to get the numeric part
      const numericId = parseNftId(nftId);
      
      if (numericId === null) {
        showStatus('retrieve', 'Invalid NFT ID format. Expected format: DOC123456', 'error');
        return;
      }
      
      // Query all documents for the current user
      const myDocs = await actor.listMyDocuments();
      
      // Find the document with matching NFT ID
      const doc: { nftId?: number; filename: string; id: number; fileHash: string } | undefined = myDocs.find(
        (d: { nftId?: number; filename: string; id: number; fileHash: string }) => d.nftId && Number(d.nftId) === numericId
      );
      
      if (doc) {
        showStatus('retrieve', 'Document retrieved successfully!', 'success');
        
        // Store document ID for download
        setCurrentDocId(doc.id);
        
        // Display document info
        setShowDocumentPreview(true);
        setPreviewContent(
          <>
            <p><strong>Filename:</strong> {doc.filename}</p>
            <p><strong>Document ID:</strong> {doc.id.toString()}</p>
            <p><strong>NFT ID:</strong> {doc.nftId ? `DOC${doc.nftId.toString()}` : 'N/A'}</p>
            <p><strong>Status:</strong> <span style={{ color: '#2ed573' }}>✓ Verified</span></p>
            <p><strong>File Hash:</strong> {doc.fileHash}</p>
            <button 
              className="form-btn download-btn"
              onClick={() => handleDownloadDocument(doc.id, doc.filename)}
              disabled={downloadLoading}
            >
              {downloadLoading ? 'Downloading...' : 'Download Document'}
            </button>
          </>
        );
      } else {
        // Try to fetch specific document if user has permission
        try {
          // For each document ID up to a reasonable limit, try to find one with the matching NFT ID
          // This is inefficient but works within the constraints of the current backend design
          for (let i = 1; i < 100; i++) {
            const docOpt = await actor.getDocument(i);
            if (docOpt && docOpt.nftId && Number(docOpt.nftId) === numericId) {
              showStatus('retrieve', 'Document retrieved successfully!', 'success');
              
              // Store document ID for download
              setCurrentDocId(i);
              
              setShowDocumentPreview(true);
              setPreviewContent(
                <>
                  <p><strong>Filename:</strong> {docOpt.filename}</p>
                  <p><strong>Document ID:</strong> {docOpt.id.toString()}</p>
                  <p><strong>NFT ID:</strong> DOC{docOpt.nftId.toString()}</p>
                  <p><strong>Status:</strong> <span style={{ color: '#2ed573' }}>✓ Verified</span></p>
                  <p><strong>File Hash:</strong> {docOpt.fileHash}</p>
                  <button 
                    className="form-btn download-btn"
                    onClick={() => handleDownloadDocument(i, docOpt.filename)}
                    disabled={downloadLoading}
                  >
                    {downloadLoading ? 'Downloading...' : 'Download Document'}
                  </button>
                </>
              );
              return;
            }
          }
          
          showStatus('retrieve', 'No document found with this NFT ID or you do not have permission to view it', 'error');
          setShowDocumentPreview(false);
        } catch (error) {
          console.error('Document fetch error:', error);
          showStatus('retrieve', 'No document found with this NFT ID or you do not have permission to view it', 'error');
          setShowDocumentPreview(false);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showStatus('retrieve', `Error fetching document: ${errorMessage}`, 'error');
      setShowDocumentPreview(false);
    }
  };

  return (
    <>
      <div className="container">
        <nav>
          <a href="./home" className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#b62fb0" strokeWidth="3"/>
              <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" fill="#b62fb0"/>
              <path d="M12 8V2" stroke="#b62fe0" strokeWidth="3" strokeLinecap="round"/>
              <path d="M16 12H22" stroke="#b62fe0" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Certi<span>Node</span>
          </a>
          <div className="nav-links">
            <a href="#">Features</a>
            <a href="#">How It Works</a>
            <a href="#">For Institutions</a>
            <a href="#">About</a>
          </div>
          <a href="./login" className="btn btn-secondary">Login / Register</a>
        </nav>
      </div>
      
      <main className="main-content">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="container">
          <div className="verification-container">
            <div className="verification-sidebar">
              <h2>Document Verification Portal</h2>
              <p>Securely verify and store your academic credentials, certificates, and important documents on the blockchain.</p>
            
              <div className="info-box">
                <h4>Why Blockchain Verification?</h4>
                <p>Once verified and pushed to the blockchain, your documents become tamper-proof, instantly verifiable, and accessible only with your consent.</p>
              </div>
              
              <div className="info-box">
                <h4>How It Works</h4>
                <p>Upload your document, our AI verifies its authenticity, then it's stored securely on the Internet Computer Protocol blockchain with a unique NFT ID.</p>
              </div>
            </div>
            
            <div className="verification-content">
              <div className="section-header">
                <h2>Document Management System</h2>
                <p>Upload, verify, and retrieve your important documents</p>
              </div>
              
              <div className="tab-header">
                <button 
                  className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} 
                  onClick={() => openTab('upload')}
                >
                  Upload Document
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'retrieve' ? 'active' : ''}`} 
                  onClick={() => openTab('retrieve')}
                >
                  Retrieve Document
                </button>
              </div>
              
              <div id="upload" className={`tab-content ${activeTab === 'upload' ? 'active' : ''}`}>
                <div 
                  className="upload-area" 
                  id="dropZone"
                  ref={dropZoneRef}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <p>Drag & Drop your document here or click to browse</p>
                  <input 
                    type="file" 
                    id="fileInput" 
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                  />
                </div>
                
                {uploadStatus.message && (
                  <div 
                    ref={uploadStatusRef}
                    className={`status ${uploadStatus.type}`}
                  >
                    {uploadStatus.message}
                  </div>
                )}
                
                <button 
                  id="uploadButton" 
                  className="form-btn"
                  onClick={handleUploadDocument}
                  disabled={!currentFile}
                >
                  Upload Document
                </button>
                
                <button 
                  id="verifyButton" 
                  className="form-btn"
                  onClick={handleVerify}
                  disabled={!currentDocId}
                >
                  Verify Your Document
                </button>
                
                <button 
                  id="pushButton" 
                  className="form-btn" 
                  disabled={!verified}
                  onClick={handlePushToBlockchain}
                >
                  Push to Blockchain
                </button>
                
                <button 
                  id="fetchNFTButton" 
                  className="form-btn" 
                  disabled={!currentNFTId}
                  onClick={handleFetchNFTId}
                >
                  Fetch NFT ID
                </button>
                
                {showNftResult && (
                  <div id="nftResult" className="nft-box">
                    <p>Your document has been successfully stored on the blockchain</p>
                    <p>NFT ID:</p>
                    <div id="nftIdDisplay" className="nft-id">{currentNFTId || '-'}</div>
                    <p>Store this ID safely to retrieve your document later</p>
                  </div>
                )}
              </div>
              
              <div id="retrieve" className={`tab-content ${activeTab === 'retrieve' ? 'active' : ''}`}>
                <div className="input-group">
                  <label htmlFor="nftIdInput">Enter your NFT ID:</label>
                  <input 
                    type="text" 
                    id="nftIdInput" 
                    placeholder="e.g., DOC123456"
                    value={nftIdInput}
                    onChange={(e) => setNftIdInput(e.target.value)}
                  />
                </div>
                
                <button 
                  id="fetchDocumentButton" 
                  className="form-btn"
                  onClick={handleFetchDocument}
                >
                  Fetch Document
                </button>
                
                {retrieveStatus.message && (
                  <div 
                    ref={retrieveStatusRef}
                    className={`status ${retrieveStatus.type}`}
                  >
                    {retrieveStatus.message}
                  </div>
                )}
                
                {showDocumentPreview && (
                  <div id="documentPreview" className="document-preview">
                    <h3>Document Information</h3>
                    <div id="previewContent">{previewContent}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer>
        <div className="container">
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
          </div>
          <p className="copyright">© 2025 CertChain. Powered by Internet Computer Protocol.</p>
        </div>
      </footer>
    </>
  );
};

export default Upload;