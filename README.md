# Simple Google Drive

![Simple Google Drive](./screenshots/Screenshot%202024-06-02%20184455.png)

## Description

Build a simple cloud application this is similar to Google Drive.

- User should be able to login with email and password
- After logging in, user should be able to see the list of uploaded files and folders in table
  - Table format: No, Name, Uploaded At, Action Menu [Delete, Rename, Compress, Download]
- User should be able to see file content (_.txt, _.png) by double clicking the table row
- User should be able to enter the folder's content by double clicking the table row
  Put "Go to parent" row as the first row in the table
- Deleting file (folder) should move it to "Recycle Bin" that has expiration time of 5 mins
  - User should be able to recover from the "Recycle Bin" and they will appear in the original directory
  - After expiration time, they will be permanently deleted
- User should be able to upload multiple files or folders
- Compressing file (folder) will generate a zip file to the current directory
- User should be able to download file or folder
  - As for folders, it will be downloaded in \*.zip file
    (Notes: URL path should reflect the current directory)

## Challenges

- How to structure the paths of nested files when updating, deleting, renaming them
- How to show the images and png files
- How to compress files and folders backend uisng JSZip.

## Solutions

- Attach the nested paths and save them on the MongoDB when modifying the files and folder strucutre
- Render the images to analyze hte binary data
- Use JsZip library on the backend

## Environment

### Prerequisites

- Windows 10 or Windows 11
- Node v18.19.0 or higher version
- Npm 10.2.3 or higher version

### Tech stacks

- Vite + React + Typescript
- Express
- MongoDB

### Steps to run program

1. Install node modules

   ```shell
   npm install
   ```

2. Run project
   ```shell
   npm run dev
   ```
   This will host the project on http://localhost:3000.

### Usage

A simple google drive that is used to upload multiple files and folders for disaster recovery

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
