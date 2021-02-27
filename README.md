# Brighthive Secure File Uploader Example

A quick and dirty file uploader example using [Brighthive](https://github.com/brighthive)'s secure file uploader backend.

## About

This simple application demonstrates how a front-end web application may interact with [Brighthive](https://github.com/brighthive)'s Secure File Uploader API.

**Disclaimer:** This application is strictly for demonstration purposes and should not be used in a production setting.

## About the File Uploader

The file uploader exposes a REST API that allows users to upload files in a single thread or multipart upload mode. All uploaded files are stored in a secure AWS S3 bucket.

### Single Thread Upload Mode

Single thread upload mode attempts to upload a file with a single API call to retrieve a secure presigned URL. It is the simplest workflow for clients, but does not allow for optimizing uploads by parallelization. It also does not provide any hooks for determining the progress of the upload. In effect, single thread mode is a blocking operation that should only be used for relatively small files.

![Single Thread File Uploader](./screenshots/SingleFileUpload.gif)

### Multipart Upload Mode

Multipart upload mode allows users to upload files in discrete chunks. It is the more complex workflow because it requires file chunking to be done client side and leaves the management of the entire upload process up to the web client. On the upside, this mode allows for parallelization and the ability to infer upload progress from the API. This is the more suitable mode for large files.

![Multipart File Uploader](./screenshots/MultiPartUpload.gif)

## Demo Project

The demo project demonstrates both upload modes. The 