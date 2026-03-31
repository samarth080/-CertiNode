import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import "./Upload.css";
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '/home/prady/hoswap2/src/declarations/academic_certificate';
const Upload = () => {
    // State variables
    const [activeTab, setActiveTab] = useState('upload');
    const [currentFile, setCurrentFile] = useState(null);
    const [verified, setVerified] = useState(false);
    const [currentNFTId, setCurrentNFTId] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
    const [retrieveStatus, setRetrieveStatus] = useState({ message: '', type: '' });
    const [nftIdInput, setNftIdInput] = useState('');
    const [showNftResult, setShowNftResult] = useState(false);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [currentDocId, setCurrentDocId] = useState(null);
    const [downloadableContent, setDownloadableContent] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    // Refs
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const uploadStatusRef = useRef(null);
    const retrieveStatusRef = useRef(null);
    // Internet Computer connection
    const [actor, setActor] = useState(null);
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
            }
            catch (error) {
                console.error('Failed to initialize actor:', error);
                showStatus('upload', 'Failed to connect to the Internet Computer. Please check your connection.', 'error');
            }
        };
        initActor();
    }, []);
    // Handle tab switching
    const openTab = (tabName) => {
        setActiveTab(tabName);
    };
    // Handle file selection
    const handleFileSelection = (file) => {
        setCurrentFile(file);
        showStatus('upload', `File selected: ${file.name}`, 'info');
        setVerified(false);
        setShowNftResult(false);
        setCurrentDocId(null);
        setCurrentNFTId(null);
    };
    // File drop handlers
    const handleDragOver = (e) => {
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
    const handleDrop = (e) => {
        e.preventDefault();
        handleDragLeave();
        if (e.dataTransfer.files.length) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };
    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length) {
            handleFileSelection(e.target.files[0]);
        }
    };
    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    };
    // Calculate simple hash of file for tracking
    const calculateFileHash = async (file) => {
        // In a real app, use a proper hash function
        // This is a simplified version
        const arrayBuffer = await file.arrayBuffer();
        const hashArray = Array.from(new Uint8Array(arrayBuffer))
            .slice(0, 100) // Use just the first 100 bytes for demo
            .map(b => b.toString(16).padStart(2, '0'));
        return hashArray.join('').substring(0, 40); // Return first 40 chars of hash
    };
    // Show status message
    const showStatus = (type, message, statusType) => {
        if (type === 'upload') {
            setUploadStatus({ message, type: statusType });
            if (uploadStatusRef.current) {
                uploadStatusRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        else {
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
        }
        catch (error) {
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
            }
            else {
                showStatus('upload', 'Verification failed. Document may not be authentic.', 'error');
            }
        }
        catch (error) {
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
        }
        catch (error) {
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
    const parseNftId = (nftId) => {
        const match = nftId.match(/DOC(\d+)/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
        return null;
    };
    // Handle download document
    const handleDownloadDocument = async (documentId, filename) => {
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
        }
        catch (error) {
            console.error('Download error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showStatus('retrieve', `Error downloading document: ${errorMessage}`, 'error');
        }
        finally {
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
            const doc = myDocs.find((d) => d.nftId && Number(d.nftId) === numericId);
            if (doc) {
                showStatus('retrieve', 'Document retrieved successfully!', 'success');
                // Store document ID for download
                setCurrentDocId(doc.id);
                // Display document info
                setShowDocumentPreview(true);
                setPreviewContent(_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Filename:" }), " ", doc.filename] }), _jsxs("p", { children: [_jsx("strong", { children: "Document ID:" }), " ", doc.id.toString()] }), _jsxs("p", { children: [_jsx("strong", { children: "NFT ID:" }), " ", doc.nftId ? `DOC${doc.nftId.toString()}` : 'N/A'] }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", _jsx("span", { style: { color: '#2ed573' }, children: "\u2713 Verified" })] }), _jsxs("p", { children: [_jsx("strong", { children: "File Hash:" }), " ", doc.fileHash] }), _jsx("button", { className: "form-btn download-btn", onClick: () => handleDownloadDocument(doc.id, doc.filename), disabled: downloadLoading, children: downloadLoading ? 'Downloading...' : 'Download Document' })] }));
            }
            else {
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
                            setPreviewContent(_jsxs(_Fragment, { children: [_jsxs("p", { children: [_jsx("strong", { children: "Filename:" }), " ", docOpt.filename] }), _jsxs("p", { children: [_jsx("strong", { children: "Document ID:" }), " ", docOpt.id.toString()] }), _jsxs("p", { children: [_jsx("strong", { children: "NFT ID:" }), " DOC", docOpt.nftId.toString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", _jsx("span", { style: { color: '#2ed573' }, children: "\u2713 Verified" })] }), _jsxs("p", { children: [_jsx("strong", { children: "File Hash:" }), " ", docOpt.fileHash] }), _jsx("button", { className: "form-btn download-btn", onClick: () => handleDownloadDocument(i, docOpt.filename), disabled: downloadLoading, children: downloadLoading ? 'Downloading...' : 'Download Document' })] }));
                            return;
                        }
                    }
                    showStatus('retrieve', 'No document found with this NFT ID or you do not have permission to view it', 'error');
                    setShowDocumentPreview(false);
                }
                catch (error) {
                    console.error('Document fetch error:', error);
                    showStatus('retrieve', 'No document found with this NFT ID or you do not have permission to view it', 'error');
                    setShowDocumentPreview(false);
                }
            }
        }
        catch (error) {
            console.error('Fetch error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showStatus('retrieve', `Error fetching document: ${errorMessage}`, 'error');
            setShowDocumentPreview(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "container", children: _jsxs("nav", { children: [_jsxs("a", { href: "./home", className: "logo", children: [_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", stroke: "#b62fb0", strokeWidth: "3" }), _jsx("path", { d: "M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z", fill: "#b62fb0" }), _jsx("path", { d: "M12 8V2", stroke: "#b62fe0", strokeWidth: "3", strokeLinecap: "round" }), _jsx("path", { d: "M16 12H22", stroke: "#b62fe0", strokeWidth: "3", strokeLinecap: "round" })] }), "Certi", _jsx("span", { children: "Node" })] }), _jsxs("div", { className: "nav-links", children: [_jsx("a", { href: "#", children: "Features" }), _jsx("a", { href: "#", children: "How It Works" }), _jsx("a", { href: "#", children: "For Institutions" }), _jsx("a", { href: "#", children: "About" })] }), _jsx("a", { href: "./login", className: "btn btn-secondary", children: "Login / Register" })] }) }), _jsxs("main", { className: "main-content", children: [_jsx("div", { className: "blob blob1" }), _jsx("div", { className: "blob blob2" }), _jsx("div", { className: "container", children: _jsxs("div", { className: "verification-container", children: [_jsxs("div", { className: "verification-sidebar", children: [_jsx("h2", { children: "Document Verification Portal" }), _jsx("p", { children: "Securely verify and store your academic credentials, certificates, and important documents on the blockchain." }), _jsxs("div", { className: "info-box", children: [_jsx("h4", { children: "Why Blockchain Verification?" }), _jsx("p", { children: "Once verified and pushed to the blockchain, your documents become tamper-proof, instantly verifiable, and accessible only with your consent." })] }), _jsxs("div", { className: "info-box", children: [_jsx("h4", { children: "How It Works" }), _jsx("p", { children: "Upload your document, our AI verifies its authenticity, then it's stored securely on the Internet Computer Protocol blockchain with a unique NFT ID." })] })] }), _jsxs("div", { className: "verification-content", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Document Management System" }), _jsx("p", { children: "Upload, verify, and retrieve your important documents" })] }), _jsxs("div", { className: "tab-header", children: [_jsx("button", { className: `tab-btn ${activeTab === 'upload' ? 'active' : ''}`, onClick: () => openTab('upload'), children: "Upload Document" }), _jsx("button", { className: `tab-btn ${activeTab === 'retrieve' ? 'active' : ''}`, onClick: () => openTab('retrieve'), children: "Retrieve Document" })] }), _jsxs("div", { id: "upload", className: `tab-content ${activeTab === 'upload' ? 'active' : ''}`, children: [_jsxs("div", { className: "upload-area", id: "dropZone", ref: dropZoneRef, onClick: () => fileInputRef.current?.click(), onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, children: [_jsx("p", { children: "Drag & Drop your document here or click to browse" }), _jsx("input", { type: "file", id: "fileInput", ref: fileInputRef, style: { display: 'none' }, accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png", onChange: handleFileInputChange })] }), uploadStatus.message && (_jsx("div", { ref: uploadStatusRef, className: `status ${uploadStatus.type}`, children: uploadStatus.message })), _jsx("button", { id: "uploadButton", className: "form-btn", onClick: handleUploadDocument, disabled: !currentFile, children: "Upload Document" }), _jsx("button", { id: "verifyButton", className: "form-btn", onClick: handleVerify, disabled: !currentDocId, children: "Verify Your Document" }), _jsx("button", { id: "pushButton", className: "form-btn", disabled: !verified, onClick: handlePushToBlockchain, children: "Push to Blockchain" }), _jsx("button", { id: "fetchNFTButton", className: "form-btn", disabled: !currentNFTId, onClick: handleFetchNFTId, children: "Fetch NFT ID" }), showNftResult && (_jsxs("div", { id: "nftResult", className: "nft-box", children: [_jsx("p", { children: "Your document has been successfully stored on the blockchain" }), _jsx("p", { children: "NFT ID:" }), _jsx("div", { id: "nftIdDisplay", className: "nft-id", children: currentNFTId || '-' }), _jsx("p", { children: "Store this ID safely to retrieve your document later" })] }))] }), _jsxs("div", { id: "retrieve", className: `tab-content ${activeTab === 'retrieve' ? 'active' : ''}`, children: [_jsxs("div", { className: "input-group", children: [_jsx("label", { htmlFor: "nftIdInput", children: "Enter your NFT ID:" }), _jsx("input", { type: "text", id: "nftIdInput", placeholder: "e.g., DOC123456", value: nftIdInput, onChange: (e) => setNftIdInput(e.target.value) })] }), _jsx("button", { id: "fetchDocumentButton", className: "form-btn", onClick: handleFetchDocument, children: "Fetch Document" }), retrieveStatus.message && (_jsx("div", { ref: retrieveStatusRef, className: `status ${retrieveStatus.type}`, children: retrieveStatus.message })), showDocumentPreview && (_jsxs("div", { id: "documentPreview", className: "document-preview", children: [_jsx("h3", { children: "Document Information" }), _jsx("div", { id: "previewContent", children: previewContent })] }))] })] })] }) })] }), _jsx("footer", { children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "footer-links", children: [_jsx("a", { href: "#", children: "Privacy Policy" }), _jsx("a", { href: "#", children: "Terms of Service" }), _jsx("a", { href: "#", children: "Contact Us" }), _jsx("a", { href: "#", children: "FAQ" })] }), _jsx("p", { className: "copyright", children: "\u00A9 2025 CertChain. Powered by Internet Computer Protocol." })] }) })] }));
};
export default Upload;
