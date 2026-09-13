const puppeteer = require('puppeteer');
const path = require('path');

const doc1Html = `
<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a1a;
    line-height: 1.45;
    padding: 40px 48px;
    font-size: 9.2pt;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 8px;
    margin-bottom: 18px;
  }

  .header h1 {
    font-size: 16pt;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .header .subtitle {
    font-size: 8.5pt;
    color: #666;
    font-weight: 500;
  }

  .section-title {
    font-size: 9.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #1a1a1a;
    margin-top: 14px;
    margin-bottom: 6px;
    padding-bottom: 3px;
    border-bottom: 1px solid #d0d0d0;
  }

  .item-title {
    font-weight: 600;
    color: #111;
  }

  .item {
    margin-bottom: 6px;
    text-align: justify;
  }

  .tag {
    display: inline-block;
    background: #f0f0f0;
    color: #333;
    font-size: 7pt;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 3px;
    margin-right: 4px;
    vertical-align: middle;
    letter-spacing: 0.3px;
  }

  .footer {
    position: fixed;
    bottom: 30px;
    left: 48px;
    right: 48px;
    text-align: center;
    font-size: 7pt;
    color: #999;
    border-top: 1px solid #e0e0e0;
    padding-top: 6px;
  }
</style>
</head>
<body>

<div class="header">
  <h1>Omnimise &mdash; Technical Product Review</h1>
  <span class="subtitle">Document 1 of 2</span>
</div>

<div class="section-title">Backend &amp; System Improvements</div>

<div class="item">
  <span class="item-title">1. Selective Disclosure for Credentials</span> &mdash;
  Right now if you share a credential, the other person sees everything in it. Like if someone just needs to check your age, they'd still end up seeing your full passport number, which is not great. Omnimise should let users prove specific claims — like "I'm over 21" or "I graduated from IIT Bombay" — without revealing the full document. This can be done by breaking credentials into individually signed fields, so you only share the exact fields you want to.
</div>

<div class="item">
  <span class="item-title">2. Telemetry Stack Cleanup</span> <span class="tag">CHARLES PROXY FINDING</span> &mdash;
  So I intercepted the app's network traffic using Charles Proxy and found that it's talking to a bunch of third-party services at the same time — ad trackers, multiple analytics tools, and error logging services. For an app that's supposed to be all about data privacy, sending user data through ad trackers doesn't really make sense. It's also leaking the user's IP address by calling an external API. The fix isn't that complicated: switch to one self-hosted analytics endpoint, remove the ad tracker calls entirely, and just get the IP from the server request headers instead of a third-party call.
</div>

<div class="item">
  <span class="item-title">3. Local-First Device Sync</span> &mdash;
  Since there's no central database, syncing your credentials across phone, smart card, and desktop could easily run into conflicts or even data loss. A good approach would be to use peer-to-peer syncing (like how WebRTC lets devices communicate directly) so your devices can sync with each other over local WiFi or Bluetooth, encrypted, without needing any cloud server in between.
</div>

<div class="section-title">Frontend &amp; UI/UX Improvements</div>

<div class="item">
  <span class="item-title">1. Interactive Consent Sheet for Selective Sharing</span> &mdash;
  When you share a credential right now, it feels all-or-nothing, which can make users uncomfortable. A nicer approach would be a toggle-based permission sheet (kind of like how iOS asks for permissions) where you can check or uncheck individual fields — like showing "Company Name" and "Role" but hiding "Salary." You could even add a trust score indicator that shows how the verification strength changes as you toggle fields on and off.
</div>

<div class="item">
  <span class="item-title">2. Haptic Feedback and Verification Animations for Physical Taps</span> &mdash;
  When you tap the Omnimise Card or Ring at a checkpoint, there's no real feedback — no vibration, no animation, nothing. It feels kinda dead. Adding a nice glassmorphic success popup along with different vibration patterns (like a quick double-buzz for success, a long vibration for retry) would make the whole interaction feel much more responsive and polished.
</div>

<div class="item">
  <span class="item-title">3. Live Resume Editor with Drag-and-Drop</span> &mdash;
  The resume generation is automated which is cool, but tweaking it means you have to keep exporting and re-exporting. It would be way better to have a split-screen editor — your credential blocks on the left side, and a live PDF preview on the right. You could drag and drop sections, reorder stuff, toggle things on and off, and the preview updates in real time. A QR code in the footer would link back to the verified version.
</div>

<div class="section-title">Full-Stack Feature Suggestions</div>

<div class="item">
  <span class="item-title">1. Verified BGV Portal for HR Teams</span> &mdash;
  Basically a dashboard for recruiters where they can set what they want to verify (e.g., "3 years at Stripe as an Engineer"). The candidate gets a push notification on their phone, approves the specific fields from their app, and the recruiter's dashboard shows a green "Verified" checkmark. The important part: no candidate personal data is stored on the company's servers.
</div>

<div class="item">
  <span class="item-title">2. Family Loops: Shared Encrypted Vaults</span> &mdash;
  Think of it as a shared folder but with proper encryption. You'd see family member profiles and shared document folders in a drag-and-drop interface. The encryption keys are managed so that only members added to the group can decrypt the files. Files are stored in the cloud, but only the family members in the loop have access.
</div>

<div class="item">
  <span class="item-title">3. Rotating QR Codes for In-Person Verification</span> &mdash;
  For in-person verification (like when someone is doing a background check face-to-face), the app shows a rotating QR code that refreshes every 30 seconds with a countdown timer around it. A WebSocket connection handles the real-time handshake between the scanner and the app, but the actual credential data is end-to-end encrypted so even the backend can't see what's being shared.
</div>

<div class="footer">Omnimise Technical Product Review &bull; Rajiv Agarwal &bull; June 2026</div>

</body>
</html>
`;

const doc2Html = `
<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a1a;
    line-height: 1.35;
    padding: 24px 36px;
    font-size: 8.2pt;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 4px;
    margin-bottom: 10px;
  }

  .header h1 {
    font-size: 14pt;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  .header .subtitle {
    font-size: 8pt;
    color: #666;
    font-weight: 500;
  }

  .section-title {
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #1a1a1a;
    margin-top: 10px;
    margin-bottom: 4px;
    padding-bottom: 2px;
    border-bottom: 1px solid #d0d0d0;
  }

  .item-title {
    font-weight: 600;
    color: #111;
  }

  .item {
    margin-bottom: 4px;
    text-align: justify;
  }

  .sub-label {
    font-weight: 600;
    font-size: 8pt;
    color: #444;
  }

  .footer {
    position: fixed;
    bottom: 15px;
    left: 36px;
    right: 36px;
    text-align: center;
    font-size: 6.5pt;
    color: #999;
    border-top: 1px solid #e0e0e0;
    padding-top: 4px;
  }
</style>
</head>
<body>

<div class="header">
  <h1>Omnimise &mdash; Product &amp; Engineering Thinking</h1>
  <span class="subtitle">Document 2 of 2</span>
</div>

<div class="section-title">Top 5 Real-World Use Cases</div>

<div class="item">
  <span class="item-title">1. Instant Background Verification for Jobs</span> &mdash; Right now, background checks take like 2-3 weeks which is really frustrating. With Omnimise, job seekers can just share their already-verified work history and credentials straight to recruiters, no waiting around.
</div>
<div class="item">
  <span class="item-title">2. Frictionless Airport and Event Boarding</span> &mdash; Instead of fumbling with physical IDs and paper boarding passes, you could just use your biometrics (like face scan) matched against your passport info stored on your own phone. Way faster and smoother.
</div>
<div class="item">
  <span class="item-title">3. Secure Office and Server Room Access</span> &mdash; Think about how annoying badges and keycards are. Employees could just tap their Omnimise Ring or Card at the door, it verifies your identity and lets you in. No more lost badges.
</div>
<div class="item">
  <span class="item-title">4. Family Document Vault</span> &mdash; Basically a secure locker for important family stuff like birth certificates, property papers, health records etc. Everything is encrypted and shared within your family circle, so you don't have to rely on Google Drive or iCloud where you're not really in control.
</div>
<div class="item">
  <span class="item-title">5. Academic Status Validation</span> &mdash; Students can prove things like their enrollment, transcript, or GPA for scholarships, hostel applications, or student discounts with just a tap or QR code. Super handy and no need to carry around printouts.
</div>

<div class="section-title">Ideal User and Customer</div>

<div class="item">
  <span class="item-title">The Sovereign Professional</span> &mdash; People like developers, data scientists, and freelance consultants who keep switching jobs or taking up gigs. They need to constantly prove what they've done. Omnimise hooks into platforms like GitHub, LeetCode, HackerRank, and Kaggle to pull in their real contributions and keep an up-to-date verified profile on their device.
</div>
<div class="item">
  <span class="item-title">The Security-Conscious Enterprise</span> &mdash; HR departments and compliance teams that spend a lot of money on slow background checks and deal with tons of regulatory headaches. They also don't want the risk of storing candidates' personal data on their servers, so a system where they never even touch that data is a huge win.
</div>

<div class="section-title">Workflow Redesign: Physical Check-In and Gate Entry</div>

<div class="item">
  <span class="sub-label">Current Limitation:</span> Wherever there's a physical entry point (office lobbies, airport gates, secure buildings), the system needs internet to check a cloud database for authorization. This causes noticeable delays (around 2-5 seconds), and if the internet goes down, the whole thing just stops working.
</div>
<div class="item">
  <span class="sub-label">Proposed Solution:</span> Use an NFC-based offline system. The gate reader sends a challenge over NFC, the user's Ring, Card, or App processes it completely offline, signs it using a private key stored securely on the device hardware, and sends back the signed response. The reader then checks the signature against a locally stored public key. No internet needed at all.
</div>
<div class="item">
  <span class="sub-label">Expected Impact:</span> Verification would be near-instant, works completely offline, and the whole experience would just feel seamless &mdash; you basically walk through without stopping.
</div>

<div class="section-title">Highest-Value Technical Priority</div>

<div class="item">
  <span class="item-title">Hardware-Backed Key Storage</span> &mdash; This is probably the most critical thing to get right. The whole trust model depends on the idea that only the real owner could have signed a credential. If private keys are just sitting in regular app memory, malware could steal them. By using secure hardware storage on the phone (most modern phones have a dedicated security chip for this), the keys can't be copied or extracted. This makes every signed document basically impossible to forge.
</div>

<div class="section-title">Why a User Might Stop Using Omnimise</div>

<div class="item">
  <span class="item-title">The Cold Start Problem</span> &mdash; Imagine you sign up and then... nothing. You have to wait days or weeks for your institutions to verify your credentials before the app is even useful. That's a terrible first experience. Most people would just give up and go back to sending PDF resumes. So figuring out how to make onboarding fast and immediately useful is super important for keeping users around.
</div>

<div class="section-title">One Idea to Make Omnimise 10x More Valuable</div>

<div class="item">
  <span class="item-title">The "Verify with Omnimise" Protocol and MCP Gateway</span> &mdash; The idea is to create an open-source authentication standard (kind of like OAuth or "Sign in with Google") backed by a Model Context Protocol (MCP) Server. This would let platforms like Upwork, LinkedIn, or banking apps, and even AI agents, securely check a user's credentials with their consent. For example, an AI recruitment agent could verify that a candidate has a CS degree from IIT Bombay and has solved 500+ LeetCode problems, without ever seeing their name, email, or GPA. If this works, Omnimise goes from being a personal vault to being a whole identity protocol, and that creates a network effect where more platforms, users, and AI agents joining makes it more valuable for everyone.
</div>

<div class="footer">Omnimise Product &amp; Engineering Thinking &bull; Rajiv Agarwal &bull; June 2026</div>

</body>
</html>
`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  // Document 1
  const page1 = await browser.newPage();
  await page1.setContent(doc1Html, { waitUntil: 'networkidle0' });
  await page1.pdf({
    path: path.join(__dirname, 'Omnimise_Technical_Product_Review.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });
  console.log('Created: Omnimise_Technical_Product_Review.pdf');

  // Document 2
  const page2 = await browser.newPage();
  await page2.setContent(doc2Html, { waitUntil: 'networkidle0' });
  await page2.pdf({
    path: path.join(__dirname, 'Omnimise_Product_Engineering_Thinking.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });
  console.log('Created: Omnimise_Product_Engineering_Thinking.pdf');

  await browser.close();
  console.log('Done. Both PDFs generated successfully.');
})();
