-- 20260903240000_ingredients_season_populate.sql
-- APPLICATA IN PRODUZIONE il 2026-09-03 su GO owner. 191 righe su 192.
--
-- COME, e perche' non cosi'. Sul live NON e' stato eseguito questo testo: le 191 note
-- sarebbero dovute passare dalla trascrizione di un agente dentro una chiamata MCP, che
-- e' esattamente il punto in cui un carattere cambia in silenzio e finisce pubblicato.
-- Al suo posto: una funzione helper temporanea `season_apply_189(jsonb)` (migration
-- `ingredients_season_populate_189_prepare`, droppata subito dopo con `..._cleanup`), a cui
-- il payload e' stato passato leggendo QUESTO file da disco. Stesse guardie, stessa
-- transazione unica, zero trascrizione.
-- Verifica: md5 del contenuto scritto in DB = md5 del file sorgente = 4839c349ea511dc915322d365cbb1505
-- su 191 righe (slug|status|mesi|nota|fonte, ordinate per slug), piu' un confronto campo
-- per campo: 0 differenze.
--
-- Questo file resta la dichiarazione canonica del cambiamento: un ambiente ricostruito
-- dalle sole migration, eseguendolo, ottiene la stessa tabella del live.
--
-- Generato da season_189.py il 2026-09-03. NON eseguire senza GO owner.
-- Consegna con la tabella da rivedere: 189_Ingredienti_Stagionalita_2026-09-03.md
--
-- roselle-leaves resta fuori: nessuna fonte per la finestra della FOGLIA. Vedi il .md.
-- season_verified_at resta NULL su tutte: questa e' ricerca da scrivania, non una verifica al mercato.

begin;

-- 1. Backup. Solo le colonne toccate piu' le chiavi: basta per tornare indietro.
create table public.ingredients_library_backup_2026_09_03_season as
select id, slug, season_status, season_months, season_note, season_source, season_verified_at
  from public.ingredients_library;

-- RLS attiva e nessuna policy: un backup non si legge da PostgREST, e una tabella senza RLS
-- in `public` farebbe scattare un ERROR negli advisor, che oggi sono a zero.
alter table public.ingredients_library_backup_2026_09_03_season enable row level security;
comment on table public.ingredients_library_backup_2026_09_03_season is
  '#189 - fotografia delle colonne season_* prima del popolamento del 2026-09-03. Droppare dopo la verifica.';

-- 2. Guardia d'ingresso: se qualcuno ha gia' scritto season_status, mi fermo invece di sovrascriverlo.
do $g$
declare n integer;
begin
  select count(*) into n from public.ingredients_library where season_status is not null;
  if n <> 0 then raise exception 'season_status risulta gia'' valorizzato su % righe: rivedere prima di sovrascrivere', n; end if;
end $g$;

-- 3. I dati.
update public.ingredients_library m set
  season_status = v.status,
  season_months = v.months,
  season_note   = v.note,
  season_source = v.source
from (values
  ('baby-corn','year_round',null::smallint[],'Picked young from a crop that''s planted in rotation all year, so baby corn never has an off month at the market.','desk_research_2026-09'),
  ('banana-blossom','year_round',null::smallint[],'Banana plants flower right through the year in the North, so there''s always a blossom hanging at the end of a cluster and always one on the stall.','desk_research_2026-09'),
  ('bean-sprouts','year_round',null::smallint[],'Sprouted from mung beans in a few days in the dark, so the weather never touches them - fresh ones arrive at the market every morning of the year.','desk_research_2026-09'),
  ('bell-peppers','year_round',null::smallint[],'Grown under shade and up on the cooler hills around Chiang Mai, so the peppers keep coming whatever the month says.','desk_research_2026-09'),
  ('bitter-melon','year_round',null::smallint[],'The vines fruit all year in the North, though they run hardest through the rains, when everything climbing a fence grows fast.','desk_research_2026-09'),
  ('broccoli','year_round',null::smallint[],'Comes down from the cool highland farms above Chiang Mai every month of the year, with the tightest heads in the cold season from November to February.','desk_research_2026-09'),
  ('butterfly-pea-flower','not_applicable',null::smallint[],'We buy the flowers dried, so they sit in the pantry all year. The vine itself flowers away in Chiang Mai gardens more or less constantly.','product_type'),
  ('cabbage','year_round',null::smallint[],'Highland farms around Chiang Mai cut cabbage year round; the cool months just make the heads heavier and sweeter.','desk_research_2026-09'),
  ('carrot','year_round',null::smallint[],'Grown up in the hills where the nights are cold, and it stores well once pulled, so carrots are on every market stall in every month.','desk_research_2026-09'),
  ('cauliflower','year_round',null::smallint[],'Another highland crop that reaches the Chiang Mai markets all year, at its best when the cold season firms up the curds.','desk_research_2026-09'),
  ('cherry-tomatoes','year_round',null::smallint[],'Grown under net houses on the hill farms, which keeps the small tomatoes coming through the rains as well as the dry months.','desk_research_2026-09'),
  ('chinese-broccoli','year_round',null::smallint[],'Pak kanaa is one of the fastest crops in the North, about six weeks from seed, so growers plant in rotation and it never leaves the market.','desk_research_2026-09'),
  ('chinese-cabbage','year_round',null::smallint[],'A cool-weather green that the highland farms keep supplying all year, so it''s always there when a soup needs body.','desk_research_2026-09'),
  ('chinese-celery','year_round',null::smallint[],'Grown in small beds around the city and cut continuously, so the thin, intensely scented bunches are on the herb stalls every day.','desk_research_2026-09'),
  ('chives','year_round',null::smallint[],'Garlic chives regrow from the same clump after every cutting, which is why the bundles are on the market all year.','desk_research_2026-09'),
  ('coriander','year_round',null::smallint[],'Sown in rotation and available every month, though it runs to seed quickly in the April heat, so the bunches get smaller and dearer in the hot season.','desk_research_2026-09'),
  ('cucumber','year_round',null::smallint[],'Planted in rotation across the Chiang Mai valley all year, which is why the short pale Thai ones are always sitting beside the som tum stall.','desk_research_2026-09'),
  ('culantro','year_round',null::smallint[],'A hardy perennial that likes shade and damp, so the long saw-edged leaves are cut all year - the rains just make them broader.','desk_research_2026-09'),
  ('daikon','year_round',null::smallint[],'The white radish comes off the highland farms in every month, and it keeps well once pulled, so there''s no gap to work around.','desk_research_2026-09'),
  ('fermented-tea-leaf','not_applicable',null::smallint[],'Miang is fermented and then kept, so it doesn''t follow a season. The tea leaves behind it are picked up in the hills when the rains flush the bushes.','product_type'),
  ('fingerroot','year_round',null::smallint[],'The finger-shaped rhizomes are dug through the dry months and store well, so krachai is on the stalls in every month of the year.','desk_research_2026-09'),
  ('galangal','year_round',null::smallint[],'Dug as it''s needed and sold with the soil still on it, galangal is a fixture of the Chiang Mai markets in every season.','desk_research_2026-09'),
  ('garlic','year_round',null::smallint[],'The North is Thailand''s garlic country. It''s lifted around Chiang Mai and Mae Hong Son in the cool months, then plaited and stored, so you buy it all year.','desk_research_2026-09'),
  ('ginger','year_round',null::smallint[],'Always at the market, with the pale thin-skinned young ginger showing up when the rains are in full swing and the older, hotter roots the rest of the time.','desk_research_2026-09'),
  ('green-beans','year_round',null::smallint[],'Planted in rotation on farms right around the city, so there''s no month without them.','desk_research_2026-09'),
  ('green-chilli','year_round',null::smallint[],'Prik num grows all year in the North, which matters here: roasted green chilli is the heart of nam prik num, and that''s on the table in every season.','desk_research_2026-09'),
  ('green-onion','year_round',null::smallint[],'Cut and replanted continuously in the market gardens around Chiang Mai, so spring onions never go missing.','desk_research_2026-09'),
  ('hot-basil','year_round',null::smallint[],'Holy basil grows like a weed in this climate and is cut year round, which is just as well given how much pad kra pao the country eats.','desk_research_2026-09'),
  ('ivy-gourd','year_round',null::smallint[],'Tam leung climbs over fences and field edges all year in the North, and it goes wild once the rains arrive.','desk_research_2026-09'),
  ('kaffir-lime','year_round',null::smallint[],'The trees carry fruit through the year, so the knobbly limes are always on the stall - and the leaves come off the same tree.','desk_research_2026-09'),
  ('kaffir-lime-leaf','year_round',null::smallint[],'The tree keeps its leaves in every season, so you can pick a handful any month. Fresh is what matters; they lose their perfume fast once dried.','desk_research_2026-09'),
  ('king-oyster-mushroom','year_round',null::smallint[],'Grown in shaded farm sheds on sawdust rather than gathered in the forest, so the calendar never touches it.','desk_research_2026-09'),
  ('lemongrass','year_round',null::smallint[],'The clumps grow back after every harvest and stand up to both the heat and the rains, so lemongrass is a year-round staple here.','desk_research_2026-09'),
  ('lime','year_round',null::smallint[],'Limes are sold every month, but not at the same price: the dry heat of March to May thins the crop and you''ll watch manao get small and expensive before the rains bring it back.','desk_research_2026-09'),
  ('long-bean','year_round',null::smallint[],'The vines are planted in rotation and crop fast, so the metre-long beans are coiled on the market stalls all year.','desk_research_2026-09'),
  ('luffa','year_round',null::smallint[],'A climbing gourd that fruits all year in the North and goes into overdrive once the rainy season starts.','desk_research_2026-09'),
  ('mint-leaves','year_round',null::smallint[],'Mint keeps sending out runners in this climate and is cut all year, ready for larb and yam whenever you need it.','desk_research_2026-09'),
  ('morning-glory','year_round',null::smallint[],'Pak bung grows in water and grows fast, so it''s cut all year - the rains just make it grow faster.','desk_research_2026-09'),
  ('mushroom','year_round',null::smallint[],'The straw and oyster mushrooms we cook with are farmed and available every month. The forest mushrooms are the seasonal ones, and those only reach the stalls after the rains break.','desk_research_2026-09'),
  ('onion-size-medium','year_round',null::smallint[],'Grown in the North and cured for storage, so onions are in every kitchen and on every stall in every month.','desk_research_2026-09'),
  ('pea-eggplant','year_round',null::smallint[],'The bush fruits through the year in the North, so the little bitter clusters are always there for the curry pot.','desk_research_2026-09'),
  ('peeled-garlic','year_round',null::smallint[],'The same Northern garlic, peeled at the market to save the kitchen an hour. It''s cured and stored after the cool-season harvest, so there''s no month without it.','desk_research_2026-09'),
  ('peeled-shallot','year_round',null::smallint[],'Peeled to order at the market stalls, from the same stored crop that''s available all year.','desk_research_2026-09'),
  ('potato','year_round',null::smallint[],'Grown on the highland farms in the cool season and stored after that, so potatoes are on the shelf in every month.','desk_research_2026-09'),
  ('pumpkin','year_round',null::smallint[],'Thai pumpkin is planted in rotation and keeps for months once cut from the vine, so the dense orange wedges are always at the market.','desk_research_2026-09'),
  ('pumpkin-flower','year_round',null::smallint[],'The vines flower wherever pumpkins are growing, and in the North that''s most of the year, so the blossoms turn up on the stall alongside the fruit.','desk_research_2026-09'),
  ('red-cayenne-pepper','year_round',null::smallint[],'Prik chee faa is planted in rotation and picked red all year, so the long mild chillies are always there for colour and for pounding.','desk_research_2026-09'),
  ('red-sun-dried-anaheim-pepper','not_applicable',null::smallint[],'These are dried in the sun and then kept, which is the whole point of drying them - they wait in the pantry all year.','product_type'),
  ('shallot','year_round',null::smallint[],'Northern shallots are lifted in the cool season and stored in bundles, so you can buy them any month - the small red ones are what goes into the curry paste.','desk_research_2026-09'),
  ('snow-peas','year_round',null::smallint[],'A cool-weather crop that the highland farms above Chiang Mai supply all year, so the flat pods keep arriving whatever the season down in the valley.','desk_research_2026-09'),
  ('thai-basil','year_round',null::smallint[],'Cut all year from plants that regrow after every harvest, which is why there''s always a sprig of it going into a green curry.','desk_research_2026-09'),
  ('thai-eggplant','year_round',null::smallint[],'The bushes fruit continuously in this climate, so the little green and white golf balls are at the market every month.','desk_research_2026-09'),
  ('tomato','year_round',null::smallint[],'Between the valley farms and the cooler hill farms, tomatoes reach the Chiang Mai markets in every month.','desk_research_2026-09'),
  ('turmeric','year_round',null::smallint[],'The rhizomes are dug through the dry months and keep well both in the ground and out of it, so fresh turmeric is on the stalls all year.','desk_research_2026-09'),
  ('winter-melon','year_round',null::smallint[],'Despite the name it has nothing to do with winter here - the big pale gourds keep for weeks and are sold in every month.','desk_research_2026-09'),
  ('wonderberry-leaves','year_round',null::smallint[],'Pak khom grows easily and half-wild around the villages, so the tender leaves can be picked in most months, with the best flush after the rains.','desk_research_2026-09'),
  ('wood-ear-mushrooms','year_round',null::smallint[],'Farmed on logs and sawdust rather than foraged, so wood ear is a year-round ingredient here.','desk_research_2026-09'),
  ('young-black-pepper','year_round',null::smallint[],'Fresh green peppercorns come off the vines somewhere in the country all year, and the little strings of them are a daily sight in Thai wet markets.','desk_research_2026-09'),
  ('young-pumpkin','year_round',null::smallint[],'Picked small from the same vines that give the full-grown pumpkins, and those are planted in rotation, so young pumpkin is around all year.','desk_research_2026-09'),
  ('allspice','not_applicable',null::smallint[],'A dried berry from the Caribbean that reaches us in a jar and keeps for a year, so there''s nothing seasonal about it.','product_type'),
  ('bay-leaf','not_applicable',null::smallint[],'Dried leaves brought in from the Mediterranean. They wait in the pantry and only need to stay dry.','product_type'),
  ('bird-eye-chili','year_round',null::smallint[],'Prik kee noo is grown all year across Thailand and picked small and fierce, so the little chillies are on every market stall in every month.','desk_research_2026-09'),
  ('black-cardamom','not_applicable',null::smallint[],'Smoke-dried pods from the mountains further north, sold dried and kept dry. The calendar has nothing to do with it.','product_type'),
  ('black-peppercorn','not_applicable',null::smallint[],'Dried and stored, so peppercorns sit in the pantry all year. Green on the vine they''re a different ingredient entirely.','product_type'),
  ('brown-sugar','not_applicable',null::smallint[],'Refined, bagged and stable on the shelf, so it''s the same in January as it is in July.','product_type'),
  ('cardamom','not_applicable',null::smallint[],'Dried green pods, kept sealed so they hold their perfume. No season applies.','product_type'),
  ('chili-powder','not_applicable',null::smallint[],'Dried chillies, roasted and ground, so it keeps in a jar right through the year.','product_type'),
  ('cinnamon','not_applicable',null::smallint[],'Dried bark, rolled into quills and stored. It asks for a tight jar, not a calendar.','product_type'),
  ('cloves','not_applicable',null::smallint[],'Dried flower buds, sold by the bag and kept in the pantry all year.','product_type'),
  ('coconut-sugar','not_applicable',null::smallint[],'The sap is boiled down and set into blocks that keep for months, so it''s a pantry staple rather than a seasonal one.','product_type'),
  ('coriander-seeds','not_applicable',null::smallint[],'The seed is what''s left when the coriander plant bolts, dried and stored, so it''s available every month.','product_type'),
  ('cumin-seeds','not_applicable',null::smallint[],'Dried seed, brought in and kept in a jar. Toast it fresh and the age of the packet stops mattering.','product_type'),
  ('dill','not_applicable',null::smallint[],'We keep it dried, so it''s on the shelf all year - though fresh dill grows well in the North and turns up green at the market too.','product_type'),
  ('dried-galangal','not_applicable',null::smallint[],'Sliced and dried on purpose so that it keeps. That''s the whole idea, and it''s why there''s no season to it.','product_type'),
  ('dried-lemongrass','not_applicable',null::smallint[],'Cut, dried and stored for tea and stock, so it waits in the pantry whatever the month.','product_type'),
  ('hung-lei-curry-powder','not_applicable',null::smallint[],'A Northern blend of dried spices, ground and kept sealed, so the mix is the same in every season.','product_type'),
  ('indian-curry-powder','not_applicable',null::smallint[],'Ground dried spices in a jar, brought in ready-blended, so no season applies.','product_type'),
  ('long-pepper','not_applicable',null::smallint[],'Dried catkins that keep almost indefinitely. Dee pree is a pantry spice, not a market-day one.','product_type'),
  ('nutmeg','not_applicable',null::smallint[],'Dried kernels, sold whole and grated as needed. They keep for a very long time.','product_type'),
  ('oregano','not_applicable',null::smallint[],'Dried and imported, from a plant that isn''t part of the Northern Thai kitchen at all. It lives in the pantry all year.','product_type'),
  ('palm-sugar','not_applicable',null::smallint[],'The palms are tapped in the hot dry months, but the sap is boiled down into blocks and cakes that keep, so palm sugar is on the shelf in every season.','product_type'),
  ('salt','not_applicable',null::smallint[],'Salt has no season. Ours comes from the coastal pans and the inland salt fields, and it keeps forever.','product_type'),
  ('sesame-seeds','not_applicable',null::smallint[],'Dried seed, kept sealed and toasted just before it goes in, so it''s available in every month.','product_type'),
  ('sichuan-pepper','not_applicable',null::smallint[],'Dried husks brought down from the north. They keep in a jar and lose their buzz slowly, as long as the lid is tight.','product_type'),
  ('star-anise','not_applicable',null::smallint[],'Dried star-shaped pods, stored whole. No calendar involved.','product_type'),
  ('sweet-fennel-seeds','not_applicable',null::smallint[],'Dried seed that sits in the spice drawer all year, ready for the next curry paste.','product_type'),
  ('white-pepper','not_applicable',null::smallint[],'The ripe berries are soaked, hulled and dried, then kept, which is why white pepper is a pantry ingredient in every month.','product_type'),
  ('beef','year_round',null::smallint[],'Butchered and sold fresh every market morning, so it doesn''t follow a season - though the Northern habit is to buy it in the early hours, while it''s still cool.','desk_research_2026-09'),
  ('chicken','year_round',null::smallint[],'Farmed and sold fresh every day of the year, which is why chicken turns up in so many of the dishes we teach.','desk_research_2026-09'),
  ('dried-river-shrimp','not_applicable',null::smallint[],'The tiny shrimp are dried and kept, so the bag lasts. Behind it is the freshwater catch, and that one the river decides.','product_type'),
  ('edible-insects','not_applicable',null::smallint[],'We buy them dried, so they keep on the shelf in any month. Out in the forest the gathering follows the rains, and that''s when the fresh ones appear at the market.','product_type'),
  ('eggs-size-3','year_round',null::smallint[],'Eggs arrive every day of the year. The only thing that moves is the price at the market gate.','desk_research_2026-09'),
  ('fish','year_round',null::smallint[],'Farmed tilapia and catfish keep the market supplied every month, while the wild river catch rises and falls with the water.','desk_research_2026-09'),
  ('fried-tofu','not_applicable',null::smallint[],'Made from stored soybeans and fried fresh in the market kitchens, so there''s a new batch every day and no season at all.','product_type'),
  ('grilled-fish','year_round',null::smallint[],'Fish goes over the coals at the market every day of the year. The grill is lit before dawn and the fish is gone by noon.','desk_research_2026-09'),
  ('northern-sausage','year_round',null::smallint[],'Sai oua is made fresh in Chiang Mai every day and sold coiled and warm off the grill, in every month of the year.','desk_research_2026-09'),
  ('paneer','not_applicable',null::smallint[],'A fresh cheese set from milk and used within days. It''s made continuously rather than harvested, so no season attaches to it.','product_type'),
  ('pig-ear','year_round',null::smallint[],'Comes off the same pig as everything else at the butcher''s block, fresh every morning of the year.','desk_research_2026-09'),
  ('pink-egg','not_applicable',null::smallint[],'The duck eggs are cured for weeks before they''re sold, so the season never comes into it - the curing is the point.','product_type'),
  ('pork','year_round',null::smallint[],'Pork is the everyday meat of the North, and the butchers cut it fresh every market morning, all year.','desk_research_2026-09'),
  ('pork-rib','year_round',null::smallint[],'Cut fresh at the butcher''s stall every day of the year, and best bought early, before the heat comes up.','desk_research_2026-09'),
  ('pork-skin','not_applicable',null::smallint[],'Dried and then puffed in hot oil, so the bags of cracklings keep in the pantry whatever the month.','product_type'),
  ('pork-spine','year_round',null::smallint[],'Sold fresh at the butcher''s block all year, and these are the bones the soup pots are built on.','desk_research_2026-09'),
  ('prawn','year_round',null::smallint[],'Farmed prawns keep the markets supplied every month, arriving on ice from the coast and from the inland ponds.','desk_research_2026-09'),
  ('squid','year_round',null::smallint[],'Brought up from the coast on ice every day of the year, so squid is on the market in every month, even this far inland.','desk_research_2026-09'),
  ('vegan-soft-tofu','not_applicable',null::smallint[],'Made from soybeans that store well, pressed fresh and sold within a couple of days, so it''s the same in every month.','product_type'),
  ('apple','imported',null::smallint[],'Apples don''t grow in this climate. They come in from China and further afield and sit in the supermarket chillers all year, which is why you won''t meet one in a Northern Thai dish.','desk_research_2026-09'),
  ('banana','year_round',null::smallint[],'Banana plants fruit continuously in the North, so there''s always a hand of them on the stall, and usually four or five varieties to choose between.','desk_research_2026-09'),
  ('grapes','imported',null::smallint[],'Grapes arrive by container from China, Australia and beyond and are sold all year. Northern Thai cooking has no use for them, which tells you how local they are.','desk_research_2026-09'),
  ('green-papaya','year_round',null::smallint[],'Papaya trees fruit continuously here, so the hard green ones for som tum are picked all year. Green isn''t a variety, it''s simply picked early.','desk_research_2026-09'),
  ('guava','year_round',null::smallint[],'The trees crop for most of the year in the North, so there''s rarely a week without a bag of crisp green farang and a twist of chilli salt.','desk_research_2026-09'),
  ('jackfruit','seasonal','{1,2,3,4,5}'::smallint[],'Jackfruit runs from about January to May, when the huge spiny pods hang straight off the trunk and the market fills with bags of the yellow bulbs.','desk_research_2026-09'),
  ('lychee','seasonal','{4,5,6}'::smallint[],'The lychee orchards around Chiang Mai and Fang crop from April to June, and for those few weeks the roadsides north of the city are stacked with them.','desk_research_2026-09'),
  ('mango','seasonal','{3,4,5,6}'::smallint[],'Thai mangoes are at their best from March to June, which is also when mango sticky rice tastes the way it''s meant to. Outside that window they come from cold store.','desk_research_2026-09'),
  ('passion-fruit','seasonal','{1,2,3,4,11,12}'::smallint[],'Passion fruit runs through the cool months, roughly November to April, and the North grows plenty of it - most of which ends up blended into a drink.','desk_research_2026-09'),
  ('pineapple','year_round',null::smallint[],'Pineapple is planted in staggered blocks so something is always ripening somewhere, which is why it''s on the fruit cart every month.','desk_research_2026-09'),
  ('seasonal-fruit','year_round',null::smallint[],'This one is in season by definition: it''s whatever is best that week. In April expect mango, in July longan, in December pomelo and tangerine.','desk_research_2026-09'),
  ('tamarind','seasonal','{1,2,12}'::smallint[],'The sweet pods are picked in the cool months, roughly December to February, and mostly travel up from Phetchabun and Loei. The pressed pulp is a pantry item and keeps all year.','desk_research_2026-09'),
  ('basmati-rice','not_applicable',null::smallint[],'Basmati isn''t a Thai crop. It''s grown in the fields of northern India and Pakistan, then milled, bagged and shipped, so it''s on the shelf in every month.','product_type'),
  ('black-sticky-rice','not_applicable',null::smallint[],'Harvested once a year, then milled and bagged, so the grain waits in the sack. Rice is stored, not seasonal.','product_type'),
  ('brown-rice','not_applicable',null::smallint[],'The same grain as white rice with the bran left on. It''s bagged and stored, so there''s no season to it, though brown rice does go stale faster than white.','product_type'),
  ('jasmine-rice','not_applicable',null::smallint[],'Milled and bagged after the November harvest and kept all year. New-crop jasmine, the first rice of the season, is softer and more fragrant, and Thai cooks notice.','product_type'),
  ('steamed-rice','not_applicable',null::smallint[],'Rice from the sack, steamed to order. The grain is stored all year, so this is a daily job rather than a seasonal one.','product_type'),
  ('sticky-rice','not_applicable',null::smallint[],'The North eats it every day, from a crop harvested once and then stored. Bagged and sold all year, soaked overnight and steamed in the morning.','product_type'),
  ('sushi-rice','not_applicable',null::smallint[],'A Japanese-style short grain, milled and bagged. It sits in the pantry the same way jasmine does, with no season attached.','product_type'),
  ('pandan-leaves','year_round',null::smallint[],'Pandan grows in clumps you cut from and come back to, all year round, so the long green blades are always at the market for tying, steaming and scenting rice.','desk_research_2026-09'),
  ('banana-leaf','year_round',null::smallint[],'Cut fresh from plants that never stop growing here, so there''s always a leaf to wrap in - softened over a flame first, in any month.','desk_research_2026-09'),
  ('black-beans','not_applicable',null::smallint[],'Dried beans, sold by the bag and soaked before use. They keep for a year in the pantry.','product_type'),
  ('cashew-nut','not_applicable',null::smallint[],'Harvested once, then dried, roasted and packed, so cashews are on the shelf whatever the month.','product_type'),
  ('cassava-starch','not_applicable',null::smallint[],'Milled from stored cassava root into a fine white powder that keeps indefinitely. No season applies.','product_type'),
  ('chicken-stock-powder','not_applicable',null::smallint[],'A dried, packaged seasoning that keeps in the cupboard, so it''s the same in every month.','product_type'),
  ('chinese-pickled-soy-beans','not_applicable',null::smallint[],'Fermented and jarred, which is what makes it keep. Nothing about it follows a calendar.','product_type'),
  ('chrysanthemum-tea','not_applicable',null::smallint[],'The flowers are dried after picking and then stored, so the tea is brewed all year - and it''s what Thai people reach for when the hot months arrive.','product_type'),
  ('coconut-cream','not_applicable',null::smallint[],'Coconuts crop through the year and the cream is pressed fresh at the market or bought in a carton, so it''s always to hand.','product_type'),
  ('coconut-milk','not_applicable',null::smallint[],'Pressed from mature coconuts, which the palms drop all year, and sold fresh at the market or in cartons off the shelf.','product_type'),
  ('coconut-oil','not_applicable',null::smallint[],'Pressed from dried coconut meat and bottled, so it keeps in the pantry in every month.','product_type'),
  ('coffee','not_applicable',null::smallint[],'Roasted beans keep for weeks in a sealed bag. The Northern Thai cherries behind them are picked in the cool months, up in the hills where the Akha villages grow them.','product_type'),
  ('cooking-oil','not_applicable',null::smallint[],'Refined, bottled and stable on the shelf, the same in every month.','product_type'),
  ('cooking-wine','not_applicable',null::smallint[],'Bottled and stable, so there''s no season to it.','product_type'),
  ('dark-soy-sauce','not_applicable',null::smallint[],'Brewed, bottled and kept. A pantry constant, not a market-day decision.','product_type'),
  ('drinking-water','not_applicable',null::smallint[],'Water has no season. In the kitchen it''s the one thing we never run out of.','product_type'),
  ('egg-noodle','not_applicable',null::smallint[],'Made from wheat flour and egg, dried or kept chilled, so the khao soi noodles are ready in any month.','product_type'),
  ('egg-tofu','not_applicable',null::smallint[],'Set in a tube from egg and soy and sold chilled, so it''s a shelf item rather than a seasonal one.','product_type'),
  ('fermented-soybean','not_applicable',null::smallint[],'Thua nao is fermented and then dried into thin discs, which is exactly how the North makes soybeans keep. Available in every month.','product_type'),
  ('fish-sauce','not_applicable',null::smallint[],'Anchovies and salt, left in barrels for a year or more. Once bottled it keeps for years, so the season is a long way behind it.','product_type'),
  ('fusilli','not_applicable',null::smallint[],'Dried Italian pasta, imported and stable on the shelf. You''ll find it in any Chiang Mai supermarket all year, though it has nothing to do with Northern Thai cooking.','product_type'),
  ('glass-noodle','not_applicable',null::smallint[],'Dried mung bean threads that keep in the packet for a very long time. Soak them and they''re ready.','product_type'),
  ('gluten-free-soy-sauce','not_applicable',null::smallint[],'Brewed without wheat, bottled and stable, so it''s on the shelf all year for the guests who need it.','product_type'),
  ('ground-peanut','not_applicable',null::smallint[],'Roasted and ground from a stored crop, kept sealed so it doesn''t go soft in the humidity. Available every month.','product_type'),
  ('hibiscus-roselle-tea','not_applicable',null::smallint[],'The crimson calyces are dried after the harvest and then kept, so the tea is brewed all year even though the plant crops once.','product_type'),
  ('honey','not_applicable',null::smallint[],'The bees work the flowering months, but the jars keep for years, so honey is a pantry item rather than a seasonal one.','product_type'),
  ('larb-muang-spices-herbs','not_applicable',null::smallint[],'A dried spice blend, roasted and ground, so it keeps in a jar and tastes the same in every season.','product_type'),
  ('light-soy-sauce','not_applicable',null::smallint[],'Brewed and bottled, stable on the shelf, the same in January as in August.','product_type'),
  ('massaman-paste','not_applicable',null::smallint[],'Pounded from dried spices and aromatics that are around all year, then kept chilled, so the paste is never out of season.','product_type'),
  ('mung-beans','not_applicable',null::smallint[],'Dried and bagged, which is how they keep - and how they become bean sprouts three days later.','product_type'),
  ('mushroom-sauce','not_applicable',null::smallint[],'Bottled and stable, so it''s on the shelf in every month. It''s what we reach for when a dish needs oyster sauce without the oyster.','product_type'),
  ('mushroom-stock-powder','not_applicable',null::smallint[],'Dried and packaged, so it keeps in the cupboard all year.','product_type'),
  ('nam-prik-nam-pla-sauce','not_applicable',null::smallint[],'Mixed fresh from fish sauce, lime and chilli, all of them available in every month, so the little bowl is always on the table.','product_type'),
  ('northern-style-curry-paste','not_applicable',null::smallint[],'Pounded from dried chillies and fresh aromatics that never leave the market, then kept chilled for a few days.','product_type'),
  ('oyster-sauce','not_applicable',null::smallint[],'Cooked down, bottled and stable on the shelf. No season attached.','product_type'),
  ('pad-thai-noodle','not_applicable',null::smallint[],'Dried rice noodles that keep for months in the packet, soaked before they hit the wok.','product_type'),
  ('panang-paste','not_applicable',null::smallint[],'Pounded fresh and kept chilled, from ingredients that are on the market in every month.','product_type'),
  ('pickled-bean-curd','not_applicable',null::smallint[],'Fermented in brine and jarred, which is what makes it keep. The jar sits in the fridge for months.','product_type'),
  ('pickled-garlic','not_applicable',null::smallint[],'Made from the Northern garlic lifted in the cool months, then pickled whole in vinegar and brine, so the jars last right through the year.','product_type'),
  ('pickled-mustard-green','not_applicable',null::smallint[],'The mustard greens are salted and left to sour, which turns a cool-season crop into something you can eat in any month.','product_type'),
  ('pigs-blood','year_round',null::smallint[],'Collected fresh at the butcher''s every morning of the year, either stirred into the broth or set firm and cut into cubes.','desk_research_2026-09'),
  ('red-beans','not_applicable',null::smallint[],'Dried and bagged, soaked overnight before use. They keep for a year without complaint.','product_type'),
  ('rice-vinegar','not_applicable',null::smallint[],'Fermented from rice and bottled, stable for years. No calendar involved.','product_type'),
  ('roasted-garlic-in-oil','not_applicable',null::smallint[],'Northern garlic fried gold and kept under its own oil, which is how it lasts. A spoonful goes on top of almost anything.','product_type'),
  ('roasted-mung-bean','not_applicable',null::smallint[],'Dried beans, roasted and kept crisp in a jar, ready to scatter in any month.','product_type'),
  ('roasted-peanuts','not_applicable',null::smallint[],'Roasted from a stored crop and kept sealed against the humidity, so they''re on hand all year.','product_type'),
  ('roasted-pumpkin-seeds','not_applicable',null::smallint[],'Saved from the pumpkins, dried and roasted, then kept in a jar. A good example of a kitchen that wastes nothing.','product_type'),
  ('sesame-oil','not_applicable',null::smallint[],'Pressed from toasted sesame and bottled. It keeps for a long time and is used by the spoonful, not the cup.','product_type'),
  ('shrimp-paste','not_applicable',null::smallint[],'Salted, fermented and pressed into blocks that keep for a very long time. Gapi is the backbone of the pastes, and it''s ready in every month.','product_type'),
  ('soy-sauce','not_applicable',null::smallint[],'Brewed from soybeans, bottled and stable, so it''s the same in every month.','product_type'),
  ('tamari','not_applicable',null::smallint[],'A wheat-free soy sauce, brewed and bottled, which we keep for guests avoiding gluten. On the shelf all year.','product_type'),
  ('tamarind-sauce','not_applicable',null::smallint[],'Pressed from the pods picked in the cool season, then kept as pulp or liquid, so that sour note is available in any month.','product_type'),
  ('tapioca','not_applicable',null::smallint[],'Dried pearls milled from cassava root. They keep for a very long time and swell up clear when boiled.','product_type'),
  ('thai-chili-paste-market','not_applicable',null::smallint[],'Bought ready-made at the market, from dried chillies and stored aromatics, so there''s a tub of it in every month.','product_type'),
  ('thai-chilli-paste','not_applicable',null::smallint[],'Chillies, garlic and shallots fried down in oil until dark and sweet, then kept. It lasts for weeks and the ingredients are there all year.','product_type'),
  ('thai-green-curry-paste','not_applicable',null::smallint[],'Pounded from fresh green chillies and aromatics that the market carries in every month, then kept chilled for a few days.','product_type'),
  ('thai-red-curry-paste','not_applicable',null::smallint[],'Built on dried red chillies, which are dried precisely so they keep, so the paste can be made in any month.','product_type'),
  ('thai-rose-tea','not_applicable',null::smallint[],'Dried petals and tea, blended and stored, so the pink glassful is on offer all year.','product_type'),
  ('thai-seafood-sauce','not_applicable',null::smallint[],'Mixed fresh from lime, chilli, garlic and fish sauce, all of them year-round ingredients, so the sauce is too.','product_type'),
  ('thai-spring-roll-wrapper','not_applicable',null::smallint[],'Made from wheat flour and kept chilled or frozen in packs, so there''s always a stack ready to go.','product_type'),
  ('thai-sweet-chili-sauce','not_applicable',null::smallint[],'Cooked down with vinegar and sugar and bottled, which is why it keeps for months without a thought about the season.','product_type'),
  ('tomato-ketchup','not_applicable',null::smallint[],'Bottled and stable on the shelf, the same in every month - and more a Western guest''s ingredient than a Northern Thai one.','product_type'),
  ('vegetable-oil','not_applicable',null::smallint[],'Refined and bottled, stable on the shelf, no season attached.','product_type'),
  ('vegetable-stock-powder','not_applicable',null::smallint[],'A dried, packaged seasoning that lives in the cupboard, so it''s ready in every month.','product_type'),
  ('vegetarian-thai-chili-paste','not_applicable',null::smallint[],'The same dark, sweet chilli paste made without the shrimp, cooked down and kept in a jar, available all year for vegan guests.','product_type'),
  ('yellow-tofu','not_applicable',null::smallint[],'Pressed and coloured with turmeric, sold chilled and used within days, from soybeans that are stored all year.','product_type')
) as v(slug, status, months, note, source)
where m.slug = v.slug and m.is_published and m.is_visible_public;

-- 4. Guardie d'uscita. Se un numero non torna, la transazione si annulla intera.
do $g$
declare n_tot integer; n_null integer; n_seas integer;
begin
  select count(*) into n_tot from public.ingredients_library
   where is_published and is_visible_public and season_status is not null;
  if n_tot <> 191 then raise exception 'attese 191 righe scritte, trovate %', n_tot; end if;

  -- L'unica NULL ammessa e' roselle-leaves, e per un motivo scritto nella consegna.
  select count(*) into n_null from public.ingredients_library
   where is_published and is_visible_public and season_status is null and slug <> 'roselle-leaves';
  if n_null <> 0 then raise exception 'NULL non previste su % righe', n_null; end if;

  -- Nessun seasonal senza mesi: chk_season_coerente lo rifiuterebbe, ma meglio dirlo chiaro.
  select count(*) into n_seas from public.ingredients_library
   where season_status = 'seasonal' and coalesce(array_length(season_months,1),0) = 0;
  if n_seas <> 0 then raise exception 'seasonal senza mesi su % righe', n_seas; end if;

  raise notice '#189 ok: % righe scritte, 1 NULL voluta (roselle-leaves)', n_tot;
end $g$;

commit;

-- Rollback dopo il commit:
-- update public.ingredients_library m set season_status = b.season_status,
--   season_months = b.season_months, season_note = b.season_note,
--   season_source = b.season_source, season_verified_at = b.season_verified_at
--   from public.ingredients_library_backup_2026_09_03_season b where b.id = m.id;
