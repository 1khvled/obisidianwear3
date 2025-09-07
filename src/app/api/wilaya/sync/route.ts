import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export interface WilayaData {
  id: number;
  name: string;
  nameAr: string;
  stopDeskEcommerce: number;
  domicileEcommerce: number;
}

// POST /api/wilaya/sync - Sync database wilaya tariffs to static file
export async function POST(request: NextRequest) {
  try {
    const databaseWilayas = await request.json();
    
    if (!Array.isArray(databaseWilayas)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of wilaya data.' },
        { status: 400 }
      );
    }

    // Transform database format to static file format
    const staticWilayas: WilayaData[] = databaseWilayas.map(wilaya => ({
      id: wilaya.wilaya_id || wilaya.id,
      name: wilaya.name,
      nameAr: getArabicName(wilaya.name),
      stopDeskEcommerce: wilaya.stop_desk_ecommerce || wilaya.stopDeskEcommerce || 0,
      domicileEcommerce: wilaya.domicile_ecommerce || wilaya.domicileEcommerce || 0
    }));

    // Generate the new wilayas.ts file content
    const fileContent = generateWilayasFile(staticWilayas);
    
    // Write to file
    const wilayasFilePath = join(process.cwd(), 'src', 'data', 'wilayas.ts');
    writeFileSync(wilayasFilePath, fileContent, 'utf8');
    
    console.log('Wilaya tariffs synced to static file successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Wilaya tariffs synced to static file successfully',
      count: staticWilayas.length
    });
    
  } catch (error) {
    console.error('Error syncing wilaya tariffs to static file:', error);
    return NextResponse.json(
      { error: 'Failed to sync wilaya tariffs to static file' },
      { status: 500 }
    );
  }
}

// Generate the complete wilayas.ts file content
function generateWilayasFile(wilayas: WilayaData[]): string {
  const wilayasArray = wilayas.map(wilaya => `  {
    id: ${wilaya.id},
    name: "${wilaya.name}",
    nameAr: "${wilaya.nameAr}",
    stopDeskEcommerce: ${wilaya.stopDeskEcommerce},
    domicileEcommerce: ${wilaya.domicileEcommerce}
  }`).join(',\n');

  return `export interface Wilaya {
  id: number;
  name: string;
  nameAr: string;
  stopDeskEcommerce: number;
  domicileEcommerce: number;
}

export const wilayas: Wilaya[] = [
${wilayasArray}
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
};`;
}

// Get Arabic name for wilaya
function getArabicName(englishName: string): string {
  const arabicNames: { [key: string]: string } = {
    'Adrar': 'أدرار',
    'Chlef': 'الشلف',
    'Laghouat': 'الأغواط',
    'Oum El Bouaghi': 'أم البواقي',
    'Batna': 'باتنة',
    'Béjaïa': 'بجاية',
    'Biskra': 'بسكرة',
    'Béchar': 'بشار',
    'Blida': 'البليدة',
    'Bouira': 'البويرة',
    'Tamanrasset': 'تمنراست',
    'Tébessa': 'تبسة',
    'Tlemcen': 'تلمسان',
    'Tiaret': 'تيارت',
    'Tizi Ouzou': 'تيزي وزو',
    'Alger': 'الجزائر',
    'Djelfa': 'الجلفة',
    'Jijel': 'جيجل',
    'Sétif': 'سطيف',
    'Saïda': 'سعيدة',
    'Skikda': 'سكيكدة',
    'Sidi Bel Abbès': 'سيدي بلعباس',
    'Annaba': 'عنابة',
    'Guelma': 'قالمة',
    'Constantine': 'قسنطينة',
    'Médéa': 'المدية',
    'Mostaganem': 'مستغانم',
    'M\'Sila': 'المسيلة',
    'Mascara': 'معسكر',
    'Ouargla': 'ورقلة',
    'Oran': 'وهران',
    'El Bayadh': 'البيض',
    'Illizi': 'إليزي',
    'Bordj Bou Arréridj': 'برج بوعريريج',
    'Boumerdès': 'بومرداس',
    'El Tarf': 'الطارف',
    'Tindouf': 'تندوف',
    'Tissemsilt': 'تيسمسيلت',
    'El Oued': 'الوادي',
    'Khenchela': 'خنشلة',
    'Souk Ahras': 'سوق أهراس',
    'Tipaza': 'تيبازة',
    'Mila': 'ميلة',
    'Aïn Defla': 'عين الدفلى',
    'Naâma': 'النعامة',
    'Aïn Témouchent': 'عين تيموشنت',
    'Ghardaïa': 'غرداية',
    'Relizane': 'غليزان',
    'Timimoun': 'تيميمون',
    'Bordj Badji Mokhtar': 'برج باجي مختار',
    'Ouled Djellal': 'أولاد جلال',
    'Beni Abbes': 'بني عباس',
    'In Salah': 'عين صالح',
    'In Guezzam': 'عين قزام',
    'Touggourt': 'تقرت',
    'Djanet': 'جانت',
    'El M\'Ghair': 'المغير',
    'El Meniaa': 'المنيعة'
  };

  return arabicNames[englishName] || englishName;
}
