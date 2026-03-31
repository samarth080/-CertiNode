import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Error "mo:base/Error";
// Correct import for the management canister
import ICTypes "../lib/ICTypes";

actor AcademicCertificate {

  type Document = {
    id: Nat;
    owner: Principal; 
    filename: Text;
    fileHash: Text;
    verified: Bool;
    nftId: ?Nat;
  };

  stable var documents : [Document] = [];
  stable var nextDocId : Nat = 1;
  stable var nextNftId : Nat = 1;

  // Actor reference for the IC management canister
  let ic : actor {
    http_request : ICTypes.HttpRequestArgs -> async ICTypes.HttpResponsePayload;
  } = actor "aaaaa-aa";

  public shared(msg) func uploadDocument(filename: Text, fileHash: Text) : async Nat {
    // Get caller principal from message context
    let caller = msg.caller;
    let doc = {
      id = nextDocId;
      owner = caller;
      filename = filename;
      fileHash = fileHash;
      verified = false;
      nftId = null;
    };
    documents := Array.append(documents, [doc]);
    let docId = nextDocId;
    nextDocId += 1;
    Debug.print("Document uploaded: " # filename);
    return docId;
  };

  // Helper function to find a document index
  private func findDocumentIndex(docId: Nat) : ?Nat {
    var i = 0;
    for (doc in documents.vals()) {
      if (doc.id == docId) {
        return ?i;
      };
      i += 1;
    };
    return null;
  };

  // This function will call your Flask API via HTTPS outcall
  // and get the AI-based verification result
  public func callFlaskVerificationApi(base64Image: Text) : async Bool {
    let host = "your-flask-domain.com"; // Replace with your actual Flask API domain
    let url = "https://" # host # "/verify";

    let jsonBody = "{\"image\": \"" # base64Image # "\"}";

    let request_headers = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Host"; value = host },
      { name = "User-Agent"; value = "icp-verifier" }
    ];

    let request : ICTypes.HttpRequestArgs = {
      url = url;
      max_response_bytes = ?2000; // Limit response size
      headers = request_headers;
      body = ?Text.encodeUtf8(jsonBody);
      method = #post;
      transform = null; // Simplified for now
    };

    // Assign cycles for outbound HTTPS call with system capability explicitly marked
    Cycles.add<system>(300_000_000_000);

    try {
      let res = await ic.http_request(request);
      let bodyText = switch (Text.decodeUtf8(res.body)) {
        case (null) "";
        case (?txt) txt;
      };

      Debug.print("Flask Response Body: " # bodyText);

      // Simple JSON parser (use a proper parser in production)
      if (Text.contains(bodyText, #text "\"verified\":true")) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Debug.print("Error calling Flask API: " # Error.message(error));
      return false;
    };
  };

  // Updated verifyDocument function to use the Flask API
  public func verifyDocument(docId: Nat, base64Image: Text) : async Bool {
    let indexOpt = findDocumentIndex(docId);
    
    switch (indexOpt) {
      case (?index) {
        if (index < documents.size()) {
          // Call Flask API for verification
          let isVerified = await callFlaskVerificationApi(base64Image);
          
          if (not isVerified) {
            Debug.print("Document verification failed by AI system");
            return false;
          };
          
          var updatedDocs : [Document] = [];
          var i = 0;
          
          for (doc in documents.vals()) {
            if (i == index) {
              let updatedDoc = {
                id = doc.id;
                owner = doc.owner;
                filename = doc.filename;
                fileHash = doc.fileHash;
                verified = true;
                nftId = doc.nftId;
              };
              updatedDocs := Array.append(updatedDocs, [updatedDoc]);
            } else {
              updatedDocs := Array.append(updatedDocs, [doc]);
            };
            i += 1;
          };
          
          documents := updatedDocs;
          Debug.print("Document verified: " # Nat.toText(docId));
          return true;
        } else {
          Debug.print("Document index out of bounds: " # Nat.toText(docId));
          return false;
        };
      };
      case (null) {
        Debug.print("Document not found: " # Nat.toText(docId));
        return false;
      };
    };
  };

  public func mintCertificateNFT(docId: Nat) : async ?Nat {
    let indexOpt = findDocumentIndex(docId);
    
    switch (indexOpt) {
      case (?index) {
        if (index < documents.size()) {
          let doc = documents[index];
          
          if (not doc.verified) {
            Debug.print("Document not verified yet.");
            return null;
          };
          
          if (doc.nftId != null) {
            Debug.print("NFT already issued.");
            return doc.nftId;
          };
          
          let nftId = nextNftId;
          nextNftId += 1;
          
          var updatedDocs : [Document] = [];
          var i = 0;
          
          for (d in documents.vals()) {
            if (i == index) {
              let updatedDoc = {
                id = d.id;
                owner = d.owner;
                filename = d.filename;
                fileHash = d.fileHash;
                verified = d.verified;
                nftId = ?nftId;
              };
              updatedDocs := Array.append(updatedDocs, [updatedDoc]);
            } else {
              updatedDocs := Array.append(updatedDocs, [d]);
            };
            i += 1;
          };
          
          documents := updatedDocs;
          Debug.print("NFT minted with ID: " # Nat.toText(nftId));
          return ?nftId;
        } else {
          Debug.print("Document index out of bounds.");
          return null;
        };
      };
      case (null) {
        Debug.print("Document not found.");
        return null;
      };
    };
  };

  public query func getDocument(docId: Nat) : async ?Document {
    for (doc in documents.vals()) {
      if (doc.id == docId) {
        return ?doc;
      };
    };
    return null;
  };

  public shared query(msg) func listMyDocuments() : async [Document] {
    // Get caller principal from message context
    let caller = msg.caller;
    return Array.filter<Document>(documents, func(d) { d.owner == caller });
  };
}