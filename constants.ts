import type { Session, Day } from './types';

export const SESSIONS_DATA: Session[] = [
    // Jeudi 27 novembre
    {
      id: '1',
      title: 'Accueil des participants et inscription',
      startTime: new Date(2025, 10, 27, 8, 0),
      endTime: new Date(2025, 10, 27, 9, 0),
      location: 'Grand Salon 1',
      speakers: [],
      theme: 'Administratif',
      type: 'accueil',
      description: '',
      details: []
    },
    {
      id: '2',
      title: 'Atelier N°1: Bilan allergologique devant une allergie respiratoire. Niveau 1.',
      startTime: new Date(2025, 10, 27, 9, 0),
      endTime: new Date(2025, 10, 27, 10, 30),
      location: 'Petit Salon 1',
      speakers: [
        { name: 'Soumaya Ben Saad', specialty: 'Pneumologie' },
        { name: 'Rahma Gargouri', specialty: 'Pneumologie' }
      ],
      theme: 'Allergies',
      type: 'atelier',
      description: 'Niveau 1',
      details: [
        'Bilan allergologique devant une allergie respiratoire'
      ],
      isParallel: true
    },
    {
      id: '3',
      title: "Atelier N°2: Place de l'échographie thoracique dans les urgences thoraciques. Première partie",
      startTime: new Date(2025, 10, 27, 9, 0),
      endTime: new Date(2025, 10, 27, 10, 30),
      location: 'Salon Carré',
      speakers: [
        { name: 'Nidhal Belloumi', specialty: 'Pneumologie' },
        { name: 'Chirine Moussa', specialty: 'Pneumologie' }
      ],
      theme: 'Urgences',
      type: 'atelier',
      description: 'Première partie',
      details: [
        "Place de l'échographie thoracique dans les urgences thoraciques"
      ],
      isParallel: true
    },
    {
      id: '4',
      title: 'Atelier N°3: Les cryobiopsies en pratique pneumologique',
      startTime: new Date(2025, 10, 27, 9, 0),
      endTime: new Date(2025, 10, 27, 10, 30),
      location: 'Salon de délégation 3',
      speakers: [
        { name: 'Nawel Chaouch', specialty: 'Pneumologie' },
        { name: 'Rami El Euch', specialty: 'Pneumologie' }
      ],
      theme: 'Techniques',
      type: 'atelier',
      description: '',
      details: [
        'Les cryobiopsies en pratique pneumologique'
      ],
      isParallel: true
    },
    {
      id: '5',
      title: 'Pause café & Visite des stands & Séances de Posters 1 et 2',
      startTime: new Date(2025, 10, 27, 10, 30),
      endTime: new Date(2025, 10, 27, 11, 0),
      location: 'Espace Posters & Stands',
      speakers: [],
      theme: 'Pause',
      type: 'pause',
      description: '',
      details: [],
      isParallel: false
    },
     {
      id: '7',
      title: 'Atelier N°1: Bilan allergologique devant une allergie respiratoire. Niveau 2.',
      startTime: new Date(2025, 10, 27, 11, 0),
      endTime: new Date(2025, 10, 27, 12, 30),
      location: 'Petit Salon 1',
      speakers: [
        { name: 'Soumaya Ben Saad', specialty: 'Pneumologie' },
        { name: 'Rahma Gargouri', specialty: 'Pneumologie' }
      ],
      theme: 'Allergies',
      type: 'atelier',
      description: 'Niveau 2',
      details: [
        'Bilan allergologique devant une allergie respiratoire'
      ],
      isParallel: true
    },
    {
      id: '8',
      title: "Atelier N°2: Place de l'échographie thoracique dans les urgences thoraciques. Deuxième partie",
      startTime: new Date(2025, 10, 27, 11, 0),
      endTime: new Date(2025, 10, 27, 12, 30),
      location: 'Salon Carré',
      speakers: [
        { name: 'Nidhal Belloumi', specialty: 'Pneumologie' },
        { name: 'Chirine Moussa', specialty: 'Pneumologie' }
      ],
      theme: 'Urgences',
      type: 'atelier',
      description: 'Deuxième partie',
      details: [
        "Place de l'échographie thoracique dans les urgences thoraciques"
      ],
      isParallel: true
    },
    {
      id: '6',
      title: "Atelier N°4: Branchements et réglages d'une VNI en aigu",
      startTime: new Date(2025, 10, 27, 11, 0),
      endTime: new Date(2025, 10, 27, 12, 30),
      location: 'Salon de délégation 3',
      speakers: [
        { name: 'Chiraz Aichaouia', specialty: 'Pneumologie' },
        { name: 'Soumaya Bouchereb', specialty: 'Pneumologie' }
      ],
      theme: 'VNI',
      type: 'atelier',
      description: '',
      details: [
        "Branchements et réglages d'une VNI en aigu"
      ],
      isParallel: true
    },
    {
      id: '9',
      title: 'SÉANCE N°1: Exacerbations de BPCO',
      startTime: new Date(2025, 10, 27, 14, 30),
      endTime: new Date(2025, 10, 27, 16, 0),
      location: 'Grand Salon 2',
      speakers: [
        { name: 'Zied Mootameri', specialty: 'Pneumologie' },
        { name: 'Rachida Khelafi', specialty: 'Pneumologie' },
        { name: 'Sana Aissa', specialty: 'Pneumologie' }
      ],
      theme: 'BPCO',
      type: 'séance',
      description: 'Exacerbation de BPCO et risques cardiovasculaires. Antibiothérapie dans les exacerbations de BPCO: Quoi de neuf en 2025? VNI au décours d\'une exacerbation aigue de BPCO.',
      details: [
        'Exacerbation de BPCO et risques cardiovasculaires - Zied Mootameri',
        'Antibiothérapie dans les exacerbations de BPCO: Quoi de neuf en 2025? - Rachida Khelafi',
        "VNI au décours d'une exacerbation aigue de BPCO - Sana Aissa"
      ],
      isParallel: false,
      introduction: 'Cette séance se focalise sur les exacerbations de BPCO, une préoccupation majeure en pneumologie tant par leur fréquence que par leur impact sur la morbi-mortalité des patients. Les intervenants aborderont les liens entre exacerbation aiguë et risques cardiovasculaires, les nouveautés en antibiothérapie 2025, ainsi que l’intérêt de la VNI dans la gestion aiguë.',
      objectives: [
        'Comprendre les mécanismes et facteurs de risque associés à l’exacerbation de la BPCO, notamment les composantes cardiovasculaires.',
        'Faire le point sur l’actualisation des recommandations thérapeutiques, en particulier sur l’antibiothérapie.',
        'Évaluer la place de la ventilation non invasive (VNI) dans la gestion des exacerbations aiguës.'
      ]
    },
    {
      id: '32',
      title: 'Symposium',
      startTime: new Date(2025, 10, 27, 16, 0),
      endTime: new Date(2025, 10, 27, 16, 30),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Symposium',
      type: 'symposium',
      description: '',
      details: []
    },
    {
      id: '33',
      title: 'Pause café & Visite des stands & Séances de Posters 3 et 4',
      startTime: new Date(2025, 10, 27, 16, 30),
      endTime: new Date(2025, 10, 27, 17, 0),
      location: 'Espace Posters & Stands',
      speakers: [],
      theme: 'Pause',
      type: 'pause',
      description: '',
      details: []
    },
    {
      id: '10',
      title: 'SÉANCE INAUGURALE: Pollution et santé respiratoire',
      startTime: new Date(2025, 10, 27, 17, 0),
      endTime: new Date(2025, 10, 27, 18, 0),
      location: 'Grand Salon 2',
      speakers: [{ name: 'Hechmi Louzir', specialty: 'Immunologie' }],
      theme: 'Pollution',
      type: 'inaugurale',
      description: 'Menace globale sur la santé au 21ème siècle.',
      details: [
        'Menace globale sur la santé au 21ème siècle - Hechmi Louzir'
      ],
      isParallel: false,
      introduction: 'La pollution atmosphérique constitue aujourd’hui l’une des principales menaces globales pour la santé publique, avec un impact direct et croissant sur les pathologies respiratoires. Cette séance inaugurale vise à souligner la gravité de ce phénomène à l’échelle mondiale et invite à une réflexion collective sur les stratégies de prévention et d’adaptation nécessaires pour relever ce grand défi du 21ᵉ siècle.',
      objectives: [
        'Sensibiliser la communauté médicale à l’ampleur des impacts de la pollution atmosphérique sur la santé respiratoire.',
        'Comprendre les mécanismes par lesquels les polluants aggravent ou provoquent des maladies pulmonaires.',
        'Susciter une prise de conscience sur le rôle des professionnels de santé dans la prévention, le plaidoyer et l’éducation auprès des patients et du public.'
      ]
    },
    {
      id: '24',
      title: 'Remise des prix de la journée de recherche de la STMRA',
      startTime: new Date(2025, 10, 27, 18, 0),
      endTime: new Date(2025, 10, 27, 18, 30),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Prix',
      type: 'cérémonie',
      description: 'Sponsorisée par les Laboratoires Opalia Recordati',
      details: [
        'Sponsorisée par les Laboratoires Opalia Recordati'
      ],
      isParallel: false
    },

    // Vendredi 28 novembre
    {
      id: '11',
      title: 'SÉANCE N°3: Asthme',
      startTime: new Date(2025, 10, 28, 8, 30),
      endTime: new Date(2025, 10, 28, 10, 0),
      location: 'Grand Salon 2',
      speakers: [
        { name: 'Agnès Hamzaoui', specialty: 'Pneumologie' },
        { name: 'Wiam Khattabi', specialty: 'Pneumologie' },
        { name: 'Ali Ben Kheder', specialty: 'Pneumologie' }
      ],
      theme: 'Asthme',
      type: 'séance',
      description: 'Asthme de l\'enfance à l\'âge adulte: quelles transitions? Inflammation dans l\'asthme léger: vers une nouvelle approche thérapeutique. Asthme sous biothérapie: Rémission ou contrôle?',
      details: [
        "Asthme de l'enfance à l'âge adulte: quelles transitions? - Agnès Hamzaoui",
        "Inflammation dans l'asthme léger: vers une nouvelle approche thérapeutique - Wiam Khattabi",
        'Asthme sous biothérapie: Rémission ou contrôle? - Ali Ben Kheder'
      ],
      isParallel: false,
      introduction: 'L’asthme, du jeune âge à l’adulte, soulève de nombreuses questions quant à ses transitions, options thérapeutiques et avancées dans la prise en charge. Cette session fait le point sur ces aspects, y compris sur la biothérapie.',
      objectives: [
        'Analyser les défis de la transition asthme-enfant/adulte.',
        'Approfondir les nouveaux paradigmes thérapeutiques, notamment dans l’asthme léger.',
        'Discuter le rôle et les objectifs des biothérapies : contrôle durable ou réelle rémission ?'
      ]
    },
    {
      id: '34',
      title: 'Symposium',
      startTime: new Date(2025, 10, 28, 10, 0),
      endTime: new Date(2025, 10, 28, 10, 30),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Symposium',
      type: 'symposium',
      description: '',
      details: []
    },
    {
      id: '12',
      title: 'Pause café & Visite des stands',
      startTime: new Date(2025, 10, 28, 10, 30),
      endTime: new Date(2025, 10, 28, 11, 0),
      location: 'Espace Posters & Stands',
      speakers: [],
      theme: 'Pause',
      type: 'pause',
      description: '',
      details: [],
      isParallel: false
    },
    {
      id: '13',
      title: 'SÉANCE N°4: Infections respiratoires',
      startTime: new Date(2025, 10, 28, 11, 0),
      endTime: new Date(2025, 10, 28, 12, 30),
      location: 'Grand Salon 2',
      speakers: [
        { name: 'Leila Boussofara', specialty: 'Pneumologie' },
        { name: 'Besma Dhahri', specialty: 'Pneumologie' },
        { name: 'Naceur Rouatbi', specialty: 'Pneumologie' }
      ],
      theme: 'Infections',
      type: 'séance',
      description: 'Pneumopathies aigues communautaires graves: quelle prise en charge? Co-infections virus-bactéries dans les exacerbations aiguës de BPCO. L\'antibiorésistance en Tunisie: RED FLAG!!',
      details: [
        'Pneumopathies aigues communautaires graves: quelle prise en charge? - Leila Boussofara',
        'Co-infections virus-bactéries dans les exacerbations aiguës de BPCO - Besma Dhahri',
        "L'antibiorésistance en Tunisie: RED FLAG!! - Naceur Rouatbi"
      ],
      isParallel: true,
      introduction: 'Les infections respiratoires aiguës et leurs complications constituent un volet central en pneumologie clinique. Cette séance détaillera la prise en charge des pneumopathies communautaires graves, la problématique des co-infections et le défi croissant de l’antibiorésistance.',
      objectives: [
        'Actualiser la prise en charge des infections respiratoires graves.',
        'Reconnaître et traiter efficacement les co-infections, notamment dans les exacerbations de BPCO.',
        'Sensibiliser à la résistance bactérienne croissante et encourager une prescription raisonnée des antibiotiques.'
      ]
    },
    {
      id: '19',
      title: 'SÉANCE N°5: English session: Current news',
      startTime: new Date(2025, 10, 28, 11, 0),
      endTime: new Date(2025, 10, 28, 12, 30),
      location: 'Petit Salon',
      speakers: [
        { name: 'Meriem Mjid', specialty: 'Pneumologie' },
        { name: 'Hela Kammoun', specialty: 'Pneumologie' },
        { name: 'Houda Snène', specialty: 'Pneumologie' }
      ],
      theme: 'Actualités',
      type: 'séance',
      description: 'GOLD 2026: What\'s new? Target therapy in Non Small Cells Lung Cancer(NSCLC) in early stages. New treatment in IFP: new hope?',
      details: [
        "GOLD 2026: What's new? - Meriem Mjid",
        'Target therapy in Non Small Cells Lung Cancer(NSCLC) in early stages - Hela Kammoun',
        'New treatment in IFP: new hope? - Houda Snène'
      ],
      isParallel: true,
      introduction: 'L’English Session ouvre une perspective internationale et actualisée des grandes avancées en pneumologie. Elle aborde d’une part, les nouveautés majeures attendues dans les recommandations GOLD 2026 pour la prise en charge de la BPCO, d’autre part, le déploiement des thérapeutiques ciblées dans les stades précoces du cancer bronchique non à petites cellules (NSCLC), et propose enfin un retour sur les espoirs portés par les nouvelles thérapeutiques dans la fibrose pulmonaire idiopathique (IFP).',
      objectives: [
        'Présenter et discuter les principales nouveautés annoncées dans les recommandations GOLD 2026 concernant la BPCO.',
        'Faire le point sur l’apport et les résultats récents des thérapies ciblées dans le NSCLC à un stade précoce.',
        'Explorer les traitements prometteurs de l’IFP et leur impact potentiel sur la pratique clinique.',
        'Favoriser l’interaction et l’enrichissement scientifique en langue anglaise pour une ouverture sur la communauté médicale internationale.'
      ]
    },
    {
      id: '14',
      title: 'Symposium Boehringer Ingelheim',
      startTime: new Date(2025, 10, 28, 12, 30),
      endTime: new Date(2025, 10, 28, 13, 15),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Symposium',
      type: 'symposium',
      description: '',
      details: [],
      isParallel: false
    },
    {
      id: '15',
      title: 'Déjeuner',
      startTime: new Date(2025, 10, 28, 13, 0),
      endTime: new Date(2025, 10, 28, 14, 30),
      location: 'Salle de restaurant',
      speakers: [],
      theme: 'Pause',
      type: 'pause',
      description: '',
      details: [],
      isParallel: false
    },
     {
      id: '17',
      title: 'Atelier N°5: VNI au long cours dans les pathologies restrictives',
      startTime: new Date(2025, 10, 28, 13, 0),
      endTime: new Date(2025, 10, 28, 14, 30),
      location: 'Petit Salon',
      speakers: [
        { name: 'Hamida Kwas', specialty: 'Pneumologie' },
        { name: 'Haifa Zaibi', specialty: 'Pneumologie' }
      ],
      theme: 'VNI',
      type: 'atelier',
      description: '',
      details: [
        'VNI au long cours dans les pathologies restrictives'
      ],
      isParallel: true
    },
    {
      id: '18',
      title: 'Atelier N°6: ITA au cours de l\'allergie respiratoire: indications et suivi',
      startTime: new Date(2025, 10, 28, 13, 0),
      endTime: new Date(2025, 10, 28, 14, 30),
      location: 'Salon Carré',
      speakers: [
        { name: 'Sonia Toujani', specialty: 'Pneumologie' },
        { name: 'Rania Kadoussi', specialty: 'Pneumologie' }
      ],
      theme: 'Allergies',
      type: 'atelier',
      description: '',
      details: [
        "ITA au cours de l'allergie respiratoire: indications et suivi"
      ],
      isParallel: true
    },
    {
      id: '16',
      title: 'SÉANCE N°6: Pneumopathies interstitielles diffuses',
      startTime: new Date(2025, 10, 28, 14, 30),
      endTime: new Date(2025, 10, 28, 16, 0),
      location: 'Grand Salon 2',
      speakers: [
        { name: 'Béchir Louzir', specialty: 'Pneumologie' },
        { name: 'Meya Abdallah', specialty: 'Médecine interne' },
        { name: 'Hédia Ghrairi', specialty: 'Pneumologie' }
      ],
      theme: 'PID',
      type: 'séance',
      description: 'Pneumopathies interstitielles diffuses aigues: quelle approche diagnostique? Pneumopathies interstitielles diffuses rapidement progressives. Traitement de la sarcoïdose: Approche actualisée.',
      details: [
        'Pneumopathies interstitielles diffuses aigues: quelle approche diagnostique? - Béchir Louzir',
        'Pneumopathies interstitielles diffuses rapidement progressives - Meya Abdallah',
        'Traitement de la sarcoïdose: Approche actualisée - Hédia Ghrairi'
      ],
      isParallel: false,
      introduction: 'Les pneumopathies interstitielles sont des pathologies complexes nécessitant une approche diagnostique et thérapeutique multidisciplinaire. Cette séance traitera de la prise en charge des formes aiguës, rapidement progressives et de la sarcoïdose.',
      objectives: [
        'Définir l’approche diagnostique actuelle devant une PID aiguë.',
        'Aborder la gestion spécifique des formes rapidement progressives.',
        'Mettre à jour les stratégies de traitement de la sarcoïdose pulmonaire.'
      ]
    },
    {
      id: '35',
      title: 'Symposium',
      startTime: new Date(2025, 10, 28, 16, 0),
      endTime: new Date(2025, 10, 28, 16, 30),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Symposium',
      type: 'symposium',
      description: '',
      details: []
    },
    {
      id: '21',
      title: 'Pause café & Visite des stands',
      startTime: new Date(2025, 10, 28, 16, 30),
      endTime: new Date(2025, 10, 28, 17, 0),
      location: 'Espace Posters & Stands',
      speakers: [],
      theme: 'Pause',
      type: 'pause',
      description: '',
      details: [],
      isParallel: false
    },
    {
      id: '22',
      title: 'SÉANCE N°7: Allergies',
      startTime: new Date(2025, 10, 28, 17, 0),
      endTime: new Date(2025, 10, 28, 18, 30),
      location: 'Grand Salon 2',
      speakers: [
        { name: 'Ines Riahi', specialty: 'ORL' },
        { name: 'Najla Bahloul', specialty: 'Pneumologie' },
        { name: 'Hafaoua Daghfous', specialty: 'Pneumologie' }
      ],
      theme: 'Allergies',
      type: 'séance',
      description: 'Rhinites chroniques: est-ce réellement une allergie? Apport pratique des allergènes moléculaires dans l\'allergie respiratoire. Les urgences en allergologie.',
      details: [
        'Rhinites chroniques: est-ce réellement une allergie? - Ines Riahi',
        "Apport pratique des allergènes moléculaires dans l'allergie respiratoire - Najla Bahloul",
        'Les urgences en allergologie - Hafaoua Daghfous'
      ],
      isParallel: true,
      introduction: 'Les allergies respiratoires sont une composante majeure des maladies respiratoires chroniques. Cette session aborde, de façon actualisée, la question des rhinites chroniques, l’apport des allergènes moléculaires et la gestion des urgences allergiques.',
      objectives: [
        'Différencier les causes allergiques/non allergiques dans les rhinites chroniques.',
        'Comprendre l’apport diagnostique et thérapeutique de l’approche moléculaire.',
        'Savoir reconnaître et prendre en charge les situations d’urgence en allergologie.'
      ]
    },
    {
      id: '23',
      title: 'SÉANCE N°8: Pathologies du sommeil',
      startTime: new Date(2025, 10, 28, 17, 0),
      endTime: new Date(2025, 10, 28, 18, 30),
      location: 'Petit Salon',
      speakers: [
        { name: 'Leila Gharbi', specialty: 'Pneumologie' },
        { name: 'Sonia Maalej', specialty: 'Pneumologie' },
        { name: 'Ahmed Abdelghani', specialty: 'Pneumologie' }
      ],
      theme: 'Sommeil',
      type: 'séance',
      description: 'Apnées obstructives et risques cardiovasculaires: Quels marqueurs? Traitements innovants dans le SAHOS. SOH: apport de la ventilation en aigu.',
      details: [
        'Apnées obstructives et risques cardiovasculaires: Quels marqueurs? - Leila Gharbi',
        'Traitements innovants dans le SAHOS - Sonia Maalej',
        'SOH: apport de la ventilation en aigu - Ahmed Abdelghani'
      ],
      isParallel: true,
      introduction: 'Les troubles respiratoires du sommeil, notamment les apnées, sont un enjeu de santé publique par leur lien étroit avec les complications cardiovasculaires. Ce module traite des avancées diagnostiques et thérapeutiques, incluant l’apport de la ventilation non invasive.',
      objectives: [
        'Rappeler les liens entre apnées du sommeil et risques cardiovasculaires.',
        'Découvrir les innovations thérapeutiques récentes pour le SAHOS (Syndrome d’Apnées Hypopnées Obstructives du Sommeil).',
        'Explorer la prise en charge ventilatoire en situation aigüe pour les troubles du sommeil.'
      ]
    },
    
    // Samedi 29 novembre
    {
      id: '25',
      title: 'SÉANCE N°9: Actualités',
      startTime: new Date(2025, 10, 29, 9, 0),
      endTime: new Date(2025, 10, 29, 10, 30),
      location: 'Grand Salon 2',
      speakers: [
        { name: 'Fatma Tritar', specialty: 'Pneumologie' },
        { name: 'Bouchra Lamia', specialty: 'Pneumologie' },
        { name: 'Zouhair Souissi', specialty: 'Pneumologie' }
      ],
      theme: 'Actualités',
      type: 'séance',
      description: 'PNLAT 2025: Quoi de neuf? Dysfonction cardiaque dans l\'IRA. L\'embolie pulmonaire à l\'ère de l\'IA.',
      details: [
        'PNLAT 2025: Quoi de neuf? - Fatma Tritar',
        "Dysfonction cardiaque dans l'IRA - Bouchra Lamia",
        "L'embolie pulmonaire à l'ère de l'IA - Zouhair Souissi"
      ],
      isParallel: true
    },
    {
      id: '26',
      title: 'SÉANCE N°10: Cancer bronchopulmonaire',
      startTime: new Date(2025, 10, 29, 9, 0),
      endTime: new Date(2025, 10, 29, 10, 30),
      location: 'Petit Salon',
      speakers: [
        { name: 'Leila Fekih', specialty: 'Pneumologie' },
        { name: 'Hanène Smadhi', specialty: 'Pneumologie' },
        { name: 'Hajer Racil', specialty: 'Pneumologie' }
      ],
      theme: 'Cancer',
      type: 'séance',
      description: 'Immunothérapie dans les formes localement avancées: néoadjuvant ou adjuvant? Traitement de la douleur dans le cancer du poumon. Les urgences carcinologiques en pneumologie.',
      details: [
        'Immunothérapie dans les formes localement avancées: néoadjuvant ou adjuvant? - Leila Fekih',
        'Traitement de la douleur dans le cancer du poumon - Hanène Smadhi',
        'Les urgences carcinologiques en pneumologie - Hajer Racil'
      ],
      isParallel: true,
      introduction: 'Le cancer bronchopulmonaire constitue l’un des défis majeurs de la pneumologie moderne, tant par sa fréquence que par la complexité de ses traitements. Cette séance explore les approches innovantes, notamment l’immunothérapie en situation néoadjuvante/adjuvante, la prise en charge de la douleur et les urgences spécifiques.',
      objectives: [
        'Distinguer les indications de l’immunothérapie selon le stade et la stratégie thérapeutique.',
        'Discuter la gestion de la douleur dans le cancer pulmonaire.',
        'Connaître les urgences carcinologiques spécifiques au champ pneumologique.'
      ]
    },
    {
      id: '28',
      title: 'Symposium Roche',
      startTime: new Date(2025, 10, 29, 10, 30),
      endTime: new Date(2025, 10, 29, 11, 0),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Symposium',
      type: 'symposium',
      description: '',
      details: [],
      isParallel: false
    },
    {
      id: '27',
      title: 'Pause café & Visite des stands',
      startTime: new Date(2025, 10, 29, 11, 0),
      endTime: new Date(2025, 10, 29, 11, 30),
      location: 'Espace Posters & Stands',
      speakers: [],
      theme: 'Pause',
      type: 'pause',
      description: '',
      details: [],
      isParallel: false
    },
    {
      id: '30',
      title: 'SÉANCE N°11: BPCO',
      startTime: new Date(2025, 10, 29, 11, 30),
      endTime: new Date(2025, 10, 29, 12, 30),
      location: 'Grand Salon 2',
      speakers: [
        { name: 'Mohamed Ridha Charfi', specialty: 'Pneumologie' },
        { name: 'Walid Feki', specialty: 'Pneumologie' }
      ],
      theme: 'BPCO',
      type: 'séance',
      description: 'Inflammation type 2 et BPCO. Réhabilitation respiratoire précoce après EA de BPCO sévère.',
      details: [
        'Inflammation type 2 et BPCO - Mohamed Ridha Charfi',
        'Réhabilitation respiratoire précoce après EA de BPCO sévère - Walid Feki'
      ],
      isParallel: true,
      introduction: 'La BPCO est une pathologie en constante évolution dans ses mécanismes et sa prise en charge. Cette session aborde l’inflammation de type 2, la réhabilitation respiratoire précoce et les stratégies post-exacerbation sévère.',
      objectives: [
        'Comprendre les nouvelles données sur l’inflammation de type 2 dans la BPCO.',
        'Explorer les bénéfices de la réhabilitation précoce après exacerbation aiguë.',
        'Mettre à jour la prise en charge globale des patients post-exacerbation.'
      ]
    },
    {
      id: '29',
      title: 'Remise des prix posters',
      startTime: new Date(2025, 10, 29, 12, 30),
      endTime: new Date(2025, 10, 29, 13, 0),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Prix',
      type: 'cérémonie',
      description: 'Sponsorisée par ABDIBRAHIM',
      details: [
        'Sponsorisée par ABDIBRAHIM'
      ],
      isParallel: true
    },
    {
      id: '31',
      title: 'ASSEMBLÉE GÉNÉRALE ORDINAIRE ET CLÔTURE DU CONGRÈS',
      startTime: new Date(2025, 10, 29, 13, 0),
      endTime: new Date(2025, 10, 29, 13, 30),
      location: 'Grand Salon 2',
      speakers: [],
      theme: 'Administratif',
      type: 'assemblée',
      description: '',
      details: [],
      isParallel: true
    }
  ];
  

export const DAYS: Day[] = [
    { key: '27', label: 'Jeudi 27', date: '27 Novembre' },
    { key: '28', label: 'Vendredi 28', date: '28 Novembre' },
    { key: '29', label: 'Samedi 29', date: '29 Novembre' }
];
  
export const THEMES: string[] = ['Tous', 'Actualités', 'Allergies', 'Asthme', 'BPCO', 'Cancer', 'Infections', 'PID', 'Sommeil'];

export const TYPES: string[] = ['Tous', 'séance', 'atelier', 'inaugurale', 'symposium'];

export const THEME_COLORS: Record<string, string> = {
    'BPCO': 'bg-[#033238]',
    'Asthme': 'bg-sky-600',
    'Cancer': 'bg-rose-600',
    'PID': 'bg-purple-600',
    'Sommeil': 'bg-indigo-600',
    'IA': 'bg-amber-500',
    'Infections': 'bg-pink-600',
    'Allergies': 'bg-[#033238]',
    'Pollution': 'bg-slate-500',
    'Actualités': 'bg-orange-500',
    'Urgences': 'bg-red-600',
    'VNI': 'bg-cyan-500',
    'Prix': 'bg-amber-400',
    'Administratif': 'bg-slate-600',
    'inaugurale': 'bg-rose-500',
    'symposium': 'bg-[#033238]',
    'atelier': 'bg-violet-500',
    'séance': 'bg-blue-600',
    'Pause': 'bg-slate-400',
    'Symposium': 'bg-[#033238]',
    'Techniques': 'bg-fuchsia-500',
    'accueil': 'bg-sky-500',
    'cérémonie': 'bg-amber-400',
    'assemblée': 'bg-slate-700'
};

export const getThemeColor = (themeOrType: string): string => {
    return THEME_COLORS[themeOrType] || 'bg-slate-500';
};