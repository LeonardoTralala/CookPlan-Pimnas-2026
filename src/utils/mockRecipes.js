export const mockRecipes = [
  {
    id: 1,
    title: "Gado-Gado Segar",
    description: "Salad khas Indonesia berisi sayuran rebus, telur, tahu, tempe, disiram dengan saus kacang gurih manis yang melimpah dan taburan kerupuk renyah.",
    readyInMinutes: 25,
    calories: 320,
    priceIdr: 30000,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk5CQmmXxTLEdn-JZ2cdm0uSXqhprKYJ7fsDNllaTIWs56rpBG5lq1JPZFl8aqFyj5dgTa05R1W2auBYTbwIZpqwWaGzzmu70p171K-i6e4xRBCs4CENnb-zAotsSaV4WuKec4zI-uU2dNiVYTEZw5Ja0jdTR33nnfvlsCH_P29yKgtPbjFGqrS9ZuNYNSg8KdLQ3kLDvrnxTEsemTZ1HAf8tX5Rb0YBt0z21N1XcQe1f7F-oLo5FHZEA6YFNCCEYNUFS2CEE3GnGX",
    difficulty: "easy",
    badges: ["Vegetarian", "Budget Friendly", "Local Ingredients"],
    ingredients: [
      { name: "Kacang Tanah", amount: 150, unit: "g", category: "dry_goods", priceIdr: 8000 },
      { name: "Tahu Putih", amount: 2, unit: "pcs", category: "dry_goods", priceIdr: 5000 },
      { name: "Tempe", amount: 150, unit: "g", category: "dry_goods", priceIdr: 5000 },
      { name: "Bayam", amount: 1, unit: "ikat", category: "vegetables", priceIdr: 3000 },
      { name: "Tauge", amount: 100, unit: "g", category: "vegetables", priceIdr: 3000 },
      { name: "Telur Rebus", amount: 2, unit: "pcs", category: "dairy", priceIdr: 6000 },
      { name: "Gula Merah", amount: 50, unit: "g", category: "spices", priceIdr: 3000 },
      { name: "Bawang Putih", amount: 2, unit: "siung", category: "spices", priceIdr: 1500 },
      { name: "Cabai Rawit", amount: 3, unit: "pcs", category: "spices", priceIdr: 2000 }
    ],
    instructions: [
      "Potong tahu dan tempe kotak-kotak, lalu goreng hingga kecokelatan dan tiriskan.",
      "Rebus bayam dan tauge secara terpisah hingga matang layu, lalu tiriskan.",
      "Goreng kacang tanah hingga kecokelatan. Haluskan kacang goreng bersama bawang putih, cabai rawit, gula merah, dan garam. Tambahkan sedikit air hangat dan air asam jawa hingga mengental.",
      "Susun sayuran rebus, tempe, tahu, dan irisan telur rebus di atas piring saji.",
      "Siram dengan saus kacang hangat and sajikan dengan taburan bawang goreng serta kerupuk."
    ]
  },
  {
    id: 2,
    title: "Soto Ayam Kampung",
    description: "Sup ayam tradisional berkuah kuning bening yang hangat dan aromatik, disajikan dengan suwiran ayam kampung, soun, kol, telur rebus, koya, dan perasan jeruk nipis.",
    readyInMinutes: 45,
    calories: 410,
    priceIdr: 40000,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCB_ovYxZPlfuqHHWZWsXcQtck3mkMMTWWVbtFfISdnDmYYCprdM2cNFtNQDwcbrwSN4XJeRuVeoId3E0WVOixZOMyGBZa23N_ulDGl0eriio9Td3UBsyiTPtThLkux1bujZBfPFVlmtDP-RYsoKD0eIYbEDShjMwqmO55JCHkHo_yo2SoIrssAH5N-Se4zLmjRQ56WWqfGAFbwRepmLqZUAud8UOpZFwrlhyxXjXOhzL4HQb4o81kwap9hG99T1Va2kUFotJvjtyGA",
    difficulty: "medium",
    badges: ["Local Ingredients", "Budget Friendly"],
    ingredients: [
      { name: "Daging Ayam Kampung", amount: 350, unit: "g", category: "meat", priceIdr: 25000 },
      { name: "Kol", amount: 100, unit: "g", category: "vegetables", priceIdr: 3000 },
      { name: "Soun", amount: 50, unit: "g", category: "dry_goods", priceIdr: 4000 },
      { name: "Tauge", amount: 50, unit: "g", category: "vegetables", priceIdr: 2000 },
      { name: "Telur Rebus", amount: 2, unit: "pcs", category: "dairy", priceIdr: 6000 },
      { name: "Kunyit", amount: 2, unit: "ruas", category: "spices", priceIdr: 2000 },
      { name: "Serai", amount: 2, unit: "batang", category: "spices", priceIdr: 2000 },
      { name: "Daun Jeruk", amount: 4, unit: "lembar", category: "spices", priceIdr: 1000 },
      { name: "Bawang Merah", amount: 6, unit: "siung", category: "spices", priceIdr: 3000 },
      { name: "Bawang Putih", amount: 4, unit: "siung", category: "spices", priceIdr: 2000 }
    ],
    instructions: [
      "Rebus ayam kampung dalam air mendidih bersama serai dan daun jeruk hingga empuk. Angkat ayam, tiriskan, dan suwir-suwir dagingnya. Jangan buang air kaldu rebusannya.",
      "Haluskan bawang merah, bawang putih, kunyit, jahe, kemiri, ketumbar, dan merica.",
      "Tumis bumbu halus hingga harum dan matang, lalu masukkan ke dalam panci berisi kaldu ayam hangat.",
      "Didihkan kuah soto dengan api kecil agar bumbu meresap sempurna. Tambahkan garam dan gula secukupnya.",
      "Seduh soun dan tauge dengan air panas, lalu iris kol tipis-tipis.",
      "Tata soun, kol, tauge, suwiran ayam, dan irisan telur rebus di dalam mangkok.",
      "Siram dengan kuah soto panas. Sajikan dengan bawang goreng, daun seledri, koya, dan jeruk nipis."
    ]
  },
  {
    id: 3,
    title: "Tempe Bowl Sehat",
    description: "Menu sehat minimalis modern yang memadukan nasi merah hangat, tempe panggang bumbu wijen, irisan alpukat mentega, edamame manis, dan wortel iris.",
    readyInMinutes: 20,
    calories: 350,
    priceIdr: 25000,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7AaGkhvQceouj7DjoYa0KeRNG47PciPWfAI_qLiL31Ye5Ogz0SC1vgqb8AJjP1LtnkmkybO_LYhsK0ZHSZ0h91QiFyLUmxKQItXAGB64dPqot9g-tVZ7LW75pdm7uNlSpCPz_84nI3oy0iJZn8jQOoUbKqGmKsybz1KhD5xMQ2lIYkGDT3yg1jlq2D9HqSTDGnXLrEiTyIVcVHrmp4_TvzlB3-V83DSoTni-UIPIdEdGtSahp72FpGk_LQ6BawLrlTRtI8O-I_REA",
    difficulty: "easy",
    badges: ["Vegetarian", "Quick", "Budget Friendly"],
    ingredients: [
      { name: "Tempe Segar", amount: 150, unit: "g", category: "dry_goods", priceIdr: 5000 },
      { name: "Nasi Merah", amount: 200, unit: "g", category: "dry_goods", priceIdr: 6000 },
      { name: "Alpukat Mentega", amount: 0.5, unit: "pcs", category: "vegetables", priceIdr: 8000 },
      { name: "Edamame Kupas", amount: 50, unit: "g", category: "vegetables", priceIdr: 5000 },
      { name: "Wortel", amount: 50, unit: "g", category: "vegetables", priceIdr: 2000 },
      { name: "Minyak Wijen", amount: 1, unit: "sdm", category: "spices", priceIdr: 3000 },
      { name: "Kecap Asin", amount: 2, unit: "sdm", category: "spices", priceIdr: 2000 },
      { name: "Biji Wijen", amount: 1, unit: "sdt", category: "spices", priceIdr: 3000 }
    ],
    instructions: [
      "Potong tempe berbentuk kubus tebal. Rendam dalam campuran kecap asin, minyak wijen, dan sedikit bawang putih bubuk selama 5 menit.",
      "Panggang tempe di atas wajan anti lengket (pan) hingga kecokelatan di seluruh sisi tanpa minyak berlebih.",
      "Rebus edamame kupas dan wortel yang telah diiris tipis korek api hingga setengah matang, lalu tiriskan.",
      "Siapkan mangkuk saji, tata nasi merah di bagian dasar mangkuk.",
      "Susun tempe panggang, edamame rebus, irisan wortel, dan irisan alpukat segar di atas nasi merah secara teratur.",
      "Taburkan biji wijen di atas tempe dan alpukat. Siap disajikan hangat."
    ]
  },
  {
    id: 4,
    title: "Mie Goreng Jawa",
    description: "Mie kuning tradisional yang ditumis gurih dengan racikan bumbu kemiri khas Jawa, dilengkapi kol segar, sawi hijau, suwiran ayam, bakso sapi, dan telur dadar iris.",
    readyInMinutes: 15,
    calories: 480,
    priceIdr: 28000,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBOo1ImnnPyKDHnFzklBsF2yhHJqP7jHRTBOxMUL8Zz1Cz-RwFeefpHKM8eL_S6hgBQvKk8pgmN7E_SDhOzDvenXy-gYk7RzdpedE0BZHew_S7qGA5SpufyA07_AQqlHCjhJ1OTNhPIrzX3_-QQetUnc7jhgJQz3RXLH16JkT9Xb19qpkdRWHEnFQ4ffheuWuwfPtxuwSvwfB3Xrjfb6USlHWV-AiID9aGDrM32KK5JOYBydvEyvAzAuHtKDpPVfvEieG0FsbpEg1V",
    difficulty: "easy",
    badges: ["Quick", "Budget Friendly"],
    ingredients: [
      { name: "Mie Basah Kuning", amount: 200, unit: "g", category: "dry_goods", priceIdr: 5000 },
      { name: "Kol", amount: 50, unit: "g", category: "vegetables", priceIdr: 2000 },
      { name: "Sawi Hijau", amount: 50, unit: "g", category: "vegetables", priceIdr: 2000 },
      { name: "Bakso Sapi", amount: 4, unit: "pcs", category: "meat", priceIdr: 8000 },
      { name: "Telur Ayam", amount: 1, unit: "pcs", category: "dairy", priceIdr: 3000 },
      { name: "Kecap Manis", amount: 3, unit: "sdm", category: "spices", priceIdr: 3000 },
      { name: "Kemiri", amount: 2, unit: "butir", category: "spices", priceIdr: 2000 },
      { name: "Bawang Merah", amount: 4, unit: "siung", category: "spices", priceIdr: 2000 },
      { name: "Bawang Putih", amount: 2, unit: "siung", category: "spices", priceIdr: 1500 }
    ],
    instructions: [
      "Haluskan bawang merah, bawang putih, kemiri, merica bubuk, dan garam.",
      "Tumis bumbu halus hingga tercium aroma wangi di wajan.",
      "Masukkan telur ayam, orak-arik kasar di wajan bersama bumbu. Tambahkan irisan bakso sapi.",
      "Masukkan irisan kol dan sawi hijau, tumis sebentar hingga sayuran agak layu.",
      "Masukkan mie kuning basah, tuangkan kecap manis, kaldu jamur secukupnya.",
      "Aduk cepat mie dengan api besar agar bumbu merata dan meresap sempurna. Angkat.",
      "Sajikan mie goreng Jawa hangat dengan taburan bawang goreng dan acar timun."
    ]
  },
  {
    id: 5,
    title: "Ikan Bakar Bali",
    description: "Ikan laut segar panggang yang dilumuri bumbu khas Bali (Base Gede) yang kaya rempah eksotis, disajikan lengkap dengan sambal matah segar beraroma serai dan daun jeruk.",
    readyInMinutes: 40,
    calories: 290,
    priceIdr: 48000,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCCdUb4DF4C5nHJVl3kkRyZzL9NmHFvNWsQY9g76Otg8PSPYEU3y6pJ8m2A3RNuS8Gu_MEe7hddJsDLEKEwBaNV5453BtThP7De14rYhG0Yt6GzN54qfJhRkc6H3UuX8SPlLmZH2WRK_d1l2jJuzqHVGugQB7o2f-8rcZmyK4rfshHwFaXflHPFOX1eYaE-NE7XOcXT2rX-Ebb8RyvnLm650dG4AM33T2YQHfW6G5ajx0pMweIsqbsFcAYQWOd0uyFqHDp-wRcItjN",
    difficulty: "medium",
    badges: ["Local Ingredients"],
    ingredients: [
      { name: "Ikan Nila/Kerapu", amount: 400, unit: "g", category: "meat", priceIdr: 35000 },
      { name: "Cabai Merah Keriting", amount: 5, unit: "pcs", category: "spices", priceIdr: 5000 },
      { name: "Bawang Merah", amount: 8, unit: "siung", category: "spices", priceIdr: 3000 },
      { name: "Bawang Putih", amount: 3, unit: "siung", category: "spices", priceIdr: 2000 },
      { name: "Serai", amount: 3, unit: "batang", category: "spices", priceIdr: 2000 },
      { name: "Daun Jeruk Purut", amount: 4, unit: "lembar", category: "spices", priceIdr: 1000 },
      { name: "Terasi Bakar", amount: 1, unit: "sdt", category: "spices", priceIdr: 2000 },
      { name: "Minyak Kelapa", amount: 3, unit: "sdm", category: "spices", priceIdr: 4000 },
      { name: "Jeruk Nipis", amount: 1, unit: "pcs", category: "spices", priceIdr: 2500 }
    ],
    instructions: [
      "Bersihkan ikan, kerat-kerat badannya, lalu lumuri dengan perasan air jeruk nipis dan garam. Diamkan 10 menit.",
      "Haluskan cabai merah, bawang putih, kunyit, jahe, kemiri, dan terasi. Tumis bumbu halus bersama serai geprek hingga matang harum, sisihkan sebagian untuk bumbu olesan ikan.",
      "Bakar/panggang ikan di atas alat pemanggang sambil diolesi bumbu tumis kelapa secara berulang hingga matang merata di kedua sisi.",
      "Untuk Sambal Matah: Iris tipis bawang merah, cabai rawit, serai bagian dalam, dan daun jeruk. Campurkan di mangkuk bersama garam, sedikit terasi, dan perasan jeruk limau. Siram dengan minyak kelapa super panas.",
      "Sajikan ikan bakar Bali hangat dengan siraman sambal matah segar di atasnya."
    ]
  },
  {
    id: 6,
    title: "Tumis Sayur Pelangi",
    description: "Sajian tumisan sayuran warna-warni yang sehat, renyah, dan berprotein tinggi, berisi wortel, jagung muda, brokoli, kembang kol, tauge besar, dan tahu sutra goreng.",
    readyInMinutes: 15,
    calories: 180,
    priceIdr: 22000,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYdhqaLNhiPpC7e7itJL1iHdJVa1yUz9Y-u_6dsJxIWUs0S1EDlM6kA4ux8I7Plgv_c0UvcPYjmMMeieOAyFKQo1NbuzUBNrdCZsUU77Nyp1XHIrdzwJkttwCvfEz-MllkJ9bVKrLKk_V2XXUXmNS52ieI_GzZz0-tfMss_PNdryKq6pi4LxVS9WocQZf1OeeBxt2pLn5koKDB5gffc2zFqhhMcAMu0D5x_O_rxyJnT4j3_00vQR_jsgxhMJuhu0F8Atv3GmaPDG9C",
    difficulty: "easy",
    badges: ["Vegetarian", "Quick", "Budget Friendly", "Local Ingredients"],
    ingredients: [
      { name: "Brokoli", amount: 100, unit: "g", category: "vegetables", priceIdr: 5000 },
      { name: "Wortel", amount: 80, unit: "g", category: "vegetables", priceIdr: 3000 },
      { name: "Jagung Muda", amount: 50, unit: "g", category: "vegetables", priceIdr: 3000 },
      { name: "Tahu Sutra", amount: 1, unit: "pcs", category: "dry_goods", priceIdr: 4000 },
      { name: "Bawang Putih", amount: 3, unit: "siung", category: "spices", priceIdr: 2000 },
      { name: "Saus Tiram Vegetarian", amount: 2, unit: "sdm", category: "spices", priceIdr: 4000 },
      { name: "Minyak Wijen", amount: 1, unit: "sdt", category: "spices", priceIdr: 2000 }
    ],
    instructions: [
      "Potong tahu sutra menjadi kotak-kotak, lalu goreng sebentar hingga berkulit luar. Sisihkan.",
      "Potong brokoli per kuntum kecil, iris tipis wortel secara serong, dan potong jagung muda memanjang.",
      "Tumis cincangan bawang putih hingga harum kekuningan.",
      "Masukkan wortel dan jagung muda terlebih dahulu bersama sedikit air karena teksturnya keras. Masak hingga setengah matang.",
      "Masukkan brokoli dan tahu goreng. Tambahkan saus tiram vegetarian, garam, merica, dan sedikit gula.",
      "Aduk cepat dengan api sedang hingga brokoli berubah warna hijau segar tapi teksturnya masih renyah.",
      "Sesaat sebelum diangkat, tuangkan minyak wijen untuk aroma harum khas oriental. Sajikan hangat."
    ]
  }
];
