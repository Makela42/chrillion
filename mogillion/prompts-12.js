// Mogillion batch 12: looksmax-scene culture (streamers, platforms, memes, chat terms), style and glow-up (14 new prompts)
// Safety: no surgery, drugs/steroids/peptides, bone smashing, extreme dieting or incel/blackpill vocabulary. Real people are trivia only.
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
    id: "s12-streamer", broad: true, text: "Name a grooming, skincare, style or fitness creator guys watch for glow-up tips",
    miracle: "Dr Dray|Dr. Dray|Andrea Suarez", miracleNote: "A dermatologist whose no-nonsense skincare videos have a huge following.",
    trap: "MrBeast|Mr Beast", trapNote: "Huge creator, but not a glow-up one.",
    t75: "Muneeb Shah|Dr Shah|Dermdoctor;James Welsh;Jose Zuniga|Teaching Mens Fashion;Antonio Centeno|Real Men Real Style;Gentlemans Gazette|Gentleman's Gazette;Daniel Simmons|Mr Simmons;Brett Cotter;Mike Thurston;Will Tennyson;Joe Fazer;Kaleb Powell",
    t50: "Andrew Huberman|Huberman;Alpha M|Aaron Marino;Jeff Nippard;Hyram|Hyram Yarbro",
    t25: "Jeremy Fragrance;Sam Sulek;David Laid",
    t10: "Alex Costa;Chris Bumstead|CBum",
    notes: {
      "Dr Dray": "A board-certified dermatologist known for blunt, evidence-based skincare advice.",
      "Muneeb Shah": "A dermatologist who went viral reacting to skincare routines on TikTok.",
      "Hyram": "A skincare creator who helped make gentle routines and sunscreen mainstream.",
      "Alex Costa": "A men's style and grooming YouTuber.",
      "Alpha M": "Aaron Marino, a long-running men's grooming and style channel.",
      "Jeremy Fragrance": "A fragrance influencer famous for his over-the-top reviews."
    }
  });

  add({
    id: "s12-kick-streamer", broad: true, text: "Name a famous streamer (Kick, Twitch or YouTube)",
    miracle: "Ice Poseidon|IcePoseidon", miracleNote: "Veteran IRL streamer who has also streamed on Kick.",
    trap: "Taylor Swift", trapNote: "Huge star, but not a streamer.",
    t75: "Sketch;Suspendas;Stableronaldo|Stable Ronaldo;Duke Dennis;Tyler1|Tyler 1;Valkyrae;Sykkuno;Myth;Mizkif;Lacy;Summit1g;Nmplol;Hasanabi|Hasan Piker;Destiny",
    t50: "Trainwreck|Trainwreck Tv;N3on|Neon;Kai Cenat;Jynxzi;DrDisrespect|Dr Disrespect;Pokimane;Shroud;Asmongold;Ludwig;Tfue;Ibai;Auronplay;Markiplier;Pewdiepie|PewDiePie",
    t25: "Ninja;Dream;Technoblade;Speed|IShowSpeed|Ishowspeed;MrBeast|Mr Beast",
    t10: "Adin Ross;xQc|XQC",
    notes: {
      "Adin Ross": "American streamer and one of Kick's best-known faces.",
      "xQc": "Canadian streamer who streams on Kick.",
      "N3on": "A streamer known on Kick and YouTube.",
      "Kai Cenat": "A Twitch and YouTube streamer with record-setting subathons."
    }
  });

  add({
    id: "s12-stream-platform", broad: true, text: "Name a platform where looksmaxxing streams or clips get posted",
    miracle: "Rumble", miracleNote: "A video platform that also hosts live streams.",
    trap: "LinkedIn", trapNote: "A professional network, not where clips go viral.",
    t75: "Telegram;Odysee;Dailymotion;Lemon8;Vimeo;Triller;Bilibili",
    t50: "Snapchat|Snap;Facebook|Facebook Reels;Pinterest;Threads;Bluesky;Reddit;Discord;Podcast|Podcasts;Instagram Live;YouTube Live;Facebook Live;Spotify",
    t25: "Twitter|X|X Twitter;Instagram Reels|Reels;YouTube Shorts|Shorts;Twitch",
    t10: "TikTok|Tik Tok;YouTube|You Tube;Instagram|IG;Kick",
    notes: {
      "Kick": "A streaming site where many looksmaxxing streams run.",
      "TikTok": "Where most looksmaxxing clips go viral.",
      "Rumble": "A video and live-stream platform."
    }
  });

  add({
    id: "s12-meme-catchphrase", broad: true, text: "Name a viral looksmaxxing meme or catchphrase",
    miracle: "Frame mogged|Framemogged|Frame mogging|Frame mog", miracleNote: "From a viral Kick clip where a streamer was jokingly called 'frame mogged'.",
    trap: "Skibidi", trapNote: "Viral, but a different corner of the internet.",
    t75: "Jestergooning|Jester gooning;Mog or be mogged;Mog the room|Mogging the room;Eyebags detected;Facecard declined;Mogged by a child;Mogged by a fridge;Mogged by an NPC;Mog mode",
    t50: "Jestermaxxing|Jestermaxing|Jester maxxing;Hunter eyes;Prey eyes;Canthal tilt;Chad|Gigachad|Giga chad;Prettyboy|Pretty boy;Looksmax;Maxxing;Glow up|Glowup;Level up;Locked in;Aura;Plus aura;Minus aura;Aura farming;Face reveal;Rizz;Rizzler;Sigma;Cooked|You're cooked|Youre cooked;Frame;Hooded eyes;Brow ridge;Side profile;Jawline|Jaw line;Mogger;Face card|Facecard;Rate my face;Looksmaxxing arc",
    t25: "Mewing streak;Mewing tutorial;Tongue posture;Glow up arc",
    t10: "Mogging|Mog|Mogged;Looksmaxxing|Looks maxxing;Mewing|Mew",
    notes: {
      "Frame mogged": "A joke from a viral clip where a streamer was outsized by a much more muscular guy.",
      "Jestermaxxing": "Being goofy and funny instead of serious.",
      "Mogging": "Slang for outshining someone, mostly said as a joke.",
      "Mewing": "A tongue-posture trend that went viral."
    }
  });

  add({
    id: "s12-stream-chat", broad: true, text: "Name a word or emote you'd see spammed in stream chat",
    miracle: "Copium", miracleNote: "Chat slang for coping when you hope for something unlikely.",
    trap: "Hello viewers", trapNote: "Nobody actually types that.",
    t75: "Hopium;Sadge;Pepega;5Head|Five Head;Monkas;LULW;PauseChamp;FeelsBadMan|Feels Bad Man;Aware;Clueless;Hype train|HypeTrain;Gifted subs|Gifted sub|Gift subs;Prime sub;Based;OMEGALUL|Omegalul;Ratio;Clap;Pepe",
    t50: "Poggers|PogChamp;Kappa;Cringe;Banger;Clip it|Clipped|Clip;Raid;Emote;Emotes;Sub|Subs|Subscribe;Follow;Mod;VIP;Timeout;Ban;Donation|Dono|Donos;Bits;Cheer;Lurk|Lurking;Bruh;Lmao;Dead;Insane;Say less;Sus;No cap;Super chat;First",
    t25: "GG;F;Hello;Hi;LOL;Nice;Wow;Good game;Yes;No",
    t10: "KEKW;Pog;LUL;W|Dub;L;Chat",
    notes: {
      "Copium": "Chat slang for coping when you hope for something unlikely.",
      "Hype train": "A Twitch event when lots of viewers subscribe in a row.",
      "KEKW": "A laughing emote popular across streaming chats."
    }
  });

  add({
    id: "s12-face-feature", broad: true, text: "Name a facial feature looksmaxxers talk about",
    miracle: "Philtrum", miracleNote: "The groove between the nose and upper lip.",
    trap: "Toenails", trapNote: "Not on the face.",
    t75: "Gonial angle|Gonion;Zygomatic arch|Zygoma|Zygomatic bone;Midface|Mid face;Mentolabial fold;Orbital rim;Nasion;Maxilla;Mandible;Frontal bone;Palpebral fissure;Eyelid exposure;Infraorbital rim;Cupid's bow|Cupids bow;Facial thirds;Facial harmony",
    t50: "Hunter eyes;Canthal tilt;Cheekbones|Cheek bones|High cheekbones;Brow ridge|Brow bone|Browbone;Chin|Chin projection;Nose bridge;Hairline;Forehead;Eyebrows;Symmetry|Facial symmetry|Face symmetry;Side profile|Profile;Cheek hollows|Hollow cheeks;Lips;Ears;Neck;Face shape;Golden ratio;Skin clarity;Eyelashes|Lashes;Teeth;Smile;Hooded eyes;Temples;Under eye|Under eyes;Eye area",
    t25: "Mouth;Skin;Hair;Face;Dimples",
    t10: "Jawline|Jaw|Jaw line;Eyes;Nose;Chin",
    notes: {
      "Philtrum": "The vertical groove between nose and upper lip.",
      "Canthal tilt": "The angle between the inner and outer corners of the eye.",
      "Hunter eyes": "Slang for deep-set eyes with an upward tilt."
    }
  });

  add({
    id: "s12-redcarpet-item", broad: true, text: "Name a menswear item you'd see on a red carpet",
    miracle: "Opera gloves|Evening gloves", miracleNote: "A very formal accessory, rare on guys today.",
    trap: "Flip-flops", trapNote: "Not on any red carpet.",
    t75: "Shawl collar|Shawl collar tux|Shawl collar tuxedo;Velvet tuxedo|Velvet tux;Velvet jacket|Velvet blazer;Dinner jacket;Satin lapel|Satin lapels;Peak lapel|Peak lapels;Cummerbund;Studs|Shirt studs|Tuxedo studs;Wing collar shirt|Tuxedo shirt;Patent loafers|Patent leather loafers;Opera pumps;White tie;Tailcoat|Tails;Morning coat;Ascot;Brooch|Lapel brooch;Pearl necklace|Pearls;Silk scarf;Double breasted tux|Double-breasted tux;Waistcoat",
    t50: "Cufflinks|Cuff links;Pocket square;Dress shirt;Dress shoes;Oxfords|Oxford shoes;Loafers;Suspenders|Braces;Boutonniere|Boutonnière;Lapel pin;Dress watch|Watch|Wristwatch;Sunglasses|Shades;Belt;Dress pants|Trousers;Sash;Cape;Turtleneck;Chain|Necklace;Ring|Rings;Top hat;Silk tie|Tie;Black tie;Blazer|Sport coat;Chelsea boots|Ankle boots",
    t25: "Sneakers;Hat;Gold chain;Slacks;Suit jacket",
    t10: "Suit;Tuxedo|Tux|Tuxedo jacket;Bow tie|Bowtie",
    notes: {
      "Opera gloves": "A formal accessory, rare for men now.",
      "Cummerbund": "A pleated sash worn around the waist with a tux.",
      "Shawl collar": "A rounded lapel common on tuxedo jackets."
    }
  });

  add({
    id: "s12-glowup-format", broad: true, text: "Name a glow-up or transformation video format",
    miracle: "Day 1 vs Day 100|Day 1 vs Day 365|Day 1 vs Day 90", miracleNote: "A split-screen progress format showing the same person across time.",
    trap: "Unboxing", trapNote: "A real format, but not about transformations.",
    t75: "Smile transformation|Smile makeover;Posture check|Posture transformation;Skin journey|Skin progress;Skin diary;Fit evolution|Outfit evolution;Style evolution;Wardrobe makeover|Wardrobe upgrade;Barber reveal;Final form;Level 1 to level 100|Level 1 vs Level 100;Looks progress|Looks update;Weekly progress|Weekly update;Haircut transformation;Beard transformation|Beard growth;Gym journey|Fitness journey;Lean bulk progress;Glow up diary",
    t50: "Before and after|Before after|Before & after;Transition video|Transition;Haircut reveal|Hair reveal;Makeover;Gym progress|Gym transformation|Body transformation;Progress pic|Progress pics|Progress photos;90 day glow up|90 day transformation|90 days;30 day glow up|30 day challenge|30 day transformation;Skincare routine|Skincare journey;Get ready with me|GRWM;Outfit transformation|Fit transformation;Fit check|Outfit check;Hair transformation;Glow up arc|Glow up era|Glow up story;Day in my life;Then vs now|Then and now;Beard reveal;Teeth transformation;Style makeover;Year in review",
    t25: "Time lapse|Timelapse;Selfie every day|Daily selfies;Face reveal;Montage|Edit",
    t10: "Glow up|Glowup;Transformation;Makeover",
    notes: {
      "Day 1 vs Day 100": "A before and after split showing long-term progress.",
      "Final form": "A reveal at the end of a long glow-up.",
      "GRWM": "Short for 'get ready with me'."
    }
  });

  add({
    id: "s12-male-model", broad: true, text: "Name a famous male model",
    miracle: "Marcus Schenkenberg|Marcus Schenkenburg", miracleNote: "Swedish model known for 1990s campaigns.",
    trap: "Zoolander|Derek Zoolander", trapNote: "A fictional model from the movie.",
    t75: "Francisco Lachowski|Chico Lachowski;Lucky Blue Smith;Garrett Neff;Noah Mills;Simon Nessman;Baptiste Giabiconi;Tony Ward;Brad Kroenig;Tyson Ballou;Michael Bergin;Jon Kortajarena;Andres Velencoso|Andrés Velencoso;Sean O'Pry|Sean Opry;Cameron Alexander",
    t50: "David Gandy;Tyson Beckford;Fabio|Fabio Lanzoni;Mark Wahlberg;David Beckham|Beckham;Zayn Malik|Zayn;Cristiano Ronaldo|Ronaldo;Jacob Elordi;Zac Efron;Harry Styles;Timothee Chalamet|Timothée Chalamet;Pedro Pascal",
    t25: "Brad Pitt;Johnny Depp;Calvin Klein;Brooklyn Beckham;Justin Bieber",
    t10: "Sean O'Pry;David Gandy;Tyson Beckford",
    notes: {
      "David Gandy": "British model known for a Dolce & Gabbana fragrance campaign.",
      "Tyson Beckford": "American model known for Ralph Lauren Polo ads.",
      "Fabio": "Italian-American model famous for romance novel covers.",
      "Marcus Schenkenberg": "Swedish model from the 1990s.",
      "Jon Kortajarena": "Spanish model who also acted in the film A Single Man.",
      "Mark Wahlberg": "Actor who modeled for Calvin Klein in the early 1990s."
    }
  });

  add({
    id: "s12-subreddit", broad: true, text: "Name a subreddit for fitness, grooming, fashion or skincare",
    miracle: "r/Wicked_Edge|Wicked Edge|WickedEdge", miracleNote: "A community for traditional wet shaving.",
    trap: "r/AskReddit|AskReddit", trapNote: "Huge sub, but not about any of these.",
    t75: "r/Fragrance|Fragrance;r/Cologne|Cologne;r/HaircareScience|Haircare Science;r/Brogress|Brogress;r/Barber|Barber;r/Beards|Beards;r/BeardAdvice|Beard Advice;r/Frugal_Male_Fashion|FrugalMaleFashion|Frugal Male Fashion;r/Sneakers|Sneakers;r/Streetwear|Streetwear;r/Gainit|Gainit;r/WeightRoom|Weightroom;r/Menswear|Menswear;r/Skincare|Skincare;r/EuroSkincare|EuroSkincare;r/Haircare|Haircare;r/Running|Running;r/BodyweightFitness|Bodyweightfitness;r/LoseIt|Loseit|Lose It;r/Lifting|Lifting;r/Powerlifting|Powerlifting;r/AsianBeauty|Asian Beauty;r/CurlyHair|Curly Hair;r/MakeupAddiction|Makeup Addiction;r/Thrifting|Thrifting;r/Sneakerheads|Sneakerheads;r/Nutrition|Nutrition;r/Yoga|Yoga;r/Bjj|BJJ;r/Boxing|Boxing",
    t50: "r/MaleGrooming|Male Grooming|MaleGrooming;r/MaleFashionAdvice|Male Fashion Advice|MFA;r/SkincareAddiction|Skincare Addiction;r/ProgressPics|Progress Pics;r/Fashion|Fashion;r/Hair|Hair;r/Weightlifting|Weightlifting;r/MealPrepSunday|Meal Prep Sunday;r/EatCheapAndHealthy|Eat Cheap and Healthy;r/Cycling|Cycling",
    t25: "r/Gym|Gym;r/Workout|Workout;r/GetMotivated|Get Motivated;r/SelfImprovement|Self Improvement;r/LifeProTips|Life Pro Tips;r/TikTokCringe|TikTok Cringe",
    t10: "r/Fitness|Fitness",
    notes: {
      "r/MaleFashionAdvice": "A huge menswear and style community.",
      "r/SkincareAddiction": "One of the biggest skincare communities.",
      "r/ProgressPics": "A place to post before and after fitness photos.",
      "r/Wicked_Edge": "A community for wet shaving fans."
    }
  });

  add({
    id: "s12-face-shape", broad: true, text: "Name a face shape",
    miracle: "Inverted triangle|Inverted-triangle", miracleNote: "A wide forehead narrowing to a small chin.",
    trap: "Hexagon", trapNote: "A real shape, but not a standard face shape.",
    t75: "Pear|Pear shaped|Pear-shaped;Rhombus;Spade;Kite;Trapezoid|Trapezium;Almond|Almond shaped;Egg|Egg shaped;Elongated|Long face;Long oval;Soft square|Rounded square;Square oval;Round oval",
    t50: "Oblong;Triangle|Triangular|Triangle shaped;Rectangle|Rectangular|Rectangle shaped;Heart|Heart shaped|Heart-shaped;Base-up triangle|Base up triangle;Base-down triangle|Base down triangle;Angular;Chiseled|Chiselled;Baby face;Full face|Full cheeks;Slim|Slender|Thin;Lean;Wide;Narrow",
    t25: "Circle|Circular;Box;Moon;Football;Lemon;Long rectangle;Long square",
    t10: "Oval;Round;Square;Diamond",
    notes: {
      "Inverted triangle": "A wider forehead that narrows to the chin.",
      "Oblong": "A long face with a similar width at forehead, cheeks and jaw."
    }
  });

  add({
    id: "s12-free-glowup", broad: true, text: "Name a free way to glow up",
    miracle: "Face yoga|Facial exercises|Facial massage", miracleNote: "Free facial massage and exercises people try at home.",
    trap: "Buy a Rolex", trapNote: "Definitely not free.",
    t75: "Neck stretches|Neck stretching;Nasal breathing|Breathe through nose;Breathwork|Breathing exercises;Journaling|Journal;Cold shower|Cold showers;Tongue posture;Eye contact|Make eye contact;Voice practice|Practice speaking|Speaking practice;Declutter|Clean your room|Clean room;Iron clothes|Iron your clothes|Ironing;Trim nails|Clean nails|Nail trim;Tongue scraping|Brush tongue;Floss|Flossing;Chin tuck|Chin tucks;Foam rolling;Face massage|Gua sha;Calisthenics|Bodyweight workout|Home workout;Pushups|Push ups|Push-ups;Running|Run|Jogging;Dry brushing;Practice smiling|Smile practice;Laundry|Do laundry|Clean clothes",
    t50: "Hydrate|Stay hydrated|Drink water|More water;Walk|Walking|Daily walk|10k steps;Workout|Exercise|Working out;Fix posture|Good posture|Stand tall|Sit up straight;Sunlight|Get sunlight|Go outside|Morning sun|Fresh air;Stretch|Stretching;Eat healthy|Eating healthy|Eat better|Eat clean;Wash face|Wash your face|Face wash;Brush teeth|Brush your teeth|Brushing teeth;Shower|Daily shower|Shower daily;Haircut|Get a haircut;Confidence|Be confident;Good hygiene|Hygiene;Meditation|Meditate;Less screen time|Screen time|Put phone down;Cut sugar|Less sugar;Limit alcohol|Less alcohol;Stay consistent|Consistency|Be consistent;Set goals|Goals;Morning routine|Routine|Daily routine;Wake up early|Wake early;Be kind|Kindness;Learn a skill;Read a book|Read books|Read more|Reading;Network|Networking;Make friends;Body language;Smile more|Smile|Smiling;Mewing|Mew;Sleep|More sleep|Sleep better|Get sleep",
    t25: "Eat fruit|Fruit|Eat more fruit;Eat vegetables|Veggies|Vegetables|Eat veggies;Tea|Green tea|Drink tea;Cook at home|Cook more|Meal prep;Go to bed early|Bed early;Gratitude|Be grateful;Touch grass|Go touch grass;Stop doomscrolling|Less scrolling|Doomscrolling;Unfollow accounts|Unfollow;Digital detox|Detox",
    t10: "Sleep 8 hours|Eight hours of sleep;Drink water|Water;Exercise;Posture",
    notes: {
      "Face yoga": "Facial exercises and massage routines shared online.",
      "Chin tuck": "A posture exercise that pulls the head back over the shoulders."
    }
  });

  add({
    id: "s12-sigma-character", broad: true, text: "Name a fictional character people make 'sigma' edits of",
    miracle: "Rust Cohle|Rustin Cohle", miracleNote: "The brooding detective from True Detective season one.",
    trap: "SpongeBob|Spongebob", trapNote: "Funny, but not a classic sigma edit character.",
    t75: "Jordan Belfort|Wolf of Wall Street;Lucifer Morningstar|Lucifer;Michael Corleone;Vito Corleone|Don Corleone|Godfather;Tony Montana|Scarface;Frank Underwood|Francis Underwood;Don Draper;Saul Goodman;Gus Fring;Ragnar Lothbrok|Ragnar;Kratos;Geralt|Geralt of Rivia;Arthur Morgan;Vegeta;Griffith;Guts;Light Yagami|Light;Johan Liebert;Max Payne;Jack Reacher;Neo;Morpheus;The Driver|Drive;Squidward|Sigma Squidward",
    t50: "Walter White|Heisenberg;Travis Bickle;Arthur Fleck;Tony Stark|Iron Man;Thanos;Darth Vader|Anakin Skywalker|Vader;Gojo|Satoru Gojo;Levi Ackerman|Levi;Itachi|Itachi Uchiha;Naruto;Luffy|Monkey D Luffy;Zoro;Sung Jin Woo|Sung Jinwoo;Baki;Yujiro Hanma;Rick Sanchez|Rick;Homelander;Billy Butcher|Butcher;Moon Knight;Deadpool;Wolverine|Logan;Captain America;Superman;Spider-Man|Spiderman|Peter Parker;Elliot Alderson|Mr Robot;Dexter Morgan|Dexter;Sherlock Holmes|Sherlock;Hannibal Lecter|Hannibal;Sasuke;Kakashi",
    t25: "Mario;Sonic;Link;Shrek;Gru;Ben 10;Mickey Mouse;Pikachu;Garfield;Bugs Bunny;Homer Simpson|Homer;Peter Griffin;Bluey;Woody;Buzz Lightyear|Buzz",
    t10: "Patrick Bateman|American Psycho;Thomas Shelby|Tommy Shelby|Peaky Blinders;Tyler Durden;Joker;Batman|Bruce Wayne;John Wick|Wick;James Bond|Bond|007;Goku",
    notes: {
      "Patrick Bateman": "The American Psycho character who is the king of the sigma edit.",
      "Thomas Shelby": "The Peaky Blinders gang leader played by Cillian Murphy.",
      "Tyler Durden": "The Fight Club character played by Brad Pitt.",
      "Rust Cohle": "True Detective's detective played by Matthew McConaughey."
    }
  });

  add({
    id: "s12-selfie-pose", broad: true, text: "Name a selfie angle or pose",
    miracle: "Dutch angle|Tilted angle", miracleNote: "A tilted camera angle that adds drama.",
    trap: "Upside down in a tree", trapNote: "Creative, but not a standard pose.",
    t75: "Over the shoulder|Over-the-shoulder;Chin tuck|Chin down|Chin tucked;Squint|Squinting;Window light|Natural light|Window lighting;Golden hour|Golden hour selfie;Ring light;Hair flip|Hair toss;Head tilt|Tilted head;Candid;Look away|Looking away;Looking down|Look down;Chin up|Chin lifted;Jaw forward|Jaw pop;Gym mirror selfie|Gym selfie;Car selfie|Selfie in car;Elevator selfie|Elevator mirror|Elevator;Hands in pockets|Hands in pocket;Hand in hair|Run hand through hair|Hand through hair;Flex|Flexing|Flex pose",
    t50: "Three quarter turn|Three-quarter|3/4 turn|3/4 angle|Three quarter angle|Three quarter view|3/4 view;Low angle|Camera low;High angle|From above|Top-down|Overhead angle;Front camera|Front-facing|Straight on;Mirror selfie|Mirror pic|Bathroom mirror|Bathroom selfie;Selfie stick;Smirk|Half smile|Closed mouth smile;Serious face|Neutral face|Straight face|Poker face|Blank stare|Stoic|Stoic face|Mean mug;Duck face|Duck lips|Pout;Thumbs up|Thumbs-up;Fit check|Fit pic|Outfit pic|OOTD;Wide angle|Wide lens;Zoom in|Close up|Close-up|Closeup;Full body|Full body shot|Head to toe;Waist up|Half body|Upper body;Sunglasses on|Shades on|Wearing sunglasses;Hat pulled low|Hat low|Cap low|Cap down;Hoodie up|Hood up|Hood on;Lean on wall|Leaning;Crossed arms|Arms crossed|Folded arms;Hand on jaw|Hand on chin|Hand on face;Hands on hips|Hand on hip;Jaw flex|Jaw clench|Clenched jaw;Low light|Moody lighting|Dark lighting|Dim lighting|Night selfie|Neon lighting|Neon",
    t25: "Silhouette;Shadow;Reflection;Burst mode|Burst;Timer|Camera timer|Self timer;Tripod;Selfie remote|Bluetooth remote",
    t10: "Side profile|Profile|Side view;Mirror selfie;Smile|Smiling|Big smile;Peace sign|Peace",
    notes: {
      "Dutch angle": "A camera tilted off-level for a dramatic look.",
      "Side profile": "Showing the side of your face to the camera.",
      "Chin tuck": "Tucking the chin slightly to look sharper on camera."
    }
  });
})();
