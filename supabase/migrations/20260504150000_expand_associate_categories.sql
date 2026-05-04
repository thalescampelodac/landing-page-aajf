alter table aajf.associate_profiles
  drop constraint if exists associate_profiles_category_check;

alter table aajf.associate_dependents
  drop constraint if exists associate_dependents_category_check;

update aajf.associate_profiles
set category = 'Grosse Kinder'
where category = 'Gosse Kinder';

update aajf.associate_dependents
set category = 'Grosse Kinder'
where category = 'Gosse Kinder';

update aajf.associate_profiles
set category = null
where category is not null
  and category not in (
    'Kindergarten',
    'Kleine Kinder',
    'Grosse Kinder',
    'Jugendliche',
    'Erwachsene',
    'Heimweh',
    'Senioren',
    'Männertanz'
  );

update aajf.associate_dependents
set category = null
where category is not null
  and category not in (
    'Kindergarten',
    'Kleine Kinder',
    'Grosse Kinder',
    'Jugendliche',
    'Erwachsene',
    'Heimweh',
    'Senioren',
    'Männertanz'
  );

alter table aajf.associate_profiles
  add constraint associate_profiles_category_check
  check (
    category is null
    or category in (
      'Kindergarten',
      'Kleine Kinder',
      'Grosse Kinder',
      'Jugendliche',
      'Erwachsene',
      'Heimweh',
      'Senioren',
      'Männertanz'
    )
  );

alter table aajf.associate_dependents
  add constraint associate_dependents_category_check
  check (
    category is null
    or category in (
      'Kindergarten',
      'Kleine Kinder',
      'Grosse Kinder',
      'Jugendliche',
      'Erwachsene',
      'Heimweh',
      'Senioren',
      'Männertanz'
    )
  );
