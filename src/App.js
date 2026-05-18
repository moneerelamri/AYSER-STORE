import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════
//  PERMISSIONS & INITIAL DATA
// ════════════════════════════════════════════════════
const DEFAULT_PERMS = {
  hardware_view:true, hardware_add:true, hardware_edit:false, hardware_delete:false,
  software_view:true, software_add:false, software_edit:false, software_delete:false,
  devices_view:true, devices_add:true, devices_edit:true,
  invoices_view:true, invoices_add:true,
  reports_view:false,
};
const ADMIN_PERMS = Object.fromEntries(Object.keys(DEFAULT_PERMS).map(k=>[k,true]));
const PERM_KEYS = Object.keys(DEFAULT_PERMS);

const INIT_USERS = [
  {id:1,username:"admin",password:"admin123",role:"admin",name:"المدير",nameEn:"Admin",permissions:{...ADMIN_PERMS}},
  {id:2,username:"tech1",password:"tech123",role:"technician",name:"فني الصيانة",nameEn:"Technician",permissions:{...DEFAULT_PERMS}},
];
const INIT_PARTS = [
  {id:1,name:"شاشة LCD",nameEn:"LCD Screen",costPrice:120,sellPrice:200,stock:15,currency:"LYD",addedBy:1,addedByName:"المدير",addedByNameEn:"Admin",date:"2026-05-01",time:"09:00:00"},
  {id:2,name:"بطارية",nameEn:"Battery",costPrice:30,sellPrice:60,stock:40,currency:"LYD",addedBy:1,addedByName:"المدير",addedByNameEn:"Admin",date:"2026-05-03",time:"10:30:00"},
];
const INIT_TOOLS = [
  {id:1,name:"برنامج فك الحماية",nameEn:"Unlock Software",price:50,currency:"USD",subscriptionType:"yearly",expiryDate:"2027-05-01",addedBy:1,addedByName:"المدير",addedByNameEn:"Admin",date:"2026-05-01",time:"09:00:00"},
  {id:2,name:"أداة الفلاش",nameEn:"Flash Tool",price:200,currency:"USD",subscriptionType:"lifetime",expiryDate:null,addedBy:1,addedByName:"المدير",addedByNameEn:"Admin",date:"2026-04-15",time:"14:00:00"},
];
const INIT_INVOICES = [
  {id:1001,customerName:"أحمد محمد",customerPhone:"0911234567",items:[{partId:1,partName:"شاشة LCD",qty:1,price:200,currency:"LYD"}],total:200,currency:"LYD",technicianId:2,technicianName:"فني الصيانة",technicianNameEn:"Technician",date:"2026-05-10",time:"11:20:00"},
];
const INIT_DEVICES = [
  {id:9001,customerName:"خالد عمر",customerPhone:"0921111222",deviceType:"Samsung Galaxy S23",faultType:"شاشة مكسورة",faultTypeEn:"Broken Screen",maintenanceType:"استبدال شاشة",maintenanceTypeEn:"Screen Replacement",status:"waiting",technicianId:2,technicianName:"فني الصيانة",technicianNameEn:"Technician",notes:"الشاشة لا تعمل",receivedDate:"2026-05-15",receivedTime:"10:00:00"},
  {id:9002,customerName:"فاطمة علي",customerPhone:"0913334455",deviceType:"iPhone 14",faultType:"بطارية ضعيفة",faultTypeEn:"Weak Battery",maintenanceType:"استبدال بطارية",maintenanceTypeEn:"Battery Replacement",status:"in_progress",technicianId:2,technicianName:"فني الصيانة",technicianNameEn:"Technician",notes:"",receivedDate:"2026-05-16",receivedTime:"14:30:00"},
];

// ════════════════════════════════════════════════════
//  TRANSLATIONS
// ════════════════════════════════════════════════════
const T = {
  ar:{
    appTitle:"متجر ayser",appSubtitle:"نظام إدارة الصيانة",
    login:"تسجيل الدخول",username:"اسم المستخدم",password:"كلمة المرور",loginBtn:"دخول",logout:"خروج",
    dashboard:"الرئيسية",hardware:"قطع الغيار",software:"السوفتوير",
    invoices:"الفواتير",reports:"التقارير",users:"المستخدمون",
    backup:"النسخ الاحتياطي",activityLog:"سجل النشاط",devices:"أجهزة الصيانة",
    addPart:"إضافة قطعة",partName:"اسم القطعة",costPrice:"سعر التكلفة",
    sellPrice:"سعر البيع",stock:"الكمية",currency:"العملة",
    addTool:"إضافة أداة",toolName:"اسم الأداة",toolPrice:"السعر",
    subscriptionType:"الاشتراك",yearly:"سنوي",lifetime:"مدى الحياة",expiryDate:"تاريخ الانتهاء",
    edit:"تعديل",delete:"حذف",save:"حفظ",cancel:"إلغاء",add:"إضافة",
    lyd:"دينار ليبي",usd:"دولار أمريكي",
    newInvoice:"فاتورة جديدة",customerName:"اسم العميل",customerPhone:"رقم الهاتف",
    total:"الإجمالي",print:"طباعة",addItem:"إضافة عنصر",qty:"الكمية",unitPrice:"سعر الوحدة",
    dailyReport:"تقرير يومي",monthlyReport:"تقرير شهري",
    totalSales:"إجمالي المبيعات",totalInvoices:"عدد الفواتير",profit:"الربح",
    addUser:"إضافة مستخدم",role:"الدور",admin:"مدير",technician:"فني",
    name:"الاسم",confirmPassword:"تأكيد كلمة المرور",invalidLogin:"اسم المستخدم أو كلمة المرور غير صحيحة",
    noData:"لا توجد بيانات",search:"بحث...",daysLeft:"يوم متبقي",expired:"منتهي",
    dateTime:"التاريخ والوقت",enteredBy:"بواسطة",technician_:"الفني",
    newDevice:"استلام جهاز",deviceType:"نوع الجهاز",faultType:"نوع الخلل",
    maintenanceType:"نوع الصيانة",status:"الحالة",notes:"ملاحظات",
    waiting:"في الانتظار",in_progress:"في الصيانة",ready:"جاهز",
    receivedDate:"تاريخ الاستلام",allStatuses:"جميع الحالات",deviceId:"رقم الجهاز",
    permissions:"الصلاحيات",managePermissions:"إدارة الصلاحيات",
    perm_hardware_view:"عرض قطع الغيار",perm_hardware_add:"إضافة قطع غيار",
    perm_hardware_edit:"تعديل قطع الغيار",perm_hardware_delete:"حذف قطع الغيار",
    perm_software_view:"عرض السوفتوير",perm_software_add:"إضافة أدوات",
    perm_software_edit:"تعديل الأدوات",perm_software_delete:"حذف الأدوات",
    perm_devices_view:"عرض الأجهزة",perm_devices_add:"استلام أجهزة",
    perm_devices_edit:"تعديل حالة الأجهزة",
    perm_invoices_view:"عرض الفواتير",perm_invoices_add:"إنشاء فواتير",
    perm_reports_view:"عرض التقارير",
    technicianPerf:"أداء الفنيين",totalActions:"إجمالي العمليات",
    clearLog:"مسح السجل",exportLog:"تصدير",allUsers:"جميع المستخدمين",
    createBackup:"إنشاء نسخة احتياطية",restoreBackup:"استعادة النسخة",
    backupSuccess:"تم إنشاء النسخة بنجاح",restoreSuccess:"تم الاستعادة بنجاح",
    restoreWarning:"تحذير: سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل أنت متأكد؟",
    downloadBackup:"تحميل النسخة",confirmRestore:"تأكيد الاستعادة",
    invalidFile:"ملف غير صالح",autoBackup:"نسخ تلقائي",
    partsCount:"قطعة غيار",toolsCount:"أداة",invoicesCount:"فاتورة",usersCount:"مستخدم",devicesCount:"جهاز",
    selectPart:"اختر القطعة",noPermission:"ليس لديك صلاحية للوصول لهذا القسم",
    costPriceAdmin:"سعر التكلفة (للمدير فقط)",
    enableAll:"تفعيل الكل",disableAll:"تعطيل الكل",
    printReceipt:"طباعة وصل الاستلام",
    deviceStats:"إحصائيات الأجهزة",
  },
  en:{
    appTitle:"ayser Store",appSubtitle:"Maintenance Management",
    login:"Login",username:"Username",password:"Password",loginBtn:"Sign In",logout:"Logout",
    dashboard:"Dashboard",hardware:"Spare Parts",software:"Software",
    invoices:"Invoices",reports:"Reports",users:"Users",
    backup:"Backup",activityLog:"Activity Log",devices:"Devices",
    addPart:"Add Part",partName:"Part Name",costPrice:"Cost Price",
    sellPrice:"Sell Price",stock:"Stock",currency:"Currency",
    addTool:"Add Tool",toolName:"Tool Name",toolPrice:"Price",
    subscriptionType:"Subscription",yearly:"Yearly",lifetime:"Lifetime",expiryDate:"Expiry Date",
    edit:"Edit",delete:"Delete",save:"Save",cancel:"Cancel",add:"Add",
    lyd:"Libyan Dinar",usd:"US Dollar",
    newInvoice:"New Invoice",customerName:"Customer Name",customerPhone:"Phone",
    total:"Total",print:"Print",addItem:"Add Item",qty:"Qty",unitPrice:"Unit Price",
    dailyReport:"Daily Report",monthlyReport:"Monthly Report",
    totalSales:"Total Sales",totalInvoices:"Invoices",profit:"Profit",
    addUser:"Add User",role:"Role",admin:"Admin",technician:"Technician",
    name:"Full Name",confirmPassword:"Confirm Password",invalidLogin:"Invalid username or password",
    noData:"No data",search:"Search...",daysLeft:"days left",expired:"Expired",
    dateTime:"Date & Time",enteredBy:"By",technician_:"Technician",
    newDevice:"Receive Device",deviceType:"Device Type",faultType:"Fault Type",
    maintenanceType:"Maintenance Type",status:"Status",notes:"Notes",
    waiting:"Waiting",in_progress:"In Progress",ready:"Ready",
    receivedDate:"Received",allStatuses:"All Statuses",deviceId:"Device ID",
    permissions:"Permissions",managePermissions:"Manage Permissions",
    perm_hardware_view:"View Hardware",perm_hardware_add:"Add Hardware",
    perm_hardware_edit:"Edit Hardware",perm_hardware_delete:"Delete Hardware",
    perm_software_view:"View Software",perm_software_add:"Add Software",
    perm_software_edit:"Edit Software",perm_software_delete:"Delete Software",
    perm_devices_view:"View Devices",perm_devices_add:"Receive Devices",
    perm_devices_edit:"Edit Device Status",
    perm_invoices_view:"View Invoices",perm_invoices_add:"Create Invoices",
    perm_reports_view:"View Reports",
    technicianPerf:"Technician Performance",totalActions:"Total Actions",
    clearLog:"Clear Log",exportLog:"Export",allUsers:"All Users",
    createBackup:"Create Backup",restoreBackup:"Restore",
    backupSuccess:"Backup created",restoreSuccess:"Restored successfully",
    restoreWarning:"Warning: All current data will be replaced. Are you sure?",
    downloadBackup:"Download Backup",confirmRestore:"Confirm Restore",
    invalidFile:"Invalid file",autoBackup:"Auto Backup",
    partsCount:"parts",toolsCount:"tools",invoicesCount:"invoices",usersCount:"users",devicesCount:"devices",
    selectPart:"Select Part",noPermission:"You don't have permission to access this section",
    costPriceAdmin:"Cost Price (Admin only)",
    enableAll:"Enable All",disableAll:"Disable All",
    printReceipt:"Print Receipt",
    deviceStats:"Device Statistics",
  }
};

// ════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════
const genId = () => Math.floor(Math.random()*900000)+10000;
const nowDT = () => { const n=new Date(); return {date:n.toISOString().slice(0,10),time:n.toTimeString().slice(0,8),iso:n.toISOString()}; };
const fmtCur = (a,c) => c==="USD"?`$${Number(a).toFixed(2)}`:`${Number(a).toFixed(2)} د.ل`;
const daysLeft = (d) => { if(!d)return null; return Math.ceil((new Date(d)-new Date())/86400000); };
const today = () => new Date().toISOString().slice(0,10);
const SC = {waiting:"#f59e0b",in_progress:"#3b82f6",ready:"#10b981"};
const SI = {waiting:"⏳",in_progress:"🔧",ready:"✅"};

// ════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ════════════════════════════════════════════════════
const GS = () => (
  <style>{`
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#070b14;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:#0a0f1e;}
    ::-webkit-scrollbar-thumb{background:#1e2d44;border-radius:3px;}
    input,select,button,textarea{font-family:inherit;}
    .sx{overflow-x:auto;-webkit-overflow-scrolling:touch;}
    @media print{
      .np{display:none!important;}
      .sidebar-el{display:none!important;}
      .topbar-el{display:none!important;}
      .main-content{margin:0!important;padding:0!important;}
      body{background:white!important;color:black!important;}
    }
  `}</style>
);
const inp = {width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid #1e2d44",background:"#070b14",color:"#e2e8f0",fontSize:13,outline:"none"};
const Inp = ({value,onChange,placeholder,type="text",s={}}) =>
  <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={{...inp,...s}}/>;
const Sel = ({value,onChange,children,s={}}) =>
  <select value={value} onChange={onChange} style={{...inp,...s}}>{children}</select>;
const Lbl = ({c}) => <label style={{display:"block",fontSize:11,color:"#6b7280",marginBottom:4}}>{c}</label>;
const FF = ({label,children}) => <div><Lbl c={label}/>{children}</div>;
const Btn = ({onClick,children,col="#2563eb",s={},sm,full}) =>
  <button onClick={onClick} style={{padding:sm?"7px 13px":"10px 20px",borderRadius:9,border:"none",background:col,color:"#fff",fontSize:sm?12:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",width:full?"100%":"auto",...s}}>{children}</button>;
const OBtn = ({onClick,children,col="#1e2d44",tc="#9ca3af",s={},sm}) =>
  <button onClick={onClick} style={{padding:sm?"7px 13px":"10px 16px",borderRadius:9,border:`1px solid ${col}`,background:"transparent",color:tc,fontSize:sm?12:13,cursor:"pointer",whiteSpace:"nowrap",...s}}>{children}</button>;
const Card = ({children,s={}}) =>
  <div style={{background:"#0d1321",border:"1px solid #1e2d44",borderRadius:14,padding:16,...s}}>{children}</div>;
const Row = ({children,s={}}) =>
  <div style={{display:"flex",alignItems:"center",...s}}>{children}</div>;
const PH = ({title,action}) =>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
    <h2 style={{fontSize:18,fontWeight:700,color:"#fff",margin:0}}>{title}</h2>{action}
  </div>;
const Badge = ({children,col}) =>
  <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:`${col}22`,color:col,whiteSpace:"nowrap"}}>{children}</span>;
const NoAccess = ({t}) =>
  <div style={{textAlign:"center",padding:60,color:"#4b5563"}}><div style={{fontSize:40,marginBottom:12}}>🚫</div><div>{t.noPermission}</div></div>;
const Checkbox = ({checked,onChange,label,col="#2563eb"}) => (
  <div onClick={onChange} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:"#070b14",borderRadius:9,cursor:"pointer",border:`1px solid ${checked?col+"44":"#1e2d44"}`,transition:"all .15s",userSelect:"none"}}>
    <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${checked?col:"#374151"}`,background:checked?col:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#fff",fontWeight:700,transition:"all .2s"}}>{checked?"✓":""}</div>
    <span style={{fontSize:12,color:checked?"#93c5fd":"#6b7280"}}>{label}</span>
  </div>
);

// ════════════════════════════════════════════════════
//  APP ROOT
// ════════════════════════════════════════════════════
export default function App() {
  const [lang,setLang] = useState("ar");
  const [user,setUser] = useState(null);
  const [tab,setTab] = useState("dashboard");
  const [sideOpen,setSideOpen] = useState(false);
  const [users,setUsers] = useState(INIT_USERS);
  const [parts,setParts] = useState(INIT_PARTS);
  const [tools,setTools] = useState(INIT_TOOLS);
  const [invoices,setInvoices] = useState(INIT_INVOICES);
  const [devices,setDevices] = useState(INIT_DEVICES);
  const [log,setLog] = useState([]);
  const [toast,setToast] = useState(null);
  const [clock,setClock] = useState(new Date());
  const [lastBk,setLastBk] = useState(null);
  const [mobile,setMobile] = useState(window.innerWidth<768);
  const [storeInfo,setStoreInfo] = useState({phone:"",phone2:"",address:"",addressEn:"",maps:""});
  const [logo,setLogo] = useState("");

  const t = T[lang]; const isRtl = lang==="ar";
  const isAdmin = user?.role==="admin";
  const can = (p) => isAdmin||!!user?.permissions?.[p];

  useEffect(()=>{const i=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(i);},[]);
  useEffect(()=>{
    const h=()=>setMobile(window.innerWidth<768);
    window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h);
  },[]);
  useEffect(()=>{
    try{sessionStorage.setItem("ayser_bk",JSON.stringify({users,parts,tools,invoices,devices,ts:new Date().toISOString()}));setLastBk(new Date().toISOString());}catch(e){}
  },[users,parts,tools,invoices,devices]);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};
  const logA=(action,section,detail)=>{
    if(!user)return;
    const dt=nowDT();
    setLog(p=>[{id:genId(),userId:user.id,userName:user.name,userNameEn:user.nameEn,userRole:user.role,action,section,detail,...dt},...p].slice(0,500));
  };

  if(!user) {
    // Check if URL has tracking param
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get("track");
    if(trackId) {
      const dev = devices.find(d=>String(d.id)===trackId);
      return <TrackingPage dev={dev} trackId={trackId} lang={lang} setLang={setLang} isRtl={isRtl}/>;
    }
    return <Login t={t} lang={lang} setLang={setLang} users={users} onLogin={u=>{setUser(u);setTab("dashboard");}} isRtl={isRtl} logo={logo}/>;
  }

  const NAV=[
    {id:"dashboard",icon:"📊",label:t.dashboard,ok:true},
    {id:"devices",icon:"📱",label:t.devices,ok:can("devices_view")},
    {id:"hardware",icon:"🔧",label:t.hardware,ok:can("hardware_view")},
    {id:"software",icon:"💾",label:t.software,ok:can("software_view")},
    {id:"invoices",icon:"🧾",label:t.invoices,ok:can("invoices_view")},
    {id:"reports",icon:"📈",label:t.reports,ok:can("reports_view")},
    {id:"activity",icon:"🕵️",label:t.activityLog,ok:isAdmin},
    {id:"users",icon:"👥",label:t.users,ok:isAdmin},
    {id:"store",icon:"🏪",label:lang==="ar"?"إعدادات المتجر":"Store Settings",ok:isAdmin},
    {id:"backup",icon:"🗄️",label:t.backup,ok:isAdmin},
  ].filter(n=>n.ok);

  const go=(id)=>{setTab(id);setSideOpen(false);};

  const SidebarEl = () => (
    <aside className="sidebar-el" style={{position:"fixed",[isRtl?"right":"left"]:0,top:0,bottom:0,width:215,background:"#0a0f1e",borderInlineEnd:"1px solid #1e2d44",display:"flex",flexDirection:"column",zIndex:200,transform:mobile?(sideOpen?"translateX(0)":(isRtl?"translateX(110%)":"translateX(-110%)")):"translateX(0)",transition:"transform .25s ease",boxShadow:mobile&&sideOpen?"0 0 40px #000a":"none"}}>
      {/* Logo & Clock */}
      <div style={{padding:"12px 10px 10px",borderBottom:"1px solid #1e2d44"}}>
        <Row s={{gap:9,marginBottom:9}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,overflow:"hidden"}}>
            {logo?<img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"📱"}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{t.appTitle}</div>
            <div style={{fontSize:9,color:"#374151"}}>{t.appSubtitle}</div>
          </div>
          {mobile&&<button onClick={()=>setSideOpen(false)} style={{background:"none",border:"none",color:"#6b7280",fontSize:20,cursor:"pointer",flexShrink:0}}>✕</button>}
        </Row>
        <div style={{background:"#070b14",borderRadius:8,padding:"7px 10px",textAlign:"center"}}>
          <div style={{fontSize:19,fontWeight:700,color:"#3b82f6",fontFamily:"monospace",letterSpacing:3}}>{clock.toTimeString().slice(0,8)}</div>
          <div style={{fontSize:9,color:"#374151",marginTop:2}}>
            {clock.toLocaleDateString(isRtl?"ar-LY":"en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:"8px 6px",overflowY:"auto"}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>go(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 11px",borderRadius:9,border:"none",cursor:"pointer",marginBottom:2,background:tab===n.id?"#1e3a5f":"transparent",color:tab===n.id?"#60a5fa":"#6b7280",fontSize:13,fontWeight:tab===n.id?600:400,textAlign:isRtl?"right":"left",transition:"all .15s",borderInlineStart:tab===n.id?"3px solid #3b82f6":"3px solid transparent"}}>
            <span style={{fontSize:16}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      {/* User & Logout */}
      <div style={{padding:"8px 6px 10px",borderTop:"1px solid #1e2d44"}}>
        <div style={{background:"#070b14",borderRadius:8,padding:"8px 11px",marginBottom:7}}>
          <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{isRtl?user.name:user.nameEn}</div>
          <div style={{fontSize:10,color:"#374151",marginTop:2}}>{isAdmin?t.admin:t.technician} · @{user.username}</div>
        </div>
        <Row s={{gap:5,marginBottom:6}}>
          {["ar","en"].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:"5px",borderRadius:7,border:"1px solid",borderColor:lang===l?"#2563eb":"#1e2d44",background:lang===l?"#1e3a5f":"transparent",color:lang===l?"#60a5fa":"#374151",fontSize:11,cursor:"pointer"}}>
              {l==="ar"?"🇱🇾 ع":"🇺🇸 En"}
            </button>
          ))}
        </Row>
        <button onClick={()=>{setUser(null);setSideOpen(false);}} style={{width:"100%",padding:"7px",borderRadius:7,border:"1px solid #3f1919",background:"#1c1010",color:"#f87171",fontSize:12,cursor:"pointer"}}>
          🚪 {t.logout}
        </button>
      </div>
    </aside>
  );

  const ml = isRtl?"marginRight":"marginLeft";
  return (
    <div dir={isRtl?"rtl":"ltr"} style={{fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif",minHeight:"100vh",background:"#070b14",color:"#e2e8f0"}}>
      <GS/>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      {/* Overlay */}
      {mobile&&sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"#00000088",zIndex:199}}/>}
      <SidebarEl/>
      {/* Mobile topbar */}
      {mobile&&(
        <div className="topbar-el" style={{position:"fixed",top:0,left:0,right:0,height:50,background:"#0a0f1e",borderBottom:"1px solid #1e2d44",display:"flex",alignItems:"center",padding:"0 14px",zIndex:150,gap:12}}>
          <button onClick={()=>setSideOpen(true)} style={{background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer"}}>☰</button>
          <span style={{fontSize:14,fontWeight:800,color:"#fff"}}>{t.appTitle}</span>
          <div style={{marginInlineStart:"auto",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,fontFamily:"monospace",color:"#3b82f6"}}>{clock.toTimeString().slice(0,8)}</span>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:mobile?56:16,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"#065f46":"#7f1d1d",color:"#fff",padding:"10px 24px",borderRadius:10,zIndex:9999,fontSize:13,fontWeight:500,boxShadow:"0 8px 32px #0006",whiteSpace:"nowrap"}}>{toast.msg}</div>}
      {/* Main */}
      <main className="main-content" style={{[ml]:mobile?0:215,paddingTop:mobile?52:0,minHeight:"100vh"}}>
        <div style={{padding:mobile?"12px 10px":"22px",maxWidth:1300,margin:"0 auto"}}>
          {tab==="dashboard"&&<Dashboard t={t} parts={parts} tools={tools} invoices={invoices} devices={devices} isAdmin={isAdmin} lang={lang} mobile={mobile}/>}
          {tab==="devices"&&<DevicesSection t={t} devices={devices} setDevices={setDevices} users={users} user={user} showToast={showToast} logA={logA} lang={lang} isAdmin={isAdmin} can={can} mobile={mobile} storeInfo={storeInfo} logo={logo}/>}
          {tab==="hardware"&&<HardwareSection t={t} parts={parts} setParts={setParts} isAdmin={isAdmin} showToast={showToast} user={user} lang={lang} logA={logA} can={can} mobile={mobile}/>}
          {tab==="software"&&<SoftwareSection t={t} tools={tools} setTools={setTools} isAdmin={isAdmin} showToast={showToast} user={user} lang={lang} logA={logA} can={can} mobile={mobile}/>}
          {tab==="invoices"&&<InvoicesSection t={t} invoices={invoices} setInvoices={setInvoices} parts={parts} setParts={setParts} user={user} showToast={showToast} lang={lang} isAdmin={isAdmin} logA={logA} can={can} mobile={mobile} storeInfo={storeInfo}/>}
          {tab==="reports"&&<ReportsSection t={t} invoices={invoices} parts={parts} isAdmin={isAdmin} lang={lang} mobile={mobile} can={can}/>}
          {tab==="activity"&&isAdmin&&<ActivitySection t={t} log={log} setLog={setLog} users={users} lang={lang} mobile={mobile}/>}
          {tab==="users"&&isAdmin&&<UsersSection t={t} users={users} setUsers={setUsers} showToast={showToast} lang={lang} mobile={mobile} isRtl={isRtl}/>}
          {tab==="store"&&isAdmin&&<StoreSettings lang={lang} storeInfo={storeInfo} setStoreInfo={setStoreInfo} showToast={showToast} mobile={mobile} logo={logo} setLogo={setLogo}/>}
          {tab==="backup"&&isAdmin&&<BackupSection t={t} users={users} parts={parts} tools={tools} invoices={invoices} devices={devices} setUsers={setUsers} setParts={setParts} setTools={setTools} setInvoices={setInvoices} setDevices={setDevices} showToast={showToast} lang={lang} lastBk={lastBk} user={user} mobile={mobile}/>}
        </div>
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════
function Login({t,lang,setLang,users,onLogin,isRtl,logo}) {
  const [un,setUn]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const go=()=>{
    const u=users.find(x=>x.username===un&&x.password===pw);
    if(u){
      if(u.active===false){setErr(lang==="ar"?"هذا الحساب موقوف. تواصل مع المدير":"This account is disabled. Contact admin.");return;}
      onLogin(u);setErr("");
    }else setErr(t.invalidLogin);
  };
  return (
    <div dir={isRtl?"rtl":"ltr"} style={{minHeight:"100vh",background:"linear-gradient(135deg,#070b14,#0d1321)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif",padding:16}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/>
      <GS/>
      <div style={{position:"fixed",top:"15%",left:"5%",width:350,height:350,background:"radial-gradient(circle,#1d4ed820,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,background:"#0d1321cc",backdropFilter:"blur(20px)",borderRadius:20,border:"1px solid #1e2d44",padding:"32px 28px",boxShadow:"0 32px 80px #000a"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          {/* Logo */}
          <div style={{width:90,height:90,borderRadius:22,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 16px",overflow:"hidden",boxShadow:"0 8px 32px #2563eb44"}}>
            {logo
              ? <img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : "📱"
            }
          </div>
          <h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:0}}>{t.appTitle}</h1>
          <p style={{color:"#6b7280",fontSize:12,marginTop:5}}>{t.appSubtitle}</p>
        </div>
        <Row s={{gap:8,marginBottom:22}}>
          {["ar","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:"8px",borderRadius:9,border:"1px solid",borderColor:lang===l?"#2563eb":"#1e2d44",background:lang===l?"#1e3a5f":"transparent",color:lang===l?"#60a5fa":"#6b7280",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            {l==="ar"?"🇱🇾 العربية":"🇺🇸 English"}
          </button>)}
        </Row>
        <div style={{marginBottom:14}}><FF label={t.username}><Inp value={un} onChange={e=>setUn(e.target.value)} placeholder={t.username}/></FF></div>
        <div style={{marginBottom:18}}><FF label={t.password}><Inp type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/></FF></div>
        {err&&<div style={{background:"#7f1d1d33",border:"1px solid #7f1d1d44",borderRadius:9,padding:"9px 13px",color:"#f87171",fontSize:12,marginBottom:14,textAlign:"center"}}>{err}</div>}
        <Btn onClick={go} full s={{padding:"13px",fontSize:15}}>🚀 {t.loginBtn}</Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════
function Dashboard({t,parts,tools,invoices,devices,isAdmin,lang,mobile}) {
  const td=today();
  const todayInv=invoices.filter(i=>i.date===td);
  const todayRev=todayInv.reduce((s,i)=>s+Number(i.total),0);
  const monthInv=invoices.filter(i=>i.date.startsWith(td.slice(0,7)));
  const monthRev=monthInv.reduce((s,i)=>s+Number(i.total),0);
  const expiring=tools.filter(x=>{const d=daysLeft(x.expiryDate);return d!==null&&d<=30;});
  const waiting=devices.filter(d=>d.status==="waiting").length;
  const inProg=devices.filter(d=>d.status==="in_progress").length;
  const ready=devices.filter(d=>d.status==="ready").length;
  const cards=[
    {label:lang==="ar"?"فواتير اليوم":"Today's Invoices",v:todayInv.length,icon:"🧾",col:"#3b82f6"},
    {label:lang==="ar"?"مبيعات اليوم":"Today's Revenue",v:fmtCur(todayRev,"LYD"),icon:"💰",col:"#10b981"},
    {label:lang==="ar"?"مبيعات الشهر":"Monthly Revenue",v:fmtCur(monthRev,"LYD"),icon:"📈",col:"#8b5cf6"},
    {label:lang==="ar"?"في الانتظار":"Waiting",v:waiting,icon:"⏳",col:"#f59e0b"},
    {label:lang==="ar"?"في الصيانة":"In Progress",v:inProg,icon:"🔧",col:"#3b82f6"},
    {label:lang==="ar"?"أجهزة جاهزة":"Ready",v:ready,icon:"✅",col:"#10b981"},
    {label:lang==="ar"?"قطع الغيار":"Spare Parts",v:parts.length,icon:"🔩",col:"#06b6d4"},
    {label:lang==="ar"?"تنتهي قريباً":"Expiring Soon",v:expiring.length,icon:"⚠️",col:"#ef4444"},
  ];
  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:18}}>📊 {t.dashboard}</h2>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {cards.map((c,i)=>(
          <div key={i} style={{background:"#0d1321",border:"1px solid #1e2d44",borderRadius:14,padding:mobile?12:16,borderTop:`3px solid ${c.col}`}}>
            <div style={{fontSize:24,marginBottom:8}}>{c.icon}</div>
            <div style={{fontSize:mobile?18:22,fontWeight:700,color:"#fff"}}>{c.v}</div>
            <div style={{fontSize:mobile?10:12,color:"#6b7280",marginTop:3}}>{c.label}</div>
          </div>
        ))}
      </div>
      {/* Recent devices */}
      <Card s={{marginBottom:16}}>
        <h3 style={{fontSize:14,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>📱 {lang==="ar"?"آخر الأجهزة المستلمة":"Recent Devices"}</h3>
        {devices.slice(0,5).map(d=>(
          <div key={d.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #1e2d4422"}}>
            <div>
              <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600}}>{d.customerName} — {d.deviceType}</div>
              <div style={{fontSize:11,color:"#6b7280"}}>{lang==="ar"?d.faultType:d.faultTypeEn||d.faultType}</div>
            </div>
            <Badge col={SC[d.status]}>{SI[d.status]} {T[lang][d.status]}</Badge>
          </div>
        ))}
        {devices.length===0&&<div style={{color:"#374151",fontSize:13,textAlign:"center",padding:20}}>{t.noData}</div>}
      </Card>
      {/* Recent invoices */}
      <Card>
        <h3 style={{fontSize:14,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>🧾 {lang==="ar"?"آخر الفواتير":"Recent Invoices"}</h3>
        <div className="sx">
          <table style={{minWidth:360,width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{borderBottom:"1px solid #1e2d44"}}>
              {["#",t.customerName,t.total,t.dateTime].map((h,i)=><th key={i} style={{padding:"8px 12px",fontSize:11,color:"#6b7280",fontWeight:500,textAlign:"inherit"}}>{h}</th>)}
            </tr></thead>
            <tbody>{invoices.slice(-5).reverse().map(inv=>(
              <tr key={inv.id} style={{borderTop:"1px solid #1e2d4411"}}>
                <td style={{padding:"9px 12px",fontSize:12,color:"#3b82f6"}}>#{inv.id}</td>
                <td style={{padding:"9px 12px",fontSize:13,color:"#e2e8f0"}}>{inv.customerName}</td>
                <td style={{padding:"9px 12px",fontSize:13,color:"#10b981",fontWeight:600}}>{fmtCur(inv.total,inv.currency)}</td>
                <td style={{padding:"9px 12px",fontSize:11,color:"#374151"}}>{inv.date} {inv.time}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {invoices.length===0&&<div style={{color:"#374151",fontSize:13,textAlign:"center",padding:20}}>{t.noData}</div>}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  DEVICES SECTION
// ════════════════════════════════════════════════════
function DevicesSection({t,devices,setDevices,users,user,showToast,logA,lang,isAdmin,can,mobile,storeInfo={},logo=""}) {
  const [showF,setShowF]=useState(false); const [editId,setEditId]=useState(null);
  const [search,setSearch]=useState(""); const [fStatus,setFStatus]=useState("all");
  const [printDev,setPrintDev]=useState(null);
  const empty={customerName:"",customerPhone:"",deviceType:"",faultType:"",faultTypeEn:"",maintenanceType:"",maintenanceTypeEn:"",status:"waiting",technicianId:user.id,notes:""};
  const [form,setForm]=useState(empty);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const filtered=devices.filter(d=>{
    if(fStatus!=="all"&&d.status!==fStatus)return false;
    const q=search.toLowerCase();
    if(q&&!d.customerName.toLowerCase().includes(q)&&!d.deviceType.toLowerCase().includes(q)&&!d.customerPhone.includes(q))return false;
    return true;
  });

  const save=()=>{
    if(!form.customerName||!form.deviceType||!form.faultType)return;
    const dt=nowDT(); const tech=users.find(u=>u.id===Number(form.technicianId));
    if(editId){
      setDevices(p=>p.map(d=>d.id===editId?{...d,...form,technicianId:Number(form.technicianId),technicianName:tech?.name||"",technicianNameEn:tech?.nameEn||""}:d));
      logA("edit","devices",`${form.customerName} - ${form.deviceType}`);
      showToast(lang==="ar"?"تم تعديل بيانات الجهاز":"Device updated");
    } else {
      const nd={id:genId(),...form,technicianId:Number(form.technicianId),technicianName:tech?.name||"",technicianNameEn:tech?.nameEn||"",receivedDate:dt.date,receivedTime:dt.time,createdAt:dt.iso,addedBy:user.id};
      setDevices(p=>[nd,...p]);
      showToast(lang==="ar"?"تم استلام الجهاز بنجاح":"Device received");
      logA("add","devices",`${form.customerName} - ${form.deviceType}`);
    }
    setForm(empty);setShowF(false);setEditId(null);
  };
  const updStatus=(id,s)=>{
    setDevices(p=>p.map(d=>d.id===id?{...d,status:s}:d));
    logA("edit","devices",`#${id} → ${s}`);
    showToast(lang==="ar"?`تم تغيير الحالة إلى ${T[lang][s]}`:`Status updated to ${s}`);
  };
  const del=(id)=>{setDevices(p=>p.filter(d=>d.id!==id));logA("delete","devices",`#${id}`);};
  const startEdit=(d)=>{
    setForm({customerName:d.customerName,customerPhone:d.customerPhone,deviceType:d.deviceType,faultType:d.faultType,faultTypeEn:d.faultTypeEn||"",maintenanceType:d.maintenanceType,maintenanceTypeEn:d.maintenanceTypeEn||"",status:d.status,technicianId:d.technicianId,notes:d.notes||""});
    setEditId(d.id);setShowF(true);
  };

  if(!can("devices_view"))return <NoAccess t={t}/>;
  if(printDev) return <PrintDevice dev={printDev} t={t} lang={lang} onBack={()=>setPrintDev(null)} storeInfo={storeInfo} logo={logo}/>;

  return (
    <div>
      <PH title={`📱 ${t.devices}`} action={can("devices_add")&&<Btn onClick={()=>{setShowF(!showF);setEditId(null);setForm(empty);}}>+ {t.newDevice}</Btn>}/>

      {/* Status Summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {["waiting","in_progress","ready"].map(s=>(
          <div key={s} style={{background:`${SC[s]}11`,border:`1px solid ${SC[s]}44`,borderRadius:12,padding:mobile?"10px":"13px",textAlign:"center",cursor:"pointer",borderTop:`3px solid ${SC[s]}`}} onClick={()=>setFStatus(fStatus===s?"all":s)}>
            <div style={{fontSize:mobile?18:22}}>{SI[s]}</div>
            <div style={{fontSize:mobile?16:20,fontWeight:700,color:SC[s]}}>{devices.filter(d=>d.status===s).length}</div>
            <div style={{fontSize:mobile?10:11,color:SC[s],opacity:.8}}>{T[lang][s]}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showF&&(
        <Card s={{marginBottom:16}}>
          <h3 style={{fontSize:14,color:"#e2e8f0",marginBottom:14,fontWeight:700}}>{editId?"✏️ "+t.edit:"📥 "+t.newDevice}</h3>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:11}}>
            <FF label={t.customerName}><Inp value={form.customerName} onChange={e=>f("customerName",e.target.value)} placeholder={t.customerName}/></FF>
            <FF label={t.customerPhone}><Inp value={form.customerPhone} onChange={e=>f("customerPhone",e.target.value)} placeholder="09xxxxxxxx"/></FF>
            <FF label={t.deviceType} ><Inp value={form.deviceType} onChange={e=>f("deviceType",e.target.value)} placeholder="Samsung / iPhone ..."/></FF>
            <FF label={`${t.faultType} (عربي)`}><Inp value={form.faultType} onChange={e=>f("faultType",e.target.value)} placeholder="شاشة مكسورة..."/></FF>
            <FF label={`${t.faultType} (En)`}><Inp value={form.faultTypeEn} onChange={e=>f("faultTypeEn",e.target.value)} placeholder="Broken screen..."/></FF>
            <FF label={`${t.maintenanceType} (عربي)`}><Inp value={form.maintenanceType} onChange={e=>f("maintenanceType",e.target.value)} placeholder="استبدال شاشة..."/></FF>
            <FF label={`${t.maintenanceType} (En)`}><Inp value={form.maintenanceTypeEn} onChange={e=>f("maintenanceTypeEn",e.target.value)} placeholder="Screen replacement..."/></FF>
            <FF label={t.status}>
              <Sel value={form.status} onChange={e=>f("status",e.target.value)}>
                <option value="waiting">{t.waiting}</option>
                <option value="in_progress">{t.in_progress}</option>
                <option value="ready">{t.ready}</option>
              </Sel>
            </FF>
            {isAdmin&&<FF label={`${t.technician_}`}>
              <Sel value={form.technicianId} onChange={e=>f("technicianId",e.target.value)}>
                {users.map(u=><option key={u.id} value={u.id}>{lang==="ar"?u.name:u.nameEn}</option>)}
              </Sel>
            </FF>}
            <FF label={t.notes}><Inp value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="..."/></FF>
          </div>
          <Row s={{gap:10,marginTop:14}}><Btn onClick={save}>{t.save}</Btn><OBtn onClick={()=>{setShowF(false);setEditId(null);}}>{t.cancel}</OBtn></Row>
        </Card>
      )}

      {/* Filters */}
      <Row s={{gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} s={{maxWidth:mobile?150:200}}/>
        <Sel value={fStatus} onChange={e=>setFStatus(e.target.value)} s={{width:"auto"}}>
          <option value="all">{t.allStatuses}</option>
          <option value="waiting">{t.waiting}</option>
          <option value="in_progress">{t.in_progress}</option>
          <option value="ready">{t.ready}</option>
        </Sel>
        <span style={{fontSize:12,color:"#6b7280"}}>{filtered.length} {lang==="ar"?"جهاز":"devices"}</span>
      </Row>

      {/* Device Cards */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(300px,1fr))",gap:13}}>
        {filtered.map(d=>(
          <div key={d.id} style={{background:"#0d1321",border:`1px solid ${SC[d.status]}44`,borderRadius:14,padding:14,borderTop:`3px solid ${SC[d.status]}`}}>
            {/* Header */}
            <Row s={{justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{d.customerName}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>{d.customerPhone}</div>
              </div>
              <Badge col={SC[d.status]}>{SI[d.status]} {T[lang][d.status]}</Badge>
            </Row>
            {/* Device Info */}
            <div style={{background:"#070b14",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
              <div style={{fontSize:13,color:"#60a5fa",fontWeight:600,marginBottom:5}}>📱 {d.deviceType}</div>
              <Row s={{gap:8,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"#ef444422",color:"#f87171"}}>🔴 {lang==="ar"?d.faultType:d.faultTypeEn||d.faultType}</span>
              </Row>
              <Row s={{gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:"#8b5cf622",color:"#a78bfa"}}>🛠 {lang==="ar"?d.maintenanceType:d.maintenanceTypeEn||d.maintenanceType}</span>
              </Row>
              {d.notes&&<div style={{fontSize:11,color:"#4b5563",marginTop:6,fontStyle:"italic"}}>📝 {d.notes}</div>}
            </div>
            {/* Meta */}
            <div style={{fontSize:11,color:"#374151",marginBottom:10,lineHeight:1.7}}>
              <div>👤 {lang==="ar"?d.technicianName:d.technicianNameEn} &nbsp;|&nbsp; #{d.id}</div>
              <div>📅 {d.receivedDate} {d.receivedTime}</div>
            </div>
            {/* Status Buttons */}
            {can("devices_edit")&&(
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                {["waiting","in_progress","ready"].filter(s=>s!==d.status).map(s=>(
                  <button key={s} onClick={()=>updStatus(d.id,s)} style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${SC[s]}`,background:`${SC[s]}22`,color:SC[s],fontSize:11,cursor:"pointer",fontWeight:600}}>
                    {SI[s]} {T[lang][s]}
                  </button>
                ))}
              </div>
            )}
            {/* Actions */}
            <Row s={{gap:6}}>
              <button onClick={()=>setPrintDev(d)} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid #065f46",background:"#065f4622",color:"#34d399",fontSize:11,cursor:"pointer"}}>🖨️ {t.print}</button>
              {can("devices_edit")&&<button onClick={()=>startEdit(d)} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid #1d4ed8",background:"#1d4ed822",color:"#60a5fa",fontSize:11,cursor:"pointer"}}>{t.edit}</button>}
              {isAdmin&&<button onClick={()=>del(d.id)} style={{padding:"7px 11px",borderRadius:8,border:"1px solid #7f1d1d",background:"#7f1d1d22",color:"#f87171",fontSize:11,cursor:"pointer"}}>{t.delete}</button>}
            </Row>
          </div>
        ))}
      </div>
      {filtered.length===0&&<Card s={{textAlign:"center",color:"#374151",padding:40}}><div style={{fontSize:36,marginBottom:10}}>📭</div>{t.noData}</Card>}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  STORE SETTINGS
// ════════════════════════════════════════════════════
function StoreSettings({lang,storeInfo,setStoreInfo,showToast,mobile,logo,setLogo}) {
  const [form,setForm]=useState({...storeInfo});
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const save=()=>{setStoreInfo({...form});showToast(lang==="ar"?"تم حفظ معلومات المتجر":"Store info saved");};
  const isRtl=lang==="ar";

  const handleLogo=(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    if(!file.type.startsWith("image/")){showToast(lang==="ar"?"الرجاء اختيار صورة":"Please select an image","error");return;}
    if(file.size>2*1024*1024){showToast(lang==="ar"?"الصورة كبيرة جداً (الحد 2MB)":"Image too large (max 2MB)","error");return;}
    const reader=new FileReader();
    reader.onload=e=>setLogo(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div dir={isRtl?"rtl":"ltr"}>
      <PH title={`🏪 ${lang==="ar"?"إعدادات المتجر":"Store Settings"}`}/>

      {/* Logo Upload */}
      <Card s={{marginBottom:14}}>
        <h3 style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:16}}>🖼 {lang==="ar"?"شعار المتجر":"Store Logo"}</h3>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          {/* Preview */}
          <div style={{width:100,height:100,borderRadius:18,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,overflow:"hidden",flexShrink:0,boxShadow:"0 8px 24px #2563eb33"}}>
            {logo?<img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"📱"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:10,lineHeight:1.8}}>
              {lang==="ar"
                ?"يظهر الشعار في صفحة تسجيل الدخول والقائمة الجانبية ووصل الاستلام\nالصيغ المدعومة: PNG, JPG, WEBP (الحد الأقصى 2MB)"
                :"Logo appears in login page, sidebar and device receipts\nSupported: PNG, JPG, WEBP (max 2MB)"}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <label style={{padding:"9px 16px",borderRadius:9,border:"none",background:"linear-gradient(90deg,#2563eb,#3b82f6)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                📁 {lang==="ar"?"اختر صورة":"Choose Image"}
                <input type="file" accept="image/*" onChange={handleLogo} style={{display:"none"}}/>
              </label>
              {logo&&<button onClick={()=>setLogo("")} style={{padding:"9px 16px",borderRadius:9,border:"1px solid #7f1d1d44",background:"#7f1d1d22",color:"#f87171",fontSize:13,cursor:"pointer"}}>
                🗑 {lang==="ar"?"حذف الشعار":"Remove Logo"}
              </button>}
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card>
        <h3 style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:16}}>
          📞 {lang==="ar"?"معلومات التواصل":"Contact Information"}
        </h3>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:16}}>
          <FF label={lang==="ar"?"رقم الهاتف الأول":"Phone Number 1"}>
            <Inp value={form.phone} onChange={e=>f("phone",e.target.value)} placeholder="0911234567"/>
          </FF>
          <FF label={lang==="ar"?"رقم الهاتف الثاني (اختياري)":"Phone Number 2 (optional)"}>
            <Inp value={form.phone2} onChange={e=>f("phone2",e.target.value)} placeholder="0921234567"/>
          </FF>
          <FF label={lang==="ar"?"العنوان (عربي)":"Address (Arabic)"}>
            <Inp value={form.address} onChange={e=>f("address",e.target.value)} placeholder="طرابلس - شارع ..."/>
          </FF>
          <FF label={lang==="ar"?"العنوان (إنجليزي)":"Address (English)"}>
            <Inp value={form.addressEn} onChange={e=>f("addressEn",e.target.value)} placeholder="Tripoli - ..."/>
          </FF>
          <FF label={lang==="ar"?"رابط الموقع على الخريطة":"Google Maps Link"}>
            <Inp value={form.maps} onChange={e=>f("maps",e.target.value)} placeholder="https://maps.google.com/..."/>
          </FF>
        </div>
        {(form.phone||form.address)&&(
          <div style={{background:"#070b14",borderRadius:12,padding:14,marginBottom:16,border:"1px solid #1e2d44"}}>
            <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>👁 {lang==="ar"?"معاينة في الوصولات":"Preview in receipts"}</div>
            <div style={{fontSize:13,color:"#e2e8f0",lineHeight:2}}>
              {form.phone&&<div>📞 {form.phone}{form.phone2&&` / ${form.phone2}`}</div>}
              {form.address&&<div>📍 {lang==="ar"?form.address:form.addressEn||form.address}</div>}
            </div>
          </div>
        )}
        <Btn onClick={save} col="#065f46">💾 {lang==="ar"?"حفظ المعلومات":"Save Info"}</Btn>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  TRACKING PAGE (public - no login)
// ════════════════════════════════════════════════════
function TrackingPage({dev,trackId,lang,setLang,isRtl}) {
  const SC2={waiting:"#f59e0b",in_progress:"#3b82f6",ready:"#10b981"};
  const SI2={waiting:"⏳",in_progress:"🔧",ready:"✅"};
  const SL={ar:{waiting:"في الانتظار",in_progress:"في الصيانة",ready:"جاهز للاستلام"},en:{waiting:"Waiting",in_progress:"In Progress",ready:"Ready for Pickup"}};
  return (
    <div dir={isRtl?"rtl":"ltr"} style={{minHeight:"100vh",background:"linear-gradient(135deg,#070b14,#0d1321)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif",padding:16}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/>
      <div style={{width:"100%",maxWidth:440,background:"#0d1321",border:"1px solid #1e2d44",borderRadius:20,padding:28,boxShadow:"0 32px 80px #000a"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:24,borderBottom:"1px solid #1e2d44",paddingBottom:20}}>
          <div style={{fontSize:36,marginBottom:8}}>📱</div>
          <h1 style={{fontSize:22,fontWeight:800,color:"#fff",margin:0}}>متجر ayser</h1>
          <p style={{color:"#6b7280",fontSize:12,marginTop:4}}>{lang==="ar"?"تتبع حالة جهازك":"Track Your Device"}</p>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:12}}>
            {["ar","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:"5px 14px",borderRadius:8,border:"1px solid",borderColor:lang===l?"#2563eb":"#1e2d44",background:lang===l?"#1e3a5f":"transparent",color:lang===l?"#60a5fa":"#6b7280",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{l==="ar"?"🇱🇾 العربية":"🇺🇸 English"}</button>)}
          </div>
        </div>

        {!dev ? (
          <div style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <div style={{color:"#f87171",fontSize:15,fontWeight:600}}>{lang==="ar"?"لم يتم العثور على الجهاز":"Device Not Found"}</div>
            <div style={{color:"#6b7280",fontSize:12,marginTop:8}}>{lang==="ar"?`رقم الجهاز: #${trackId}`:`Device ID: #${trackId}`}</div>
          </div>
        ) : (
          <div>
            {/* Status Banner */}
            <div style={{background:`${SC2[dev.status]}22`,border:`2px solid ${SC2[dev.status]}`,borderRadius:14,padding:"18px 20px",textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:40,marginBottom:8}}>{SI2[dev.status]}</div>
              <div style={{fontSize:20,fontWeight:800,color:SC2[dev.status]}}>{SL[lang][dev.status]}</div>
              {dev.status==="ready"&&<div style={{fontSize:13,color:"#34d399",marginTop:6}}>{lang==="ar"?"✅ جهازك جاهز! يمكنك المجيء لاستلامه":"✅ Your device is ready! Come pick it up"}</div>}
            </div>

            {/* Device Info */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {icon:"🔢",label:lang==="ar"?"رقم الجهاز":"Device ID",val:`#${dev.id}`},
                {icon:"👤",label:lang==="ar"?"اسم العميل":"Customer",val:dev.customerName},
                {icon:"📱",label:lang==="ar"?"نوع الجهاز":"Device",val:dev.deviceType},
                {icon:"🔴",label:lang==="ar"?"نوع الخلل":"Fault",val:lang==="ar"?dev.faultType:dev.faultTypeEn||dev.faultType},
                {icon:"🛠",label:lang==="ar"?"نوع الصيانة":"Service",val:lang==="ar"?dev.maintenanceType:dev.maintenanceTypeEn||dev.maintenanceType},
                {icon:"📅",label:lang==="ar"?"تاريخ الاستلام":"Received",val:`${dev.receivedDate} ${dev.receivedTime}`},
              ].map((row,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#070b14",borderRadius:10}}>
                  <span style={{fontSize:12,color:"#6b7280"}}>{row.icon} {row.label}</span>
                  <span style={{fontSize:13,color:"#e2e8f0",fontWeight:600,maxWidth:"55%",textAlign:"end"}}>{row.val}</span>
                </div>
              ))}
            </div>

            <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#374151"}}>
              {lang==="ar"?"للاستفسار تواصل مع المتجر":"For inquiries contact the store"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  PRINT DEVICE RECEIPT (with QR)
// ════════════════════════════════════════════════════
function PrintDevice({dev,t,lang,onBack,storeInfo={},logo=""}) {
  const baseUrl = window.location.origin + window.location.pathname;
  const trackUrl = `${baseUrl}?track=${dev.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackUrl)}`;
  const isRtl = lang==="ar";
  return (
    <div dir={isRtl?"rtl":"ltr"}>
      <div className="np" style={{marginBottom:16,display:"flex",gap:10}}>
        <OBtn onClick={onBack}>← {t.cancel}</OBtn>
        <Btn onClick={()=>window.print()}>🖨️ {t.print}</Btn>
      </div>
      <div style={{maxWidth:550,margin:"0 auto",background:"#0d1321",border:"1px solid #1e2d44",borderRadius:16,padding:28}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20,borderBottom:"1px solid #1e2d44",paddingBottom:16}}>
          <div style={{width:80,height:80,borderRadius:18,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 10px",overflow:"hidden"}}>
            {logo?<img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"📱"}
          </div>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"8px 0 4px"}}>متجر ayser</h2>
          <p style={{color:"#6b7280",fontSize:11}}>وصل استلام جهاز / Device Receipt</p>
          {/* Store contact info */}
          {(storeInfo.phone||storeInfo.address)&&(
            <div style={{marginTop:10,fontSize:11,color:"#9ca3af",lineHeight:1.9}}>
              {storeInfo.phone&&<div>📞 {storeInfo.phone}{storeInfo.phone2&&` / ${storeInfo.phone2}`}</div>}
              {storeInfo.address&&<div>📍 {lang==="ar"?storeInfo.address:storeInfo.addressEn||storeInfo.address}</div>}
              {storeInfo.maps&&<div style={{color:"#60a5fa"}}>🗺 {storeInfo.maps}</div>}
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div style={{display:"flex",alignItems:"center",gap:20,background:"#070b14",borderRadius:14,padding:16,marginBottom:20,border:"1px solid #1e2d44"}}>
          <div style={{textAlign:"center",flexShrink:0}}>
            <img src={qrUrl} alt="QR" style={{width:120,height:120,borderRadius:10,background:"white",padding:4}}/>
            <div style={{fontSize:10,color:"#6b7280",marginTop:6}}>{lang==="ar"?"امسح للتتبع":"Scan to Track"}</div>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#60a5fa",marginBottom:6}}>
              {lang==="ar"?"تتبع حالة جهازك":"Track Your Device"}
            </div>
            <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.8}}>
              {lang==="ar"?"امسح رمز QR لمتابعة حالة جهازك في أي وقت بدون تسجيل دخول":"Scan QR code to check your device status anytime without login"}
            </div>
            <div style={{fontSize:10,color:"#374151",marginTop:8,wordBreak:"break-all"}}>{trackUrl}</div>
          </div>
        </div>

        {/* Device Details */}
        {[
          [t.deviceId, `#${dev.id}`],
          [t.customerName, dev.customerName],
          [t.customerPhone, dev.customerPhone],
          [t.deviceType, dev.deviceType],
          [t.faultType, `${dev.faultType} / ${dev.faultTypeEn||""}`],
          [t.maintenanceType, `${dev.maintenanceType} / ${dev.maintenanceTypeEn||""}`],
          [t.receivedDate, `${dev.receivedDate} ${dev.receivedTime}`],
          [t.technician_, `${dev.technicianName} / ${dev.technicianNameEn}`],
          [t.status, T[lang][dev.status]],
          [t.notes, dev.notes||"—"],
        ].map(([label,val],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1e2d4444"}}>
            <span style={{fontSize:12,color:"#6b7280"}}>{label}</span>
            <span style={{fontSize:13,color:"#e2e8f0",fontWeight:600,maxWidth:"60%",textAlign:"end"}}>{val}</span>
          </div>
        ))}
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"#374151"}}>ayser Store — نظام إدارة الصيانة</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  HARDWARE
// ════════════════════════════════════════════════════
function HardwareSection({t,parts,setParts,isAdmin,showToast,user,lang,logA,can,mobile}) {
  const [showF,setShowF]=useState(false); const [search,setSearch]=useState(""); const [editId,setEditId]=useState(null);
  const empty={name:"",nameEn:"",costPrice:"",sellPrice:"",stock:"",currency:"LYD"};
  const [form,setForm]=useState(empty);
  const filtered=parts.filter(p=>p.name.includes(search)||p.nameEn.toLowerCase().includes(search.toLowerCase()));
  const save=()=>{
    if(!form.name||!form.sellPrice)return;
    const dt=nowDT();
    if(editId){
      setParts(p=>p.map(x=>x.id===editId?{...x,...form,sellPrice:+form.sellPrice,costPrice:+form.costPrice,stock:+form.stock,lastEditBy:user.id,lastEditAt:dt.iso}:x));
      logA("edit","hardware",lang==="ar"?`تعديل: ${form.name}`:`Edited: ${form.nameEn}`);
    } else {
      setParts(p=>[...p,{id:genId(),...form,sellPrice:+form.sellPrice,costPrice:+form.costPrice,stock:+form.stock,addedBy:user.id,addedByName:user.name,addedByNameEn:user.nameEn,date:dt.date,time:dt.time}]);
      showToast(lang==="ar"?"تمت إضافة القطعة":"Part added");
      logA("add","hardware",lang==="ar"?`إضافة: ${form.name}`:`Added: ${form.nameEn}`);
    }
    setForm(empty);setShowF(false);setEditId(null);
  };
  const startEdit=(p)=>{setForm({name:p.name,nameEn:p.nameEn,costPrice:p.costPrice,sellPrice:p.sellPrice,stock:p.stock,currency:p.currency});setEditId(p.id);setShowF(true);};
  const del=(id)=>{const p=parts.find(x=>x.id===id);logA("delete","hardware",lang==="ar"?`حذف: ${p?.name}`:`Deleted: ${p?.nameEn}`);setParts(p=>p.filter(x=>x.id!==id));};
  if(!can("hardware_view"))return <NoAccess t={t}/>;
  return (
    <div>
      <PH title={`🔧 ${t.hardware}`} action={can("hardware_add")&&<Btn onClick={()=>{setShowF(!showF);setEditId(null);setForm(empty);}}>+ {t.addPart}</Btn>}/>
      {showF&&<Card s={{marginBottom:14}}>
        <h3 style={{fontSize:14,color:"#e2e8f0",marginBottom:12,fontWeight:700}}>{editId?"✏️ "+t.edit:"➕ "+t.addPart}</h3>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:11}}>
          <FF label={`${t.partName} (عربي)`}><Inp value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></FF>
          <FF label={`${t.partName} (En)`}><Inp value={form.nameEn} onChange={e=>setForm(p=>({...p,nameEn:e.target.value}))}/></FF>
          <FF label={t.costPriceAdmin}><Inp type="number" value={form.costPrice} onChange={e=>setForm(p=>({...p,costPrice:e.target.value}))}/></FF>
          <FF label={t.sellPrice}><Inp type="number" value={form.sellPrice} onChange={e=>setForm(p=>({...p,sellPrice:e.target.value}))}/></FF>
          <FF label={t.stock}><Inp type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))}/></FF>
          <FF label={t.currency}><Sel value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}><option value="LYD">{t.lyd}</option><option value="USD">{t.usd}</option></Sel></FF>
        </div>
        <Row s={{gap:10,marginTop:12}}><Btn onClick={save}>{t.save}</Btn><OBtn onClick={()=>{setShowF(false);setEditId(null);}}>{t.cancel}</OBtn></Row>
      </Card>}
      <div style={{marginBottom:12}}><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} s={{maxWidth:220}}/></div>
      <div className="sx">
        <table style={{minWidth:500,width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#070b14"}}>
            {[t.partName,...(isAdmin?[t.costPriceAdmin]:[]),t.sellPrice,t.stock,t.currency,t.dateTime,...(isAdmin?[t.enteredBy,""]:[])].map((h,i)=><th key={i} style={{padding:"10px 14px",fontSize:11,color:"#6b7280",fontWeight:500,textAlign:"inherit",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} style={{borderTop:"1px solid #1e2d4411"}}>
                <td style={{padding:"10px 14px",fontSize:13,color:"#e2e8f0"}}>{lang==="ar"?p.name:p.nameEn}</td>
                {isAdmin&&<td style={{padding:"10px 14px",fontSize:13,color:"#f87171"}}>{fmtCur(p.costPrice,p.currency)}</td>}
                <td style={{padding:"10px 14px",fontSize:13,color:"#10b981",fontWeight:600}}>{fmtCur(p.sellPrice,p.currency)}</td>
                <td style={{padding:"10px 14px",fontSize:13,color:p.stock<5?"#f59e0b":"#e2e8f0"}}>{p.stock}</td>
                <td style={{padding:"10px 14px",fontSize:12,color:"#6b7280"}}>{p.currency}</td>
                <td style={{padding:"10px 14px",fontSize:11,color:"#374151",whiteSpace:"nowrap"}}><div>{p.date}</div><div style={{color:"#1e2d44"}}>{p.time}</div></td>
                {isAdmin&&<td style={{padding:"10px 14px",fontSize:12,color:"#8b5cf6",whiteSpace:"nowrap"}}>{lang==="ar"?p.addedByName:p.addedByNameEn}</td>}
                {isAdmin&&<td style={{padding:"10px 14px"}}>
                  <Row s={{gap:6}}>
                    {can("hardware_edit")&&<OBtn onClick={()=>startEdit(p)} sm tc="#60a5fa" col="#1d4ed8">{t.edit}</OBtn>}
                    {can("hardware_delete")&&<OBtn onClick={()=>del(p.id)} sm tc="#f87171" col="#7f1d1d">{t.delete}</OBtn>}
                  </Row>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length===0&&<Card s={{textAlign:"center",color:"#374151",padding:30}}>{t.noData}</Card>}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  SOFTWARE
// ════════════════════════════════════════════════════
function SoftwareSection({t,tools,setTools,isAdmin,showToast,user,lang,logA,can,mobile}) {
  const [showF,setShowF]=useState(false); const [editId,setEditId]=useState(null);
  const empty={name:"",nameEn:"",price:"",currency:"USD",subscriptionType:"yearly",expiryDate:""};
  const [form,setForm]=useState(empty);
  const save=()=>{
    if(!form.name||!form.price)return;
    const dt=nowDT();
    if(editId){
      setTools(p=>p.map(x=>x.id===editId?{...x,...form,price:+form.price}:x));
      logA("edit","software",lang==="ar"?`تعديل: ${form.name}`:`Edited: ${form.nameEn}`);
    } else {
      setTools(p=>[...p,{id:genId(),...form,price:+form.price,addedBy:user.id,addedByName:user.name,addedByNameEn:user.nameEn,date:dt.date,time:dt.time}]);
      showToast(lang==="ar"?"تمت إضافة الأداة":"Tool added");
      logA("add","software",lang==="ar"?`إضافة أداة: ${form.name}`:`Added tool: ${form.nameEn}`);
    }
    setForm(empty);setShowF(false);setEditId(null);
  };
  const startEdit=(x)=>{setForm({name:x.name,nameEn:x.nameEn,price:x.price,currency:x.currency,subscriptionType:x.subscriptionType,expiryDate:x.expiryDate||""});setEditId(x.id);setShowF(true);};
  const del=(id)=>{const x=tools.find(t=>t.id===id);logA("delete","software",`${x?.name}`);setTools(p=>p.filter(t=>t.id!==id));};
  if(!can("software_view"))return <NoAccess t={t}/>;
  return (
    <div>
      <PH title={`💾 ${t.software}`} action={can("software_add")&&<Btn col="#7c3aed" onClick={()=>{setShowF(!showF);setEditId(null);setForm(empty);}}>+ {t.addTool}</Btn>}/>
      {showF&&<Card s={{marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:11}}>
          <FF label={`${t.toolName} (عربي)`}><Inp value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></FF>
          <FF label={`${t.toolName} (En)`}><Inp value={form.nameEn} onChange={e=>setForm(p=>({...p,nameEn:e.target.value}))}/></FF>
          <FF label={t.toolPrice}><Inp type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))}/></FF>
          <FF label={t.currency}><Sel value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}><option value="USD">{t.usd}</option><option value="LYD">{t.lyd}</option></Sel></FF>
          <FF label={t.subscriptionType}><Sel value={form.subscriptionType} onChange={e=>setForm(p=>({...p,subscriptionType:e.target.value}))}><option value="yearly">{t.yearly}</option><option value="lifetime">{t.lifetime}</option></Sel></FF>
          {form.subscriptionType==="yearly"&&<FF label={t.expiryDate}><Inp type="date" value={form.expiryDate} onChange={e=>setForm(p=>({...p,expiryDate:e.target.value}))}/></FF>}
        </div>
        <Row s={{gap:10,marginTop:12}}><Btn onClick={save}>{t.save}</Btn><OBtn onClick={()=>{setShowF(false);setEditId(null);}}>{t.cancel}</OBtn></Row>
      </Card>}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(270px,1fr))",gap:12}}>
        {tools.map(x=>{
          const dl=daysLeft(x.expiryDate); const warn=dl!==null&&dl<=30;
          return (
            <Card key={x.id} s={{border:`1px solid ${warn?"#f59e0b44":"#1e2d44"}`,borderTop:`3px solid ${x.subscriptionType==="lifetime"?"#10b981":"#8b5cf6"}`}}>
              <Row s={{justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{lang==="ar"?x.name:x.nameEn}</div>
                <Badge col={x.subscriptionType==="lifetime"?"#10b981":"#8b5cf6"}>{x.subscriptionType==="lifetime"?t.lifetime:t.yearly}</Badge>
              </Row>
              <div style={{fontSize:15,color:"#10b981",fontWeight:700,marginBottom:6}}>{fmtCur(x.price,x.currency)}</div>
              {x.expiryDate&&<div style={{fontSize:11,marginBottom:6,color:warn?"#f59e0b":"#6b7280"}}>
                {warn?"⚠️ ":"📅 "}{x.expiryDate} {warn&&dl!==null&&`(${dl} ${t.daysLeft})`}
              </div>}
              <div style={{fontSize:11,color:"#374151",marginBottom:10}}>
                <div>📅 {x.date} {x.time}</div>
                {isAdmin&&<div>👤 {lang==="ar"?x.addedByName:x.addedByNameEn}</div>}
              </div>
              {isAdmin&&<Row s={{gap:6}}>
                {can("software_edit")&&<OBtn onClick={()=>startEdit(x)} sm tc="#60a5fa" col="#1d4ed8" s={{flex:1}}>{t.edit}</OBtn>}
                {can("software_delete")&&<OBtn onClick={()=>del(x.id)} sm tc="#f87171" col="#7f1d1d" s={{flex:1}}>{t.delete}</OBtn>}
              </Row>}
            </Card>
          );
        })}
      </div>
      {tools.length===0&&<Card s={{textAlign:"center",color:"#374151",padding:30}}>{t.noData}</Card>}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  INVOICES
// ════════════════════════════════════════════════════
function InvoicesSection({t,invoices,setInvoices,parts,setParts,user,showToast,lang,isAdmin,logA,can,mobile}) {
  const [showF,setShowF]=useState(false); const [printInv,setPrintInv]=useState(null);
  const [form,setForm]=useState({customerName:"",customerPhone:"",items:[],currency:"LYD"});
  const [selPart,setSelPart]=useState(""); const [qty,setQty]=useState(1);
  const addItem=()=>{const p=parts.find(x=>x.id===Number(selPart));if(!p)return;setForm(f=>({...f,items:[...f.items,{partId:p.id,partName:lang==="ar"?p.name:p.nameEn,qty:+qty,price:p.sellPrice,currency:p.currency}]}));setSelPart("");setQty(1);};
  const total=form.items.reduce((s,i)=>s+i.qty*i.price,0);
  const create=()=>{
    if(!form.customerName||form.items.length===0)return;
    const dt=nowDT();
    const inv={id:genId(),...form,total,technicianId:user.id,technicianName:user.name,technicianNameEn:user.nameEn,date:dt.date,time:dt.time};
    setInvoices(p=>[...p,inv]);
    form.items.forEach(i=>setParts(p=>p.map(x=>x.id===i.partId?{...x,stock:x.stock-i.qty}:x)));
    showToast(lang==="ar"?"تم إنشاء الفاتورة":"Invoice created");
    logA("invoice","invoices",`${form.customerName} — ${fmtCur(total,"LYD")}`);
    setForm({customerName:"",customerPhone:"",items:[],currency:"LYD"});setShowF(false);
  };
  if(!can("invoices_view"))return <NoAccess t={t}/>;
  if(printInv) return <PrintInv inv={printInv} t={t} lang={lang} onBack={()=>setPrintInv(null)}/>;
  return (
    <div>
      <PH title={`🧾 ${t.invoices}`} action={can("invoices_add")&&<Btn col="#065f46" onClick={()=>setShowF(!showF)}>+ {t.newInvoice}</Btn>}/>
      {showF&&<Card s={{marginBottom:14}}>
        <h3 style={{fontSize:14,color:"#e2e8f0",marginBottom:12,fontWeight:700}}>📝 {t.newInvoice}</h3>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:11,marginBottom:12}}>
          <FF label={t.customerName}><Inp value={form.customerName} onChange={e=>setForm(p=>({...p,customerName:e.target.value}))}/></FF>
          <FF label={t.customerPhone}><Inp value={form.customerPhone} onChange={e=>setForm(p=>({...p,customerPhone:e.target.value}))}/></FF>
        </div>
        <Card s={{marginBottom:12,background:"#070b14"}}>
          <div style={{fontSize:12,color:"#6b7280",marginBottom:9}}>{t.addItem}</div>
          <Row s={{gap:8,flexWrap:"wrap"}}>
            <Sel value={selPart} onChange={e=>setSelPart(e.target.value)} s={{flex:2,minWidth:140}}>
              <option value="">{t.selectPart}</option>
              {parts.filter(p=>p.stock>0).map(p=><option key={p.id} value={p.id}>{lang==="ar"?p.name:p.nameEn} ({p.stock})</option>)}
            </Sel>
            <Inp type="number" value={qty} onChange={e=>setQty(e.target.value)} s={{width:70}} placeholder="Qty"/>
            <Btn onClick={addItem} col="#065f46" sm>+ {t.add}</Btn>
          </Row>
          {form.items.map((item,i)=>(
            <Row key={i} s={{justifyContent:"space-between",marginTop:8,padding:"7px 9px",background:"#0d1321",borderRadius:8}}>
              <span style={{fontSize:13,color:"#e2e8f0"}}>{item.partName} × {item.qty}</span>
              <Row s={{gap:8}}>
                <span style={{fontSize:13,color:"#10b981"}}>{fmtCur(item.qty*item.price,item.currency)}</span>
                <button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,idx)=>idx!==i)}))} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:14}}>✕</button>
              </Row>
            </Row>
          ))}
          {form.items.length>0&&<div style={{textAlign:"right",marginTop:10,fontSize:15,fontWeight:700,color:"#10b981"}}>{t.total}: {fmtCur(total,"LYD")}</div>}
        </Card>
        <Row s={{gap:10}}><Btn onClick={create}>{t.save}</Btn><OBtn onClick={()=>setShowF(false)}>{t.cancel}</OBtn></Row>
      </Card>}
      <div className="sx">
        <table style={{minWidth:480,width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#070b14"}}>
            {["#",t.customerName,t.customerPhone,t.total,t.dateTime,...(isAdmin?[t.enteredBy]:[]),""].map((h,i)=><th key={i} style={{padding:"10px 14px",fontSize:11,color:"#6b7280",fontWeight:500,textAlign:"inherit",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[...invoices].reverse().map(inv=>(
              <tr key={inv.id} style={{borderTop:"1px solid #1e2d4411"}}>
                <td style={{padding:"10px 14px",fontSize:12,color:"#3b82f6"}}>#{inv.id}</td>
                <td style={{padding:"10px 14px",fontSize:13,color:"#e2e8f0"}}>{inv.customerName}</td>
                <td style={{padding:"10px 14px",fontSize:12,color:"#6b7280"}}>{inv.customerPhone}</td>
                <td style={{padding:"10px 14px",fontSize:13,color:"#10b981",fontWeight:600}}>{fmtCur(inv.total,inv.currency)}</td>
                <td style={{padding:"10px 14px",fontSize:11,color:"#374151",whiteSpace:"nowrap"}}><div>{inv.date}</div><div>{inv.time}</div></td>
                {isAdmin&&<td style={{padding:"10px 14px",fontSize:12,color:"#8b5cf6",whiteSpace:"nowrap"}}>{lang==="ar"?inv.technicianName:inv.technicianNameEn}</td>}
                <td style={{padding:"10px 14px"}}><OBtn onClick={()=>setPrintInv(inv)} sm tc="#34d399" col="#065f46">🖨️</OBtn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invoices.length===0&&<Card s={{textAlign:"center",color:"#374151",padding:30}}>{t.noData}</Card>}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  PRINT INVOICE
// ════════════════════════════════════════════════════
function PrintInv({inv,t,lang,onBack}) {
  return (
    <div>
      <div className="np" style={{marginBottom:16,display:"flex",gap:10}}>
        <OBtn onClick={onBack}>← {t.cancel}</OBtn>
        <Btn onClick={()=>window.print()}>🖨️ {t.print}</Btn>
      </div>
      <div style={{maxWidth:580,margin:"0 auto",background:"#0d1321",border:"1px solid #1e2d44",borderRadius:16,padding:28}}>
        <div style={{textAlign:"center",marginBottom:20,borderBottom:"1px solid #1e2d44",paddingBottom:16}}>
          <div style={{fontSize:32}}>📱</div>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"8px 0 4px"}}>متجر ayser</h2>
          <p style={{color:"#6b7280",fontSize:11}}>ayser Store — فاتورة / Invoice</p>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
          <div><div style={{fontSize:11,color:"#6b7280"}}>{t.customerName}</div><div style={{fontSize:15,color:"#fff",fontWeight:600}}>{inv.customerName}</div><div style={{fontSize:12,color:"#9ca3af"}}>{inv.customerPhone}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"#6b7280"}}>{lang==="ar"?"فاتورة رقم":"Invoice #"}</div><div style={{fontSize:18,color:"#3b82f6",fontWeight:700}}>#{inv.id}</div><div style={{fontSize:11,color:"#6b7280"}}>{inv.date} {inv.time}</div></div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:16}}>
          <thead><tr style={{background:"#070b14"}}>{[lang==="ar"?"الصنف":"Item",t.qty,t.unitPrice,t.total].map((h,i)=><th key={i} style={{padding:"9px 12px",fontSize:11,color:"#9ca3af",textAlign:"inherit"}}>{h}</th>)}</tr></thead>
          <tbody>{inv.items.map((it,i)=><tr key={i} style={{borderTop:"1px solid #1e2d44"}}>
            <td style={{padding:"9px 12px",fontSize:13,color:"#e2e8f0"}}>{it.partName}</td>
            <td style={{padding:"9px 12px",fontSize:13,color:"#6b7280"}}>{it.qty}</td>
            <td style={{padding:"9px 12px",fontSize:13,color:"#6b7280"}}>{fmtCur(it.price,it.currency)}</td>
            <td style={{padding:"9px 12px",fontSize:13,color:"#10b981",fontWeight:600}}>{fmtCur(it.qty*it.price,it.currency)}</td>
          </tr>)}</tbody>
        </table>
        <div style={{textAlign:"right",fontSize:18,fontWeight:700,color:"#10b981",borderTop:"1px solid #1e2d44",paddingTop:12}}>{t.total}: {fmtCur(inv.total,inv.currency)}</div>
        <div style={{marginTop:16,fontSize:11,color:"#374151",textAlign:"center"}}>شكراً لثقتكم — Thank you for your trust</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  REPORTS
// ════════════════════════════════════════════════════
function ReportsSection({t,invoices,parts,isAdmin,lang,mobile,can}) {
  const [month,setMonth]=useState(today().slice(0,7));
  if(!can("reports_view"))return <NoAccess t={t}/>;
  const dayInv=invoices.filter(i=>i.date===today());
  const monInv=invoices.filter(i=>i.date.startsWith(month));
  const dayRev=dayInv.reduce((s,i)=>s+Number(i.total),0);
  const monRev=monInv.reduce((s,i)=>s+Number(i.total),0);
  const stats=[[lang==="ar"?"فواتير اليوم":"Today Invoices",dayInv.length,"🧾","#3b82f6"],[lang==="ar"?"مبيعات اليوم":"Today Revenue",fmtCur(dayRev,"LYD"),"💰","#10b981"],[lang==="ar"?"فواتير الشهر":"Month Invoices",monInv.length,"📋","#8b5cf6"],[lang==="ar"?"مبيعات الشهر":"Month Revenue",fmtCur(monRev,"LYD"),"📈","#f59e0b"]];
  return (
    <div>
      <PH title={`📈 ${t.reports}`}/>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {stats.map(([label,val,icon,col],i)=>(
          <Card key={i} s={{borderTop:`3px solid ${col}`,textAlign:"center"}}>
            <div style={{fontSize:26,marginBottom:8}}>{icon}</div>
            <div style={{fontSize:mobile?16:20,fontWeight:700,color:"#fff"}}>{val}</div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:3}}>{label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <Row s={{gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{fontSize:13,color:"#9ca3af"}}>{lang==="ar"?"تصفية الشهر:":"Filter Month:"}</div>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{...inp,width:"auto"}}/>
        </Row>
        <div className="sx">
          <table style={{minWidth:400,width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#070b14"}}>{["#",t.customerName,t.total,t.dateTime].map((h,i)=><th key={i} style={{padding:"9px 12px",fontSize:11,color:"#6b7280",fontWeight:500,textAlign:"inherit"}}>{h}</th>)}</tr></thead>
            <tbody>{monInv.map(inv=><tr key={inv.id} style={{borderTop:"1px solid #1e2d4411"}}>
              <td style={{padding:"9px 12px",fontSize:12,color:"#3b82f6"}}>#{inv.id}</td>
              <td style={{padding:"9px 12px",fontSize:13,color:"#e2e8f0"}}>{inv.customerName}</td>
              <td style={{padding:"9px 12px",fontSize:13,color:"#10b981",fontWeight:600}}>{fmtCur(inv.total,inv.currency)}</td>
              <td style={{padding:"9px 12px",fontSize:11,color:"#374151"}}>{inv.date} {inv.time}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {monInv.length===0&&<div style={{textAlign:"center",color:"#374151",padding:30}}>{t.noData}</div>}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  ACTIVITY LOG
// ════════════════════════════════════════════════════
function ActivitySection({t,log,setLog,users,lang,mobile}) {
  const [fUser,setFUser]=useState("all"); const [fAct,setFAct]=useState("all"); const [fDate,setFDate]=useState("");
  const AC={add:"#10b981",edit:"#3b82f6",delete:"#ef4444",invoice:"#8b5cf6"};
  const AI={add:"➕",edit:"✏️",delete:"🗑️",invoice:"🧾"};
  const AL={ar:{add:"إضافة",edit:"تعديل",delete:"حذف",invoice:"فاتورة"},en:{add:"Add",edit:"Edit",delete:"Delete",invoice:"Invoice"}};
  const filtered=log.filter(l=>(fUser==="all"||String(l.userId)===fUser)&&(fAct==="all"||l.action===fAct)&&(!fDate||l.date===fDate));
  const uStats=users.map(u=>({...u,total:log.filter(l=>l.userId===u.id).length,adds:log.filter(l=>l.userId===u.id&&l.action==="add").length,edits:log.filter(l=>l.userId===u.id&&l.action==="edit").length,deletes:log.filter(l=>l.userId===u.id&&l.action==="delete").length,invoices:log.filter(l=>l.userId===u.id&&l.action==="invoice").length}));
  const exp=()=>{const csv=["Date,Time,User,Role,Action,Section,Detail",...filtered.map(l=>`${l.date},${l.time},${lang==="ar"?l.userName:l.userNameEn},${l.userRole},${l.action},${l.section},"${l.detail}"`)].join("\n");const b=new Blob([csv],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`log-${today()}.csv`;a.click();URL.revokeObjectURL(u);};
  return (
    <div>
      <PH title={`🕵️ ${t.activityLog}`} action={<Row s={{gap:8}}><Btn col="#065f46" sm onClick={exp}>📤 {t.exportLog}</Btn><Btn col="#7f1d1d" sm onClick={()=>setLog([])}>🗑️ {t.clearLog}</Btn></Row>}/>
      <h3 style={{fontSize:13,color:"#6b7280",marginBottom:10}}>📊 {t.technicianPerf}</h3>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(185px,1fr))",gap:10,marginBottom:20}}>
        {uStats.map(u=>(
          <Card key={u.id} s={{padding:12}}>
            <Row s={{gap:8,marginBottom:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:u.role==="admin"?"linear-gradient(135deg,#b45309,#f59e0b)":"linear-gradient(135deg,#1d4ed8,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{u.role==="admin"?"👑":"🔧"}</div>
              <div><div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{lang==="ar"?u.name:u.nameEn}</div><div style={{fontSize:10,color:"#374151"}}>@{u.username}</div></div>
            </Row>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[{l:lang==="ar"?"إضافة":"Add",v:u.adds,c:"#10b981"},{l:lang==="ar"?"تعديل":"Edit",v:u.edits,c:"#3b82f6"},{l:lang==="ar"?"حذف":"Del",v:u.deletes,c:"#ef4444"},{l:lang==="ar"?"فواتير":"Inv",v:u.invoices,c:"#8b5cf6"}].map((s,i)=>(
                <div key={i} style={{background:"#070b14",borderRadius:7,padding:"5px",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:"#374151"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <Row s={{justifyContent:"space-between",marginTop:7,background:"#070b14",borderRadius:7,padding:"5px 8px"}}>
              <span style={{fontSize:11,color:"#374151"}}>{t.totalActions}</span>
              <span style={{fontSize:13,fontWeight:700,color:"#fbbf24"}}>{u.total}</span>
            </Row>
          </Card>
        ))}
      </div>
      <Row s={{gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <Sel value={fUser} onChange={e=>setFUser(e.target.value)} s={{width:"auto"}}><option value="all">{t.allUsers}</option>{users.map(u=><option key={u.id} value={u.id}>{lang==="ar"?u.name:u.nameEn}</option>)}</Sel>
        <Sel value={fAct} onChange={e=>setFAct(e.target.value)} s={{width:"auto"}}><option value="all">{lang==="ar"?"جميع":"All"}</option>{["add","edit","delete","invoice"].map(a=><option key={a} value={a}>{AL[lang][a]}</option>)}</Sel>
        <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{...inp,width:"auto"}}/>
        {fDate&&<OBtn onClick={()=>setFDate("")} sm>✕</OBtn>}
        <span style={{padding:"8px 12px",borderRadius:9,background:"#0d1321",border:"1px solid #1e2d44",fontSize:12,color:"#6b7280"}}>{filtered.length} {lang==="ar"?"سجل":"records"}</span>
      </Row>
      {filtered.length===0?<Card s={{textAlign:"center",color:"#374151",padding:40}}><div style={{fontSize:32,marginBottom:10}}>📋</div>{lang==="ar"?"لا توجد سجلات بعد":"No activity yet"}</Card>:(
        <div className="sx"><table style={{minWidth:500}}><thead><tr style={{background:"#070b14"}}>
          {[t.dateTime,t.enteredBy,lang==="ar"?"العملية":"Action",lang==="ar"?"القسم":"Section",lang==="ar"?"التفاصيل":"Details"].map((h,i)=><th key={i} style={{padding:"9px 13px",fontSize:11,color:"#6b7280",fontWeight:500,textAlign:"inherit",whiteSpace:"nowrap"}}>{h}</th>)}
        </tr></thead>
        <tbody>{filtered.map(l=>(
          <tr key={l.id} style={{borderTop:"1px solid #1e2d4411"}}>
            <td style={{padding:"9px 13px",whiteSpace:"nowrap"}}><div style={{fontSize:12,color:"#e2e8f0"}}>{l.date}</div><div style={{fontSize:10,color:"#374151",fontFamily:"monospace"}}>{l.time}</div></td>
            <td style={{padding:"9px 13px",whiteSpace:"nowrap"}}><div style={{fontSize:12,color:"#e2e8f0"}}>{lang==="ar"?l.userName:l.userNameEn}</div><div style={{fontSize:10,color:l.userRole==="admin"?"#fbbf24":"#60a5fa"}}>{l.userRole==="admin"?"👑":"🔧"}</div></td>
            <td style={{padding:"9px 13px"}}><Badge col={AC[l.action]||"#6b7280"}>{AI[l.action]} {AL[lang][l.action]}</Badge></td>
            <td style={{padding:"9px 13px",fontSize:12,color:"#6b7280"}}>{l.section}</td>
            <td style={{padding:"9px 13px",fontSize:12,color:"#9ca3af",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.detail}</td>
          </tr>
        ))}</tbody></table></div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  USERS + GRANULAR PERMISSIONS
// ════════════════════════════════════════════════════
function UsersSection({t,users,setUsers,showToast,lang,mobile,isRtl}) {
  const [showF,setShowF]=useState(false); const [editPermId,setEditPermId]=useState(null);
  const [showPwModal,setShowPwModal]=useState(false);
  const [pwForm,setPwForm]=useState({uid:"",current:"",newPw:"",confirm:""});
  const empty={username:"",password:"",confirmPassword:"",name:"",nameEn:"",role:"technician",permissions:{...DEFAULT_PERMS}};
  const [form,setForm]=useState(empty);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const changePassword=()=>{
    const u=users.find(x=>x.id===Number(pwForm.uid));
    if(!u){showToast(lang==="ar"?"مستخدم غير موجود":"User not found","error");return;}
    if(u.password!==pwForm.current){showToast(lang==="ar"?"كلمة المرور الحالية غير صحيحة":"Current password is incorrect","error");return;}
    if(!pwForm.newPw||pwForm.newPw.length<6){showToast(lang==="ar"?"كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)":"Password too short (min 6 chars)","error");return;}
    if(pwForm.newPw!==pwForm.confirm){showToast(lang==="ar"?"كلمتا المرور غير متطابقتين":"Passwords don't match","error");return;}
    setUsers(p=>p.map(x=>x.id===Number(pwForm.uid)?{...x,password:pwForm.newPw}:x));
    showToast(lang==="ar"?"تم تغيير كلمة المرور بنجاح":"Password changed successfully");
    setShowPwModal(false);setPwForm({uid:"",current:"",newPw:"",confirm:""});
  };

  const PERM_GROUPS=[
    {label:lang==="ar"?"🔧 قطع الغيار":"🔧 Hardware",col:"#3b82f6",keys:["hardware_view","hardware_add","hardware_edit","hardware_delete"]},
    {label:lang==="ar"?"💾 السوفتوير":"💾 Software",col:"#8b5cf6",keys:["software_view","software_add","software_edit","software_delete"]},
    {label:lang==="ar"?"📱 الأجهزة":"📱 Devices",col:"#10b981",keys:["devices_view","devices_add","devices_edit"]},
    {label:lang==="ar"?"🧾 فواتير وتقارير":"🧾 Invoices & Reports",col:"#f59e0b",keys:["invoices_view","invoices_add","reports_view"]},
  ];

  const addUser=()=>{
    if(!form.username||!form.password||form.password!==form.confirmPassword)return;
    if(users.find(u=>u.username===form.username)){showToast(lang==="ar"?"اسم المستخدم موجود بالفعل":"Username already exists","error");return;}
    setUsers(p=>[...p,{id:genId(),...form,permissions:form.role==="admin"?{...ADMIN_PERMS}:{...form.permissions}}]);
    showToast(lang==="ar"?"تم إضافة المستخدم":"User added");
    setForm(empty);setShowF(false);
  };
  const togglePerm=(uid,perm)=>setUsers(p=>p.map(u=>u.id===uid?{...u,permissions:{...u.permissions,[perm]:!u.permissions[perm]}}:u));
  const setAllPerms=(uid,val)=>setUsers(p=>p.map(u=>u.id===uid?{...u,permissions:Object.fromEntries(PERM_KEYS.map(k=>[k,val]))}:u));
  const editU=editPermId?users.find(u=>u.id===editPermId):null;

  return (
    <div>
      <PH title={`👥 ${t.users}`} action={
        <Row s={{gap:8}}>
          <Btn col="#065f46" onClick={()=>{setShowPwModal(true);setPwForm({uid:"",current:"",newPw:"",confirm:""});}}>🔑 {lang==="ar"?"تغيير كلمة المرور":"Change Password"}</Btn>
          <Btn col="#b45309" onClick={()=>setShowF(!showF)}>+ {t.addUser}</Btn>
        </Row>
      }/>

      {/* Change Password Modal */}
      {showPwModal&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0a0f1e",border:"1px solid #1e2d44",borderRadius:18,padding:24,width:"100%",maxWidth:420,fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif"}}>
            <Row s={{justifyContent:"space-between",marginBottom:20}}>
              <h3 style={{color:"#fff",fontSize:16,fontWeight:700,margin:0}}>🔑 {lang==="ar"?"تغيير كلمة المرور":"Change Password"}</h3>
              <button onClick={()=>setShowPwModal(false)} style={{background:"none",border:"none",color:"#6b7280",fontSize:22,cursor:"pointer"}}>✕</button>
            </Row>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <FF label={lang==="ar"?"اختر المستخدم":"Select User"}>
                <Sel value={pwForm.uid} onChange={e=>setPwForm(p=>({...p,uid:e.target.value}))}>
                  <option value="">{lang==="ar"?"-- اختر --":"-- Select --"}</option>
                  {users.map(u=><option key={u.id} value={u.id}>{lang==="ar"?u.name:u.nameEn} (@{u.username})</option>)}
                </Sel>
              </FF>
              <FF label={lang==="ar"?"كلمة المرور الحالية":"Current Password"}>
                <Inp type="password" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} placeholder="••••••••"/>
              </FF>
              <FF label={lang==="ar"?"كلمة المرور الجديدة":"New Password"}>
                <Inp type="password" value={pwForm.newPw} onChange={e=>setPwForm(p=>({...p,newPw:e.target.value}))} placeholder="••••••••"/>
              </FF>
              <FF label={lang==="ar"?"تأكيد كلمة المرور الجديدة":"Confirm New Password"}>
                <Inp type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} placeholder="••••••••"/>
              </FF>
              {pwForm.newPw&&pwForm.confirm&&pwForm.newPw!==pwForm.confirm&&(
                <div style={{color:"#f87171",fontSize:12,background:"#7f1d1d22",padding:"8px 12px",borderRadius:8}}>
                  ⚠️ {lang==="ar"?"كلمتا المرور غير متطابقتين":"Passwords don't match"}
                </div>
              )}
              {pwForm.newPw&&pwForm.newPw===pwForm.confirm&&pwForm.newPw.length>=6&&(
                <div style={{color:"#34d399",fontSize:12,background:"#065f4622",padding:"8px 12px",borderRadius:8}}>
                  ✅ {lang==="ar"?"كلمتا المرور متطابقتان":"Passwords match"}
                </div>
              )}
            </div>
            <Row s={{gap:10,marginTop:18}}>
              <Btn onClick={changePassword} s={{flex:1}} col="#065f46">
                {lang==="ar"?"حفظ التغييرات":"Save Changes"}
              </Btn>
              <OBtn onClick={()=>setShowPwModal(false)} s={{flex:1}}>
                {t.cancel}
              </OBtn>
            </Row>
          </div>
        </div>
      )}

      {/* Add User Form */}
      {showF&&<Card s={{marginBottom:16}}>
        <h3 style={{fontSize:14,color:"#e2e8f0",marginBottom:12,fontWeight:700}}>➕ {t.addUser}</h3>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:11,marginBottom:12}}>
          <FF label={`${t.name} (عربي)`}><Inp value={form.name} onChange={e=>f("name",e.target.value)}/></FF>
          <FF label={`${t.name} (En)`}><Inp value={form.nameEn} onChange={e=>f("nameEn",e.target.value)}/></FF>
          <FF label={t.username}><Inp value={form.username} onChange={e=>f("username",e.target.value)}/></FF>
          <FF label={t.role}><Sel value={form.role} onChange={e=>f("role",e.target.value)}><option value="admin">{t.admin}</option><option value="technician">{t.technician}</option></Sel></FF>
          <FF label={t.password}><Inp type="password" value={form.password} onChange={e=>f("password",e.target.value)}/></FF>
          <FF label={t.confirmPassword}><Inp type="password" value={form.confirmPassword} onChange={e=>f("confirmPassword",e.target.value)}/></FF>
        </div>
        {/* Permissions for new technician */}
        {form.role==="technician"&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:10,fontWeight:600}}>{t.permissions}</div>
            {PERM_GROUPS.map(group=>(
              <div key={group.label} style={{marginBottom:12}}>
                <Row s={{gap:8,marginBottom:7}}>
                  <div style={{fontSize:12,color:group.col,fontWeight:700}}>{group.label}</div>
                  <div style={{flex:1,height:1,background:"#1e2d44"}}/>
                </Row>
                <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:6}}>
                  {group.keys.map(perm=>(
                    <Checkbox key={perm} checked={!!form.permissions[perm]} col={group.col} label={t[`perm_${perm}`]||perm}
                      onChange={()=>setForm(p=>({...p,permissions:{...p.permissions,[perm]:!p.permissions[perm]}}))}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <Row s={{gap:10}}><Btn onClick={addUser}>{t.save}</Btn><OBtn onClick={()=>setShowF(false)}>{t.cancel}</OBtn></Row>
      </Card>}

      {/* Permissions Modal */}
      {editU&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0a0f1e",border:"1px solid #1e2d44",borderRadius:18,padding:22,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif"}}>
            <Row s={{justifyContent:"space-between",marginBottom:16}}>
              <div>
                <h3 style={{color:"#fff",fontSize:16,fontWeight:700,margin:0}}>{t.managePermissions}</h3>
                <div style={{fontSize:12,color:"#6b7280",marginTop:3}}>{lang==="ar"?editU.name:editU.nameEn} — @{editU.username}</div>
              </div>
              <button onClick={()=>setEditPermId(null)} style={{background:"none",border:"none",color:"#6b7280",fontSize:22,cursor:"pointer"}}>✕</button>
            </Row>
            {editU.role==="admin"?(
              <div style={{color:"#fbbf24",fontSize:13,padding:14,background:"#78350f33",borderRadius:10,textAlign:"center"}}>
                👑 {lang==="ar"?"المدير يملك جميع الصلاحيات تلقائياً":"Admin has all permissions automatically"}
              </div>
            ):(
              <div>
                {/* Quick toggles */}
                <Row s={{gap:8,marginBottom:18}}>
                  <Btn sm col="#065f46" onClick={()=>setAllPerms(editU.id,true)}>✅ {t.enableAll}</Btn>
                  <Btn sm col="#7f1d1d" onClick={()=>setAllPerms(editU.id,false)}>🚫 {t.disableAll}</Btn>
                  <span style={{fontSize:12,color:"#6b7280",marginInlineStart:"auto"}}>
                    {PERM_KEYS.filter(k=>editU.permissions[k]).length}/{PERM_KEYS.length} {lang==="ar"?"مفعّل":"enabled"}
                  </span>
                </Row>
                {PERM_GROUPS.map(group=>(
                  <div key={group.label} style={{marginBottom:16}}>
                    <Row s={{gap:8,marginBottom:8}}>
                      <div style={{fontSize:13,color:group.col,fontWeight:700}}>{group.label}</div>
                      <div style={{flex:1,height:1,background:"#1e2d44"}}/>
                      {/* Group toggle */}
                      <button onClick={()=>{
                        const allOn=group.keys.every(k=>editU.permissions[k]);
                        setUsers(p=>p.map(u=>u.id===editU.id?{...u,permissions:{...u.permissions,...Object.fromEntries(group.keys.map(k=>[k,!allOn]))}}:u));
                      }} style={{fontSize:10,padding:"3px 8px",borderRadius:6,border:`1px solid ${group.col}44`,background:`${group.col}11`,color:group.col,cursor:"pointer"}}>
                        {group.keys.every(k=>editU.permissions[k])?(lang==="ar"?"تعطيل الكل":"Disable all"):(lang==="ar"?"تفعيل الكل":"Enable all")}
                      </button>
                    </Row>
                    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:6}}>
                      {group.keys.map(perm=>(
                        <Checkbox key={perm} checked={!!editU.permissions[perm]} col={group.col}
                          label={t[`perm_${perm}`]||perm}
                          onChange={()=>togglePerm(editU.id,perm)}/>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{marginTop:16}}><Btn full onClick={()=>setEditPermId(null)}>{lang==="ar"?"حفظ وإغلاق":"Save & Close"}</Btn></div>
          </div>
        </div>
      )}

      {/* User Cards */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:13}}>
        {users.map(u=>(
          <div key={u.id} style={{background:"#0d1321",border:`1px solid ${u.active===false&&u.role!=="admin"?"#7f1d1d44":"#1e2d44"}`,borderRadius:14,padding:14,opacity:u.active===false&&u.role!=="admin"?0.7:1}}>
            <Row s={{justifyContent:"space-between",marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:u.role==="admin"?"linear-gradient(135deg,#b45309,#f59e0b)":u.active===false?"linear-gradient(135deg,#374151,#4b5563)":"linear-gradient(135deg,#1d4ed8,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{u.role==="admin"?"👑":u.active===false?"🚫":"🔧"}</div>
              <Row s={{gap:6}}>
                {u.role!=="admin"&&(
                  <Badge col={u.active===false?"#ef4444":"#10b981"}>
                    {u.active===false?(lang==="ar"?"موقوف":"Disabled"):(lang==="ar"?"نشط":"Active")}
                  </Badge>
                )}
                <Badge col={u.role==="admin"?"#f59e0b":"#3b82f6"}>{u.role==="admin"?t.admin:t.technician}</Badge>
              </Row>
            </Row>
            <div style={{fontSize:15,fontWeight:700,color:u.active===false&&u.role!=="admin"?"#6b7280":"#fff"}}>{lang==="ar"?u.name:u.nameEn}</div>
            <div style={{fontSize:11,color:"#374151",marginBottom:10}}>@{u.username}</div>
            {/* Permission Summary */}
            {u.role==="technician"&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>{t.permissions}:</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {PERM_GROUPS.map(group=>{
                    const activeInGroup=group.keys.filter(k=>u.permissions[k]).length;
                    const total=group.keys.length;
                    if(activeInGroup===0)return null;
                    return <span key={group.label} style={{padding:"2px 7px",borderRadius:20,fontSize:9,background:`${group.col}22`,color:group.col}}>
                      {group.label.split(" ").slice(-1)[0]} {activeInGroup}/{total}
                    </span>;
                  })}
                  {PERM_KEYS.filter(k=>!u.permissions[k]).length===PERM_KEYS.length&&<span style={{fontSize:9,color:"#ef4444"}}>🚫 {lang==="ar"?"لا صلاحيات":"No permissions"}</span>}
                </div>
              </div>
            )}
            <Row s={{gap:6}}>
              <button onClick={()=>setEditPermId(u.id)} style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid #b4530944",background:"#78350f22",color:"#fbbf24",fontSize:12,cursor:"pointer"}}>⚙️ {t.permissions}</button>
              {u.role!=="admin"&&(
                <button onClick={()=>setUsers(p=>p.map(x=>x.id===u.id?{...x,active:x.active===false?true:false}:x))}
                  style={{padding:"8px 10px",borderRadius:8,border:u.active===false?"1px solid #065f4644":"1px solid #7f1d1d44",background:u.active===false?"#065f4622":"#7f1d1d22",color:u.active===false?"#34d399":"#f87171",fontSize:12,cursor:"pointer"}}>
                  {u.active===false?(lang==="ar"?"تشغيل ✅":"Enable ✅"):(lang==="ar"?"إيقاف 🚫":"Disable 🚫")}
                </button>
              )}
              {u.id!==1&&<button onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))} style={{padding:"8px 12px",borderRadius:8,border:"1px solid #7f1d1d44",background:"#7f1d1d22",color:"#f87171",fontSize:12,cursor:"pointer"}}>{t.delete}</button>}
            </Row>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  BACKUP & RESTORE
// ════════════════════════════════════════════════════
function BackupSection({t,users,parts,tools,invoices,devices,setUsers,setParts,setTools,setInvoices,setDevices,showToast,lang,lastBk,user,mobile}) {
  const [confirm,setConfirm]=useState(false); const [pending,setPending]=useState(null); const [drag,setDrag]=useState(false);
  const fileRef=useRef();
  const build=()=>({version:"2.0",app:"ayser Store",savedAt:new Date().toISOString(),savedBy:lang==="ar"?user.name:user.nameEn,data:{users,parts,tools,invoices,devices}});
  const dl=()=>{const b=build();const j=JSON.stringify(b,null,2);const bl=new Blob([j],{type:"application/json"});const u=URL.createObjectURL(bl);const a=document.createElement("a");a.href=u;a.download=`ayser-backup-${today()}.json`;a.click();URL.revokeObjectURL(u);showToast(t.backupSuccess);};
  const parse=(file)=>{if(!file||!file.name.endsWith(".json")){showToast(t.invalidFile,"error");return;}const r=new FileReader();r.onload=e=>{try{const p=JSON.parse(e.target.result);if(!p.data||!p.data.users)throw new Error();setPending(p);setConfirm(true);}catch{showToast(t.invalidFile,"error");}};r.readAsText(file);};
  const restore=()=>{if(!pending)return;const d=pending.data;setUsers(d.users);setParts(d.parts);setTools(d.tools);setInvoices(d.invoices);setDevices(d.devices||[]);setConfirm(false);setPending(null);showToast(t.restoreSuccess);};
  const stats=[{icon:"🔧",c:parts.length,l:t.partsCount,col:"#3b82f6"},{icon:"💾",c:tools.length,l:t.toolsCount,col:"#8b5cf6"},{icon:"🧾",c:invoices.length,l:t.invoicesCount,col:"#10b981"},{icon:"👥",c:users.length,l:t.usersCount,col:"#f59e0b"},{icon:"📱",c:devices.length,l:t.devicesCount,col:"#06b6d4"}];
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:18}}>🗄️ {t.backup}</h2>
      {confirm&&<div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"#0a0f1e",border:"1px solid #7f1d1d44",borderRadius:16,padding:24,maxWidth:380,width:"100%"}}>
          <div style={{fontSize:36,textAlign:"center",marginBottom:10}}>⚠️</div>
          <h3 style={{color:"#fbbf24",textAlign:"center",marginBottom:9,fontSize:15}}>{t.confirmRestore}</h3>
          <p style={{fontSize:12,color:"#9ca3af",textAlign:"center",lineHeight:1.7,marginBottom:14}}>{t.restoreWarning}</p>
          {pending&&<div style={{background:"#070b14",borderRadius:9,padding:"9px 12px",fontSize:11,color:"#6b7280",marginBottom:14}}>📅 {pending.savedAt?.slice(0,10)} | 👤 {pending.savedBy}</div>}
          <Row s={{gap:10}}><Btn onClick={restore} col="#7f1d1d" s={{flex:1}}>{t.confirmRestore}</Btn><OBtn onClick={()=>{setConfirm(false);setPending(null);}} s={{flex:1}}>{t.cancel}</OBtn></Row>
        </div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <div style={{fontSize:28,marginBottom:10}}>📤</div>
          <h3 style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:12}}>{t.createBackup}</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
            {stats.map((s,i)=><div key={i} style={{background:"#070b14",borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>{s.icon}</span><div><div style={{fontSize:14,fontWeight:700,color:s.col}}>{s.c}</div><div style={{fontSize:10,color:"#374151"}}>{s.l}</div></div></div>)}
          </div>
          <Btn onClick={dl} full>⬇️ {t.downloadBackup}</Btn>
        </Card>
        <Card>
          <div style={{fontSize:28,marginBottom:10}}>📥</div>
          <h3 style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:12}}>{t.restoreBackup}</h3>
          <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);parse(e.dataTransfer.files[0]);}} onClick={()=>fileRef.current.click()} style={{border:`2px dashed ${drag?"#2563eb":"#1e2d44"}`,borderRadius:10,padding:"24px 16px",textAlign:"center",cursor:"pointer",background:drag?"#1e3a5f22":"#070b14",marginBottom:12,transition:"all .2s"}}>
            <div style={{fontSize:28,marginBottom:6}}>📂</div>
            <div style={{fontSize:11,color:drag?"#60a5fa":"#374151"}}>{lang==="ar"?"اسحب وأفلت ملف .json أو انقر للاختيار":"Drag & drop .json or click to select"}</div>
          </div>
          <input ref={fileRef} type="file" accept=".json" style={{display:"none"}} onChange={e=>parse(e.target.files[0])}/>
          <OBtn onClick={()=>fileRef.current.click()} tc="#f87171" col="#7f1d1d" s={{width:"100%",textAlign:"center"}}>📂 {t.restoreBackup}</OBtn>
        </Card>
      </div>
      <Card s={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:38,height:38,borderRadius:9,background:"#065f4622",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🔄</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{t.autoBackup}</div>
          <div style={{fontSize:11,color:"#374151",marginTop:2}}>{lang==="ar"?"آخر نسخة:":"Last:"} {lastBk?new Date(lastBk).toLocaleString(lang==="ar"?"ar-LY":"en-GB"):"-"}</div>
        </div>
        <Badge col="#10b981">✅ {lang==="ar"?"نشط":"Active"}</Badge>
      </Card>
    </div>
  );
}
