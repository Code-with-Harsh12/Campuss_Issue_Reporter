# Campus Issue Reporter

A beginner-friendly college mini-project built with HTML, CSS, JavaScript, Google Apps Script, and Google Sheets.

## Project Overview
This project allows students to submit campus maintenance complaints without login. The admin can view all complaints, update status, and send resolution emails when a complaint is resolved.

The student form is grouped into three simple sections: student details, issue location, and issue description. Common universities, courses, branches, sections, and buildings are available in dropdowns. Selecting `Other` reveals a field for a custom value.

## Technology Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Google Apps Script
- Data Storage: Google Sheets
- Email: Google Apps Script MailApp
- Hosting: GitHub Pages for the static frontend website

## Project Files
- `index.html` — public student complaint form
- `style.css` — student page styling
- `script.js` — student form validation and API request logic
- `admin.html` — private admin dashboard
- `admin.css` — admin dashboard styling
- `admin.js` — admin login, complaint listing, and status update logic
- `Code.gs` — Google Apps Script backend

Student reports include the student's current semester. The form suggests `1 Sem` through `8 Sem` and also allows typing a value. The Apps Script stores it in the `Current Semester` sheet column and adds that column automatically when it detects the original project headers. After changing `Code.gs`, update the deployed Apps Script web app to a new version so the live form can save the new field.

The staff dashboard has a filter button for searching complaint details and filtering by university, building, floor, room/location, and submission date range. University, building, and floor filters use the same preset choices as the student form, including an `Other` option for custom entries. These filters run in the browser on the complaint records already loaded by the dashboard and do not require Apps Script changes.

## Setup Instructions
### Run the website locally
The frontend is made of static files, so opening the browser launch configuration alone does not start a web server.
1. In VS Code, install the **Live Server** extension if it is not already installed.
2. Open `index.html` and select **Go Live** in the status bar (or right-click the file and select **Open with Live Server**).
3. Open `http://localhost:8080/`. The workspace configures Live Server to use port `8080`, matching the VS Code browser launch configuration.
4. Open the admin page at `http://localhost:8080/admin.html`.

If the browser says `ERR_CONNECTION_REFUSED`, start Live Server first and check that its status bar shows it is running on port `8080`.

### 1. Create the Google Sheet
1. Open Google Drive.
2. Click New > Google Sheets.
3. Give the spreadsheet a name you recognize, such as `SRGC Campus Issue Reports`.
4. The Apps Script creates a sheet tab named `CampusIssueReporter` with the required columns when the first request is received. Do not rename that tab.
5. Use a new blank spreadsheet for this setup. Do not reuse a sheet with old test data.

### 2. Open Apps Script Editor
1. In the spreadsheet, click Extensions > Apps Script.
2. A new Apps Script tab will open.
3. Delete any default code and paste the contents of `Code.gs`.

### 3. Update Required Values
1. In Apps Script, click **Project Settings** (the gear icon).
2. Find **Script Properties** and click **Add script property**.
3. Add a property named `ADMIN_PASSWORD` and set its value to a new, private password. Do not reuse a password already shared in chat or used for another account.
4. Save the property. Do not put the password in `script.js`, `admin.js`, or any public website file.
5. Keep the Apps Script project and spreadsheet limited to authorized administrators. The Apps Script sends administrator notifications to `avi*******@gmail.com`, and the dashboard requires that email address together with the shared password. Entering the email is an identifier check, not Google sign-in or proof of ownership; this password-based dashboard is not strong authentication for sensitive, real-world records.

### 4. Deploy as a Web App
1. In Apps Script, click **Deploy > New deployment**.
2. Choose Web app.
3. Set the app to execute as: Me.
4. Set who has access to **Anyone** so students can submit without signing in. The script requires the configured admin email and dashboard password for admin actions, but this password-based dashboard is for a demonstration, not production-sensitive information.
5. Click Deploy.
6. Copy the generated web app URL.
7. Paste this URL into both `script.js` and `admin.js` in place of `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`.

### 5. Create the Frontend Files
1. Create a new folder on your computer.
2. Save the frontend files there:
   - `index.html`
   - `style.css`
   - `script.js`
   - `admin.html`
   - `admin.css`
   - `admin.js`
3. Replace the placeholder web app URL in both JavaScript files.

### 6. Host the Website
A simple option for beginners is GitHub Pages.
1. Create a GitHub account.
2. Upload the frontend files to a public GitHub repository.
3. Open the repository settings.
4. Go to Pages.
5. Select the main branch and root folder.
6. Save and wait for the site to publish.

### 7. Test the System
1. Open the student website.
2. Fill out the complaint form.
3. Submit a test complaint.
4. Check the Google Sheet for the new record.
5. Confirm the admin email is received.
6. Open the admin dashboard and log in with the admin password.
7. Update a complaint to `Resolved`.
8. Check whether the student gets the resolution email.

## Admin Dashboard Password
The admin dashboard checks a shared password stored in Apps Script Project Settings under Script Properties. This is suitable only for a beginner demonstration, not an enterprise-level security system.

## Notes and Limitations
- Google Apps Script has email limits and may not deliver every message instantly.
- This project is designed for a college mini-project and not for a large real-world campus system.
- The public website can be opened by anyone. The Apps Script submission endpoint is also publicly reachable, so basic validation and duplicate checks cannot prevent all spam or abuse.
- Keep spreadsheet sharing restricted to authorized staff. Do not treat the shared-password admin page as secure access control for sensitive real student information.

## Future Scope
- Add complaint filtering by status
- Add search by student roll number
- Add PDF export or report generation
- Add automated dashboard charts
- Add an advanced admin authentication system

## License
For academic college project use.
