import React, { useState, useEffect } from "react";
import { uploadMultiPart } from "../services/services";

const MultiPartUploadForm = () => {
  const [uploadFile, updateUploadFile] = useState(null); // file object to upload to s3
  const [isUploading, toggleUploading] = useState(false); // whether or not is uploading
  const [uploadSuccess, toggleUploadSuccess] = useState(undefined);
  const [progress, updateProgress] = useState(null);
  const [uploadPercentage, updateUploadPercentage] = useState("0%");

  const handleFileSelected = (evt) => {
    updateUploadFile(evt.target.files[0]);
  };

  const handleFileUpload = () => {
    toggleUploading(true);
    uploadMultiPart(uploadFile, updateProgress);
  };

  useEffect(() => {
    if (
      progress !== null &&
      progress.totalParts === progress.lastUploadedPart
    ) {
      toggleUploading(false);
      toggleUploadSuccess(progress.status);

      // Reset everything after 10 seconds
      setTimeout(() => {
        toggleUploadSuccess(undefined);
        updateUploadPercentage("0%");
        updateUploadFile(null);
      }, 10000);
    }

    const percentComplete =
      progress !== null
        ? `${progress.lastUploadedPart / progress.totalParts}`
        : "0%";

    const currentPercent = Math.ceil(percentComplete * 100);
    if (!isNaN(currentPercent)) {
        updateUploadPercentage(`${currentPercent}%`);
    }
    // console.log(Math.ceil(percentComplete) * 100);
  }, [progress]);

  return (
    <div className="container">
      <div className="col-md-6">
        <form method="post" encType="multipart/form-data">
          <div className="form-group files">
            <h2>Multipart File Upload</h2>
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

        <div className="progress" style={{ marginTop: "5px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: uploadPercentage }}
            aria-valuenow={{ uploadPercentage }}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {uploadPercentage}
          </div>
        </div>

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

export default MultiPartUploadForm;
