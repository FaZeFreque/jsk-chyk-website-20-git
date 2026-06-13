/* Selected Written Articles & Essays */
/* Card images live in assets/content/ — sourced from
   "_SOURCE FILES (not for hosting)/1 A PICTURES AND CONTENT/4 CONTENT/TALKS AND ARTICLES" (see image notes there). */
window.CHYK_DATA = window.CHYK_DATA || {};
window.CHYK_DATA.articles = [
  {
    id: 'youth-essay-youth-potential', title: 'Harnessing Youth Potential Through Dynamic Spirituality', category: 'Youth Essays', source: 'Youth Essays',
    tags: ['Youth', 'Spirituality', 'Potential'], shortDesc: 'Discovering and directing the immense potential of youth towards personality unfoldment and service of humanity.',
    readTime: '4 min', author: 'Swami Anukoolananda', image: 'assets/content/youth-potential-satsang.jpg', featured: true
  },
  {
    id: 'youth-essay-tradition-modernity', title: 'Tradition and Modernity', category: 'Youth Essays', source: 'Youth Essays',
    tags: ['Tradition', 'Modernity', 'Culture'], shortDesc: 'A reflection on staying rooted in Bharatiya culture while engaging thoughtfully with a rapidly globalising world.',
    readTime: '3 min', author: 'CHYK CIRS', image: 'assets/content/tradition-modernity-dance.jpg', featured: true
  },
  {
    id: 'chinmaya-transformation-tips', title: 'Ten Tips for Transformation', category: 'Chinmaya Mission', source: 'Chinmaya Mission',
    tags: ['Transformation', 'Sattva', 'Practice'], shortDesc: 'Ten practical dimensions of life through which noble habits, clarity, and total transformation can unfold.',
    readTime: '5 min', author: 'Swami Tejomayananda', image: 'assets/content/ten-tips-transformation-havan.jpg', featured: true
  },
  {
    id: 'chinmaya-hanuman-service', title: "The Greatness of Hanuman's Service", category: 'Chinmaya Mission', source: 'Chinmaya Mission',
    tags: ['Hanuman', 'Service', 'Devotion'], shortDesc: 'A meditation on true mastery, devotion, and the greatness revealed through selfless service to a noble ideal.',
    readTime: '4 min', author: 'Swami Tejomayananda', image: 'assets/content/devotional-service-music.jpg', featured: true
  },
  {
    id: 'publication-harmony-existence', title: 'Harmony of Existence', category: 'Publications', source: 'Kindle Life',
    tags: ['Harmony', 'Values', 'Living'], shortDesc: 'How scriptural wisdom and disciplined effort can restore balance, intelligence, and harmony to everyday living.',
    readTime: '4 min', author: 'Swami Chinmayananda', image: 'assets/content/kindle-life-gurudev-book.jpg', featured: true
  },
  {
    id: 'publication-law-karma', title: 'Law of Karma', category: 'Publications', source: 'Kindle Life',
    tags: ['Karma', 'Self-Effort', 'Destiny'], shortDesc: "A clear exploration of destiny and self-effort, showing how today's choices reshape the future.",
    readTime: '6 min', author: 'Swami Chinmayananda', image: 'assets/content/karma-yajna-fire.jpg', featured: true
  }
];

/* Ten Chinmaya Udghosh reading slots — six published from the magazine
   archive (cover images match each article's issue), four still editable. */
window.CHYK_DATA.udghoshArticles = [
  {
    id: 'udghosh-article-01', title: 'Relative Reality: When Parents Don’t Understand', category: 'Chinmaya Udghosh', source: 'Vol 18 | Issue 2',
    tags: ['Family', 'Communication', 'Growing Up'], shortDesc: 'A reader asks how to talk to parents who don’t understand — and learns to turn conflict into conversation.',
    readTime: '4 min', author: 'Chinmaya Udghosh', image: 'assets/udghosh/article-thumbnails/01.webp', featured: true, published: true
  },
  {
    id: 'udghosh-article-02', title: 'Navigating Through the Energy Crisis', category: 'Chinmaya Udghosh', source: 'India First · Vol 17 | Issue 12',
    tags: ['India First', 'Energy', 'Strategy'], shortDesc: 'How Bharat is steering through a global oil shock with diversification, diplomacy, and a decisive shift to clean energy.',
    readTime: '5 min', author: 'Sai Teja', image: 'assets/udghosh/article-thumbnails/02.webp', featured: false, published: true
  },
  {
    id: 'udghosh-article-03', title: 'Ramayana Reboot: Leadership Lessons from Ram', category: 'Chinmaya Udghosh', source: 'Ramayana Reboot · Vol 17 | Issue 12',
    tags: ['Ramayana', 'Leadership', 'Dharma'], shortDesc: 'A spirited dialogue on Ram the king and Ram the husband — and the standard a true leader sets for the people.',
    readTime: '3 min', author: 'Chinmaya Udghosh', image: 'assets/udghosh/article-thumbnails/03.webp', featured: false, published: true
  },
  {
    id: 'udghosh-article-04', title: 'DM – Direct Messages for Life: Education for a Nation', category: 'Chinmaya Udghosh', source: 'DM for Life · Vol 17 | Issue 6',
    tags: ['Vivekananda', 'Education', 'Nation'], shortDesc: 'Excerpts from Swami Vivekananda’s 1894 letter on educating the masses — every word apt 131 years later.',
    readTime: '4 min', author: 'Chinmaya Udghosh', image: 'assets/udghosh/article-thumbnails/04.webp', featured: false, published: true
  },
  {
    id: 'udghosh-article-05', title: 'Personal Has Become Performative', category: 'Chinmaya Udghosh', source: 'Vol 17 | Issue 6',
    tags: ['Social Media', 'Solitude', 'Culture'], shortDesc: 'From temple selfies to recorded rituals — is anything personal anymore, or is it all a performance?',
    readTime: '4 min', author: 'Yashaswini', image: 'assets/udghosh/article-thumbnails/05.webp', featured: false, published: true
  },
  {
    id: 'udghosh-article-06', title: 'India, That is Bharat', category: 'Chinmaya Udghosh', source: 'Readers Write · Vol 16 | Issue 8',
    tags: ['Bharat', 'Heritage', 'Youth'], shortDesc: 'A young reader on coloniality, Macaulay’s shadow, and the choice before the youth who now hold Bharat’s reins.',
    readTime: '4 min', author: 'Adithyan Diwakar Vidya', image: 'assets/udghosh/article-thumbnails/06.webp', featured: false, published: true
  },
  ...Array.from({ length: 4 }, (_, index) => ({
    id: `udghosh-article-${String(index + 7).padStart(2, '0')}`,
    title: `Chinmaya Udghosh Article ${String(index + 7).padStart(2, '0')}`,
    category: 'Chinmaya Udghosh',
    source: 'Chinmaya Udghosh',
    tags: ['Udghosh'],
    shortDesc: 'Article content will be added through the CHYK Content Manager.',
    readTime: '5 min',
    author: 'CHYK',
    image: 'assets/udghosh/arise-awake.webp',
    featured: false,
    published: false
  }))
];
