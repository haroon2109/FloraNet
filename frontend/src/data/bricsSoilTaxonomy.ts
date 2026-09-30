/**
 * BRICS Soil Taxonomy — REAL reference profiles
 *
 * Classifications follow USDA Soil Taxonomy orders cross-referenced with WRB
 * (World Reference Base for Soil Resources, FAO/ISRIC) and national systems:
 *   - Brazil: Embrapa Brazilian Soil Classification System (SiBCS)
 *   - Russia: Russian soil classification (Chernozem/Podzol traditions)
 *   - India:  ICAR NBSS&LUP soil regions
 *   - China:  Chinese Soil Taxonomy (Loess Plateau, paddy Anthrosols)
 *   - South Africa: SA soil forms (Hutton, Clovelly, Arcadia, Inanda, Magwa)
 *   - Egypt:  Nile alluvial Fluvisols + Saharan Aridisols (Calcids)
 *   - Ethiopia: Ethiopian highland Nitisols/Vertisols (EIAR soil atlas)
 *   - Iran:   Iranian plateau Aridisols (Calcids/Gypsids) + Salids
 *   - UAE:    desert Arenosols + coastal sabkha Salids
 * Coverage percentages cite national soil survey publications:
 *  - Brazil: Embrapa "Soils in Brazil" — Oxisols+Argisols ≈58% of territory
 *    (Argisols ≈24%, making Latossolos ≈34%); https://www.embrapa.br/en/tema-solos-brasileiros
 *  - India: ICAR-NBSS&LUP / standard geography references — alluvial soils
 *    ≈46% (~15 lakh km²), black (Vertisol) soils ≈15% of land area.
 */

export interface BRICSSoilProfile {
  id: string;
  name: string;
  localName?: string;
  scientificClassification: string;
  country:
    | 'Brazil' | 'Russia' | 'India' | 'China' | 'South Africa'
    | 'Egypt' | 'Ethiopia' | 'Iran' | 'UAE';
  category: 'Major Regional Belt' | 'Agricultural Dominant' | 'Rare / Highly Localized' | 'Special Ecosystem';
  percentageCoverage?: string;
  description: string;
  location: string;
  hexColor: string;
  phRange: string;
  fertilityLevel: string;
  drainage: string;
  bestCrops: string[];
  bioAmendments: string[];
}

export const bricsSoilProfiles: BRICSSoilProfile[] = [
  // ================= BRAZIL =================
  {
    id: 'br-latosols',
    name: 'Latosols (Latosolos)',
    localName: 'Terra Vermelha / Latossolos do Cerrado',
    scientificClassification: 'Oxisols / Ferralsols',
    country: 'Brazil',
    category: 'Major Regional Belt',
    percentageCoverage: '~34% of Brazil (Embrapa: Latossolos + Argissolos ≈58% combined)',
    description: 'The ultimate deep tropical soil. Highly weathered, acidic, rich in iron/aluminum oxides with porous crumb structure. Forms the backbone of Brazilian grain and soybean production when corrected with lime.',
    location: 'Cerrado Plateau (savanna) and Amazon Basin',
    hexColor: '#B83A24',
    phRange: '4.5 - 5.5 (Acidic)',
    fertilityLevel: 'Low (High response to bio-inputs)',
    drainage: 'Well Drained',
    bestCrops: ['Soybeans', 'Maize', 'Coffee', 'Cotton', 'Sugarcane'],
    bioAmendments: ['Agricultural Lime (Calcário)', 'Ghanajeevamrutha', 'Cover Cropping (Brachiaria)']
  },
  {
    id: 'br-argisols',
    name: 'Argisols (Argissolos)',
    localName: 'Podzólicos Vermelho-Amarelos',
    scientificClassification: 'Ultisols / Acrisols',
    country: 'Brazil',
    category: 'Major Regional Belt',
    percentageCoverage: '~24% of Brazil (Embrapa Soil Map, 2nd largest class after Latossolos)',
    description: 'Soils featuring sandy topsoil over dense clay-rich subsoil. Highly susceptible to laminar erosion on sloping terrains.',
    location: 'Widespread on undulating hills and rolling terrain throughout Brazil',
    hexColor: '#D97724',
    phRange: '5.0 - 6.0',
    fertilityLevel: 'Moderate',
    drainage: 'Moderate',
    bestCrops: ['Pasture', 'Citrus', 'Cassava', 'Eucalyptus'],
    bioAmendments: ['Contour Hedging (Vetiver)', 'Organic Mulching', 'Neem Cake']
  },
  {
    id: 'br-terra-roxa',
    name: 'Terra Roxa (Nitisols)',
    localName: 'Terra Roxa Legítima',
    scientificClassification: 'Nitosols / Rhodic Ferralsols',
    country: 'Brazil',
    category: 'Rare / Highly Localized',
    description: 'Legendary deep purplish-red volcanic basalt soil. Exceptionally fertile and deep, historically fueling the coffee boom and world-class grain yields.',
    location: 'São Paulo and Paraná volcanic plateaus',
    hexColor: '#7A1F2D',
    phRange: '5.8 - 6.8',
    fertilityLevel: 'Very High',
    drainage: 'Well Drained',
    bestCrops: ['Specialty Coffee', 'Soybean', 'Wheat', 'Sugarcane'],
    bioAmendments: ['Fermented Jeevamrutha', 'Minimal Bio-Stimulants']
  },
  {
    id: 'br-terra-preta',
    name: 'Terra Preta de Índio',
    localName: 'Amazonian Dark Earth',
    scientificClassification: 'Anthrosols / Biochar-rich Chernic',
    country: 'Brazil',
    category: 'Rare / Highly Localized',
    description: 'Super-fertile anthropogenic black earth created by pre-Columbian indigenous communities through charcoal, fish bones, and compost infusion.',
    location: 'Localized bluffs along Amazonian riverbanks',
    hexColor: '#212121',
    phRange: '6.5 - 7.2',
    fertilityLevel: 'Very High',
    drainage: 'Well Drained',
    bestCrops: ['Cacao', 'Açai', 'Cassava', 'Horticulture'],
    bioAmendments: ['Biochar inoculant', 'Mycorrhizal fungi']
  },

  // ================= RUSSIA =================
  {
    id: 'ru-chernozem',
    name: 'Chernozem (Black Earth)',
    localName: 'Чернозём (Царь почв)',
    scientificClassification: 'Mollisols / Chernozems',
    country: 'Russia',
    category: 'Major Regional Belt',
    description: "Known as Russia's 'Black Gold' and the king of soils. Contains up to 15% humus with perfect granular crumb structure, high moisture capacity, and rich calcium reserves.",
    location: 'Steppe and Forest-Steppe belts of Southern European Russia (Voronezh, Rostov, Krasnodar, Belgorod) & SW Siberia',
    hexColor: '#1A1817',
    phRange: '6.8 - 7.4 (Neutral)',
    fertilityLevel: 'Very High',
    drainage: 'Well Drained',
    bestCrops: ['Winter Wheat', 'Sunflower', 'Sugar Beet', 'Barley', 'Corn'],
    bioAmendments: ['Zero-Tillage Cover Cropping', 'Trichoderma bio-protectants']
  },
  {
    id: 'ru-podzols',
    name: 'Podzols & Sod-Podzolic',
    localName: 'Подзолы и Дерново-подзолистые',
    scientificClassification: 'Spodosols / Podzols',
    country: 'Russia',
    category: 'Major Regional Belt',
    description: 'Ash-grey, heavily leached taiga soils with acidic organic mat. Formed under cold coniferous forests, requiring organic matter building for agricultural crops.',
    location: 'Taiga belt covering Northern European Russia & vast Siberia',
    hexColor: '#9E9E9E',
    phRange: '4.0 - 5.2 (Acidic)',
    fertilityLevel: 'Low',
    drainage: 'Moderate',
    bestCrops: ['Rye', 'Oats', 'Flax', 'Potatoes', 'Forage Grasses'],
    bioAmendments: ['Wood Ash / Lime', 'Peat compost', 'Liquid Jeevamrutha']
  },
  {
    id: 'ru-chestnut',
    name: 'Chestnut Soils (Kastanozems)',
    localName: 'Каштановые почвы',
    scientificClassification: 'Kastanozems',
    country: 'Russia',
    category: 'Agricultural Dominant',
    description: 'Dry steppe soils with rich brown humus layer, calcium carbonate accumulations, and high mineral nutrient content. Highly productive under drip irrigation.',
    location: 'South of Chernozem belt near Caspian Lowlands and Volga basin',
    hexColor: '#795548',
    phRange: '7.2 - 8.0',
    fertilityLevel: 'High',
    drainage: 'Well Drained',
    bestCrops: ['Durum Wheat', 'Mustard', 'Melons', 'Barley'],
    bioAmendments: ['Drip micro-fertigation', 'Humic Acid bio-extracts']
  },

  // ================= INDIA =================
  {
    id: 'in-alluvial',
    name: 'Alluvial Soils',
    localName: 'Jalodh Mitti (जलोढ़ मिट्टी)',
    scientificClassification: 'Inceptisols / Entisols / Fluvisols',
    country: 'India',
    category: 'Major Regional Belt',
    percentageCoverage: '~46% of India (≈15 lakh km², ICAR-NBSS&LUP soil geography)',
    description: 'Deposited by Himalayan and peninsular river networks. Extremely fertile, deep, porous, rich in potash and phosphoric acid, sustaining India’s breadbasket.',
    location: 'Indo-Gangetic Plains (Punjab, Haryana, UP, Bihar, WB) and coastal deltas (Mahanadi, Godavari, Krishna, Kaveri)',
    hexColor: '#C4A47C',
    phRange: '6.5 - 7.8',
    fertilityLevel: 'Very High',
    drainage: 'Well Drained',
    bestCrops: ['Wheat', 'Rice (Paddy)', 'Sugarcane', 'Maize', 'Pulses'],
    bioAmendments: ['Ghanajeevamrutha', 'Green Manuring (Dhaincha/Sunn-hemp)', 'Azotobacter']
  },
  {
    id: 'in-black-cotton',
    name: 'Black Cotton Soil (Regur)',
    localName: 'Regur / Kali Mitti (काली मिट्टी)',
    scientificClassification: 'Vertisols',
    country: 'India',
    category: 'Major Regional Belt',
    description: 'Formed from weathered Deccan basaltic lava. Highly clayey, rich in calcium, magnesium, iron, and potash. Expands and swells when wet, deep-cracking when dry for natural self-aeration.',
    location: 'Deccan Plateau (Maharashtra, Gujarat, Madhya Pradesh, Northern Karnataka)',
    hexColor: '#363432',
    phRange: '7.5 - 8.5 (Slightly Alkaline)',
    fertilityLevel: 'High',
    drainage: 'Moderate (High Moisture Retention)',
    bestCrops: ['Cotton', 'Soybean', 'Sorghum (Jowar)', 'Chickpea (Gram)', 'Wheat'],
    bioAmendments: ['Jeevamrutha drenches', 'Broadbed-and-Furrow mulching', 'Phosphate Solubilizing Bacteria (PSB)']
  },
  {
    id: 'in-red-yellow',
    name: 'Red & Yellow Soils',
    localName: 'Lal-Peeli Mitti (लाल-पीली मिट्टी)',
    scientificClassification: 'Alfisols / Ultisols',
    country: 'India',
    category: 'Agricultural Dominant',
    description: 'Formed on ancient crystalline granite rocks. Iron oxide diffusion creates red hue; turns yellow when hydrated. Responsive to organic bio-fertilization.',
    location: 'Peninsular India (Tamil Nadu, Karnataka, Southern Odisha, Telangana, Chota Nagpur)',
    hexColor: '#C75D38',
    phRange: '5.5 - 6.5',
    fertilityLevel: 'Moderate',
    drainage: 'Well Drained',
    bestCrops: ['Groundnut (Peanuts)', 'Millets (Ragi/Bajra)', 'Pulses', 'Tobacco', 'Oilseeds'],
    bioAmendments: ['Farmyard Manure (FYM)', 'Cow dung bio-slurry', 'Neem Seed Cake']
  },
  {
    id: 'in-laterite',
    name: 'Laterite Soils',
    localName: 'Laterite Mitti (लेटराइट)',
    scientificClassification: 'Oxisols / Plinthosols',
    country: 'India',
    category: 'Special Ecosystem',
    description: 'Formed under heavy monsoon leaching. Rich in iron/aluminum, acidic, low in organic carbon. Superb medium for plantation agriculture.',
    location: 'Western Ghats hill ranges (Kerala, Coastal Karnataka, Goa) and Northeast hills',
    hexColor: '#A83B24',
    phRange: '4.5 - 5.5',
    fertilityLevel: 'Moderate (Specialized for plantations)',
    drainage: 'Excessive',
    bestCrops: ['Cashew', 'Tea', 'Coffee', 'Rubber', 'Arecanut', 'Spices (Black Pepper)'],
    bioAmendments: ['Lime & Dolomite', 'Vermicompost', 'Mycorrhizae inoculants']
  },

  // ================= CHINA =================
  {
    id: 'cn-loess',
    name: 'Loess Soils (Yellow Earth)',
    localName: 'Huangtu (黄土高原土)',
    scientificClassification: 'Kastanozems / Cambisols',
    country: 'China',
    category: 'Major Regional Belt',
    description: "Earth's thickest wind-blown silt deposit (up to 300m). Naturally fertile, friable, yellowish, but extremely prone to hydraulic erosion along the Yellow River basin.",
    location: 'Loess Plateau in North China (Shaanxi, Shanxi, Gansu, Henan)',
    hexColor: '#D4AC0D',
    phRange: '7.5 - 8.2',
    fertilityLevel: 'High',
    drainage: 'Well Drained',
    bestCrops: ['Millet', 'Winter Wheat', 'Apples', 'Corn', 'Sorghum'],
    bioAmendments: ['Terraced Agroforestry', 'Straw Mulch bio-blankets', 'Biochar']
  },
  {
    id: 'cn-paddy-anthrosols',
    name: 'Paddy Anthrosols (Rice Soils)',
    localName: 'Shuitian Tu (水稻土)',
    scientificClassification: 'Anthrosols / Hydragric Anthrosols',
    country: 'China',
    category: 'Agricultural Dominant',
    description: 'Man-made agricultural heritage soils shaped over millennia of seasonal flooding and puddle tillage for intensive wet-rice cultivation.',
    location: 'Yangtze and Pearl River deltas, South and Central China basins',
    hexColor: '#5D6D7E',
    phRange: '5.8 - 6.8',
    fertilityLevel: 'Very High',
    drainage: 'Poor (Engineered Hardpan for Ponding)',
    bestCrops: ['Paddy Rice', 'Lotus Root', 'Rapeseed', 'Taro'],
    bioAmendments: ['Azolla bio-fertilizer', 'Duck-Rice polyculture recycling', 'Fermented straw compost']
  },
  {
    id: 'cn-purple-soils',
    name: 'Purple Soils (Regosols)',
    localName: 'Zise Tu (紫色土)',
    scientificClassification: 'Regosols / Cambisols',
    country: 'China',
    category: 'Rare / Highly Localized',
    description: 'Unique, highly fertile purple-red soils derived from Triassic-Cretaceous purple sandstones. Fast weathering continuously replenishes mineral nutrients.',
    location: 'Sichuan Basin ("Heavenly Kingdom")',
    hexColor: '#6C3483',
    phRange: '6.5 - 7.5',
    fertilityLevel: 'Very High',
    drainage: 'Well Drained',
    bestCrops: ['Sichuan Citrus', 'Tea', 'Rapeseed', 'Rice', 'Wheat', 'Vegetables'],
    bioAmendments: ['Organic compost top-dress', 'Liquid bio-stimulants']
  },

  // ================= SOUTH AFRICA =================
  {
    id: 'za-highveld',
    name: 'High-Base Unleached Soils',
    localName: 'Highveld Rooigrond / Hutton Form',
    scientificClassification: 'Alfisols / Mollisols (Hutton/Clovelly)',
    country: 'South Africa',
    category: 'Major Regional Belt',
    description: 'Rich in base nutrients (calcium, magnesium) due to semi-arid plateau climate. Well-structured reddish soils forming the agricultural engine of South Africa.',
    location: 'Highveld plateau (Gauteng, Free State, North West)',
    hexColor: '#A04000',
    phRange: '6.2 - 7.2',
    fertilityLevel: 'High',
    drainage: 'Well Drained',
    bestCrops: ['White & Yellow Maize', 'Sunflower', 'Groundnuts', 'Sorghum'],
    bioAmendments: ['Cover crop cocktail (Cowpea + Radish)', 'Humic acids', 'Bio-fertilizer']
  },
  {
    id: 'za-black-turf',
    name: 'Volcanic "Black Turf"',
    localName: 'Arcadia Form / Swart Turf',
    scientificClassification: 'Vertisols (Bushveld Complex)',
    country: 'South Africa',
    category: 'Rare / Highly Localized',
    description: 'Heavy, cracking volcanic black smectite clay derived from the Bushveld Igneous Complex rock. Exceptional fertility and water holding capacity for specialist commercial farming.',
    location: 'Bushveld region (Limpopo / North West border)',
    hexColor: '#282828',
    phRange: '7.4 - 8.2',
    fertilityLevel: 'Very High',
    drainage: 'Moderate',
    bestCrops: ['Cotton', 'Citrus', 'Tobacco', 'Wheat', 'Sunflower'],
    bioAmendments: ['Controlled traffic tillage', 'Organic gypsum bio-buffers']
  },
  {
    id: 'za-leached-acid',
    name: 'Low-Base Leached Acid Soils',
    localName: 'KwaZulu-Natal Red Loams (Inanda/Magwa)',
    scientificClassification: 'Ultisols / Inceptisols',
    country: 'South Africa',
    category: 'Agricultural Dominant',
    description: 'Deep, highly weathered acidic red loam soils formed under warm subtropical coastal rainfall.',
    location: 'KwaZulu-Natal coastal and midlands belt',
    hexColor: '#B03A2E',
    phRange: '4.8 - 5.8',
    fertilityLevel: 'Moderate',
    drainage: 'Well Drained',
    bestCrops: ['Sugarcane', 'Subtropical Fruits (Avocado/Macadamia)', 'Timber'],
    bioAmendments: ['Agricultural Lime', 'Filtercake organic compost', 'Trichoderma']
  },
  // ================= EGYPT =================
  {
    id: 'eg-nile-alluvial',
    name: 'Nile Alluvial Soils',
    localName: 'Wadi An-Nil Floodplain (Terrah)',
    scientificClassification: 'Mollisols / Fluvisols',
    country: 'Egypt',
    category: 'Agricultural Dominant',
    percentageCoverage: '≈4% of Egypt\'s land area, but ~95% of cultivated land (CAPMAS)',
    description: 'Fine-textured, fertile alluvium deposited by millennia of Nile floods. The entire Egyptian agricultural economy is concentrated on this narrow floodplain and delta.',
    location: 'Nile Valley and Nile Delta (Cairo to Aswan)',
    hexColor: '#6B4F35',
    phRange: '7.5 - 8.5 (Slightly Alkaline)',
    fertilityLevel: 'High (intensively maintained)',
    drainage: 'Moderate (irrigation-dependent)',
    bestCrops: ['Cotton', 'Rice', 'Wheat', 'Maize', 'Sugarcane'],
    bioAmendments: ['Farmyard manure (FYM)', 'Sesbania green manure', 'Composted rice straw']
  },
  {
    id: 'eg-desert-calciorthid',
    name: 'Desert Calcareous Soils',
    localName: 'New Valley Reclaimed Desert (Calcids)',
    scientificClassification: 'Aridisols / Calcisols',
    country: 'Egypt',
    category: 'Major Regional Belt',
    description: 'Sandy-to-loamy calcareous desert soils of the Western Desert oases and new-reclamation lands, low in organic matter and high in free calcium carbonate.',
    location: 'Western Desert oases (New Valley), Nubia reclamation areas',
    hexColor: '#C9B08A',
    phRange: '8.0 - 8.8 (Alkaline / Calcareous)',
    fertilityLevel: 'Low (high response to bio-inputs)',
    drainage: 'Excessively Drained',
    bestCrops: ['Olives', 'Date Palm', 'Grapes', 'Wheat (irrigated)', 'Medicinal Herbs'],
    bioAmendments: ['Gypsum (calcium sulfate)', 'Biochar + compost', 'Mycorrhizal inoculants']
  },
  // ================= ETHIOPIA =================
  {
    id: 'et-highland-nitisol',
    name: 'Highland Red Basaltic Soils',
    localName: 'Tippo Red Clay (Nitisols)',
    scientificClassification: 'Nitisols / Alfisols',
    country: 'Ethiopia',
    category: 'Agricultural Dominant',
    percentageCoverage: 'Nitisols cover a large share of the Ethiopian highlands (Ethiopian Soil Atlas/ISRIC)',
    description: 'Deep, well-structured reddish clays of the volcanic highlands, naturally fertile but vulnerable to erosion on steep slopes.',
    location: 'Central and western highlands (Oromia, Amhara, SNNP belt)',
    hexColor: '#8E3B2F',
    phRange: '5.5 - 6.5 (Slightly Acidic)',
    fertilityLevel: 'Moderate to High',
    drainage: 'Well Drained',
    bestCrops: ['Teff', 'Coffee', 'Maize', 'Wheat', 'Niger Seed'],
    bioAmendments: ['Vermicompost', 'Farmyard manure', 'Terracing + grass strips']
  },
  {
    id: 'et-vertisol',
    name: 'Black Cracking Clay Soils',
    localName: 'Walka Black Vertisols',
    scientificClassification: 'Vertisols',
    country: 'Ethiopia',
    category: 'Major Regional Belt',
    description: 'Dark, swelling-cracking clays that are hard to till at the wet-season peak — waterlogging limits yields unless drained or broad-bed-furrowed.',
    location: 'Highland plains (Gojjam, Arsi, Bale) and Rift Valley floor',
    hexColor: '#3D3530',
    phRange: '6.0 - 7.5 (Neutral)',
    fertilityLevel: 'Moderate (high nutrient reserve, poor workability)',
    drainage: 'Poor (seasonal waterlogging)',
    bestCrops: ['Teff', 'Barley', 'Chickpea', 'Lentil', 'Wheat'],
    bioAmendments: ['Broad Bed & Furrow drainage', 'Compost', 'Raised-bed tillage (guie)']
  },
  // ================= IRAN =================
  {
    id: 'ir-irrigated-aridisol',
    name: 'Irrigated Foothill Aridisols',
    localName: 'Khak-e-Ahan (Calcids/Gypsids)',
    scientificClassification: 'Aridisols / Calcisols-Gypsisols',
    country: 'Iran',
    category: 'Major Regional Belt',
    description: 'Calcareous and gypsiferous desert soils of the Iranian plateau, productive only under qanat/well irrigation, with accumulations of lime and gypsum in the subsoil.',
    location: 'Central plateau (Isfahan, Yazd, Kerman oases belt)',
    hexColor: '#B49A6B',
    phRange: '7.8 - 8.5 (Alkaline / Calcareous)',
    fertilityLevel: 'Low (high response to bio-inputs)',
    drainage: 'Well Drained',
    bestCrops: ['Wheat', 'Barley', 'Pistachio', 'Date Palm', 'Saffron'],
    bioAmendments: ['Compost + green manure', 'Sulfur-oxidizing bacteria (Thiobacillus)', 'Mycorrhizal inoculants']
  },
  {
    id: 'ir-caspian',
    name: 'Caspian Humid-Forest Soils',
    localName: 'Shomal Lowland Soils (Udivitrusols)',
    scientificClassification: 'Inceptisols / Ultisols',
    country: 'Iran',
    category: 'Agricultural Dominant',
    description: 'The wettest soils in Iran, under the Hyrcanian forests along the Caspian — naturally acidic-to-neutral, rice-paddy dominant, high organic matter in lowlands.',
    location: 'Caspian lowlands (Gilan and Mazandaran)',
    hexColor: '#5E6B3A',
    phRange: '5.5 - 7.0 (Acidic to Neutral)',
    fertilityLevel: 'High',
    drainage: 'Seasonally Wet (paddy-managed)',
    bestCrops: ['Rice (paddy)', 'Tea', 'Citrus', 'Kiwi', 'Soybean'],
    bioAmendments: ['Rice-straw compost', 'Azolla biofertilizer', 'Green manuring (Clover)']
  },
  // ================= UAE =================
  {
    id: 'ae-sandy-desert',
    name: 'Aeolian Sandy Desert Soils',
    localName: 'Rimal Desert Sands (Arenosols)',
    scientificClassification: 'Entisols / Arenosols',
    country: 'UAE',
    category: 'Major Regional Belt',
    description: 'Quartz-dominated shifting dune sands covering most of the country: excessively drained, virtually devoid of organic matter and nutrients, farmed only under intensive amendment.',
    location: 'Rub\' al Khali margin, Dubai–Al Ain inland belt',
    hexColor: '#D8C08C',
    phRange: '7.5 - 9.0 (Alkaline)',
    fertilityLevel: 'Very Low (extremely high response to bio-inputs)',
    drainage: 'Excessively Drained',
    bestCrops: ['Date Palm', 'Protected-culture Vegetables', 'Rhodes Grass', 'Aloe'],
    bioAmendments: ['Biochar + compost', 'Zeolite soil conditioners', 'Drip irrigation with fertigation']
  },
  {
    id: 'ae-sabkha',
    name: 'Coastal Saline Sabkha Soils',
    localName: 'Sabkha Salt Flats (Salids)',
    scientificClassification: 'Aridisols / Salids (Salic)',
    country: 'UAE',
    category: 'Special Ecosystem',
    description: 'Salt-encrusted coastal and inland flats with hypersaline groundwater. Increasingly used for Salicornia, mangrove restoration and halophyte forage trials.',
    location: 'Coastal Abu Dhabi & Ras Al Khaimah flats, inland sabkha (Matti)',
    hexColor: '#A8A29B',
    phRange: '7.0 - 8.5 (Neutral to Alkaline, Saline)',
    fertilityLevel: 'Very Low (salinity-limited)',
    drainage: 'Very Poor (high water table)',
    bestCrops: ['Salicornia', 'Halophyte Forage (Distichlis)', 'Mangrove (restoration)', 'Quinoa (trials)'],
    bioAmendments: ['Halophyte composting', 'Gypsum + leaching fractions', 'Salt-tolerant rhizobacteria']
  }
];

export function getSoilsForCountry(countryName: string): BRICSSoilProfile[] {
  const norm = countryName.toLowerCase();
  return bricsSoilProfiles.filter(s => s.country.toLowerCase().includes(norm));
}
