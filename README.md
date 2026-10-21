# VPC Visual

A no-build, dependency-free animated SVG guide to AWS networking. Ravi, a shop owner, explains his VPC as a gated housing society. Each step builds on the previous step. Built for beginners, accessible controls, and GitHub Pages.

## Moving objects

| Packet | Meaning |
|---|---|
| ✉️ | Visitor request |
| 💾 | Data travelling between servers |
| 🔁 | Database replication |
| 📦 | Software update leaving via NAT |
| 👿 | Intruder blocked at a subnet boundary |
| 🔒 | Office VPN traffic |
| 🤝 | Partner VPC peering traffic |

## Nine steps

1. VPC — fenced plot inside an AWS region.
2. Availability Zones — two separate buildings.
3. Subnets — public lobbies and private staff rooms.
4. Internet Gateway — main gate and route-table signboard.
5. Load Balancer — receptionist sharing requests across web servers.
6. App servers and database — shop staff, records and a live copy.
7. NAT Gateway — outbound delivery counter for software updates.
8. Security Groups and NACLs — door and subnet guards.
9. VPN and VPC Peering — encrypted office tunnel and private partner road.

## Run locally

From inside `vpc-visual/`:

```bash
python3 -m http.server 8000
```

Visit http://localhost:8000 in your browser. You can also open `index.html` directly.

## Publish with GitHub Pages

1. Create a public GitHub repository named `vpc-visual`.
2. Upload the **contents** of the `vpc-visual` folder to the repository root, including `.nojekyll`.
3. Commit the files to the `main` branch.
4. Open **Settings > Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select **main** and **/ (root)**, then **Save**.
7. Wait for deployment and visit `https://YOUR-USERNAME.github.io/vpc-visual/`.

## Structure

```text
vpc-visual/
├── index.html
├── css/style.css
├── js/app.js
├── .nojekyll
├── LICENSE
└── README.md
```

## Customize

- Change titles, subtitles, analogies and captions in the `lessons` array in `js/app.js`.
- Change SVG node colours in the `render()` function of `js/app.js`.
- Change page theme colours in CSS custom properties at the top of `css/style.css`.
- Replace `YOUR NAME` in the MIT LICENSE.

Note: The network drawing is conceptual, not a production-ready reference architecture. Real AWS routing, subnet placement, security and database replication require additional configuration.
