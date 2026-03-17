# manual Push Guide for Bag Søjlen Restaurant

Follow these steps to push your changes to GitHub manually using the terminal.

### 1. Check Your Changes
See what files have been modified:
```powershell
git status
```

### 2. Stage Your Changes
Add all changes to the staging area:
```powershell
git add .
```
*Wait, if you want to add specific files only:*
```powershell
git add pages/ManageReservation.tsx
```

### 3. Commit Your Changes
Create a snapshot of your changes with a descriptive message:
```powershell
git commit -m "feat: implement Order ID generation and date-time rescheduling"
```

### 4. Pull Latest Changes (Optional but Recommended)
To avoid conflicts, pull the latest changes from the remote repository:
```powershell
git pull origin main
```

### 5. Push to GitHub
Finally, push your local commits to the remote repository:
```powershell
git push origin main
```

---

### Common Issues
- **Authentication**: If prompted, you may need to log in via your browser or use a Personal Access Token (PAT).
- **Conflicts**: If `git pull` shows conflicts, you must resolve them in your editor before committing and pushing again.
- **Wrong Branch**: Ensure you are on the `main` branch (or your active branch) by checking `git branch`.
