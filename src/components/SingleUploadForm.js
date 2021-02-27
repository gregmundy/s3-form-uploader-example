import React, { useState } from "react";
import axios from "axios";
import { getAccessToken } from "../services/services";

const SingleUploadForm = () => {
  const [uploadFile, updateUploadFile] = useState(null); // file object to upload to s3
  const [isUploading, toggleUploading] = useState(false); // whether or not is uploading
  const [uploadSuccess, toggleUploadSuccess] = useState(undefined);

  const s3ServiceUrl = process.env.REACT_APP_S3_SERVICE_URL;

  const handleFileUpload = (evt) => {
    updateUploadFile(evt.target.files[0]);
  };

  async function uploadSingleToS3() {
    try {
      let accessToken = await getAccessToken();
      toggleUploading(true);

      const options = {
        headers: { Authorization: `Bearer ${accessToken}` },
      };

      // Give file a name based on agreed upon format to allow for parsing.
      const response = await axios.post(
        s3ServiceUrl,
        {
          action: "SINGLE",
          payload: {
            fileName: uploadFile.name,
          },
        },
        options
      );

      const url = response.data.body.url;
      const fields = response.data.body.fields;
      const formData = new FormData();

      // add keys from S3 pre-signed url response to form data
      Object.keys(fields).forEach((key) => {
        formData.append(key, fields[key]);
      });

      formData.append("file", uploadFile);

      // upload to the pre-signed url via a POST
      await axios.post(url, formData);
      toggleUploading(false);
      updateUploadFile(null);
      toggleUploadSuccess(true);
    } catch (err) {
      console.log(`The following error occured ${err}`);
      toggleUploading(false);
      updateUploadFile(null);
      toggleUploadSuccess(false);
    }

    // Clear the upload success (or failure) message.
    setTimeout(() => {
      toggleUploadSuccess(undefined);
    }, 10000);
  }

  return (
    <div className="container">
      <div className="col-md-6">
        <form method="post" encType="multipart/form-data">
          <div className="form-group files">
            <h2>Single File Upload</h2>
            <input
              type="file"
              className="form-control"
              onChange={handleFileUpload}
            />
          </div>
        </form>
        <button
          type="button"
          className="btn btn-success btn-block"
          onClick={uploadSingleToS3}
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
