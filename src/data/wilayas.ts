export interface Wilaya {
  id: number;
  name: string;
  nameAr: string;
  stopDeskEcommerce: number;
  domicileEcommerce: number;
}

export const wilayas: Wilaya[] = [
  // Biskra (7)
  {
    id: 7,
    name: "Biskra",
    nameAr: "بسكرة",
    stopDeskEcommerce: 300,
    domicileEcommerce: 500
  },
  
  // Major cities (Alger, Chlef, Blida, etc.)
  {
    id: 16,
    name: "Alger",
    nameAr: "الجزائر",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 2,
    name: "Chlef",
    nameAr: "الشلف",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 9,
    name: "Blida",
    nameAr: "البليدة",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 10,
    name: "Bouira",
    nameAr: "البويرة",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 15,
    name: "Tizi Ouzou",
    nameAr: "تيزي وزو",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 19,
    name: "Sétif",
    nameAr: "سطيف",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 25,
    name: "Constantine",
    nameAr: "قسنطينة",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 26,
    name: "Médéa",
    nameAr: "المدية",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 31,
    name: "Oran",
    nameAr: "وهران",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 34,
    name: "Bordj Bou Arreridj",
    nameAr: "برج بوعريريج",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 35,
    name: "Boumerdès",
    nameAr: "بومرداس",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 42,
    name: "Tipaza",
    nameAr: "تيبازة",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },
  {
    id: 44,
    name: "Aïn Defla",
    nameAr: "عين الدفلى",
    stopDeskEcommerce: 400,
    domicileEcommerce: 700
  },

  // Second tier wilayas
  {
    id: 4,
    name: "Oum El Bouaghi",
    nameAr: "أم البواقي",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 5,
    name: "Batna",
    nameAr: "باتنة",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 6,
    name: "Béjaïa",
    nameAr: "بجاية",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 13,
    name: "Tlemcen",
    nameAr: "تلمسان",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 14,
    name: "Tiaret",
    nameAr: "تيارت",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 18,
    name: "Jijel",
    nameAr: "جيجل",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 21,
    name: "Skikda",
    nameAr: "سكيكدة",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 22,
    name: "Sidi Bel Abbès",
    nameAr: "سيدي بلعباس",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 23,
    name: "Annaba",
    nameAr: "عنابة",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 27,
    name: "Mostaganem",
    nameAr: "مستغانم",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 28,
    name: "M'Sila",
    nameAr: "المسيلة",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 38,
    name: "Tissemsilt",
    nameAr: "تيسمسيلت",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 43,
    name: "Mila",
    nameAr: "ميلة",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },
  {
    id: 48,
    name: "Relizane",
    nameAr: "غليزان",
    stopDeskEcommerce: 450,
    domicileEcommerce: 750
  },

  // Third tier wilayas
  {
    id: 17,
    name: "Djelfa",
    nameAr: "الجلفة",
    stopDeskEcommerce: 550,
    domicileEcommerce: 800
  },
  {
    id: 20,
    name: "Saïda",
    nameAr: "سعيدة",
    stopDeskEcommerce: 550,
    domicileEcommerce: 800
  },
  {
    id: 24,
    name: "Guelma",
    nameAr: "قالمة",
    stopDeskEcommerce: 550,
    domicileEcommerce: 800
  },
  {
    id: 29,
    name: "Mascara",
    nameAr: "معسكر",
    stopDeskEcommerce: 550,
    domicileEcommerce: 800
  },
  {
    id: 40,
    name: "Khenchela",
    nameAr: "خنشلة",
    stopDeskEcommerce: 550,
    domicileEcommerce: 800
  },
  {
    id: 41,
    name: "Souk Ahras",
    nameAr: "سوق أهراس",
    stopDeskEcommerce: 550,
    domicileEcommerce: 800
  },
  {
    id: 46,
    name: "Aïn Témouchent",
    nameAr: "عين تيموشنت",
    stopDeskEcommerce: 550,
    domicileEcommerce: 800
  },

  // Fourth tier wilayas
  {
    id: 12,
    name: "Tébessa",
    nameAr: "تبسة",
    stopDeskEcommerce: 550,
    domicileEcommerce: 850
  },
  {
    id: 36,
    name: "El Tarf",
    nameAr: "الطارف",
    stopDeskEcommerce: 550,
    domicileEcommerce: 850
  },

  // Fifth tier wilayas
  {
    id: 3,
    name: "Laghouat",
    nameAr: "الأغواط",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },
  {
    id: 30,
    name: "Ouargla",
    nameAr: "ورقلة",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },
  {
    id: 32,
    name: "El Bayadh",
    nameAr: "البيض",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },
  {
    id: 39,
    name: "El Oued",
    nameAr: "الوادي",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },
  {
    id: 45,
    name: "Naâma",
    nameAr: "النعامة",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },
  {
    id: 47,
    name: "Ghardaïa",
    nameAr: "غرداية",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },
  {
    id: 55,
    name: "Touggourt",
    nameAr: "تقرت",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },
  {
    id: 57,
    name: "El M'Ghair",
    nameAr: "المغير",
    stopDeskEcommerce: 600,
    domicileEcommerce: 900
  },

  // Sixth tier wilayas
  {
    id: 33,
    name: "Illizi",
    nameAr: "إليزي",
    stopDeskEcommerce: 700,
    domicileEcommerce: 1000
  },
  {
    id: 1,
    name: "Adrar",
    nameAr: "أدرار",
    stopDeskEcommerce: 700,
    domicileEcommerce: 1000
  },
  {
    id: 8,
    name: "Béchar",
    nameAr: "بشار",
    stopDeskEcommerce: 700,
    domicileEcommerce: 1000
  },
  {
    id: 49,
    name: "Timimoun",
    nameAr: "تيميمون",
    stopDeskEcommerce: 700,
    domicileEcommerce: 1000
  },
  {
    id: 52,
    name: "Beni Abbes",
    nameAr: "بني عباس",
    stopDeskEcommerce: 700,
    domicileEcommerce: 1000
  },
  {
    id: 11,
    name: "Tamanrasset",
    nameAr: "تمنراست",
    stopDeskEcommerce: 700,
    domicileEcommerce: 1000
  },
  {
    id: 37,
    name: "Tindouf",
    nameAr: "تندوف",
    stopDeskEcommerce: 700,
    domicileEcommerce: 1000
  },

  // Special case - El Meniaa
  {
    id: 50,
    name: "El Meniaa",
    nameAr: "المنيعة",
    stopDeskEcommerce: 800,
    domicileEcommerce: 1100
  },

  // Highest tier wilayas
  {
    id: 51,
    name: "Bordj Badji Mokhtar",
    nameAr: "برج باجي مختار",
    stopDeskEcommerce: 900,
    domicileEcommerce: 1200
  },
  {
    id: 53,
    name: "In Salah",
    nameAr: "عين صالح",
    stopDeskEcommerce: 900,
    domicileEcommerce: 1200
  },
  {
    id: 54,
    name: "In Guezzam",
    nameAr: "عين قزام",
    stopDeskEcommerce: 900,
    domicileEcommerce: 1200
  },
  {
    id: 56,
    name: "Djanet",
    nameAr: "جانت",
    stopDeskEcommerce: 900,
    domicileEcommerce: 1200
  }
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
};