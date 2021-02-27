import axios from "axios";

const s3ServiceUrl = process.env.REACT_APP_S3_SERVICE_URL;
const clientId = process.env.REACT_APP_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
const oauth2Url = process.env.REACT_APP_OAUTH2_URL;
const grantType = process.env.REACT_APP_GRANT_TYPE;

async function getAccessToken() {
  const options = {
    headers: { "content-type": "application/json" },
  };

  const data = {
    client_id: `${clientId}`,
    client_secret: `${clientSecret}`,
    grant_type: `${grantType}`,
  };

  try {
    const response = await axios.post(oauth2Url, data, options);
    if (response.status === 200) {
      return response.data.access_token;
    }
  } catch (error) {
    console.log(error);
  }
}

async function uploadMultiPart(uploadFile, progressCallback) {
  // Set the default chunk size to 10 MB
  // NOTE: AWS has a minimum chunk size limit of 5MB for all chunks except the last one.
  // For this demonstration, we assume a chunk size of 10MB. The developer is free to choose
  // a reasonable file size.
  const chunkSize = 10 * 1024 * 1024; // AWS has a minimum chunk size of 5MB for all chunks except the last one, which can be any size.

  // Step 1 - Get the number of parts the file needs to be broken up into
  // NOTE: Round up to the nearest full integer.
  const uploadParts = Math.ceil(uploadFile.size / chunkSize);

  // Step 2 - Request the number of pre-signed urls needed
  // NOTE: This is a call to the Brightive Upload Service API
  const uploadRequest = {
    action: "MULTIPART",
    payload: {
      fileName: uploadFile.name,
      uploadParts: uploadParts,
    },
  };

  // DON'T DO THIS IN PRODUCTION!
  let accessToken = await getAccessToken();
  let options = {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  };
  let response = await axios.post(s3ServiceUrl, uploadRequest, options);

  // A list of pre-signed urls to use for uploading.
  const preSignedUrls = response.data.body.preSignedUrls;

  // The upload id for the interaction. This is provided by the API as a convenience
  // since it will be needed to finalize an upload
  const uploadId = response.data.body.uploadId;

  // Step 3 - Break file in to chunk and upload each chunk!
  // NOTE: In this demonstration, we are doing the uploads sequentially with
  // no error checking along the way. The developer can parallelize the upload and add
  // whatever custom error handling they choose.

  let currentChunkStartByte = 0;
  let currentChunkFinalByte =
    chunkSize > uploadFile.size ? uploadFile.size : chunkSize;
  let successfulUpload = true;

  // Need to keep track of the eTags returned from each upload step
  const eTags = [];

  // Iterate over the list of pre-signed url and upload.
  for (let i = 0; i < preSignedUrls.length; i++) {
    console.log(preSignedUrls[i]);
    let chunk = uploadFile.slice(currentChunkStartByte, currentChunkFinalByte);

    try {
      response = await axios.put(preSignedUrls[i], chunk);

      // Each eTag must be formatted in this way in order to work.
      eTags.push({
        ETag: response.headers.etag,
        PartNumber: i + 1,
      });
    } catch (err) {
      successfulUpload = false;
    }

    progressCallback({
        totalParts: preSignedUrls.length,
        lastUploadedPart: i + 1,
        status: successfulUpload,
        totalFileSize: uploadFile.size,
        uploadChunkSize: chunk.size,
    });

    let remainingBytes = uploadFile.size - currentChunkFinalByte;
    if (currentChunkFinalByte === uploadFile.size) {
      console.log("Upload complete");

      if (!successfulUpload) {
        // If any part of the upload failed, cancel it!
        console.log("Upload failed");
        const cancelUploadRequest = {
          action: "CANCEL_MULTIPART",
          payload: {
            fileName: uploadFile.name,
            uploadId: uploadId,
          },
        };
        accessToken = await getAccessToken();
        options = {
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        };
        response = await axios.post(s3ServiceUrl, cancelUploadRequest, options);
        console.log(response.data.body.message);
      } else {
        console.log("Upload succeeded!");
        const completeUploadRequest = {
          action: "COMPLETE_MULTIPART",
          payload: {
            fileName: uploadFile.name,
            uploadId: uploadId,
            parts: eTags,
          },
        };

        accessToken = await getAccessToken();
        options = {
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        };
        response = await axios.post(
          s3ServiceUrl,
          completeUploadRequest,
          options
        );
        console.log(response.data.body.message);
      }
    } else if (remainingBytes < chunkSize) {
      currentChunkStartByte = currentChunkFinalByte;
      currentChunkFinalByte = currentChunkStartByte + remainingBytes;
    } else {
      currentChunkStartByte = currentChunkFinalByte;
      currentChunkFinalByte = currentChunkStartByte + chunkSize;
    }
  }
}

export { getAccessToken, uploadMultiPart };
