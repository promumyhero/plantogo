import {
  ExpenseCategory,
  ItineraryItem,
  JawaTengahCluster,
  OnboardingAnswers,
  PrimaryTransport,
  TravelVibe,
  TripPace,
} from '@/types/database';

export interface CuratedSpot {
  id: string;
  cluster: JawaTengahCluster;
  title: string;
  location_name: string;
  item_type: 'destination' | 'meal' | 'stay';
  vibe_tags: TravelVibe[];
  estimated_cost: number; // integer IDR per group of 4 or entry estimate
  recommended_start: string;
  recommended_end: string;
  image_url: string;
  notes: string;
  highlight_rank?: string;
}

export const JAWA_TENGAH_CLUSTERS_INFO: Array<{
  id: JawaTengahCluster;
  name: string;
  tagline: string;
  hero_image: string;
  elevation_or_stat: string;
  highlights: string[];
}> = [
  {
    id: 'Dieng',
    name: 'Dieng Plateau & Wonosobo',
    tagline: 'Negeri di Atas Awan, Golden Sunrise Sikunir & Kawah Vulkanik',
    hero_image:
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
    elevation_or_stat: '2.093 mdpl',
    highlights: ['Bukit Sikunir', 'Telaga Warna', 'Candi Arjuna', 'Mie Ongklok'],
  },
  {
    id: 'Magelang',
    name: 'Magelang & Borobudur',
    tagline: 'Keagungan Candi Dunia, Punthuk Setumbu & Kabut Lereng Sumbing',
    hero_image:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    elevation_or_stat: 'UNESCO Heritage',
    highlights: ['Candi Borobudur', 'Punthuk Setumbu', 'Nepal van Java', 'Kupat Tahu'],
  },
  {
    id: 'Semarang',
    name: 'Semarang & Bandungan',
    tagline: 'Arsitektur Kolonial Kota Lama, Lawang Sewu & Sejuknya Lereng Ungaran',
    hero_image:
      'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=1200&q=80',
    elevation_or_stat: 'Ibu Kota Jateng',
    highlights: ['Kota Lama', 'Lawang Sewu', 'Umbul Sidomukti', 'Lumpia Gang Lombok'],
  },
  {
    id: 'Solo',
    name: 'Surakarta (Solo) & Tawangmangu',
    tagline: 'Jantung Budaya Mataram, Pasar Gede, Batik Laweyan & Lereng Lawu',
    hero_image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    elevation_or_stat: 'Royal Heritage',
    highlights: ['Pura Mangkunegaran', 'Pasar Gede', 'Kampung Batik', 'Serabi Notosuman'],
  },
  {
    id: 'Yogyakarta',
    name: 'Prambanan & Merapi Border',
    tagline: 'Candi Hindu Termegah, Sunset Ratu Boko & Petualangan Jeep Merapi',
    hero_image:
      'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
    elevation_or_stat: 'Candi Kembar',
    highlights: ['Candi Prambanan', 'Kraton Ratu Boko', 'Lava Tour Merapi', 'Sate Klathak'],
  },
  {
    id: 'Karimunjawa',
    name: 'Jepara & Taman Nasional Karimunjawa',
    tagline: 'Surga Tropis Laut Jawa, Terumbu Karang & Sunset Pantai Tanjung Gelam',
    hero_image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    elevation_or_stat: '27 Pulau Tropis',
    highlights: ['Pulau Menjangan Kecil', 'Pantai Tanjung Gelam', 'Bukit Love', 'Ikan Bakar'],
  },
];

export const CURATED_JAWA_TENGAH_SPOTS: CuratedSpot[] = [
  // DIENG
  {
    id: 'spot-dieng-sikunir',
    cluster: 'Dieng',
    title: 'Golden Sunrise Bukit Sikunir',
    location_name: 'Desa Sembungan, Kejajar, Wonosobo',
    item_type: 'destination',
    vibe_tags: ['alam'],
    estimated_cost: 120000,
    recommended_start: '04:30',
    recommended_end: '07:30',
    image_url:
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
    notes: 'Siapkan jaket tebal (suhu bisa 8°C), senter kepala, dan parkir di area bawah.',
    highlight_rank: '1st Place',
  },
  {
    id: 'spot-dieng-ongklok',
    cluster: 'Dieng',
    title: 'Sarapan Mie Ongklok Longkrang & Sate Sapi',
    location_name: 'Jl. Pasukan Ronggolawe, Wonosobo',
    item_type: 'meal',
    vibe_tags: ['kuliner', 'relax'],
    estimated_cost: 220000,
    recommended_start: '08:30',
    recommended_end: '10:00',
    image_url:
      'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80',
    notes: 'Wajib coba kuah kental khas Wonosobo + tempe kemul hangat untuk 4 orang.',
  },
  {
    id: 'spot-dieng-arjuna',
    cluster: 'Dieng',
    title: 'Kompleks Candi Arjuna & Kawah Sikidang',
    location_name: 'Dieng Kulon, Banjarnegara',
    item_type: 'destination',
    vibe_tags: ['heritage', 'alam'],
    estimated_cost: 160000,
    recommended_start: '10:30',
    recommended_end: '13:30',
    image_url:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    notes: 'Tiket terusan Candi Arjuna & Kawah Sikidang; lewati jembatan kayu estetis.',
  },
  {
    id: 'spot-dieng-telaga',
    cluster: 'Dieng',
    title: 'Batu Ratapan Angin & View Telaga Warna',
    location_name: 'Dieng Wetan, Wonosobo',
    item_type: 'destination',
    vibe_tags: ['alam', 'relax'],
    estimated_cost: 100000,
    recommended_start: '14:30',
    recommended_end: '17:00',
    image_url:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    notes: 'Spot foto terbaik melihat gradasi warna Telaga Warna dan Telaga Pengilon dari atas.',
  },

  // MAGELANG
  {
    id: 'spot-magelang-borobudur',
    cluster: 'Magelang',
    title: 'Eksplorasi Struktur Candi Borobudur (Sesi Pagi)',
    location_name: 'Borobudur, Magelang',
    item_type: 'destination',
    vibe_tags: ['heritage', 'alam'],
    estimated_cost: 600000,
    recommended_start: '08:00',
    recommended_end: '11:30',
    image_url:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    notes: 'Booking tiket naik struktur candi H-7 online, sudah termasuk sandal upanat & guide.',
    highlight_rank: '2nd Place',
  },
  {
    id: 'spot-magelang-mangut',
    cluster: 'Magelang',
    title: 'Makan Siang Mangut Beong Sehati & Kopi Borobudur',
    location_name: 'Desa Kembanglimus, Borobudur',
    item_type: 'meal',
    vibe_tags: ['kuliner'],
    estimated_cost: 320000,
    recommended_start: '12:00',
    recommended_end: '13:30',
    image_url:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    notes: 'Kuliner ikonik ikan sungai Progo kuah pedas rempah, pesan porsi sharing 4 orang.',
  },
  {
    id: 'spot-magelang-nepal',
    cluster: 'Magelang',
    title: 'Dusun Butuh (Nepal van Java) Lereng Sumbing',
    location_name: 'Kaliangkrik, Magelang',
    item_type: 'destination',
    vibe_tags: ['alam', 'relax'],
    estimated_cost: 140000,
    recommended_start: '14:30',
    recommended_end: '17:30',
    image_url:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    notes: 'Rumah bertumpuk di kaki Gunung Sumbing dengan udara sejuk dan kopi lokal.',
  },

  // SEMARANG
  {
    id: 'spot-smg-kotalama',
    cluster: 'Semarang',
    title: 'Walking Tour Kota Lama & Gereja Blenduk',
    location_name: 'Tanjung Mas, Semarang Utara',
    item_type: 'destination',
    vibe_tags: ['heritage', 'relax'],
    estimated_cost: 80000,
    recommended_start: '08:30',
    recommended_end: '11:00',
    image_url:
      'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=800&q=80',
    notes: 'Ngopi pagi di Tekodeko Koffiehuis dan foto arsitektur Eropa abad ke-19.',
    highlight_rank: '4th Place',
  },
  {
    id: 'spot-smg-lumpia',
    cluster: 'Semarang',
    title: 'Kuliner Lumpia Gang Lombok & Tahu Gimbal',
    location_name: 'Gang Lombok No. 11, Pecinan Semarang',
    item_type: 'meal',
    vibe_tags: ['kuliner', 'heritage'],
    estimated_cost: 240000,
    recommended_start: '11:30',
    recommended_end: '13:00',
    image_url:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    notes: 'Lumpia tertua di Semarang; beli lumpia basah untuk makan di tempat & vakum untuk oleh-oleh.',
  },
  {
    id: 'spot-smg-umbul',
    cluster: 'Semarang',
    title: 'Umbul Sidomukti & Pondok Kopi Bandungan',
    location_name: 'Bandungan, Kabupaten Semarang',
    item_type: 'destination',
    vibe_tags: ['alam', 'relax'],
    estimated_cost: 260000,
    recommended_start: '14:30',
    recommended_end: '18:00',
    image_url:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    notes: 'Santai sore menghadap lembah Ungaran sambil menikmati kopi hangat dan kabut tipis.',
  },

  // SOLO
  {
    id: 'spot-solo-mangkunegaran',
    cluster: 'Solo',
    title: 'Tur Heritage Pura Mangkunegaran & Pracima Tuin',
    location_name: 'Banjarsari, Surakarta',
    item_type: 'destination',
    vibe_tags: ['heritage', 'kuliner'],
    estimated_cost: 360000,
    recommended_start: '09:00',
    recommended_end: '12:00',
    image_url:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    notes: 'Pendopo agung bergaya Jawa-Eropa dilanjutkan fine dining tradisional di Taman Pracima.',
  },
  {
    id: 'spot-solo-pasargede',
    cluster: 'Solo',
    title: 'Eksplorasi Kuliner Pasar Gede & Dawet Telasih',
    location_name: 'Jl. Urip Sumoharjo, Surakarta',
    item_type: 'meal',
    vibe_tags: ['kuliner', 'heritage'],
    estimated_cost: 180000,
    recommended_start: '13:00',
    recommended_end: '15:00',
    image_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    notes: 'Cicipi Es Dawet Telasih Bu Dermi, Timlo Sastro, dan dimsum legendaris lantai 2.',
  },

  // YOGYAKARTA BORDER
  {
    id: 'spot-jogja-prambanan',
    cluster: 'Yogyakarta',
    title: 'Sunset Candi Prambanan & Kraton Ratu Boko',
    location_name: 'Perbatasan Klaten - Sleman',
    item_type: 'destination',
    vibe_tags: ['heritage', 'relax'],
    estimated_cost: 440000,
    recommended_start: '15:00',
    recommended_end: '18:15',
    image_url:
      'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=800&q=80',
    notes: 'Gunakan paket tiket terusan Prambanan – Ratu Boko termasuk free shuttle antar candi.',
  },

  // KARIMUNJAWA
  {
    id: 'spot-karimun-hopping',
    cluster: 'Karimunjawa',
    title: 'Island Hopping & Snorkeling Menjangan Kecil',
    location_name: 'Taman Nasional Karimunjawa, Jepara',
    item_type: 'destination',
    vibe_tags: ['alam', 'relax'],
    estimated_cost: 800000,
    recommended_start: '08:00',
    recommended_end: '16:30',
    image_url:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    notes: 'Sewa private boat 4 orang sudah termasuk alat snorkeling, dokumentasi underwater & BBQ ikan.',
    highlight_rank: '3rd Place',
  },
];

export function calculateRecommendedCategoryBudgets(
  totalBudget: number,
  vibe: TravelVibe,
  transport: PrimaryTransport
): Record<ExpenseCategory, number> {
  const safeTotal = Math.max(0, Math.floor(totalBudget));

  let weights: Record<ExpenseCategory, number> = {
    transport: 0.25,
    lodging: 0.30,
    food: 0.22,
    tickets: 0.13,
    shopping: 0.05,
    other: 0.05,
  };

  if (vibe === 'kuliner') {
    weights = {
      transport: 0.22,
      lodging: 0.26,
      food: 0.34,
      tickets: 0.08,
      shopping: 0.06,
      other: 0.04,
    };
  } else if (vibe === 'alam') {
    weights = {
      transport: 0.28,
      lodging: 0.27,
      food: 0.20,
      tickets: 0.17,
      shopping: 0.04,
      other: 0.04,
    };
  } else if (vibe === 'heritage') {
    weights = {
      transport: 0.23,
      lodging: 0.28,
      food: 0.22,
      tickets: 0.18,
      shopping: 0.05,
      other: 0.04,
    };
  }

  if (transport === 'mobil_pribadi') {
    weights.transport += 0.03;
    weights.other = Math.max(0.02, weights.other - 0.03);
  }

  const categories: ExpenseCategory[] = [
    'transport',
    'lodging',
    'food',
    'tickets',
    'shopping',
    'other',
  ];

  const result: Record<ExpenseCategory, number> = {
    transport: 0,
    lodging: 0,
    food: 0,
    tickets: 0,
    shopping: 0,
    other: 0,
  };

  let allocated = 0;
  categories.forEach((cat, idx) => {
    if (idx === categories.length - 1) {
      result[cat] = Math.max(0, safeTotal - allocated);
    } else {
      const share = Math.round(( safeTotal * weights[cat] ) / 1000) * 1000;
      result[cat] = share;
      allocated += share;
    }
  });

  return result;
}

export function generateHybridItinerary(params: {
  tripId: string;
  creatorMemberId: string;
  startDate: string;
  endDate: string;
  answers: OnboardingAnswers;
}): ItineraryItem[] {
  const { tripId, creatorMemberId, startDate, endDate, answers } = params;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(
    1,
    Math.min(14, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  );

  const selectedClusters: JawaTengahCluster[] =
    answers.clusters.length > 0 ? answers.clusters : ['Semarang', 'Dieng', 'Magelang'];

  const matchingSpots = CURATED_JAWA_TENGAH_SPOTS.filter((spot) =>
    selectedClusters.includes(spot.cluster)
  );
  const fallbackSpots =
    matchingSpots.length > 0 ? matchingSpots : CURATED_JAWA_TENGAH_SPOTS;

  const maxSpotsPerDay =
    answers.pace === 'santai' ? 2 : answers.pace === 'seimbang' ? 3 : 4;

  const transitModeLabel =
    answers.transport === 'mobil_pribadi'
      ? 'Mobil Pribadi via Tol Trans-Jawa / Jalur Provinsi'
      : answers.transport === 'kereta_sewa'
      ? 'Kereta Api + Sewa Kendaraan Lokal'
      : 'Shuttle Travel Antarkota';

  const generated: ItineraryItem[] = [];
  let spotCursor = 0;

  for (let day = 1; day <= diffDays; day++) {
    const clusterForDay = selectedClusters[(day - 1) % selectedClusters.length];
    const daySpots = fallbackSpots.filter((s) => s.cluster === clusterForDay);
    const pool = daySpots.length > 0 ? daySpots : fallbackSpots;

    for (let slot = 0; slot < Math.min(maxSpotsPerDay, pool.length); slot++) {
      const chosen = pool[(spotCursor + slot) % pool.length];

      // Insert a realistic transit slot before the second spot of the day
      if (slot === 1) {
        generated.push({
          id: `item-${tripId}-d${day}-transit-${slot}`,
          trip_id: tripId,
          day_number: day,
          start_time: '11:00',
          end_time: '12:00',
          item_type: 'transit',
          title: `Perjalanan Transit Menuju ${chosen.title}`,
          location_name: `Koridor ${clusterForDay}`,
          city_cluster: clusterForDay,
          estimated_cost: answers.transport === 'mobil_pribadi' ? 75000 : 100000,
          transit_mode: transitModeLabel,
          transit_duration_mins: 55,
          notes: 'Estimasi waktu tempuh sudah termasuk buffer antrean parkir & kondisi jalan Jawa Tengah.',
          status: 'scheduled',
          is_locked: false,
          created_by: creatorMemberId,
          created_at: new Date().toISOString(),
        });
      }

      generated.push({
        id: `item-${tripId}-d${day}-s${slot}`,
        trip_id: tripId,
        day_number: day,
        start_time: chosen.recommended_start,
        end_time: chosen.recommended_end,
        item_type: chosen.item_type,
        title: chosen.title,
        location_name: chosen.location_name,
        city_cluster: chosen.cluster,
        estimated_cost: chosen.estimated_cost,
        notes: chosen.notes,
        status: 'scheduled',
        is_locked: day === 1 && slot === 0, // Lock first anchor item as example of Owner lock
        created_by: creatorMemberId,
        created_at: new Date().toISOString(),
      });
    }
    spotCursor += maxSpotsPerDay;
  }

  // Add up to 3 remaining curated spots into Wishlist staging area so the 4 members can collaborate
  const unscheduledSpots = CURATED_JAWA_TENGAH_SPOTS.filter(
    (wishSpot) => !generated.some((g) => g.title === wishSpot.title)
  ).slice(0, 3);

  unscheduledSpots.forEach((wishSpot, idx) => {
    generated.push({
      id: `item-${tripId}-wish-${idx}`,
      trip_id: tripId,
      day_number: 1,
      start_time: wishSpot.recommended_start,
      end_time: wishSpot.recommended_end,
      item_type: wishSpot.item_type,
      title: wishSpot.title,
      location_name: wishSpot.location_name,
      city_cluster: wishSpot.cluster,
      estimated_cost: wishSpot.estimated_cost,
      notes: wishSpot.notes,
      status: 'wishlist',
      is_locked: false,
      created_by: creatorMemberId,
      created_at: new Date().toISOString(),
    });
  });

  return generated;
}
