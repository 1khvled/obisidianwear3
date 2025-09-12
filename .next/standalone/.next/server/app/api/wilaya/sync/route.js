"use strict";(()=>{var a={};a.id=1670,a.ids=[1670],a.modules={30517:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},57147:a=>{a.exports=require("fs")},71017:a=>{a.exports=require("path")},79975:(a,e,i)=>{i.r(e),i.d(e,{headerHooks:()=>f,originalPathname:()=>h,patchFetch:()=>g,requestAsyncStorage:()=>d,routeModule:()=>u,serverHooks:()=>p,staticGenerationAsyncStorage:()=>y,staticGenerationBailout:()=>w});var r={};i.r(r),i.d(r,{POST:()=>m});var t=i(95419),n=i(69108),o=i(99678),s=i(78070),l=i(57147),c=i(71017);async function m(a){try{let e=await a.json();if(!Array.isArray(e))return s.Z.json({error:"Invalid data format. Expected array of wilaya data."},{status:400});let i=e.map(a=>{var e;return{id:a.wilaya_id||a.id,name:a.name,nameAr:({Adrar:"أدرار",Chlef:"الشلف",Laghouat:"الأغواط","Oum El Bouaghi":"أم البواقي",Batna:"باتنة",Béjaïa:"بجاية",Biskra:"بسكرة",Béchar:"بشار",Blida:"البليدة",Bouira:"البويرة",Tamanrasset:"تمنراست",Tébessa:"تبسة",Tlemcen:"تلمسان",Tiaret:"تيارت","Tizi Ouzou":"تيزي وزو",Alger:"الجزائر",Djelfa:"الجلفة",Jijel:"جيجل",Sétif:"سطيف",Saïda:"سعيدة",Skikda:"سكيكدة","Sidi Bel Abb\xe8s":"سيدي بلعباس",Annaba:"عنابة",Guelma:"قالمة",Constantine:"قسنطينة",Médéa:"المدية",Mostaganem:"مستغانم","M'Sila":"المسيلة",Mascara:"معسكر",Ouargla:"ورقلة",Oran:"وهران","El Bayadh":"البيض",Illizi:"إليزي","Bordj Bou Arr\xe9ridj":"برج بوعريريج",Boumerdès:"بومرداس","El Tarf":"الطارف",Tindouf:"تندوف",Tissemsilt:"تيسمسيلت","El Oued":"الوادي",Khenchela:"خنشلة","Souk Ahras":"سوق أهراس",Tipaza:"تيبازة",Mila:"ميلة","A\xefn Defla":"عين الدفلى",Naâma:"النعامة","A\xefn T\xe9mouchent":"عين تيموشنت",Ghardaïa:"غرداية",Relizane:"غليزان",Timimoun:"تيميمون","Bordj Badji Mokhtar":"برج باجي مختار","Ouled Djellal":"أولاد جلال","Beni Abbes":"بني عباس","In Salah":"عين صالح","In Guezzam":"عين قزام",Touggourt:"تقرت",Djanet:"جانت","El M'Ghair":"المغير","El Meniaa":"المنيعة"})[e=a.name]||e,stopDeskEcommerce:a.stop_desk_ecommerce||a.stopDeskEcommerce||0,domicileEcommerce:a.domicile_ecommerce||a.domicileEcommerce||0}}),r=function(a){let e=a.map(a=>`  {
    id: ${a.id},
    name: "${a.name}",
    nameAr: "${a.nameAr}",
    stopDeskEcommerce: ${a.stopDeskEcommerce},
    domicileEcommerce: ${a.domicileEcommerce}
  }`).join(",\n");return`export interface Wilaya {
  id: number;
  name: string;
  nameAr: string;
  stopDeskEcommerce: number;
  domicileEcommerce: number;
}

export const wilayas: Wilaya[] = [
${e}
];

// Sort wilayas by their ID (official numbering)
export const sortedWilayas = wilayas.sort((a, b) => a.id - b.id);

// Helper function to get wilaya by ID
export const getWilayaById = (id: number): Wilaya | undefined => {
  return wilayas.find(wilaya => wilaya.id === id);
};

// Helper function to get wilaya by name
export const getWilayaByName = (name: string): Wilaya | undefined => {
  return wilayas.find(wilaya => 
    wilaya.name.toLowerCase() === name.toLowerCase() ||
    wilaya.nameAr === name
  );
};`}(i),t=(0,c.join)(process.cwd(),"src","data","wilayas.ts");return(0,l.writeFileSync)(t,r,"utf8"),console.log("Wilaya tariffs synced to static file successfully"),s.Z.json({success:!0,message:"Wilaya tariffs synced to static file successfully",count:i.length})}catch(a){return console.error("Error syncing wilaya tariffs to static file:",a),s.Z.json({error:"Failed to sync wilaya tariffs to static file"},{status:500})}}let u=new t.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/wilaya/sync/route",pathname:"/api/wilaya/sync",filename:"route",bundlePath:"app/api/wilaya/sync/route"},resolvedPagePath:"C:\\Users\\HP\\Desktop\\Obsidian wear\\projectt\\src\\app\\api\\wilaya\\sync\\route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:y,serverHooks:p,headerHooks:f,staticGenerationBailout:w}=u,h="/api/wilaya/sync/route";function g(){return(0,o.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:y})}}};var e=require("../../../../webpack-runtime.js");e.C(a);var i=a=>e(e.s=a),r=e.X(0,[1638,6206],()=>i(79975));module.exports=r})();