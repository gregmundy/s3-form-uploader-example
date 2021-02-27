import React, { useState, useEffect } from "react";
import { uploadSingle } from "../services/services";

const SingleUploadForm = () => {
  const [uploadFile, updateUploadFile] = useState(null); // file object to upload to s3
  const [isUploading, toggleUploading] = useState(false); // whether or not is uploading
  const [uploadSuccess, toggleUploadSuccess] = useState(undefined);

  const handleFileSelected = (evt) => {
    updateUploadFile(evt.target.files[0]);
  };

  const handleFileUpload = () => {
    uploadSingle(uploadFile, toggleUploading, toggleUploadSuccess);
  };

  useEffect(() => {
    if (!isUploading && uploadSuccess !== undefined) {
      // Clear the upload success (or failure) message.
      setTimeout(() => {
        toggleUploadSuccess(undefined);
        updateUploadFile(null);
      }, 10000);
    }
  }, [isUploading, uploadSuccess]);

  return (
    <div className="container">
      <div className="col-md-6">
        <form method="post" encType="multipart/form-data">
          <div className="form-group files">
            <h2>Single File Upload</h2>
            <input
              type="file"
              className="form-control"
              onChange={handleFileSelected}
            />
          </div>
        </form>
        <button
          type="button"
          className="btn btn-success btn-block"
          onClick={handleFileUpload}
          disabled={uploadFile === null}
        >
          Upload to S3
        </button>
        {isUploading && <p style={{ textAlign: "center" }}>Uploading...</p>}
        {uploadSuccess === true && (
          <p
            style={{
              textAlign: "center",
              color: "green",
              fontWeight: "bold",
            }}
          >
            Upload Successful!
          </p>
        )}
        {uploadSuccess === false && (
          <p
            style={{
              textAlign: "center",
              color: "green",
              fontWeight: "bold",
            }}
          >
            Upload Failed :-(
          </p>
        )}
      </div>
    </div>
  );
};

export default SingleUploadForm;
