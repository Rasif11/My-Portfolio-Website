# Setup guide — put your website online (about 15 minutes)

You need two free accounts: **GitHub** (stores your files) and **Netlify** (runs your website). You never type any code.

> **Important:** Netlify's "drag a folder onto the page" upload does **not** switch on the Admin Panel's server part. You must connect the site **from GitHub** as shown below.

## Part 1 — Put the files on GitHub
1. Go to **github.com** and click **Sign up**. Create a free account and confirm your email.
2. Unzip `rasif-portfolio.zip` on your computer. You will see a folder named `rasif-portfolio`. Open it: the files you upload are the ones **inside** it (`index.html`, `admin`, `assets`, `netlify`, …).
3. On GitHub, click the **+** at the top right, then **New repository**.
4. Repository name: type `my-website`. Choose **Private**. Click the green **Create repository** button.
5. On the next page click the link **uploading an existing file**.
6. Open your unzipped folder, select **everything inside it** (Ctrl+A / Cmd+A) and drag it into the GitHub page. Wait until every file shows as uploaded (the `netlify`, `assets`, `admin`, `lib`, `data`, `src` and `tools` folders must all be there).
7. Scroll down and click the green **Commit changes** button.

## Part 2 — Connect it to Netlify
1. Go to **app.netlify.com** and click **Sign up**, then **Sign up with GitHub**. Allow access.
2. Click **Add new site**, then **Import an existing project**.
3. Click **Deploy with GitHub**, then choose your `my-website` repository.
4. Leave **Build command** empty. Leave **Publish directory** as it is (the file `netlify.toml` already sets it). Click **Deploy**.
5. Wait about a minute until the status says **Published**. Click the green link at the top to see your website.
6. To check the server part is on: in Netlify click **Logs → Functions** (or **Functions**). You should see one function called **api**. If you do not, you did a folder drag-and-drop — repeat Part 1 and Part 2.

## Part 3 — First login (do this straight away)
1. Open `your-site-address/admin/` (add `/admin/` to the end of your website address).
2. Sign in with username **admin** and password **ChangeMe123!**
3. Click **Admin Account** in the left menu, enter the current password, choose a new username and a **new password of at least 10 characters**, and click **Update account**.
4. Open each section on the left, change the text, and press **Save changes**. Changes appear on the website straight away.

## Things to know
- **Messages** from your Contact page arrive in **Inbox** in the Admin Panel.
- **Images:** every picture field has a **Choose** button where you can upload a new image (PNG, JPG, GIF, WEBP or SVG, up to 3 MB).
- **Forgot your password?** In Netlify open **Blobs**, open the store called **site** and delete the entry **auth.json**. Then sign in again with the default login above and change it at once.
- **Your own web address:** in Netlify choose **Domain management → Add a domain**.
- **Updating the files later:** in GitHub open the file, click the pencil icon, change it and click **Commit changes**; Netlify republishes by itself.
- The pages first show the text that was built into the files, then update to your saved text a moment later. That is normal.
