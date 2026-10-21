'use strict';
const NS='http://www.w3.org/2000/svg',XL='http://www.w3.org/1999/xlink';
const lessons=[
['VPC','Ravi buys a fenced plot','Ravi rents a private fenced plot inside AWS. Only his cloud resources belong inside it.','Virtual Private Cloud (VPC), 10.0.0.0/16','See the teal fence inside the AWS region.'],
['Availability Zones','Two separate buildings','Ravi uses two buildings so the shop can keep running if one building has trouble.','Availability Zones (AZ A and AZ B)','Watch the two blue buildings appear.'],
['Subnets','Public and private rooms','Each building has a visitor-facing lobby and a staff-only room. These are separate network sections.','Public and private subnets','Gold is public; purple is private.'],
['Internet Gateway','The society main gate','Visitors arrive from the internet through the main gate. A route table acts like a signboard pointing traffic toward the gate.','Internet Gateway and route table','Follow the envelope from visitors to the gateway.'],
['Load Balancer','The helpful receptionist','The receptionist shares visitor requests between two web servers in different buildings.','Application Load Balancer and web servers','Envelopes split from the receptionist to both web servers.'],
['App and database','The shop staff and records','Web servers pass work to app servers, which read or write the database. A second database keeps a live copy in the other building.','Application tier, database and cross-AZ replication','Follow the data disks and repeating arrows.'],
['NAT Gateway','The outgoing delivery counter','A private app server can fetch updates through the NAT counter and main gate, without accepting unsolicited visitors from the internet.','NAT Gateway and outbound routing','Watch a package travel out from the private room.'],
['Security','Guards at gates and doors','Subnet gate guards check traffic at the subnet boundary; server door guards check traffic for each server. An intruder is denied.','Network ACLs and Security Groups','The red intruder stops before reaching the private subnet.'],
['VPN and Peering','Secret tunnel and private road','Ravi’s office can connect through an encrypted VPN tunnel. A partner’s separate VPC connects using a private peering road.','Site-to-Site VPN and VPC peering','Follow the lock and handshake along their own paths.']
];
let current=0,timer=null,previous=-1;
const stage=document.getElementById('stage'),caption=document.getElementById('caption'),nav=document.getElementById('steps');
const svgEl=(tag,attrs={},parent)=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));if(parent)parent.appendChild(e);return e};
const group=(p,step)=>svgEl('g',{class:step===current&&previous!==current?'fresh':''},p);
function rect(p,x,y,w,h,fill,stroke,r=12){return svgEl('rect',{x,y,width:w,height:h,rx:r,fill,stroke,'stroke-width':2},p)}
function label(p,x,y,t,cls='node-label',anchor='start'){const el=svgEl('text',{x,y,class:cls,'text-anchor':anchor},p);el.textContent=t;return el}
function box(p,x,y,w,h,title,fill,stroke,subtitle){rect(p,x,y,w,h,fill,stroke);label(p,x+12,y+23,title);if(subtitle)label(p,x+12,y+40,subtitle,'sub-label')}
function path(p,id,d,color){svgEl('path',{id,d,class:'wire',stroke:color},p)}
function packet(p,pathId,emoji,duration='5s',delay='0s'){const t=svgEl('text',{class:'packet','font-size':19,'text-anchor':'middle'},p);t.textContent=emoji;const m=svgEl('animateMotion',{dur:duration,begin:delay,repeatCount:'indefinite',rotate:'auto'},t);svgEl('mpath',{href:'#'+pathId},m)}
function render(){stage.replaceChildren();const svg=svgEl('svg',{viewBox:'0 0 1100 620',xmlns:NS,'aria-hidden':'true'},stage);const defs=svgEl('defs',{},svg);const gradient=svgEl('linearGradient',{id:'night',x1:0,y1:0,x2:1,y2:1},defs);svgEl('stop',{offset:'0%', 'stop-color':'#07162d'},gradient);svgEl('stop',{offset:'100%', 'stop-color':'#15284a'},gradient);const pattern=svgEl('pattern',{id:'dots',width:24,height:24,patternUnits:'userSpaceOnUse'},defs);svgEl('circle',{cx:2,cy:2,r:1,fill:'#45617e',opacity:.45},pattern);rect(svg,0,0,1100,620,'url(#night)','none',0);rect(svg,0,0,1100,620,'url(#dots)','none',0);
const wires=svgEl('g',{},svg),nodes=svgEl('g',{},svg),packets=svgEl('g',{},svg);
// Paths live in gutters between the labelled rooms, never through the room interiors.
if(current>=3)path(wires,'visitor','M 90 103 H 168 V 143 H 234','#eac56b');
if(current>=4){path(wires,'lbentry','M 234 143 H 267 V 225 H 425','#f4c768');path(wires,'webA','M 520 260 V 280 H 365 V 322','#f4c768');path(wires,'webB','M 520 260 V 280 H 765 V 322','#f4c768')}
if(current>=5){path(wires,'dataA','M 355 366 V 393','#b9a0fa');path(wires,'dataB','M 755 366 V 393','#b9a0fa');path(wires,'dbA','M 355 437 V 458 H 450 V 481','#b9a0fa');path(wires,'dbB','M 755 437 V 458 H 665 V 481','#b9a0fa');path(wires,'replica','M 535 521 H 590','#9ce3fc')}
if(current>=6)path(wires,'update','M 310 412 H 275 V 293 H 234 V 143 H 168 V 103 H 90','#ffc76e');
if(current>=7)path(wires,'intruder','M 1045 382 H 931 V 398 H 873','#ff6c7b');
if(current>=8){path(wires,'vpn','M 120 562 H 208 V 575 H 310 V 447','#62dba2');path(wires,'peer','M 1000 555 H 917 V 575 H 833 V 448','#62dba2')}
const cloud=group(nodes,0);box(cloud,195,27,715,562,'AWS Region · Ravi’s cloud neighbourhood','#0e2037','#416eaa');box(cloud,224,74,657,483,'VPC · 10.0.0.0/16','#0b3538','#35b9ab','Ravi’s fenced private plot');
if(current>=1){const g=group(nodes,1);box(g,246,174,294,360,'Availability Zone A','#152f52','#5299e8','Building A');box(g,566,174,294,360,'Availability Zone B','#152f52','#5299e8','Building B')}
if(current>=2){const g=group(nodes,2);for(const x of [261,581]){box(g,x,290,264,91,'Public subnet','#554319','#e6b850','Visitor-facing lobby');box(g,x,389,264,130,'Private subnet','#30254d','#ad8cf6','Staff-only rooms')}}
if(current>=3){const g=group(nodes,3);box(g,14,60,142,73,'The Internet','#1b3553','#679cce','Visitors');box(g,235,115,151,49,'Internet Gateway','#275056','#6adbd0','Main gate');box(g,405,115,164,43,'Route table','#233d50','#75a8d1','Signboard')}
if(current>=4){const g=group(nodes,4);box(g,425,215,190,45,'Load balancer','#6d4d1f','#efc56e','Receptionist');box(g,282,317,170,50,'Web server A','#334b54','#85d6df');box(g,602,317,170,50,'Web server B','#334b54','#85d6df')}
if(current>=5){const g=group(nodes,5);box(g,282,396,170,42,'App server A','#453361','#b6a0ff');box(g,602,396,170,42,'App server B','#453361','#b6a0ff');box(g,450,481,85,46,'Database','#43395b','#bd9dff');box(g,590,481,88,46,'Live copy','#43395b','#bd9dff')}
if(current>=6){const g=group(nodes,6);box(g,267,244,143,42,'NAT Gateway','#675020','#e7c15d','Delivery counter')}
if(current>=7){const g=group(nodes,7);for(const x of [266,586]){label(g,x,386,'NACL · gate guard','guard');label(g,x,514,'NACL · gate guard','guard')}for(const [x,y] of [[285,373],[605,373],[285,445],[605,445],[452,532],[590,532]])label(g,x,y,'SG guard','guard');label(g,871,389,'✕ Blocked!','guard')}
if(current>=8){const g=group(nodes,8);box(g,14,525,145,66,'Ravi’s office','#174436','#64d9a2','VPN gateway');box(g,925,523,158,67,'Partner VPC','#174436','#64d9a2','Private peering road')}
if(current>=3)packet(packets,'visitor','✉️','5s');if(current>=4){packet(packets,'lbentry','✉️','5s');packet(packets,'webA','✉️','4s');packet(packets,'webB','✉️','4s','2s')}
if(current>=5){for(const id of ['dataA','dataB','dbA','dbB'])packet(packets,id,'💾','4s');packet(packets,'replica','🔁','4s')}
if(current>=6)packet(packets,'update','📦','7s');if(current>=7)packet(packets,'intruder','👿','4s');if(current>=8){packet(packets,'vpn','🔒','6s');packet(packets,'peer','🤝','6s')}
const [title,subtitle,plain,technical,watch]=lessons[current];caption.innerHTML='';const h=document.createElement('h2');h.textContent=`Step ${current+1}: ${title} — ${subtitle}`;caption.append(h);const grid=document.createElement('div');grid.className='caption-grid';for(const [head,body] of [['In plain words',plain],['Technical name',technical],['Watch the picture',watch]]){const section=document.createElement('section'),strong=document.createElement('strong'),p=document.createElement('p');strong.textContent=head;p.textContent=body;section.append(strong,p);grid.append(section)}caption.append(grid);[...nav.children].forEach((b,i)=>b.setAttribute('aria-current',i===current?'step':'false'));previous=current}
function go(i){current=Math.max(0,Math.min(8,i));render()}
lessons.forEach(([title,subtitle],i)=>{const b=document.createElement('button');b.type='button';b.className='step';b.innerHTML=`<span class="num">${i+1}</span><span><b></b><small></small></span>`;b.querySelector('b').textContent=title;b.querySelector('small').textContent=subtitle;b.addEventListener('click',()=>{stop();go(i)});nav.append(b)});
function stop(){clearInterval(timer);timer=null;document.getElementById('play').textContent='Auto-play · 5s'}
document.getElementById('play').addEventListener('click',()=>{if(timer){stop();return}if(current===8)go(0);document.getElementById('play').textContent='Pause';timer=setInterval(()=>{if(current===8){stop();return}go(current+1)},5000)});
document.getElementById('reset').addEventListener('click',()=>{stop();go(0)});
document.getElementById('theme').addEventListener('click',()=>{document.body.classList.toggle('dark')});
render();
