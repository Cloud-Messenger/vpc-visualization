# vpc-visual

An animated, beginner-friendly diagram that explains an **AWS VPC** step by step, in plain language a non-IT person can follow.

The VPC is told as a **gated housing society** owned by a shop owner called *cloud-messenger*. Every technical term gets an everyday analogy.

By **cloud-messenger** | [cloudmessenger.in](https://cloudmessenger.in) | **#buildwithcloud-messenger**

No build step. No dependencies. Plain HTML, CSS and JavaScript with one inline SVG.

## The analogies

| Technical term | In the housing society |
|---|---|
| VPC | Fenced plot of land |
| Availability Zone | A separate building |
| Subnet | Lobby (public) / private flats |
| Internet Gateway | Main gate |
| NAT Gateway | Delivery counter |
| Security Group | Door guard |
| NACL | Gate guard |
| Load Balancer | Receptionist |
| VPN | Secret tunnel |
| VPC Peering | Private road |

## The moving objects

| Packet | Meaning |
|---|---|
| ✉️ Envelope | A visitor's request |
| 💾 Floppy disk | Data |
| 🔁 Repeat arrows | Database replication between zones |
| 📦 Package | A software update |
| 👿 Devil | An intruder |
| 🔒 Lock | Office VPN traffic |
| 🤝 Handshake | Partner VPC peering |

## The 9 steps

Clicking a step shows that step **and everything before it**. Clicking an earlier step goes back.

1. **The plot of land (VPC):** AWS Cloud region box and the VPC box (10.0.0.0/16).
2. **Two buildings (Availability Zones):** Zone A and Zone B.
3. **Lobby and flats (Subnets):** public (gold) and private (purple) in each zone.
4. **The main gate (Internet Gateway):** Internet, Visitors, a route table label and the first envelope.
5. **The receptionist (Load Balancer):** web servers in both zones; requests are shared.
6. **Back office and vault (App + Database):** data flows web, app, database, with a live copy in zone B.
7. **Delivery counter (NAT Gateway):** a software update leaves via NAT and the main gate.
8. **Guards (Security):** SG guard tags, NACL tags and an intruder who gets blocked.
9. **Tunnel and road (VPN + Peering):** an office reaches the private subnet; a partner VPC connects by peering.

The sidebar also has **Auto-play** (advances every 5 seconds) and **Reset**.

## Run locally

```bash
cd vpc-visual
python3 -m http.server 8000
```

Open <http://localhost:8000>. (Opening `index.html` directly also works, but a local server matches GitHub Pages.)

## Host on GitHub Pages

1. Create a new repository on GitHub (for example `vpc-visual`) and upload the **contents** of this folder so that `index.html` sits at the repository root.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then click **Save**.
5. Wait a minute. Your site appears at `https://<your-username>.github.io/vpc-visual/`.

The empty `.nojekyll` file tells GitHub Pages to serve the files exactly as they are.

## Project structure

```
vpc-visual/
  index.html     page structure only
  css/style.css  page theme (light/dark) and diagram styling
  js/app.js      builds the SVG, holds step data and caption text
  .nojekyll      serve files as-is on GitHub Pages
  LICENSE        open-pathshala License
  README.md      this file
```

## Customise

- **Text:** open `js/app.js` and edit the `STEPS` list (title, subtitle, plain words, technical name, watch-the-picture).
- **Owner name, website and hashtag:** edit `CONFIG` at the top of `js/app.js` (`owner`, `site`, `hashtag`, `autoplayMs`). The footer in `index.html`, the `<meta>` tags and `LICENSE` also carry the same details, so update those too.
- **Page colours:** change the variables in `:root` (light) and the `prefers-color-scheme: dark` block at the top of `css/style.css`.
- **Diagram colours:** in `css/style.css`, see the `.zone`, `.bx`, `.tag` and `.wire` rules. Blue = cloud/zones, teal = VPC, gold = public, purple = private, red = security, green = office link.
- **Font:** Bricolage Grotesque from Google Fonts, with system fallbacks, set on `body`.
- **Accessibility:** buttons have visible focus outlines and `prefers-reduced-motion` freezes the animation.
. Beginner-Friendly Learning Experience

Every step includes a caption card with two explanations:

Simple Explanation: Understand the concept in beginner-friendly language.

Technical Explanation: Explore the underlying concepts and terminology relevant to AWS Cloud Support interviews.

The README also documents EC2 deployment commands, file uploads using scp, common troubleshooting steps, and instructions for publishing the project using GitHub Pages.

☁️with Ulhas Narwade

GitHub: Explore Cloud-Messenger projects

License: Openपाठशाला -License — Cloud-Messenger

🎯 Branding & Open-Source License

The project includes Cloud-Messenger branding and links to the creator’s professional profiles.

Branding: #buildwithCloud-Messenger

LinkedIn: Connect 

This project transforms a traditional VPC setup tutorial into a visual, step-by-step learning experience. It helps learners connect Linux commands, AWS networking, EC2 deployment, HTTP request handling, and web server troubleshooting.

Learn the architecture. Visualize the workflow. Practice the commands. Troubleshoot like a DevOps Engineer.

☁️ #buildwithCloud-Messenger

Learn • Build • Visualize • Troubleshoot • Grow
---

Made with care by cloud-messenger | cloudmessenger.in | #buildwithcloud-messenger
