# 6_1_hometask

Google_Drive

## Requirements

- User should be able to login with email and password
- After logging in, user should be able to see the list of uploaded files and folders in table
  - Table format: No, Name, Uploaded At, Action Menu [Delete, Rename, Compress, Download]
- User should be able to see file content (_.txt, _.png) by double clicking the table row
- User should be able to enter the folder's content by double clicking the table row
  - Put "Go to parent" row as the first row in the table
- Deleting file (folder) should move it to "Recycle Bin" that has expiration time of 5 mins
  - User should be able to recover from the "Recycle Bin" and they will appear in the original directory
  - After expiration time, they will be permanently deleted
- User should be able to upload multiple files or folders
- Compressing file (folder) will generate a zip file to the current directory
- User should be able to download file or folder
  - As for folders, it will be downloaded in \*.zip file
    (Notes: URL path should reflect the current directory)
