// Mogillion batch 11: everyday glow-up, barber, skin, gym-bag, grooming and gigachad trivia (16 new prompts)
(function () {
  var L = function (s) { return s.split(";").map(function (x) { return x.trim(); }).filter(Boolean); };
  var P = (window.MOGILLION_PROMPTS = window.MOGILLION_PROMPTS || []);
  var add = function (o) {
    ["t75", "t50", "t25", "t10"].forEach(function (k) { if (typeof o[k] === "string") o[k] = L(o[k]); });
    var nk = function (s) { var n = String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/^(the|a|an) /, ""); return n.length > 3 && n.slice(-1) === "s" && n.slice(-2) !== "ss" ? n.slice(0, -1) : n; };
    var seen = {};
    var take = function (entry) {
      var al = String(entry).split("|").filter(function (a) { var k = nk(a); if (!k || seen[k]) return false; seen[k] = 1; return true; });
      return al.join("|");
    };
    o.miracle = take(o.miracle); if (o.trap) o.trap = take(o.trap);
    ["t75", "t10", "t50", "t25"].forEach(function (k) { o[k] = o[k].map(take).filter(Boolean); });
    P.push(o);
  };

  add({
    id: "s11-summer-glowup", broad: true, text: "Name something people do to glow up before summer",
    miracle: "Teeth whitening|Whitening strips|Whiten teeth", miracleNote: "Whitening strips are a cheap, popular pre-summer smile upgrade.",
    trap: "Move to the beach", trapNote: "Too clever. Not really a routine.",
    t75: "Dental cleaning|Teeth cleaning;Brow shaping|Get brows done;Lip scrub;Body exfoliation|Body scrub;Fix sleep schedule|Sleep schedule;Summer fragrance|New fragrance",
    t50: "Haircut|Fresh haircut|Get a haircut;Skincare routine|Skincare;Sunscreen|SPF;Hydrate|Drink water;Exfoliate;Moisturize;Walking|Walk;Running|Run|Jogging;Swimming|Swim;New fits|New clothes|New wardrobe|Shopping;Tan|Get a tan|Self tanner;Trim beard|Beard trim;Shave;Dye hair|Bleach hair;Sleep|Get more sleep;Eat healthy|Eat clean;Cut sugar;New sunglasses|Sunglasses;New sneakers|Sneakers;Fix posture|Posture;Stretching|Stretch;Cardio;Lifting|Lift|Weights;Pilates;Yoga;Face mask|Sheet mask;Facial|Get a facial;Manicure|Nails;Lip balm|Moisturize lips",
    t25: "Gym|Go to the gym|Workout|Work out;Diet;Get fit|Get in shape;Build muscle;Abs|Get abs;Lose weight;Glow up;Level up;Lock in|Locked in;Wash face|Face wash|Cleanser;Cologne|Fragrance|Perfume;Dermatologist;Contacts|New glasses;Touch grass|Go outside;Vitamin D|Get sun;Face yoga;Gua sha;Eat fruit|Fruit;Protein;Smoothies|Smoothie;Cut soda|No soda",
    t10: "Gym;Skincare;Haircut",
    notes: {
      "Teeth whitening": "Whitening strips or toothpaste brighten the smile, a favorite pre-summer step on TikTok.",
      "Dental cleaning": "A dentist cleaning removes stains and plaque for a fresher smile.",
      "Brow shaping": "Tidying brows frames the eyes in photos.",
      "Lip scrub": "Gentle exfoliation for smoother lips.",
      "Sunscreen": "SPF is the top-recommended skincare step in summer."
    }
  });

  add({
    id: "s11-barber-term", broad: true, text: "Name a word you'd hear in a barbershop",
    miracle: "Taper|Taper fade", miracleNote: "Hair gets gradually shorter toward the neck and ears; one of the most-requested cuts on TikTok.",
    trap: "Tip", trapNote: "Polite, but not barber lingo.",
    t75: "Skin fade|Bald fade;Line up|Lineup|Edge up|Edge-up|Shape up;Blend|Blending;Guard|Clipper guard;Texture|Texturizing;Burst fade",
    t50: "Fade|Low fade|Mid fade|High fade|Drop fade;Buzz cut|Buzz;Crew cut;Undercut;Pompadour;Quiff;Fringe;Bangs;Side part|Part|Middle part;Comb over|Comb-over;Crop|French crop|Textured crop;Mullet;Curtains;Flow;Slick back|Slicked back;Layers;Scissors|Shears;Clippers|Clipper;Trimmer|Trimmers;Straight razor|Razor;Hot towel;Neckline|Neck shave;Beard trim;Sideburns;Temple fade|Temple;Nape;Cowlick;Cape;Barber pole;Appointment;Pomade;Clay;Hairspray;Sea salt spray",
    t25: "Haircut|Cut;Barber|Barber chair;Chair;Mirror;Hair gel|Gel;Wax;Aftershave;Shave|Shaving;Beard;Mustache|Moustache;Short on the sides|Short sides;Long on top;Number 1|Number one;Number 2|Number two;Number 3;Number 4;Brush;Comb;Blow dry|Hairdryer;Towel;Spray bottle;Neck duster;Wahl;Andis;Oster;Scalp;Hairline;Beard oil",
    t10: "Fade;Haircut;Clippers;Trim",
    notes: {
      "Taper": "Hair tapers gradually shorter toward the neckline and ears, usually with a longer top.",
      "Skin fade": "A fade that goes down to bare skin, also called a bald fade.",
      "Line up": "Crisp edges cut along the hairline and temples with a trimmer.",
      "Blend": "Smooth transition between hair lengths with no hard lines.",
      "Burst fade": "A fade curved around the ear that stays longer at the nape.",
      "Texture": "Cutting to add messy, separated movement, popular in crops."
    }
  });

  add({
    id: "s11-barber-ask", broad: true, text: "Name a haircut guys on TikTok ask the barber for",
    miracle: "Two block|Two-block|Two block cut", miracleNote: "A Korean-origin cut with short sides and back and a longer top, huge with young guys.",
    trap: "A bald head", trapNote: "Technically a haircut, but nobody screenshots it.",
    t75: "Edgar cut|Edgar;Broccoli cut|Broccoli;Burst fade;Wolf cut;Comma hair|Comma cut;Textured fringe",
    t50: "Taper fade|Taper|Low taper|Mid taper|Low taper fade;Skin fade|Bald fade;Mid fade;Low fade;High fade;Drop fade;Textured crop|Crop|French crop;Buzz cut|Buzzcut;Crew cut;Curtains|Curtain hair|Curtain bangs;Middle part|Mid part|Center part;Side part;Mullet;Slick back|Slicked back;Pompadour;Quiff;Undercut;Flow|Flow cut;Long hair|Shoulder length;Afro;Waves|360 waves;Twists|Twist;Braids|Cornrows;Dreads|Dreadlocks|Locs;Caesar|Caesar cut;Ivy league;Short back and sides",
    t25: "Fade|Fade haircut;Buzz;Trim;Haircut;Short hair;Faded sides;Messy hair;Spiky hair|Spikes;Bowl cut;Man bun|Topknot;Ponytail;Shaved head|Bald;Line up|Lineup;Edge up;Shape up;Layered cut|Layers;Bangs;Bed head;Brushed back|Swept back;Natural hair;Perm;Blowout|Blow out;High top|Hi top",
    t10: "Fade;Buzz cut;Taper fade;Mid fade",
    notes: {
      "Two block": "A Korean-origin cut with a longer top over very short sides and back.",
      "Edgar cut": "A very short fringe cut straight across the forehead with faded sides, popular on TikTok.",
      "Broccoli cut": "A curly, messy top with faded sides, named for its shape.",
      "Burst fade": "A fade that curves around the ear into a longer nape.",
      "Wolf cut": "Shaggy layers that mix a shag and a mullet.",
      "Comma hair": "A Korean style with a curled fringe shaped like a comma."
    }
  });

  add({
    id: "s11-skin-ingredient", broad: true, text: "Name a skincare ingredient",
    miracle: "Peptides|Peptide", miracleNote: "Short chains of amino acids used in serums and moisturizers for firm-looking skin.",
    trap: "Water", trapNote: "It's in everything, but nobody hypes it as an ingredient.",
    t75: "Ceramides|Ceramide;Centella asiatica|Cica|Centella;Azelaic acid;Squalane|Squalene;Bakuchiol;Panthenol|Vitamin B5;Tranexamic acid;Allantoin;Zinc oxide",
    t50: "Hyaluronic acid|Hyaluronic;Niacinamide|Vitamin B3;Retinol|Retinoid|Retinal;Vitamin C|Ascorbic acid;Salicylic acid|BHA;Glycolic acid|AHA;Lactic acid;Benzoyl peroxide;Aloe vera|Aloe;Glycerin;Snail mucin|Snail;Shea butter;Jojoba oil|Jojoba;Rosehip oil;Vitamin E;Green tea|Green tea extract;Mandelic acid;Kojic acid;Licorice root;Honey|Manuka honey;Collagen;Sulfur;Kaolin clay|Clay;Colloidal oatmeal|Oat;Caffeine;Titanium dioxide;Adapalene;Tea tree oil",
    t25: "SPF|Sunscreen;Moisturizer;Cleanser;Toner;Serum;Oil;Vitamin A;Coconut oil;Argan oil;Cucumber;Rose water|Rosewater;Witch hazel;Petroleum jelly|Vaseline;Beeswax;Probiotics;Ferulic acid;Resveratrol;Charcoal|Activated charcoal",
    t10: "Retinol;Vitamin C;Hyaluronic acid;Salicylic acid;Niacinamide",
    notes: {
      "Peptides": "Short amino acid chains used in creams and serums to support firm-looking skin.",
      "Ceramides": "Fats that help the skin barrier hold in moisture; CeraVe is named after them.",
      "Centella asiatica": "A leafy plant (cica) used in K-beauty to calm skin.",
      "Azelaic acid": "A gentle acid used for redness and blemishes.",
      "Squalane": "A lightweight moisturizing oil.",
      "Bakuchiol": "A plant-based alternative to retinol.",
      "Panthenol": "Vitamin B5, a soothing moisturizing ingredient.",
      "Niacinamide": "Vitamin B3, a TikTok favorite for oily skin and pores."
    }
  });

  add({
    id: "s11-skin-habit-bad", broad: true, text: "Name a habit that hurts your skin",
    miracle: "Sleeping in makeup|Not removing makeup|Sleeping with makeup on", miracleNote: "Makeup left on overnight can clog pores and cause breakouts.",
    trap: "Looking in the mirror", trapNote: "Too clever. The mirror doesn't hurt anyone.",
    t75: "Dirty pillowcase|Dirty pillowcases;Over-exfoliating|Overexfoliating|Exfoliating too much;Over-washing face|Washing face too much;Hot showers;Sharing towels;Picking scabs",
    t50: "Popping pimples|Popping zits|Pimple popping;Picking at your face|Skin picking|Picking;Touching your face|Touching face;Skipping sunscreen|No sunscreen;Tanning beds|Tanning bed;Sunburn|Sun damage;Dehydration|Not drinking water;Lack of sleep|Not sleeping;Too much sugar|Sugar;Smoking|Vaping;Stress;Dirty phone screen|Dirty phone;Dirty hands;Harsh scrubs|Scrubbing too hard;Skipping moisturizer;Too many products;Not washing face;Dirty makeup brushes;Old towels|Dirty towels;Sweating without showering;Sleeping on your face",
    t25: "Junk food|Greasy food|Fast food;Dairy;Alcohol;Soda|Soft drinks;Skipping skincare|No skincare;Not exercising;Dirty sheets;Late nights|Staying up late;Scratching;Bar soap|Using bar soap on face;Energy drinks;Hot water",
    t10: "Popping pimples;Not sleeping;Touching your face;Skipping sunscreen",
    notes: {
      "Sleeping in makeup": "Leaving makeup on overnight can clog pores.",
      "Dirty pillowcase": "Oil and dirt build up on pillowcases and can transfer to your face.",
      "Over-exfoliating": "Scrubbing or using acids too often can damage the skin barrier.",
      "Popping pimples": "Dermatologists say popping can cause scarring and spread bacteria."
    }
  });

  add({
    id: "s11-clear-skin-food", broad: true, text: "Name a food people say is good for clear skin",
    miracle: "Salmon", miracleNote: "Fatty fish rich in omega-3s, often named in skin-friendly diet videos.",
    trap: "Face cream", trapNote: "You don't eat it.",
    t75: "Sweet potato;Walnuts|Walnut;Chia seeds|Chia;Flaxseed|Flax seeds;Pumpkin seeds;Kefir;Tomatoes|Tomato;Dark chocolate",
    t50: "Avocado;Blueberries|Blueberry|Berries|Berry;Spinach|Leafy greens|Greens;Kale;Broccoli;Carrots|Carrot;Oranges|Orange|Citrus;Strawberries|Strawberry;Almonds|Almond|Nuts;Eggs|Egg;Greek yogurt|Yogurt;Mackerel;Sardines|Sardine;Tuna;Oatmeal|Oats;Quinoa;Lentils;Beans;Cucumber;Watermelon;Papaya;Mango;Kiwi;Bell peppers|Bell pepper|Peppers;Olive oil;Turmeric;Garlic;Mushrooms;Pomegranate;Apples|Apple;Bananas|Banana;Kimchi;Tofu;Edamame;Green tea",
    t25: "Water|Drinking water;Vegetables|Veggies;Fruit|Fruits;Fish|Seafood;Chicken;Salad;Fiber;Herbal tea|Tea;Coconut water;Smoothie|Smoothies;Green juice|Juice;Seeds;Cheese;Rice;Pineapple;Grapes|Grape;Cherries|Cherry",
    t10: "Water;Fruit;Vegetables;Salmon",
    notes: {
      "Salmon": "Rich in omega-3 fatty acids, linked to healthy-looking skin.",
      "Sweet potato": "Packed with beta-carotene, which the body turns into vitamin A.",
      "Walnuts": "A nut with plant omega-3s and vitamin E.",
      "Kefir": "A fermented drink with probiotics, popular in gut-skin videos.",
      "Avocado": "Full of healthy fats and vitamin E."
    }
  });

  add({
    id: "s11-water-bottle", broad: true, text: "Name a water bottle brand teens carry",
    miracle: "Owala", miracleNote: "Known for the FreeSip lid with a built-in straw, a huge back-to-school trend.",
    trap: "Plastic cup", trapNote: "A cup is not a bottle brand.",
    t75: "Simple Modern;Contigo;Takeya;Iron Flask|IronFlask;HydroJug|Hydro Jug;Thermos;Brita",
    t50: "Stanley|Stanley cup|Stanley Quencher;Hydro Flask|Hydroflask;Yeti|Yeti Rambler;Nalgene;CamelBak|Camelbak;Klean Kanteen;S'well|Swell;Hydrapak;Corkcicle;Tervis;Larq;Cirkul;Under Armour;Nike;Gatorade",
    t25: "Dasani;Aquafina;Fiji|Fiji water;Smartwater;Evian;Voss;Poland Spring;Core;Liquid Death;Powerade;Body Armor|BodyArmor;Prime;Perrier;Blender Bottle|BlenderBottle;Shaker",
    t10: "Stanley;Hydro Flask;Yeti;Nalgene",
    notes: {
      "Owala": "Its FreeSip lid lets you sip through a straw or tip it to chug.",
      "Stanley": "The Quencher tumbler became a viral TikTok trend.",
      "Hydro Flask": "The 2010s VSCO-era favorite, still hugely popular.",
      "Nalgene": "Classic wide-mouth bottle seen on school backpacks and trails.",
      "Simple Modern": "A bottle brand popular with students for colorful tumblers."
    }
  });

  add({
    id: "s11-deodorant", broad: true, text: "Name a deodorant or body spray brand",
    miracle: "Dr. Squatch|Dr Squatch", miracleNote: "A natural soap and deodorant brand known for its viral online ads.",
    trap: "Cologne", trapNote: "A fragrance category, not a deodorant brand.",
    t75: "Native;Lume;Tom's of Maine|Toms of Maine;Hume;Schmidt's|Schmidts;Harry's|Harrys;Brut",
    t50: "Old Spice;Axe|Lynx;Dove|Dove Men+Care;Degree;Secret;Speed Stick;Right Guard;Gillette;Nivea|Nivea Men;Arm and Hammer|Arm & Hammer;Sure;Mitchum;Suave;Rexona;Certain Dri;Bath and Body Works|Bath & Body Works;Victoria's Secret|Victorias Secret;Sol de Janeiro;Dossier;Every Man Jack;Hims",
    t25: "Cologne;Perfume;Body wash;Body spray;Aftershave;Roll-on;Antiperspirant;Soap;Lotion;Dial;Irish Spring;Head and Shoulders|Head & Shoulders;Aveeno;Neutrogena;Cetaphil;Vaseline;Colgate;Crest;Listerine",
    t10: "Old Spice;Axe;Dove;Degree",
    notes: {
      "Dr. Squatch": "Natural men's grooming brand famous for humorous ads.",
      "Axe": "Called Lynx in the UK; a long-running body spray brand for teens.",
      "Old Spice": "Classic men's deodorant and body wash brand since 1938.",
      "Native": "A deodorant brand marketed as aluminum-free.",
      "Lume": "Deodorant brand that markets whole-body use."
    }
  });

  add({
    id: "s11-gigachad-person", broad: true, text: "Name a real person people online call a gigachad",
    miracle: "Chris Bumstead|CBum|Cbum", miracleNote: "Five-time Mr. Olympia Classic Physique champion, loved on TikTok for his aesthetic physique.",
    trap: "Your dad", trapNote: "Cute, but not a famous person.",
    t75: "Ronnie Coleman;Arnold Schwarzenegger|Arnold;Mike O'Hearn|Mike Ohearn;Brian Shaw;Eddie Hall;Hafthor Bjornsson|Thor Bjornsson|The Mountain;Ernest Khalimov",
    t50: "Cristiano Ronaldo|Ronaldo|CR7;Henry Cavill;Chris Hemsworth;Dwayne Johnson|The Rock;Jason Momoa;Brad Pitt;Zac Efron;Ryan Reynolds;Idris Elba;Michael B. Jordan|Michael B Jordan;Chris Evans;Chris Pratt;Hugh Jackman;Joe Manganiello;Tom Cruise;Jon Jones;Conor McGregor;Khabib Nurmagomedov|Khabib;Mike Tyson;Muhammad Ali;Lionel Messi|Messi;Kylian Mbappe|Mbappe;Erling Haaland|Haaland;David Beckham|Beckham;Zlatan Ibrahimovic|Zlatan;LeBron James|LeBron|Lebron;Michael Jordan;Kobe Bryant|Kobe;Giannis Antetokounmpo|Giannis;Keanu Reeves;Cillian Murphy;Timothee Chalamet",
    t25: "Chad;Gigachad meme|Gigachad;Giga Chad;Gandalf;Thor;Batman;Superman;Spider-Man|Spiderman;Iron Man|Tony Stark;Captain America;John Wick;James Bond|Bond;Goku;Saitama;Thanos;Walter White;Tommy Shelby|Thomas Shelby;Morgan Freeman;Samuel L Jackson;Vin Diesel;Jason Statham|Statham;Sylvester Stallone|Stallone;Bruce Lee;Jackie Chan",
    t10: "Cristiano Ronaldo;Chris Bumstead;The Rock;Arnold Schwarzenegger",
    notes: {
      "Chris Bumstead": "Canadian bodybuilder and five-time Mr. Olympia Classic Physique champion.",
      "Ronnie Coleman": "Eight-time Mr. Olympia, famous for 'Lightweight baby!'.",
      "Arnold Schwarzenegger": "Seven-time Mr. Olympia and actor, the classic gym icon.",
      "Brian Shaw": "Strongman and four-time World's Strongest Man.",
      "Ernest Khalimov": "The model whose photo became the original Gigachad meme.",
      "Cristiano Ronaldo": "Footballer famous for his fitness and physique."
    }
  });

  add({
    id: "s11-wardrobe-staple", broad: true, text: "Name a wardrobe staple that's always in style",
    miracle: "White tee|White t-shirt|White tshirt", miracleNote: "A clean white tee goes with everything and starts most fit checks.",
    trap: "Pajamas", trapNote: "Comfy, but not a staple for going out.",
    t75: "Black belt|Leather belt;Chelsea boots|Chelsea boot;Oxford shirt|Oxford button down;Chinos|Chino;Trench coat|Trench;Pea coat|Peacoat;Henley",
    t50: "Jeans|Blue jeans|Denim jeans;Black jeans;Black tee|Black t-shirt;Hoodie|Plain hoodie;Sweatshirt|Crewneck;Button up|Button-up|Button down|Button-down;Polo|Polo shirt;Blazer;Leather jacket;Denim jacket|Jean jacket;Bomber jacket|Bomber;Puffer jacket|Puffer;Overcoat|Long coat;Cardigan;Turtleneck;Sweater|Knit sweater|Jumper;Cargo pants|Cargos;Dress pants|Slacks|Trousers;Sweatpants|Joggers;White sneakers|White trainers;Boots;Loafers;Watch;Sunglasses|Aviators;Cap|Baseball cap;Beanie;Scarf;Tank top;Shorts;Dress shoes",
    t25: "T-shirt|Tee|Shirt;Pants;Shoes|Sneakers|Trainers;Jacket;Coat;Little black dress|LBD|Dress;Skirt;Leggings;Chain|Necklace|Jewelry;Ring;Bracelet;Wallet;Backpack|Bag;Tracksuit|Sweats;Flip flops|Sandals;Slides;Hat;Gloves;Tie|Necktie;Suit|Black suit|Navy suit;Vest;Jersey;Fleece;Windbreaker;Raincoat",
    t10: "Jeans;T-shirt;Hoodie;Sneakers",
    notes: {
      "White tee": "A well-fitting white tee works with jeans, trousers or a jacket.",
      "Chelsea boots": "Slip-on ankle boots with elastic sides that dress up any look.",
      "Oxford shirt": "A classic button-down that works dressed up or casual.",
      "Chinos": "Smart-casual cotton trousers, a menswear basic.",
      "Henley": "A collarless shirt with a short button placket."
    }
  });

  add({
    id: "s11-gym-bag", broad: true, text: "Name something every gym bag has",
    miracle: "Lifting straps|Wrist straps|Straps", miracleNote: "Straps wrap the wrist and bar to help grip on heavy pulls like deadlifts.",
    trap: "A bed", trapNote: "Too clever, and it won't fit.",
    t75: "Lifting gloves|Gym gloves|Gloves;Resistance bands|Resistance band|Bands;Wrist wraps|Wrist wrap;Lifting belt|Belt;Chalk|Liquid chalk;Lacrosse ball|Massage ball;Knee sleeves|Knee sleeve;Foam roller",
    t50: "Water bottle|Bottle|Shaker bottle|Shaker;Towel|Gym towel|Small towel;Headphones|Earbuds|AirPods|Earphones;Deodorant;Protein powder|Protein;Pre-workout|Preworkout;Creatine;Spare shirt|Extra shirt|Change of clothes|Spare clothes;Shorts|Gym shorts;Socks|Extra socks;Sneakers|Gym shoes|Trainers;Lock|Padlock;Phone charger|Charger;Wallet;Headband;Wristbands|Sweatbands;Notebook|Workout journal|Journal;Protein bar|Snack|Snacks|Banana;Hoodie;Flip flops|Slides|Shower shoes;Shampoo|Body wash|Soap;Jump rope|Skipping rope;Cap|Hat;Lip balm|Chapstick;Hand sanitizer|Sanitizer;Mouthguard",
    t25: "Gym clothes|Clothes|Workout clothes;Shirt|T-shirt|Tank top|Tank;Joggers|Sweatpants|Leggings|Pants;Shoes;Hair ties|Hair tie|Scrunchie;Comb|Hairbrush|Brush;Cologne|Perfume|Body spray;Razor;Band-Aids|Plasters|Bandaids;Ibuprofen|Painkillers;Wet wipes|Wipes|Tissues;Gym card|Membership card|Key fob;Keys;Pen|Pencil;Athletic tape|Tape;Ice pack;Electrolytes;Energy drink;Watch|Smartwatch|Fitness tracker;Speaker;Dumbbells|Weights",
    t10: "Water bottle;Towel;Headphones;Deodorant",
    notes: {
      "Lifting straps": "Cloth loops that secure your wrists to the bar to help grip.",
      "Lifting gloves": "Padded gloves that protect the hands from calluses.",
      "Resistance bands": "Stretchy loops or tubes used for warm-ups and extra tension.",
      "Wrist wraps": "Support wraps that keep the wrists stable on pressing moves.",
      "Lifting belt": "A stiff belt worn on heavy squats and deadlifts to brace the core.",
      "Chalk": "Magnesium carbonate that dries sweaty hands for a better grip."
    }
  });

  add({
    id: "s11-skipped-muscle", broad: true, text: "Name a body part people skip at the gym",
    miracle: "Calves|Calf", miracleNote: "A classic skipped muscle, though calf raises are simple to add to any leg day.",
    trap: "Hair", trapNote: "Not a muscle.",
    t75: "Forearms|Forearm;Rear delts|Rear delt|Rear deltoids;Traps|Trap|Trapezius;Neck;Lower back;Hamstrings|Hamstring;Glutes|Glute;Rotator cuff;Tibialis|Shins",
    t50: "Legs|Leg day|Leg;Quads|Quad|Quadriceps;Abs|Core|Abdominals;Obliques|Oblique;Back|Upper back;Lats|Lat;Shoulders|Shoulder|Delts|Deltoids;Biceps|Bicep;Triceps|Tricep;Chest|Pecs|Pectorals;Hip flexors|Hip flexor|Hips;Adductors|Inner thighs;Abductors|Outer thighs;Wrists|Wrist;Feet|Foot;Ankles|Ankle;Hands|Hand;Serratus;Rhomboids|Rhomboid;Lower abs;Upper chest|Upper pecs;Side delts|Lateral delts;Soleus;Spinal erectors|Erectors",
    t25: "Arms|Arm;Cardio;Stretching|Mobility|Flexibility;Warm-up|Warm up;Balance;Grip|Grip strength;Lower body|Lower half;Upper body;Full body;Thighs|Thigh;Butt|Booty|Glute;Waist;Stomach|Belly;Jaw|Jawline;Face;Knees|Knee;Elbows|Elbow;Joints|Joint",
    t10: "Legs;Calves;Abs;Back",
    notes: {
      "Calves": "Small, stubborn muscles at the back of the lower leg; standing and seated calf raises train them.",
      "Forearms": "Used in every grip move; wrist curls and farmer's carries train them.",
      "Rear delts": "The back of the shoulder; face pulls and reverse flyes train them.",
      "Traps": "The upper-back muscles; shrugs train them.",
      "Neck": "Neck training improves posture and stability.",
      "Tibialis": "The muscle along the front of the shin."
    }
  });

  add({
    id: "s11-protein-food", broad: true, text: "Name a high-protein food gym guys eat",
    miracle: "Cottage cheese", miracleNote: "About 12 to 14 grams of protein per half cup; it blew up on TikTok as a high-protein base.",
    trap: "Protein shake", trapNote: "A drink, not a food, so a loophole answer.",
    t75: "Skyr;Edamame;Tempeh;Seitan;Lentils|Lentil;Bison|Venison;Cod;Egg whites|Egg white",
    t50: "Chicken breast|Chicken;Greek yogurt|Yogurt;Eggs|Egg;Steak|Beef;Salmon;Tuna;Turkey|Ground turkey;Tofu;Beans|Black beans;Peanut butter;Almonds|Nuts;Shrimp;Cheese;Milk;Oats|Oatmeal;Quinoa;Chickpeas|Hummus;Pork chops|Pork;Bacon;Sardines;Beef jerky|Jerky;Protein bar|Bar;Protein pancakes;Tilapia;Trout;Lamb;Mozzarella;Whey|Whey protein;Ground beef|Lean beef;Crab;Lobster;Scallops;Sausage;Ham;Deli meat",
    t25: "Rice;Pasta;Bread;Potatoes|Potato;Broccoli;Spinach;Peas;Avocado;Banana;Fruit;Vegetables|Veggies;Burger|Hamburger;Pizza;Burrito;Chicken nuggets|Nuggets;Hot dog;Tacos|Taco;Wrap|Chicken wrap;Fish;Seafood;Meat;Protein shake|Protein powder|Shake;Chicken and rice|Rice and chicken",
    t10: "Chicken;Eggs;Chicken breast;Steak",
    notes: {
      "Cottage cheese": "A creamy high-protein dairy food that went viral in bowls, dips and wraps.",
      "Skyr": "A thick Icelandic cultured dairy product, similar to strained yogurt.",
      "Edamame": "Young soybeans, a plant source with all essential amino acids.",
      "Tempeh": "A firm fermented soybean cake.",
      "Seitan": "A chewy plant protein made from wheat gluten."
    }
  });

  add({
    id: "s11-grooming-kit", broad: true, text: "Name something in a guy's grooming kit",
    miracle: "Nose hair trimmer|Nose trimmer|Nose hair clipper", miracleNote: "A small trimmer for stray nose hair, the part of the kit most guys forget.",
    trap: "A crown", trapNote: "Too clever. Not grooming gear.",
    t75: "Beard oil;Beard balm;Beard comb|Beard brush;Cuticle clippers|Cuticle trimmer;Tweezers|Tweezer;Brow razor|Eyebrow razor|Eyebrow trimmer;Lip balm|Chapstick",
    t50: "Razor|Safety razor|Disposable razor;Beard trimmer|Hair trimmer|Trimmer|Clippers;Electric shaver|Shaver;Shaving cream|Shaving gel|Shave foam;Aftershave|After shave;Comb|Hair comb;Hairbrush|Brush;Hair clay|Clay;Pomade;Hair gel|Gel;Hair spray|Hairspray;Hair wax|Wax;Cologne|Fragrance|Perfume;Deodorant;Face wash|Cleanser;Moisturizer|Face moisturizer;Sunscreen|SPF;Nail clippers|Nail clipper;Nail file;Toothbrush;Toothpaste;Floss;Mouthwash;Hand lotion|Lotion;Body wash;Shampoo;Conditioner;Hairdryer|Hair dryer|Blow dryer;Hand mirror|Mirror;Toiletry bag|Dopp kit;Styptic pencil;Scissors|Beard scissors;Cotton pads|Cotton swabs|Q-tips",
    t25: "Soap;Lint roller;Pimple patches|Acne patches;Face mask|Sheet mask;Exfoliator|Scrub;Eye cream;Serum;Toner;Gua sha;Jade roller;Eye patches|Under eye patches;Cotton balls;Wet wipes|Wipes;Hand cream;Shower gel;Loofah|Sponge;Hair oil;Hair mask;Biotin;Dry shampoo;Hair straightener|Straightener;Curling iron;Concealer",
    t10: "Razor;Comb;Deodorant;Cologne",
    notes: {
      "Nose hair trimmer": "A small rotating-blade trimmer for stray nose hair.",
      "Beard oil": "Softens beard hair and the skin underneath.",
      "Beard balm": "A thicker conditioner that also gives light hold.",
      "Cuticle clippers": "Small nippers for trimming dry skin around the nails.",
      "Tweezers": "Used for stray brow hairs and ingrown hairs.",
      "Brow razor": "A tiny razor for tidying stray brow edges."
    }
  });

  add({
    id: "s11-mirror-check", broad: true, text: "Name something guys check in the mirror before leaving the house",
    miracle: "Collar|Shirt collar", miracleNote: "A flipped or crooked collar is an easy fix that makes a fit look sharper.",
    trap: "The mirror itself", trapNote: "Too clever.",
    t75: "Teeth|Smile;Nose hairs;Eyebrows|Brows;Part|Hair part|Hairline;Sideburns;Back of hair|Back of head;Lint|Lint on clothes;Zipper|Fly",
    t50: "Hair|Haircut;Outfit|Fit|Fits|Clothes;Face|Skin;Jawline|Jaw;Beard|Stubble|Facial hair;Shoes|Sneakers;Posture;Shirt wrinkles|Wrinkles|Shirt;Pants|Trousers;Belt;Socks;Breath|Bad breath;Acne|Pimples|Pimple|Zits;Edges|Edge up|Line up;Fade|Fade lines;Waves|Curls;Watch;Chain|Chains|Jewelry;Ears;Eye bags|Eyes;Chapped lips|Lips;Neck;Shoulders;Muscles|Physique|Gains|Abs|Flex;Side profile|Profile;Angles|Good angle|Best angle;Tuck|Shirt tuck;Sleeves|Sleeve length;Hat;Hoodie;Jacket",
    t25: "Look|Looks;Body;Height;Nails|Fingernails;Selfie;Phone;Wallet;Keys;Confidence;Aura;Rizz;Style;Vibe;Backpack|Bag;Glasses|Sunglasses;Contacts;Earrings|Piercings;Tattoo|Tattoos;Cologne|Perfume;Makeup;Scar|Scars;Hair gel|Hair product|Gel;Hairdryer|Hair dryer;Mewing|Tongue posture;Eyelashes|Lashes;Shoelaces|Laces",
    t10: "Hair;Outfit;Face;Fit",
    notes: {
      "Collar": "A flipped or tucked-in collar looks messy; a quick fix before leaving.",
      "Hairline": "Many teens check that their lineup and hairline look clean.",
      "Lint": "A lint roller removes fuzz that shows on dark clothes.",
      "Teeth": "A quick smile check for food stuck between teeth."
    }
  });

  add({
    id: "s11-fitness-app", broad: true, text: "Name a fitness or workout tracking app",
    miracle: "Hevy", miracleNote: "A popular free-to-start lifting log app used by gym TikTok.",
    trap: "Notes app", trapNote: "Many lifters do log there, but it's not a fitness app.",
    t75: "Fitbod;Strong;JEFIT;Liftosaur;Whoop;Oura;Peloton;Nike Training Club|NTC",
    t50: "Strava;MyFitnessPal|My Fitness Pal;Apple Fitness|Apple Fitness+|Fitness;Fitbit;Garmin Connect|Garmin;Samsung Health;Google Fit;Nike Run Club|NRC;Peloton;Centr;Freeletics;Fitness Blender|FitnessBlender;Sweat;Future;Noom;Lose It|Lose It!;Cronometer;Fitness AI;Alo Moves;Down Dog;Headspace;Calm;Map My Run|MapMyRun;Runkeeper;Zwift;Couch to 5K|C25K;Apple Health|Health;StrongLifts|StrongLifts 5x5;Stronger by Science;Hevy Coach;BodyFit;Gymshark Training|Gymshark;Planet Fitness|PF app;Anytime Fitness;Gold's Gym|Golds Gym",
    t25: "YouTube;Notes|Notes app;Timer|Stopwatch;Pokemon Go|Pokemon GO;Zombies Run|Zombies, Run!;Spreadsheet|Excel|Google Sheets",
    t10: "Strava;MyFitnessPal;Fitbit;Apple Fitness",
    notes: {
      "Hevy": "A workout logger for tracking sets, reps and progress.",
      "Fitbod": "An app that builds lifting plans from your logged workouts.",
      "Strong": "A minimalist lifting tracker used for sets and reps.",
      "Strava": "A social app for logging runs and rides.",
      "Whoop": "A wearable band that tracks recovery, strain and sleep."
    }
  });
})();
