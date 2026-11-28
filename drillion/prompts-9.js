/* Drillion prompts, set 9: dental anatomy, materials, conditions, drugs and everyday teeth lists. */
(window.CHRILLION_PROMPTS = window.CHRILLION_PROMPTS || []).push(
  {
    id: "d9-mastication-muscle", text: "Name a muscle that moves the jaw",
    miracle: "Mylohyoid|Mylohyoid", miracleNote: "The mylohyoid forms the muscular floor of the mouth and helps depress the mandible.",
    trap: "Tongue", trapNote: "The tongue is a muscle, but it does not move the jaw.",
    t75: ["Geniohyoid","Anterior digastric|Digastric anterior belly|Anterior belly of digastric","Posterior digastric|Digastric posterior belly","Stylohyoid","Platysma","Buccinator","Superior head of lateral pterygoid|Upper head of lateral pterygoid","Inferior head of lateral pterygoid|Lower head of lateral pterygoid","Deep masseter|Superficial masseter","Anterior temporalis|Posterior temporalis","Thyrohyoid","Omohyoid","Sternohyoid","Infrahyoid muscles|Suprahyoid muscles"],
    t50: ["Medial pterygoid|Internal pterygoid","Lateral pterygoid|External pterygoid","Digastric","Suprahyoid muscles|Suprahyoid","Geniohyoid","Mylohyoid"],
    t25: ["Pterygoid|Pterygoids","Medial pterygoid","Lateral pterygoid","Digastric"],
    t10: ["Masseter","Temporalis","Temporal muscle|Temporal"]
  },
  {
    id: "d9-cranial-nerve", text: "Name a cranial nerve",
    miracle: "Nervus intermedius|Nervus intermedius", miracleNote: "The nervus intermedius is the sensory and parasympathetic root of the facial nerve.",
    trap: "Spinal nerve", trapNote: "Spinal nerves are not cranial nerves.",
    t75: ["Terminal nerve|Cranial nerve zero|CN 0|CN0","Nervus intermedius","Chorda tympani","Greater petrosal nerve","Lesser petrosal nerve","Vestibular nerve","Cochlear nerve","Spinal accessory|Spinal accessory nerve"],
    t50: ["Olfactory|Olfactory nerve|CN I|CN 1","Optic|Optic nerve|CN II|CN 2","Oculomotor|Oculomotor nerve|CN III|CN 3","Trochlear|Trochlear nerve|CN IV|CN 4","Abducens|Abducent|Abducens nerve|CN VI","Vestibulocochlear|Vestibulocochlear nerve|Auditory nerve|Acoustic nerve","Glossopharyngeal|Glossopharyngeal nerve|CN IX|CN 9","Accessory|Accessory nerve|CN XI|CN 11","Hypoglossal|Hypoglossal nerve|CN XII|CN 12"],
    t25: ["Vagus|Vagus nerve|CN X|CN 10","Facial|Facial nerve|CN VII|CN 7","Cranial nerve|Cranial nerves"],
    t10: ["Trigeminal|Trigeminal nerve|CN V|CN 5","Optic nerve"]
  },
  {
    id: "d9-tooth-type", broad: true, text: "Name a type of tooth",
    miracle: "Cuspid|Cuspid", miracleNote: "Cuspids is the older dental word for canines.",
    trap: "Fang", trapNote: "Fangs are an informal word for canines, not a formal type of human tooth.",
    t75: ["Cuspid|Cuspids","Eye tooth|Eyetooth|Eye teeth","Stomach tooth","Bicuspid|Bicuspids","First premolar|Second premolar","First molar|Second molar|Third molar","Six-year molar|Six year molar|12-year molar|Twelve-year molar","Deciduous tooth|Deciduous|Primary tooth|Primary teeth","Milk tooth|Milk teeth|Baby tooth|Baby teeth","Permanent tooth|Permanent teeth|Adult tooth|Adult teeth","Succedaneous tooth|Succedaneous teeth|Successional tooth","Supernumerary tooth|Supernumerary|Mesiodens","Central incisor|Lateral incisor","Upper incisor|Lower incisor","Maxillary incisor|Mandibular incisor","Maxillary molar|Mandibular molar","Maxillary canine|Mandibular canine"],
    t50: ["Premolar|Premolars|Bicuspids","Central incisor","Lateral incisor","Wisdom tooth|Wisdom teeth|Third molar","Primary tooth|Baby tooth","Milk tooth","Permanent tooth","Deciduous tooth"],
    t25: ["Wisdom tooth|Wisdom teeth","Eye tooth","Baby tooth|Milk tooth","Canine|Canines","Cuspid"],
    t10: ["Incisor|Incisors","Canine|Canines","Molar|Molars","Premolar|Premolars"]
  },
  {
    id: "d9-tooth-development", text: "Name a stage of tooth development",
    miracle: "Morphodifferentiation|Morphodifferentiation", miracleNote: "Morphodifferentiation is when the crown shape of the tooth is determined.",
    trap: "Eruption", trapNote: "Eruption is the tooth emerging, which is not one of the early development stages.",
    t75: ["Morphodifferentiation|Morpho-differentiation","Histodifferentiation|Histo-differentiation","Cytodifferentiation|Cyto-differentiation","Proliferation","Apposition|Appositional stage|Appositional growth","Dental lamina stage|Lamina stage","Late bell stage","Advanced bell stage","Early bell stage","Crown stage","Root formation|Root development","Initiation|Initiation stage","Maturation|Maturation stage","Calcification|Mineralisation|Mineralization","Secretory stage|Secretory","Reduced enamel epithelium|Reduction stage","Pre-eruptive","Eruptive","Post-eruptive|Posteruptive","Pre-functional eruption|Prefunctional eruption","Functional eruption","Attrition stage|Occlusal contact","Pre-bud"],
    t50: ["Bud stage|Bud","Cap stage|Cap","Bell stage|Bell","Dental lamina|Lamina","Initiation","Apposition","Maturation","Calcification|Mineralization","Root formation"],
    t25: ["Bud","Cap","Bell","Initiation","Calcification|Mineralisation","Eruption"],
    t10: ["Bud stage|Bud","Cap stage|Cap","Bell stage|Bell","Eruption"]
  },
  {
    id: "d9-dental-specialty", text: "Name a dental specialty",
    miracle: "Forensic odontology|Forensic odontology|Forensic dentistry", miracleNote: "Forensic odontology uses teeth and bite marks to identify people and evidence.",
    trap: "Dermatology", trapNote: "Dermatology is a skin specialty, not a dental one.",
    t75: ["Forensic odontology|Forensic dentistry|Forensic odontologist","Dental public health|Public health dentistry|Community dentistry","Oral and maxillofacial radiology|Oral radiology|Dental radiology|Maxillofacial radiology","Oral and maxillofacial pathology|Oral pathology","Oral medicine","Special care dentistry|Special needs dentistry|Special care","Dental anaesthesiology|Dental anesthesiology|Dental anaesthesia|Dental anesthesia","Orofacial pain","Dental sleep medicine|Sleep dentistry","Geriatric dentistry|Gerodontology","Hospital dentistry","Implant dentistry|Implantology","Cosmetic dentistry|Aesthetic dentistry|Esthetic dentistry","Restorative dentistry|Operative dentistry|Conservative dentistry","Dental materials science","Dental informatics","Behavioral dentistry|Behavioural dentistry","Orthognathic surgery|Craniofacial surgery|Craniofacial dentistry","Paediatric dentistry|Pediatric dentistry|Pedodontics|Paedodontics","Oral surgery","Maxillofacial surgery|Oral and maxillofacial surgery|OMFS|Maxillofacial"],
    t50: ["Orthodontics|Orthodontist","Endodontics|Endodontist","Periodontics|Periodontology|Periodontist","Prosthodontics|Prosthodontist|Prosthetic dentistry","Oral surgery|Oral and maxillofacial surgery|OMFS","Paediatric dentistry|Pediatric dentistry|Pedodontics","Oral pathology","Oral medicine","Dental public health","Oral radiology"],
    t25: ["Orthodontics","Endodontics","Periodontics","Prosthodontics","Oral surgery","Paediatric dentistry|Pediatric dentistry"],
    t10: ["Orthodontics|Orthodontist","Endodontics|Endodontist","General dentistry|General practice|General dentist","Periodontics|Periodontist","Oral surgery"]
  },
  {
    id: "d9-decay-bacteria", text: "Name a bacterium involved in tooth decay or gum disease",
    miracle: "Eikenella corrodens|Eikenella corrodens|Eikenella", miracleNote: "Eikenella is a gram-negative bacterium found in periodontal disease.",
    trap: "E. coli", trapNote: "E. coli lives in the gut, not the mouth.",
    t75: ["Eikenella corrodens|Eikenella","Capnocytophaga|Capnocytophaga gingivalis|Capnocytophaga ochracea","Campylobacter rectus|Wolinella recta","Selenomonas|Selenomonas sputigena","Veillonella|Veillonella parvula","Prevotella intermedia|Prevotella nigrescens|Prevotella","Parvimonas micra|Peptostreptococcus micros","Treponema denticola|Treponema","Eubacterium|Eubacterium nodatum","Filifactor alocis","Actinomyces naeslundii|Actinomyces viscosus|Actinomyces odontolyticus|Actinomyces israelii","Streptococcus gordonii|Streptococcus sanguinis|Streptococcus mitis|Streptococcus oralis","Streptococcus sobrinus|S. sobrinus","Bifidobacterium dentium|Bifidobacterium","Rothia dentocariosa|Rothia mucilaginosa","Scardovia wiggsiae|Scardovia","Candida albicans|Candida","Aggregatibacter actinomycetemcomitans|A. actinomycetemcomitans|Aa|Actinobacillus actinomycetemcomitans"],
    t50: ["Tannerella forsythia|T. forsythia|Bacteroides forsythus","Treponema denticola","Fusobacterium nucleatum|F. nucleatum|Fusobacterium","Aggregatibacter actinomycetemcomitans","Actinomyces","Veillonella","Prevotella intermedia|Prevotella","Streptococcus sobrinus","Lactobacillus|Lactobacilli|Lactobacillus acidophilus|Lactobacillus casei"],
    t25: ["Porphyromonas gingivalis|P. gingivalis|Pg","Lactobacillus","Streptococcus sanguinis","Streptococcus mutans|S. mutans"],
    t10: ["Streptococcus mutans|S. mutans|Strep mutans","Streptococcus","Bacteria"]
  },
  {
    id: "d9-tooth-elements", text: "Name an element or ion found in tooth enamel",
    miracle: "Strontium|Strontium", miracleNote: "Strontium substitutes for calcium in small amounts in enamel's apatite crystals.",
    trap: "Iron", trapNote: "Iron appears only in trace amounts, but staining by iron is not part of normal enamel structure.",
    t75: ["Strontium","Zinc","Magnesium","Sodium","Potassium","Chloride|Chlorine","Carbonate|Carbon","Hydroxide|Hydroxyl|Hydroxy","Lead","Iron","Manganese","Copper","Selenium","Silicon|Silicon dioxide","Barium","Aluminium|Aluminum","Titanium"],
    t50: ["Phosphate|Phosphorus|Phosphorous|Phosphates","Fluoride|Fluorine","Carbonate","Hydroxide|Hydroxyl","Magnesium","Sodium","Zinc","Strontium","Chloride"],
    t25: ["Fluoride|Fluorine","Phosphate|Phosphorus","Hydroxyapatite|Apatite|Hydroxylapatite","Oxygen","Hydrogen"],
    t10: ["Calcium","Phosphate","Fluoride","Hydroxyapatite"]
  },
  {
    id: "d9-vitamin-teeth", broad: true, text: "Name a vitamin or mineral that helps keep teeth and gums healthy",
    miracle: "Vitamin K2|Vitamin K2|Vitamin K|K2", miracleNote: "Vitamin K2 helps direct calcium into bones and teeth.",
    trap: "Vitamin E", trapNote: "Vitamin E is a general antioxidant, but not usually a key one for teeth.",
    t75: ["Vitamin K2|Vitamin K","Vitamin A|Beta-carotene","Vitamin B12|B12","Vitamin B2|Riboflavin","Folate|Folic acid|Vitamin B9","Niacin|Vitamin B3","Biotin","Magnesium","Potassium","Zinc","Iron","Coenzyme Q10|CoQ10","Omega-3|Omega 3|Fish oil","Protein|Collagen"],
    t50: ["Vitamin D|Vitamin D3|D3","Phosphorus|Phosphate","Vitamin C|Ascorbic acid","Fluoride","Vitamin A","Calcium","Vitamin K","Zinc","Magnesium"],
    t25: ["Vitamin D","Vitamin C","Fluoride","Phosphorus","Vitamin A"],
    t10: ["Calcium","Vitamin C","Vitamin D","Fluoride"]
  },
  {
    id: "d9-tooth-friendly-food", broad: true, text: "Name a tooth-friendly food",
    miracle: "Sugar-free gum|Sugar free gum|Sugarless gum|Xylitol gum|Gum", miracleNote: "Chewing sugar-free gum boosts saliva, which helps protect enamel.",
    trap: "Orange juice", trapNote: "Orange juice is acidic and high in sugar, so it is not tooth-friendly.",
    t75: ["Sugar-free gum|Sugarless gum|Xylitol gum","Raw celery|Celery sticks","Cucumber|Cucumbers","Bell pepper|Peppers","Kale","Spinach","Swiss chard|Chard","Collard greens|Greens","Bok choy","Brussels sprouts","Cauliflower","Radishes|Radish","Sesame seeds|Tahini","Chia seeds|Chia","Pumpkin seeds","Sunflower seeds","Walnuts","Pecans","Cashews","Hazelnuts","Peanuts|Peanut butter","Edamame","Beans|Black beans|Chickpeas","Tofu","Sardines|Canned salmon","Salmon|Tuna","Shrimp","Turkey","Lean meat","Eggs|Egg","Hard cheese|Cheddar|Swiss cheese|Gouda","Cottage cheese","Plain yogurt|Unsweetened yogurt|Greek yogurt","Kefir","Milk|Unsweetened milk","Green tea|Black tea|Unsweetened tea","Black coffee|Unsweetened coffee","Fennel|Parsley|Mint|Mint leaves","Cranberries|Blueberries","Strawberries|Kiwi","Pears","Melon|Watermelon","Mushrooms"],
    t50: ["Cheese","Yogurt|Yoghurt","Milk","Apples|Apple","Carrots|Carrot","Celery","Broccoli","Almonds|Nuts","Leafy greens|Spinach","Cucumber","Water","Green tea","Salmon","Eggs","Chicken|Poultry","Tofu","Beans","Oats|Oatmeal|Plain oatmeal","Sugar-free gum","Strawberries|Berries"],
    t25: ["Cheese","Yogurt|Yoghurt","Milk","Apples|Apple","Carrots|Carrot","Celery","Almonds|Nuts","Broccoli","Water"],
    t10: ["Water","Cheese","Apple|Apples","Carrots|Carrot","Milk"]
  },
  {
    id: "d9-staining-food", broad: true, text: "Name a food or drink that stains teeth",
    miracle: "Turmeric|Turmeric", miracleNote: "Turmeric curries and golden milk leave a yellow stain on enamel.",
    trap: "Water", trapNote: "Water does not stain teeth.",
    t75: ["Turmeric|Curry|Curries","Saffron","Paprika","Chili powder|Chilli powder","Cumin","Beetroot|Beets|Beet juice","Pomegranate|Pomegranate juice","Cranberry juice|Cranberries","Grape juice|Grapes","Blackberries|Blackcurrants|Blackcurrant","Mulberries","Acai|Acai bowl","Plums|Prunes","Cherries|Cherry juice","Blueberries|Blueberry","Raspberries|Strawberries","Sweet potato","Dark chocolate|Chocolate","Black licorice|Liquorice|Licorice","Popsicles|Popsicle|Ice lolly|Ice pops","Sports drinks|Gatorade|Powerade","Energy drinks","Colas|Cola|Coke|Pepsi","Soy sauce|Soy|Teriyaki sauce|Teriyaki","Balsamic vinegar|Balsamic","Red wine|Red wine vinegar","Tomato sauce|Pasta sauce|Ketchup|Tomato","Mustard|Hot sauce|Barbecue sauce|BBQ sauce","Gravy|Brown sauce","Matcha","Chai|Chai tea","Kombucha","Black tea|Tea","Coffee|Espresso|Latte","Cocoa|Hot chocolate","Candy|Hard candy|Jelly beans","Food coloring|Food dye|Gummy candy|Red candy","Cigarettes|Tobacco|Chewing tobacco|Cigars","Betel|Betel nut|Paan","Chlorhexidine|Mouthwash"],
    t50: ["Coffee","Tea","Red wine|Wine","Cola|Coke|Soda","Blueberries|Berries","Soy sauce","Curry","Tomato sauce|Pasta sauce","Beets|Beetroot","Balsamic vinegar","Dark chocolate","Black tea","Sports drinks","Cherries","Pomegranate","Popsicles","Energy drinks","Licorice|Liquorice","Mustard"],
    t25: ["Coffee","Tea","Red wine|Wine","Cola|Coke|Soda","Blueberries|Berries","Soy sauce","Curry"],
    t10: ["Coffee","Tea","Red wine|Wine","Soda|Cola|Coke","Berries|Blueberries"]
  },
  {
    id: "d9-acidic-food", broad: true, text: "Name an acidic food or drink",
    miracle: "Kombucha|Kombucha", miracleNote: "Kombucha is fermented tea with a notable acidity that can erode enamel.",
    trap: "Milk", trapNote: "Milk is close to neutral and tends to protect teeth.",
    t75: ["Kombucha","Kimchi|Sauerkraut|Fermented foods","Pickles|Pickle juice|Gherkins","Capers","Olives","Sourdough|Sourdough bread","Ketchup|Barbecue sauce|BBQ sauce","Hot sauce|Vinaigrette|Salad dressing","Mayonnaise|Mayo","Cranberries|Cranberry juice","Pomegranate","Rhubarb","Gooseberries","Tamarind","Passion fruit","Kiwi|Kiwifruit","Pineapple|Pineapple juice","Mango","Plums|Plum","Peaches|Peach","Cherries","Blueberries","Strawberries","Raspberries","Blackcurrants","Grapes|Grape juice","Apples|Apple|Apple juice|Cider","Wine|White wine|Red wine|Champagne","Beer|Ale|Lager","Cocktails|Margarita|Mojito","Iced tea|Lemon tea|Hibiscus tea|Fruit tea","Sports drinks|Gatorade|Powerade|Vitamin water","Fruit smoothies|Smoothies|Smoothie","Sour candy|Sour sweets|Sour belts|Sour gummies","Vitamin C tablets|Vitamin C chewables|Ascorbic acid","Aspirin|Chewable aspirin","Dried fruit|Fruit leather|Fruit snacks","Yogurt|Yoghurt|Buttermilk|Sour cream","Tomatoes|Tomato|Tomato sauce|Tomato juice"],
    t50: ["Lemon|Lemons|Lemon juice","Lime|Limes","Orange juice|Oranges|Orange","Grapefruit","Vinegar|Apple cider vinegar|Balsamic vinegar|White vinegar","Soda|Cola|Coke|Pepsi","Energy drinks|Red Bull|Monster","Wine","Tomatoes|Tomato sauce","Pickles","Sour candy","Kombucha","Sports drinks","Apple juice","Pineapple","Cranberry juice","Citrus fruit|Citrus","Strawberries"],
    t25: ["Lemon|Lemons","Orange juice|Oranges","Lime","Soda|Cola|Fizzy drinks","Vinegar","Grapefruit","Wine","Tomatoes"],
    t10: ["Lemon|Lemons","Orange juice|Oranges","Soda|Cola|Coke|Pop","Vinegar","Lime|Limes"]
  },
  {
    id: "d9-break-tooth", broad: true, text: "Name something that can chip or break a tooth",
    miracle: "Olive pit|Olive pit|Olive pits|Olive stone|Olive stones", miracleNote: "A hidden olive pit is a classic cause of cracked molars.",
    trap: "Marshmallow", trapNote: "Marshmallows are soft and will not break a tooth.",
    t75: ["Olive pit|Olive stone|Cherry pit|Cherry stone","Popcorn kernel|Popcorn kernels|Unpopped kernels|Popcorn husk","Fish bone|Fish bones|Chicken bone|Bones","Pistachio shell|Nut shells|Nutshell","Crusty bread|Baguette|Hard bread|Crust","Taco shell|Hard taco shells|Tortilla chips","Pretzel|Hard pretzels","Bagel|Hard bagel","Granola bar|Hard granola","Brittle|Peanut brittle|Toffee|Caramel","Jawbreaker|Jawbreakers|Hard candy|Candy","Ice|Ice cubes|Chewing ice","Pen|Pens|Pencil|Pencils","Fingernails|Nails","Bottle cap|Bottle caps|Opening bottles","Metal fork|Fork|Spoon|Cutlery","Hairpin|Bobby pin|Hair clip","Sports injury|Football|Basketball|Hockey puck","Fall|Falls|Trip|Slip","Fight|Punch|Fist|Assault","Biting a spoon|Biting something hard|Teeth grinding|Bruxism"],
    t50: ["Ice","Hard candy|Candy|Jawbreakers","Popcorn kernels|Popcorn","Bones|Bone","Nuts|Hard nuts|Almonds","Pens|Pen","Pits|Olive pits|Cherry pits","Accident|Accidents|Fall|Falls","Sports|Sports injury|Football","Grinding|Teeth grinding|Bruxism","Bottle caps","Taco shells","Crusty bread","Fork","Biting"],
    t25: ["Ice","Candy|Hard candy","Popcorn kernels|Popcorn","Nuts","Bones","Accident","Fall","Sports","Grinding|Teeth grinding"],
    t10: ["Ice","Hard candy|Candy","Popcorn kernels|Popcorn","Nuts","Falls|Accidents|Fall|Accident"]
  },
  {
    id: "d9-cartoon-teeth", broad: true, text: "Name a cartoon or fictional character with big or prominent teeth",
    miracle: "Beaver Bucky|Bucky Beaver|Bucky", miracleNote: "Bucky Beaver starred in classic Ipana toothpaste ads with his big buck teeth.",
    trap: "Mickey Mouse", trapNote: "Mickey Mouse is known for his round ears and gloves, not big teeth.",
    t75: ["Bucky Beaver|Bucky|Beaver Bucky","Gaston","Goofy","Bucky Bucktooth","Ren|Ren Hoek|Ren and Stimpy","Dopey","Brer Rabbit|Brer Fox","Gnasher","Mr. Ed","Mad Magazine's Alfred E. Neuman|Alfred E. Neuman","Jaws|Jaws from James Bond|Jaws Bond","Dracula|Count Dracula","Count von Count|The Count","Mr. Burns","Dolly Parton","Beaver Cleaver","Wallace|Wallace and Gromit","Roger Rabbit","Lucy Van Pelt","Dudley","Ed|Ed Edd n Eddy","Eeyore","Scrat","Rat|Remy","Ratatouille","Hammy","Rodney","Gonzo","Fozzie","Bugs Bunny|Bugs","Daffy Duck","Porky Pig","Wile E. Coyote|Wile E Coyote|Coyote","Tasmanian Devil|Taz","Chip and Dale|Chip|Dale","Alvin|Alvin and the Chipmunks|Chipmunks","Peter Rabbit","Thumper","Roger","Jessica Rabbit","Rocky|Rocky the Flying Squirrel","Bullwinkle","Sheldon","Plankton","Krabs|Mr. Krabs","Patrick","SpongeBob|SpongeBob SquarePants","Squidward","Gary","Arthur","Brian Griffin|Stewie","Cartman|Kyle","Kenny","Bart Simpson","Barney Gumble","Moe","Dr. Hibbert","Dr. Nick","Ned Flanders|Flanders"],
    t50: ["Bugs Bunny|Bugs","Gaston","Goofy","Jaws","Dracula","Beaver|Bucky Beaver","Peter Rabbit","Roger Rabbit","Chip|Chip and Dale|Dale","Alvin|Alvin and the Chipmunks","Scrat","SpongeBob|SpongeBob SquarePants","Wallace","The Count|Count von Count","Gonzo","Fozzie|Fozzie Bear","Daffy Duck","Mr. Burns","Sheldon"],
    t25: ["Bugs Bunny","Bucky Beaver","Goofy","SpongeBob","Dracula","Peter Rabbit","Jaws"],
    t10: ["Bugs Bunny|Bugs","Dracula","SpongeBob","Goofy","Jaws"]
  },
  {
    id: "d9-supply-company", text: "Name a dental supply or equipment company",
    miracle: "Planmeca|Planmeca", miracleNote: "Planmeca is a Finnish maker of dental units and imaging systems.",
    trap: "Johnson & Johnson", trapNote: "J&J is a big healthcare firm but not a core dental supply company.",
    t75: ["Planmeca","Ivoclar|Ivoclar Vivadent","Kerr|Kerr Dental|Kerr Corporation","GC|GC Corporation|GC America","Septodont","Straumann","Nobel Biocare|Nobel","Zimmer Biomet|Zimmer Dental|Biomet 3i|BIOMET 3i","Dentsply Sirona|Dentsply|Sirona","Envista","Carestream Dental|Carestream","Kulzer","VOCO","Ultradent","Coltene|Coltene Whaledent","Shofu","Hu-Friedy|Hu Friedy","Young Dental|Young","Premier Dental|Premier","Pulpdent","Bisco","Danaher","DMG","Dentalez","A-dec|A-dec Inc|Adec","Belmont","Kavo|KaVo|KaVo Kerr","NSK","W&H|WH","Bien-Air","Midmark","Pelton & Crane","Zest Dental","Biolase","Align Technology|Align|Invisalign","3Shape|3 Shape","Henry Schein|Schein","Patterson Dental|Patterson","Benco Dental|Benco","Darby Dental|Darby","Net32","Safco Dental|Safco","Dental City","Burkhart Dental|Burkhart","Frontier Dental","Practicon","TePe","Lactona","Philips Sonicare|Sonicare","Waterpik|Water Pik"],
    t50: ["Dentsply Sirona|Dentsply","3M|3M ESPE","Henry Schein|Schein","Patterson|Patterson Dental","Align Technology|Align|Invisalign","Straumann","Nobel Biocare","Kerr","GC","Ivoclar","Septodont","Planmeca","Carestream","Zimmer Biomet","Envista","Young","Ultradent","Hu-Friedy","A-dec","Biolase","Kulzer","VOCO"],
    t25: ["3M","Dentsply","Henry Schein","Align","Straumann","Ivoclar","Patterson","Kerr","Septodont"],
    t10: ["3M","Dentsply","Henry Schein","Align|Invisalign","Colgate"]
  },
  {
    id: "d9-interdental-aid", broad: true, text: "Name a tool for cleaning between your teeth",
    miracle: "Rubber tip stimulator|Rubber tip|Rubber tip stimulator|Gum stimulator|Stimudents", miracleNote: "A rubber-tip stimulator massages the gums and cleans between teeth gently.",
    trap: "Toothbrush", trapNote: "A toothbrush cleans the surfaces of teeth but cannot reach well between them.",
    t75: ["Rubber tip stimulator|Rubber tip","Stimulator|Gum stimulator","Stimudents","Interdental stick|Wooden stick|Wooden interdental stick|Interdental sticks","Dental pick|Pick|Dental picks|Plaque pick","Proxabrush|Proxy brush|Proxy brushes","Dental tape|Floss tape","Super Floss|Superfloss","Threader|Floss threader|Floss threaders","Air flosser|Philips AirFloss|AirFloss","Oral irrigator|Oral irrigators|Irrigator","Soft pick|Soft picks|Gum Soft Picks|GUM Soft-Picks","Dental sticks|Dental stick","Plackers|Plackers floss","Reach Access Flosser|Access Flosser","Tongue scraper|Toothpick holder","Matchstick|Pin|Needle","Toothbrush with interdental tip","Sonicare AirFloss|Sonic Flosser|Sonic flosser|Cordless flosser","Hydro floss|Hydro Floss","Interdental floss","Superfloss|Fil dentaire","Cotton thread|Thread","Fishing line","Silk floss|Silk thread","Bamboo floss","Charcoal floss","Gum picks"],
    t50: ["Interdental brush|Interdental brushes|Interproximal brush|TePe","Floss pick|Floss picks|Flossers|Floss sticks","Water flosser|Waterpik|Water pik|Water Pik","Toothpick|Toothpicks|Cocktail stick","Waxed floss|Unwaxed floss|Waxed dental floss|Unwaxed dental floss","Dental floss tape","Oral irrigator","Proxabrush","Soft picks","Air flosser"],
    t25: ["Floss|Dental floss","Toothpick|Toothpicks","Interdental brush","Water flosser|Waterpik","Floss pick|Flossers"],
    t10: ["Floss|Dental floss","Toothpick|Toothpicks","Waterpik|Water flosser","Interdental brush"]
  },
  {
    id: "d9-hygiene-product", broad: true, text: "Name an oral hygiene product",
    miracle: "Dental mirror|Dental mirror|Plaque disclosing tablets|Disclosing tablets|Disclosing tablet", miracleNote: "Disclosing tablets stain plaque so you can see what you missed when brushing.",
    trap: "Soap", trapNote: "Soap is for washing skin, not for cleaning teeth.",
    t75: ["Disclosing tablets|Disclosing tablet|Plaque disclosing tablets|Disclosing solution","Fluoride varnish|Fluoride gel|Fluoride foam|Fluoride rinse","Dental mirror|Mouth mirror|Dental mouth mirror","Tooth mousse|MI Paste|GC Tooth Mousse|Recaldent","Dry mouth spray|Dry mouth gel|Biotene|Saliva substitute","Sensitivity gel|Desensitising gel|Desensitizing gel|Sensodyne rapid relief","Retainer cleaner|Retainer tablets|Retainer brite|Retainer Brite","Mouthguard|Night guard|Nightguard|Occlusal splint","Orthodontic wax|Braces wax|Ortho wax","Toothpaste tablets|Toothpaste tabs|Tooth powder|Tooth soap","Oil pulling|Coconut oil|Oil pull","Breath strips|Breath spray|Mouth spray|Breath mints","Teeth whitening strips|Whitening strips|Whitestrips|Crest Whitestrips","Tooth wipes|Finger toothbrush|Baby toothbrush|Teething ring","Toothpick|Toothpicks","Tongue cleaner|Tongue brush|Tongue scraper"],
    t50: ["Toothbrush|Electric toothbrush|Manual toothbrush|Sonic toothbrush","Toothpaste|Tooth paste|Dentifrice","Mouthwash|Mouth rinse|Mouth wash|Mouthrinse","Floss|Dental floss","Tongue scraper|Tongue cleaner","Water flosser|Waterpik","Whitening strips|Whitening","Interdental brush","Floss picks|Flossers","Fluoride rinse|Fluoride varnish|Fluoride","Mouthguard|Night guard","Retainer|Retainer case","Denture cleaner|Polident","Breath mints|Mints|Chewing gum|Gum"],
    t25: ["Toothbrush","Toothpaste","Mouthwash","Floss|Dental floss","Tongue scraper","Water flosser"],
    t10: ["Toothbrush","Toothpaste","Mouthwash|Mouth rinse","Floss|Dental floss"]
  },
  {
    id: "d9-whitening-method", broad: true, text: "Name a way to whiten teeth",
    miracle: "Oil pulling|Oil pulling|Coconut oil pulling|Swishing oil", miracleNote: "Oil pulling is an ancient Ayurvedic habit of swishing oil, which some use as a mild whitening aid.",
    trap: "Bleach", trapNote: "Household bleach is toxic and must never go on your teeth.",
    t75: ["Oil pulling|Coconut oil pulling|Coconut oil","Activated charcoal|Charcoal toothpaste|Charcoal powder|Charcoal","Baking soda|Bicarbonate of soda|Bicarb|Bicarbonate","Hydrogen peroxide|Peroxide|Hydrogen peroxide rinse","Carbamide peroxide|Carbamide","Whitening pens|Whitening pen|Tooth whitening pen|Bleaching pen","Whitening gel|Bleaching gel|Whitening gels","Whitening mouthwash|Whitening rinse|Whitening mouth rinse","Whitening toothpaste|Whitening paste|Whitening tooth paste","Whitening gum|Whitening chewing gum","Whitening powder|Tooth whitening powder","LED whitening|LED light whitening|LED kit|LED light","Laser whitening|Laser bleaching|Laser","Power bleaching|Power whitening|Zoom whitening|Zoom","Take-home whitening|Take home whitening|Home whitening kit|Home bleaching","Custom trays|Whitening trays|Bleaching trays|Tray bleaching","Walking bleach|Internal bleaching|Intracoronal bleaching","Microabrasion|Enamel microabrasion|Macroabrasion","Veneers|Porcelain veneers|Composite veneers|Bonding","Lemon juice|Strawberries|Strawberry|Banana peel"],
    t50: ["Whitening strips|Crest Whitestrips|Whitestrips|White strips","Whitening toothpaste|Whitening paste","Bleaching|Tooth bleaching|Teeth bleaching|Dental bleaching","Professional whitening|In-office whitening|Office whitening|Dentist whitening","Whitening trays|Bleaching trays|Custom trays","Hydrogen peroxide|Peroxide","Baking soda|Bicarbonate of soda","Charcoal|Activated charcoal","Veneers|Porcelain veneers","LED light|LED whitening","Laser whitening|Laser","Whitening pens|Whitening pen","Whitening mouthwash|Whitening rinse","Brushing|Brush your teeth|Brushing more","Scale and polish|Scaling and polishing|Dental cleaning|Professional cleaning","Oil pulling"],
    t25: ["Whitening strips|Whitestrips","Whitening toothpaste","Bleaching|Teeth bleaching|Tooth bleaching","Baking soda","Professional whitening|Dentist whitening","Veneers","Brushing","Charcoal"],
    t10: ["Whitening strips|Whitestrips","Whitening toothpaste","Bleaching|Tooth bleaching|Teeth bleaching","Brushing","Professional whitening|Dentist whitening"]
  },
  {
    id: "d9-abscess-sign", text: "Name a sign or symptom of a dental abscess",
    miracle: "Trismus|Trismus|Lockjaw|Limited mouth opening|Difficulty opening the mouth|Restricted mouth opening", miracleNote: "Spreading infection in the jaw muscles can make it hard to open the mouth.",
    trap: "Itchy skin", trapNote: "Itchy skin is not a typical sign of an abscess.",
    t75: ["Trismus|Lockjaw|Limited mouth opening|Difficulty opening the mouth","Sinus tract|Fistula|Draining sinus|Gum boil","Dysphagia|Difficulty swallowing|Trouble swallowing|Painful swallowing","Dyspnoea|Dyspnea|Difficulty breathing|Trouble breathing","Tooth mobility|Loose tooth|Loose teeth|Tooth feels loose","Extrusion|Tooth feels high|Tooth feels long|Tooth feels raised","Tender to percussion|Pain on biting|Pain when chewing|Pain on chewing","Lymphadenopathy|Swollen glands|Swollen lymph nodes|Swollen neck glands","Facial asymmetry|Facial swelling|Swollen face|Swollen cheek","Malaise|Feeling unwell|Fatigue|Tiredness","Pyrexia|Fever|High temperature|Raised temperature","Halitosis|Bad breath|Foul breath|Foul smell","Dysgeusia|Bad taste|Foul taste|Unpleasant taste","Throbbing pain|Throbbing toothache|Spontaneous pain|Severe pain","Gingival swelling|Swollen gums|Gum swelling|Swollen gum"],
    t50: ["Swelling|Facial swelling|Swollen face","Pain|Toothache|Tooth pain|Severe pain","Fever|High temperature|Pyrexia","Pus","Bad taste","Bad breath|Halitosis","Swollen glands|Swollen lymph nodes|Lymphadenopathy","Difficulty swallowing|Dysphagia","Difficulty opening|Trismus","Loose tooth","Redness|Red gums","Pain on biting|Pain when chewing","Hot and cold sensitivity|Hot sensitivity|Cold sensitivity|Sensitivity","Malaise|Feeling unwell","Sinus tract|Gum boil|Fistula|Parulis","Throbbing pain"],
    t25: ["Swelling","Pain|Toothache","Fever","Pus","Bad taste","Bad breath","Redness","Sensitivity|Hot and cold sensitivity","Swollen glands|Swollen lymph nodes"],
    t10: ["Swelling","Pain|Toothache","Fever","Pus"]
  },
  {
    id: "d9-gum-disease-sign", broad: true, text: "Name a sign or symptom of gum disease",
    miracle: "Black triangles|Black triangles|Black triangle|Open embrasures|Open gingival embrasures|Dark triangles between teeth|Interdental spaces", miracleNote: "Gum recession leaves dark triangular gaps between teeth.",
    trap: "Cold sores", trapNote: "Cold sores are caused by a virus and are not a sign of gum disease.",
    t75: ["Black triangles|Black triangle|Open embrasures|Dark triangles between teeth","Shiny gums|Glossy gums|Shiny gum|Smooth gums","Spongy gums|Puffy gums|Boggy gums|Soft gums","Pus between teeth and gums|Suppuration|Pus|Pus from gums","Gum pockets|Periodontal pockets|Deep pockets|Pocketing","Bone loss|Alveolar bone loss|Attachment loss|Loss of attachment","Drifting teeth|Teeth shifting|Tooth migration|Teeth moving","Changing bite|Bite changes|Teeth don't fit together|Bite feels different","Dentures not fitting|Denture fit changing|Ill-fitting partial dentures|Partial denture fit changing","Food trapping|Food impaction|Food stuck between teeth|Food packing","Dark red gums|Purple gums|Bluish gums|Bluish red gums","Tender gums|Sore gums|Gum pain|Painful gums","Gum itching|Itchy gums|Burning gums|Gum burning","Metallic taste|Bad taste|Foul taste|Unpleasant taste","Thickened gums|Gum overgrowth|Gum enlargement|Enlarged gums","Gingival bleeding|Bleeding on probing|BOP|Bleeding after flossing"],
    t50: ["Bleeding gums|Gums bleeding|Bleeding when brushing|Bleeding","Bad breath|Halitosis","Swollen gums|Gum swelling|Swelling","Red gums|Redness|Inflamed gums|Inflammation","Receding gums|Gum recession|Recession|Gums pulling back","Loose teeth|Tooth mobility|Mobile teeth|Wobbly teeth","Tender gums|Sore gums|Painful gums","Pus","Gaps between teeth|Spacing|Teeth moving|Tooth migration","Sensitive teeth|Sensitivity","Pain when chewing|Pain on chewing","Bad taste","Gum pockets|Deep pockets|Pockets","Longer-looking teeth|Teeth look longer|Teeth looking longer","Shiny gums"],
    t25: ["Bleeding gums|Bleeding","Bad breath|Halitosis","Swollen gums|Swelling","Red gums|Redness","Receding gums|Gum recession","Loose teeth","Sore gums|Tender gums"],
    t10: ["Bleeding gums|Bleeding","Bad breath|Halitosis","Swollen gums|Swelling","Red gums|Redness","Receding gums"]
  },
  {
    id: "d9-dental-procedure", broad: true, text: "Name a dental procedure",
    miracle: "Frenectomy|Frenectomy", miracleNote: "Frenectomy removes or reshapes the small band of tissue under the tongue or lip.",
    trap: "Appendectomy", trapNote: "An appendectomy removes the appendix, not a dental procedure.",
    t75: ["Frenectomy|Frenulectomy","Gingivectomy|Gingivoplasty","Apicoectomy|Apicectomy|Root-end surgery","Pulpotomy|Pulpectomy|Pulp capping|Pulp cap","Hemisection|Root amputation|Root resection","Alveoloplasty|Ridge preservation|Socket preservation","Sinus lift|Sinus augmentation|Bone graft|Bone grafting","Crown lengthening|Crown lengthening surgery","Gum graft|Gingival graft|Soft tissue graft|Connective tissue graft","Splinting|Tooth splinting|Periodontal splinting","Occlusal adjustment|Bite adjustment|Equilibration","Inlay|Onlay|Overlay","Space maintainer|Space maintenance","Stainless steel crown|Preformed crown|Hall crown|Hall technique","Biopsy|Oral biopsy|Incisional biopsy|Excisional biopsy","Surgical extraction|Wisdom tooth removal|Third molar removal|Coronectomy","Distalisation|Distalization|Expansion|Palatal expansion"],
    t50: ["Filling|Fillings|Restoration|Dental filling","Crown|Cap|Dental crown","Root canal|Root canal treatment|RCT|Endodontic treatment","Extraction|Tooth extraction|Pulling a tooth|Tooth removal","Scale and polish|Scaling and polishing|Cleaning|Dental cleaning","Veneer|Veneers","Bridge|Dental bridge","Implant|Dental implant|Implants","Bonding|Tooth bonding|Dental bonding","Whitening|Bleaching|Teeth whitening","Sealant|Fissure sealant|Fissure sealants|Sealants","Braces|Orthodontic treatment|Orthodontics","Dentures|Denture|False teeth","Deep cleaning|Root planing|Scaling and root planing|Root planning","Fluoride treatment|Fluoride varnish|Fluoride application","Gum surgery|Flap surgery|Periodontal surgery","Impressions|Impression|Dental impression","X-ray|Dental x-ray|Radiograph","Check-up|Checkup|Exam|Dental exam"],
    t25: ["Filling|Fillings","Crown","Root canal","Extraction|Tooth extraction","Cleaning|Scale and polish","Braces","Veneers|Veneer","Implant|Dental implant","Whitening"],
    t10: ["Filling|Fillings","Cleaning|Scale and polish|Scaling","Extraction|Tooth extraction","Root canal","Check-up|Checkup|Exam"]
  },
  {
    id: "d9-replace-tooth", text: "Name a way to replace a missing tooth",
    miracle: "Autotransplantation|Autotransplantation|Tooth autotransplant|Autotransplant|Tooth transplant|Tooth transplantation", miracleNote: "Autotransplantation moves a patient's own tooth, often a wisdom tooth, into a gap.",
    trap: "Gluing a tooth back", trapNote: "Gluing a tooth back or a tooth from another person is not a standard dental treatment.",
    t75: ["Autotransplantation|Tooth transplant|Autotransplant","Orthodontic space closure|Space closure|Close the gap|Closing the gap","Resin-bonded bridge|Maryland bridge|Maryland|Resin bonded bridge","Inlay-retained bridge|Fixed-fixed bridge|Fixed bridge|Conventional bridge","Implant-supported bridge|Implant bridge|Implant-retained bridge","Overdenture|Implant overdenture|Implant-retained denture|Implant-supported denture","All-on-4|All on 4|All-on-four|All on four","Immediate denture|Interim denture|Temporary denture|Transitional denture","Flipper|Flipper tooth|Acrylic flipper|Essix retainer with tooth","Cobalt chrome denture|Chrome denture|Metal frame denture|Cast partial"],
    t50: ["Dental implant|Implant|Implants|Tooth implant","Bridge|Dental bridge|Fixed bridge","Denture|Dentures|False teeth|Partial denture","Removable partial denture|RPD|Partial plate|Acrylic partial","Resin-bonded bridge|Maryland bridge","Cantilever bridge","Implant-supported denture|Implant-retained denture|Overdenture","Flipper","Immediate denture","Dental implants","Orthodontic space closure|Space closure","Autotransplant|Tooth transplant|Autotransplantation"],
    t25: ["Implant|Dental implant","Bridge|Dental bridge","Denture|Dentures|Partial denture","False tooth|False teeth","Flipper"],
    t10: ["Implant|Dental implant|Implants","Bridge|Dental bridge","Denture|Dentures|False teeth|Partial denture"]
  },
  {
    id: "d9-toothache-cause", text: "Name a cause of toothache",
    miracle: "Barodontalgia|Barodontalgia|Tooth squeeze|Aerodontalgia|Barotrauma", miracleNote: "Barodontalgia is tooth pain caused by pressure changes while flying or diving.",
    trap: "Hunger", trapNote: "Hunger does not cause toothache.",
    t75: ["Barodontalgia|Tooth squeeze|Aerodontalgia|Barotrauma","Cracked tooth syndrome|Cracked tooth|Split tooth|Vertical root fracture","Cusp fracture|Broken cusp|Chipped tooth|Broken tooth","Reversible pulpitis|Irreversible pulpitis|Pulpitis|Pulp inflammation","Periapical abscess|Periapical periodontitis|Apical periodontitis|Apical abscess","Pericoronitis|Operculitis|Impacted wisdom tooth|Wisdom tooth","Occlusal trauma|Traumatic occlusion|High bite|Bruxism","Dry socket|Alveolar osteitis|Post-extraction pain|After extraction","Referred pain|Sinusitis|Sinus infection|Maxillary sinusitis"],
    t50: ["Tooth decay|Decay|Cavity|Cavities","Abscess|Dental abscess|Tooth abscess|Infection","Gum disease|Periodontal disease|Periodontitis|Gingivitis","Cracked tooth|Broken tooth|Chipped tooth|Fractured tooth","Sensitivity|Sensitive teeth|Dentine hypersensitivity|Dentin hypersensitivity","Wisdom teeth|Wisdom tooth|Impacted wisdom tooth|Erupting wisdom tooth","Grinding|Teeth grinding|Bruxism|Clenching","Lost filling|Broken filling|Failed filling|Loose filling","Sinus infection|Sinusitis|Sinus problems|Sinus pressure","Food stuck|Food impaction|Food trapping|Food packing","Trauma|Injury|Accident|Knock","Pulpitis|Nerve inflammation|Inflamed nerve|Pulp inflammation","Teething|Tooth eruption|Eruption|Teeth coming through","Dry socket|Alveolar osteitis","TMJ|TMD|Jaw problems|Jaw joint problems"],
    t25: ["Cavity|Cavities|Decay|Tooth decay","Abscess|Infection","Gum disease|Gingivitis|Periodontitis","Cracked tooth|Broken tooth|Chipped tooth","Sensitivity|Sensitive teeth","Wisdom teeth|Wisdom tooth","Grinding|Bruxism|Teeth grinding","Lost filling|Broken filling","Sinus infection|Sinusitis"],
    t10: ["Cavity|Cavities|Decay|Tooth decay","Abscess|Infection","Gum disease|Gingivitis","Cracked tooth|Broken tooth|Chipped tooth","Sensitivity|Sensitive teeth"]
  },
  {
    id: "d9-otc-painkiller", broad: true, text: "Name a painkiller you can buy without a prescription",
    miracle: "Benzocaine|Benzocaine|Benzocaine gel|Orajel|Oragel|Anbesol|Baby Orajel", miracleNote: "Benzocaine is a numbing gel often sold for toothache and mouth sores.",
    trap: "Morphine", trapNote: "Morphine is prescription-only and strongly controlled.",
    t75: ["Benzocaine|Orajel|Oragel|Anbesol","Clove oil|Eugenol|Oil of cloves|Clove","Excedrin|Anacin|Goody's|Goody's Powder","Aleve|Naprosyn|Naproxen sodium|Anaprox","Motrin|Nurofen|Brufen|Advil","Tylenol|Panadol|Calpol|Paracetamol","Voltaren|Diclofenac|Voltaren Gel|Voltarol"],
    t50: ["Ibuprofen|Advil|Motrin|Nurofen","Paracetamol|Acetaminophen|Tylenol|Panadol","Aspirin|Bayer|Disprin|Ecotrin","Naproxen|Aleve|Naprosyn","Orajel|Anbesol|Oragel|Benzocaine","Clove oil|Cloves|Eugenol","Excedrin|Anadin","Diclofenac|Voltaren"],
    t25: ["Ibuprofen|Advil","Paracetamol|Acetaminophen|Tylenol","Aspirin","Naproxen|Aleve","Orajel","Clove oil"],
    t10: ["Ibuprofen|Advil|Motrin|Nurofen","Paracetamol|Acetaminophen|Tylenol|Panadol","Aspirin|Bayer"]
  },
  {
    id: "d9-mouthwash-ingredient", text: "Name an active ingredient or component of mouthwash",
    miracle: "Delmopinol|Delmopinol", miracleNote: "Delmopinol is a plaque-reducing agent used in some Scandinavian mouthrinses.",
    trap: "Bleach", trapNote: "Household bleach is not used in mouthwash.",
    t75: ["Delmopinol|Hexetidine|Triclosan|Octenidine","Benzydamine|Benzydamine hydrochloride|Difflam|Choline salicylate","Sanguinarine|Sanguinaria|Povidone-iodine|Povidone iodine","Sodium benzoate|Benzoic acid|Potassium sorbate|Sorbic acid","Poloxamer|Poloxamer 407|Polysorbate|Polysorbate 80","Sodium saccharin|Saccharin|Sucralose|Aspartame","Menthol|Eucalyptol|Thymol|Methyl salicylate"],
    t50: ["Chlorhexidine|Chlorhexidine gluconate|CHX|Corsodyl","Cetylpyridinium chloride|CPC|Cepacol|Crest Pro-Health","Fluoride|Sodium fluoride|Fluoride rinse","Essential oils|Listerine|Eucalyptol|Thymol","Hydrogen peroxide|Peroxide","Alcohol|Ethanol|Ethyl alcohol","Water|Aqua|Purified water","Baking soda|Sodium bicarbonate|Bicarbonate","Xylitol","Zinc","Triclosan","Povidone-iodine|Iodine","Benzydamine","Hexetidine","Delmopinol","Stannous fluoride","Flavouring|Flavoring|Flavour|Flavor","Sweetener|Sweeteners|Saccharin|Sorbitol"],
    t25: ["Fluoride|Sodium fluoride","Chlorhexidine|CHX","Alcohol|Ethanol","Hydrogen peroxide|Peroxide","Menthol|Mint|Peppermint","Eucalyptol","Water","Xylitol"],
    t10: ["Fluoride","Alcohol|Ethanol","Mint|Menthol|Peppermint","Water","Chlorhexidine"]
  },
  {
    id: "d9-toothpaste-ingredient", broad: true, text: "Name an ingredient in toothpaste",
    miracle: "Tetrapotassium pyrophosphate|Pyrophosphate|Tetrasodium pyrophosphate|Sodium pyrophosphate|Tetrapotassium pyrophosphate", miracleNote: "Pyrophosphates help keep tartar from building up on teeth.",
    trap: "Gluten", trapNote: "Gluten is a protein in wheat that is not an intended toothpaste ingredient.",
    t75: ["Pyrophosphate|Pyrophosphates|Tetrasodium pyrophosphate|Tetrapotassium pyrophosphate","Carrageenan|Cellulose gum|Sodium carboxymethylcellulose|Carboxymethylcellulose","Propylene glycol|PEG-8|PEG|Polyethylene glycol","Titanium dioxide|TiO2|Zinc oxide|Mica","Calcium carbonate|Chalk|Dicalcium phosphate|Dicalcium phosphate dihydrate","Sodium saccharin|Saccharin|Sucralose|Xylitol","Potassium nitrate|Strontium chloride|Strontium acetate|Arginine","Peppermint oil|Spearmint oil|Menthol|Mint","Methylparaben|Propylparaben|Sodium benzoate|Benzoic acid","Baking soda|Sodium bicarbonate|Bicarbonate|Bicarbonate of soda"],
    t50: ["Fluoride|Sodium fluoride|Stannous fluoride|Sodium monofluorophosphate","Water|Aqua","Silica|Hydrated silica|Abrasive","Glycerin|Glycerol|Sorbitol","Sodium lauryl sulfate|SLS|Sodium lauryl sulphate","Flavour|Flavor|Mint|Peppermint","Calcium carbonate|Chalk","Titanium dioxide","Xylitol","Triclosan","Baking soda|Sodium bicarbonate","Thickener|Cellulose gum|Carrageenan|Xanthan gum","Sweetener|Saccharin|Sodium saccharin|Sucralose","Hydroxyapatite|Nano-hydroxyapatite","Potassium nitrate|Strontium chloride","Hydrogen peroxide|Peroxide","Charcoal","Zinc|Zinc citrate","Colour|Color|Dye|Pigment","Preservative|Preservatives"],
    t25: ["Fluoride|Sodium fluoride","Water","Silica|Abrasive","Glycerin|Sorbitol","Sodium lauryl sulfate|SLS","Flavouring|Flavoring|Mint|Menthol","Calcium carbonate|Chalk","Baking soda"],
    t10: ["Fluoride","Mint|Menthol|Peppermint","Water","Baking soda","Abrasive|Silica"]
  },
  {
    id: "d9-toothpaste-type", broad: true, text: "Name a type or kind of toothpaste",
    miracle: "Hydroxyapatite toothpaste|Hydroxyapatite|Nano-hydroxyapatite|nHA|Remineralising toothpaste|Remineralizing toothpaste", miracleNote: "Hydroxyapatite toothpaste is fluoride-free and can help rebuild enamel.",
    trap: "Shampoo", trapNote: "Shampoo is for hair, not teeth.",
    t75: ["Hydroxyapatite toothpaste|Hydroxyapatite|Nano-hydroxyapatite|nHA","Tooth powder|Toothpowder|Tooth tablets|Toothpaste tablets","Smokers' toothpaste|Smokers toothpaste|Smoker's toothpaste|Polar","Prescription toothpaste|Prescription-strength toothpaste|High-fluoride toothpaste|High fluoride toothpaste","Anti-cavity toothpaste|Anticavity toothpaste|Cavity protection toothpaste|Cavity protection","Dry mouth toothpaste|Biotene toothpaste|Biotene|Xerostomia toothpaste","Gum care toothpaste|Gum protection toothpaste|Gum disease toothpaste|Periodontal toothpaste","Anti-plaque toothpaste|Plaque control toothpaste|Plaque toothpaste","Baby toothpaste|Toddler toothpaste|Infant toothpaste|Training toothpaste","Enamel toothpaste|Enamel care toothpaste|Enamel protection toothpaste|Enamel strengthening toothpaste","Fresh breath toothpaste|Breath freshening toothpaste|Anti-bad-breath toothpaste|Bad breath toothpaste","Total care toothpaste|Total toothpaste|Complete care toothpaste|Multi-benefit toothpaste","Oil-based toothpaste|Coconut oil toothpaste|Oil pulling toothpaste","Vegan toothpaste|Cruelty-free toothpaste|Zero waste toothpaste|Plastic-free toothpaste","Whitening charcoal toothpaste|Activated charcoal toothpaste|Charcoal toothpaste"],
    t50: ["Whitening toothpaste|Whitening","Sensitive toothpaste|Sensitivity toothpaste|Sensitive teeth toothpaste|Sensodyne","Tartar control toothpaste|Tartar control|Anti-tartar toothpaste|Tartar toothpaste","Fluoride toothpaste|Fluoride","Fluoride-free toothpaste|Fluoride free toothpaste|Non-fluoride toothpaste","Natural toothpaste|Natural|Herbal toothpaste|Herbal","Charcoal toothpaste|Charcoal|Activated charcoal","Baking soda toothpaste|Baking soda|Bicarbonate toothpaste|Arm & Hammer","Kids' toothpaste|Kids toothpaste|Children's toothpaste|Childrens toothpaste","Gel toothpaste|Gel|Paste|Striped toothpaste","Mint toothpaste|Mint|Minty","Gum care toothpaste|Gum protection toothpaste|Gum toothpaste","Cavity protection toothpaste|Cavity protection|Anti-cavity toothpaste|Anticavity toothpaste","Smokers' toothpaste","Hydroxyapatite toothpaste"],
    t25: ["Whitening toothpaste|Whitening","Sensitive toothpaste|Sensodyne","Tartar control toothpaste|Tartar control","Fluoride toothpaste|Fluoride","Natural toothpaste|Herbal toothpaste","Kids' toothpaste|Kids toothpaste|Children's toothpaste","Charcoal toothpaste"],
    t10: ["Whitening toothpaste|Whitening","Fluoride toothpaste|Fluoride","Sensitive toothpaste|Sensitivity toothpaste","Kids' toothpaste|Children's toothpaste","Mint toothpaste|Mint"]
  },
  {
    id: "d9-big-grin", broad: true, text: "Name a fictional character known for a big grin",
    miracle: "Jack Skellington|Jack Skellington|Jack|The Pumpkin King", miracleNote: "Jack Skellington's permanent skull grin is a Halloween icon.",
    trap: "Eeyore", trapNote: "Eeyore is the gloomy donkey from Winnie the Pooh.",
    t75: ["Jack Skellington|Jack","Chucky|Child's Play","Cheshire Cat|Cheshire","The Grinch|Grinch","The Joker|Joker","Pennywise|It","Leatherface","Freddy Krueger|Freddy","Lord Voldemort","Cruella de Vil|Cruella","Ursula","Gaston","Maleficent","Jaws","Hannibal Lecter|Hannibal","Pinhead","Slender Man|Slenderman","Smiley|Smiley face","Gollum|Smeagol|Sméagol","Sully|James P. Sullivan","Mike Wazowski|Mike","Boo|Boo from Monsters Inc","Genie|The Genie","Maui","Scar","Shere Khan","Kaa","Sid the Sloth|Sid","Lumiere","Mr. Incredible|Bob Parr","The Mask|Stanley Ipkiss","Ace Ventura|Ace","Bugs Bunny|Bugs","Daffy Duck","Roger Rabbit","Tigger","Winnie the Pooh|Pooh","Kermit the Frog|Kermit","Rafiki","Abu","Iago","Olaf","Sven","Bambi","Thumper","Flower"],
    t50: ["Cheshire Cat|Cheshire","Joker|The Joker","Grinch|The Grinch","Jack Skellington","Jack Nicholson's Joker","Chucky","Pennywise","Cruella de Vil","Genie","Tigger","Bugs Bunny","Mike Wazowski","Sully","Smiley|Smiley face","Gollum","Maleficent","Ursula","Scar","The Mask","Mr. Incredible","Olaf","Kermit"],
    t25: ["Cheshire Cat","Joker|The Joker","Grinch|The Grinch","Jack Skellington","Chucky","Smiley|Smiley face","Genie"],
    t10: ["Cheshire Cat","Joker|The Joker","Grinch|The Grinch","Smiley|Smiley face","Jack Skellington"]
  },
  {
    id: "d9-wear-on-teeth", broad: true, text: "Name something people can wear on their teeth",
    miracle: "Tooth gem|Tooth gem|Tooth gems|Tooth jewel|Tooth jewelry|Tooth jewellery|Tooth crystal|Tooth crystals|Twinkles", miracleNote: "Tooth gems are small crystals glued to the surface of a tooth.",
    trap: "Glasses", trapNote: "Glasses sit on your nose, not on your teeth.",
    t75: ["Tooth gem|Tooth gems|Tooth jewel|Tooth jewelry","Gold cap|Gold teeth|Gold tooth|Gold crown","Grillz|Grills|Grill|Grillz teeth","Palatal expander|Expander|Rapid palatal expander|RPE","Headgear|Face mask|Facemask|Reverse-pull headgear","Space maintainer|Band and loop|Lingual holding arch|Distal shoe","Veneers|Lumineers|Snap-on smile|Snap on smile"],
    t50: ["Braces|Brace|Orthodontic braces|Metal braces","Retainer|Retainers|Hawley retainer|Essix retainer","Mouthguard|Mouth guard|Gum shield|Gumshield","Aligners|Clear aligners|Invisalign|Invisible braces","Dentures|Denture|False teeth|Partial denture","Veneers|Veneer","Crown|Crowns|Cap|Caps","Grillz|Grills|Grill|Gold teeth","Headgear","Tooth gem|Tooth gems","Whitening trays|Bleaching trays|Whitening strips","Wire|Wires|Archwire|Archwires","Vampire fangs|Fangs|Vampire teeth|Fake fangs","Expander"],
    t25: ["Braces|Brace","Retainer|Retainers","Mouthguard|Mouth guard|Gum shield","Aligners|Invisalign|Clear aligners","Dentures|False teeth","Grillz|Grills|Gold teeth","Veneers|Veneer","Crown|Crowns"],
    t10: ["Braces|Brace","Retainer|Retainers","Mouthguard|Mouth guard|Gum shield","Dentures|False teeth","Invisalign|Aligners","Grillz|Grills"]
  },
  {
    id: "d9-dentist-says", broad: true, text: "Name something a dentist says to patients",
    miracle: "Rinse|Rinse|Rinse and spit|Rinse out|Time to rinse|Swish|Please rinse", miracleNote: "\"Rinse\" is one of the last things you hear before you leave the chair.",
    trap: "Fire", trapNote: "Fire is nothing a dentist says to a patient.",
    t75: ["Rinse|Rinse and spit|Rinse out|Time to rinse","Bite down|Bite together|Close|Close your mouth","Open wider|Open wide|Wider|A little wider","Turn your head|Turn to me|Turn towards me|Turn to the left","Sharp scratch|Sharp scratch coming|A little pinch|Little pinch","Any pain|Any pain at all|Does that hurt|Does it hurt"],
    t50: ["Open wide|Open up|Open your mouth|Open","Floss|Floss more|You should floss|You need to floss","Relax|Just relax|Try to relax|Stay relaxed","Spit|Rinse|Rinse and spit|Spit out","Bite down|Bite together|Bite|Close","Cavity|You have a cavity|You've got a cavity|You have a cavity there","See you in six months|See you in 6 months|Come back in six months|Come back in 6 months","Cut down on sugar|Cut back on sugar|Reduce your sugar|Less sugar"],
    t25: ["Open wide|Open up|Open your mouth","Floss|You need to floss|Do you floss","Brush twice a day|Brush your teeth","Rinse|Spit|Rinse and spit","Bite down|Bite together","Relax|Just relax","Any pain|Does that hurt|Are you ok|Are you okay","See you in six months|Come back in six months","Cavity|You have a cavity","Cut down on sugar"],
    t10: ["Open wide|Open up|Open your mouth","Floss","Brush twice a day","Rinse|Spit|Rinse and spit","Relax|Just relax","Bite down|Bite together"]
  },
  {
    id: "d9-dental-sound", broad: true, text: "Name a sound you hear at the dentist",
    miracle: "Compressor|Compressor|Air compressor|The compressor", miracleNote: "The compressor hums away in the background in many dental surgeries.",
    trap: "Thunder", trapNote: "Thunder is not a typical dental office sound.",
    t75: ["Compressor|Air compressor|The compressor|Compressor hum","Ultrasonic scaler|Ultrasonic|Scaler|Cavitron","Suction|Saliva ejector|Slurp|Slurping","Water spray|Water|Water squirting|Air spray","Mirror|Mirror tapping|Tapping|Tap tap"],
    t50: ["Drill|Dental drill|The drill|Handpiece","Suction|Saliva ejector|Slurp|Slurping","Music|Radio|Background music|Soft music","Phone ringing|Phone|Telephone|Telephone ringing"],
    t25: ["Drill|The drill|Dental drill|Drilling","Suction|Slurp|Vacuum","Music|Radio","Water spray|Water|Spray","Scraping|Scraper|Scaling|Scaler","Beeping|Beep","Phone ringing|Ringing","Talking|Voices|Chatter","Compressor|Compressor hum"],
    t10: ["Drill|The drill|Dental drill|Drilling","Suction|Slurp|Vacuum","Music|Radio","Scraping|Scraper|Scaling","Water spray|Water"]
  },
  {
    id: "d9-sweetener", broad: true, text: "Name a sugar-free sweetener",
    miracle: "Isomalt|Isomalt", miracleNote: "Isomalt is a sugar alcohol used in sugar-free hard candies.",
    trap: "Honey", trapNote: "Honey is natural but it is still sugar and bad for teeth.",
    t75: ["Isomalt","Maltitol","Mannitol","Lactitol","Allulose|Psicose","Neotame","Advantame","Cyclamate|Sodium cyclamate","Acesulfame potassium|Acesulfame K|Ace-K","Thaumatin","Brazzein","Monk fruit|Luo han guo|Mogroside","Yacon","Erythritol","Sorbitol","Tagatose","Xylitol"],
    t50: ["Stevia|Steviol glycosides|Truvia","Aspartame|NutraSweet|Equal","Sucralose|Splenda","Saccharin|Sweet'N Low|Sweet N Low","Xylitol","Erythritol","Sorbitol","Monk fruit","Acesulfame potassium"],
    t25: ["Stevia","Aspartame","Sucralose|Splenda","Saccharin","Xylitol","Artificial sweetener|Artificial sweeteners"],
    t10: ["Stevia","Aspartame","Splenda|Sucralose","Xylitol","Saccharin"]
  },
  {
    id: "d9-teething-sign", broad: true, text: "Name a sign that a baby is teething",
    miracle: "Ear pulling|Ear pulling|Pulling at ears|Rubbing ears|Tugging ears|Pulling at the ear", miracleNote: "Babies sometimes tug an ear because gum pain radiates there.",
    trap: "Sneezing", trapNote: "Sneezing is not a classic sign of teething.",
    t75: ["Ear pulling|Pulling at ears|Rubbing ears|Tugging ears","Cheek rubbing|Rubbing cheeks|Red cheeks|Flushed cheeks","Facial rash|Chin rash|Drool rash|Rash around the mouth","Biting|Gnawing|Chewing|Chewing on things","Gum swelling|Swollen gums|Red gums|Tender gums","Refusing food|Eating less|Not eating|Reduced appetite","Waking at night|Poor sleep|Night waking|Sleep disturbance","Mild fever|Slight fever|Low temperature|Low-grade fever","Pacifier chewing|Dummy chewing|Dummy biting|Biting the dummy","Runny nose|Cough","Loose stools|Diarrhoea|Diarrhea|Nappy rash"],
    t50: ["Drooling|Dribbling|Excess saliva|Lots of drool","Crying|Fussiness|Irritability|Grumpiness","Chewing|Biting|Gnawing","Sore gums|Swollen gums|Tender gums|Red gums","Not sleeping|Sleeplessness|Trouble sleeping|Night waking","Refusing food|Not eating","Rubbing gums|Finger in mouth|Hand in mouth|Fist in mouth","Fever|Slight fever|Mild fever","Rash|Chin rash","Pulling ears|Ear pulling"],
    t25: ["Drooling|Dribbling|Drool","Crying|Fussiness|Irritability","Chewing|Biting","Sore gums|Swollen gums|Red gums","Not sleeping|Sleeplessness","Fever|Mild fever","Rash"],
    t10: ["Drooling|Dribbling|Drool","Crying|Fussy|Fussiness|Irritability","Chewing|Biting","Sore gums"]
  },
  {
    id: "d9-animal-teeth-grow", broad: true, text: "Name an animal whose teeth keep growing or get replaced",
    miracle: "Manatee|Manatee|Manatees|Sea cow", miracleNote: "Manatees constantly replace worn molars, which move forward like a conveyor belt.",
    trap: "Cat", trapNote: "Cats lose baby teeth once and do not regrow them.",
    t75: ["Manatee|Sea cow|Dugong","Kangaroo|Wallaby","Elephant","Gecko|Geckos","Snake|Snakes","Piranha","Sawfish","Naked mole rat|Naked mole-rat","Vole|Voles","Lemming|Lemmings","Guinea pig|Cavy","Chinchilla","Capybara","Agouti","Porcupine","Muskrat","Nutria|Coypu","Hare|Pika","Wombat","Hippo|Hippopotamus","Walrus","Narwhal","Warthog","Sperm whale|Whale"],
    t50: ["Beaver|Beavers","Rabbit|Rabbits|Bunny","Hamster|Hamsters","Mouse|Mice","Rat|Rats","Squirrel|Squirrels","Shark|Sharks|Great white shark","Alligator|Crocodile|Gator|Alligators","Gerbil","Ferret","Rodent|Rodents","Horse|Horses"],
    t25: ["Beaver","Rabbit","Rat|Mouse|Hamster","Shark","Alligator|Crocodile","Squirrel","Guinea pig"],
    t10: ["Beaver","Rabbit","Rat","Shark","Mouse","Hamster"]
  },
  {
    id: "d9-animal-no-teeth", broad: true, text: "Name an animal that has no teeth",
    miracle: "Pangolin|Pangolin|Pangolins|Scaly anteater", miracleNote: "Pangolins have no teeth at all and crush food in a muscular stomach.",
    trap: "Shark", trapNote: "Sharks have rows of teeth.",
    t75: ["Pangolin|Pangolins","Echidna|Spiny anteater","Platypus|Duckbill platypus","Aardvark|Aardvarks","Giant anteater|Tamandua","Seahorse|Pipefish","Sea turtle|Turtle|Tortoise|Terrapin","Toad|Toads","Hummingbird","Penguin","Ostrich","Emu","Kiwi","Pelican","Stork","Toucan","Humpback whale|Baleen whale|Right whale|Bowhead whale","Lamprey","Hagfish","Octopus|Squid"],
    t50: ["Whale|Whales|Blue whale","Anteater|Anteaters","Bird|Birds","Turtle|Turtles|Tortoise","Chicken|Hen|Duck|Goose","Snail|Slug|Worm|Earthworm","Frog|Frogs|Toad","Insect|Insects|Butterfly|Bee","Spider|Spiders","Jellyfish"],
    t25: ["Birds|Bird","Turtle|Tortoise","Whale|Blue whale","Anteater","Chicken|Duck","Frog|Toad","Snail"],
    t10: ["Bird|Birds","Turtle|Turtles","Chicken","Whale","Anteater","Fish"]
  },
  {
    id: "d9-periodontium", text: "Name a part of the periodontium",
    miracle: "Sharpey's fibres|Sharpey's fibres|Sharpey's fibers|Sharpeys fibres|Sharpey fibres|Sharpey fibers", miracleNote: "Sharpey's fibres anchor the periodontal ligament into cementum and bone.",
    trap: "Pulp", trapNote: "The pulp lies inside the tooth, not in the supporting tissues.",
    t75: ["Sharpey's fibres|Sharpey's fibers|Sharpey fibres","Interdental papilla|Interdental col|Col","Junctional epithelium|Sulcular epithelium|Oral epithelium|Gingival epithelium","Free gingival groove|Free gingival margin|Marginal gingiva|Gingival margin","Mucogingival junction|Mucogingival line","Cementoenamel junction|CEJ|Cemento-enamel junction","Lamina dura|Cribriform plate|Bundle bone|Alveolar bone proper","Cortical bone|Trabecular bone|Cancellous bone|Spongy bone","Rests of Malassez|Epithelial rests of Malassez|Epithelial cell rests","Gingival sulcus|Gingival crevice|Sulcus","Principal fibres|Principal fibers|Gingival fibres|Transseptal fibres"],
    t50: ["Gingiva|Gums|Gum|Gingivae","Periodontal ligament|PDL|PDL fibres|Periodontal membrane","Cementum|Cement|Root cementum","Alveolar bone|Alveolar process|Bone|Socket","Attached gingiva|Attached gum|Keratinised gingiva|Keratinized gingiva","Free gingiva|Free gum|Marginal gum","Gingival papilla|Papilla|Interdental gingiva","Furcation|Root furcation"],
    t25: ["Gingiva|Gums","Periodontal ligament|PDL","Cementum","Alveolar bone","Attached gingiva","Free gingiva"],
    t10: ["Gums|Gingiva","Periodontal ligament|PDL","Bone|Jawbone|Jaw bone","Cementum"]
  },
  {
    id: "d9-mouth-infection", text: "Name an infection that can affect the mouth",
    miracle: "Noma|Noma|Cancrum oris", miracleNote: "Noma is a rapidly destructive infection of the mouth and face linked to malnutrition.",
    trap: "Appendicitis", trapNote: "Appendicitis affects the abdomen, not the mouth.",
    t75: ["Noma|Cancrum oris","Ludwig's angina|Ludwigs angina","Actinomycosis|Lumpy jaw","Syphilis|Oral syphilis|Mucous patches","Gonorrhoea|Gonorrhea|Oral gonorrhoea","Tuberculosis|TB|Oral TB","Histoplasmosis","Mucormycosis","Cytomegalovirus|CMV","Epstein-Barr virus|EBV|Glandular fever|Mononucleosis","Herpangina|Coxsackie|Coxsackievirus","Measles|Koplik spots","Mumps","Diphtheria","Scarlet fever","Osteomyelitis|Jaw osteomyelitis","Osteoradionecrosis|ORN","Cellulitis|Facial cellulitis","Sialadenitis|Sialadenitis of salivary glands|Parotitis|Parotid infection","Tonsillitis|Quinsy|Peritonsillar abscess"],
    t50: ["Oral thrush|Thrush|Candidiasis|Candida","Cold sore|Cold sores|Herpes labialis|Herpes simplex","Gingivostomatitis|Herpetic gingivostomatitis|Primary herpetic gingivostomatitis","Hand, foot and mouth disease|Hand foot and mouth|HFMD|Hand foot and mouth disease","Trench mouth|Vincent's infection|ANUG|Necrotising gingivitis","Dental abscess|Abscess|Tooth abscess","Strep throat|Strep|Streptococcal pharyngitis","Angular cheilitis|Angular stomatitis|Perleche","Shingles|Herpes zoster|Zoster","HPV|Human papillomavirus|Oral warts|Warts","HIV|Oral hairy leukoplakia","Sinusitis"],
    t25: ["Thrush|Oral thrush|Candidiasis","Cold sore|Herpes","Abscess|Dental abscess","Hand foot and mouth disease|HFMD","Strep throat","Gingivitis|Gum disease","Tooth decay|Caries","Tonsillitis"],
    t10: ["Thrush|Oral thrush","Cold sore|Cold sores|Herpes","Abscess|Dental abscess","Gum disease|Gingivitis","Tooth decay|Cavity"]
  },
  {
    id: "d9-tongue-condition", text: "Name a condition that can affect the tongue",
    miracle: "Median rhomboid glossitis|Median rhomboid glossitis|Central papillary atrophy", miracleNote: "Median rhomboid glossitis is a diamond-shaped red patch in the middle of the tongue, often fungal.",
    trap: "Tonsillitis", trapNote: "Tonsillitis affects the tonsils, not the tongue itself.",
    t75: ["Median rhomboid glossitis|Central papillary atrophy","Atrophic glossitis|Bald tongue|Smooth tongue|Pernicious anaemia tongue","Fissured tongue|Scrotal tongue|Furrowed tongue","Benign migratory glossitis|Erythema migrans|Geographic tongue|Wandering rash of the tongue","Oral hairy leukoplakia|Hairy leukoplakia","Black hairy tongue|Hairy tongue|Lingua villosa nigra","Macroglossia|Enlarged tongue","Ankyloglossia|Tongue-tie|Tongue tie|Tongue-tied","Lingual thyroid","Lingual tonsil|Lingual tonsillitis","Ranula|Mucocele|Mucous cyst","Glossodynia|Burning tongue|Burning mouth syndrome|BMS","Amyloidosis|Amyloid","Angioedema|Hereditary angioedema","Plummer-Vinson syndrome|Plummer Vinson","Scalloped tongue|Crenated tongue","Strawberry tongue|Raspberry tongue","Coated tongue|Furred tongue|White coated tongue|White tongue"],
    t50: ["Oral thrush|Thrush|Candidiasis","Geographic tongue|Benign migratory glossitis","Tongue-tie|Ankyloglossia","Black hairy tongue|Hairy tongue","Glossitis|Inflamed tongue|Swollen tongue|Tongue inflammation","Fissured tongue|Cracked tongue|Furrowed tongue","Tongue cancer|Oral cancer|Cancer of the tongue","Leukoplakia|White patch","Lichen planus|Oral lichen planus","Ulcer|Mouth ulcer|Tongue ulcer|Canker sore","Burning mouth syndrome|Burning tongue","Strawberry tongue","Macroglossia","Coated tongue|White tongue"],
    t25: ["Thrush|Oral thrush","Geographic tongue","Tongue-tie|Ankyloglossia","Glossitis","Tongue cancer|Oral cancer","Ulcer|Mouth ulcer|Canker sore","Black hairy tongue"],
    t10: ["Thrush|Oral thrush","Tongue-tie|Tongue tie","Ulcer|Mouth ulcer|Canker sore","Cancer|Tongue cancer","Glossitis"]
  },
  {
    id: "d9-contact-sport", broad: true, text: "Name a sport where players often lose or chip teeth",
    miracle: "Roller derby|Roller derby", miracleNote: "Roller derby skaters take frequent falls and elbows to the face.",
    trap: "Chess", trapNote: "Chess is not known for dental injuries.",
    t75: ["Roller derby","Water polo","Field hockey","Ice hockey|Hockey","Lacrosse","Rugby league|Rugby union|Rugby","Australian rules football|AFL|Aussie rules","Gaelic football|Hurling|Camogie","Handball","Netball","Skateboarding|Skating|Rollerblading|Inline skating","BMX|Mountain biking|Cycling|Biking","Snowboarding|Skiing|Skiing","Skiing","Surfing|Bodyboarding","Parkour","Cheerleading|Gymnastics","Trampolining|Trampoline","Equestrian|Horse riding|Rodeo|Bull riding","Polo","Cricket","Softball","Ultimate frisbee|Frisbee|Ultimate","Kickboxing|Muay Thai|Taekwondo|Karate"],
    t50: ["Hockey|Ice hockey","Boxing","Rugby","Football|American football|Gridiron","Basketball","Lacrosse","MMA|Mixed martial arts|Ultimate fighting|UFC","Martial arts|Wrestling","Baseball","Soccer|Football (soccer)","Skateboarding","Cycling|Biking","Water polo","Field hockey","Skiing|Snowboarding","Gymnastics","Netball"],
    t25: ["Hockey|Ice hockey","Boxing","Rugby","Football","Basketball","Lacrosse","MMA","Baseball","Soccer"],
    t10: ["Hockey|Ice hockey","Boxing","Rugby","Football|American football","Basketball"]
  },
  {
    id: "d9-dental-school", text: "Name a dental school or university with a dental school",
    miracle: "Dundee|University of Dundee|Dundee|Dundee Dental School", miracleNote: "Dundee Dental School in Scotland is among the UK's most respected.",
    trap: "MIT", trapNote: "MIT has no dental school.",
    t75: ["University of Dundee|Dundee","University of Glasgow|Glasgow","University of Edinburgh|Edinburgh","University of Aberdeen|Aberdeen","Cardiff University|Cardiff","University of Bristol|Bristol","University of Liverpool|Liverpool","University of Manchester|Manchester","University of Leeds|Leeds","University of Sheffield|Sheffield","University of Birmingham|Birmingham","Newcastle University|Newcastle","Queen Mary University of London|Barts and The London|Barts","King's College London|King's|KCL|Guy's","University of Plymouth|Plymouth","University of Central Lancashire|UCLan","University of Dundee","Queen's University Belfast|Belfast|Queens Belfast","Trinity College Dublin|Dublin Dental School|University College Cork|UCC","University of Sydney|Sydney","University of Melbourne|Melbourne","University of Adelaide|Adelaide","University of Queensland|Queensland","University of Western Australia|UWA","University of Otago|Otago","University of Toronto|Toronto","McGill University|McGill","University of British Columbia|UBC","Dalhousie University|Dalhousie","Western University|Western","University of Alberta|Alberta","University of Manitoba|Manitoba","University of Michigan|Michigan","University of Pennsylvania|Penn|UPenn","University of California San Francisco|UCSF","University of California Los Angeles|UCLA","University of Southern California|USC","Harvard School of Dental Medicine|Harvard","Columbia University|Columbia","New York University|NYU","Tufts University|Tufts","Boston University|BU","University of Maryland|Maryland","University of North Carolina|UNC","University of Iowa|Iowa","University of Washington|UW","Ohio State University|Ohio State","Texas A&M","University of Texas|UT Dental","Loma Linda University|Loma Linda","Case Western|Case Western Reserve","Marquette University|Marquette"],
    t50: ["Harvard","UCSF|University of California San Francisco","University of Michigan|Michigan","NYU|New York University","Columbia","Penn|University of Pennsylvania","UCLA","USC","Tufts","University of Toronto|Toronto","McGill","King's College London|KCL","Barts|Queen Mary","University of Sydney|Sydney","University of Melbourne|Melbourne","University of Manchester|Manchester","University of Leeds|Leeds","University of Glasgow|Glasgow","University of Edinburgh|Edinburgh","Cardiff University|Cardiff","University of Liverpool|Liverpool","University of Birmingham|Birmingham","Newcastle University|Newcastle"],
    t25: ["Harvard","University of Michigan|Michigan","King's College London|KCL","UCSF","Columbia","NYU","University of Toronto|Toronto","University of Manchester|Manchester","University of Leeds|Leeds"],
    t10: ["Harvard","King's College London|KCL","University of Michigan|Michigan","UCSF","Columbia"]
  },
  {
    id: "d9-oral-cancer-sign", text: "Name a sign of oral cancer",
    miracle: "Erythroplakia|Erythroplakia", miracleNote: "Erythroplakia is a red patch that carries a high risk of malignant change.",
    trap: "Bad breath", trapNote: "Bad breath has many harmless causes and is not a specific sign.",
    t75: ["Erythroplakia|Red patch","Leukoplakia|White patch","Speckled leukoplakia|Erythroleukoplakia|Speckled patch","Trismus|Difficulty opening|Restricted opening|Limited opening","Paraesthesia|Paresthesia|Numbness|Numb lip","Odynophagia|Painful swallowing|Pain on swallowing","Dysphagia|Difficulty swallowing|Trouble swallowing|Swallowing difficulties","Dysarthria|Speech changes|Slurred speech|Change in voice","Referred otalgia|Ear pain|Earache|Pain in the ear","Neck lump|Lump in neck|Swollen neck glands|Enlarged lymph nodes","Weight loss|Unexplained weight loss|Losing weight","Loose teeth|Teeth loosening|Tooth mobility|Unexplained loose teeth","Ill-fitting dentures|Dentures no longer fit|Dentures not fitting|Denture sores","Bleeding|Unexplained bleeding|Bleeding in the mouth|Oral bleeding"],
    t50: ["Mouth ulcer|Ulcer|Non-healing ulcer|Ulcer that won't heal","Lump|Mouth lump|Lump in mouth|Growth","White patch|Leukoplakia","Red patch|Erythroplakia","Numbness|Numb","Pain|Persistent pain|Mouth pain|Sore mouth","Loose teeth|Tooth loss|Teeth loosening","Difficulty swallowing|Trouble swallowing|Dysphagia|Painful swallowing","Bleeding|Bleeding in the mouth|Unexplained bleeding","Sore throat|Persistent sore throat|Lump in throat|Feeling something in the throat","Hoarseness|Voice change|Change in voice","Ear pain|Earache","Neck lump|Lump in neck|Swollen glands","Weight loss"],
    t25: ["Mouth ulcer|Ulcer|Non-healing ulcer","Lump|Growth|Swelling","White patch|Leukoplakia","Red patch|Erythroplakia","Numbness","Pain","Difficulty swallowing","Bleeding","Sore throat"],
    t10: ["Mouth ulcer|Ulcer|Sore that won't heal","Lump|Growth|Swelling","White patch","Red patch","Pain","Bleeding"]
  },
  {
    id: "d9-material-property", text: "Name a property of a dental material",
    miracle: "Radiopacity|Radiopacity|Radio-opacity|Radiopaque", miracleNote: "Radiopacity lets a filling or cement show up clearly on an x-ray.",
    trap: "Taste", trapNote: "Taste is not a typical engineering property of dental materials.",
    t75: ["Radiopacity|Radio-opacity|Radiopaque","Thixotropy|Pseudoplasticity|Shear thinning","Syneresis|Imbibition","Tear strength|Tearing strength|Tear resistance","Detail reproduction|Detail|Accuracy|Dimensional accuracy","Hysteresis|Resilience|Toughness|Fracture toughness","Proportional limit|Yield strength|Yield point|Elastic limit","Creep|Stress relaxation|Viscoelasticity|Viscoelastic","Degree of conversion|Polymerisation shrinkage|Polymerization shrinkage|Setting shrinkage","Hygroscopic expansion|Water sorption|Water absorption|Solubility","Coefficient of thermal expansion|Thermal expansion|CTE|Thermal diffusivity","Galvanic corrosion|Corrosion|Tarnish|Tarnish resistance","Colour stability|Color stability|Colour match|Color match","Surface roughness|Surface finish|Polishability|Gloss","Fluoride release|Fluoride uptake|Fluoride recharge|Bioactivity"],
    t50: ["Hardness|Surface hardness|Vickers hardness|Knoop hardness","Strength|Mechanical strength","Elasticity|Elastic modulus|Modulus of elasticity|Young's modulus","Brittleness|Brittle","Ductility|Malleability","Setting time|Working time|Curing time|Cure time","Viscosity|Flow|Flowability|Consistency","Wettability|Wetting|Contact angle|Surface tension","Thermal expansion|Thermal conductivity","Solubility","Biocompatibility","Colour|Color|Shade","Translucency|Opacity","Wear resistance|Wear","Radiopacity","Adhesion|Bonding|Bond strength","Toughness","Porosity"],
    t25: ["Hardness","Strength","Elasticity|Stiffness","Brittleness","Setting time|Working time","Viscosity","Biocompatibility","Colour|Shade","Wear resistance","Thermal expansion"],
    t10: ["Hardness","Strength","Colour|Color|Shade","Durability|Longevity","Setting time"]
  },
  {
    id: "d9-medical-condition", text: "Name a medical condition a dentist needs to know about before treatment",
    miracle: "Bisphosphonate use|Bisphosphonates|Bisphosphonate therapy|Alendronate|Zoledronic acid|Zometa|Fosamax|Denosumab|Prolia", miracleNote: "Patients on bisphosphonates have a risk of jaw osteonecrosis after extractions.",
    trap: "Ingrown toenail", trapNote: "An ingrown toenail has no relevance to dental treatment.",
    t75: ["Bisphosphonate use|Bisphosphonates|Osteoporosis|Osteoporosis treatment","Prosthetic heart valve|Artificial heart valve|Heart valve replacement|Infective endocarditis","Anticoagulants|Warfarin|Blood thinners|Blood thinner","Haemophilia|Hemophilia|Von Willebrand disease|Von Willebrand's disease","Adrenal insufficiency|Addison's disease|Addisons disease|Steroid use","HIV|AIDS|HIV/AIDS|Hepatitis B","Latex allergy|Penicillin allergy|Allergies|Allergy","Pregnancy|Pregnant|Breastfeeding|Lactation","Pacemaker|Implantable defibrillator|ICD|Joint replacement"],
    t50: ["Diabetes|Type 1 diabetes|Type 2 diabetes|Diabetic","Heart disease|Heart condition|Heart problems|Cardiac disease","High blood pressure|Hypertension|Blood pressure","Asthma|COPD|Lung disease|Respiratory disease","Epilepsy|Seizures|Fits","Pregnancy|Pregnant","Allergies|Allergy|Penicillin allergy|Latex allergy","HIV|AIDS|Hepatitis","Bleeding disorder|Haemophilia|Hemophilia","Anticoagulants|Warfarin|Blood thinners","Osteoporosis|Bisphosphonates","Cancer|Chemotherapy|Radiotherapy","Kidney disease|Renal disease","Liver disease","Stroke","Thyroid disease|Thyroid","Anxiety|Dental phobia|Dental anxiety","Pacemaker","Joint replacement"],
    t25: ["Diabetes","Heart disease|Heart condition","High blood pressure|Hypertension","Asthma","Epilepsy","Pregnancy","Allergies|Allergy","HIV|Hepatitis","Blood thinners|Warfarin","Cancer"],
    t10: ["Diabetes","Heart disease|Heart condition|Heart problems","High blood pressure|Hypertension","Allergies|Allergy","Asthma","Pregnancy"]
  },
  {
    id: "d9-fresh-breath", broad: true, text: "Name a way people freshen their breath",
    miracle: "Chewing parsley|Parsley|Chewing parsley|Chew parsley|Fresh parsley", miracleNote: "Parsley's chlorophyll is an old folk remedy for bad breath.",
    trap: "Garlic", trapNote: "Garlic is a famous cause of bad breath, not a cure.",
    t75: ["Parsley|Chewing parsley|Fresh parsley","Fennel seeds|Fennel|Aniseed|Anise","Mint leaves|Fresh mint|Chewing mint|Peppermint leaves","Green tea|Tea|Black tea","Yogurt|Yoghurt|Probiotics|Probiotic yogurt","Oil pulling|Coconut oil|Swishing oil","Apple|Apples|Celery|Carrots","Tongue scraping|Tongue scraper|Tongue cleaner|Scraping the tongue","Baking soda|Bicarbonate of soda","Lemon water|Lemon|Lemon juice","Zinc lozenges|Zinc|Zinc gum","Chlorophyll tablets|Chlorophyll|Chlorophyll gum|Activated charcoal","Breath strips|Mouth spray|Breath spray","Lozenges|Throat lozenges|Cough drops|Cough sweets","Candy|Hard candy|Sugar-free candy|Sugarless candy"],
    t50: ["Mints|Mint|Breath mints|Peppermints","Gum|Chewing gum|Sugar-free gum|Mint gum","Brushing|Brushing teeth|Brush your teeth|Brush","Mouthwash|Mouth rinse|Mouth wash|Listerine","Floss|Flossing|Dental floss","Water|Drinking water|Drink water|Rinse with water","Breath spray|Mouth spray|Breath freshener|Breath strips","Tongue scraper|Tongue scraping|Brushing tongue|Brush your tongue","Toothpaste|Toothpaste on finger|Finger brushing","Parsley|Fennel seeds|Cloves|Cardamom","Cinnamon gum|Cinnamon|Cinnamon candy","Apples|Apple","Yogurt","Green tea|Tea","Lozenges|Cough drops","Eating"],
    t25: ["Mints|Mint|Breath mints","Gum|Chewing gum","Brushing|Brush your teeth","Mouthwash|Mouth rinse","Floss|Flossing","Water|Drinking water","Breath spray","Tongue scraper"],
    t10: ["Mints|Mint|Breath mints","Gum|Chewing gum","Brushing|Brush your teeth|Brushing teeth","Mouthwash|Mouth rinse","Floss|Flossing"]
  },
  {
    id: "d9-sour-candy", broad: true, text: "Name a sour candy",
    miracle: "Toxic Waste|Toxic Waste|Toxic Waste candy|Toxic Waste Hazardously Sour Candy", miracleNote: "Toxic Waste is a famously extreme-sour candy sold in drum-shaped tubs.",
    trap: "Chocolate bar", trapNote: "Chocolate bars are sweet, not sour.",
    t75: ["Toxic Waste|Toxic Waste candy","Warheads|War Heads|Extreme Sour Warheads|Mega Warheads","Cry Babies|Cry Baby","Lemonheads|Lemon Heads","Sour Punch|Sour Punch Straws|Sour Punch Bites","Sour Belts|Sour Belt|Haribo Sour Belts|Haribo Sour Streamers","Trolli|Trolli Sour Brite Crawlers|Sour Brite Crawlers|Sour Brite Eggs","Mamba Sours|Sour Mambas|Mamba","Skittles Sours|Sour Skittles","Nerds|Wonka Nerds|Nerds Gummy Clusters","Sweetarts|SweeTarts|Sweet Tarts|Sweetart Chews","Airheads Xtremes|Airheads Xtreme|Xtremes|Airheads Xtreme Sourfuls","Fizzers|Fizz|Fizz Wiz|Fizzy Pop Rocks","Dib Dab|Dip Dab|Sherbet Dip Dab|Sherbet Fountain"],
    t50: ["Sour Patch Kids|Sour Patch|Sour Patch Watermelon","Warheads","Jolly Rancher|Jolly Ranchers|Jolly Rancher Fruit Chews","Skittles Sour|Sour Skittles","Airheads","Sour Gummy Worms|Sour Gummy Bears|Sour Gummies|Sour Worms","Lemonheads","Sweetarts|SweeTarts","Sour Straws|Sour Punch Straws","Haribo Sour|Haribo Sour Bears|Haribo Sour Gold Bears|Haribo Goldbears Sour","Nerds","Trolli|Trolli Sour Brite Crawlers","Cry Babies","Candy Crush|Sour Candy|Sour candies","Sour Power|Sour Power Belts","Fruit Gushers|Gushers","Starburst Sour|Sour Starburst","Life Savers Sour|Lifesavers Sour","Lifesavers|Life Savers","Lemon drops|Lemon drop","Fruit Pastilles|Fruit pastille","Fruit Salad|Refreshers"],
    t25: ["Sour Patch Kids|Sour Patch","Warheads","Jolly Rancher","Skittles Sour","Airheads","Sour Gummy Worms|Sour worms","Lemonheads","Sweetarts|SweeTarts","Sour Belts"],
    t10: ["Sour Patch Kids|Sour Patch","Warheads","Skittles|Sour Skittles","Jolly Rancher|Jolly Ranchers","Sweetarts|SweeTarts"]
  },
  {
    id: "d9-tmj-structure", text: "Name a structure of the temporomandibular joint",
    miracle: "Retrodiscal tissue|Retrodiscal tissue|Bilaminar zone|Posterior attachment", miracleNote: "Retrodiscal tissue is the vascular, nerve-rich pad behind the articular disc.",
    trap: "Femur", trapNote: "The femur is in the leg, not the jaw joint.",
    t75: ["Retrodiscal tissue|Bilaminar zone|Posterior attachment","Articular eminence|Articular tubercle|Eminentia","Postglenoid tubercle|Postglenoid process","Sphenomandibular ligament","Stylomandibular ligament","Temporomandibular ligament|Lateral ligament|TMJ ligament","Synovial membrane|Synovium|Synovial fluid","Joint capsule|Capsule|Capsular ligament","Lateral pterygoid|Superior head of lateral pterygoid|Inferior head of lateral pterygoid","Coronoid process|Ramus"],
    t50: ["Articular disc|Disc|Meniscus|Articular meniscus","Condyle|Mandibular condyle|Condylar head|Head of mandible","Glenoid fossa|Mandibular fossa|Temporal fossa|Articular fossa","Joint capsule","Ligaments|Ligament","Synovial membrane","Temporal bone"],
    t25: ["Condyle|Mandibular condyle","Articular disc|Disc","Glenoid fossa|Mandibular fossa","Ligaments|Ligament"],
    t10: ["Condyle","Disc|Articular disc","Jaw|Mandible","Ligament|Ligaments"]
  },
  {
    id: "d9-decay-cause", broad: true, text: "Name a cause of tooth decay",
    miracle: "Dry mouth|Dry mouth|Xerostomia|Hyposalivation", miracleNote: "Less saliva means less natural protection against acid.",
    trap: "Brushing too gently", trapNote: "Gentle brushing is fine; poor cleaning and sugar are what matter.",
    t75: ["Dry mouth|Xerostomia|Hyposalivation|Low saliva","Gastric reflux|Acid reflux|GERD|Reflux","Bulimia|Vomiting|Eating disorder","Deep fissures|Pits and fissures|Deep grooves","Crowded teeth|Crowding|Overcrowding","Orthodontic braces|Braces|Brackets","Exposed roots|Receding gums|Gum recession|Root exposure","Medications|Medication|Sugary medicines|Sugary medicine","Radiotherapy|Head and neck radiotherapy|Radiation therapy","Lack of fluoride|Low fluoride|No fluoride","Genetics|Family history|Heredity","Sleeping with a bottle|Bedtime bottle|Baby bottle|Bottle feeding"],
    t50: ["Plaque|Dental plaque|Biofilm","Bacteria|Oral bacteria|Streptococcus mutans","Acid|Acids|Acid attack|Acidic drinks","Snacking|Frequent snacking|Grazing","Starch|Starches|Carbohydrates|Refined carbohydrates","Sticky food|Sticky foods|Sticky sweets|Toffee","Fizzy drinks|Soda|Soft drinks|Energy drinks","Sugary drinks|Sugar-sweetened drinks","Not flossing|Poor flossing|Lack of flossing","Poor brushing|Poor oral hygiene|Not brushing","Tartar|Calculus"],
    t25: ["Sugar|Sugars","Bacteria","Plaque","Poor brushing|Poor oral hygiene|Not brushing","Soda|Fizzy drinks","Snacking","Sweets|Candy","Acid","Not flossing"],
    t10: ["Sugar|Sugars","Bacteria","Plaque","Sweets|Candy","Soda|Fizzy drinks","Not brushing|Poor brushing|Poor oral hygiene"]
  },
  {
    id: "d9-hygienist-does", broad: true, text: "Name something a dental hygienist does",
    miracle: "Periodontal charting|Periodontal charting|Gum charting|Pocket charting|Probing depths", miracleNote: "Hygienists measure gum pockets with a probe and record the numbers.",
    trap: "Perform surgery", trapNote: "Hygienists do not perform major oral surgery.",
    t75: ["Periodontal charting|Gum charting|Pocket charting|Probing depths","Oral cancer screening|Cancer screening|Soft tissue exam","Desensitising|Desensitizing|Desensitising treatment|Apply desensitiser","Fluoride varnish|Fluoride application|Fluoride treatment|Applying fluoride","Sealants|Fissure sealants|Applying sealants|Placing sealants","Dental impressions|Impressions|Taking impressions|Study models","Local anaesthetic|Local anesthetic|Giving injections|Injections","Dietary advice|Diet advice|Nutritional counselling|Nutritional counseling","Smoking cessation|Quit smoking advice|Stop smoking advice"],
    t50: ["Scale and polish|Scaling|Scaling and polishing|Cleaning","Remove plaque|Plaque removal|Remove tartar|Tartar removal","Oral hygiene instruction|Brushing advice|Teach brushing|Teach flossing","X-rays|Take x-rays|Dental x-rays|Radiographs","Root planing|Deep cleaning|Root debridement|Scaling and root planing","Whitening|Teeth whitening","Stain removal|Remove stains|Air polishing|Airflow","Check gums|Gum check|Gum health check"],
    t25: ["Clean teeth|Cleaning|Scale and polish|Scaling","Remove plaque|Remove tartar","Teach brushing|Oral hygiene instruction|Brushing advice","X-rays|Take x-rays","Floss|Flossing advice","Polish teeth|Polishing","Deep cleaning|Root planing"],
    t10: ["Clean teeth|Cleaning|Scale and polish|Scaling","Remove plaque|Remove tartar","Teach brushing|Oral hygiene instruction|Brushing advice","X-rays"]
  },
  {
    id: "d9-dental-tourism", broad: true, text: "Name a country people travel to for cheaper dental work",
    miracle: "Lithuania|Lithuania", miracleNote: "Lithuania offers EU-standard dental care at much lower prices than Western Europe.",
    trap: "Switzerland", trapNote: "Switzerland is known for very high dental prices, not bargains.",
    t75: ["Lithuania","Latvia","Estonia","Bulgaria","Romania","Slovakia","Slovenia","Serbia","Montenegro","Albania","Bosnia|Bosnia and Herzegovina","Georgia","Armenia","Ukraine","Cyprus|Northern Cyprus","Egypt","Jordan","Lebanon","Tunisia","Morocco","Vietnam","Philippines","Malaysia","Indonesia|Bali","Sri Lanka","Cambodia","Panama","Colombia","Dominican Republic|Costa Rica","Peru","Argentina","Brazil"],
    t50: ["Hungary|Budapest","Poland|Warsaw|Krakow","Czech Republic|Czechia|Prague","Croatia|Zagreb","Turkey|Istanbul|Antalya","Thailand|Bangkok|Phuket","India|Delhi|Mumbai","Mexico|Los Algodones|Tijuana|Cancun","Costa Rica","Colombia|Medellin","Spain|Barcelona|Malaga","Portugal|Lisbon","Greece","South Korea|Seoul","Dubai|UAE|United Arab Emirates"],
    t25: ["Hungary","Poland","Turkey","Thailand","India","Mexico","Costa Rica","Spain","Czech Republic","Croatia"],
    t10: ["Mexico","Turkey","Thailand","Hungary","Poland","India"]
  },
  {
    id: "d9-braces-type", broad: true, text: "Name a type of braces or teeth straightening",
    miracle: "Self-ligating braces|Self-ligating|Self ligating braces|Damon|Damon braces|Damon System", miracleNote: "Self-ligating brackets use a sliding clip instead of elastic ties.",
    trap: "Hair clip", trapNote: "A hair clip is not a dental device.",
    t75: ["Self-ligating braces|Self-ligating|Self ligating|Damon","Lingual braces|Incognito|Incognito braces|Hidden braces","Ceramic braces|Clear braces|Tooth-coloured braces|Tooth-colored braces","Sapphire braces|Gold braces|Titanium braces|Colourful braces","Six Month Smiles|6 Month Smiles|Short-term orthodontics|Quick braces","Fixed braces|Fixed appliances|Train tracks","Functional appliance|Twin block|Herbst|Headgear","Expander|Palatal expander|Rapid palatal expander|RPE","Retainers|Hawley retainer|Essix retainer|Fixed retainer"],
    t50: ["Metal braces|Traditional braces|Brackets and wires|Brackets","Clear aligners|Invisalign|Aligners|Invisible braces","Lingual braces","Ceramic braces","Self-ligating braces","Removable braces|Removable appliance|Plate","Retainer|Retainers","Headgear","Expander"],
    t25: ["Metal braces|Traditional braces","Invisalign|Clear aligners|Aligners","Ceramic braces|Clear braces","Lingual braces","Retainers|Retainer"],
    t10: ["Metal braces|Traditional braces|Braces","Invisalign|Clear aligners|Aligners","Clear braces|Ceramic braces"]
  },
  {
    id: "d9-denture-type", text: "Name a type of denture",
    miracle: "Immediate denture|Immediate denture|Immediate dentures|Immediate complete denture|Immediate partial denture", miracleNote: "Immediate dentures are fitted on the day the teeth are removed.",
    trap: "Retainer", trapNote: "A retainer holds teeth in place after braces; it is not a denture.",
    t75: ["Immediate denture|Immediate dentures|Interim denture|Temporary denture","Overdenture|Implant overdenture|Implant-retained denture|Implant-supported denture","Cast partial denture|Cast partial|Chrome denture|Cobalt chrome denture","Flexible denture|Valplast|Flexible partial|Flexi denture","Flipper|Acrylic flipper|Stayplate","Copy denture|Duplicate denture|Spare denture","Tooth-supported overdenture|Tooth supported overdenture|Telescopic denture","Precision attachment denture|Attachment denture|Ball attachment denture|Bar-retained denture"],
    t50: ["Full denture|Complete denture|Complete dentures|Full dentures","Partial denture|Partial dentures|Removable partial denture|RPD","Acrylic denture|Acrylic dentures|Plastic denture","Implant-supported denture|Implant-retained denture|Implant denture|Implant dentures","Temporary denture|Interim denture|Immediate denture","Flexible denture|Valplast|Flipper"],
    t25: ["Full denture|Complete denture|Complete dentures|Full dentures","Partial denture|Partial dentures|Partial","Immediate denture","Implant-supported denture|Implant denture|Overdenture","Acrylic denture","Temporary denture"],
    t10: ["Full denture|Complete denture|Complete dentures|Full dentures","Partial denture|Partial dentures|Partial|Plate","Upper denture|Lower denture","Denture|Dentures"]
  }
);
