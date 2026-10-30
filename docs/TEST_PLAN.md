# Manual test plan — Room Finder

Do not treat this file as proof that every row was executed. Rows under **Executed during development** were run on this machine. Rows under **To verify on your PC** still need you (MongoDB Atlas credentials are private).

## Executed during development

| Test | Result |
| --- | --- |
| Project folder created at Documents/room-finder | Pass |
| `npm install` | See session notes in the final chat message |
| `node --check server.js` and syntax check of scripts | See session notes |
| Server start without valid `MONGODB_URI` | Expected fail with a configuration message |
| Browser visual pass of static HTML | Only possible after the server is connected to MongoDB |

## To verify on your PC (after Atlas is configured)

1. **Startup**  
   `npm start` prints `Connected to MongoDB` and `Room Finder running at http://localhost:3000`. Open the home page.

2. **Seed**  
   `npm run seed`. Home page shows latest SAMPLE listings for Patna and other cities.

3. **Browse without login**  
   Open listings, search city `Patna`, min rent `4000`, max rent `8000`. Open a card. Confirm SAMPLE banner if it is seed data.

4. **Copy contact**  
   On a details page, click **Copy contact number**. Expect a success message (clipboard permission may be required).

5. **Register / validation**  
   Register with a short password → error. Valid register → role page.

6. **Role**  
   Choose Student/User → profile. Log out, register another user, choose Owner → owner dashboard.

7. **Login errors**  
   Wrong password → “Invalid email or password.” Admin email on `/login.html` → told to use admin login.

8. **Owner CRUD**  
   Add listing with 1 photo. It appears publicly. Edit title. Delete it. Try to change another owner’s listing via URL → error.

9. **Photos**  
   5 files or a file larger than 2 MB or a `.txt` file → rejected by the server.

10. **Admin**  
    `npm run create-admin`, `/admin-login.html`, remove a listing (it disappears from public browse), deactivate a user (that user cannot log in).

11. **Mobile**  
    Resize the browser below 700px: nav menu, stacked cards, usable forms.

12. **Security spot checks**  
    Call `GET /api/admin/users` while logged in as a student → 401/403. Password hashes never appear in API JSON.
