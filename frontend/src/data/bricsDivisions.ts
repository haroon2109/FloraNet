/**
 * BRICS Administrative Divisions — REAL reference data
 *
 * Sources (all public-domain / official):
 *  - Brazil: 26 estados + 1 Distrito Federal   (Constituição Federal de 1988, Art. 18; ISO 3166-2:BR)
 *  - Russia: 83 federal subjects (internationally recognized) — 46 oblasts, 9 krais,
 *            21 republics, 4 autonomous okrugs, 1 autonomous oblast, 2 federal cities
 *            (Constitution of Russia, Ch. 3 Art. 65; ISO 3166-2:RU)
 *  - India:  28 states + 8 union territories    (States Reorganisation / J&K Reorganisation Act 2019; ISO 3166-2:IN)
 *  - China:  22 provinces + 5 autonomous regions + 4 direct-administered municipalities + 2 SARs
 *            (administered divisions; ISO 3166-2:CN)
 *  - South Africa: 9 provinces                  (Constitution of SA, 1996, Ch. 6; ISO 3166-2:ZA)
 *  - Egypt: 27 governorates                      (ISO 3166-2:EG)
 *  - Ethiopia: 12 regional states + 2 chartered cities (post-2023/24 reorganisation; ISO 3166-2:ET)
 *  - Iran: 31 provinces                          (ISO 3166-2:IR)
 *  - UAE: 7 emirates                             (Const. Art. 1; ISO 3166-2:AE)
 */

export interface BRICSDivision {
  name: string;
  type: 'State' | 'Province' | 'Oblast' | 'Krai' | 'Republic' | 'Autonomous Okrug' | 'Autonomous Oblast' | 'Federal District' | 'Federal City' | 'Union Territory' | 'Autonomous Region' | 'Municipality' | 'SAR' | 'Governorate' | 'Regional State' | 'Chartered City' | 'Emirate';
  country:
    | 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa'
    | 'Egypt' | 'Ethiopia' | 'Iran' | 'UAE';
}

export interface BRICSNationDivisions {
  country:
    | 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa'
    | 'Egypt' | 'Ethiopia' | 'Iran' | 'UAE';
  flag: string;
  summary: string;
  totalDivisions: number;
  divisions: BRICSDivision[];
}

export const bricsAdministrativeDivisions: BRICSNationDivisions[] = [
  {
    country: 'Brazil',
    flag: '🇧🇷',
    summary: '26 States (Estados) and 1 Federal District (Distrito Federal)',
    totalDivisions: 27,
    divisions: [
      // 26 States
      { name: 'Acre', type: 'State', country: 'Brazil' },
      { name: 'Alagoas', type: 'State', country: 'Brazil' },
      { name: 'Amapá', type: 'State', country: 'Brazil' },
      { name: 'Amazonas', type: 'State', country: 'Brazil' },
      { name: 'Bahia', type: 'State', country: 'Brazil' },
      { name: 'Ceará', type: 'State', country: 'Brazil' },
      { name: 'Espírito Santo', type: 'State', country: 'Brazil' },
      { name: 'Goiás', type: 'State', country: 'Brazil' },
      { name: 'Maranhão', type: 'State', country: 'Brazil' },
      { name: 'Mato Grosso', type: 'State', country: 'Brazil' },
      { name: 'Mato Grosso do Sul', type: 'State', country: 'Brazil' },
      { name: 'Minas Gerais', type: 'State', country: 'Brazil' },
      { name: 'Pará', type: 'State', country: 'Brazil' },
      { name: 'Paraíba', type: 'State', country: 'Brazil' },
      { name: 'Paraná', type: 'State', country: 'Brazil' },
      { name: 'Pernambuco', type: 'State', country: 'Brazil' },
      { name: 'Piauí', type: 'State', country: 'Brazil' },
      { name: 'Rio de Janeiro', type: 'State', country: 'Brazil' },
      { name: 'Rio Grande do Norte', type: 'State', country: 'Brazil' },
      { name: 'Rio Grande do Sul', type: 'State', country: 'Brazil' },
      { name: 'Rondônia', type: 'State', country: 'Brazil' },
      { name: 'Roraima', type: 'State', country: 'Brazil' },
      { name: 'Santa Catarina', type: 'State', country: 'Brazil' },
      { name: 'São Paulo', type: 'State', country: 'Brazil' },
      { name: 'Sergipe', type: 'State', country: 'Brazil' },
      { name: 'Tocantins', type: 'State', country: 'Brazil' },
      // 1 Federal District
      { name: 'Distrito Federal', type: 'Federal District', country: 'Brazil' },
    ]
  },
  {
    country: 'Russia',
    flag: '🇷🇺',
    summary: '83 Federal Subjects: 46 Oblasts, 9 Krais, 21 Republics, 4 Autonomous Okrugs, 1 Autonomous Oblast, 2 Federal Cities',
    totalDivisions: 83,
    divisions: [
      // ── 46 Oblasts ──
      { name: 'Amur Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Arkhangelsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Astrakhan Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Belgorod Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Bryansk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Chelyabinsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Irkutsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Ivanovo Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Kaliningrad Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Kaluga Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Kemerovo Oblast (Kuzbass)', type: 'Oblast', country: 'Russia' },
      { name: 'Kirov Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Kostroma Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Kurgan Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Kursk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Leningrad Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Lipetsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Magadan Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Moscow Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Murmansk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Nizhny Novgorod Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Novgorod Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Novosibirsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Omsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Orenburg Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Oryol Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Penza Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Pskov Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Rostov Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Ryazan Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Sakhalin Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Samara Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Saratov Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Smolensk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Sverdlovsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Tambov Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Tomsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Tula Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Tver Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Tyumen Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Ulyanovsk Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Vladimir Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Volgograd Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Vologda Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Voronezh Oblast', type: 'Oblast', country: 'Russia' },
      { name: 'Yaroslavl Oblast', type: 'Oblast', country: 'Russia' },
      // ── 9 Krais ──
      { name: 'Altai Krai', type: 'Krai', country: 'Russia' },
      { name: 'Kamchatka Krai', type: 'Krai', country: 'Russia' },
      { name: 'Khabarovsk Krai', type: 'Krai', country: 'Russia' },
      { name: 'Krasnodar Krai', type: 'Krai', country: 'Russia' },
      { name: 'Krasnoyarsk Krai', type: 'Krai', country: 'Russia' },
      { name: 'Perm Krai', type: 'Krai', country: 'Russia' },
      { name: 'Primorsky Krai', type: 'Krai', country: 'Russia' },
      { name: 'Stavropol Krai', type: 'Krai', country: 'Russia' },
      { name: 'Zabaykalsky Krai', type: 'Krai', country: 'Russia' },
      // ── 21 Republics ──
      { name: 'Adygea', type: 'Republic', country: 'Russia' },
      { name: 'Altai Republic', type: 'Republic', country: 'Russia' },
      { name: 'Bashkortostan', type: 'Republic', country: 'Russia' },
      { name: 'Buryatia', type: 'Republic', country: 'Russia' },
      { name: 'Chechen Republic', type: 'Republic', country: 'Russia' },
      { name: 'Chuvashia', type: 'Republic', country: 'Russia' },
      { name: 'Dagestan', type: 'Republic', country: 'Russia' },
      { name: 'Ingushetia', type: 'Republic', country: 'Russia' },
      { name: 'Kabardino-Balkaria', type: 'Republic', country: 'Russia' },
      { name: 'Kalmykia', type: 'Republic', country: 'Russia' },
      { name: 'Karachay-Cherkessia', type: 'Republic', country: 'Russia' },
      { name: 'Karelia', type: 'Republic', country: 'Russia' },
      { name: 'Khakassia', type: 'Republic', country: 'Russia' },
      { name: 'Komi', type: 'Republic', country: 'Russia' },
      { name: 'Mari El', type: 'Republic', country: 'Russia' },
      { name: 'Mordovia', type: 'Republic', country: 'Russia' },
      { name: 'Sakha (Yakutia)', type: 'Republic', country: 'Russia' },
      { name: 'North Ossetia–Alania', type: 'Republic', country: 'Russia' },
      { name: 'Tatarstan', type: 'Republic', country: 'Russia' },
      { name: 'Tuva', type: 'Republic', country: 'Russia' },
      { name: 'Udmurtia', type: 'Republic', country: 'Russia' },
      // ── 4 Autonomous Okrugs ──
      { name: 'Chukotka Autonomous Okrug', type: 'Autonomous Okrug', country: 'Russia' },
      { name: 'Khanty-Mansi Autonomous Okrug – Yugra', type: 'Autonomous Okrug', country: 'Russia' },
      { name: 'Nenets Autonomous Okrug', type: 'Autonomous Okrug', country: 'Russia' },
      { name: 'Yamalo-Nenets Autonomous Okrug', type: 'Autonomous Okrug', country: 'Russia' },
      // ── 1 Autonomous Oblast ──
      { name: 'Jewish Autonomous Oblast', type: 'Autonomous Oblast', country: 'Russia' },
      // ── 2 Federal Cities ──
      { name: 'Moscow (Federal City)', type: 'Federal City', country: 'Russia' },
      { name: 'St. Petersburg (Federal City)', type: 'Federal City', country: 'Russia' },
    ]
  },
  {
    country: 'India',
    flag: '🇮🇳',
    summary: '28 States and 8 Union Territories',
    totalDivisions: 36,
    divisions: [
      // 28 States
      { name: 'Andhra Pradesh', type: 'State', country: 'India' },
      { name: 'Arunachal Pradesh', type: 'State', country: 'India' },
      { name: 'Assam', type: 'State', country: 'India' },
      { name: 'Bihar', type: 'State', country: 'India' },
      { name: 'Chhattisgarh', type: 'State', country: 'India' },
      { name: 'Goa', type: 'State', country: 'India' },
      { name: 'Gujarat', type: 'State', country: 'India' },
      { name: 'Haryana', type: 'State', country: 'India' },
      { name: 'Himachal Pradesh', type: 'State', country: 'India' },
      { name: 'Jharkhand', type: 'State', country: 'India' },
      { name: 'Karnataka', type: 'State', country: 'India' },
      { name: 'Kerala', type: 'State', country: 'India' },
      { name: 'Madhya Pradesh', type: 'State', country: 'India' },
      { name: 'Maharashtra', type: 'State', country: 'India' },
      { name: 'Manipur', type: 'State', country: 'India' },
      { name: 'Meghalaya', type: 'State', country: 'India' },
      { name: 'Mizoram', type: 'State', country: 'India' },
      { name: 'Nagaland', type: 'State', country: 'India' },
      { name: 'Odisha', type: 'State', country: 'India' },
      { name: 'Punjab', type: 'State', country: 'India' },
      { name: 'Rajasthan', type: 'State', country: 'India' },
      { name: 'Sikkim', type: 'State', country: 'India' },
      { name: 'Tamil Nadu', type: 'State', country: 'India' },
      { name: 'Telangana', type: 'State', country: 'India' },
      { name: 'Tripura', type: 'State', country: 'India' },
      { name: 'Uttar Pradesh', type: 'State', country: 'India' },
      { name: 'Uttarakhand', type: 'State', country: 'India' },
      { name: 'West Bengal', type: 'State', country: 'India' },
      // 8 Union Territories
      { name: 'Andaman and Nicobar Islands', type: 'Union Territory', country: 'India' },
      { name: 'Chandigarh', type: 'Union Territory', country: 'India' },
      { name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory', country: 'India' },
      { name: 'Delhi (National Capital Territory)', type: 'Union Territory', country: 'India' },
      { name: 'Jammu and Kashmir', type: 'Union Territory', country: 'India' },
      { name: 'Ladakh', type: 'Union Territory', country: 'India' },
      { name: 'Lakshadweep', type: 'Union Territory', country: 'India' },
      { name: 'Puducherry', type: 'Union Territory', country: 'India' },
    ]
  },
  {
    country: 'China',
    flag: '🇨🇳',
    summary: '22 Provinces, 5 Autonomous Regions, 4 Municipalities, and 2 SARs',
    totalDivisions: 33,
    divisions: [
      // 22 Provinces (administered)
      { name: 'Anhui', type: 'Province', country: 'China' },
      { name: 'Fujian', type: 'Province', country: 'China' },
      { name: 'Gansu', type: 'Province', country: 'China' },
      { name: 'Guangdong', type: 'Province', country: 'China' },
      { name: 'Guizhou', type: 'Province', country: 'China' },
      { name: 'Hainan', type: 'Province', country: 'China' },
      { name: 'Hebei', type: 'Province', country: 'China' },
      { name: 'Heilongjiang', type: 'Province', country: 'China' },
      { name: 'Henan', type: 'Province', country: 'China' },
      { name: 'Hubei', type: 'Province', country: 'China' },
      { name: 'Hunan', type: 'Province', country: 'China' },
      { name: 'Jiangsu', type: 'Province', country: 'China' },
      { name: 'Jiangxi', type: 'Province', country: 'China' },
      { name: 'Jilin', type: 'Province', country: 'China' },
      { name: 'Liaoning', type: 'Province', country: 'China' },
      { name: 'Qinghai', type: 'Province', country: 'China' },
      { name: 'Shaanxi', type: 'Province', country: 'China' },
      { name: 'Shandong', type: 'Province', country: 'China' },
      { name: 'Shanxi', type: 'Province', country: 'China' },
      { name: 'Sichuan', type: 'Province', country: 'China' },
      { name: 'Yunnan', type: 'Province', country: 'China' },
      { name: 'Zhejiang', type: 'Province', country: 'China' },
      // 5 Autonomous Regions
      { name: 'Guangxi', type: 'Autonomous Region', country: 'China' },
      { name: 'Inner Mongolia', type: 'Autonomous Region', country: 'China' },
      { name: 'Ningxia', type: 'Autonomous Region', country: 'China' },
      { name: 'Tibet (Xizang)', type: 'Autonomous Region', country: 'China' },
      { name: 'Xinjiang', type: 'Autonomous Region', country: 'China' },
      // 4 Direct-Administered Municipalities
      { name: 'Beijing', type: 'Municipality', country: 'China' },
      { name: 'Chongqing', type: 'Municipality', country: 'China' },
      { name: 'Shanghai', type: 'Municipality', country: 'China' },
      { name: 'Tianjin', type: 'Municipality', country: 'China' },
      // 2 Special Administrative Regions (SARs)
      { name: 'Hong Kong', type: 'SAR', country: 'China' },
      { name: 'Macau', type: 'SAR', country: 'China' },
    ]
  },
  {
    country: 'South Africa',
    flag: '🇿🇦',
    summary: '9 Provinces established in 1994',
    totalDivisions: 9,
    divisions: [
      { name: 'Eastern Cape', type: 'Province', country: 'South Africa' },
      { name: 'Free State', type: 'Province', country: 'South Africa' },
      { name: 'Gauteng', type: 'Province', country: 'South Africa' },
      { name: 'KwaZulu-Natal', type: 'Province', country: 'South Africa' },
      { name: 'Limpopo', type: 'Province', country: 'South Africa' },
      { name: 'Mpumalanga', type: 'Province', country: 'South Africa' },
      { name: 'Northern Cape', type: 'Province', country: 'South Africa' },
      { name: 'North West', type: 'Province', country: 'South Africa' },
      { name: 'Western Cape', type: 'Province', country: 'South Africa' },
    ]
  },
  {
    country: 'Egypt',
    flag: '🇪🇬',
    summary: '27 Governorates (Muhafazat)',
    totalDivisions: 27,
    divisions: [
      // 27 Governorates (ISO 3166-2:EG)
      { name: 'Alexandria', type: 'Governorate', country: 'Egypt' },
      { name: 'Aswan', type: 'Governorate', country: 'Egypt' },
      { name: 'Asyut', type: 'Governorate', country: 'Egypt' },
      { name: 'Beheira', type: 'Governorate', country: 'Egypt' },
      { name: 'Beni Suef', type: 'Governorate', country: 'Egypt' },
      { name: 'Cairo', type: 'Governorate', country: 'Egypt' },
      { name: 'Dakahlia', type: 'Governorate', country: 'Egypt' },
      { name: 'Damietta', type: 'Governorate', country: 'Egypt' },
      { name: 'Fayoum', type: 'Governorate', country: 'Egypt' },
      { name: 'Gharbia', type: 'Governorate', country: 'Egypt' },
      { name: 'Giza', type: 'Governorate', country: 'Egypt' },
      { name: 'Ismailia', type: 'Governorate', country: 'Egypt' },
      { name: 'Kafr El Sheikh', type: 'Governorate', country: 'Egypt' },
      { name: 'Luxor', type: 'Governorate', country: 'Egypt' },
      { name: 'Matrouh', type: 'Governorate', country: 'Egypt' },
      { name: 'Minya', type: 'Governorate', country: 'Egypt' },
      { name: 'Monufia', type: 'Governorate', country: 'Egypt' },
      { name: 'New Valley', type: 'Governorate', country: 'Egypt' },
      { name: 'North Sinai', type: 'Governorate', country: 'Egypt' },
      { name: 'Port Said', type: 'Governorate', country: 'Egypt' },
      { name: 'Qalyubia', type: 'Governorate', country: 'Egypt' },
      { name: 'Qena', type: 'Governorate', country: 'Egypt' },
      { name: 'Red Sea', type: 'Governorate', country: 'Egypt' },
      { name: 'Sharqia', type: 'Governorate', country: 'Egypt' },
      { name: 'Sohag', type: 'Governorate', country: 'Egypt' },
      { name: 'South Sinai', type: 'Governorate', country: 'Egypt' },
      { name: 'Suez', type: 'Governorate', country: 'Egypt' },
    ]
  },
  {
    country: 'Ethiopia',
    flag: '🇪🇹',
    summary: '12 Regional States and 2 Chartered Cities',
    totalDivisions: 14,
    divisions: [
      // 12 Regional States (post-2023/24 reorganisation, incl. South Ethiopia,
      // South West Ethiopia Peoples', Sidama and Central Ethiopia)
      { name: 'Afar', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Amhara', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Benishangul-Gumuz', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Central Ethiopia', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Gambela', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Harari', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Oromia', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Sidama', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Somali', type: 'Regional State', country: 'Ethiopia' },
      { name: 'South Ethiopia', type: 'Regional State', country: 'Ethiopia' },
      { name: 'South West Ethiopia Peoples\'', type: 'Regional State', country: 'Ethiopia' },
      { name: 'Tigray', type: 'Regional State', country: 'Ethiopia' },
      // 2 Chartered Cities
      { name: 'Addis Ababa', type: 'Chartered City', country: 'Ethiopia' },
      { name: 'Dire Dawa', type: 'Chartered City', country: 'Ethiopia' },
    ]
  },
  {
    country: 'Iran',
    flag: '🇮🇷',
    summary: '31 Provinces (Ostanha)',
    totalDivisions: 31,
    divisions: [
      // 31 Provinces (ISO 3166-2:IR)
      { name: 'Alborz', type: 'Province', country: 'Iran' },
      { name: 'Ardabil', type: 'Province', country: 'Iran' },
      { name: 'Bushehr', type: 'Province', country: 'Iran' },
      { name: 'Chaharmahal and Bakhtiari', type: 'Province', country: 'Iran' },
      { name: 'East Azerbaijan', type: 'Province', country: 'Iran' },
      { name: 'Fars', type: 'Province', country: 'Iran' },
      { name: 'Gilan', type: 'Province', country: 'Iran' },
      { name: 'Golestan', type: 'Province', country: 'Iran' },
      { name: 'Hamadan', type: 'Province', country: 'Iran' },
      { name: 'Hormozgan', type: 'Province', country: 'Iran' },
      { name: 'Ilam', type: 'Province', country: 'Iran' },
      { name: 'Isfahan', type: 'Province', country: 'Iran' },
      { name: 'Kerman', type: 'Province', country: 'Iran' },
      { name: 'Kermanshah', type: 'Province', country: 'Iran' },
      { name: 'Khuzestan', type: 'Province', country: 'Iran' },
      { name: 'Kohgiluyeh and Boyer-Ahmad', type: 'Province', country: 'Iran' },
      { name: 'Kurdistan', type: 'Province', country: 'Iran' },
      { name: 'Lorestan', type: 'Province', country: 'Iran' },
      { name: 'Markazi', type: 'Province', country: 'Iran' },
      { name: 'Mazandaran', type: 'Province', country: 'Iran' },
      { name: 'North Khorasan', type: 'Province', country: 'Iran' },
      { name: 'Qazvin', type: 'Province', country: 'Iran' },
      { name: 'Qom', type: 'Province', country: 'Iran' },
      { name: 'Razavi Khorasan', type: 'Province', country: 'Iran' },
      { name: 'Semnan', type: 'Province', country: 'Iran' },
      { name: 'Sistan and Baluchestan', type: 'Province', country: 'Iran' },
      { name: 'South Khorasan', type: 'Province', country: 'Iran' },
      { name: 'Tehran', type: 'Province', country: 'Iran' },
      { name: 'West Azerbaijan', type: 'Province', country: 'Iran' },
      { name: 'Yazd', type: 'Province', country: 'Iran' },
      { name: 'Zanjan', type: 'Province', country: 'Iran' },
    ]
  },
  {
    country: 'UAE',
    flag: '🇦🇪',
    summary: '7 Emirates',
    totalDivisions: 7,
    divisions: [
      // 7 Emirates (Constitution Art. 1)
      { name: 'Abu Dhabi', type: 'Emirate', country: 'UAE' },
      { name: 'Ajman', type: 'Emirate', country: 'UAE' },
      { name: 'Dubai', type: 'Emirate', country: 'UAE' },
      { name: 'Fujairah', type: 'Emirate', country: 'UAE' },
      { name: 'Ras Al Khaimah', type: 'Emirate', country: 'UAE' },
      { name: 'Sharjah', type: 'Emirate', country: 'UAE' },
      { name: 'Umm Al Quwain', type: 'Emirate', country: 'UAE' },
    ]
  }
];

export function normalizeCountryName(countryName: string):
  | 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa'
  | 'Egypt' | 'Ethiopia' | 'Iran' | 'UAE'
  | null {
  if (!countryName) return null;
  const raw = countryName.trim().toLowerCase();
  if (raw === 'in' || raw === 'india') return 'India';
  if (raw === 'br' || raw === 'brazil') return 'Brazil';
  if (raw === 'ru' || raw === 'russia') return 'Russia';
  if (raw === 'cn' || raw === 'china') return 'China';
  if (raw === 'za' || raw === 'south africa' || raw === 'southafrica') return 'South Africa';
  if (raw === 'eg' || raw === 'egypt') return 'Egypt';
  if (raw === 'et' || raw === 'ethiopia') return 'Ethiopia';
  if (raw === 'ir' || raw === 'iran') return 'Iran';
  if (raw === 'ae' || raw === 'uae' || raw === 'united arab emirates') return 'UAE';
  return null;
}

export function getDivisionsForCountry(countryName: string): BRICSDivision[] {
  const norm = normalizeCountryName(countryName);
  if (!norm) return [];
  const match = bricsAdministrativeDivisions.find(n => n.country === norm);
  return match ? match.divisions : [];
}
