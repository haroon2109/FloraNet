/**
 * Farmer Edge — Localized Advisory Copy (BRICS)
 *
 * Presentation-layer translations for the live advisory cards rendered on
 * `/edge`. The advisory *content* is always produced by the backend rule
 * engine from live Open-Meteo / ISRIC SoilGrids / NASA EONET readings — this
 * module only translates the wrapping copy and the advisory templates.
 *
 * Templates use `{placeholder}` tokens which are interpolated with the REAL
 * numeric values returned by `/api/v1/farm/recommendations`. No numbers are
 * ever invented here.
 */

export interface EdgeAdvisoryCopy {
  heading: string;
  subheading: string;
  liveBadge: string;
  refresh: string;
  refreshing: string;
  loading: string;
  unavailableTitle: string;
  unavailableHint: string;
  noAdvisories: string;
  sourceLabel: string;
  listen: string;
  stopListening: string;
  readAloudUnavailable: string;
  speechFallbackNotice: string;
  locationLabel: string;
  soilHeading: string;
  soilMoisture: string;
  soilTemp: string;
  evapotranspiration: string;
  /** Priority chip labels keyed by the backend `priority` value. */
  priority: { High: string; Medium: string; Info: string; Low: string };
  /** Advisory title/description templates keyed by backend advisory `id`. */
  advisories: Record<string, { title: string; description: string }>;
}

export const edgeAdvisoryTranslations: Record<string, EdgeAdvisoryCopy> = {
  en: {
    heading: 'Live Field Advisory',
    subheading: 'Rule-engine advisories computed from live Open-Meteo, ISRIC SoilGrids and NASA EONET readings for your parcel.',
    liveBadge: 'Live',
    refresh: 'Refresh',
    refreshing: 'Refreshing…',
    loading: 'Fetching live advisories…',
    unavailableTitle: 'Live advisory feed unavailable',
    unavailableHint: 'The backend /api/v1/farm/recommendations endpoint is unreachable — no substitute advisories are shown.',
    noAdvisories: 'No advisories returned for this parcel.',
    sourceLabel: 'Source',
    listen: 'Listen',
    stopListening: 'Stop',
    readAloudUnavailable: 'Read-aloud is not supported on this device.',
    speechFallbackNotice: 'Read-aloud is not available in this language on your device — speaking in English.',
    locationLabel: 'Parcel',
    soilHeading: 'Live Soil Profile',
    soilMoisture: 'Root-zone moisture',
    soilTemp: 'Soil temperature',
    evapotranspiration: 'Evapotranspiration',
    priority: { High: 'High', Medium: 'Medium', Info: 'Info', Low: 'Low' },
    advisories: {
      'rec-irrigation-low': {
        title: 'Irrigate soon — root-zone moisture at {moisture}%',
        description: 'Live Open-Meteo soil moisture (0-1cm) is {moisture}%, below the 20% stress threshold for {crop}.',
      },
      'rec-irrigation-high': {
        title: 'Pause irrigation — saturated soil at {moisture}%',
        description: 'Live soil moisture is {moisture}%. Risk of root hypoxia; hold irrigation until it drops below 45%.',
      },
      'rec-rain-window': {
        title: 'Skip spraying — {rain72} mm rain expected in 72h',
        description: 'The live forecast shows significant precipitation within 3 days; apply inputs after it passes to avoid leaching and runoff.',
      },
      'rec-ph': {
        title: 'Soil pH {ph} outside the optimal band (5.5–8.0)',
        description: 'ISRIC SoilGrids reports pH {ph}. Apply lime for acidic soils, or gypsum and organic matter for alkaline soils, per ICAR / Embrapa / ARC guidance.',
      },
      'rec-soc': {
        title: 'Low soil organic carbon ({soc}%) — add biomass',
        description: 'SoilGrids organic carbon is {soc}% in the top 5cm. Include legume cover crops or compost to build humus.',
      },
      'rec-hazard': {
        title: 'Hazard nearby: {hazard}',
        description: 'NASA EONET reports an active {category} event within 500 km. Review field drainage and shelter plans.',
      },
      'rec-nominal': {
        title: 'No advisories triggered — conditions within safe bands',
        description: 'Live check passed: no rain-leaching window, no pH or organic-carbon flag, and no hazards within 500 km.',
      },
    },
  },

  hi: {
    heading: 'लाइव खेत सलाह',
    subheading: 'आपके खेत के लिए लाइव Open-Meteo, ISRIC SoilGrids और NASA EONET आँकड़ों से नियम-इंजन द्वारा निकाली गई सलाह।',
    liveBadge: 'लाइव',
    refresh: 'ताज़ा करें',
    refreshing: 'ताज़ा किया जा रहा है…',
    loading: 'लाइव सलाह लाई जा रही है…',
    unavailableTitle: 'लाइव सलाह उपलब्ध नहीं है',
    unavailableHint: 'बैकएंड /api/v1/farm/recommendations उपलब्ध नहीं है — कोई नकली सलाह नहीं दिखाई जाती।',
    noAdvisories: 'इस खेत के लिए कोई सलाह नहीं मिली।',
    sourceLabel: 'स्रोत',
    listen: 'सुनें',
    stopListening: 'रोकें',
    readAloudUnavailable: 'इस डिवाइस पर पढ़कर सुनाने की सुविधा उपलब्ध नहीं है।',
    speechFallbackNotice: 'इस भाषा में पढ़कर सुनाना उपलब्ध नहीं है — अंग्रेज़ी में सुनाया जा रहा है।',
    locationLabel: 'खेत',
    soilHeading: 'लाइव मिट्टी प्रोफ़ाइल',
    soilMoisture: 'जड़ क्षेत्र की नमी',
    soilTemp: 'मिट्टी का तापमान',
    evapotranspiration: 'वाष्पोत्सर्जन',
    priority: { High: 'उच्च', Medium: 'मध्यम', Info: 'सूचना', Low: 'कम' },
    advisories: {
      'rec-irrigation-low': {
        title: 'जल्द सिंचाई करें — जड़ क्षेत्र की नमी {moisture}%',
        description: 'लाइव Open-Meteo मिट्टी नमी (0-1 सेमी) {moisture}% है, जो {crop} के लिए 20% के तनाव-स्तर से नीचे है।',
      },
      'rec-irrigation-high': {
        title: 'सिंचाई रोकें — मिट्टी संतृप्त है, नमी {moisture}%',
        description: 'लाइव मिट्टी नमी {moisture}% है। जड़ों में ऑक्सीजन की कमी का खतरा है; नमी 45% से नीचे आने तक सिंचाई रोकें।',
      },
      'rec-rain-window': {
        title: 'छिड़काव टालें — 72 घंटे में {rain72} मिमी वर्षा की संभावना',
        description: 'लाइव पूर्वानुमान के अनुसार 3 दिनों में पर्याप्त वर्षा होगी; बहाव और क्षय से बचने के लिए उसके बाद ही इनपुट डालें।',
      },
      'rec-ph': {
        title: 'मिट्टी का pH {ph} इष्टतम सीमा (5.5–8.0) से बाहर',
        description: 'ISRIC SoilGrids के अनुसार pH {ph} है। ICAR / Embrapa / ARC मार्गदर्शन के अनुसार अम्लीय मिट्टी में चूना, क्षारीय मिट्टी में जिप्सम व जैविक खाद डालें।',
      },
      'rec-soc': {
        title: 'मिट्टी में जैविक कार्बन कम ({soc}%) — बायोमास मिलाएँ',
        description: 'ऊपरी 5 सेमी में SoilGrids जैविक कार्बन {soc}% है। ह्यूमस बढ़ाने के लिए दलहनी ढकने वाली फसलें या कंपोस्ट शामिल करें।',
      },
      'rec-hazard': {
        title: 'आसपास आपदा: {hazard}',
        description: 'NASA EONET के अनुसार 500 किमी के भीतर सक्रिय {category} घटना है। जल निकासी और शरण योजना की समीक्षा करें।',
      },
      'rec-nominal': {
        title: 'कोई सलाह नहीं — स्थितियाँ सुरक्षित सीमा में',
        description: 'लाइव जाँच उत्तीर्ण: न वर्षा-बहाव का समय, न pH या जैविक कार्बन की चेतावनी, और 500 किमी के भीतर कोई आपदा नहीं।',
      },
    },
  },

  'pt-BR': {
    heading: 'Aviso de Campo ao Vivo',
    subheading: 'Avisos calculados por motor de regras a partir de leituras ao vivo do Open-Meteo, ISRIC SoilGrids e NASA EONET para o seu talhão.',
    liveBadge: 'Ao vivo',
    refresh: 'Atualizar',
    refreshing: 'Atualizando…',
    loading: 'Buscando avisos ao vivo…',
    unavailableTitle: 'Feed de avisos ao vivo indisponível',
    unavailableHint: 'O endpoint /api/v1/farm/recommendations está inacessível — nenhum aviso substituto é exibido.',
    noAdvisories: 'Nenhum aviso retornado para este talhão.',
    sourceLabel: 'Fonte',
    listen: 'Ouvir',
    stopListening: 'Parar',
    readAloudUnavailable: 'A leitura em voz alta não é suportada neste dispositivo.',
    speechFallbackNotice: 'A leitura em voz alta não está disponível neste idioma no seu dispositivo — falando em inglês.',
    locationLabel: 'Talhão',
    soilHeading: 'Perfil de Solo ao Vivo',
    soilMoisture: 'Umidade da zona radicular',
    soilTemp: 'Temperatura do solo',
    evapotranspiration: 'Evapotranspiração',
    priority: { High: 'Alta', Medium: 'Média', Info: 'Info', Low: 'Baixa' },
    advisories: {
      'rec-irrigation-low': {
        title: 'Irrigar em breve — umidade da zona radicular em {moisture}%',
        description: 'A umidade do solo ao vivo (Open-Meteo, 0-1cm) está em {moisture}%, abaixo do limite de estresse de 20% para {crop}.',
      },
      'rec-irrigation-high': {
        title: 'Suspender irrigação — solo saturado em {moisture}%',
        description: 'A umidade do solo ao vivo está em {moisture}%. Risco de hipoxia radicular; suspenda a irrigação até cair abaixo de 45%.',
      },
      'rec-rain-window': {
        title: 'Evitar pulverização — {rain72} mm de chuva previstos em 72h',
        description: 'A previsão ao vivo indica precipitação significativa em até 3 dias; aplique os insumos depois para evitar lixiviação e escoamento.',
      },
      'rec-ph': {
        title: 'pH do solo {ph} fora da faixa ideal (5,5–8,0)',
        description: 'O ISRIC SoilGrids reporta pH {ph}. Aplique calcário em solos ácidos, ou gesso e matéria orgânica em solos alcalinos, conforme orientação da Embrapa / ICAR / ARC.',
      },
      'rec-soc': {
        title: 'Carbono orgânico do solo baixo ({soc}%) — adicione biomassa',
        description: 'O carbono orgânico do SoilGrids é {soc}% nos primeiros 5cm. Inclua adubos verdes de leguminosas ou composto para formar húmus.',
      },
      'rec-hazard': {
        title: 'Perigo próximo: {hazard}',
        description: 'O NASA EONET reporta um evento ativo de {category} num raio de 500 km. Revise os planos de drenagem e abrigo da lavoura.',
      },
      'rec-nominal': {
        title: 'Nenhum aviso acionado — condições dentro das faixas seguras',
        description: 'Verificação ao vivo aprovada: sem janela de lixiviação por chuva, sem alerta de pH ou carbono orgânico e sem perigos num raio de 500 km.',
      },
    },
  },

  ru: {
    heading: 'Полевая рекомендация в реальном времени',
    subheading: 'Рекомендации рассчитаны движком правил по актуальным данным Open-Meteo, ISRIC SoilGrids и NASA EONET для вашего участка.',
    liveBadge: 'Онлайн',
    refresh: 'Обновить',
    refreshing: 'Обновление…',
    loading: 'Загрузка актуальных рекомендаций…',
    unavailableTitle: 'Лента рекомендаций недоступна',
    unavailableHint: 'Эндпоинт /api/v1/farm/recommendations недоступен — подмена рекомендаций не выполняется.',
    noAdvisories: 'Для этого участка рекомендаций не получено.',
    sourceLabel: 'Источник',
    listen: 'Прослушать',
    stopListening: 'Стоп',
    readAloudUnavailable: 'Озвучивание не поддерживается на этом устройстве.',
    speechFallbackNotice: 'Озвучивание на этом языке недоступно на вашем устройстве — воспроизводится на английском.',
    locationLabel: 'Участок',
    soilHeading: 'Профиль почвы в реальном времени',
    soilMoisture: 'Влажность корневой зоны',
    soilTemp: 'Температура почвы',
    evapotranspiration: 'Эвапотранспирация',
    priority: { High: 'Высокий', Medium: 'Средний', Info: 'Инфо', Low: 'Низкий' },
    advisories: {
      'rec-irrigation-low': {
        title: 'Скоро полить — влажность корневой зоны {moisture}%',
        description: 'Актуальная влажность почвы (Open-Meteo, 0-1 см) составляет {moisture}%, что ниже порога стресса 20% для культуры {crop}.',
      },
      'rec-irrigation-high': {
        title: 'Приостановить полив — почва насыщена, {moisture}%',
        description: 'Актуальная влажность почвы {moisture}%. Риск гипоксии корней; приостановите полив, пока показатель не опустится ниже 45%.',
      },
      'rec-rain-window': {
        title: 'Отложить опрыскивание — ожидается {rain72} мм осадков за 72 ч',
        description: 'Актуальный прогноз показывает значительные осадки в течение 3 дней; вносите препараты после их прохождения, чтобы избежать вымывания и стока.',
      },
      'rec-ph': {
        title: 'pH почвы {ph} вне оптимального диапазона (5,5–8,0)',
        description: 'ISRIC SoilGrids сообщает pH {ph}. Вносите известь на кислых почвах, гипс и органику — на щелочных, согласно рекомендациям ICAR / Embrapa / ARC.',
      },
      'rec-soc': {
        title: 'Низкий органический углерод почвы ({soc}%) — добавьте биомассу',
        description: 'Органический углерод по SoilGrids составляет {soc}% в верхних 5 см. Включите бобовые сидераты или компост для накопления гумуса.',
      },
      'rec-hazard': {
        title: 'Опасность рядом: {hazard}',
        description: 'NASA EONET сообщает об активном событии «{category}» в радиусе 500 км. Проверьте планы дренажа и защиты посевов.',
      },
      'rec-nominal': {
        title: 'Рекомендаций нет — условия в безопасных пределах',
        description: 'Проверка пройдена: нет окна вымывания осадками, нет флагов по pH и органическому углероду, нет опасностей в радиусе 500 км.',
      },
    },
  },

  'zh-CN': {
    heading: '实时田间农事建议',
    subheading: '基于 Open-Meteo、ISRIC SoilGrids 与 NASA EONET 实时数据，由规则引擎为您的田块计算得出的建议。',
    liveBadge: '实时',
    refresh: '刷新',
    refreshing: '刷新中…',
    loading: '正在获取实时建议…',
    unavailableTitle: '实时建议不可用',
    unavailableHint: '后端 /api/v1/farm/recommendations 无法访问 —— 不会显示任何替代建议。',
    noAdvisories: '该田块暂无建议返回。',
    sourceLabel: '数据来源',
    listen: '朗读',
    stopListening: '停止',
    readAloudUnavailable: '此设备不支持语音朗读。',
    speechFallbackNotice: '您的设备不支持该语言的语音朗读 —— 将以英语朗读。',
    locationLabel: '田块',
    soilHeading: '实时土壤剖面',
    soilMoisture: '根区含水量',
    soilTemp: '土壤温度',
    evapotranspiration: '蒸散量',
    priority: { High: '高', Medium: '中', Info: '提示', Low: '低' },
    advisories: {
      'rec-irrigation-low': {
        title: '应及时灌溉 —— 根区含水量 {moisture}%',
        description: 'Open-Meteo 实时土壤含水量（0–1 厘米）为 {moisture}%，低于 {crop} 的 20% 胁迫阈值。',
      },
      'rec-irrigation-high': {
        title: '暂停灌溉 —— 土壤已饱和，含水量 {moisture}%',
        description: '实时土壤含水量为 {moisture}%。存在根系缺氧风险；请暂停灌溉，待其降至 45% 以下。',
      },
      'rec-rain-window': {
        title: '暂缓喷施 —— 预计 72 小时内有 {rain72} 毫米降水',
        description: '实时预报显示三天内将有明显降水；请在其过后再施用投入品，以避免淋溶与径流损失。',
      },
      'rec-ph': {
        title: '土壤 pH {ph} 超出最佳区间（5.5–8.0）',
        description: 'ISRIC SoilGrids 报告 pH 为 {ph}。酸性土壤施用石灰，碱性土壤施用石膏与有机质，参照 CAAS / ICAR / Embrapa / ARC 指南。',
      },
      'rec-soc': {
        title: '土壤有机碳偏低（{soc}%）—— 需增加生物质',
        description: 'SoilGrids 显示表层 5 厘米有机碳为 {soc}%。建议加入豆科覆盖作物或堆肥以积累腐殖质。',
      },
      'rec-hazard': {
        title: '附近灾害：{hazard}',
        description: 'NASA EONET 报告 500 公里范围内有活跃的「{category}」事件。请检查田间排水与防护方案。',
      },
      'rec-nominal': {
        title: '未触发任何建议 —— 各项条件均在安全区间',
        description: '实时检查通过：无降水淋溶窗口、无 pH 或有机碳告警、500 公里内无灾害事件。',
      },
    },
  },
};

/**
 * Resolve a UI language code (BCP-47 or bare ISO) to an available advisory
 * locale key. Mirrors the landing-page fallback policy so the two surfaces
 * never disagree:
 *   - exact / prefix match wins
 *   - any `zh*` → zh-CN (Simplified), any `pt*` → pt-BR
 *   - Indian minority languages → Hindi
 *   - South African official languages → English
 *   - anything else → English
 */
export function resolveEdgeAdvisoryKey(langCode: string): { key: string; fallback: boolean } {
  const normalized = (langCode || 'en').trim().replace('_', '-');
  if (edgeAdvisoryTranslations[normalized]) return { key: normalized, fallback: false };

  const prefix = normalized.split('-')[0].toLowerCase();

  const indiaMinority = new Set([
    'bn', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'mr', 'ta', 'te',
    'kok', 'doi', 'mni', 'brx', 'sa', 'mai', 'sat', 'ks', 'ne', 'sd',
  ]);
  const southAfrican = new Set([
    'zu', 'xh', 'af', 'nso', 'tn', 'st', 'ts', 'ss', 've', 'nr', 'sasl',
  ]);

  let key: string;
  if (prefix === 'zh') key = 'zh-CN';
  else if (prefix === 'pt') key = 'pt-BR';
  else if (indiaMinority.has(prefix)) key = 'hi';
  else if (southAfrican.has(prefix)) key = 'en';
  else key = prefix; // 'en', 'hi', 'ru' … exact locale keys

  // Same base language (en-IN → en, zh-TW → zh-CN, ru-RU → ru) is a variant,
  // NOT a substitution — mirroring the landing resolver, so a farmer who
  // picked a real, rendered language never gets a "translation not ready"
  // notice for their own language. Only a genuinely different language
  // counts as a fallback.
  const resolved = edgeAdvisoryTranslations[key] ? key : 'en';
  const sameLanguage = resolved.split('-')[0].toLowerCase() === prefix;
  return { key: resolved, fallback: !sameLanguage };
}

/** Human-readable name of a supported advisory locale, shown in fallback notices. */
export const edgeAdvisoryLocaleNames: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  'pt-BR': 'Português (Brasil)',
  ru: 'Русский',
  'zh-CN': '简体中文 (Simplified Chinese)',
};

/** BCP-47 tag used for speech synthesis, per advisory locale. */
export const edgeAdvisorySpeechTags: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  'pt-BR': 'pt-BR',
  ru: 'ru-RU',
  'zh-CN': 'zh-CN',
};

/**
 * Interpolate `{token}` placeholders with real values. Unknown tokens are left
 * visible (never silently blanked) so a missing translation is obvious.
 */
export function fillAdvisoryTemplate(template: string, values: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) => {
    const value = values[token];
    return value === undefined || value === null ? match : String(value);
  });
}
