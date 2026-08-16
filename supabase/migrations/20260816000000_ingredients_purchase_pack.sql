-- Market planner (logistics): purchase pack model
-- Every logistics ingredient is bought in whole packs. The planner [-] N [+] stepper
-- counts PACKS; purchase_pack_size is the content of one pack expressed in default_unit
-- (e.g. 30 pcs per box of eggs, 500 g per pack of cashew, 5 kg per crate of limes).
-- Spec: thai-akha-ingredients-mapping-v2 (27 ingredients, 2026-08-16).

-- default_unit check: add liquid units (coconut milk is bought by the litre carton)
alter table public.ingredients_library drop constraint if exists ingredients_library_default_unit_check;
alter table public.ingredients_library add constraint ingredients_library_default_unit_check
  check (default_unit = any (array['g','kg','pcs','bunch','block','bag','pack','tube','cup','tbsp','tsp','litre','ml']));

alter table public.ingredients_library
  add column if not exists purchase_pack_size  numeric not null default 1,
  add column if not exists purchase_pack_label text    not null default 'unit';

comment on column public.ingredients_library.purchase_pack_size  is 'Content of ONE purchase pack, in default_unit. Planner qty = number of packs; base qty = qty * pack_size.';
comment on column public.ingredients_library.purchase_pack_label is 'Pack name shown on the +/- stepper: kg | box | pack | crate | litre | tube | pcs ...';

-- Default for every row: 1 pack = 1 default_unit (label = unit).
update public.ingredients_library set purchase_pack_label = coalesce(default_unit, 'unit');

-- Ingredients that exist as public pages but were not flagged for logistics shopping.
update public.ingredients_library set is_logistics_item = true, logistics_shop = 'Shop 03'    where slug in ('kaffir-lime-leaf','thai-basil','hot-basil');
update public.ingredients_library set is_logistics_item = true, logistics_shop = 'small shop' where slug in ('coconut-milk','egg-tofu');

-- Spec v2 mapping (slug -> unit, pack size, pack label)
with m(slug, unit, size, label) as (values
  ('chicken',                  'kg',    1,   'kg'),
  ('prawn',                    'kg',    1,   'kg'),
  ('eggs-size-3',              'pcs',   30,  'box'),
  ('pad-thai-noodle',          'kg',    1,   'kg'),
  ('thai-spring-roll-wrapper', 'pcs',   50,  'pack'),
  ('cashew-nut',               'g',     500, 'pack'),
  ('ground-peanut',            'g',     500, 'pack'),
  ('peeled-garlic',            'g',     100, 'pack'),
  ('peeled-shallot',           'g',     100, 'pack'),
  ('lime',                     'kg',    5,   'crate'),
  ('pumpkin',                  'kg',    5,   'pack'),
  ('green-papaya',             'kg',    5,   'pack'),
  ('mango',                    'kg',    1,   'kg'),
  ('tomato',                   'kg',    5,   'pack'),
  ('onion-size-medium',        'kg',    10,  'pack'),
  ('potato',                   'kg',    10,  'pack'),
  ('winter-melon',             'kg',    5,   'pack'),
  ('carrot',                   'kg',    5,   'pack'),
  ('lemongrass',               'g',     500, 'pack'),
  ('galangal',                 'g',     500, 'pack'),
  ('kaffir-lime-leaf',         'g',     100, 'pack'),
  ('bird-eye-chili',           'g',     500, 'pack'),
  ('green-chilli',             'g',     500, 'pack'),
  ('coriander',                'g',     500, 'pack'),
  ('green-onion',              'g',     500, 'pack'),
  ('chives',                   'g',     500, 'pack'),
  ('thai-basil',               'g',     500, 'pack'),
  ('hot-basil',                'g',     500, 'pack'),
  ('coconut-milk',             'litre', 1,   'litre'),
  ('egg-tofu',                 'tube',  1,   'tube')
)
update public.ingredients_library il
   set default_unit = m.unit, purchase_pack_size = m.size, purchase_pack_label = m.label, updated_at = now()
  from m where il.slug = m.slug;

-- Taxi - Grab Payout is a kitchen/teacher (morning market) expense only, never on the logistics list.
update public.ingredients_library set is_logistics_item = false where slug = 'taxi-grab-payout';

-- Round 2 (GO 2026-08-16): items outside the v2 spec that still had "1 g" as a pack.
with m(slug, unit, size, label) as (values
  ('roasted-peanuts',             'g',  500, 'pack'),
  ('shrimp-paste',                'g',  500, 'pack'),
  ('thai-chili-paste-market',     'g',  500, 'pack'),
  ('turmeric',                    'g',  500, 'pack'),
  ('red-sun-dried-anaheim-pepper','g',  500, 'pack'),
  ('chinese-celery',              'g',  500, 'pack'),
  ('cabbage',                     'kg', 1,   'kg')
)
update public.ingredients_library il
   set default_unit = m.unit, purchase_pack_size = m.size, purchase_pack_label = m.label, updated_at = now()
  from m where il.slug = m.slug;
