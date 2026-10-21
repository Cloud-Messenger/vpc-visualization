/* vpc-visual - app.js
 * Builds the diagram (inline SVG) with small helper functions, holds the step data and caption text.
 * No dependencies, no build step.
 */
(function () {
  'use strict';

  /* ---------- Easy-to-change settings ---------- */
  var CONFIG = {
    owner: 'cloud-messenger',
    site: 'cloudmessenger.in',
    hashtag: '#buildwithcloud-messenger',
    autoplayMs: 5000
  };

  var NS = 'http://www.w3.org/2000/svg';
  var XL = 'http://www.w3.org/1999/xlink';

  /* ---------- Step text (edit freely) ---------- */
  var STEPS = [
    {
      title: 'The plot of land', sub: 'VPC',
      plain: CONFIG.owner + ' buys a big fenced plot inside the giant city of AWS. Only people he allows can come in. That fenced plot is his own private network.',
      tech: 'Amazon VPC (Virtual Private Cloud): a private, isolated network inside an AWS Region. The address range 10.0.0.0/16 gives it 65,536 private IP addresses.',
      watch: 'The big blue box is the AWS city (the Region). The teal box inside it is the fenced plot (the VPC).'
    },
    {
      title: 'Two buildings', sub: 'Availability Zones',
      plain: 'He builds two identical buildings far apart. If one has a power cut or a flood, the other keeps the shop open.',
      tech: 'Availability Zones (AZs): separate data centres in the same Region, each with its own power and network. Spreading across two AZs keeps the app alive if one fails.',
      watch: 'Two dashed blue buildings appear: Zone A and Zone B.'
    },
    {
      title: 'Lobby and flats', sub: 'Subnets',
      plain: 'Each building has a lobby that visitors may enter (gold) and private flats for staff only (purple).',
      tech: 'Subnets: slices of the VPC address range, one public and one private per AZ. A public subnet has a route to the Internet Gateway; a private subnet does not.',
      watch: 'Gold public subnets and purple private subnets appear in both buildings.'
    },
    {
      title: 'The main gate', sub: 'Internet Gateway',
      plain: 'A main gate is cut into the fence so customers can arrive. A signboard (the route table) tells the lobby: for anything outside, use the main gate.',
      tech: 'Internet Gateway (IGW) plus a route table entry 0.0.0.0/0 -> IGW. This is what makes a subnet "public".',
      watch: 'An envelope (a visitor\u2019s request) travels from Visitors, across the Internet, into the main gate.'
    },
    {
      title: 'The receptionist', sub: 'Load Balancer + web servers',
      plain: 'A receptionist greets every visitor and sends them to a free shop counter, switching between the two buildings so no counter is overloaded.',
      tech: 'Application Load Balancer in front of web servers (EC2) in two AZs. It shares traffic and stops sending requests to unhealthy servers.',
      watch: 'Envelopes come in through the gate to the receptionist bar, then leave through the gap beneath it, one to each building.'
    },
    {
      title: 'Back office and vault', sub: 'App servers + Database',
      plain: 'Counter staff pass orders to the back office, which writes records in a locked vault in the private flats. A live copy of the vault sits in the other building.',
      tech: 'App servers and a database (for example Amazon RDS) in private subnets. Multi-AZ replication keeps a standby copy in the second AZ.',
      watch: 'Floppy disks (data) move web, then app, then database. The repeat arrows shuttle changes between the two vaults.'
    },
    {
      title: 'Delivery counter', sub: 'NAT Gateway',
      plain: 'Staff in the private flats sometimes need things from outside, like software updates. They ask the delivery counter in the lobby, which goes out and brings the parcel back. Outsiders cannot use that counter to walk in.',
      tech: 'NAT Gateway in a public subnet: private servers can start connections to the internet, but the internet cannot start connections to them.',
      watch: 'A package leaves the app server, passes the NAT counter, exits through the main gate and reaches the Internet.'
    },
    {
      title: 'Guards', sub: 'Security Groups + NACLs',
      plain: 'Every door has a door guard with a guest list for that one door. Each block entrance also has a gate guard who checks everyone going in or out. A stranger heading for the private flats gets stopped.',
      tech: 'Security Groups: stateful firewalls on each server. Network ACLs (NACLs): stateless allow/deny rules on each subnet. Together they give layered defence.',
      watch: 'Red SG guard tags sit under every server, NACL tags sit on every subnet, and the intruder is stopped with a red cross.'
    },
    {
      title: 'Tunnel and road', sub: 'VPN + VPC Peering',
      plain: 'The head office reaches the private flats through a secret tunnel that nobody else can see. A neighbouring society (a partner) gets a private road straight to our plot, with no public street in between.',
      tech: 'Site-to-Site VPN through a VPN gateway (encrypted tunnel over the internet), and VPC Peering between two VPCs whose address ranges do not overlap.',
      watch: 'Lock packets run through the green tunnel from the Office; a handshake travels the private road to the Partner VPC.'
    }
  ];

  var LEGEND = [
    ['\u2709\uFE0F', 'Visitor request'],
    ['\uD83D\uDCBE', 'Data'],
    ['\uD83D\uDD01', 'Database replication'],
    ['\uD83D\uDCE6', 'Software update'],
    ['\uD83D\uDC7F', 'Intruder'],
    ['\uD83D\uDD12', 'Office VPN'],
    ['\uD83E\uDD1D', 'Partner peering']
  ];
  var E = { mail: LEGEND[0][0], disk: LEGEND[1][0], repl: LEGEND[2][0], pkg: LEGEND[3][0], devil: LEGEND[4][0], lock: LEGEND[5][0], hand: LEGEND[6][0] };

  /* ---------- Tiny SVG helpers ---------- */
  var layers = {};   // zones (big areas) -> wires -> boxes -> packets, so wires never cross boxes or text
  var items = [];    // every piece that belongs to a step

  function mk(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) { n.setAttribute(k, attrs[k]); } }
    if (parent) { parent.appendChild(n); }
    return n;
  }

  function txt(parent, x, y, s, o) {
    o = o || {};
    var t = mk('text', {
      x: x, y: y, 'font-size': o.size || 12, 'font-weight': o.weight || 600,
      'text-anchor': o.anchor || 'start', 'class': 't ' + (o.cls || '')
    }, parent);
    t.textContent = s;
    return t;
  }

  function add(step, layer, node) {
    node.setAttribute('class', ((node.getAttribute('class') || '') + ' item').trim());
    node.setAttribute('data-step', step);
    layers[layer].appendChild(node);
    items.push(node);
    return node;
  }

  function zone(step, x, y, w, h, cls, label, lx, ly, anchor, size) {
    var g = mk('g', {});
    mk('rect', { x: x, y: y, width: w, height: h, rx: 14, 'class': 'zone ' + cls }, g);
    txt(g, lx, ly, label, { size: size || 12.5, weight: 700, anchor: anchor, cls: 'zl ' + cls });
    return add(step, 'zones', g);
  }

  function box(step, x, y, w, h, o) {
    var g = mk('g', {});
    mk('rect', { x: x, y: y, width: w, height: h, rx: 9, 'class': 'bx ' + o.cls }, g);
    var cx = x + w / 2;
    if (o.sub) {
      txt(g, cx, y + h / 2 - 3, o.title, { size: o.size || 12, weight: 700, anchor: 'middle' });
      txt(g, cx, y + h / 2 + 12, o.sub, { size: 10, weight: 500, anchor: 'middle', cls: 'sub' });
    } else {
      txt(g, cx, y + h / 2 + 4, o.title, { size: o.size || 12, weight: 700, anchor: 'middle' });
    }
    return add(step, 'boxes', g);
  }

  function tag(step, x, y, w, h, lines, cls) {
    var g = mk('g', {});
    mk('rect', { x: x, y: y, width: w, height: h, rx: 5, 'class': 'tag ' + cls }, g);
    if (lines.length === 1) {
      txt(g, x + w / 2, y + h / 2 + 3.5, lines[0], { size: 9.5, weight: 700, anchor: 'middle', cls: 'tagt' });
    } else {
      txt(g, x + w / 2, y + 14, lines[0], { size: 10, weight: 700, anchor: 'middle' });
      txt(g, x + w / 2, y + 28, lines[1], { size: 9, weight: 500, anchor: 'middle', cls: 'sub' });
    }
    return add(step, 'boxes', g);
  }

  function wire(step, id, d, cls) {
    return add(step, 'wires', mk('path', { id: id, d: d, 'class': 'wire ' + (cls || '') }));
  }

  // A packet is an emoji that rides along a wire with <animateMotion> + <mpath>.
  // A negative "begin" starts it mid-journey so nothing sits at the top-left corner.
  function packet(step, wireId, emoji, o) {
    o = o || {};
    var g = mk('g', { 'class': 'pkt' });
    var t = mk('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 18, 'class': 'emoji' }, g);
    t.textContent = emoji;
    var a = mk('animateMotion', { dur: (o.dur || 2.4) + 's', begin: (o.begin || 0) + 's', repeatCount: 'indefinite', rotate: '0' }, g);
    if (o.dwell) {           // travel, then wait at the end (the blocked intruder)
      a.setAttribute('calcMode', 'linear'); a.setAttribute('keyPoints', '0;1;1'); a.setAttribute('keyTimes', '0;0.8;1');
    }
    if (o.pingpong) {        // there and back (replication)
      a.setAttribute('calcMode', 'linear'); a.setAttribute('keyPoints', '0;1;0'); a.setAttribute('keyTimes', '0;0.5;1');
    }
    var m = mk('mpath', { href: '#' + wireId }, a);
    m.setAttributeNS(XL, 'xlink:href', '#' + wireId);
    return add(step, 'packets', g);
  }

  /* ---------- Build the diagram ---------- */
  function build() {
    var svg = mk('svg', {
      viewBox: '0 0 1100 620', role: 'img', preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Animated diagram of an AWS VPC drawn as a gated housing society'
    });
    ['zones', 'wires', 'boxes', 'packets'].forEach(function (n) { layers[n] = mk('g', { id: 'layer-' + n }, svg); });

    // Always-visible brand mark (left column, bottom)
    txt(layers.zones, 12, 584, CONFIG.site, { size: 10, weight: 700, cls: 'wm' });
    txt(layers.zones, 12, 598, CONFIG.hashtag, { size: 9, weight: 600, cls: 'wm' });

    // 1. VPC
    zone(1, 150, 14, 790, 592, 'region', 'AWS Cloud - Region (the city)', 166, 34, 'start');
    zone(1, 164, 44, 762, 546, 'vpc', 'VPC 10.0.0.0/16 - ' + CONFIG.owner + '\u2019s gated housing society', 180, 68, 'start');

    // 2. Availability Zones
    zone(2, 222, 84, 300, 490, 'az', 'Zone A - Building 1', 238, 106, 'start');
    zone(2, 538, 84, 300, 490, 'az', 'Zone B - Building 2', 554, 106, 'start');

    // 3. Subnets (short labels; the B side is mirrored so wires stay clear of text)
    zone(3, 238, 196, 268, 150, 'pub', 'Public subnet', 250, 336, 'start', 11);
    zone(3, 238, 372, 268, 186, 'prv', 'Private subnet', 250, 548, 'start', 11);
    zone(3, 554, 196, 268, 150, 'pub', 'Public subnet', 810, 336, 'end', 11);
    zone(3, 554, 372, 268, 186, 'prv', 'Private subnet', 810, 548, 'end', 11);

    // 4. Internet Gateway, Internet, Visitors, route table, first envelope
    box(4, 10, 40, 84, 56, { title: 'Visitors', sub: '(customers)', cls: 'net' });
    box(4, 10, 170, 84, 56, { title: 'The Internet', sub: '(the world)', cls: 'net', size: 11 });
    box(4, 140, 168, 70, 60, { title: 'Main Gate', sub: '(IGW)', cls: 'gate', size: 11 });
    tag(4, 136, 236, 78, 36, ['Route table', 'all > gate'], 'route');
    wire(4, 'wA', 'M52,96 L52,170');
    wire(4, 'wB', 'M94,190 L140,190');
    packet(4, 'wA', E.mail, { dur: 2.4 });
    packet(4, 'wB', E.mail, { dur: 2.4, begin: -1.2 });

    // 5. Load balancer + web servers
    box(5, 238, 118, 584, 28, { title: 'Load Balancer - receptionist', cls: 'lb' });
    box(5, 258, 228, 96, 46, { title: 'Web server', sub: 'shop counter', cls: 'pub' });
    box(5, 706, 228, 96, 46, { title: 'Web server', sub: 'shop counter', cls: 'pub' });
    wire(5, 'wIL', 'M175,168 L175,132 L238,132', 'gold');
    wire(5, 'wLA', 'M276,146 L276,228', 'gold');
    wire(5, 'wLB', 'M784,146 L784,228', 'gold');
    packet(5, 'wIL', E.mail, { dur: 2.4, begin: -0.6 });
    packet(5, 'wLA', E.mail, { dur: 2.4 });
    packet(5, 'wLB', E.mail, { dur: 2.4, begin: -1.2 });

    // 6. App servers + database + live copy
    box(6, 258, 424, 96, 46, { title: 'App server', sub: 'back office', cls: 'prv' });
    box(6, 706, 424, 96, 46, { title: 'App server', sub: 'back office', cls: 'prv' });
    box(6, 404, 424, 84, 46, { title: 'Database', sub: 'vault', cls: 'prv' });
    box(6, 572, 424, 84, 46, { title: 'Live copy', sub: 'spare vault', cls: 'prv' });
    wire(6, 'wWA', 'M346,274 L346,424', 'purple');
    wire(6, 'wWB', 'M714,274 L714,424', 'purple');
    wire(6, 'wDA', 'M354,447 L404,447', 'purple');
    wire(6, 'wDB', 'M706,447 L656,447', 'purple');
    wire(6, 'wRep', 'M488,447 L572,447');
    packet(6, 'wWA', E.disk, { dur: 2.4 });
    packet(6, 'wDA', E.disk, { dur: 2.4, begin: -1.2 });
    packet(6, 'wWB', E.disk, { dur: 2.4, begin: -0.6 });
    packet(6, 'wDB', E.disk, { dur: 2.4, begin: -1.8 });
    packet(6, 'wRep', E.repl, { dur: 3, pingpong: true });

    // 7. NAT Gateway + software update
    box(7, 386, 228, 104, 46, { title: 'NAT Gateway', sub: 'delivery counter', cls: 'nat' });
    wire(7, 'wU1', 'M322,424 L322,406 L398,406 L398,274', 'gold');
    wire(7, 'wU2', 'M398,228 L398,182 L210,182', 'gold');
    wire(7, 'wU3', 'M140,206 L94,206');
    packet(7, 'wU1', E.pkg, { dur: 3 });
    packet(7, 'wU2', E.pkg, { dur: 3, begin: -1 });
    packet(7, 'wU3', E.pkg, { dur: 3, begin: -2 });

    // 8. Security: SG guards, NACL guards, blocked intruder
    [[258, 278], [746, 278], [258, 474], [746, 474], [404, 474], [600, 474]].forEach(function (p) {
      tag(8, p[0], p[1], 56, 16, ['SG guard'], 'sg');
    });
    [[414, 202], [562, 202], [414, 378], [562, 378]].forEach(function (p) {
      tag(8, p[0], p[1], 84, 20, ['NACL guard'], 'sg');
    });
    wire(8, 'wI', 'M52,226 L52,480 L220,480', 'red');
    var x = mk('g', {});
    var xi = mk('g', { 'class': 'blk' }, x);
    mk('circle', { cx: 238, cy: 480, r: 9, 'class': 'blk-circle' }, xi);
    mk('line', { x1: 234, y1: 476, x2: 242, y2: 484, 'class': 'blk-x' }, xi);
    mk('line', { x1: 242, y1: 476, x2: 234, y2: 484, 'class': 'blk-x' }, xi);
    txt(x, 192, 506, 'Blocked!', { size: 12, weight: 800, anchor: 'middle', cls: 'blocked' });
    add(8, 'boxes', x);
    packet(8, 'wI', E.devil, { dur: 5, dwell: true });

    // 9. Office VPN + Partner peering
    box(9, 1000, 422, 90, 76, { title: 'Office', sub: '(head office)', cls: 'green' });
    box(9, 890, 432, 60, 56, { title: 'VPN', sub: 'gateway', cls: 'green' });
    box(9, 1000, 190, 90, 76, { title: 'Partner VPC', sub: '10.1.0.0/16', cls: 'green', size: 11 });
    box(9, 890, 200, 60, 56, { title: 'Peering', sub: 'road', cls: 'green', size: 11 });
    wire(9, 'wVO', 'M1000,460 L950,460', 'green tunnel');
    wire(9, 'wVP', 'M890,460 L822,460', 'green tunnel');
    wire(9, 'wPR', 'M950,228 L1000,228', 'green');
    packet(9, 'wVO', E.lock, { dur: 2 });
    packet(9, 'wVP', E.lock, { dur: 2.4, begin: -1 });
    packet(9, 'wPR', E.hand, { dur: 2.4 });

    document.getElementById('stage').appendChild(svg);
    return svg;
  }

  /* ---------- Page behaviour ---------- */
  var svg = build();
  var current = 0;
  var timer = null;
  var buttons = [];
  var autoBtn = document.getElementById('btn-auto');

  function buildSidebar() {
    var nav = document.getElementById('steps');
    STEPS.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'step';
      b.innerHTML = '<span class="num"></span><span><span class="st"></span><br><span class="ss"></span></span>';
      b.querySelector('.num').textContent = i + 1;
      b.querySelector('.st').textContent = s.title;
      b.querySelector('.ss').textContent = s.sub;
      b.addEventListener('click', function () { stopAuto(); setStep(i + 1); });
      nav.appendChild(b);
      buttons.push(b);
    });
    var ul = document.getElementById('legend');
    LEGEND.forEach(function (l) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="em"></span><span class="what"></span>';
      li.querySelector('.em').textContent = l[0];
      li.querySelector('.what').textContent = l[1];
      ul.appendChild(li);
    });
  }

  function setStep(n) {
    var prev = current;
    current = n;
    items.forEach(function (node) {
      var s = Number(node.getAttribute('data-step'));
      var on = s <= n;
      node.classList.toggle('on', on);
      node.classList.remove('new');
      if (on && s > prev) {
        void node.getBoundingClientRect();   // restart the glow animation
        node.classList.add('new');
      }
    });
    window.setTimeout(function () {
      items.forEach(function (node) { node.classList.remove('new'); });
    }, 1900);

    buttons.forEach(function (b, i) {
      b.classList.toggle('active', i === n - 1);
      b.classList.toggle('done', i < n - 1);
      if (i === n - 1) { b.setAttribute('aria-current', 'step'); } else { b.removeAttribute('aria-current'); }
    });
    var s = STEPS[n - 1];
    document.getElementById('cap-title').textContent = 'Step ' + n + ': ' + s.title + ' (' + s.sub + ')';
    document.getElementById('cap-plain').textContent = s.plain;
    document.getElementById('cap-tech').textContent = s.tech;
    document.getElementById('cap-watch').textContent = s.watch;
  }

  function startAuto() {
    stopAuto();
    autoBtn.setAttribute('aria-pressed', 'true');
    autoBtn.textContent = 'Pause';
    timer = window.setInterval(function () { setStep(current >= STEPS.length ? 1 : current + 1); }, CONFIG.autoplayMs);
  }
  function stopAuto() {
    if (timer) { window.clearInterval(timer); timer = null; }
    autoBtn.setAttribute('aria-pressed', 'false');
    autoBtn.textContent = 'Auto-play';
  }

  autoBtn.addEventListener('click', function () { if (timer) { stopAuto(); } else { startAuto(); } });
  document.getElementById('btn-reset').addEventListener('click', function () { stopAuto(); setStep(1); });

  // Respect "reduce motion": freeze the moving packets
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function applyMotion() {
    if (!svg.pauseAnimations) { return; }
    if (mq && mq.matches) { svg.pauseAnimations(); } else { svg.unpauseAnimations(); }
  }
  if (mq) {
    applyMotion();
    if (mq.addEventListener) { mq.addEventListener('change', applyMotion); }
  }

  buildSidebar();
  setStep(1);
})();
