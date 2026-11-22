// Mogillion batch 13: skin clarity, grooming, styling & designer brands, posture, color analysis, barber terms,
// glow-up routine and -maxxing lingo. Wholesome only: no surgery, drugs/steroids, bone smashing or extreme dieting.
(function () {
  var L = function (s) { return s.split(";").map(function (x) { return x.trim(); }).filter(Boolean); };
  var P = (window.MOGILLION_PROMPTS = window.MOGILLION_PROMPTS || []);
  var add = function (o) {
    ["t75", "t50", "t25", "t10"].forEach(function (k) { if (typeof o[k] === "string") o[k] = L(o[k]); });
    P.push(o);
  };

  add({
    id: "s13-skin-clear", core: true, broad: true, text: "Name something that helps clear up your skin",
    miracle: "Azelaic acid", miracleNote: "Calms redness and breakouts and fades dark marks; dermatologists love it.",
    trap: "Toothpaste", trapNote: "An old myth. It irritates skin more than it helps.",
    t75: "Tretinoin;Centella|Cica;Snail mucin;Green tea;Sulfur;Clay mask;Tea tree oil;Wiping your phone screen;Changing your towel;Gentle cleanser;Non-comedogenic products;Showering after the gym;Ice roller;Omega-3|Fish oil;Mandelic acid;Glycolic acid;Lactic acid;Panthenol;Squalane;Mineral sunscreen;Double cleansing;Zinc;Less dairy",
    t50: "Niacinamide;Clean pillowcase|Changing your pillowcase;Not touching your face;Adapalene|Differin;Pimple patches|Hydrocolloid patches;Exfoliating|Exfoliation;Vitamin C serum|Vitamin C;Ceramides;Hyaluronic acid;Dermatologist|Seeing a dermatologist;Less sugar;Benzoyl peroxide",
    t25: "Sunscreen|SPF;Drinking water|Water;Sleep;Salicylic acid;Retinol",
    t10: "Face wash|Washing your face|Cleanser;Moisturizer",
    notes: { "Tretinoin": "A prescription retinoid, the gold standard for acne.", "Snail mucin": "A K-beauty essence for hydration and repair.", "Niacinamide": "Vitamin B3; helps oil control and redness." }
  });

  add({
    id: "s13-grooming-tool", core: true, broad: true, text: "Name a grooming tool every guy should own",
    miracle: "Boar bristle brush", miracleNote: "Spreads natural oils through your hair for shine.",
    t75: "Straight razor;Wide-tooth comb;Round brush;Ear hair trimmer;Cuticle pusher;Pumice stone;Gua sha;Ice roller;Clipper guards|Guards;Neck duster;Styptic pencil;Magnifying mirror;Foot file;Beard brush;Beard comb;Hair clips;Pick|Afro pick;Durag|Du-rag",
    t50: "Nose hair trimmer|Nose trimmer;Safety razor;Shaving brush;Hairbrush|Brush;Nail file;Eyebrow trimmer;Body groomer;Lint roller;Foil shaver;Clippers|Hair clippers;Electric toothbrush",
    t25: "Comb;Nail clippers;Tweezers;Hair dryer|Blow dryer;Electric shaver",
    t10: "Razor;Trimmer|Beard trimmer",
    notes: { "Styptic pencil": "Stops bleeding from small shaving nicks.", "Gua sha": "A smooth stone used to massage the face." }
  });

  add({
    id: "s13-designer", core: true, broad: true, text: "Name a designer brand guys flex in fit checks",
    miracle: "Enfants Riches Déprimés|Enfants Riches Deprimes|ERD", miracleNote: "A cult LA label with punk-inspired, very expensive pieces.",
    trap: "Shein", trapNote: "Fast fashion, not designer.",
    t75: "Maison Margiela|Margiela;Vetements;Raf Simons;Jacquemus;Our Legacy;Hellstar;Sp5der|Spider;Purple Brand;Rhude;Casablanca;Martine Rose;Wales Bonner;Zegna;Brunello Cucinelli;Loro Piana;Tom Ford;Lanvin;Dries Van Noten;Comme des Garcons|CDG;Issey Miyake;Yohji Yamamoto;Undercover;Kapital;Visvim;Ann Demeulemeester;Thom Browne;Bottega Veneta;Loewe;Celine;Acne Studios;Kenzo;Moschino;Philipp Plein;Golden Goose;Ami Paris|Ami;Represent;Trapstar;Corteiz|Crtz",
    t50: "Dsquared2|Dsquared|D2;Amiri;Rick Owens;Stone Island;Givenchy;Saint Laurent|YSL;Fendi;Chrome Hearts;Gallery Dept;Palm Angels;Fear of God|Essentials;Canada Goose;Hugo Boss|Boss;Armani|Emporio Armani;Dolce & Gabbana|D&G;Balmain;Valentino;Alexander McQueen|McQueen;Bape|A Bathing Ape;Supreme;Hermes",
    t25: "Prada;Balenciaga;Dior;Versace;Off-White;Moncler;Burberry",
    t10: "Gucci;Louis Vuitton|LV",
    notes: { "Dsquared2": "Italian label from Canadian twins, famous for distressed jeans and Icon pieces.", "Amiri": "LA brand known for ripped denim and MA-1 sneakers.", "Chrome Hearts": "Jewellery and streetwear label with gothic crosses." }
  });

  add({
    id: "s13-color-season", core: true, broad: true, text: "Name a season or sub-season in personal color analysis",
    miracle: "Soft Summer", miracleNote: "Muted, cool and gentle: dusty blues, sage, mauve.",
    t75: "Light Spring;Light Summer;Bright Spring|Clear Spring;Bright Winter|Clear Winter",
    t50: "Deep Winter|Dark Winter;Cool Winter|True Winter;Cool Summer|True Summer;Deep Autumn|Dark Autumn;Warm Autumn|True Autumn;Soft Autumn;Warm Spring|True Spring",
    t25: "Autumn|Fall;Spring",
    t10: "Winter;Summer",
    notes: { "Deep Winter": "High contrast: black, white, jewel tones.", "Soft Autumn": "Muted warm shades: olive, camel, rust." }
  });

  add({
    id: "s13-winter-colors", core: true, broad: true, text: "Name a color that looks good on a 'Winter' in color analysis",
    miracle: "Icy violet", miracleNote: "Icy pastels are a Winter's secret weapon: barely-there colour with a cool base.",
    trap: "Orange", trapNote: "Warm orange washes a Winter out.",
    t75: "Cranberry;Ruby;Amethyst;Indigo;Midnight blue;Icy lavender;Icy grey;Cherry red;Pine green;Icy pink;Icy yellow;Cobalt;Teal",
    t50: "Fuchsia;Icy blue|Ice blue;Burgundy;Plum;Sapphire;Magenta;Hot pink;Charcoal",
    t25: "Navy;Royal blue;Emerald;Red|True red;Silver",
    t10: "Black;White",
    notes: { "Icy blue": "A cool, very light blue that brightens high-contrast colouring." }
  });

  add({
    id: "s13-posture", core: true, broad: true, text: "Name an exercise or habit that fixes your posture",
    miracle: "Alexander technique", miracleNote: "A century-old method actors and musicians use to stand taller.",
    trap: "Mewing", trapNote: "That's tongue posture, not body posture.",
    t75: "Y-T-W raises|YTW raises;Prone cobra;Scapular retraction;Child's pose;Couch stretch;Thread the needle;Farmer's carry|Farmers carry;Pull-ups;Swimming;Posture corrector;Sleeping on your back;Lumbar pillow;Walking more;Phone at eye level;Breaks from sitting;Bird dog;Cat-cow",
    t50: "Face pulls;Wall angels;Band pull-aparts;Dead hangs|Hanging;Glute bridges;Supermans|Superman;Doorway stretch|Chest stretch;Pilates;Foam rolling;Lat pulldowns;Reverse flyes|Rear delt flyes;Standing desk;Monitor at eye level;Hip flexor stretch",
    t25: "Planks|Plank;Stretching;Chin tucks|Chin tuck;Deadlifts;Rows;Yoga",
    t10: "Standing up straight|Stand up straight;Shoulders back",
    notes: { "Face pulls": "A cable exercise for rear delts and upper back.", "Wall angels": "Sliding your arms up a wall to open the chest." }
  });

  add({
    id: "s13-barber-terms", core: true, broad: true, text: "Name a term you'd hear at the barbershop",
    miracle: "Scissor over comb|Shear over comb", miracleNote: "The classic technique for a soft, blended taper without clippers.",
    t75: "Point cutting;Razor fade;Shadow fade;Low taper;Disconnected undercut;Textured crop;Ivy League;Caesar;Flat top;Faux hawk;Two block;Eyebrow slit;Hair design|Design;Neckline|Tapered neckline|Squared neckline;Hard part;Thinning;Texturizing|Texture;Bald fade",
    t50: "Drop fade;Burst fade;Temple fade|Temp fade;Scissor cut;Blending|Blend;Guard|Clipper guard|Number 2;Undercut;French crop;Edgar;Side part;Slick back;Mullet;Modern mullet;Curtains|Middle part",
    t25: "Low fade;Mid fade;High fade;Skin fade;Buzz cut;Crew cut;Line up|Shape up|Edge up",
    t10: "Fade;Taper",
    notes: { "Line up": "Crisp edges around the hairline and beard.", "Edgar": "A blunt straight fringe over a high fade." }
  });

  add({
    id: "s13-glowup-30", core: true, broad: true, text: "Name a step in a 30-day glow-up routine",
    miracle: "Tailoring|Tailoring your clothes|Getting clothes tailored", miracleNote: "Getting clothes fitted is the cheapest way to look expensive.",
    trap: "Buying a filter|Filters", trapNote: "Cope. The mirror still knows.",
    t75: "Wake up early;Meditation;Morning sunlight|Sun exposure;Cutting sugar|No sugar;Nail care;Ironing clothes;Learning to style your hair;Beard shaping;Eye cream|Under-eye care;Body wash;Deodorant;Make your bed;Social skills|Socializing;Smile more;Learn a skill;Gratitude;Lip balm;Progress photos|Tracking progress",
    t50: "Walking|10k steps;Cold showers;New wardrobe|Upgrading your wardrobe;Posture;Eyebrows|Grooming your eyebrows;Teeth whitening|Whitening your teeth;Moisturizing|Moisturize;Flossing|Floss;Reading|Read more;Journaling;Less screen time|Less phone;Fragrance|Cologne;Meal prep;Protein;Stretching;Cardio;Cleaning your room",
    t25: "Sleep|Sleeping more;Drinking water|Water;Haircut;Eating healthy|Diet;Sunscreen",
    t10: "Gym|Working out;Skincare",
    notes: { "Progress photos": "Same light, same angle, every week." }
  });

  add({
    id: "s13-maxxing-life", core: true, broad: true, text: "Name a '-maxxing' trend that isn't about your face",
    miracle: "Jestermaxxing", miracleNote: "Leaning into being the funny one: humour as your glow-up.",
    t75: "Lifemaxxing;Bookmaxxing|Readmaxxing;Cookingmaxxing;Dripmaxxing;Grindmaxxing;Studymaxxing;Brainmaxxing;Sunmaxxing;Teethmaxxing;Hairmaxxing;Locationmaxxing;Fraudmaxxing;Confidencemaxxing",
    t50: "Statusmaxxing;Rizzmaxxing;Stylemaxxing|Fashionmaxxing|Fitmaxxing;Smellmaxxing|Fragrancemaxxing;Posturemaxxing;Voicemaxxing;Socialmaxxing;Heightmaxxing;Hydromaxxing|Hydratemaxxing",
    t25: "Moneymaxxing;Skinmaxxing;Auramaxxing",
    t10: "Gymmaxxing;Sleepmaxxing",
    notes: { "Fraudmaxxing": "Looking better through tricks: lighting, angles, fits.", "Statusmaxxing": "Boosting status through money, clout or achievements." }
  });

  add({
    id: "s13-skincare-brand", core: true, broad: true, text: "Name a skincare brand",
    miracle: "Isntree", miracleNote: "A Korean brand loved for its gentle hyaluronic and sunscreen lines.",
    t75: "Torriden;Purito;Medicube;Dr. Jart+|Dr Jart;Byoma;Bubble;Youth to the People;Sunday Riley;Glow Recipe;Krave Beauty;Haruharu Wonder;SkinCeuticals;Obagi;EltaMD;Supergoop;Altruist;Naturium;The Inkey List|Inkey List;Mario Badescu;First Aid Beauty;Origins;Fresh;Shiseido;SK-II;Dermalogica;Avene;Embryolisse;Murad;Proactiv",
    t50: "Cosrx;Kiehl's|Kiehls;Olay;Aveeno;Vanicream;Bioderma;Eucerin;Glossier;Drunk Elephant;Tatcha;Laneige;Beauty of Joseon;Anua;Skin1004;Round Lab;Some By Mi;Innisfree;Garnier;Bulldog;Jack Black;Lab Series;Clearasil;Differin",
    t25: "La Roche-Posay|La Roche Posay;The Ordinary;Neutrogena;Clinique;Nivea;Paula's Choice|Paulas Choice",
    t10: "CeraVe;Cetaphil",
    notes: { "Beauty of Joseon": "Korean brand famous for its rice sunscreen.", "The Ordinary": "Budget single-ingredient serums." }
  });
})();
