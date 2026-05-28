-- ============================================================
-- WorshipPresenter — Demo Song Seeds
-- Run after 001_initial_schema.sql
-- ============================================================

INSERT INTO songs (title, artist, lyrics, sections, slides, tags, category, favorite) VALUES

-- Amazing Grace
(
  'Amazing Grace',
  'John Newton',
  E'VERSE 1\nAmazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see\n\nVERSE 2\n''Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed\n\nCHORUS\nMy chains are gone I''ve been set free\nMy God my Savior has ransomed me\nAnd like a flood His mercy reigns\nUnending love amazing grace\n\nVERSE 3\nThe Lord has promised good to me\nHis word my hope secures\nHe will my shield and portion be\nAs long as life endures\n\nCHORUS\nMy chains are gone I''ve been set free\nMy God my Savior has ransomed me\nAnd like a flood His mercy reigns\nUnending love amazing grace\n\nTAG\nAmazing grace amazing grace\nAmazing grace how sweet the sound',
  '[
    {"id":"s1","type":"verse","label":"Verse 1","order":0,"content":"Amazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see"},
    {"id":"s2","type":"verse","label":"Verse 2","order":1,"content":"''Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed"},
    {"id":"s3","type":"chorus","label":"Chorus","order":2,"content":"My chains are gone I''ve been set free\nMy God my Savior has ransomed me\nAnd like a flood His mercy reigns\nUnending love amazing grace"},
    {"id":"s4","type":"verse","label":"Verse 3","order":3,"content":"The Lord has promised good to me\nHis word my hope secures\nHe will my shield and portion be\nAs long as life endures"},
    {"id":"s5","type":"tag","label":"Tag","order":4,"content":"Amazing grace amazing grace\nAmazing grace how sweet the sound"}
  ]'::jsonb,
  '[
    {"id":"sl1","type":"lyrics","content":"Amazing grace how sweet the sound\nThat saved a wretch like me","sectionLabel":"Verse 1"},
    {"id":"sl2","type":"lyrics","content":"I once was lost but now am found\nWas blind but now I see","sectionLabel":"Verse 1"},
    {"id":"sl3","type":"lyrics","content":"''Twas grace that taught my heart to fear\nAnd grace my fears relieved","sectionLabel":"Verse 2"},
    {"id":"sl4","type":"lyrics","content":"How precious did that grace appear\nThe hour I first believed","sectionLabel":"Verse 2"},
    {"id":"sl5","type":"lyrics","content":"My chains are gone I''ve been set free\nMy God my Savior has ransomed me","sectionLabel":"Chorus"},
    {"id":"sl6","type":"lyrics","content":"And like a flood His mercy reigns\nUnending love amazing grace","sectionLabel":"Chorus"},
    {"id":"sl7","type":"lyrics","content":"The Lord has promised good to me\nHis word my hope secures","sectionLabel":"Verse 3"},
    {"id":"sl8","type":"lyrics","content":"He will my shield and portion be\nAs long as life endures","sectionLabel":"Verse 3"},
    {"id":"sl9","type":"lyrics","content":"Amazing grace amazing grace\nAmazing grace how sweet the sound","sectionLabel":"Tag"}
  ]'::jsonb,
  ARRAY['classic','hymn','grace'],
  'Hymn',
  true
),

-- How Great Is Our God
(
  'How Great Is Our God',
  'Chris Tomlin',
  E'VERSE 1\nThe splendor of the King\nClothed in majesty\nLet all the earth rejoice\nAll the earth rejoice\nHe wraps Himself in light\nAnd darkness tries to hide\nAnd trembles at His voice\nTrembles at His voice\n\nCHORUS\nHow great is our God\nSing with me how great is our God\nAnd all will see how great\nHow great is our God\n\nVERSE 2\nAge to age He stands\nAnd time is in His hands\nBeginning and the End\nBeginning and the End\nThe Godhead three in one\nFather Spirit Son\nThe Lion and the Lamb\nThe Lion and the Lamb\n\nCHORUS\nHow great is our God\nSing with me how great is our God\nAnd all will see how great\nHow great is our God\n\nBRIDGE\nName above all names\nWorthy of all praise\nMy heart will sing\nHow great is our God',
  '[
    {"id":"t1","type":"verse","label":"Verse 1","order":0,"content":"The splendor of the King\nClothed in majesty\nLet all the earth rejoice\nAll the earth rejoice\nHe wraps Himself in light\nAnd darkness tries to hide\nAnd trembles at His voice\nTrembles at His voice"},
    {"id":"t2","type":"chorus","label":"Chorus","order":1,"content":"How great is our God\nSing with me how great is our God\nAnd all will see how great\nHow great is our God"},
    {"id":"t3","type":"verse","label":"Verse 2","order":2,"content":"Age to age He stands\nAnd time is in His hands\nBeginning and the End\nBeginning and the End\nThe Godhead three in one\nFather Spirit Son\nThe Lion and the Lamb\nThe Lion and the Lamb"},
    {"id":"t4","type":"bridge","label":"Bridge","order":3,"content":"Name above all names\nWorthy of all praise\nMy heart will sing\nHow great is our God"}
  ]'::jsonb,
  '[
    {"id":"tl1","type":"lyrics","content":"The splendor of the King\nClothed in majesty\nLet all the earth rejoice\nAll the earth rejoice","sectionLabel":"Verse 1"},
    {"id":"tl2","type":"lyrics","content":"He wraps Himself in light\nAnd darkness tries to hide\nAnd trembles at His voice\nTrembles at His voice","sectionLabel":"Verse 1"},
    {"id":"tl3","type":"lyrics","content":"How great is our God\nSing with me how great is our God\nAnd all will see how great\nHow great is our God","sectionLabel":"Chorus"},
    {"id":"tl4","type":"lyrics","content":"Age to age He stands\nAnd time is in His hands\nBeginning and the End\nBeginning and the End","sectionLabel":"Verse 2"},
    {"id":"tl5","type":"lyrics","content":"The Godhead three in one\nFather Spirit Son\nThe Lion and the Lamb\nThe Lion and the Lamb","sectionLabel":"Verse 2"},
    {"id":"tl6","type":"lyrics","content":"How great is our God\nSing with me how great is our God\nAnd all will see how great\nHow great is our God","sectionLabel":"Chorus"},
    {"id":"tl7","type":"lyrics","content":"Name above all names\nWorthy of all praise\nMy heart will sing\nHow great is our God","sectionLabel":"Bridge"}
  ]'::jsonb,
  ARRAY['worship','contemporary','praise'],
  'Worship',
  true
),

-- Holy Spirit
(
  'Holy Spirit',
  'Francesca Battistelli',
  E'VERSE 1\nThere''s nothing worth more\nThat will ever come close\nNo thing can compare\nYou''re our living hope\nYour presence Lord\n\nVERSE 2\nI''ve tasted and seen\nOf the sweetest of loves\nWhere my heart becomes free\nAnd my shame is undone\nYour presence Lord\n\nCHORUS\nHoly Spirit You are welcome here\nCome flood this place\nAnd fill the atmosphere\nYour glory God is what we hunger for\nTo be overcome by Your presence Lord\n\nBRIDGE\nLet us become more aware of Your presence\nLet us experience the glory of Your goodness',
  '[
    {"id":"h1","type":"verse","label":"Verse 1","order":0,"content":"There''s nothing worth more\nThat will ever come close\nNo thing can compare\nYou''re our living hope\nYour presence Lord"},
    {"id":"h2","type":"verse","label":"Verse 2","order":1,"content":"I''ve tasted and seen\nOf the sweetest of loves\nWhere my heart becomes free\nAnd my shame is undone\nYour presence Lord"},
    {"id":"h3","type":"chorus","label":"Chorus","order":2,"content":"Holy Spirit You are welcome here\nCome flood this place\nAnd fill the atmosphere\nYour glory God is what we hunger for\nTo be overcome by Your presence Lord"},
    {"id":"h4","type":"bridge","label":"Bridge","order":3,"content":"Let us become more aware of Your presence\nLet us experience the glory of Your goodness"}
  ]'::jsonb,
  '[
    {"id":"hl1","type":"lyrics","content":"There''s nothing worth more\nThat will ever come close\nNo thing can compare\nYou''re our living hope","sectionLabel":"Verse 1"},
    {"id":"hl2","type":"lyrics","content":"Holy Spirit You are welcome here\nCome flood this place\nAnd fill the atmosphere","sectionLabel":"Chorus"},
    {"id":"hl3","type":"lyrics","content":"Your glory God is what we hunger for\nTo be overcome by Your presence Lord","sectionLabel":"Chorus"},
    {"id":"hl4","type":"lyrics","content":"I''ve tasted and seen\nOf the sweetest of loves\nWhere my heart becomes free\nAnd my shame is undone","sectionLabel":"Verse 2"},
    {"id":"hl5","type":"lyrics","content":"Let us become more aware of Your presence\nLet us experience the glory of Your goodness","sectionLabel":"Bridge"}
  ]'::jsonb,
  ARRAY['worship','spirit','contemporary'],
  'Worship',
  false
);
