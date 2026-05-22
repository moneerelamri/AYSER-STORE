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
  purchases_view:false, purchases_add:false,
};
const ADMIN_PERMS = Object.fromEntries(Object.keys(DEFAULT_PERMS).map(k=>[k,true]));
const PERM_KEYS = Object.keys(DEFAULT_PERMS);

const INIT_USERS = [
  {id:1,username:"admin",password:"admin123",role:"admin",name:"المدير",nameEn:"Admin",permissions:{...ADMIN_PERMS}},
  {id:2,username:"tech1",password:"tech123",role:"technician",name:"فني الصيانة",nameEn:"Technician",permissions:{...DEFAULT_PERMS}},
];
const INIT_PARTS = [
  {id:1,name:"شاشة LCD",nameEn:"LCD Screen",costPrice:120,sellPrice:200,stock:15,currency:"LYD",barcode:"AY1001001",addedBy:1,addedByName:"المدير",addedByNameEn:"Admin",date:"2026-05-01",time:"09:00:00"},
  {id:2,name:"بطارية",nameEn:"Battery",costPrice:30,sellPrice:60,stock:40,currency:"LYD",barcode:"AY1001002",addedBy:1,addedByName:"المدير",addedByNameEn:"Admin",date:"2026-05-03",time:"10:30:00"},
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
    perm_purchases_view:"عرض المشتريات", perm_purchases_add:"إضافة مشتريات",
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
    perm_purchases_view:"View Purchases", perm_purchases_add:"Add Purchases",
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

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  dark:  {name:"🌙 داكن",    nameEn:"🌙 Dark",    bg:"#0f1117",sidebar:"#0d1421",card:"#151e2d",border:"#1e2e44",text:"#e2e8f0",sub:"#64748b",inp:"#131926",inpBorder:"#2a3a52",navActive:"#1a3055",navActiveTxt:"#60a5fa",accent:"#2563eb"},
  light: {name:"☀️ فاتح",    nameEn:"☀️ Light",   bg:"#f1f5f9",sidebar:"#ffffff",card:"#ffffff",border:"#e2e8f0",text:"#1e293b",sub:"#64748b",inp:"#f8fafc", inpBorder:"#cbd5e1",navActive:"#dbeafe",navActiveTxt:"#1d4ed8",accent:"#2563eb"},
  blue:  {name:"🌊 أزرق",    nameEn:"🌊 Blue",    bg:"#071428",sidebar:"#0a1e3c",card:"#0d2040",border:"#1a3a5f",text:"#e2e8f0",sub:"#6b8cba",inp:"#071428", inpBorder:"#1a3a5f",navActive:"#1a3a6e",navActiveTxt:"#60a5fa",accent:"#1d4ed8"},
  green: {name:"🌿 أخضر",   nameEn:"🌿 Green",   bg:"#071a0e",sidebar:"#0a2016",card:"#0d2518",border:"#1a4025",text:"#e2e8f0",sub:"#6bba8c",inp:"#071a0e", inpBorder:"#1a4025",navActive:"#1a4a25",navActiveTxt:"#34d399",accent:"#059669"},
  purple:{name:"💜 بنفسجي", nameEn:"💜 Purple",  bg:"#0e0a1e",sidebar:"#150d2a",card:"#1a1035",border:"#2d1b55",text:"#e2e8f0",sub:"#8b7ab8",inp:"#0e0a1e", inpBorder:"#2d1b55",navActive:"#2d1b55",navActiveTxt:"#a78bfa",accent:"#7c3aed"},
  white: {name:"🤍 أبيض",   nameEn:"🤍 White",   bg:"#ffffff", sidebar:"#f8fafc",card:"#f1f5f9",border:"#e2e8f0",text:"#0f172a",sub:"#475569",inp:"#ffffff", inpBorder:"#cbd5e1",navActive:"#e0f2fe",navActiveTxt:"#0369a1",accent:"#0284c7"},
};
const TC = (th) => THEMES[th]||THEMES.dark;

// ════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ════════════════════════════════════════════════════
const GS = () => (
  <style>{`
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#0f1117;}
    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:#161b27;}
    ::-webkit-scrollbar-thumb{background:#2a3548;border-radius:4px;}
    ::-webkit-scrollbar-thumb:hover{background:#3a4a62;}
    input,select,button,textarea{font-family:inherit;}
    .sx{overflow-x:auto;-webkit-overflow-scrolling:touch;}
    .sidebar-nav{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;min-height:0;flex:1;}
    @media print{
      .np{display:none!important;}
      .sidebar-el{display:none!important;}
      .topbar-el{display:none!important;}
      .main-content{margin:0!important;padding:0!important;}
      body{background:white!important;color:black!important;}
    }
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .card-ani{animation:fadeIn .2s ease}
  `}</style>
);
const inp = {width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none",transition:"border .15s"};
const Inp = ({value,onChange,placeholder,type="text",s={}}) =>
  <input value={value} onChange={onChange} placeholder={placeholder} type={type} style={{...inp,...s}}/>;
const Sel = ({value,onChange,children,s={}}) =>
  <select value={value} onChange={onChange} style={{...inp,...s}}>{children}</select>;
const Lbl = ({c}) => <label style={{display:"block",fontSize:11,color:"#64748b",marginBottom:5,fontWeight:500,letterSpacing:.3}}>{c}</label>;
const FF = ({label,children}) => <div><Lbl c={label}/>{children}</div>;
const Btn = ({onClick,children,col="#2563eb",s={},sm,full}) =>
  <button onClick={onClick} style={{padding:sm?"7px 13px":"10px 20px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${col},${col}cc)`,color:"#fff",fontSize:sm?12:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",width:full?"100%":"auto",boxShadow:`0 2px 8px ${col}55`,...s}}>{children}</button>;
const OBtn = ({onClick,children,col="#2a3a52",tc="#94a3b8",s={},sm}) =>
  <button onClick={onClick} style={{padding:sm?"7px 13px":"10px 16px",borderRadius:10,border:`1px solid ${col}`,background:"transparent",color:tc,fontSize:sm?12:13,cursor:"pointer",whiteSpace:"nowrap",...s}}>{children}</button>;
const Card = ({children,s={}}) =>
  <div className="card-ani" style={{background:"#151e2d",border:"1px solid #1e2e44",borderRadius:16,padding:18,...s}}>{children}</div>;
const Row = ({children,s={}}) =>
  <div style={{display:"flex",alignItems:"center",...s}}>{children}</div>;
const PH = ({title,action}) =>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
    <h2 style={{fontSize:19,fontWeight:700,color:"#e2e8f0",margin:0}}>{title}</h2>{action}
  </div>;
// Password field with show/hide toggle (proper component - no hooks in map)
function PwField({value,onChange,placeholder="••••••••"}) {
  const [show,setShow]=useState(false);
  return (
    <div style={{position:"relative"}}>
      <input value={value} onChange={onChange} type={show?"text":"password"} placeholder={placeholder} style={{...inp,paddingInlineEnd:44}}/>
      <button onClick={()=>setShow(p=>!p)} style={{position:"absolute",insetInlineEnd:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#6b7280",padding:0}}>
        {show?"🙈":"👁️"}
      </button>
    </div>
  );
}

const Badge = ({children,col}) =>
  <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:`${col}22`,color:col,whiteSpace:"nowrap"}}>{children}</span>;
const NoAccess = ({t}) =>
  <div style={{textAlign:"center",padding:60,color:"#4b5563"}}><div style={{fontSize:40,marginBottom:12}}>🚫</div><div>{t.noPermission}</div></div>;

// Password reveal component
function PasswordReveal({password,lang}) {
  const [show,setShow]=useState(false);
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,background:"#070b14",borderRadius:8,padding:"6px 10px"}}>
      <span style={{fontSize:11,color:"#6b7280",flexShrink:0}}>{lang==="ar"?"كلمة المرور:":"Password:"}</span>
      <span style={{fontSize:12,color:show?"#fbbf24":"#374151",fontFamily:"monospace",flex:1,letterSpacing:show?1:2}}>
        {show?password:"••••••••"}
      </span>
      <button onClick={()=>setShow(p=>!p)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#6b7280",padding:0,flexShrink:0}}>
        {show?"🙈":"👁️"}
      </button>
    </div>
  );
}
const Checkbox = ({checked,onChange,label,col="#2563eb"}) => (
  <div onClick={onChange} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:"#070b14",borderRadius:9,cursor:"pointer",border:`1px solid ${checked?col+"44":"#1e2d44"}`,transition:"all .15s",userSelect:"none"}}>
    <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${checked?col:"#374151"}`,background:checked?col:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#fff",fontWeight:700,transition:"all .2s"}}>{checked?"✓":""}</div>
    <span style={{fontSize:12,color:checked?"#93c5fd":"#6b7280"}}>{label}</span>
  </div>
);

// ════════════════════════════════════════════════════
//  APP ROOT
// ════════════════════════════════════════════════════

// localStorage helpers
const LS = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem("ayser_" + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem("ayser_" + key, JSON.stringify(val)); } catch {}
  }
};

export default function App() {
  const [lang,setLang] = useState(()=>LS.get("lang","ar"));
  const [user,setUser] = useState(null);
  const [tab,setTab] = useState("dashboard");
  const [sideOpen,setSideOpen] = useState(false);
  const [users,setUsers] = useState(()=>LS.get("users",INIT_USERS));
  const [parts,setParts] = useState(()=>LS.get("parts",INIT_PARTS));
  const [tools,setTools] = useState(()=>LS.get("tools",INIT_TOOLS));
  const [invoices,setInvoices] = useState(()=>LS.get("invoices",INIT_INVOICES));
  const [devices,setDevices] = useState(()=>LS.get("devices",INIT_DEVICES));
  const [log,setLog] = useState(()=>LS.get("log",[]));
  const [toast,setToast] = useState(null);
  const [lastBk,setLastBk] = useState(null);
  const [mobile,setMobile] = useState(window.innerWidth<768);
  const [storeInfo,setStoreInfo] = useState(()=>LS.get("storeInfo",{phone:"",phone2:"",address:"",addressEn:"",maps:"",siteUrl:""}));
  const [theme,setTheme] = useState(()=>LS.get("theme","dark"));
  const [logo,setLogo] = useState(()=>LS.get("logo",""));
  const [pwRequests,setPwRequests] = useState(()=>LS.get("pwRequests",[]));
  const [salaryRecords,setSalaryRecords] = useState(()=>LS.get("salaryRecords",[]));
  const [compatParts,setCompatParts] = useState(()=>LS.get("compatParts",[]));
  const [purchases,setPurchases] = useState(()=>LS.get("purchases",[]));
  const [suppliers,setSuppliers] = useState(()=>LS.get("suppliers",[]));
  const [treasury,setTreasury] = useState(()=>LS.get("treasury",{main:0,daily:0,transactions:[]}));
  const [logoutModal,setLogoutModal] = useState(false);

  const t = T[lang]; const isRtl = lang==="ar";
  const isAdmin = user?.role==="admin";
  const can = (p) => isAdmin||!!user?.permissions?.[p];

  // ── Data repair function ──────────────────────────
  const repairData = () => {
    const issues = [];
    // Fix users missing fields
    const fixedUsers = users.map(u => {
      const f = {...u};
      if(!f.permissions) { f.permissions = f.role==="admin"?{...ADMIN_PERMS}:{...DEFAULT_PERMS}; issues.push(lang==="ar"?`إصلاح صلاحيات: ${f.name}`:`Fixed permissions: ${f.nameEn}`); }
      if(f.active===undefined) { f.active = true; }
      if(!f.salary) { f.salary = ""; f.salaryType = "fixed"; }
      return f;
    });
    // Fix parts missing barcodes
    const existingCodes = parts.map(p=>p.barcode).filter(Boolean);
    const fixedParts = parts.map(p => {
      if(!p.barcode) {
        const bc = genBarcode(existingCodes);
        existingCodes.push(bc);
        issues.push(lang==="ar"?`إضافة باركود: ${p.name}`:`Added barcode: ${p.nameEn}`);
        return {...p, barcode: bc};
      }
      return p;
    });
    // Fix devices missing fields
    const fixedDevices = devices.map(d => ({
      status: "waiting", notes: "", faultTypeEn: "", maintenanceTypeEn: "", ...d
    }));
    // Fix invoices missing fields
    const fixedInvoices = invoices.map(i => ({
      currency: "LYD", items: [], ...i,
      total: Number(i.total)||0
    }));
    setUsers(fixedUsers);
    setParts(fixedParts);
    setDevices(fixedDevices);
    setInvoices(fixedInvoices);
    return issues;
  };

  // ── Backup on logout ─────────────────────────────
  const buildBackup = () => ({
    version:"2.0", app:"ayser Store",
    savedAt: new Date().toISOString(),
    savedBy: lang==="ar"?user?.name:user?.nameEn,
    data: {users,parts,tools,invoices,devices}
  });
  const downloadBackup = () => {
    const b = buildBackup();
    const bl = new Blob([JSON.stringify(b,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(bl);
    const a = document.createElement("a");
    a.href=url; a.download=`ayser-backup-${today()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const doLogout = () => { setUser(null); setSideOpen(false); setLogoutModal(false); };

  // Save everything to localStorage whenever it changes
  useEffect(()=>LS.set("users",users),[users]);
  useEffect(()=>LS.set("parts",parts),[parts]);
  useEffect(()=>LS.set("tools",tools),[tools]);
  useEffect(()=>LS.set("invoices",invoices),[invoices]);
  useEffect(()=>LS.set("devices",devices),[devices]);
  useEffect(()=>LS.set("log",log),[log]);
  useEffect(()=>LS.set("storeInfo",storeInfo),[storeInfo]);
  useEffect(()=>LS.set("logo",logo),[logo]);
  useEffect(()=>LS.set("pwRequests",pwRequests),[pwRequests]);
  useEffect(()=>LS.set("salaryRecords",salaryRecords),[salaryRecords]);
  useEffect(()=>LS.set("compatParts",compatParts),[compatParts]);
  useEffect(()=>LS.set("purchases",purchases),[purchases]);
  useEffect(()=>LS.set("suppliers",suppliers),[suppliers]);
  useEffect(()=>LS.set("treasury",treasury),[treasury]);
  useEffect(()=>LS.set("lang",lang),[lang]);
  useEffect(()=>LS.set("theme",theme),[theme]);

  useEffect(()=>{
    const h=()=>setMobile(window.innerWidth<768);
    window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h);
  },[]);
  useEffect(()=>{
    // Auto backup to sessionStorage (for backup section)
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
      // Read devices from localStorage too (for when user is not logged in)
      let allDevices = devices;
      try {
        const stored = localStorage.getItem("ayser_devices");
        if(stored) allDevices = JSON.parse(stored);
      } catch(e) {}
      const dev = allDevices.find(d=>String(d.id)===trackId);
      return <TrackingPage dev={dev} trackId={trackId} lang={lang} setLang={setLang} isRtl={isRtl}/>;
    }
    return <Login t={t} lang={lang} setLang={setLang} users={users} onLogin={u=>{setUser(u);setTab("dashboard");}} isRtl={isRtl} logo={logo} pwRequests={pwRequests} setPwRequests={setPwRequests} devices={devices}/>;
  }

  const NAV=[
    {id:"dashboard",icon:"📊",label:t.dashboard,ok:true},
    {id:"devices",icon:"📱",label:t.devices,ok:can("devices_view")},
    {id:"hardware",icon:"🔧",label:t.hardware,ok:can("hardware_view")},
    {id:"compat",icon:"🔍",label:lang==="ar"?"توافق القطع":"Parts Compat.",ok:can("hardware_view")},
    {id:"software",icon:"💾",label:t.software,ok:can("software_view")},
    {id:"invoices",icon:"🧾",label:t.invoices,ok:can("invoices_view")},
    {id:"purchases",icon:"🛒",label:lang==="ar"?"المشتريات":"Purchases",ok:can("purchases_view")||isAdmin},
    {id:"suppliers",icon:"🏪",label:lang==="ar"?"الموردون":"Suppliers",ok:isAdmin},
    {id:"reports",icon:"📈",label:t.reports,ok:can("reports_view")},
    {id:"salaries",icon:"💰",label:lang==="ar"?"المرتبات":"Salaries",ok:isAdmin},
    {id:"treasury",icon:"🏦",label:lang==="ar"?"الخزينة":"Treasury",ok:isAdmin},
    {id:"activity",icon:"🕵️",label:t.activityLog,ok:isAdmin},
    {id:"users",icon:"👥",label:t.users,ok:isAdmin,badge:pwRequests.filter(r=>!r.done).length},
    {id:"store",icon:"🏪",label:lang==="ar"?"إعدادات المتجر":"Store Settings",ok:isAdmin},
    {id:"backup",icon:"🗄️",label:t.backup,ok:isAdmin},
  ].filter(n=>n.ok);

  const go=(id)=>{setTab(id);setSideOpen(false);};

// ── Clock component — isolated so it doesn't re-render Sidebar ──
function SidebarClock({isRtl,col}) {
  const [clock,setClock] = useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(i);},[]);
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:19,fontWeight:700,color:col,fontFamily:"monospace",letterSpacing:3}}>{clock.toTimeString().slice(0,8)}</div>
      <div style={{fontSize:9,color:"#374151",marginTop:2}}>{clock.toLocaleDateString(isRtl?"ar-LY":"en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>
    </div>
  );
}

function TopbarClock({col}) {
  const [clock,setClock] = useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setClock(new Date()),1000);return()=>clearInterval(i);},[]);
  return <span style={{fontSize:12,fontFamily:"monospace",color:col}}>{clock.toTimeString().slice(0,8)}</span>;
}

// ════════════════════════════════════════════════════
//  SIDEBAR (external component — stable across renders)
// ════════════════════════════════════════════════════
function Sidebar({th,isRtl,logo,t,mobile,sideOpen,setSideOpen,lang,setLang,user,isAdmin,NAV,tab,go,theme,setTheme,setLogoutModal}) {
  return (
    <aside className="sidebar-el"
      onTouchStart={e=>e.stopPropagation()}
      onTouchMove={e=>e.stopPropagation()}
      style={{position:"fixed",[isRtl?"right":"left"]:0,top:0,bottom:0,width:215,background:th.sidebar,borderInlineEnd:`1px solid ${th.border}`,display:"flex",flexDirection:"column",zIndex:200,transform:mobile?(sideOpen?"translateX(0)":(isRtl?"translateX(110%)":"translateX(-110%)")):"translateX(0)",transition:"transform .25s ease",boxShadow:mobile&&sideOpen?"0 0 60px #000c":"none",overflow:"hidden"}}>
      {/* Logo & Clock */}
      <div style={{padding:"12px 10px 10px",borderBottom:`1px solid ${th.border}`,flexShrink:0}}>
        <Row s={{gap:9,marginBottom:9}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,overflow:"hidden"}}>
            {logo?<img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"📱"}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:800,color:th.text}}>{t.appTitle}</div>
            <div style={{fontSize:9,color:th.sub}}>{t.appSubtitle}</div>
          </div>
          {mobile&&<button onClick={()=>setSideOpen(false)} style={{background:"none",border:"none",color:th.sub,fontSize:20,cursor:"pointer",flexShrink:0}}>✕</button>}
        </Row>
        <div style={{background:th.bg,borderRadius:8,padding:"7px 10px",textAlign:"center"}}>
          <SidebarClock isRtl={isRtl} col={th.accent}/>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav style={{flex:1,overflowY:"scroll",overflowX:"hidden",WebkitOverflowScrolling:"touch",padding:"8px 6px",minHeight:0}}
        onTouchStart={e=>e.stopPropagation()}
        onTouchMove={e=>{e.stopPropagation();}}
        onTouchEnd={e=>e.stopPropagation()}
      >
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>go(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 11px",borderRadius:10,border:"none",cursor:"pointer",marginBottom:3,background:tab===n.id?th.navActive:"transparent",color:tab===n.id?th.navActiveTxt:th.sub,fontSize:13,fontWeight:tab===n.id?600:400,textAlign:isRtl?"right":"left",transition:"all .15s",borderInlineStart:tab===n.id?`3px solid ${th.accent}`:"3px solid transparent"}}>
            <span style={{fontSize:16}}>{n.icon}</span>
            <span style={{flex:1}}>{n.label}</span>
            {n.badge>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:10,minWidth:18,textAlign:"center"}}>{n.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom: user + theme + logout */}
      <div style={{padding:"8px 6px 10px",borderTop:`1px solid ${th.border}`,flexShrink:0}}>
        <div style={{background:th.bg,borderRadius:8,padding:"8px 11px",marginBottom:7}}>
          <div style={{fontSize:13,fontWeight:600,color:th.text}}>{isRtl?user.name:user.nameEn}</div>
          <div style={{fontSize:10,color:th.sub,marginTop:2}}>{isAdmin?t.admin:t.technician} · @{user.username}</div>
        </div>
        <Row s={{gap:5,marginBottom:8}}>
          {["ar","en"].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:"5px",borderRadius:7,border:"1px solid",borderColor:lang===l?th.accent:th.border,background:lang===l?th.navActive:"transparent",color:lang===l?th.navActiveTxt:th.sub,fontSize:11,cursor:"pointer"}}>
              {l==="ar"?"🇱🇾 ع":"🇺🇸 En"}
            </button>
          ))}
        </Row>
        {/* Theme Picker */}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:10,color:th.sub,marginBottom:5,fontWeight:500}}>{lang==="ar"?"🎨 المظهر":"🎨 Theme"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4}}>
            {Object.entries(THEMES).map(([key,tm])=>(
              <button key={key} onClick={()=>setTheme(key)} title={lang==="ar"?tm.name:tm.nameEn}
                style={{width:"100%",aspectRatio:"1",borderRadius:8,border:theme===key?"2px solid #fff":"2px solid transparent",background:tm.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {theme===key&&<span style={{color:"#fff",fontSize:8}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
        <button onClick={()=>setLogoutModal(true)} style={{width:"100%",padding:"8px",borderRadius:9,border:`1px solid ${th.border}`,background:"transparent",color:"#f87171",fontSize:12,cursor:"pointer"}}>
          🚪 {t.logout}
        </button>
      </div>
    </aside>
  );
}

  // ── Logout Modal ─────────────────────────────────
  const th = TC(theme);
  const ml = isRtl?"marginRight":"marginLeft";
  const sidebarProps = {th,isRtl,logo,t,mobile,sideOpen,setSideOpen,lang,setLang,user,isAdmin,NAV,tab,go,theme,setTheme,setLogoutModal};
  return (
    <div dir={isRtl?"rtl":"ltr"} style={{fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif",minHeight:"100vh",background:th.bg,color:th.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/>
      <GS/>
      {mobile&&sideOpen&&<div onClick={()=>setSideOpen(false)} onTouchStart={e=>{if(e.target===e.currentTarget)setSideOpen(false);}} style={{position:"fixed",inset:0,background:"#00000088",zIndex:199}}/>}
      <Sidebar {...sidebarProps}/>
      {logoutModal&&<LogoutModal
        lang={lang} isRtl={isRtl} user={user}
        users={users} parts={parts} tools={tools} invoices={invoices} devices={devices}
        setUsers={setUsers} setParts={setParts} setDevices={setDevices} setInvoices={setInvoices}
        onClose={()=>setLogoutModal(false)}
        onLogout={doLogout}
        buildBackup={buildBackup}
      />}
      {mobile&&(
        <div className="topbar-el" style={{position:"fixed",top:0,left:0,right:0,height:50,background:th.sidebar,borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",padding:"0 14px",zIndex:150,gap:12}}>
          <button onClick={()=>setSideOpen(true)} style={{background:"none",border:"none",color:th.sub,fontSize:22,cursor:"pointer"}}>☰</button>
          <span style={{fontSize:14,fontWeight:800,color:th.text}}>{t.appTitle}</span>
          <div style={{marginInlineStart:"auto"}}><TopbarClock col={th.accent}/></div>
        </div>
      )}
      {toast&&<div style={{position:"fixed",top:mobile?56:16,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"#065f46":"#7f1d1d",color:"#fff",padding:"10px 24px",borderRadius:10,zIndex:9999,fontSize:13,fontWeight:500,boxShadow:"0 8px 32px #0006",whiteSpace:"nowrap"}}>{toast.msg}</div>}
      <main className="main-content" style={{[ml]:mobile?0:215,paddingTop:mobile?52:0,minHeight:"100vh"}}>
        <div style={{padding:mobile?"12px 10px":"22px",maxWidth:1300,margin:"0 auto"}}>
          {tab==="dashboard"&&<Dashboard t={t} parts={parts} tools={tools} invoices={invoices} devices={devices} isAdmin={isAdmin} lang={lang} mobile={mobile}/>}
          {tab==="devices"&&<DevicesSection t={t} devices={devices} setDevices={setDevices} users={users} user={user} showToast={showToast} logA={logA} lang={lang} isAdmin={isAdmin} can={can} mobile={mobile} storeInfo={storeInfo} logo={logo}/>}
          {tab==="hardware"&&<HardwareSection t={t} parts={parts} setParts={setParts} isAdmin={isAdmin} showToast={showToast} user={user} lang={lang} logA={logA} can={can} mobile={mobile}/>}
          {tab==="compat"&&<CompatSection lang={lang} parts={parts} compatParts={compatParts} setCompatParts={setCompatParts} mobile={mobile} showToast={showToast} isAdmin={isAdmin}/> }
          {tab==="purchases"&&(can("purchases_view")||isAdmin)&&<PurchasesSection lang={lang} purchases={purchases} setPurchases={setPurchases} suppliers={suppliers} setSuppliers={setSuppliers} user={user} isAdmin={isAdmin} mobile={mobile} showToast={showToast} can={can}/>}
          {tab==="suppliers"&&isAdmin&&<SuppliersSection lang={lang} suppliers={suppliers} setSuppliers={setSuppliers} purchases={purchases} mobile={mobile} showToast={showToast}/>}
          {tab==="software"&&<SoftwareSection t={t} tools={tools} setTools={setTools} isAdmin={isAdmin} showToast={showToast} user={user} lang={lang} logA={logA} can={can} mobile={mobile}/>}
          {tab==="invoices"&&<InvoicesSection t={t} invoices={invoices} setInvoices={setInvoices} parts={parts} setParts={setParts} user={user} showToast={showToast} lang={lang} isAdmin={isAdmin} logA={logA} can={can} mobile={mobile} storeInfo={storeInfo} logo={logo}/>}
          {tab==="reports"&&<ReportsSection t={t} invoices={invoices} parts={parts} isAdmin={isAdmin} lang={lang} mobile={mobile} can={can}/>}
          {tab==="salaries"&&isAdmin&&<SalariesSection lang={lang} users={users} invoices={invoices} salaryRecords={salaryRecords} setSalaryRecords={setSalaryRecords} mobile={mobile} showToast={showToast}/>}
          {tab==="treasury"&&isAdmin&&<TreasurySection lang={lang} treasury={treasury} setTreasury={setTreasury} invoices={invoices} purchases={purchases} mobile={mobile} showToast={showToast} user={user}/>}
          {tab==="activity"&&isAdmin&&<ActivitySection t={t} log={log} setLog={setLog} users={users} lang={lang} mobile={mobile}/>}
          {tab==="users"&&isAdmin&&<UsersSection t={t} users={users} setUsers={setUsers} showToast={showToast} lang={lang} mobile={mobile} isRtl={isRtl} pwRequests={pwRequests} setPwRequests={setPwRequests} invoices={invoices} devices={devices}/>}
          {tab==="store"&&isAdmin&&<StoreSettings lang={lang} storeInfo={storeInfo} setStoreInfo={setStoreInfo} showToast={showToast} mobile={mobile} logo={logo} setLogo={setLogo}/>}
          {tab==="backup"&&isAdmin&&<BackupSection t={t} users={users} parts={parts} tools={tools} invoices={invoices} devices={devices} setUsers={setUsers} setParts={setParts} setTools={setTools} setInvoices={setInvoices} setDevices={setDevices} showToast={showToast} lang={lang} lastBk={lastBk} user={user} mobile={mobile}/>}
        </div>
      </main>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  LOGOUT MODAL (external component)
// ════════════════════════════════════════════════════
function LogoutModal({lang,isRtl,user,users,parts,tools,invoices,devices,setUsers,setParts,setDevices,setInvoices,onClose,onLogout,buildBackup}) {
  const [repairDone,setRepairDone]=useState(false);
  const [repairIssues,setRepairIssues]=useState([]);
  const [backupDone,setBackupDone]=useState(false);

  const handleRepair=()=>{
    const issues=[];
    // Fix users
    const fixedUsers=users.map(u=>{
      const f={...u};
      if(!f.permissions){f.permissions=f.role==="admin"?{...ADMIN_PERMS}:{...DEFAULT_PERMS};issues.push(lang==="ar"?`إصلاح صلاحيات: ${f.name}`:`Fixed perms: ${f.nameEn}`);}
      if(f.active===undefined)f.active=true;
      if(!f.salary){f.salary="";f.salaryType="fixed";}
      return f;
    });
    // Fix parts barcodes
    const existingCodes=parts.map(p=>p.barcode).filter(Boolean);
    const fixedParts=parts.map(p=>{
      if(!p.barcode){const bc=genBarcode(existingCodes);existingCodes.push(bc);issues.push(lang==="ar"?`باركود: ${p.name}`:`Barcode: ${p.nameEn}`);return{...p,barcode:bc};}
      return p;
    });
    const fixedDevices=devices.map(d=>({status:"waiting",notes:"",faultTypeEn:"",maintenanceTypeEn:"",...d}));
    const fixedInvoices=invoices.map(i=>({currency:"LYD",items:[],...i,total:Number(i.total)||0}));
    setUsers(fixedUsers);setParts(fixedParts);setDevices(fixedDevices);setInvoices(fixedInvoices);
    setRepairIssues(issues);setRepairDone(true);
  };

  const handleBackup=()=>{
    const b=buildBackup();
    const bl=new Blob([JSON.stringify(b,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(bl);
    const a=document.createElement("a");
    a.href=url;a.download=`ayser-backup-${today()}.json`;a.click();
    URL.revokeObjectURL(url);
    setBackupDone(true);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} dir={isRtl?"rtl":"ltr"}>
      <div style={{background:"#0a0f1e",border:"1px solid #1e2d44",borderRadius:20,padding:28,width:"100%",maxWidth:440,fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:44,marginBottom:8}}>👋</div>
          <h3 style={{color:"#fff",fontSize:18,fontWeight:700,margin:0}}>{lang==="ar"?"هل تريد تسجيل الخروج؟":"Ready to sign out?"}</h3>
          <div style={{fontSize:12,color:"#6b7280",marginTop:6}}>{lang==="ar"?`مرحباً ${user?.name}`:`Hello, ${user?.nameEn}`}</div>
        </div>
        {/* Repair */}
        <div style={{background:"#070b14",border:`1px solid ${repairDone?"#10b98144":"#1e2d44"}`,borderRadius:14,padding:14,marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:22}}>🔧</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{lang==="ar"?"تصليح المنظومة":"Repair System"}</div>
              <div style={{fontSize:11,color:"#6b7280"}}>{lang==="ar"?"فحص وإصلاح أي أخطاء في البيانات":"Check and fix any data errors"}</div>
            </div>
          </div>
          {!repairDone?(
            <button onClick={handleRepair} style={{width:"100%",padding:"9px",borderRadius:9,border:"none",background:"linear-gradient(90deg,#1d4ed8,#2563eb)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              🔍 {lang==="ar"?"فحص وتصليح":"Check & Repair"}
            </button>
          ):(
            <div>
              <div style={{color:"#34d399",fontSize:13,fontWeight:600,marginBottom:6}}>✅ {lang==="ar"?"تم الفحص":"Check complete"}</div>
              {repairIssues.length===0
                ?<div style={{fontSize:12,color:"#6b7280"}}>{lang==="ar"?"✓ البيانات سليمة":"✓ No issues found"}</div>
                :<div style={{maxHeight:80,overflowY:"auto"}}>{repairIssues.map((iss,i)=><div key={i} style={{fontSize:11,color:"#fbbf24",marginBottom:2}}>• {iss}</div>)}</div>
              }
            </div>
          )}
        </div>
        {/* Backup */}
        <div style={{background:"#070b14",border:`1px solid ${backupDone?"#10b98144":"#1e2d44"}`,borderRadius:14,padding:14,marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:22}}>💾</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{lang==="ar"?"نسخة احتياطية":"Backup Data"}</div>
              <div style={{fontSize:11,color:"#6b7280"}}>{lang==="ar"?`${users.length} مستخدم · ${invoices.length} فاتورة · ${devices.length} جهاز`:`${users.length} users · ${invoices.length} invoices · ${devices.length} devices`}</div>
            </div>
          </div>
          {!backupDone
            ?<button onClick={handleBackup} style={{width:"100%",padding:"9px",borderRadius:9,border:"none",background:"linear-gradient(90deg,#065f46,#10b981)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>⬇️ {lang==="ar"?"تحميل نسخة احتياطية":"Download Backup"}</button>
            :<div style={{color:"#34d399",fontSize:13,fontWeight:600}}>✅ {lang==="ar"?"تم تحميل النسخة":"Backup downloaded"}</div>
          }
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <button onClick={onLogout} style={{padding:"11px",borderRadius:11,border:"1px solid #7f1d1d44",background:"#7f1d1d22",color:"#f87171",fontSize:14,fontWeight:700,cursor:"pointer"}}>🚪 {lang==="ar"?"خروج":"Sign Out"}</button>
          <button onClick={onClose} style={{padding:"11px",borderRadius:11,border:"1px solid #1e2d44",background:"#111827",color:"#9ca3af",fontSize:14,fontWeight:600,cursor:"pointer"}}>← {lang==="ar"?"رجوع":"Back"}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════
function Login({t,lang,setLang,users,onLogin,isRtl,logo,pwRequests,setPwRequests,devices=[]}) {
  const [un,setUn]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [showForgot,setShowForgot]=useState(false);
  const [showTrack,setShowTrack]=useState(false);
  const [trackId,setTrackId]=useState("");
  const [trackResult,setTrackResult]=useState(null);
  const [forgotUn,setForgotUn]=useState(""); const [forgotSent,setForgotSent]=useState(false);

  const doTrack=()=>{
    if(!trackId.trim())return;
    // Read from localStorage first
    let allDevices=devices;
    try{const s=localStorage.getItem("ayser_devices");if(s)allDevices=JSON.parse(s);}catch(e){}
    const found=allDevices.find(d=>String(d.id)===trackId.trim());
    setTrackResult(found||"notfound");
  };

  const go=()=>{
    const u=users.find(x=>x.username===un&&x.password===pw);
    if(u){
      if(u.active===false){setErr(lang==="ar"?"هذا الحساب موقوف. تواصل مع المدير":"This account is disabled. Contact admin.");return;}
      onLogin(u);setErr("");
    }else setErr(t.invalidLogin);
  };

  const sendForgot=()=>{
    const u=users.find(x=>x.username===forgotUn&&x.role!=="admin");
    if(!u){setErr(lang==="ar"?"اسم المستخدم غير موجود":"Username not found");return;}
    const req={id:genId(),userId:u.id,userName:u.name,userNameEn:u.nameEn,username:u.username,requestedAt:nowDT().iso,date:nowDT().date,time:nowDT().time,done:false};
    setPwRequests(p=>[req,...p]);
    setForgotSent(true);
  };

  return (
    <div dir={isRtl?"rtl":"ltr"} style={{minHeight:"100vh",background:"linear-gradient(135deg,#070b14,#0d1321)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif",padding:16}}>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/>
      <GS/>
      <div style={{position:"fixed",top:"15%",left:"5%",width:350,height:350,background:"radial-gradient(circle,#1d4ed820,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,background:"#0d1321cc",backdropFilter:"blur(20px)",borderRadius:20,border:"1px solid #1e2d44",padding:"32px 28px",boxShadow:"0 32px 80px #000a"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:90,height:90,borderRadius:22,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 16px",overflow:"hidden",boxShadow:"0 8px 32px #2563eb44"}}>
            {logo?<img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"📱"}
          </div>
          <h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:0}}>{t.appTitle}</h1>
          <p style={{color:"#6b7280",fontSize:12,marginTop:5}}>{t.appSubtitle}</p>
        </div>

        {!showForgot ? (
          <>
            <Row s={{gap:8,marginBottom:22}}>
              {["ar","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:"8px",borderRadius:9,border:"1px solid",borderColor:lang===l?"#2563eb":"#1e2d44",background:lang===l?"#1e3a5f":"transparent",color:lang===l?"#60a5fa":"#6b7280",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                {l==="ar"?"🇱🇾 العربية":"🇺🇸 English"}
              </button>)}
            </Row>
            <div style={{marginBottom:14}}><FF label={t.username}><Inp value={un} onChange={e=>setUn(e.target.value)} placeholder={t.username}/></FF></div>
            <div style={{marginBottom:8}}>
              <FF label={t.password}>
                <div style={{position:"relative"}}>
                  <input value={pw} onChange={e=>setPw(e.target.value)} type={showPw?"text":"password"} placeholder="••••••••"
                    onKeyDown={e=>e.key==="Enter"&&go()}
                    style={{...inp,paddingInlineEnd:44}}/>
                  <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",insetInlineEnd:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#6b7280",padding:0}}>
                    {showPw?"🙈":"👁️"}
                  </button>
                </div>
              </FF>
            </div>
            {/* Forgot password link */}
            <div style={{textAlign:isRtl?"left":"right",marginBottom:16}}>
              <button onClick={()=>{setShowForgot(true);setErr("");setForgotSent(false);setForgotUn("");}} style={{background:"none",border:"none",color:"#60a5fa",fontSize:12,cursor:"pointer",textDecoration:"underline"}}>
                🔑 {lang==="ar"?"نسيت كلمة المرور؟":"Forgot password?"}
              </button>
            </div>
            {err&&<div style={{background:"#7f1d1d33",border:"1px solid #7f1d1d44",borderRadius:9,padding:"9px 13px",color:"#f87171",fontSize:12,marginBottom:14,textAlign:"center"}}>{err}</div>}
            <Btn onClick={go} full s={{padding:"13px",fontSize:15}}>🚀 {t.loginBtn}</Btn>
          </>
        ) : (
          <div>
            <h3 style={{color:"#fff",fontSize:15,fontWeight:700,marginBottom:14,textAlign:"center"}}>
              🔑 {lang==="ar"?"نسيت كلمة المرور؟":"Forgot Password?"}
            </h3>
            {!forgotSent ? (
              <>
                <p style={{fontSize:12,color:"#6b7280",marginBottom:16,textAlign:"center",lineHeight:1.8}}>
                  {lang==="ar"?"أدخل اسم المستخدم الخاص بك وسيصل إشعار للمدير لتغيير كلمة المرور":"Enter your username and an alert will be sent to admin to reset your password"}
                </p>
                <div style={{marginBottom:14}}><FF label={t.username}><Inp value={forgotUn} onChange={e=>setForgotUn(e.target.value)} placeholder={t.username}/></FF></div>
                {err&&<div style={{background:"#7f1d1d33",border:"1px solid #7f1d1d44",borderRadius:9,padding:"9px 13px",color:"#f87171",fontSize:12,marginBottom:12,textAlign:"center"}}>{err}</div>}
                <Row s={{gap:10}}>
                  <Btn onClick={sendForgot} s={{flex:1}}>📨 {lang==="ar"?"إرسال الطلب":"Send Request"}</Btn>
                  <OBtn onClick={()=>{setShowForgot(false);setErr("");}} s={{flex:1}}>{lang==="ar"?"رجوع":"Back"}</OBtn>
                </Row>
              </>
            ) : (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:12}}>✅</div>
                <p style={{color:"#34d399",fontSize:14,fontWeight:600,marginBottom:8}}>
                  {lang==="ar"?"تم إرسال الطلب بنجاح!":"Request sent successfully!"}
                </p>
                <p style={{color:"#6b7280",fontSize:12,marginBottom:20,lineHeight:1.8}}>
                  {lang==="ar"?"تواصل مع المدير وسيقوم بتغيير كلمة المرور الخاصة بك":"Contact the admin and they will reset your password"}
                </p>
                <OBtn onClick={()=>{setShowForgot(false);setForgotSent(false);}} s={{width:"100%",textAlign:"center"}}>
                  ← {lang==="ar"?"رجوع لتسجيل الدخول":"Back to Login"}
                </OBtn>
              </div>
            )}
          </div>
        )}
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
  const save=()=>{
    setStoreInfo({...form});
    if(form.siteUrl) try{localStorage.setItem("ayser_siteUrl",form.siteUrl);}catch(e){}
    showToast(lang==="ar"?"تم حفظ معلومات المتجر":"Store info saved");
  };
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
          <FF label={lang==="ar"?"رابط الموقع (للـ QR Code)":"Website URL (for QR Code)"}>
            <Inp value={form.siteUrl||""} onChange={e=>f("siteUrl",e.target.value)} placeholder="https://ayser-store.moneer-elamri.workers.dev"/>
          </FF>
          <FF label={lang==="ar"?"رابط Google Maps":"Google Maps Link"}>
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
  // Use Cloudflare URL if running in Electron (file://) or fallback to current origin
  const baseUrl = window.location.protocol === "file:"
    ? (storeInfo.siteUrl || (() => { try{ return localStorage.getItem("ayser_siteUrl")||"https://ayser-store.moneer-elamri.workers.dev"; }catch(e){ return "https://ayser-store.moneer-elamri.workers.dev"; } })())
    : window.location.origin + window.location.pathname;
  const trackUrl = `${baseUrl}?track=${dev.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(trackUrl)}`;
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
//  BARCODE GENERATOR HELPER
// ════════════════════════════════════════════════════
const genBarcode = (existingCodes=[]) => {
  let code;
  do { code = "AY" + String(Math.floor(Math.random()*9000000+1000000)); }
  while(existingCodes.includes(code));
  return code;
};

// Draw barcode on canvas using Code128-like visual
function BarcodeCanvas({code,width=200,height=60}) {
  const ref = useRef();
  useEffect(()=>{
    if(!ref.current||!code)return;
    const canvas=ref.current; const ctx=canvas.getContext("2d");
    canvas.width=width; canvas.height=height;
    ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,width,height);
    // Simple visual barcode from code chars
    const bars=[1,0,1,1,0,1,0,0,1,1]; // start
    for(let i=0;i<code.length;i++){
      const c=code.charCodeAt(i);
      for(let b=0;b<8;b++) bars.push((c>>b)&1);
    }
    bars.push(...[1,1,0,1,0,1,1,0,1,0,1]); // stop
    const bw=width/bars.length;
    bars.forEach((b,i)=>{
      ctx.fillStyle=b?"#000000":"#ffffff";
      ctx.fillRect(i*bw,0,bw,height*0.85);
    });
    ctx.fillStyle="#000000"; ctx.font=`${Math.min(10,height*0.14)}px monospace`;
    ctx.textAlign="center"; ctx.fillText(code,width/2,height);
  },[code,width,height]);
  return <canvas ref={ref} style={{display:"block"}}/>;
}

// ════════════════════════════════════════════════════
//  HARDWARE
// ════════════════════════════════════════════════════
function HardwareSection({t,parts,setParts,isAdmin,showToast,user,lang,logA,can,mobile}) {
  const [showF,setShowF]=useState(false);
  const [search,setSearch]=useState("");
  const [editId,setEditId]=useState(null);
  const [printPart,setPrintPart]=useState(null);
  const [scanning,setScanning]=useState(false);
  const [scanResult,setScanResult]=useState("");
  const [scanInput,setScanInput]=useState("");
  const empty={name:"",nameEn:"",costPrice:"",sellPrice:"",stock:"",currency:"LYD"};
  const [form,setForm]=useState(empty);

  const filtered=parts.filter(p=>
    p.name.includes(search)||
    p.nameEn.toLowerCase().includes(search.toLowerCase())||
    (p.barcode&&p.barcode.includes(search))
  );

  const save=()=>{
    if(!form.name||!form.sellPrice)return;
    const dt=nowDT();
    if(editId){
      setParts(p=>p.map(x=>x.id===editId?{...x,...form,sellPrice:+form.sellPrice,costPrice:+form.costPrice,stock:+form.stock,lastEditBy:user.id,lastEditAt:dt.iso}:x));
      logA("edit","hardware",lang==="ar"?`تعديل: ${form.name}`:`Edited: ${form.nameEn}`);
    } else {
      const allCodes=parts.map(x=>x.barcode).filter(Boolean);
      const bc=genBarcode(allCodes);
      setParts(p=>[...p,{id:genId(),...form,barcode:bc,sellPrice:+form.sellPrice,costPrice:+form.costPrice,stock:+form.stock,addedBy:user.id,addedByName:user.name,addedByNameEn:user.nameEn,date:dt.date,time:dt.time}]);
      showToast(lang==="ar"?"تمت إضافة القطعة":"Part added");
      logA("add","hardware",lang==="ar"?`إضافة: ${form.name}`:`Added: ${form.nameEn}`);
    }
    setForm(empty);setShowF(false);setEditId(null);
  };

  const startEdit=(p)=>{setForm({name:p.name,nameEn:p.nameEn,costPrice:p.costPrice,sellPrice:p.sellPrice,stock:p.stock,currency:p.currency});setEditId(p.id);setShowF(true);};
  const del=(id)=>{const p=parts.find(x=>x.id===id);logA("delete","hardware",lang==="ar"?`حذف: ${p?.name}`:`Deleted: ${p?.nameEn}`);setParts(p=>p.filter(x=>x.id!==id));};

  // Barcode scan lookup
  const doScan=()=>{
    const found=parts.find(p=>p.barcode===scanInput.trim());
    if(found){setScanResult(found);setScanInput("");}
    else{setScanResult("notfound");setScanInput("");}
  };

  if(!can("hardware_view"))return <NoAccess t={t}/>;

  // Print barcode label view
  if(printPart) return (
    <div>
      <div className="np" style={{marginBottom:16,display:"flex",gap:10}}>
        <OBtn onClick={()=>setPrintPart(null)}>← {t.cancel}</OBtn>
        <Btn onClick={()=>window.print()}>🖨️ {t.print}</Btn>
      </div>
      <div style={{maxWidth:340,margin:"0 auto",background:"#fff",borderRadius:12,padding:20,textAlign:"center",border:"2px solid #1e2d44"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#000",marginBottom:4}}>متجر ayser</div>
        <div style={{fontSize:14,fontWeight:800,color:"#000",marginBottom:2}}>{lang==="ar"?printPart.name:printPart.nameEn}</div>
        <div style={{fontSize:12,color:"#374151",marginBottom:8}}>{fmtCur(printPart.sellPrice,printPart.currency)}</div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
          <BarcodeCanvas code={printPart.barcode} width={220} height={65}/>
        </div>
        <div style={{fontSize:11,color:"#374151",fontFamily:"monospace",letterSpacing:2}}>{printPart.barcode}</div>
      </div>
    </div>
  );

  return (
    <div>
      <PH title={`🔧 ${t.hardware}`} action={
        <Row s={{gap:8}}>
          <OBtn onClick={()=>setScanning(!scanning)} tc="#fbbf24" col="#78350f" sm>
            📷 {lang==="ar"?"قراءة باركود":"Scan Barcode"}
          </OBtn>
          {can("hardware_add")&&<Btn onClick={()=>{setShowF(!showF);setEditId(null);setForm(empty);}}>+ {t.addPart}</Btn>}
        </Row>
      }/>

      {/* Barcode Scanner Panel */}
      {scanning&&(
        <Card s={{marginBottom:14,border:"1px solid #78350f44",background:"#1c1008"}}>
          <h3 style={{fontSize:13,color:"#fbbf24",marginBottom:12,fontWeight:700}}>
            📷 {lang==="ar"?"قراءة الباركود":"Barcode Scanner"}
          </h3>
          <div style={{fontSize:11,color:"#6b7280",marginBottom:10}}>
            {lang==="ar"
              ?"اتصل بقارئ الباركود الخارجي أو اكتب الباركود يدوياً ثم اضغط Enter"
              :"Connect external barcode scanner or type barcode manually then press Enter"}
          </div>
          <Row s={{gap:8}}>
            <Inp
              value={scanInput}
              onChange={e=>setScanInput(e.target.value)}
              placeholder={lang==="ar"?"امسح أو اكتب الباركود...":"Scan or type barcode..."}
              s={{flex:1,fontSize:14,fontFamily:"monospace"}}
              onKeyDown={e=>e.key==="Enter"&&doScan()}
            />
            <Btn onClick={doScan} col="#78350f">🔍</Btn>
            <OBtn onClick={()=>{setScanning(false);setScanResult("");setScanInput("");}}>✕</OBtn>
          </Row>
          {scanResult&&scanResult==="notfound"&&(
            <div style={{marginTop:10,padding:"10px 14px",background:"#7f1d1d22",borderRadius:9,color:"#f87171",fontSize:13}}>
              ❌ {lang==="ar"?"لم يتم العثور على هذا الباركود":"Barcode not found"}
            </div>
          )}
          {scanResult&&scanResult!=="notfound"&&(
            <div style={{marginTop:10,padding:14,background:"#065f4622",border:"1px solid #065f4644",borderRadius:9}}>
              <div style={{fontSize:13,fontWeight:700,color:"#34d399",marginBottom:8}}>✅ {lang==="ar"?scanResult.name:scanResult.nameEn}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[
                  [lang==="ar"?"الباركود":"Barcode",scanResult.barcode],
                  [lang==="ar"?"سعر البيع":"Sell Price",fmtCur(scanResult.sellPrice,scanResult.currency)],
                  [lang==="ar"?"المخزون":"Stock",scanResult.stock],
                  [lang==="ar"?"العملة":"Currency",scanResult.currency],
                ].map(([k,v],i)=>(
                  <div key={i} style={{background:"#070b14",borderRadius:7,padding:"7px 10px"}}>
                    <div style={{fontSize:10,color:"#6b7280"}}>{k}</div>
                    <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Form */}
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
        {!editId&&<div style={{marginTop:10,fontSize:11,color:"#6b7280",background:"#070b14",borderRadius:8,padding:"8px 12px"}}>
          🔖 {lang==="ar"?"سيتم توليد باركود فريد تلقائياً عند الحفظ":"A unique barcode will be generated automatically on save"}
        </div>}
        <Row s={{gap:10,marginTop:12}}><Btn onClick={save}>{t.save}</Btn><OBtn onClick={()=>{setShowF(false);setEditId(null);}}>{t.cancel}</OBtn></Row>
      </Card>}

      {/* Search */}
      <Row s={{gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==="ar"?"بحث بالاسم أو الباركود...":"Search by name or barcode..."} s={{maxWidth:280}}/>
        <span style={{fontSize:12,color:"#6b7280",padding:"8px 0"}}>{filtered.length} {lang==="ar"?"صنف":"items"}</span>
      </Row>

      {/* Table */}
      <div className="sx">
        <table style={{minWidth:620,width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#070b14"}}>
            {[
              lang==="ar"?"رقم الصنف":"Item #",
              t.partName,
              lang==="ar"?"الباركود":"Barcode",
              ...(isAdmin?[t.costPriceAdmin]:[]),
              t.sellPrice,
              t.stock,
              t.currency,
              ...(isAdmin?[t.enteredBy,""]:[]),
            ].map((h,i)=><th key={i} style={{padding:"10px 12px",fontSize:11,color:"#6b7280",fontWeight:500,textAlign:"inherit",whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} style={{borderTop:"1px solid #1e2d4411"}}>
                <td style={{padding:"10px 12px",fontSize:11,color:"#374151",fontFamily:"monospace"}}>{p.id}</td>
                <td style={{padding:"10px 12px",fontSize:13,color:"#e2e8f0",fontWeight:600}}>
                  <div>{lang==="ar"?p.name:p.nameEn}</div>
                  {p.stock<5&&<div style={{fontSize:10,color:"#f59e0b"}}>⚠️ {lang==="ar"?"مخزون منخفض":"Low stock"}</div>}
                </td>
                <td style={{padding:"10px 12px"}}>
                  {p.barcode?(
                    <div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:"#60a5fa",letterSpacing:1,marginBottom:3}}>{p.barcode}</div>
                      <BarcodeCanvas code={p.barcode} width={100} height={28}/>
                    </div>
                  ):<span style={{fontSize:10,color:"#374151"}}>—</span>}
                </td>
                {isAdmin&&<td style={{padding:"10px 12px",fontSize:13,color:"#f87171"}}>{fmtCur(p.costPrice,p.currency)}</td>}
                <td style={{padding:"10px 12px",fontSize:13,color:"#10b981",fontWeight:600}}>{fmtCur(p.sellPrice,p.currency)}</td>
                <td style={{padding:"10px 12px",fontSize:13,color:p.stock<5?"#f59e0b":"#e2e8f0"}}>{p.stock}</td>
                <td style={{padding:"10px 12px",fontSize:12,color:"#6b7280"}}>{p.currency}</td>
                {isAdmin&&<td style={{padding:"10px 12px",fontSize:12,color:"#8b5cf6",whiteSpace:"nowrap"}}>{lang==="ar"?p.addedByName:p.addedByNameEn}</td>}
                {isAdmin&&<td style={{padding:"10px 12px"}}>
                  <Row s={{gap:5}}>
                    {p.barcode&&<OBtn onClick={()=>setPrintPart(p)} sm tc="#fbbf24" col="#78350f">🖨️</OBtn>}
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
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {tools.map(x=>{
          const dl=daysLeft(x.expiryDate); const warn=dl!==null&&dl<=30; const isLife=x.subscriptionType==="lifetime";
          // Pick icon based on name
          const icons=["🔓","🛠","💿","🔧","⚙️","📲","🖥","🔑","💊","🛡","🔬","📡"];
          const iconIndex=(x.id||0)%icons.length;
          const cardIcon=icons[iconIndex];
          return (
            <div key={x.id} className="card-ani" style={{background:"#151e2d",border:`1px solid ${warn?"#f59e0b55":isLife?"#10b98133":"#1e2e44"}`,borderRadius:18,padding:20,position:"relative",overflow:"hidden"}}>
              {/* Top accent bar */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:isLife?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#8b5cf6,#a78bfa)",borderRadius:"18px 18px 0 0"}}/>

              {/* Header row */}
              <Row s={{gap:12,marginBottom:14}}>
                <div style={{width:48,height:48,borderRadius:14,background:isLife?"linear-gradient(135deg,#065f46,#10b981)":"linear-gradient(135deg,#4c1d95,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                  {cardIcon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lang==="ar"?x.name:x.nameEn}</div>
                  <Badge col={isLife?"#10b981":"#8b5cf6"}>{isLife?t.lifetime:t.yearly}</Badge>
                </div>
                <div style={{fontSize:17,fontWeight:800,color:isLife?"#34d399":"#a78bfa",flexShrink:0}}>{fmtCur(x.price,x.currency)}</div>
              </Row>

              {/* Expiry info */}
              {x.expiryDate?(
                <div style={{background:warn?"#78350f22":"#131926",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>{warn?"⚠️":"📅"}</span>
                  <div>
                    <div style={{fontSize:11,color:warn?"#f59e0b":"#64748b"}}>{lang==="ar"?"تاريخ الانتهاء":"Expiry Date"}</div>
                    <div style={{fontSize:12,fontWeight:600,color:warn?"#fbbf24":"#94a3b8"}}>{x.expiryDate} {warn&&dl!==null&&<span style={{color:"#f87171"}}>({dl} {t.daysLeft})</span>}</div>
                  </div>
                </div>
              ):(
                <div style={{background:"#065f4622",borderRadius:10,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>♾️</span>
                  <div style={{fontSize:12,color:"#34d399",fontWeight:600}}>{lang==="ar"?"مدى الحياة — لا تنتهي":"Lifetime — Never expires"}</div>
                </div>
              )}

              {/* Meta */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isAdmin?12:0}}>
                <div style={{fontSize:10,color:"#374151"}}>📅 {x.date}</div>
                {isAdmin&&<div style={{fontSize:10,color:"#374151"}}>👤 {lang==="ar"?x.addedByName:x.addedByNameEn}</div>}
              </div>

              {/* Actions */}
              {isAdmin&&<Row s={{gap:7}}>
                {can("software_edit")&&<OBtn onClick={()=>startEdit(x)} sm tc="#60a5fa" col="#1a3055" s={{flex:1}}>✏️ {t.edit}</OBtn>}
                {can("software_delete")&&<OBtn onClick={()=>del(x.id)} sm tc="#f87171" col="#3f1919" s={{flex:1}}>🗑 {t.delete}</OBtn>}
              </Row>}
            </div>
          );
        })}
      </div>
      {tools.length===0&&<Card s={{textAlign:"center",color:"#374151",padding:40}}>
        <div style={{fontSize:40,marginBottom:10}}>💿</div>
        <div>{t.noData}</div>
      </Card>}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  INVOICES
// ════════════════════════════════════════════════════
function InvoicesSection({t,invoices,setInvoices,parts,setParts,user,showToast,lang,isAdmin,logA,can,mobile,storeInfo={},logo=""}) {
  const [showF,setShowF]=useState(false); const [printInv,setPrintInv]=useState(null);
  const [editInv,setEditInv]=useState(null);
  const [form,setForm]=useState({customerName:"",customerPhone:"",items:[],currency:"LYD"});
  const [selPart,setSelPart]=useState(""); const [qty,setQty]=useState(1);
  const [delConfirm,setDelConfirm]=useState(null);

  const addItem=()=>{const p=parts.find(x=>x.id===Number(selPart));if(!p)return;setForm(f=>({...f,items:[...f.items,{partId:p.id,partName:lang==="ar"?p.name:p.nameEn,qty:+qty,price:p.sellPrice,currency:p.currency}]}));setSelPart("");setQty(1);};
  const subtotal=form.items.reduce((s,i)=>s+i.qty*i.price,0);
  const discountAmt = form.discountType==="percent" ? subtotal*(Number(form.discount||0)/100) : Number(form.discount||0);
  const total = subtotal - discountAmt;

  const create=()=>{
    if(!form.customerName||form.items.length===0)return;
    const dt=nowDT();
    const inv={id:genId(),...form,subtotal,discountAmt,total,technicianId:user.id,technicianName:user.name,technicianNameEn:user.nameEn,date:dt.date,time:dt.time};
    setInvoices(p=>[...p,inv]);
    form.items.forEach(i=>setParts(p=>p.map(x=>x.id===i.partId?{...x,stock:x.stock-i.qty}:x)));
    showToast(lang==="ar"?"تم إنشاء الفاتورة":"Invoice created");
    logA("invoice","invoices",`${form.customerName} — ${fmtCur(total,"LYD")}`);
    setForm({customerName:"",customerPhone:"",items:[],currency:"LYD",discount:"",discountType:"percent"});setShowF(false);
  };

  const startEdit=(inv)=>{
    setEditInv(inv);
    setForm({customerName:inv.customerName,customerPhone:inv.customerPhone,items:[...inv.items],currency:inv.currency||"LYD",discount:inv.discount||"",discountType:inv.discountType||"percent"});
    setShowF(true);
  };

  const saveEdit=()=>{
    if(!form.customerName||form.items.length===0)return;
    const newSubtotal=form.items.reduce((s,i)=>s+i.qty*i.price,0);
    const newDiscAmt=form.discountType==="percent"?newSubtotal*(Number(form.discount||0)/100):Number(form.discount||0);
    const newTotal=newSubtotal-newDiscAmt;
    setInvoices(p=>p.map(x=>x.id===editInv.id?{...x,...form,subtotal:newSubtotal,discountAmt:newDiscAmt,total:newTotal,editedAt:nowDT().iso,editedBy:user.name}:x));
    showToast(lang==="ar"?"تم تعديل الفاتورة":"Invoice updated");
    logA("edit","invoices",lang==="ar"?`تعديل فاتورة #${editInv.id}`:`Edit invoice #${editInv.id}`);
    setForm({customerName:"",customerPhone:"",items:[],currency:"LYD",discount:"",discountType:"percent"});
    setShowF(false);setEditInv(null);
  };

  const delInv=(inv)=>{
    setInvoices(p=>p.filter(x=>x.id!==inv.id));
    // restore stock
    inv.items.forEach(i=>setParts(p=>p.map(x=>x.id===i.partId?{...x,stock:x.stock+i.qty}:x)));
    showToast(lang==="ar"?"تم حذف الفاتورة":"Invoice deleted");
    logA("delete","invoices",lang==="ar"?`حذف فاتورة #${inv.id}`:`Deleted invoice #${inv.id}`);
    setDelConfirm(null);
  };

  if(!can("invoices_view"))return <NoAccess t={t}/>;
  if(printInv) return <PrintInv inv={printInv} t={t} lang={lang} onBack={()=>setPrintInv(null)} logo={logo} storeInfo={storeInfo}/>;
  return (
    <div>
      <PH title={`🧾 ${t.invoices}`} action={can("invoices_add")&&<Btn col="#065f46" onClick={()=>{setShowF(!showF);setEditInv(null);setForm({customerName:"",customerPhone:"",items:[],currency:"LYD"});}}>+ {t.newInvoice}</Btn>}/>

      {/* Delete Confirm Modal */}
      {delConfirm&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0a0f1e",border:"1px solid #7f1d1d44",borderRadius:16,padding:24,maxWidth:360,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:10}}>⚠️</div>
            <h3 style={{color:"#fbbf24",fontSize:15,marginBottom:8}}>{lang==="ar"?"تأكيد الحذف":"Confirm Delete"}</h3>
            <p style={{fontSize:12,color:"#9ca3af",marginBottom:6}}>{lang==="ar"?"سيتم حذف الفاتورة واسترجاع المخزون تلقائياً":"Invoice will be deleted and stock restored automatically"}</p>
            <p style={{fontSize:13,color:"#f87171",marginBottom:16}}>#{delConfirm.id} — {delConfirm.customerName}</p>
            <Row s={{gap:10,justifyContent:"center"}}>
              <Btn onClick={()=>delInv(delConfirm)} col="#7f1d1d" s={{flex:1}}>{lang==="ar"?"حذف":"Delete"}</Btn>
              <OBtn onClick={()=>setDelConfirm(null)} s={{flex:1}}>{t.cancel}</OBtn>
            </Row>
          </div>
        </div>
      )}

      {/* Edit / Create Form */}
      {showF&&<Card s={{marginBottom:14}}>
        <h3 style={{fontSize:14,color:"#e2e8f0",marginBottom:12,fontWeight:700}}>
          {editInv?"✏️ "+(lang==="ar"?"تعديل الفاتورة":"Edit Invoice"):"📝 "+t.newInvoice}
          {editInv&&<span style={{fontSize:11,color:"#6b7280",marginInlineStart:8}}>#{editInv.id}</span>}
        </h3>
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
          {form.items.length>0&&(
            <div style={{marginTop:10}}>
              {/* Discount row */}
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#64748b",flexShrink:0}}>🏷️ {lang==="ar"?"تخفيض:":"Discount:"}</span>
                <input type="number" value={form.discount||""} onChange={e=>setForm(p=>({...p,discount:e.target.value}))}
                  placeholder="0" style={{width:90,padding:"6px 10px",borderRadius:8,border:"1px solid #f59e0b55",background:"#131926",color:"#fbbf24",fontSize:13,outline:"none"}}/>
                <select value={form.discountType||"percent"} onChange={e=>setForm(p=>({...p,discountType:e.target.value}))}
                  style={{padding:"6px 10px",borderRadius:8,border:"1px solid #2a3a52",background:"#131926",color:"#e2e8f0",fontSize:12,outline:"none"}}>
                  <option value="percent">%</option>
                  <option value="fixed">{lang==="ar"?"د.ل":"LYD"}</option>
                </select>
              </div>
              {/* Totals summary */}
              <div style={{background:"#0f1520",borderRadius:10,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:4}}>
                  <span>{lang==="ar"?"المجموع الفرعي":"Subtotal"}</span>
                  <span>{fmtCur(subtotal,"LYD")}</span>
                </div>
                {discountAmt>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#fbbf24",marginBottom:4}}>
                  <span>🏷️ {lang==="ar"?"التخفيض":"Discount"} {form.discountType==="percent"?`(${form.discount}%)`:`(${lang==="ar"?"ثابت":"Fixed"})`}</span>
                  <span>- {fmtCur(discountAmt,"LYD")}</span>
                </div>}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800,color:"#10b981",borderTop:"1px solid #2a3a52",paddingTop:6,marginTop:4}}>
                  <span>{lang==="ar"?"الإجمالي النهائي":"Final Total"}</span>
                  <span>{fmtCur(total,"LYD")}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
        <Row s={{gap:10}}>
          <Btn onClick={editInv?saveEdit:create}>{editInv?(lang==="ar"?"حفظ التعديل":"Save Edit"):t.save}</Btn>
          <OBtn onClick={()=>{setShowF(false);setEditInv(null);}}>{t.cancel}</OBtn>
        </Row>
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
                <td style={{padding:"10px 14px",fontSize:13,color:"#e2e8f0"}}>
                  {inv.customerName}
                  {inv.editedAt&&<div style={{fontSize:10,color:"#f59e0b"}}>✏️ {lang==="ar"?"معدّل":"edited"}</div>}
                </td>
                <td style={{padding:"10px 14px",fontSize:12,color:"#6b7280"}}>{inv.customerPhone}</td>
                <td style={{padding:"10px 14px",fontSize:13,color:"#10b981",fontWeight:600}}>{fmtCur(inv.total,inv.currency)}</td>
                <td style={{padding:"10px 14px",fontSize:11,color:"#374151",whiteSpace:"nowrap"}}><div>{inv.date}</div><div>{inv.time}</div></td>
                {isAdmin&&<td style={{padding:"10px 14px",fontSize:12,color:"#8b5cf6",whiteSpace:"nowrap"}}>{lang==="ar"?inv.technicianName:inv.technicianNameEn}</td>}
                <td style={{padding:"10px 14px"}}>
                  <Row s={{gap:5}}>
                    <OBtn onClick={()=>setPrintInv(inv)} sm tc="#34d399" col="#065f46">🖨️</OBtn>
                    {isAdmin&&<OBtn onClick={()=>startEdit(inv)} sm tc="#60a5fa" col="#1d4ed8">✏️</OBtn>}
                    {isAdmin&&<OBtn onClick={()=>setDelConfirm(inv)} sm tc="#f87171" col="#7f1d1d">🗑️</OBtn>}
                  </Row>
                </td>
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
function PrintInv({inv,t,lang,onBack,logo="",storeInfo={}}) {
  return (
    <div>
      <div className="np" style={{marginBottom:16,display:"flex",gap:10}}>
        <OBtn onClick={onBack}>← {t.cancel}</OBtn>
        <Btn onClick={()=>window.print()}>🖨️ {t.print}</Btn>
      </div>
      <div style={{maxWidth:580,margin:"0 auto",background:"#0d1321",border:"1px solid #1e2d44",borderRadius:16,padding:28}}>
        <div style={{textAlign:"center",marginBottom:20,borderBottom:"1px solid #1e2d44",paddingBottom:16}}>
          {/* Logo */}
          <div style={{width:70,height:70,borderRadius:16,background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 10px",overflow:"hidden"}}>
            {logo?<img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"📱"}
          </div>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:"6px 0 4px"}}>متجر ayser</h2>
          <p style={{color:"#6b7280",fontSize:11}}>ayser Store — فاتورة / Invoice</p>
          {/* Store contact info */}
          {(storeInfo.phone||storeInfo.address)&&(
            <div style={{marginTop:8,fontSize:11,color:"#9ca3af",lineHeight:1.8}}>
              {storeInfo.phone&&<div>📞 {storeInfo.phone}{storeInfo.phone2&&` / ${storeInfo.phone2}`}</div>}
              {storeInfo.address&&<div>📍 {lang==="ar"?storeInfo.address:storeInfo.addressEn||storeInfo.address}</div>}
            </div>
          )}
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
function UsersSection({t,users,setUsers,showToast,lang,mobile,isRtl,pwRequests,setPwRequests,invoices=[],devices=[]}) {
  const [showF,setShowF]=useState(false); const [editPermId,setEditPermId]=useState(null);
  const [showPwModal,setShowPwModal]=useState(false);
  const [pwForm,setPwForm]=useState({uid:"",current:"",newPw:"",confirm:""});
  const [techReport,setTechReport]=useState(null); // userId for report modal
  const empty={username:"",password:"",confirmPassword:"",name:"",nameEn:"",role:"technician",salary:"",salaryType:"fixed",permissions:{...DEFAULT_PERMS}};
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
    {label:lang==="ar"?"🛒 المشتريات":"🛒 Purchases",col:"#f87171",keys:["purchases_view","purchases_add"]},
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

      {/* Password Reset Requests */}
      {pwRequests.filter(r=>!r.done).length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 8px #ef4444",animation:"pulse 1s infinite"}}/>
            <span style={{fontSize:13,fontWeight:700,color:"#f87171"}}>
              🔔 {lang==="ar"?"طلبات تغيير كلمة المرور":"Password Reset Requests"} ({pwRequests.filter(r=>!r.done).length})
            </span>
          </div>
          {pwRequests.filter(r=>!r.done).map(req=>(
            <div key={req.id} style={{background:"#1c1010",border:"1px solid #7f1d1d44",borderRadius:12,padding:14,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#fbbf24"}}>
                  🔧 {lang==="ar"?req.userName:req.userNameEn}
                  <span style={{fontSize:11,color:"#6b7280",marginInlineStart:8}}>@{req.username}</span>
                </div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:3}}>📅 {req.date} {req.time}</div>
                <div style={{fontSize:11,color:"#f87171",marginTop:2}}>
                  {lang==="ar"?"طلب إعادة تعيين كلمة المرور":"Requested password reset"}
                </div>
              </div>
              <Row s={{gap:8}}>
                <button onClick={()=>{
                  const u=users.find(x=>x.id===req.userId);
                  if(u){setShowPwModal(true);setPwForm({uid:String(u.id),current:u.password,newPw:"",confirm:""});}
                  setPwRequests(p=>p.map(r=>r.id===req.id?{...r,done:true}:r));
                }} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#065f46",color:"#34d399",fontSize:12,cursor:"pointer",fontWeight:600}}>
                  🔑 {lang==="ar"?"تغيير كلمة المرور":"Reset Password"}
                </button>
                <button onClick={()=>setPwRequests(p=>p.map(r=>r.id===req.id?{...r,done:true}:r))} style={{padding:"7px 12px",borderRadius:8,border:"1px solid #374151",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer"}}>
                  ✕
                </button>
              </Row>
            </div>
          ))}
        </div>
      )}

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
                <PwField value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))}/>
              </FF>
              <FF label={lang==="ar"?"كلمة المرور الجديدة":"New Password"}>
                <PwField value={pwForm.newPw} onChange={e=>setPwForm(p=>({...p,newPw:e.target.value}))}/>
              </FF>
              <FF label={lang==="ar"?"تأكيد كلمة المرور الجديدة":"Confirm New Password"}>
                <PwField value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))}/>
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
              <Btn onClick={changePassword} s={{flex:1}} col="#065f46">{lang==="ar"?"حفظ التغييرات":"Save Changes"}</Btn>
              <OBtn onClick={()=>setShowPwModal(false)} s={{flex:1}}>{t.cancel}</OBtn>
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
          {/* Salary / Commission */}
          <FF label={lang==="ar"?"نوع الأجر":"Pay Type"}>
            <Sel value={form.salaryType} onChange={e=>f("salaryType",e.target.value)}>
              <option value="fixed">{lang==="ar"?"مرتب ثابت (د.ل)":"Fixed Salary (LYD)"}</option>
              <option value="percent">{lang==="ar"?"نسبة من المبيعات (%)":"Commission (%)"}</option>
            </Sel>
          </FF>
          <FF label={form.salaryType==="fixed"?(lang==="ar"?"المرتب الشهري (د.ل)":"Monthly Salary (LYD)"):(lang==="ar"?"نسبة العمولة (%)":"Commission (%)")}>
            <Inp type="number" value={form.salary} onChange={e=>f("salary",e.target.value)} placeholder={form.salaryType==="fixed"?"0.00":"0"}/>
          </FF>
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
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(260px,1fr))",gap:13}}>
        {users.map(u=>(
          <div key={u.id} style={{background:"#0d1321",border:`1px solid ${u.active===false&&u.role!=="admin"?"#7f1d1d44":"#1e2d44"}`,borderRadius:14,padding:14,opacity:u.active===false&&u.role!=="admin"?0.7:1}}>
            <Row s={{justifyContent:"space-between",marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:u.role==="admin"?"linear-gradient(135deg,#b45309,#f59e0b)":u.active===false?"linear-gradient(135deg,#374151,#4b5563)":"linear-gradient(135deg,#1d4ed8,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{u.role==="admin"?"👑":u.active===false?"🚫":"🔧"}</div>
              <Row s={{gap:6}}>
                {u.role!=="admin"&&<Badge col={u.active===false?"#ef4444":"#10b981"}>{u.active===false?(lang==="ar"?"موقوف":"Disabled"):(lang==="ar"?"نشط":"Active")}</Badge>}
                <Badge col={u.role==="admin"?"#f59e0b":"#3b82f6"}>{u.role==="admin"?t.admin:t.technician}</Badge>
              </Row>
            </Row>
            <div style={{fontSize:15,fontWeight:700,color:u.active===false&&u.role!=="admin"?"#6b7280":"#fff"}}>{lang==="ar"?u.name:u.nameEn}</div>
            <div style={{fontSize:11,color:"#374151",marginBottom:6}}>@{u.username}</div>
            <PasswordReveal password={u.password} lang={lang}/>

            {/* Salary / Commission — admin only */}
            {u.role==="technician"&&(
              <div style={{background:"#070b14",borderRadius:9,padding:"8px 12px",marginBottom:10,border:"1px solid #1e2d44"}}>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:6}}>💰 {lang==="ar"?"الأجر الشهري":"Monthly Pay"}</div>
                {u.salary?(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:14,fontWeight:700,color:"#fbbf24"}}>
                      {u.salaryType==="percent"
                        ? `${u.salary}% ${lang==="ar"?"من المبيعات":"of sales"}`
                        : `${Number(u.salary).toFixed(2)} ${lang==="ar"?"د.ل":"LYD"}`}
                    </span>
                    <Badge col={u.salaryType==="percent"?"#8b5cf6":"#10b981"}>
                      {u.salaryType==="percent"?(lang==="ar"?"نسبة":"Commission"):(lang==="ar"?"ثابت":"Fixed")}
                    </Badge>
                  </div>
                ):(
                  <span style={{fontSize:12,color:"#374151"}}>{lang==="ar"?"غير محدد":"Not set"}</span>
                )}
                {/* Edit salary inline */}
                <SalaryEditor u={u} setUsers={setUsers} lang={lang}/>
              </div>
            )}

            {/* Permission Summary */}
            {u.role==="technician"&&(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#6b7280",marginBottom:5}}>{t.permissions}:</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                  {PERM_GROUPS.map(group=>{
                    const active=group.keys.filter(k=>u.permissions[k]).length;
                    if(active===0)return null;
                    return <span key={group.label} style={{padding:"2px 7px",borderRadius:20,fontSize:9,background:`${group.col}22`,color:group.col}}>{group.label.split(" ").slice(-1)[0]} {active}/{group.keys.length}</span>;
                  })}
                  {PERM_KEYS.filter(k=>!u.permissions[k]).length===PERM_KEYS.length&&<span style={{fontSize:9,color:"#ef4444"}}>🚫 {lang==="ar"?"لا صلاحيات":"No permissions"}</span>}
                </div>
              </div>
            )}

            <Row s={{gap:5,flexWrap:"wrap"}}>
              <button onClick={()=>setEditPermId(u.id)} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid #b4530944",background:"#78350f22",color:"#fbbf24",fontSize:11,cursor:"pointer"}}>⚙️ {t.permissions}</button>
              {u.role!=="admin"&&<button onClick={()=>setTechReport(u.id)} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid #1d4ed844",background:"#1d4ed822",color:"#60a5fa",fontSize:11,cursor:"pointer"}}>📊 {lang==="ar"?"تقرير":"Report"}</button>}
              {u.role!=="admin"&&(
                <button onClick={()=>setUsers(p=>p.map(x=>x.id===u.id?{...x,active:x.active===false?true:false}:x))}
                  style={{padding:"7px 9px",borderRadius:8,border:u.active===false?"1px solid #065f4644":"1px solid #7f1d1d44",background:u.active===false?"#065f4622":"#7f1d1d22",color:u.active===false?"#34d399":"#f87171",fontSize:11,cursor:"pointer"}}>
                  {u.active===false?"✅":"🚫"}
                </button>
              )}
              {u.id!==1&&<button onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))} style={{padding:"7px 9px",borderRadius:8,border:"1px solid #7f1d1d44",background:"#7f1d1d22",color:"#f87171",fontSize:11,cursor:"pointer"}}>🗑️</button>}
            </Row>
          </div>
        ))}
      </div>

      {/* Technician Report Modal */}
      {techReport&&<TechReportModal userId={techReport} users={users} invoices={invoices} devices={devices} lang={lang} mobile={mobile} isRtl={isRtl} onClose={()=>setTechReport(null)}/>}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  SALARY EDITOR (inline in user card)
// ════════════════════════════════════════════════════
function SalaryEditor({u,setUsers,lang}) {
  const [open,setOpen]=useState(false);
  const [val,setVal]=useState(u.salary||"");
  const [type,setType]=useState(u.salaryType||"fixed");
  if(!open) return (
    <button onClick={()=>setOpen(true)} style={{marginTop:6,background:"none",border:"none",color:"#60a5fa",fontSize:11,cursor:"pointer",padding:0,textDecoration:"underline"}}>
      ✏️ {lang==="ar"?"تعديل الأجر":"Edit Pay"}
    </button>
  );
  return (
    <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
      <select value={type} onChange={e=>setType(e.target.value)} style={{...{padding:"5px 8px",borderRadius:7,border:"1px solid #1e2d44",background:"#0d1321",color:"#e2e8f0",fontSize:11,outline:"none"}}}>
        <option value="fixed">{lang==="ar"?"ثابت":"Fixed"}</option>
        <option value="percent">{lang==="ar"?"نسبة %":"% Comm."}</option>
      </select>
      <input type="number" value={val} onChange={e=>setVal(e.target.value)} placeholder={type==="fixed"?"0.00":"0"} style={{width:80,padding:"5px 8px",borderRadius:7,border:"1px solid #1e2d44",background:"#0d1321",color:"#e2e8f0",fontSize:11,outline:"none"}}/>
      <button onClick={()=>{setUsers(p=>p.map(x=>x.id===u.id?{...x,salary:val,salaryType:type}:x));setOpen(false);}} style={{padding:"5px 10px",borderRadius:7,border:"none",background:"#065f46",color:"#34d399",fontSize:11,cursor:"pointer"}}>✓</button>
      <button onClick={()=>setOpen(false)} style={{padding:"5px 8px",borderRadius:7,border:"1px solid #1e2d44",background:"transparent",color:"#6b7280",fontSize:11,cursor:"pointer"}}>✕</button>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  TECH REPORT MODAL
// ════════════════════════════════════════════════════
function TechReportModal({userId,users,invoices,devices,lang,mobile,isRtl,onClose}) {
  const u=users.find(x=>x.id===userId);
  if(!u)return null;
  const [month,setMonth]=useState(today().slice(0,7));

  // Filter by technician
  const allInv=invoices.filter(i=>i.technicianId===userId);
  const allDev=devices.filter(d=>d.technicianId===userId);
  const monInv=allInv.filter(i=>i.date.startsWith(month));
  const monDev=allDev.filter(d=>d.receivedDate.startsWith(month));
  const monRev=monInv.reduce((s,i)=>s+Number(i.total),0);

  // Commission calc
  let commission=0;
  if(u.salary&&u.salaryType==="percent") commission=monRev*(Number(u.salary)/100);
  else if(u.salary&&u.salaryType==="fixed") commission=Number(u.salary);

  const devByStatus={waiting:allDev.filter(d=>d.status==="waiting").length,in_progress:allDev.filter(d=>d.status==="in_progress").length,ready:allDev.filter(d=>d.status==="ready").length};

  const exportCSV=()=>{
    const rows=[
      [lang==="ar"?"الفني":"Technician",lang==="ar"?u.name:u.nameEn],
      [lang==="ar"?"الشهر":"Month",month],
      [""],
      [lang==="ar"?"الفواتير":"Invoices"],
      ["#",lang==="ar"?"العميل":"Customer",lang==="ar"?"الإجمالي":"Total",lang==="ar"?"التاريخ":"Date"],
      ...monInv.map(i=>[i.id,i.customerName,i.total,i.date]),
      [""],
      [lang==="ar"?"الأجهزة":"Devices"],
      ["#",lang==="ar"?"العميل":"Customer",lang==="ar"?"الجهاز":"Device",lang==="ar"?"الحالة":"Status",lang==="ar"?"التاريخ":"Date"],
      ...monDev.map(d=>[d.id,d.customerName,d.deviceType,d.status,d.receivedDate]),
      [""],
      [lang==="ar"?"إجمالي المبيعات":"Total Sales",monRev],
      [lang==="ar"?`الأجر (${u.salaryType==="percent"?u.salary+"%":"ثابت"})`:`Pay (${u.salaryType==="percent"?u.salary+"%":"Fixed"})`,commission.toFixed(2)],
    ];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const b=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(b);
    const a=document.createElement("a");
    a.href=url;a.download=`tech-report-${lang==="ar"?u.name:u.nameEn}-${month}.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} dir={isRtl?"rtl":"ltr"}>
      <div style={{background:"#0a0f1e",border:"1px solid #1e2d44",borderRadius:18,width:"100%",maxWidth:680,maxHeight:"90vh",overflowY:"auto",fontFamily:isRtl?"'Tajawal',sans-serif":"'Outfit',sans-serif"}}>
        {/* Header */}
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #1e2d44",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div>
            <h3 style={{color:"#fff",fontSize:16,fontWeight:700,margin:0}}>
              📊 {lang==="ar"?"تقرير الفني":"Technician Report"} — {lang==="ar"?u.name:u.nameEn}
            </h3>
            <div style={{fontSize:11,color:"#6b7280",marginTop:3}}>@{u.username}</div>
          </div>
          <Row s={{gap:8}}>
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{padding:"7px 10px",borderRadius:9,border:"1px solid #1e2d44",background:"#070b14",color:"#e2e8f0",fontSize:12,outline:"none"}}/>
            <button onClick={exportCSV} style={{padding:"8px 14px",borderRadius:9,border:"none",background:"#065f46",color:"#34d399",fontSize:12,cursor:"pointer",fontWeight:600}}>
              📤 {lang==="ar"?"تصدير CSV":"Export CSV"}
            </button>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280",fontSize:22,cursor:"pointer"}}>✕</button>
          </Row>
        </div>

        <div style={{padding:20}}>
          {/* Summary Cards */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:20}}>
            {[
              {icon:"🧾",label:lang==="ar"?"فواتير الشهر":"Month Invoices",val:monInv.length,col:"#3b82f6"},
              {icon:"💰",label:lang==="ar"?"مبيعات الشهر":"Month Revenue",val:`${monRev.toFixed(2)} ${lang==="ar"?"د.ل":"LYD"}`,col:"#10b981"},
              {icon:"📱",label:lang==="ar"?"أجهزة الشهر":"Month Devices",val:monDev.length,col:"#8b5cf6"},
              {icon:"💵",label:u.salary?(u.salaryType==="percent"?`${lang==="ar"?"عمولة":"Comm."} ${u.salary}%`:(lang==="ar"?"مرتب ثابت":"Fixed Salary")):(lang==="ar"?"الأجر":"Pay"),
               val:u.salary?`${commission.toFixed(2)} ${lang==="ar"?"د.ل":"LYD"}`:(lang==="ar"?"غير محدد":"Not set"),col:"#fbbf24"},
            ].map((c,i)=>(
              <div key={i} style={{background:"#0d1321",border:"1px solid #1e2d44",borderRadius:12,padding:12,borderTop:`3px solid ${c.col}`,textAlign:"center"}}>
                <div style={{fontSize:22}}>{c.icon}</div>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",marginTop:5}}>{c.val}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:3}}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Device Status */}
          <div style={{background:"#0d1321",border:"1px solid #1e2d44",borderRadius:12,padding:14,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#9ca3af",marginBottom:10}}>📱 {lang==="ar"?"حالة الأجهزة الكلية":"All Devices Status"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["⏳",lang==="ar"?"انتظار":"Waiting",devByStatus.waiting,"#f59e0b"],["🔧",lang==="ar"?"صيانة":"In Progress",devByStatus.in_progress,"#3b82f6"],["✅",lang==="ar"?"جاهز":"Ready",devByStatus.ready,"#10b981"]].map(([ic,lb,vl,cl],i)=>(
                <div key={i} style={{textAlign:"center",background:"#070b14",borderRadius:9,padding:10}}>
                  <div style={{fontSize:18}}>{ic}</div>
                  <div style={{fontSize:16,fontWeight:700,color:cl}}>{vl}</div>
                  <div style={{fontSize:10,color:"#6b7280"}}>{lb}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#9ca3af",marginBottom:8}}>🧾 {lang==="ar"?"فواتير الشهر":"Month Invoices"} ({monInv.length})</div>
            {monInv.length===0?<div style={{color:"#374151",fontSize:12,padding:16,textAlign:"center"}}>{lang==="ar"?"لا توجد فواتير":"No invoices"}</div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
                  <thead><tr style={{background:"#070b14"}}>
                    {["#",lang==="ar"?"العميل":"Customer",lang==="ar"?"الإجمالي":"Total",lang==="ar"?"التاريخ":"Date"].map((h,i)=><th key={i} style={{padding:"8px 12px",fontSize:11,color:"#6b7280",textAlign:"inherit"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>{monInv.map(inv=>(
                    <tr key={inv.id} style={{borderTop:"1px solid #1e2d4411"}}>
                      <td style={{padding:"8px 12px",fontSize:12,color:"#60a5fa"}}>#{inv.id}</td>
                      <td style={{padding:"8px 12px",fontSize:13,color:"#e2e8f0"}}>{inv.customerName}</td>
                      <td style={{padding:"8px 12px",fontSize:13,color:"#10b981",fontWeight:600}}>{inv.total} {lang==="ar"?"د.ل":"LYD"}</td>
                      <td style={{padding:"8px 12px",fontSize:11,color:"#6b7280"}}>{inv.date}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>

          {/* Devices Table */}
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#9ca3af",marginBottom:8}}>📱 {lang==="ar"?"أجهزة الشهر":"Month Devices"} ({monDev.length})</div>
            {monDev.length===0?<div style={{color:"#374151",fontSize:12,padding:16,textAlign:"center"}}>{lang==="ar"?"لا توجد أجهزة":"No devices"}</div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:420}}>
                  <thead><tr style={{background:"#070b14"}}>
                    {["#",lang==="ar"?"العميل":"Customer",lang==="ar"?"الجهاز":"Device",lang==="ar"?"الخلل":"Fault",lang==="ar"?"الحالة":"Status",lang==="ar"?"التاريخ":"Date"].map((h,i)=><th key={i} style={{padding:"8px 10px",fontSize:11,color:"#6b7280",textAlign:"inherit"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>{monDev.map(d=>(
                    <tr key={d.id} style={{borderTop:"1px solid #1e2d4411"}}>
                      <td style={{padding:"8px 10px",fontSize:12,color:"#60a5fa"}}>#{d.id}</td>
                      <td style={{padding:"8px 10px",fontSize:12,color:"#e2e8f0"}}>{d.customerName}</td>
                      <td style={{padding:"8px 10px",fontSize:12,color:"#e2e8f0"}}>{d.deviceType}</td>
                      <td style={{padding:"8px 10px",fontSize:11,color:"#f87171"}}>{lang==="ar"?d.faultType:d.faultTypeEn||d.faultType}</td>
                      <td style={{padding:"8px 10px"}}>
                        <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:600,background:d.status==="ready"?"#10b98122":d.status==="in_progress"?"#3b82f622":"#f59e0b22",color:d.status==="ready"?"#10b981":d.status==="in_progress"?"#60a5fa":"#f59e0b"}}>
                          {d.status==="ready"?(lang==="ar"?"جاهز":"Ready"):d.status==="in_progress"?(lang==="ar"?"صيانة":"In Progress"):(lang==="ar"?"انتظار":"Waiting")}
                        </span>
                      </td>
                      <td style={{padding:"8px 10px",fontSize:11,color:"#6b7280"}}>{d.receivedDate}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  SUPPLIERS SECTION
// ════════════════════════════════════════════════════
function SuppliersSection({lang,suppliers,setSuppliers,purchases,mobile,showToast}) {
  const isRtl=lang==="ar";
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [search,setSearch]=useState("");
  const [viewId,setViewId]=useState(null); // supplier detail view
  const empty={name:"",nameEn:"",phone:"",phone2:"",email:"",address:"",company:"",notes:""};
  const [form,setForm]=useState(empty);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const filtered=suppliers.filter(s=>
    s.name?.includes(search)||
    s.nameEn?.toLowerCase().includes(search.toLowerCase())||
    s.phone?.includes(search)||
    s.company?.toLowerCase().includes(search.toLowerCase())
  );

  const save=()=>{
    if(!form.name)return;
    if(editId){
      setSuppliers(p=>p.map(x=>x.id===editId?{...x,...form}:x));
      showToast(lang==="ar"?"تم تحديث المورد":"Supplier updated");
    } else {
      setSuppliers(p=>[...p,{id:genId(),...form,addedAt:nowDT().iso}]);
      showToast(lang==="ar"?"تمت إضافة المورد":"Supplier added");
    }
    setForm(empty);setShowForm(false);setEditId(null);
  };

  const startEdit=(s)=>{setForm({name:s.name||"",nameEn:s.nameEn||"",phone:s.phone||"",phone2:s.phone2||"",email:s.email||"",address:s.address||"",company:s.company||"",notes:s.notes||""});setEditId(s.id);setShowForm(true);};
  const del=(id)=>{setSuppliers(p=>p.filter(x=>x.id!==id));showToast(lang==="ar"?"تم الحذف":"Deleted");};

  // supplier stats
  const supStats=(id)=>{
    const sp=purchases.filter(p=>p.supplierId===id);
    const total=sp.reduce((s,p)=>s+Number(p.total||0),0);
    const paid=sp.reduce((s,p)=>s+Number(p.paid||0),0);
    return {count:sp.length,total,paid,remaining:total-paid};
  };

  const viewSupplier=viewId?suppliers.find(s=>s.id===viewId):null;
  const viewPurchases=viewId?purchases.filter(p=>p.supplierId===viewId):[];

  return (
    <div dir={isRtl?"rtl":"ltr"}>
      {/* Supplier Detail Modal */}
      {viewSupplier&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0a0f1e",border:"1px solid #1e2e44",borderRadius:20,width:"100%",maxWidth:600,maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #1e2e44",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <h3 style={{color:"#fff",fontSize:16,fontWeight:700,margin:0}}>🏪 {viewSupplier.name}</h3>
                {viewSupplier.company&&<div style={{fontSize:12,color:"#64748b",marginTop:3}}>🏢 {viewSupplier.company}</div>}
              </div>
              <button onClick={()=>setViewId(null)} style={{background:"none",border:"none",color:"#6b7280",fontSize:22,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{padding:20}}>
              {/* Contact info */}
              <div style={{background:"#151e2d",borderRadius:14,padding:16,marginBottom:16,display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:10}}>
                {[
                  {icon:"📞",label:lang==="ar"?"الهاتف الأول":"Phone 1",val:viewSupplier.phone},
                  {icon:"📞",label:lang==="ar"?"الهاتف الثاني":"Phone 2",val:viewSupplier.phone2},
                  {icon:"📧",label:"Email",val:viewSupplier.email},
                  {icon:"📍",label:lang==="ar"?"العنوان":"Address",val:viewSupplier.address},
                ].filter(i=>i.val).map((item,i)=>(
                  <div key={i} style={{background:"#0f1520",borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:"#64748b",marginBottom:3}}>{item.icon} {item.label}</div>
                    <div style={{fontSize:13,color:"#e2e8f0",fontWeight:500}}>{item.val}</div>
                  </div>
                ))}
              </div>
              {/* Stats */}
              {(()=>{const st=supStats(viewSupplier.id);return(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
                  {[
                    {label:lang==="ar"?"فواتير":"Invoices",val:st.count,col:"#a78bfa"},
                    {label:lang==="ar"?"الإجمالي":"Total",val:st.total.toFixed(2),col:"#3b82f6"},
                    {label:lang==="ar"?"المدفوع":"Paid",val:st.paid.toFixed(2),col:"#10b981"},
                    {label:lang==="ar"?"المتبقي":"Remaining",val:st.remaining.toFixed(2),col:st.remaining>0?"#f87171":"#34d399"},
                  ].map((c,i)=>(
                    <div key={i} style={{background:"#0f1520",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:800,color:c.col}}>{c.val}</div>
                      <div style={{fontSize:10,color:"#64748b",marginTop:3}}>{c.label}</div>
                    </div>
                  ))}
                </div>
              );})()}
              {/* Purchase history */}
              {viewPurchases.length>0&&(
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:10}}>📋 {lang==="ar"?"سجل المشتريات":"Purchase History"}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[...viewPurchases].reverse().map(p=>(
                      <div key={p.id} style={{background:"#151e2d",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                        <div>
                          <div style={{fontSize:12,color:"#e2e8f0"}}>{p.items||lang==="ar"?"—":"—"}</div>
                          <div style={{fontSize:11,color:"#64748b"}}>{p.date}</div>
                        </div>
                        <div style={{textAlign:"end"}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#3b82f6"}}>{fmtCur(p.total,p.currency)}</div>
                          <div style={{fontSize:11,color:Number(p.total)-Number(p.paid||0)>0?"#f87171":"#34d399"}}>
                            {lang==="ar"?"متبقي":"Rem."}: {fmtCur(Number(p.total)-Number(p.paid||0),p.currency)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewSupplier.notes&&<div style={{marginTop:12,background:"#151e2d",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#64748b"}}>💬 {viewSupplier.notes}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <PH title={`🏪 ${lang==="ar"?"الموردون":"Suppliers"}`} action={
        <Btn onClick={()=>{setShowForm(!showForm);setEditId(null);setForm(empty);}}>
          + {lang==="ar"?"إضافة مورد":"Add Supplier"}
        </Btn>
      }/>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[
          {icon:"🏪",label:lang==="ar"?"إجمالي الموردين":"Total Suppliers",val:suppliers.length,col:"#3b82f6"},
          {icon:"🛒",label:lang==="ar"?"إجمالي الفواتير":"Total Invoices",val:purchases.length,col:"#a78bfa"},
          {icon:"⚠️",label:lang==="ar"?"موردون لديهم ديون":"Suppliers with Debt",val:suppliers.filter(s=>{const st=supStats(s.id);return st.remaining>0;}).length,col:"#f87171"},
        ].map((c,i)=>(
          <div key={i} style={{background:"#151e2d",border:`1px solid ${c.col}33`,borderRadius:14,padding:14,borderTop:`3px solid ${c.col}`,textAlign:"center"}}>
            <div style={{fontSize:24}}>{c.icon}</div>
            <div style={{fontSize:22,fontWeight:800,color:c.col,marginTop:6}}>{c.val}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm&&(
        <Card s={{marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:14}}>
            {editId?(lang==="ar"?"✏️ تعديل المورد":"✏️ Edit Supplier"):(lang==="ar"?"➕ إضافة مورد جديد":"➕ Add New Supplier")}
          </h3>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
            <FF label={`🏪 ${lang==="ar"?"اسم المورد (عربي)*":"Supplier Name (Arabic)*"}`}>
              <input value={form.name} onChange={e=>f("name",e.target.value)} placeholder={lang==="ar"?"اسم المورد...":"Supplier name..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
            <FF label={`🏪 ${lang==="ar"?"اسم المورد (إنجليزي)":"Supplier Name (English)"}`}>
              <input value={form.nameEn} onChange={e=>f("nameEn",e.target.value)} placeholder="Supplier name..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
            <FF label={`🏢 ${lang==="ar"?"اسم الشركة":"Company Name"}`}>
              <input value={form.company} onChange={e=>f("company",e.target.value)} placeholder={lang==="ar"?"اسم الشركة...":"Company name..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
            <FF label={`📍 ${lang==="ar"?"العنوان":"Address"}`}>
              <input value={form.address} onChange={e=>f("address",e.target.value)} placeholder={lang==="ar"?"عنوان الشركة...":"Company address..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
            <FF label={`📞 ${lang==="ar"?"رقم الهاتف الأول":"Phone Number 1"}`}>
              <input value={form.phone} onChange={e=>f("phone",e.target.value)} placeholder="0911234567" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
            <FF label={`📞 ${lang==="ar"?"رقم الهاتف الثاني":"Phone Number 2"}`}>
              <input value={form.phone2} onChange={e=>f("phone2",e.target.value)} placeholder="0921234567" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
            <FF label={`📧 ${lang==="ar"?"البريد الإلكتروني":"Email"}`}>
              <input value={form.email} onChange={e=>f("email",e.target.value)} placeholder="supplier@email.com" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
            <FF label={`💬 ${lang==="ar"?"ملاحظات":"Notes"}`}>
              <input value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder={lang==="ar"?"ملاحظات...":"Notes..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
          </div>
          <Row s={{gap:10}}>
            <Btn onClick={save} col="#065f46">💾 {lang==="ar"?"حفظ":"Save"}</Btn>
            <OBtn onClick={()=>{setShowForm(false);setEditId(null);}}>✕ {lang==="ar"?"إلغاء":"Cancel"}</OBtn>
          </Row>
        </Card>
      )}

      {/* Search */}
      <Row s={{gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==="ar"?"بحث بالاسم أو الهاتف أو الشركة...":"Search by name, phone or company..."} style={{flex:1,maxWidth:320,padding:"9px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
        <span style={{fontSize:12,color:"#64748b",padding:"9px 0"}}>{filtered.length} {lang==="ar"?"مورد":"suppliers"}</span>
      </Row>

      {/* Suppliers Grid */}
      {filtered.length===0?(
        <Card s={{textAlign:"center",padding:40,color:"#64748b"}}>
          <div style={{fontSize:48,marginBottom:12}}>🏪</div>
          <div>{lang==="ar"?"لا يوجد موردون بعد":"No suppliers yet"}</div>
        </Card>
      ):(
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
          {filtered.map(s=>{
            const st=supStats(s.id);
            return (
              <div key={s.id} className="card-ani" style={{background:"#151e2d",border:"1px solid #1e2e44",borderRadius:18,padding:20,position:"relative",overflow:"hidden",cursor:"pointer"}} onClick={()=>setViewId(s.id)}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:st.remaining>0?"linear-gradient(90deg,#f59e0b,#ef4444)":"linear-gradient(90deg,#10b981,#34d399)"}}/>
                <Row s={{justifyContent:"space-between",marginBottom:14}}>
                  <Row s={{gap:12}}>
                    <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#78350f,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>🏪</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{s.name}</div>
                      {s.company&&<div style={{fontSize:11,color:"#a78bfa"}}>🏢 {s.company}</div>}
                    </div>
                  </Row>
                  <Row s={{gap:5}} onClick={e=>e.stopPropagation()}>
                    <OBtn onClick={()=>startEdit(s)} sm tc="#60a5fa" col="#1a3055">✏️</OBtn>
                    <OBtn onClick={()=>del(s.id)} sm tc="#f87171" col="#3f1919">🗑</OBtn>
                  </Row>
                </Row>

                {/* Contact */}
                <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                  {s.phone&&<div style={{fontSize:12,color:"#94a3b8"}}>📞 {s.phone}{s.phone2&&` / ${s.phone2}`}</div>}
                  {s.address&&<div style={{fontSize:12,color:"#94a3b8"}}>📍 {s.address}</div>}
                  {s.email&&<div style={{fontSize:12,color:"#60a5fa"}}>📧 {s.email}</div>}
                </div>

                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
                  <div style={{background:"#0f1520",borderRadius:9,padding:"8px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#a78bfa"}}>{st.count}</div>
                    <div style={{fontSize:9,color:"#64748b"}}>{lang==="ar"?"فاتورة":"Invoices"}</div>
                  </div>
                  <div style={{background:"#0f1520",borderRadius:9,padding:"8px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#10b981"}}>{st.paid.toFixed(0)}</div>
                    <div style={{fontSize:9,color:"#64748b"}}>{lang==="ar"?"مدفوع":"Paid"}</div>
                  </div>
                  <div style={{background:"#0f1520",borderRadius:9,padding:"8px",textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:st.remaining>0?"#f87171":"#34d399"}}>{st.remaining.toFixed(0)}</div>
                    <div style={{fontSize:9,color:"#64748b"}}>{lang==="ar"?"متبقي":"Remaining"}</div>
                  </div>
                </div>

                {s.notes&&<div style={{marginTop:10,fontSize:11,color:"#64748b",background:"#0f1520",borderRadius:8,padding:"6px 10px"}}>💬 {s.notes}</div>}
                <div style={{marginTop:10,fontSize:10,color:"#374151",textAlign:"center"}}>{lang==="ar"?"اضغط لعرض التفاصيل":"Tap to view details"} 👆</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  PURCHASES SECTION
// ════════════════════════════════════════════════════
function PurchasesSection({lang,purchases,setPurchases,suppliers,setSuppliers,user,isAdmin,mobile,showToast,can}) {
  const isRtl=lang==="ar";
  const [activeTab,setActiveTab]=useState("purchases"); // purchases | suppliers
  const [showForm,setShowForm]=useState(false);
  const [showSupForm,setShowSupForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [editSupId,setEditSupId]=useState(null);
  const [filterSup,setFilterSup]=useState("all");
  const [filterMonth,setFilterMonth]=useState("");
  const [delConfirm,setDelConfirm]=useState(null);

  const emptyPurch={supplierId:"",items:"",total:"",paid:"",discount:"",discountType:"percent",currency:"LYD",notes:"",date:today()};
  const emptySup={name:"",phone:"",address:"",notes:""};
  const [form,setForm]=useState(emptyPurch);
  const [supForm,setSupForm]=useState(emptySup);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fs=(k,v)=>setSupForm(p=>({...p,[k]:v}));

  // Calculations
  const getSupplier=(id)=>suppliers.find(s=>s.id===id)||{name:"—",nameEn:"—"};
  const debt=(p)=>Number(p.total||0)-Number(p.paid||0); // مدين = متبقي على المحل
  const credit=(p)=>Number(p.paid||0); // دائن = ما دُفع

  // Filter
  const filteredP=purchases.filter(p=>{
    if(filterSup!=="all"&&String(p.supplierId)!==filterSup)return false;
    if(filterMonth&&!p.date.startsWith(filterMonth))return false;
    return true;
  });

  // Totals
  const totalDebt=filteredP.reduce((s,p)=>s+debt(p),0);
  const totalCredit=filteredP.reduce((s,p)=>s+credit(p),0);
  const totalAll=filteredP.reduce((s,p)=>s+Number(p.total||0),0);

  // Save purchase
  const savePurch=()=>{
    if(!form.total)return;
    const dt=nowDT();
    if(editId){
      setPurchases(p=>p.map(x=>x.id===editId?{...x,...form,total:Number(form.total),paid:Number(form.paid||0),editedAt:dt.iso,editedBy:user.name}:x));
      showToast(lang==="ar"?"تم التحديث":"Updated");
    } else {
      setPurchases(p=>[...p,{id:genId(),...form,total:Number(form.total),paid:Number(form.paid||0),addedBy:user.id,addedByName:user.name,createdAt:dt.iso,date:form.date||dt.date}]);
      showToast(lang==="ar"?"تمت الإضافة":"Added");
    }
    setForm(emptyPurch);setShowForm(false);setEditId(null);
  };

  // Save supplier
  const saveSup=()=>{
    if(!supForm.name)return;
    if(editSupId){
      setSuppliers(p=>p.map(x=>x.id===editSupId?{...x,...supForm}:x));
      showToast(lang==="ar"?"تم تحديث المورد":"Supplier updated");
    } else {
      setSuppliers(p=>[...p,{id:genId(),...supForm}]);
      showToast(lang==="ar"?"تمت إضافة المورد":"Supplier added");
    }
    setSupForm(emptySup);setShowSupForm(false);setEditSupId(null);
  };

  const startEditP=(p)=>{setForm({supplierId:p.supplierId,items:p.items||"",total:p.total,paid:p.paid||0,currency:p.currency||"LYD",notes:p.notes||"",date:p.date});setEditId(p.id);setShowForm(true);};
  const startEditS=(s)=>{setSupForm({name:s.name,phone:s.phone||"",address:s.address||"",notes:s.notes||""});setEditSupId(s.id);setShowSupForm(true);};
  const delPurch=(id)=>{setPurchases(p=>p.filter(x=>x.id!==id));setDelConfirm(null);showToast(lang==="ar"?"تم الحذف":"Deleted");};
  const delSup=(id)=>{setSuppliers(p=>p.filter(x=>x.id!==id));showToast(lang==="ar"?"تم حذف المورد":"Supplier deleted");};

  // Export CSV
  const exportCSV=()=>{
    const rows=[
      ["#",lang==="ar"?"المورد":"Supplier",lang==="ar"?"الأصناف":"Items",lang==="ar"?"الإجمالي":"Total",lang==="ar"?"المدفوع":"Paid",lang==="ar"?"المتبقي":"Remaining",lang==="ar"?"التاريخ":"Date"],
      ...filteredP.map(p=>[p.id,getSupplier(p.supplierId).name,p.items||"",p.total,p.paid||0,debt(p),p.date])
    ];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const b=new Blob(["\uFEFF"+csv],{type:"text/csv"});
    const url=URL.createObjectURL(b);
    const a=document.createElement("a");
    a.href=url;a.download=`purchases-${today()}.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div dir={isRtl?"rtl":"ltr"}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{fontSize:19,fontWeight:700,color:"#e2e8f0",margin:0}}>🛒 {lang==="ar"?"المشتريات":"Purchases"}</h2>
        <Row s={{gap:8,flexWrap:"wrap"}}>
          <button onClick={exportCSV} style={{padding:"8px 14px",borderRadius:10,border:"none",background:"#065f46",color:"#34d399",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            📤 {lang==="ar"?"تصدير":"Export"}
          </button>
          {(isAdmin||can("purchases_add"))&&<Btn onClick={()=>{setShowForm(!showForm);setEditId(null);setForm(emptyPurch);}}>
            + {lang==="ar"?"فاتورة مشتريات":"New Purchase"}
          </Btn>}
        </Row>
      </div>

      {/* Delete Confirm */}
      {delConfirm&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0a0f1e",border:"1px solid #7f1d1d44",borderRadius:16,padding:24,maxWidth:360,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:10}}>⚠️</div>
            <h3 style={{color:"#fbbf24",fontSize:15,marginBottom:12}}>{lang==="ar"?"تأكيد الحذف":"Confirm Delete"}</h3>
            <Row s={{gap:10,justifyContent:"center"}}>
              <Btn onClick={()=>delPurch(delConfirm)} col="#7f1d1d" s={{flex:1}}>{lang==="ar"?"حذف":"Delete"}</Btn>
              <OBtn onClick={()=>setDelConfirm(null)} s={{flex:1}}>{lang==="ar"?"إلغاء":"Cancel"}</OBtn>
            </Row>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Row s={{gap:8,marginBottom:16}}>
        {[{id:"purchases",label:lang==="ar"?"📋 الفواتير":"📋 Invoices"},{id:"suppliers",label:lang==="ar"?"🏪 الموردون":"🏪 Suppliers"}].map(tb=>(
          <button key={tb.id} onClick={()=>setActiveTab(tb.id)} style={{padding:"8px 20px",borderRadius:24,border:"none",cursor:"pointer",fontSize:13,fontWeight:activeTab===tb.id?700:400,background:activeTab===tb.id?"linear-gradient(135deg,#2563eb,#1d4ed8)":"#151e2d",color:activeTab===tb.id?"#fff":"#64748b"}}>
            {tb.label} {tb.id==="purchases"?`(${purchases.length})`:`(${suppliers.length})`}
          </button>
        ))}
      </Row>

      {activeTab==="purchases"&&(
        <>
          {/* Summary cards */}
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:16}}>
            {[
              {label:lang==="ar"?"إجمالي المشتريات":"Total Purchases",val:totalAll.toFixed(2),col:"#3b82f6",icon:"🛒"},
              {label:lang==="ar"?"إجمالي المدفوع (دائن)":"Total Paid (Credit)",val:totalCredit.toFixed(2),col:"#10b981",icon:"✅"},
              {label:lang==="ar"?"إجمالي المتبقي (مدين)":"Total Remaining (Debit)",val:totalDebt.toFixed(2),col:"#f87171",icon:"⚠️"},
              {label:lang==="ar"?"عدد الفواتير":"Invoices Count",val:filteredP.length,col:"#a78bfa",icon:"📋"},
            ].map((c,i)=>(
              <div key={i} style={{background:"#151e2d",border:`1px solid ${c.col}33`,borderRadius:14,padding:14,borderTop:`3px solid ${c.col}`}}>
                <div style={{fontSize:20,marginBottom:6}}>{c.icon}</div>
                <div style={{fontSize:16,fontWeight:800,color:c.col}}>{c.val}</div>
                <div style={{fontSize:10,color:"#64748b",marginTop:3}}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <Row s={{gap:10,marginBottom:14,flexWrap:"wrap"}}>
            <select value={filterSup} onChange={e=>setFilterSup(e.target.value)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#e2e8f0",fontSize:13,outline:"none"}}>
              <option value="all">{lang==="ar"?"جميع الموردين":"All Suppliers"}</option>
              {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#e2e8f0",fontSize:13,outline:"none"}}/>
            {filterMonth&&<OBtn onClick={()=>setFilterMonth("")} sm>✕</OBtn>}
          </Row>

          {/* Add/Edit Form */}
          {showForm&&(
            <Card s={{marginBottom:14}}>
              <h3 style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:14}}>
                {editId?(lang==="ar"?"✏️ تعديل الفاتورة":"✏️ Edit Invoice"):(lang==="ar"?"➕ فاتورة مشتريات جديدة":"➕ New Purchase Invoice")}
              </h3>
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
                <FF label={`🏪 ${lang==="ar"?"المورد":"Supplier"}`}>
                  <select value={form.supplierId} onChange={e=>f("supplierId",Number(e.target.value))} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}>
                    <option value="">{lang==="ar"?"-- اختر مورد --":"-- Select Supplier --"}</option>
                    {suppliers.map(s=><option key={s.id} value={s.id}>{s.name} {s.phone?`(${s.phone})`:""}</option>)}
                  </select>
                </FF>
                <FF label={`📅 ${lang==="ar"?"التاريخ":"Date"}`}>
                  <input type="date" value={form.date} onChange={e=>f("date",e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
                </FF>
                <FF label={`📦 ${lang==="ar"?"الأصناف/البضاعة":"Items/Goods"}`}>
                  <input value={form.items} onChange={e=>f("items",e.target.value)} placeholder={lang==="ar"?"اسم الأصناف...":"Item names..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
                </FF>
                <FF label={`💱 ${lang==="ar"?"العملة":"Currency"}`}>
                  <select value={form.currency} onChange={e=>f("currency",e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}>
                    <option value="LYD">{lang==="ar"?"دينار ليبي":"Libyan Dinar"}</option>
                    <option value="USD">Dollar USD</option>
                  </select>
                </FF>
                <FF label={`💰 ${lang==="ar"?"الإجمالي (مدين)":"Total (Debit)"}`}>
                  <input type="number" value={form.total} onChange={e=>f("total",e.target.value)} placeholder="0.00" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #f8717144",background:"#131926",color:"#f87171",fontSize:13,outline:"none",fontWeight:700}}/>
                </FF>
                <FF label={`✅ ${lang==="ar"?"المدفوع (دائن)":"Paid (Credit)"}`}>
                  <input type="number" value={form.paid} onChange={e=>f("paid",e.target.value)} placeholder="0.00" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #10b98144",background:"#131926",color:"#10b981",fontSize:13,outline:"none",fontWeight:700}}/>
                </FF>
              </div>
              {/* Live calc with discount */}
              {form.total&&(
                <div style={{background:"#0f1520",borderRadius:10,padding:12,marginBottom:12}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <FF label={`🏷️ ${lang==="ar"?"تخفيض":"Discount"}`}>
                      <div style={{display:"flex",gap:6}}>
                        <input type="number" value={form.discount||""} onChange={e=>f("discount",e.target.value)}
                          placeholder="0" style={{flex:1,padding:"7px 10px",borderRadius:8,border:"1px solid #f59e0b55",background:"#131926",color:"#fbbf24",fontSize:13,outline:"none"}}/>
                        <select value={form.discountType||"percent"} onChange={e=>f("discountType",e.target.value)}
                          style={{padding:"7px 8px",borderRadius:8,border:"1px solid #2a3a52",background:"#131926",color:"#e2e8f0",fontSize:12,outline:"none"}}>
                          <option value="percent">%</option>
                          <option value="fixed">{lang==="ar"?"د.ل":"LYD"}</option>
                        </select>
                      </div>
                    </FF>
                  </div>
                  {(()=>{
                    const raw=Number(form.total||0);
                    const disc=form.discountType==="percent"?raw*(Number(form.discount||0)/100):Number(form.discount||0);
                    const net=raw-disc;
                    const rem=net-Number(form.paid||0);
                    return (
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,textAlign:"center"}}>
                        {[
                          {label:lang==="ar"?"الإجمالي":"Total",val:raw.toFixed(2),col:"#3b82f6"},
                          {label:lang==="ar"?"تخفيض":"Discount",val:`-${disc.toFixed(2)}`,col:"#fbbf24"},
                          {label:lang==="ar"?"بعد الخصم":"After Disc.",val:net.toFixed(2),col:"#a78bfa"},
                          {label:lang==="ar"?"المتبقي (مدين)":"Remaining",val:rem.toFixed(2),col:rem>0?"#f87171":"#34d399"},
                        ].map((c,i)=>(
                          <div key={i} style={{background:"#151e2d",borderRadius:8,padding:"8px 4px"}}>
                            <div style={{fontSize:13,fontWeight:700,color:c.col}}>{c.val}</div>
                            <div style={{fontSize:9,color:"#64748b",marginTop:2}}>{c.label}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              <FF label={`💬 ${lang==="ar"?"ملاحظات":"Notes"}`}>
                <input value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder={lang==="ar"?"ملاحظات...":"Notes..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none",marginTop:8}}/>
              </FF>
              <Row s={{gap:10,marginTop:12}}>
                <Btn onClick={savePurch} col="#065f46">💾 {lang==="ar"?"حفظ":"Save"}</Btn>
                <OBtn onClick={()=>{setShowForm(false);setEditId(null);}}>✕ {lang==="ar"?"إلغاء":"Cancel"}</OBtn>
              </Row>
            </Card>
          )}

          {/* Purchases table */}
          {filteredP.length===0?(
            <Card s={{textAlign:"center",padding:40,color:"#64748b"}}>
              <div style={{fontSize:44,marginBottom:10}}>🛒</div>
              <div>{lang==="ar"?"لا توجد فواتير مشتريات بعد":"No purchase invoices yet"}</div>
            </Card>
          ):(
            <div className="sx">
              <table style={{minWidth:650,width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#0f1520"}}>
                  {["#",lang==="ar"?"المورد":"Supplier",lang==="ar"?"الأصناف":"Items",lang==="ar"?"الإجمالي":"Total",lang==="ar"?"دائن (مدفوع)":"Credit (Paid)",lang==="ar"?"مدين (متبقي)":"Debit (Remaining)",lang==="ar"?"التاريخ":"Date",""].map((h,i)=>(
                    <th key={i} style={{padding:"10px 12px",fontSize:11,color:"#64748b",fontWeight:500,textAlign:"inherit",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[...filteredP].reverse().map(p=>{
                    const sup=getSupplier(p.supplierId);
                    const remaining=debt(p);
                    return (
                      <tr key={p.id} style={{borderTop:"1px solid #1e2e4422"}}>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#60a5fa"}}>#{p.id}</td>
                        <td style={{padding:"10px 12px"}}>
                          <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{sup.name||lang==="ar"?"غير محدد":"Unknown"}</div>
                          {sup.phone&&<div style={{fontSize:11,color:"#64748b"}}>📞 {sup.phone}</div>}
                        </td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#94a3b8",maxWidth:160}}>{p.items||"—"}</td>
                        <td style={{padding:"10px 12px",fontSize:13,fontWeight:700,color:"#3b82f6"}}>{fmtCur(p.total,p.currency)}</td>
                        <td style={{padding:"10px 12px",fontSize:13,fontWeight:700,color:"#10b981"}}>{fmtCur(p.paid||0,p.currency)}</td>
                        <td style={{padding:"10px 12px"}}>
                          <span style={{fontSize:13,fontWeight:700,color:remaining>0?"#f87171":"#34d399"}}>
                            {remaining>0?"⚠️":"✅"} {fmtCur(remaining,p.currency)}
                          </span>
                        </td>
                        <td style={{padding:"10px 12px",fontSize:11,color:"#64748b",whiteSpace:"nowrap"}}>{p.date}</td>
                        <td style={{padding:"10px 12px"}}>
                          <Row s={{gap:5}}>
                            {(isAdmin||can("purchases_add"))&&<OBtn onClick={()=>startEditP(p)} sm tc="#60a5fa" col="#1a3055">✏️</OBtn>}
                            {isAdmin&&<OBtn onClick={()=>setDelConfirm(p.id)} sm tc="#f87171" col="#3f1919">🗑</OBtn>}
                          </Row>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr style={{background:"#0f1520",borderTop:"2px solid #2a3a52"}}>
                    <td colSpan={3} style={{padding:"10px 12px",fontSize:12,fontWeight:700,color:"#94a3b8"}}>{lang==="ar"?"الإجمالي":"Total"}</td>
                    <td style={{padding:"10px 12px",fontSize:14,fontWeight:800,color:"#3b82f6"}}>{totalAll.toFixed(2)}</td>
                    <td style={{padding:"10px 12px",fontSize:14,fontWeight:800,color:"#10b981"}}>{totalCredit.toFixed(2)}</td>
                    <td style={{padding:"10px 12px",fontSize:14,fontWeight:800,color:"#f87171"}}>{totalDebt.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab==="suppliers"&&(
        <>
          <div style={{marginBottom:14}}>
            <Btn onClick={()=>{setShowSupForm(!showSupForm);setEditSupId(null);setSupForm(emptySup);}}>
              + {lang==="ar"?"إضافة مورد":"Add Supplier"}
            </Btn>
          </div>

          {showSupForm&&(
            <Card s={{marginBottom:14}}>
              <h3 style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:14}}>
                {editSupId?(lang==="ar"?"✏️ تعديل المورد":"✏️ Edit Supplier"):(lang==="ar"?"➕ إضافة مورد":"➕ Add Supplier")}
              </h3>
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
                <FF label={`🏪 ${lang==="ar"?"اسم المورد":"Supplier Name"}`}>
                  <input value={supForm.name} onChange={e=>fs("name",e.target.value)} placeholder={lang==="ar"?"اسم المورد...":"Supplier name..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
                </FF>
                <FF label={`📞 ${lang==="ar"?"رقم الهاتف":"Phone Number"}`}>
                  <input value={supForm.phone} onChange={e=>fs("phone",e.target.value)} placeholder="0911234567" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
                </FF>
                <FF label={`📍 ${lang==="ar"?"العنوان":"Address"}`}>
                  <input value={supForm.address} onChange={e=>fs("address",e.target.value)} placeholder={lang==="ar"?"العنوان...":"Address..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
                </FF>
                <FF label={`💬 ${lang==="ar"?"ملاحظات":"Notes"}`}>
                  <input value={supForm.notes} onChange={e=>fs("notes",e.target.value)} placeholder={lang==="ar"?"ملاحظات...":"Notes..."} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
                </FF>
              </div>
              <Row s={{gap:10}}>
                <Btn onClick={saveSup} col="#065f46">💾 {lang==="ar"?"حفظ":"Save"}</Btn>
                <OBtn onClick={()=>{setShowSupForm(false);setEditSupId(null);}}>✕ {lang==="ar"?"إلغاء":"Cancel"}</OBtn>
              </Row>
            </Card>
          )}

          {suppliers.length===0?(
            <Card s={{textAlign:"center",padding:40,color:"#64748b"}}>
              <div style={{fontSize:44,marginBottom:10}}>🏪</div>
              <div>{lang==="ar"?"لا يوجد موردون بعد":"No suppliers yet"}</div>
            </Card>
          ):(
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {suppliers.map(s=>{
                const supPurchases=purchases.filter(p=>p.supplierId===s.id);
                const supTotal=supPurchases.reduce((t,p)=>t+Number(p.total||0),0);
                const supDebt=supPurchases.reduce((t,p)=>t+debt(p),0);
                return (
                  <div key={s.id} className="card-ani" style={{background:"#151e2d",border:"1px solid #1e2e44",borderRadius:16,padding:18,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#f59e0b,#ef4444)"}}/>
                    <Row s={{justifyContent:"space-between",marginBottom:14}}>
                      <Row s={{gap:10}}>
                        <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#78350f,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏪</div>
                        <div>
                          <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{s.name}</div>
                          {s.phone&&<div style={{fontSize:12,color:"#64748b"}}>📞 {s.phone}</div>}
                          {s.address&&<div style={{fontSize:11,color:"#64748b"}}>📍 {s.address}</div>}
                        </div>
                      </Row>
                      <Row s={{gap:5}}>
                        <OBtn onClick={()=>startEditS(s)} sm tc="#60a5fa" col="#1a3055">✏️</OBtn>
                        <OBtn onClick={()=>delSup(s.id)} sm tc="#f87171" col="#3f1919">🗑</OBtn>
                      </Row>
                    </Row>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      <div style={{background:"#0f1520",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"#64748b"}}>{lang==="ar"?"فواتير":"Invoices"}</div>
                        <div style={{fontSize:16,fontWeight:700,color:"#a78bfa"}}>{supPurchases.length}</div>
                      </div>
                      <div style={{background:"#0f1520",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"#64748b"}}>{lang==="ar"?"الإجمالي":"Total"}</div>
                        <div style={{fontSize:14,fontWeight:700,color:"#3b82f6"}}>{supTotal.toFixed(0)}</div>
                      </div>
                      <div style={{background:"#0f1520",borderRadius:9,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"#64748b"}}>{lang==="ar"?"المتبقي":"Remaining"}</div>
                        <div style={{fontSize:14,fontWeight:700,color:supDebt>0?"#f87171":"#34d399"}}>{supDebt.toFixed(0)}</div>
                      </div>
                    </div>
                    {s.notes&&<div style={{marginTop:10,fontSize:11,color:"#64748b",background:"#0f1520",borderRadius:8,padding:"6px 10px"}}>💬 {s.notes}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  PARTS COMPATIBILITY SECTION
// ════════════════════════════════════════════════════

// Part categories with icons
const PART_CATS = [
  {id:"screen",    icon:"📱", ar:"شاشة LCD",       en:"LCD Screen"},
  {id:"touch",     icon:"👆", ar:"شاشة لمس",       en:"Touch Screen"},
  {id:"connector", icon:"🔌", ar:"سوكت الشاحن",    en:"Charging Port"},
  {id:"lcdsocket", icon:"🔗", ar:"سوكت الشاشة",    en:"LCD Connector"},
  {id:"battery",   icon:"🔋", ar:"بطارية",          en:"Battery"},
  {id:"camera",    icon:"📷", ar:"كاميرا",          en:"Camera"},
  {id:"speaker",   icon:"🔊", ar:"سماعة",           en:"Speaker"},
  {id:"mic",       icon:"🎤", ar:"مايكروفون",       en:"Microphone"},
  {id:"board",     icon:"🖥", ar:"بورد رئيسي",      en:"Motherboard"},
  {id:"housing",   icon:"📦", ar:"هيكل/إطار",       en:"Housing/Frame"},
  {id:"button",    icon:"⚪", ar:"أزرار",            en:"Buttons"},
  {id:"other",     icon:"🔧", ar:"أخرى",            en:"Other"},
];

function CompatSection({lang,parts,compatParts,setCompatParts,mobile,showToast,isAdmin}) {
  const isRtl=lang==="ar";
  const [selCat,setSelCat]=useState("screen");
  const [showForm,setShowForm]=useState(false);
  const [editId,setEditId]=useState(null);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({
    partId:"",catId:"screen",
    devices:"", // comma separated device names
    notes:"",
    color:"",
  });

  const cat=PART_CATS.find(c=>c.id===selCat)||PART_CATS[0];
  const filtered=compatParts.filter(cp=>{
    if(cp.catId!==selCat)return false;
    if(search&&!cp.devices.toLowerCase().includes(search.toLowerCase())&&!cp.partName?.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const save=()=>{
    if(!form.devices.trim())return;
    const part=parts.find(p=>p.id===Number(form.partId));
    const dt=nowDT();
    const deviceList=form.devices.split(",").map(d=>d.trim()).filter(Boolean);
    if(editId){
      setCompatParts(p=>p.map(x=>x.id===editId?{...x,...form,deviceList,partName:part?( lang==="ar"?part.name:part.nameEn):"",updatedAt:dt.iso}:x));
      showToast(lang==="ar"?"تم التحديث":"Updated");
    } else {
      setCompatParts(p=>[...p,{id:genId(),...form,deviceList,partName:part?(lang==="ar"?part.name:part.nameEn):"",createdAt:dt.iso}]);
      showToast(lang==="ar"?"تمت الإضافة":"Added");
    }
    setForm({partId:"",catId:selCat,devices:"",notes:"",color:""});
    setShowForm(false);setEditId(null);
  };

  const del=(id)=>{setCompatParts(p=>p.filter(x=>x.id!==id));showToast(lang==="ar"?"تم الحذف":"Deleted");};

  const startEdit=(cp)=>{setForm({partId:cp.partId||"",catId:cp.catId,devices:cp.deviceList?.join(", ")||cp.devices,notes:cp.notes||"",color:cp.color||""});setEditId(cp.id);setShowForm(true);};

  // Group by device — show all devices using same part
  const allDevices=[...new Set(compatParts.filter(cp=>cp.catId===selCat).flatMap(cp=>cp.deviceList||[]))].sort();

  return (
    <div dir={isRtl?"rtl":"ltr"}>
      <PH title={`🔍 ${lang==="ar"?"توافق قطع الغيار":"Parts Compatibility"}`} action={
        isAdmin&&<Btn onClick={()=>{setShowForm(!showForm);setEditId(null);setForm({partId:"",catId:selCat,devices:"",notes:"",color:""});}}>
          + {lang==="ar"?"إضافة توافق":"Add Compatibility"}
        </Btn>
      }/>

      {/* Category tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {PART_CATS.map(c=>{
          const count=compatParts.filter(cp=>cp.catId===c.id).length;
          return (
            <button key={c.id} onClick={()=>{setSelCat(c.id);setShowForm(false);setSearch("");}}
              style={{padding:"7px 14px",borderRadius:24,border:"none",cursor:"pointer",fontSize:12,fontWeight:selCat===c.id?700:400,
                background:selCat===c.id?"linear-gradient(135deg,#2563eb,#1d4ed8)":"#151e2d",
                color:selCat===c.id?"#fff":"#64748b",transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>
              {c.icon} {lang==="ar"?c.ar:c.en}
              {count>0&&<span style={{background:selCat===c.id?"#ffffff33":"#2563eb33",color:selCat===c.id?"#fff":"#60a5fa",borderRadius:10,padding:"1px 6px",fontSize:10}}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm&&(
        <Card s={{marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:14}}>
            {cat.icon} {editId?(lang==="ar"?"تعديل":"Edit"):(lang==="ar"?"إضافة":"Add")} — {lang==="ar"?cat.ar:cat.en}
          </h3>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
            <FF label={lang==="ar"?"القطعة من المخزون (اختياري)":"Part from Inventory (optional)"}>
              <select value={form.partId} onChange={e=>setForm(p=>({...p,partId:e.target.value}))}
                style={{...{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}}>
                <option value="">{lang==="ar"?"-- اختر قطعة --":"-- Select Part --"}</option>
                {parts.map(p=><option key={p.id} value={p.id}>{lang==="ar"?p.name:p.nameEn}</option>)}
              </select>
            </FF>
            <FF label={lang==="ar"?"لون القطعة (اختياري)":"Part Color (optional)"}>
              <input value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))}
                placeholder={lang==="ar"?"مثال: أسود، أبيض، ذهبي":"e.g. Black, White, Gold"}
                style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
            </FF>
          </div>
          <FF label={`📱 ${lang==="ar"?"الأجهزة المتوافقة (افصل بين الأجهزة بفاصلة)":"Compatible Devices (separate with comma)"}`}>
            <textarea value={form.devices} onChange={e=>setForm(p=>({...p,devices:e.target.value}))}
              rows={3} placeholder={lang==="ar"?"مثال: iPhone 11, iPhone 12, iPhone XR":"e.g. Samsung S21, S21+, S21 Ultra"}
              style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none",resize:"vertical"}}/>
          </FF>
          <FF label={lang==="ar"?"ملاحظات":"Notes"}>
            <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
              placeholder={lang==="ar"?"ملاحظات إضافية...":"Additional notes..."}
              style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none",marginTop:8}}/>
          </FF>
          <Row s={{gap:10,marginTop:12}}>
            <Btn onClick={save} col="#065f46">💾 {lang==="ar"?"حفظ":"Save"}</Btn>
            <OBtn onClick={()=>{setShowForm(false);setEditId(null);}}>✕ {lang==="ar"?"إلغاء":"Cancel"}</OBtn>
          </Row>
        </Card>
      )}

      {/* Search */}
      <div style={{marginBottom:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={lang==="ar"?"بحث باسم الجهاز أو القطعة...":"Search device or part..."}
          style={{flex:1,maxWidth:280,padding:"9px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none"}}/>
        <span style={{fontSize:12,color:"#64748b"}}>{filtered.length} {lang==="ar"?"نتيجة":"results"}</span>
      </div>

      {/* Compatibility cards */}
      {filtered.length===0?(
        <Card s={{textAlign:"center",padding:40}}>
          <div style={{fontSize:48,marginBottom:12}}>{cat.icon}</div>
          <div style={{color:"#64748b",fontSize:14}}>
            {lang==="ar"?`لا يوجد بيانات توافق لـ${cat.ar} بعد`:`No compatibility data for ${cat.en} yet`}
          </div>
          {isAdmin&&<Btn onClick={()=>setShowForm(true)} col="#2563eb" s={{marginTop:16}}>
            + {lang==="ar"?"أضف الآن":"Add Now"}
          </Btn>}
        </Card>
      ):(
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
          {filtered.map(cp=>(
            <div key={cp.id} className="card-ani" style={{background:"#151e2d",border:"1px solid #1e2e44",borderRadius:16,padding:18,position:"relative",overflow:"hidden"}}>
              {/* Top accent */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#2563eb,#7c3aed)"}}/>

              {/* Header */}
              <Row s={{gap:12,marginBottom:14}}>
                <div style={{width:46,height:46,borderRadius:13,background:"linear-gradient(135deg,#1e3a5f,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                  {cat.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>
                    {cp.partName||cat.ar}
                    {cp.color&&<span style={{marginInlineStart:6,fontSize:11,color:"#a78bfa",background:"#2d1b5522",padding:"2px 8px",borderRadius:10}}>🎨 {cp.color}</span>}
                  </div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>
                    {cp.deviceList?.length||0} {lang==="ar"?"جهاز متوافق":"compatible devices"}
                  </div>
                </div>
                {isAdmin&&(
                  <Row s={{gap:5}}>
                    <OBtn onClick={()=>startEdit(cp)} sm tc="#60a5fa" col="#1a3055">✏️</OBtn>
                    <OBtn onClick={()=>del(cp.id)} sm tc="#f87171" col="#3f1919">🗑</OBtn>
                  </Row>
                )}
              </Row>

              {/* Devices list */}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:cp.notes?10:0}}>
                {(cp.deviceList||[]).map((dev,i)=>(
                  <span key={i} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:500,background:"#1e3a5f",color:"#93c5fd",border:"1px solid #2a4a7f"}}>
                    📱 {dev}
                  </span>
                ))}
              </div>

              {/* Notes */}
              {cp.notes&&<div style={{marginTop:8,fontSize:11,color:"#64748b",background:"#0f1520",borderRadius:8,padding:"6px 10px"}}>
                💬 {cp.notes}
              </div>}
            </div>
          ))}
        </div>
      )}

      {/* Device index — all devices using this part type */}
      {allDevices.length>0&&!search&&(
        <div style={{marginTop:24}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#94a3b8",marginBottom:12}}>
            📋 {lang==="ar"?`جميع الأجهزة في قسم ${cat.ar}`:`All devices in ${cat.en}`} ({allDevices.length})
          </h3>
          <div style={{background:"#151e2d",border:"1px solid #1e2e44",borderRadius:14,padding:14,display:"flex",flexWrap:"wrap",gap:8}}>
            {allDevices.map((dev,i)=>{
              const partCount=compatParts.filter(cp=>cp.catId===selCat&&cp.deviceList?.includes(dev)).length;
              return (
                <button key={i} onClick={()=>setSearch(dev)}
                  style={{padding:"5px 12px",borderRadius:20,border:"1px solid #2a3a52",background:"#0f1520",color:"#94a3b8",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  📱 {dev}
                  {partCount>1&&<span style={{background:"#2563eb33",color:"#60a5fa",borderRadius:8,padding:"1px 6px",fontSize:10}}>{partCount}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  TREASURY / ACCOUNTING SECTION
// ════════════════════════════════════════════════════
function TreasurySection({lang,treasury,setTreasury,invoices,purchases,mobile,showToast,user}) {
  const isRtl=lang==="ar";
  const [showForm,setShowForm]=useState(false);
  const [showTransfer,setShowTransfer]=useState(false);
  const [filterDate,setFilterDate]=useState(today());
  const [form,setForm]=useState({type:"in",method:"cash",amount:"",note:"",date:today()});
  const [transferAmt,setTransferAmt]=useState("");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const METHODS={
    cash:{ar:"نقدي",en:"Cash",icon:"💵",col:"#10b981"},
    card:{ar:"بطاقة مصرفية",en:"Bank Card",icon:"💳",col:"#3b82f6"},
    transfer:{ar:"حوالة مصرفية",en:"Bank Transfer",icon:"🏦",col:"#8b5cf6"},
  };

  // Add transaction
  const addTx=()=>{
    if(!form.amount||Number(form.amount)<=0)return;
    const dt=nowDT();
    const tx={id:genId(),...form,amount:Number(form.amount),addedBy:user.name,createdAt:dt.iso};
    const newDaily=form.type==="in"?treasury.daily+tx.amount:treasury.daily-tx.amount;
    setTreasury(p=>({...p,daily:Math.max(0,newDaily),transactions:[tx,...p.transactions]}));
    showToast(lang==="ar"?"تمت الإضافة":"Transaction added");
    setForm({type:"in",method:"cash",amount:"",note:"",date:today()});setShowForm(false);
  };

  // Transfer daily → main treasury
  const doTransfer=()=>{
    if(!transferAmt||Number(transferAmt)<=0||Number(transferAmt)>treasury.daily)return;
    const amt=Number(transferAmt);
    const dt=nowDT();
    const tx={id:genId(),type:"transfer",method:"cash",amount:amt,note:lang==="ar"?`ترحيل إلى الخزينة الرئيسية ${dt.date}`:`Transfer to Main Treasury ${dt.date}`,date:dt.date,createdAt:dt.iso,addedBy:user.name};
    setTreasury(p=>({...p,daily:p.daily-amt,main:p.main+amt,transactions:[tx,...p.transactions]}));
    showToast(lang==="ar"?"تم الترحيل بنجاح":"Transfer successful");
    setTransferAmt("");setShowTransfer(false);
  };

  // Filter transactions by date
  const todayTx=treasury.transactions.filter(t=>t.date===filterDate);
  const allTx=filterDate?todayTx:treasury.transactions;
  const todayIn=todayTx.filter(t=>t.type==="in").reduce((s,t)=>s+t.amount,0);
  const todayOut=todayTx.filter(t=>t.type==="out").reduce((s,t)=>s+t.amount,0);
  const todayTransfers=todayTx.filter(t=>t.type==="transfer").reduce((s,t)=>s+t.amount,0);

  // Method breakdown today
  const byMethod=Object.keys(METHODS).map(m=>({
    ...METHODS[m],id:m,
    inAmt:todayTx.filter(t=>t.type==="in"&&t.method===m).reduce((s,t)=>s+t.amount,0),
    outAmt:todayTx.filter(t=>t.type==="out"&&t.method===m).reduce((s,t)=>s+t.amount,0),
  }));

  const exportCSV=()=>{
    const rows=[
      ["#",lang==="ar"?"النوع":"Type",lang==="ar"?"الطريقة":"Method",lang==="ar"?"المبلغ":"Amount",lang==="ar"?"ملاحظة":"Note",lang==="ar"?"التاريخ":"Date",lang==="ar"?"أضيف بواسطة":"Added By"],
      ...treasury.transactions.map(t=>[t.id,t.type,t.method,t.amount,t.note||"",t.date,t.addedBy||""])
    ];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const b=new Blob(["\uFEFF"+csv],{type:"text/csv"});
    const url=URL.createObjectURL(b);
    const a=document.createElement("a");
    a.href=url;a.download=`treasury-${today()}.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div dir={isRtl?"rtl":"ltr"}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <h2 style={{fontSize:19,fontWeight:700,color:"#e2e8f0",margin:0}}>🏦 {lang==="ar"?"الخزينة والمحاسبة":"Treasury & Accounting"}</h2>
        <Row s={{gap:8,flexWrap:"wrap"}}>
          <button onClick={exportCSV} style={{padding:"8px 14px",borderRadius:10,border:"none",background:"#065f46",color:"#34d399",fontSize:12,fontWeight:600,cursor:"pointer"}}>📤 {lang==="ar"?"تصدير":"Export"}</button>
          <Btn onClick={()=>setShowTransfer(true)} col="#7c3aed">🔄 {lang==="ar"?"ترحيل يومي":"Daily Transfer"}</Btn>
          <Btn onClick={()=>setShowForm(!showForm)} col="#2563eb">+ {lang==="ar"?"إضافة حركة":"Add Transaction"}</Btn>
        </Row>
      </div>

      {/* Treasury Cards */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:14,marginBottom:20}}>
        {/* Daily Treasury */}
        <div style={{background:"linear-gradient(135deg,#0d2040,#1a3055)",border:"2px solid #2563eb44",borderRadius:18,padding:22}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:13,background:"linear-gradient(135deg,#1d4ed8,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>💵</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#93c5fd"}}>{lang==="ar"?"الخزينة اليومية":"Daily Treasury"}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{lang==="ar"?"الرصيد الحالي":"Current Balance"}</div>
            </div>
          </div>
          <div style={{fontSize:32,fontWeight:800,color:"#60a5fa",marginBottom:8}}>{treasury.daily.toFixed(2)}</div>
          <div style={{fontSize:12,color:"#64748b"}}>{lang==="ar"?"دينار ليبي":"LYD"}</div>
          <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:"#10b98122",borderRadius:9,padding:"8px 10px"}}>
              <div style={{fontSize:11,color:"#34d399"}}>⬆️ {lang==="ar"?"وارد اليوم":"Today In"}</div>
              <div style={{fontSize:14,fontWeight:700,color:"#10b981"}}>{todayIn.toFixed(2)}</div>
            </div>
            <div style={{background:"#ef444422",borderRadius:9,padding:"8px 10px"}}>
              <div style={{fontSize:11,color:"#f87171"}}>⬇️ {lang==="ar"?"صادر اليوم":"Today Out"}</div>
              <div style={{fontSize:14,fontWeight:700,color:"#f87171"}}>{todayOut.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Main Treasury */}
        <div style={{background:"linear-gradient(135deg,#1a1035,#2d1b55)",border:"2px solid #7c3aed44",borderRadius:18,padding:22}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:13,background:"linear-gradient(135deg,#6d28d9,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🏛️</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#c4b5fd"}}>{lang==="ar"?"الخزينة الرئيسية":"Main Treasury"}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{lang==="ar"?"الرصيد المتراكم":"Accumulated Balance"}</div>
            </div>
          </div>
          <div style={{fontSize:32,fontWeight:800,color:"#a78bfa",marginBottom:8}}>{treasury.main.toFixed(2)}</div>
          <div style={{fontSize:12,color:"#64748b"}}>{lang==="ar"?"دينار ليبي":"LYD"}</div>
          <div style={{marginTop:14,background:"#7c3aed22",borderRadius:9,padding:"8px 12px"}}>
            <div style={{fontSize:11,color:"#a78bfa"}}>🔄 {lang==="ar"?"إجمالي المرحّل اليوم":"Transferred Today"}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#c4b5fd"}}>{todayTransfers.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Method Breakdown */}
      <h3 style={{fontSize:14,fontWeight:700,color:"#94a3b8",marginBottom:12}}>
        📊 {lang==="ar"?"تفصيل طرق الدفع":"Payment Methods Breakdown"} — {filterDate||lang==="ar"?"الكل":"All"}
      </h3>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {byMethod.map(m=>(
          <div key={m.id} style={{background:"#151e2d",border:`1px solid ${m.col}33`,borderRadius:14,padding:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:22}}>{m.icon}</span>
              <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{lang==="ar"?m.ar:m.en}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              <div style={{background:"#10b98122",borderRadius:8,padding:"7px 10px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#10b981"}}>{m.inAmt.toFixed(2)}</div>
                <div style={{fontSize:9,color:"#64748b"}}>{lang==="ar"?"وارد":"In"}</div>
              </div>
              <div style={{background:"#ef444422",borderRadius:8,padding:"7px 10px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f87171"}}>{m.outAmt.toFixed(2)}</div>
                <div style={{fontSize:9,color:"#64748b"}}>{lang==="ar"?"صادر":"Out"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Modal */}
      {showTransfer&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#0a0f1e",border:"1px solid #7c3aed44",borderRadius:20,padding:28,width:"100%",maxWidth:400,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:10}}>🔄</div>
            <h3 style={{color:"#a78bfa",fontSize:16,fontWeight:700,marginBottom:6}}>{lang==="ar"?"ترحيل يومي":"Daily Transfer"}</h3>
            <p style={{fontSize:12,color:"#64748b",marginBottom:16}}>
              {lang==="ar"?"ترحيل من الخزينة اليومية إلى الخزينة الرئيسية":"Transfer from Daily to Main Treasury"}
            </p>
            <div style={{background:"#151e2d",borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,color:"#64748b"}}>{lang==="ar"?"الخزينة اليومية":"Daily Balance"}</span>
                <span style={{fontSize:14,fontWeight:700,color:"#60a5fa"}}>{treasury.daily.toFixed(2)}</span>
              </div>
              <FF label={lang==="ar"?"المبلغ المراد ترحيله":"Amount to Transfer"}>
                <input type="number" value={transferAmt} onChange={e=>setTransferAmt(e.target.value)}
                  placeholder="0.00" max={treasury.daily}
                  style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #7c3aed55",background:"#131926",color:"#a78bfa",fontSize:16,fontWeight:700,outline:"none",textAlign:"center"}}/>
              </FF>
              <button onClick={()=>setTransferAmt(String(treasury.daily))} style={{marginTop:8,background:"none",border:"none",color:"#60a5fa",fontSize:12,cursor:"pointer",textDecoration:"underline"}}>
                {lang==="ar"?"ترحيل الكل":"Transfer All"}
              </button>
            </div>
            {Number(transferAmt)>treasury.daily&&<div style={{color:"#f87171",fontSize:12,marginBottom:10}}>⚠️ {lang==="ar"?"المبلغ أكبر من الخزينة اليومية":"Amount exceeds daily balance"}</div>}
            <Row s={{gap:10,justifyContent:"center"}}>
              <Btn onClick={doTransfer} col="#7c3aed" s={{flex:1}}>🔄 {lang==="ar"?"ترحيل":"Transfer"}</Btn>
              <OBtn onClick={()=>setShowTransfer(false)} s={{flex:1}}>{lang==="ar"?"إلغاء":"Cancel"}</OBtn>
            </Row>
          </div>
        </div>
      )}

      {/* Add Transaction Form */}
      {showForm&&(
        <Card s={{marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#e2e8f0",marginBottom:14}}>➕ {lang==="ar"?"إضافة حركة مالية":"Add Transaction"}</h3>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(2,1fr)",gap:12,marginBottom:12}}>
            <FF label={lang==="ar"?"نوع الحركة":"Type"}>
              <div style={{display:"flex",gap:8}}>
                {[{val:"in",ar:"⬆️ وارد",en:"⬆️ In",col:"#10b981"},{val:"out",ar:"⬇️ صادر",en:"⬇️ Out",col:"#f87171"}].map(t=>(
                  <button key={t.val} onClick={()=>f("type",t.val)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${form.type===t.val?t.col:"#2a3a52"}`,background:form.type===t.val?`${t.col}22`:"transparent",color:form.type===t.val?t.col:"#64748b",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                    {lang==="ar"?t.ar:t.en}
                  </button>
                ))}
              </div>
            </FF>
            <FF label={lang==="ar"?"طريقة الدفع":"Payment Method"}>
              <div style={{display:"flex",gap:6}}>
                {Object.entries(METHODS).map(([k,m])=>(
                  <button key={k} onClick={()=>f("method",k)} title={lang==="ar"?m.ar:m.en}
                    style={{flex:1,padding:"10px 6px",borderRadius:10,border:`2px solid ${form.method===k?m.col:"#2a3a52"}`,background:form.method===k?`${m.col}22`:"transparent",color:form.method===k?m.col:"#64748b",fontSize:18,cursor:"pointer"}}>
                    {m.icon}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,color:METHODS[form.method]?.col,marginTop:4,textAlign:"center"}}>
                {lang==="ar"?METHODS[form.method]?.ar:METHODS[form.method]?.en}
              </div>
            </FF>
            <FF label={`💰 ${lang==="ar"?"المبلغ":"Amount"}`}>
              <input type="number" value={form.amount} onChange={e=>f("amount",e.target.value)}
                placeholder="0.00" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${form.type==="in"?"#10b98155":"#f8717155"}`,background:"#131926",color:form.type==="in"?"#10b981":"#f87171",fontSize:16,fontWeight:700,outline:"none"}}/>
            </FF>
            <FF label={`📅 ${lang==="ar"?"التاريخ":"Date"}`}>
              <input type="date" value={form.date} onChange={e=>f("date",e.target.value)}
                style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#e2e8f0",fontSize:13,outline:"none"}}/>
            </FF>
          </div>
          <FF label={`💬 ${lang==="ar"?"ملاحظة":"Note"}`}>
            <input value={form.note} onChange={e=>f("note",e.target.value)}
              placeholder={lang==="ar"?"وصف الحركة...":"Transaction description..."}
              style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#cbd5e1",fontSize:13,outline:"none",marginTop:8}}/>
          </FF>
          <Row s={{gap:10,marginTop:12}}>
            <Btn onClick={addTx} col={form.type==="in"?"#065f46":"#7f1d1d"}>
              💾 {lang==="ar"?"حفظ":"Save"}
            </Btn>
            <OBtn onClick={()=>setShowForm(false)}>{lang==="ar"?"إلغاء":"Cancel"}</OBtn>
          </Row>
        </Card>
      )}

      {/* Transactions Log */}
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <h3 style={{fontSize:14,fontWeight:700,color:"#94a3b8",margin:0}}>📋 {lang==="ar"?"سجل الحركات":"Transactions Log"}</h3>
        <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)}
          style={{padding:"6px 10px",borderRadius:9,border:"1px solid #2a3a52",background:"#131926",color:"#e2e8f0",fontSize:12,outline:"none"}}/>
        {filterDate&&<OBtn onClick={()=>setFilterDate("")} sm>{lang==="ar"?"الكل":"All"}</OBtn>}
        <span style={{fontSize:12,color:"#64748b"}}>{allTx.length} {lang==="ar"?"حركة":"tx"}</span>
      </div>

      {allTx.length===0?(
        <Card s={{textAlign:"center",padding:40,color:"#64748b"}}>
          <div style={{fontSize:44,marginBottom:10}}>🏦</div>
          <div>{lang==="ar"?"لا توجد حركات مالية":"No transactions"}</div>
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {allTx.map(tx=>{
            const m=METHODS[tx.method]||METHODS.cash;
            const isTransfer=tx.type==="transfer";
            return (
              <div key={tx.id} className="card-ani" style={{background:"#151e2d",border:`1px solid ${isTransfer?"#7c3aed33":tx.type==="in"?"#10b98133":"#f8717133"}`,borderRadius:13,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{width:40,height:40,borderRadius:11,background:isTransfer?"#7c3aed22":tx.type==="in"?"#10b98122":"#f8717122",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                  {isTransfer?"🔄":m.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.note||lang==="ar"?"—":"—"}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>
                    {isTransfer?(lang==="ar"?"ترحيل":"Transfer"):lang==="ar"?m.ar:m.en} • {tx.date} • {lang==="ar"?tx.addedBy:"by "+tx.addedBy}
                  </div>
                </div>
                <div style={{textAlign:"end",flexShrink:0}}>
                  <div style={{fontSize:15,fontWeight:800,color:isTransfer?"#a78bfa":tx.type==="in"?"#10b981":"#f87171"}}>
                    {isTransfer?"↗️":(tx.type==="in"?"⬆️":"⬇️")} {tx.amount.toFixed(2)}
                  </div>
                  <div style={{fontSize:10,color:"#64748b"}}>{lang==="ar"?"د.ل":"LYD"}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════
//  SALARIES SECTION
// ════════════════════════════════════════════════════
function SalariesSection({lang,users,invoices,salaryRecords,setSalaryRecords,mobile,showToast}) {
  const isRtl=lang==="ar";
  const [month,setMonth]=useState(today().slice(0,7));
  const [showForm,setShowForm]=useState(null); // userId
  const [form,setForm]=useState({bonus:"",bonusNote:"",deduct:"",deductNote:""});

  const techs=users.filter(u=>u.role==="technician");

  // Get record for user+month
  const getRecord=(uid)=>salaryRecords.find(r=>r.userId===uid&&r.month===month)||{bonus:0,bonusNote:"",deduct:0,deductNote:""};

  // Calculate salary for a tech this month
  const calcSalary=(u)=>{
    const monInv=invoices.filter(i=>i.technicianId===u.id&&i.date.startsWith(month));
    const revenue=monInv.reduce((s,i)=>s+Number(i.total),0);
    const rec=getRecord(u.id);
    let base=0;
    if(u.salaryType==="percent"&&u.salary) base=revenue*(Number(u.salary)/100);
    else if(u.salary) base=Number(u.salary);
    const net=base+Number(rec.bonus||0)-Number(rec.deduct||0);
    return {base,revenue,invoices:monInv.length,bonus:Number(rec.bonus||0),deduct:Number(rec.deduct||0),net,rec};
  };

  const saveRecord=(uid)=>{
    setSalaryRecords(prev=>{
      const filtered=prev.filter(r=>!(r.userId===uid&&r.month===month));
      return [...filtered,{userId:uid,month,bonus:Number(form.bonus)||0,bonusNote:form.bonusNote,deduct:Number(form.deduct)||0,deductNote:form.deductNote,savedAt:new Date().toISOString()}];
    });
    showToast(lang==="ar"?"تم حفظ بيانات المرتب":"Salary record saved");
    setShowForm(null);setForm({bonus:"",bonusNote:"",deduct:"",deductNote:""});
  };

  const openForm=(u)=>{
    const rec=getRecord(u.id);
    setForm({bonus:rec.bonus||"",bonusNote:rec.bonusNote||"",deduct:rec.deduct||"",deductNote:rec.deductNote||""});
    setShowForm(u.id);
  };

  const exportCSV=()=>{
    const rows=[
      [lang==="ar"?"الشهر":"Month",month],[""],
      [lang==="ar"?"الفني":"Tech",lang==="ar"?"المرتب الأساسي":"Base",lang==="ar"?"المبيعات":"Revenue",lang==="ar"?"المكافأة":"Bonus",lang==="ar"?"الخصم":"Deduct",lang==="ar"?"الصافي":"Net"],
      ...techs.map(u=>{const s=calcSalary(u);return[lang==="ar"?u.name:u.nameEn,s.base.toFixed(2),s.revenue.toFixed(2),s.bonus.toFixed(2),s.deduct.toFixed(2),s.net.toFixed(2)];})
    ];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const b=new Blob(["\uFEFF"+csv],{type:"text/csv"});
    const url=URL.createObjectURL(b);
    const a=document.createElement("a");
    a.href=url;a.download=`salaries-${month}.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  const totalNet=techs.reduce((s,u)=>s+calcSalary(u).net,0);

  return (
    <div dir={isRtl?"rtl":"ltr"}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <h2 style={{fontSize:19,fontWeight:700,color:"#e2e8f0",margin:0}}>💰 {lang==="ar"?"المرتبات":"Salaries"}</h2>
        <Row s={{gap:10,flexWrap:"wrap"}}>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
            style={{padding:"8px 12px",borderRadius:10,border:"1px solid #2a3a52",background:"#131926",color:"#e2e8f0",fontSize:13,outline:"none"}}/>
          <button onClick={exportCSV} style={{padding:"8px 16px",borderRadius:10,border:"none",background:"#065f46",color:"#34d399",fontSize:13,fontWeight:600,cursor:"pointer"}}>
            📤 {lang==="ar"?"تصدير CSV":"Export CSV"}
          </button>
        </Row>
      </div>

      {/* Summary card */}
      <div style={{background:"linear-gradient(135deg,#1a3055,#0d1f38)",border:"1px solid #2a3a52",borderRadius:16,padding:18,marginBottom:20,display:"flex",gap:20,flexWrap:"wrap"}}>
        <div style={{textAlign:"center",flex:1}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{lang==="ar"?"إجمالي المرتبات":"Total Salaries"}</div>
          <div style={{fontSize:22,fontWeight:800,color:"#fbbf24"}}>{totalNet.toFixed(2)} {lang==="ar"?"د.ل":"LYD"}</div>
        </div>
        <div style={{textAlign:"center",flex:1}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{lang==="ar"?"عدد الفنيين":"Technicians"}</div>
          <div style={{fontSize:22,fontWeight:800,color:"#60a5fa"}}>{techs.length}</div>
        </div>
        <div style={{textAlign:"center",flex:1}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{lang==="ar"?"الشهر":"Month"}</div>
          <div style={{fontSize:16,fontWeight:700,color:"#a78bfa"}}>{month}</div>
        </div>
      </div>

      {/* Tech cards */}
      {techs.length===0?(
        <Card s={{textAlign:"center",padding:40,color:"#374151"}}>
          <div style={{fontSize:40,marginBottom:10}}>👥</div>
          <div>{lang==="ar"?"لا يوجد فنيين بعد":"No technicians yet"}</div>
        </Card>
      ):(
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
          {techs.map(u=>{
            const s=calcSalary(u);
            const isEditing=showForm===u.id;
            return (
              <div key={u.id} className="card-ani" style={{background:"#151e2d",border:"1px solid #1e2e44",borderRadius:18,padding:20,position:"relative",overflow:"hidden"}}>
                {/* Top bar */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#f59e0b,#fbbf24)"}}/>

                {/* Tech header */}
                <Row s={{gap:12,marginBottom:16}}>
                  <div style={{width:46,height:46,borderRadius:13,background:"linear-gradient(135deg,#b45309,#f59e0b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🔧</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:"#e2e8f0"}}>{lang==="ar"?u.name:u.nameEn}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>@{u.username}</div>
                    <div style={{fontSize:11,color:"#a78bfa",marginTop:2}}>
                      {u.salary?(u.salaryType==="percent"?`${u.salary}% ${lang==="ar"?"من المبيعات":"of sales"}`:`${lang==="ar"?"ثابت":"Fixed"}: ${Number(u.salary).toFixed(2)} ${lang==="ar"?"د.ل":"LYD"}`):(lang==="ar"?"غير محدد":"Not set")}
                    </div>
                  </div>
                </Row>

                {/* Stats grid */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                  {[
                    {label:lang==="ar"?"المبيعات":"Revenue",val:`${s.revenue.toFixed(2)} ${lang==="ar"?"د.ل":"LYD"}`,col:"#10b981",icon:"💰"},
                    {label:lang==="ar"?"الفواتير":"Invoices",val:s.invoices,col:"#3b82f6",icon:"🧾"},
                    {label:lang==="ar"?"مكافأة":"Bonus",val:`+${s.bonus.toFixed(2)}`,col:"#f59e0b",icon:"🎁"},
                    {label:lang==="ar"?"خصم":"Deduct",val:`-${s.deduct.toFixed(2)}`,col:"#ef4444",icon:"✂️"},
                  ].map((item,i)=>(
                    <div key={i} style={{background:"#0f1520",borderRadius:10,padding:"10px 12px"}}>
                      <div style={{fontSize:10,color:"#64748b",marginBottom:4}}>{item.icon} {item.label}</div>
                      <div style={{fontSize:14,fontWeight:700,color:item.col}}>{item.val}</div>
                    </div>
                  ))}
                </div>

                {/* Net salary */}
                <div style={{background:"linear-gradient(135deg,#1a3055,#0d1f38)",borderRadius:12,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,color:"#94a3b8"}}>{lang==="ar"?"الصافي المستحق":"Net Salary"}</span>
                  <span style={{fontSize:20,fontWeight:800,color:"#fbbf24"}}>{s.net.toFixed(2)} <span style={{fontSize:12}}>{lang==="ar"?"د.ل":"LYD"}</span></span>
                </div>

                {/* Notes */}
                {(s.rec.bonusNote||s.rec.deductNote)&&(
                  <div style={{background:"#0f1520",borderRadius:10,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#64748b",lineHeight:1.8}}>
                    {s.rec.bonusNote&&<div>🎁 {s.rec.bonusNote}</div>}
                    {s.rec.deductNote&&<div>✂️ {s.rec.deductNote}</div>}
                  </div>
                )}

                {/* Edit form */}
                {isEditing?(
                  <div style={{background:"#0f1520",borderRadius:12,padding:14,marginBottom:10}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <FF label={`🎁 ${lang==="ar"?"مكافأة (د.ل)":"Bonus (LYD)"}`}>
                        <Inp type="number" value={form.bonus} onChange={e=>setForm(p=>({...p,bonus:e.target.value}))} placeholder="0"/>
                      </FF>
                      <FF label={`✂️ ${lang==="ar"?"خصم (د.ل)":"Deduct (LYD)"}`}>
                        <Inp type="number" value={form.deduct} onChange={e=>setForm(p=>({...p,deduct:e.target.value}))} placeholder="0"/>
                      </FF>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                      <FF label={lang==="ar"?"سبب المكافأة":"Bonus Reason"}>
                        <Inp value={form.bonusNote} onChange={e=>setForm(p=>({...p,bonusNote:e.target.value}))} placeholder={lang==="ar"?"اختياري...":"Optional..."}/>
                      </FF>
                      <FF label={lang==="ar"?"سبب الخصم":"Deduct Reason"}>
                        <Inp value={form.deductNote} onChange={e=>setForm(p=>({...p,deductNote:e.target.value}))} placeholder={lang==="ar"?"اختياري...":"Optional..."}/>
                      </FF>
                    </div>
                    <Row s={{gap:8}}>
                      <Btn onClick={()=>saveRecord(u.id)} col="#065f46" s={{flex:1}}>💾 {lang==="ar"?"حفظ":"Save"}</Btn>
                      <OBtn onClick={()=>setShowForm(null)} s={{flex:1}}>{lang==="ar"?"إلغاء":"Cancel"}</OBtn>
                    </Row>
                  </div>
                ):(
                  <button onClick={()=>openForm(u)} style={{width:"100%",padding:"9px",borderRadius:10,border:"1px solid #2a3a52",background:"transparent",color:"#94a3b8",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    ✏️ {lang==="ar"?"تعديل المكافأة والخصم":"Edit Bonus & Deduction"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  const restore=()=>{
    if(!pending)return;
    const d=pending.data;
    setUsers(d.users);setParts(d.parts);setTools(d.tools);setInvoices(d.invoices);setDevices(d.devices||[]);
    // Also persist to localStorage immediately
    try{
      localStorage.setItem("ayser_users",JSON.stringify(d.users));
      localStorage.setItem("ayser_parts",JSON.stringify(d.parts));
      localStorage.setItem("ayser_tools",JSON.stringify(d.tools));
      localStorage.setItem("ayser_invoices",JSON.stringify(d.invoices));
      localStorage.setItem("ayser_devices",JSON.stringify(d.devices||[]));
    }catch(e){}
    setConfirm(false);setPending(null);showToast(t.restoreSuccess);
  };
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
