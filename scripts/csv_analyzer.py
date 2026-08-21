import csv
import json
import re

csv1_raw = """1	weight loss percentage calculator	us	15	3800	1.60	1.06	weight loss percentage calculator	2026-08-11 01:02:26	AI Overview,Thumbnail	5800	5800	7500	2015-09-02	Informational,Non-branded,Non-local	English	3345	3346	Weight loss; Reference
2	percentage weight loss calculator	us	0	900	1.10	0.93	weight loss percentage calculator	2026-08-10 02:05:03	AI Overview,Thumbnail,People also ask	1600	2000	3400	2015-09-02	Informational,Non-branded,Non-local	English	884	869	Reference
3	weight loss calculator percentage	us	10	700	1.30	1.17	weight loss percentage calculator	2026-08-08 23:20:49		900	5800	7200	2015-10-23	Informational,Non-branded,Non-local	English	788	624	Weight loss; Reference
4	percentage calculator of weight loss	us		600			2019-12-03	Informational,Non-branded,Non-local	English	1	1176	Weight loss; Health conditions
5	percentage of weight loss calculator	us	23	600	1.30	1.14	percentage of weight loss calculator	2026-08-03 17:29:15	AI Overview,Thumbnail,People also ask	700	1100	3200	2015-09-10	Informational,Non-branded,Non-local	English	622	586	Weight loss; Reference
6	body fat percentage weight loss calculator	us		150	0.70			2015-12-03	Informational,Non-branded,Non-local	English	29	93	Weight loss; Reference
7	body weight loss percentage calculator	us	14	150			weight loss percentage calculator	2026-08-20 02:23:15	People also ask	200	5700	7500	2015-09-20	Informational,Non-branded,Non-local	English	164	145	Weight loss; Reference
8	weight percentage loss calculator	us	28	50	0.00		weight loss percentage calculator	2026-06-05 00:34:16	People also ask	60	2900	4200	2017-04-19	Informational,Non-branded,Non-local	English	53	45	Weight loss; Reference
9	body weight percentage loss calculator	us		40			2016-01-23	Informational,Non-branded,Non-local	English	22	35	Weight loss; Reference
10	percentage of body weight loss calculator	us		30	0.35			2017-01-02	Informational,Non-branded,Non-local	English	17	25	Weight loss; Reference
11	body percentage weight loss calculator	us		30	1.10			2016-09-27	Informational,Non-branded,Non-local	English	10	25	Weight loss; Reference
12	percentage of excess weight loss calculator	us	1	30			excess weight calculator	2026-08-16 08:45:54	People also ask	50	20	20	2021-03-27	Informational,Non-branded,Non-local	English	71	22	Obesity; Reference
13	percentage calculator weight loss	us	22	30			weight loss percentage calculator	2026-06-22 02:28:59	People also ask	50	6500	7900	2018-03-01	Informational,Non-branded,Non-local	English	29	14	Weight loss; Reference
14	weight loss calculator by percentage	us	54	20	0.00		weight loss percentage calculator	2026-07-20 19:18:29	AI Overview,Thumbnail,People also ask	30	6400	7800	2018-11-27	Informational,Non-branded,Non-local	English	46	25	Weight loss; Reference
15	weight loss by percentage calculator	us		20			2016-04-16	Informational,Non-branded,Non-local	English	3	14	Weight loss; Reference
16	weight loss challenge percentage calculator	us		20			2015-10-20	Informational,Non-branded,Non-local	English	13	16	Weight loss; Reference
17	body fat percentage calculator weight loss	us		20			2018-08-17				4	5	
18	weight loss percentage calculator newborn	us	6	10			percent weight loss calculator	2026-06-25 18:49:51	AI Overview,Thumbnail,People also ask	30	1700	2300	2017-10-17	Informational,Non-branded,Non-local	English	22	6	Obesity; Reference
19	percentage body weight loss calculator	us		10			2016-10-22				24	8	
20	calculator for percentage of weight loss	us		10			2020-03-10	Informational,Non-branded,Non-local	English	10	4	Weight loss; Reference
21	body percentage calculator weight loss	us		10			2020-01-13	Informational,Non-branded,Non-local	English	6	9	Weight loss; Reference
22	percentage loss calculator weight	us		10			2017-10-20	Informational,Non-branded,Non-local	English	15	1	Weight loss; Reference
23	weight loss percentage calculator formula	us		10			2022-06-15	Informational,Non-branded,Non-local	English	8	9	Weight loss; Health conditions
24	total body weight loss percentage calculator	us		10			2021-01-12				0	1	
25	how to figure percentage weight loss calculator	us		10			2017-06-16	Informational,Non-branded,Non-local	English	0	4	Weight loss; Health conditions
26	calculate weight loss percentage calculator	us		10			2023-03-11	Informational,Non-branded,Non-local	English	12	5	Weight loss; Reference
27	baby weight loss percentage calculator	us		10			2016-02-04	Informational,Non-branded,Non-local	English	1	4	Pediatrics; Reference
28	weight loss body percentage calculator	us		10			2017-03-04	Informational,Non-branded,Non-local	English	3	10	Weight loss; Reference
29	newborn weight loss percentage calculator	us		10			2016-04-07	Informational,Non-branded,Non-local	English	3	6	Pediatrics; Reference
30	calculator for weight loss percentage	us		10			2017-03-03	Informational,Non-branded,Non-local	English	11	10	Weight loss; Reference
31	weight loss body fat percentage calculator	us		10		body fat goal calculator	2015-09-25	Informational,Non-branded,Non-local	English	3	6	Weight loss
32	calculator weight loss percentage	us		10			2020-02-01	Informational,Non-branded,Non-local	English	10	4	Weight loss; Reference
33	weight loss calculator in percentage	us		10			2019-06-24				5	3	
34	weight loss calculator body fat percentage	us		10			2016-09-17				12	8	
35	percentage calculator for weight loss	us		10			2018-01-16				17	6	
36	male body fat percentage weight loss calculator	us		10			2025-07-10				0	1	
40	how to calculate percentage of weight loss calculator	us	14				weight loss percentage calculator	2026-07-29 03:54:41	AI Overview,Thumbnail,People also ask		2400	4400	2021-03-25	Informational,Non-branded,Non-local	English	10	1	Weight loss; Reference
42	weight loss percentage calculator excel template	us					2016-02-08	Informational,Branded,Non-local	English	0	1	Weight loss; Business; Reference
43	weight loss percentage calculator kg	us	10				weight loss percentage calculator	2026-07-05 12:49:43	AI Overview,Thumbnail,People also ask	30	3700	5100	2020-03-19	Informational,Non-branded,Non-local	English	5	3	Weight loss; Reference
44	birth weight loss percentage calculator	us					2017-11-25				0	4	
45	fitwatch weight loss percentage calculator	us					2016-06-14	Informational,Branded,Non-local	English	0	1	Weight loss; Reference
48	infant percentage weight loss calculator	us					2016-11-07				1	5	
49	weight loss percentage calculator stone	us					2016-11-11	Informational,Non-branded,Non-local	English	0	1	Weight loss; Reference
51	weight loss percentage calculator app	us					2015-09-22	Informational,Commercial,Non-branded,Non-local	English	0	1	Weight loss; Add-ons; Reference
52	infant weight loss percentage calculator	us					2016-01-23	Informational,Non-branded,Non-local	English	0	6	Pediatrics; Reference
55	percentage of weight loss per week calculator	us					2021-02-24	Informational,Non-branded,Non-local	English	0	1	Weight loss; Reference
64	weight loss percentage calculator baby	us				10	2016-11-28	Informational,Non-branded,Non-local	English	0	1	Health conditions; Reference
65	weight loss percentage calculator spreadsheet	us					2019-10-23	Informational,Non-branded,Non-local	English	0	1	Weight loss; Business; Reference
72	biggest loser weight loss percentage calculator	us					2015-12-14	Informational,Non-branded,Non-local	English	0	1	Weight loss; Reference
86	weight loss percentage calculator excel	us					2016-01-19	Informational,Branded,Non-local	English	0	1	Weight loss; Business; Reference
"""

csv2_raw = """1	calorie burn calculator	us	0	6600	0.07	1.29	calories burned calculator	2026-08-19 02:18:26	People also ask,Video preview	15000	56000	91000	2015-09-01	Informational,Non-branded,Non-local	English
2	mayo clinic calorie calculator	us	3	2500	0.70	1.4	calorie deficit calculator	2026-08-12 12:15:25	People also ask,Video preview	3200	313000	652000	2015-09-02	Informational,Branded,Non-local	English
3	rucking calorie calculator	us	0	1600	2.00		rucking calorie calculator	2026-08-08 15:37:21	Sitelinks,People also ask,Video preview	2100	1200	1300	2016-04-18	Informational,Non-branded,Non-local	English
4	dutch bros calorie calculator	us	5	1500	3.50		dutch bros nutrition	2026-08-19 00:59:50	Sitelinks,Video preview	1600	8200	8200	2017-10-19	Informational,Branded,Non-local	English
5	breastfeeding calorie calculator	us	2	1300	0.80	1.34	breastfeeding calorie calculator	2026-08-11 20:43:36	AI Overview,Thumbnail,People also ask,Sitelinks,Video preview	2100	1700	2100	2016-02-02	Informational,Non-branded,Non-local	English
6	losertown calorie calculator	us	0	1200	1.00		losertown calorie calculator	2026-08-13 11:13:22	Sitelinks,Image pack,Video preview	3000	700	1100	2016-07-03	Informational,Branded,Non-local	English
7	step calorie calculator	us	0	900	0.80		how many calories does 10000 steps burn	2026-08-17 20:30:36	People also ask	2000	1900	5100	2015-10-16	Informational,Non-branded,Non-local	English
8	hiking calorie calculator	us	8	900	0.20	1.85	hiking calorie calculator	2026-08-15 03:18:55	Sitelinks,People also ask,Video preview	1300	1400	1500	2015-09-02	Informational,Non-branded,Non-local	English
9	stairmaster calorie calculator	us	0	800	4.50	1.5	stairmaster calorie calculator	2026-08-20 02:18:37	People also ask,Video preview	1100	1500	1800	2015-09-17	Informational,Branded,Non-local	English
10	taco bell calorie calculator	us	3	700	1.00	1.11	taco bell nutrition calculator	2026-08-03 11:36:07		700	3400	3500	2015-09-02	Informational,Branded,Non-local	English
11	pet calorie calculator	us	0	700	0.60		cat calorie calculator	2026-08-15 01:05:37	Video preview	800	15000	17000	2016-02-07	Informational,Non-branded,Non-local	English
12	7 brew calorie calculator	us	1	600	2.50		7 brew nutrition	2026-08-05 23:02:53	Sitelinks	600	3800	3800	2023-07-16	Informational,Branded,Non-local	English
13	ruck calorie calculator	us	0	600	2.00		rucking calorie calculator	2026-08-16 07:17:25	Sitelinks,Video preview	700	1200	1200	2017-03-29	Informational,Non-branded,Non-local	English
14	calorie calculator to gain muscle	us	0	600	0.07	1.37	macro calculator	2026-08-08 19:57:58	Sitelinks,People also ask,Video preview	800	81000	112000	2015-12-09	Informational,Non-branded,Non-local	English
15	walk calorie calculator	us	8	500	0.40	1.49	calories burned walking	2026-08-21 14:59:38	People also ask	1100	19000	34000	2015-09-02	Informational,Non-branded,Non-local	English
16	elliptical calorie calculator	us	8	500	3.50	1.59	elliptical calorie calculator	2026-07-25 04:34:59	People also ask	600	1300	1500	2015-09-21	Informational,Non-branded,Non-local	English
17	swimming calorie calculator	us	10	450	0.03	1.54	calories burned swimming	2026-07-26 21:26:25	People also ask,Video preview	900	4000	7100	2015-09-22	Informational,Non-branded,Non-local	English
18	beer calorie calculator	us	5	400	0.07	1.4	ipa calories	2026-07-05 01:12:42	AI Overview,Thumbnail,People also ask	500	500	700	2015-12-28	Informational,Non-branded,Non-local	English
19	jimmy johns calorie calculator	us	1	400	3.50		jimmy johns nutrition calculator	2026-08-12 05:57:29	Sitelinks	400	500	500	2015-10-10	Informational,Branded,Non-local	English
20	dominos calorie calculator	us	10	350	0.07	1.21	how much is a medium pepperoni pizza at domino's	2026-08-17 21:34:19	Sitelinks	500	350	400	2015-09-05	Informational,Branded,Non-local	English
21	five guys calorie calculator	us	6	300			five guys calorie calculator	2026-08-15 11:05:37	Sitelinks	350	200	200	2015-10-21	Informational,Branded,Non-local	English
22	pizza hut calorie calculator	us	2	300		1.19	pizza hut allergen menu	2026-08-18 02:15:09		300	9900	11000	2015-09-17	Informational,Branded,Non-local	English
23	rowing machine calorie calculator	us	3	300	1.60	1.91	rowing machine calorie calculator	2026-08-09 22:33:49	People also ask,Sitelinks	500	1500	1900	2015-09-16	Informational,Non-branded,Non-local	English
24	jump rope calorie calculator	us	5	300	0.04	1.58	jump rope calorie calculator	2026-08-11 18:11:21	People also ask,Sitelinks,Video preview	600	500	800	2015-12-30	Informational,Non-branded,Non-local	English
25	body recomposition calorie calculator	us	6	250	0.05		body recomposition calculator	2026-07-19 14:11:05	Sitelinks	350	2100	2900	2017-04-07	Informational,Non-branded,Non-local	English
26	wendy's calorie calculator	us	6	250	0.30	1.47	wendy's allergen menu	2026-07-15 05:28:43		300	11000	12000	2016-01-15	Informational,Branded,Non-local	English
27	subway sandwich calorie calculator	us	3	250	0.06	1.35	subway calorie calculator	2026-07-11 10:14:40		300	8100	9800	2015-09-11	Informational,Branded,Non-local	English
28	poke bowl calorie calculator	us	0	250	0.70	1.63	poke bowl calorie calculator	2026-07-05 13:10:37	Sitelinks,People also ask	300	350	400	2016-10-23	Informational,Non-branded,Non-local	English
29	salad calorie calculator	us	2	250	0.90	1.62	salad nutrition facts	2026-08-11 05:21:23	People also ask	300	1300	1600	2015-09-17	Informational,Non-branded,Non-local	English
30	body recomp calorie calculator	us	6	250	0.08		body recomposition	2026-08-05 16:29:29	Sitelinks	400	3500	4500	2020-01-10	Informational,Non-branded,Non-local	English
31	ihop calorie calculator	us	0	200			ihop nutrition	2026-07-29 21:16:11	People also ask	200	3500	3600	2016-07-24	Informational,Branded,Non-local	English
32	sushi calorie calculator	us	1	200	2.50		sushi calories	2026-07-12 11:36:32	AI Overview,Thumbnail,People also ask	250	600	600	2015-12-31	Informational,Non-branded,Non-local	English
33	calorie calculator breastfeeding	us	2	200	1.10		breastfeeding calorie calculator	2026-08-17 12:18:17	Sitelinks	400	1600	2000	2016-01-06	Informational,Non-branded,Non-local	English
34	wawa calorie calculator	us	1	200			wawa nutrition	2026-07-22 02:48:07		200	2200	2200	2015-12-31	Informational,Branded,Non-local	English
35	burger king calorie calculator	us	0	200	0.05	1.23	burger king nutrition calculator	2026-07-25 00:33:17	AI Overview,Thumbnail	250	0	0	2015-11-27	Informational,Branded,Non-local	English
36	sheetz calorie calculator	us	0	200			sheetz nutrition	2026-08-10 11:21:34	Sitelinks,People also ask	200	2500	2500	2015-09-24	Informational,Branded,Non-local	English
37	blaze pizza calorie calculator	us	1	200			blaze pizza nutrition	2026-07-05 18:32:47	Sitelinks	200	6700	6800	2016-05-09	Informational,Branded,Non-local	English
38	keto calorie calculator	us	10	200	0.60	1.29	keto calculator	2026-08-01 06:55:05	AI Overview,Thumbnail,People also ask,Sitelinks	300	4600	5400	2015-09-02	Informational,Non-branded,Non-local	English
39	rowing calorie calculator	us	2	200	1.90	1.54	rowing machine calorie calculator	2026-08-11 19:53:27	Sitelinks,People also ask	350	1500	1900	2015-11-20	Informational,Non-branded,Non-local	English
40	calorie in food calculator	us	0	150	0.70	1.52	food calorie calculator	2026-06-11 04:06:31	People also ask	250	20000	45000	2016-03-14	Informational,Non-branded,Non-local	English
41	starbucks coffee calorie calculator	us	10	150	3.50		starbucks calorie calculator	2026-06-29 07:34:15	Video preview	150	6800	7200	2016-03-07	Informational,Branded,Non-local	English
42	kfc calorie calculator	us	2	150	0.04		kfc.com/contact	2026-07-22 10:12:27	Sitelinks,Video preview,Image pack	400	6600	7800	2015-09-15	Informational,Branded,Non-local	English
43	salata calorie calculator	us	2	150			salata nutrition	2026-06-08 17:37:14	Sitelinks	150	800	900	2017-10-10	Informational,Branded,Non-local	English
44	exercise bike calorie calculator	us	10	150	4.50	1.52	stationary bike calorie calculator	2026-06-10 00:52:34	Sitelinks,People also ask	200	2000	2700	2015-10-04	Informational,Non-branded,Non-local	English
45	indian food calorie calculator	us	0	150	1.00		indian food calorie calculator	2026-08-17 09:02:55	AI Overview,Thumbnail,Image pack,People also ask,Video preview	3000	100	5300	2016-03-17	Informational,Non-branded,Non-local	English
46	goruck calorie calculator	us	0	150	0.02		rucking calorie calculator	2026-07-27 20:43:50	Video preview,Sitelinks	150	1000	1100	2019-12-26	Informational,Branded,Non-local	English
47	bariatric calorie calculator	us	3	150	1.10		bariatric weight loss calculator	2026-07-04 02:54:16	People also ask	200	600	700	2018-10-01	Informational,Non-branded,Non-local	English
48	jersey mike's calorie calculator	us	1	150	1.60		jersey mike's nutrition calculator	2026-08-18 19:29:05	Sitelinks	150	3000	3000	2017-04-16	Informational,Branded,Non-local	English
49	whataburger calorie calculator	us	6	150			whataburger nutrition	2026-05-28 05:18:25	Sitelinks	150	11000	11000	2016-03-28	Informational,Branded,Non-local	English
50	publix sub calorie calculator	us	1	150	0.15		publix ultimate sub	2026-06-24 06:37:03	Sitelinks,People also ask	150	1100	1100	2015-09-28	Informational,Branded,Non-local	English
51	sauna calorie calculator	us	0	150	3.00		calories burned in sauna	2026-06-07 21:51:39	People also ask	150	1000	1200	2015-11-16	Informational,Non-branded,Non-local	English
52	breastfeeding calorie deficit calculator	us	2	150	0.70		breastfeeding calorie calculator	2026-07-03 13:00:37	AI Overview,Thumbnail,People also ask	250	1400	1900	2022-02-14	Informational,Non-branded,Non-local	English
53	popeyes calorie calculator	us	6	150	0.05		popeyes nutrition	2026-05-26 19:18:05		200	24000	26000	2018-08-09	Informational,Branded,Non-local	English
54	stair master calorie calculator	us	0	150	2.00		stairmaster calorie calculator	2026-07-30 03:30:10	AI Overview,Thumbnail,People also ask,Sitelinks	200	1700	2000	2018-10-15	Informational,Branded,Non-local	English
55	sonic calorie calculator	us	0	100			sonic nutrition	2026-06-08 09:27:39		100	5900	5900	2016-07-14	Informational,Branded,Non-local	English
56	jimmy john's calorie calculator	us	1	100		1.26	jimmy johns nutrition calculator	2026-08-14 23:51:54	Sitelinks,People also ask	100	600	600	2015-10-21	Informational,Branded,Non-local	English
57	5 guys calorie calculator	us	10	100			five guys nutrition	2026-05-20 14:57:04		100	8200	8700	2015-09-07	Informational,Branded,Non-local	English
58	eric roberts calorie calculator	us	0	100	0.60		eric roberts calorie calculator	2026-07-21 06:59:53	Video preview,People also ask	200	60	60	2022-04-03	Informational,Non-branded,Non-local	English
59	21 day fix calorie calculator	us	2	100	1.30	0.84	21 day fix calculator	2026-05-23 18:08:50	People also ask,Sitelinks	100	250	250	2015-09-01	Informational,Branded,Non-local	English
60	olive garden calorie calculator	us	2	100			olive garden nutrition facts	2026-05-27 14:03:03	People also ask	100	10000	10000	2017-06-18	Informational,Branded,Non-local	English
61	myplate calorie calculator	us	1	100	0.50		myplate meal plan	2026-08-14 08:18:36	Sitelinks,People also ask	100	600	700	2015-12-13	Informational,Branded,Non-local	English
62	weighted vest calorie calculator	us	0	100			walking calories calculator	2026-06-06 09:45:54	Sitelinks,People also ask	100	1200	1200	2020-03-03	Informational,Non-branded,Non-local	English
63	backpacking calorie calculator	us	4	100		2.08	hiking calorie calculator	2026-06-11 19:42:46	Sitelinks	150	1400	1500	2015-09-06	Informational,Non-branded,Non-local	English
64	muscle building calorie calculator	us	0	100	0.03		macro calculator	2026-08-21 16:17:31	Sitelinks,AI Overview,Thumbnail,People also ask	300	82000	130000	2016-09-10	Informational,Non-branded,Non-local	English
65	calorie burn walking calculator	us	7	90	0.60		calories burned calculator	2026-08-18 00:17:53	AI Overview,Thumbnail,People also ask	150	45000	74000	2016-01-05	Informational,Non-branded,Non-local	English
66	panera calorie calculator	us	1	90	0.20	1.15	panera nutrition	2026-06-08 18:04:33	People also ask	90	8100	8200	2015-09-17	Informational,Branded,Non-local	English
67	calorie calculator for runners	us	4	90	1.00		calorie calculator for runners	2026-06-04 18:14:55		100	150	250	2019-04-12	Informational,Non-branded,Non-local	English
68	mod pizza calorie calculator	us	1	90	0.35		mod pizza nutrition	2026-07-01 21:33:21		90	3200	3200	2015-10-04	Informational,Branded,Non-local	English
69	dairy queen calorie calculator	us	7	80			dairy queen nutrition	2026-07-15 04:45:27		90	10000	11000	2016-05-21	Informational,Branded,Non-local	English
70	pcos calorie calculator	us	0	80	0.80		pcos calorie calculator	2026-06-25 16:13:39	Sitelinks,People also ask	150	80	90	2016-12-22	Informational,Non-branded,Non-local	English
71	calorie calculator for walking	us	7	80	0.00		calories burned walking	2026-07-26 15:52:33	AI Overview,Thumbnail,People also ask	150	21000	38000	2015-09-19	Informational,Non-branded,Non-local	English
72	calorie calculator for body recomp	us	7	80	0.04		body recomposition calculator	2026-08-20 22:05:29	Sitelinks,Video preview	100	2300	3600	2020-12-14	Informational,Non-branded,Non-local	English
73	push up calorie calculator	us	5	80	7.00	1.4	pushup calorie calculator	2026-05-23 01:56:33	People also ask,Sitelinks	150	40	40	2015-09-23	Informational,Non-branded,Non-local	English
74	poke calorie calculator	us	0	80			poke bowl calories	2026-07-19 15:08:56	People also ask	90	1400	1700	2016-10-04	Informational,Non-branded,Non-local	English
75	smoothie king calorie calculator	us	4	80	0.90		smoothie king nutrition facts	2026-06-01 19:24:47		80	3400	3500	2016-05-05	Informational,Branded,Non-local	English
76	carnivore calorie calculator	us	0	80	0.10		carnivore macro calculator	2026-06-06 08:31:01	People also ask,Sitelinks	100	700	700	2020-01-09	Informational,Non-branded,Non-local	English
77	calorie calculator stationary bike	us	5	70			stationary bike calorie calculator	2026-07-28 11:13:54	AI Overview,Thumbnail,People also ask	80	2100	2700	2016-06-09	Informational,Non-branded,Non-local	English
78	calorie calculator for body recomposition	us	9	70			body recomposition calculator	2026-06-08 22:41:01	Bottom ads,Paid sitelinks	150	2900	4400	2018-04-11	Informational,Non-branded,Non-local	English
79	james smith calorie calculator	us	9	70	0.70		james smith calorie calculator	2026-05-27 23:25:18	Sitelinks,People also ask,Video preview,Bottom ads,Paid sitelinks	7700	20	800	2018-05-20	Informational,Non-branded,Non-local	English
80	calorie calculator pregnancy	us	3	70			pregnancy calorie calculator	2026-07-19 16:17:38		150	150	200	2015-09-05	Informational,Non-branded,Non-local	English
81	pcos calorie deficit calculator	us	0	60	2.00		pcos calorie calculator	2026-07-02 16:22:05	Sitelinks,People also ask	100	80	100	2021-03-04	Informational,Non-branded,Non-local	English
82	stair stepper calorie calculator	us	0	60			stairmaster calorie calculator	2026-08-14 19:20:59	People also ask	70	1600	1800	2016-12-04	Informational,Non-branded,Non-local	English
83	calorie calculator based on macros	us	9	60	1.00		macro to calorie calculator	2026-08-15 06:14:31	People also ask	80	400	500	2016-10-08	Informational,Non-branded,Non-local	English
84	starbucks custom drink calorie calculator	us	9	60			starbucks calorie calculator	2026-05-30 04:19:28	Sitelinks,Video preview	70	26000	28000	2020-01-17	Informational,Branded,Non-local	English
85	stairmaster calorie burn calculator	us	0	60			stairmaster calorie calculator	2026-08-19 20:01:17	People also ask	90	1500	1800	2016-11-09	Informational,Branded,Non-local	English
86	calorie deficit calculator breastfeeding	us	2	60			breastfeeding calorie calculator	2026-08-14 14:09:08	Sitelinks,People also ask	90	1900	2300	2021-01-27	Informational,Non-branded,Non-local	English
87	treadmill calorie calculator accuracy	us	3	60			how accurate are treadmill calories	2026-08-11 01:20:26	AI Overview,Thumbnail,People also ask	100	350	350	2015-09-25	Informational,Commercial,Non-branded,Non-local	English
88	sauna calorie burn calculator	us	0	60			sauna calories burned	2026-08-15 04:54:32	People also ask	70	800	900	2016-01-25	Informational,Non-branded,Non-local	English
89	applebee's calorie calculator	us	2	60			applebee's nutrition calculator	2026-07-27 02:58:51	People also ask	60	500	500	2015-09-12	Informational,Branded,Non-local	English
90	firehouse subs calorie calculator	us	2	60	1.50		firehouse subs nutrition	2026-06-06 18:49:48		70	2800	2800	2016-12-01	Informational,Branded,Non-local	English
91	sushi roll calorie calculator	us	1	60			sushi calories	2026-06-26 19:04:37	Sitelinks	70	800	800	2017-07-12	Informational,Non-branded,Non-local	English
92	wendys calorie calculator	us	4	60	0.45		wendys nutrition	2026-06-18 22:14:24		70	14000	16000	2015-12-21	Informational,Branded,Non-local	English
93	calorie calculator for breastfeeding	us	4	60	0.70		breastfeeding calorie calculator	2026-06-13 20:02:50	People also ask	100	1700	2100	2016-06-09	Informational,Non-branded,Non-local	English
94	stair climber calorie calculator	us	2	50			stairmaster calorie calculator	2026-06-29 10:39:24	People also ask	60	1700	1900	2015-12-15	Informational,Non-branded,Non-local	English
95	concept 2 calorie calculator	us	0	50	0.01		rowing machine calorie calculator	2026-05-30 02:48:46	Sitelinks,People also ask,Video preview	150	600	900	2015-10-16	Informational,Branded,Non-local	English
96	assault bike calorie calculator	us	0	50			assault bike calories calculator	2026-07-30 01:40:23	AI Overview,Thumbnail,People also ask	60	30	30	2017-10-13	Informational,Non-branded,Non-local	English
97	royal canin calorie calculator dog	us	8	50			how much food to feed my dog	2026-06-16 14:45:43		100	800	800	2018-05-04	Informational,Branded,Non-local	English
98	calorie calculator while breastfeeding	us	5	50	0.45		how many calories does breastfeeding burn	2026-08-08 05:18:28	AI Overview,Thumbnail,Sitelinks	70	1800	2300	2017-12-26	Informational,Non-branded,Non-local	English
99	elliptical calorie burn calculator	us	5	50			elliptical calorie calculator	2026-07-05 15:42:37	AI Overview,Thumbnail,Sitelinks,People also ask	70	1300	1600	2016-02-06	Informational,Non-branded,Non-local	English
100	papa john's calorie calculator	us	3	50	0.01	1.14	papa john's nutrition	2026-08-20 14:13:52	AI Overview,Thumbnail	50	1500	1600	2017-05-20	Informational,Branded,Non-local	English
101	bubble tea calorie calculator	us	4	50			boba tea calories	2026-08-11 17:05:43	Sitelinks,AI Overview,Thumbnail,People also ask	150	150	350	2018-11-12	Informational,Non-branded,Non-local	English
102	dunkin calorie calculator coffee	us	9	50			dunkin calorie calculator	2026-05-18 13:29:50	Sitelinks	50	3200	3300	2023-07-17	Informational,Branded,Non-local	English
103	calorie calculator body recomp	us	5	50			body recomposition calculator	2026-05-22 19:55:19		90	2900	4400	2020-06-12	Informational,Non-branded,Non-local	English
104	cookout calorie calculator	us	1	50			cookout nutrition	2026-06-27 12:43:32	People also ask	60	3700	3700	2018-07-05	Informational,Branded,Non-local	English
105	squat calorie calculator	us	0	40			squat calorie calculator	2026-07-09 09:32:39	Sitelinks,People also ask	80	250	300	2016-01-01	Informational,Non-branded,Non-local	English
106	lactation calorie calculator	us	6	40			breastfeeding calorie calculator	2026-06-06 09:41:11	Sitelinks	50	1600	1900	2020-10-21	Informational,Non-branded,Non-local	English
107	breastfeeding calorie calculator to lose weight	us	2	40			diet plan for breastfeeding mothers to lose weight	2026-07-26 18:42:05	AI Overview,Thumbnail,People also ask	60	1900	2400	2020-01-17	Informational,Non-branded,Non-local	English
108	mifflin-st jeor calorie calculator equation	us	5	40	3.50		mifflin st jeor equation	2026-06-15 07:01:22	AI Overview,Thumbnail,People also ask,Video preview	70	11000	14000	2022-02-23	Informational,Non-branded,Non-local	English
109	jack in the box calorie calculator	us	4	40			jack in the box nutrition	2026-06-26 04:22:19		40	4200	4200	2020-02-21	Informational,Branded,Non-local	English
110	qdoba bowl calorie calculator	us	10	40	1.50		qdoba nutrition	2026-06-17 15:54:20	Sitelinks	40	7100	7100	2017-04-14	Informational,Branded,Non-local	English
111	carnivore diet calorie calculator	us	10	40			carnivore macro calculator	2026-06-13 17:44:06	People also ask	40	600	700	2020-02-13	Informational,Non-branded,Non-local	English
112	body recomposition calorie deficit calculator	us	4	40			body recomposition calculator	2026-06-15 20:42:25	Sitelinks,People also ask	50	1200	1600	2021-04-12	Informational,Non-branded,Non-local	English
113	mifflin calorie calculator	us	8	40			mifflin st jeor equation	2026-05-23 13:03:03	Video preview,Sitelinks	70	5300	6100	2016-06-06	Informational,Non-branded,Non-local	English
114	ruck march calorie calculator	us	0	40			rucking calorie calculator	2026-06-02 23:18:17	Sitelinks,People also ask	40	1200	1200	2015-11-17	Informational,Branded,Non-local	English
115	calorie calculator chick fil a	us	8	40	0.35		chick fil a nutrition	2026-06-17 16:56:21	Sitelinks	40	83000	84000	2017-02-23	Informational,Branded,Non-local	English
116	the breastfeeding mama calorie calculator	us	3	40			calorie calculator breastfeeding	2026-06-04 19:14:10	Sitelinks,Video preview	60	700	800	2023-06-03	Informational,Non-branded,Non-local	English
117	recumbent bike calorie calculator	us	10	40			cycling calorie calculator	2026-06-17 04:26:40	Sitelinks,People also ask	40	1300	1600	2015-11-29	Informational,Non-branded,Non-local	English
118	most accurate cycling calorie calculator	us	6	40			calories burned biking	2026-06-28 06:07:22	AI Overview,Thumbnail,Sitelinks,People also ask,Discussions	70	10000	17000	2016-07-31	Informational,Commercial,Non-branded,Non-local	English
119	firehouse calorie calculator	us	1	30			firehouse subs nutrition	2026-06-30 04:55:08	People also ask,Sitelinks	30	800	900	2017-12-16	Informational,Branded,Non-local	English
120	dig calorie calculator	us	0	30			dig inn nutrition	2026-08-19 04:17:55	People also ask	30	1700	1700	2022-11-12	Informational,Branded,Non-local	English
121	calorie burned calculator walking	us	0	30			calories burned calculator	2026-07-05 20:40:06	People also ask	50	60000	98000	2016-08-17	Informational,Non-branded,Non-local	English
122	calorie calculator mifflin st jeor	us	8	30			mifflin st jeor equation	2026-05-28 04:20:13	Video preview,People also ask	50	6000	7300	2015-09-09	Informational,Non-branded,Non-local	English
123	kinobody calorie calculator	us	0	30			kinobody calorie calculator	2026-07-06 15:33:15	Sitelinks	50	10	10	2016-03-11	Informational,Branded,Non-local	English
124	cold stone calorie calculator	us	0	30			cold stone nutrition	2026-06-11 23:45:59		30	600	600	2020-01-24	Informational,Branded,Non-local	English
125	calorie calculator indian food	us	2	30	0.80		calorie calculator food	2026-05-28 19:13:22	Sitelinks	400	250	5400	2015-09-10	Informational,Non-branded,Non-local	English
126	eric roberts fitness calorie calculator	us	0	30			eric roberts calorie calculator	2026-06-30 22:45:27	Top ads,Video preview	50	70	70	2022-03-29	Informational,Navigational,Branded,Non-local	English
127	carl's jr calorie calculator	us	0	30	0.50		carl's jr nutrition	2026-06-25 12:41:07	Sitelinks,People also ask	30	1700	1700	2017-02-13	Informational,Branded,Non-local	English
128	jump rope calorie burn calculator	us	2	30			jump rope calorie calculator	2026-06-05 09:48:01	People also ask,Sitelinks,Video preview	50	600	800	2015-10-06	Informational,Non-branded,Non-local	English
129	mellow mushroom calorie calculator	us	0	30			mellow mushroom nutrition	2026-08-16 13:43:54	People also ask	30	300	300	2016-12-13	Informational,Branded,Non-local	English
130	bolay calorie calculator	us	0	30			bolay calories	2026-06-27 01:35:46	People also ask	30	500	500	2017-03-13	Informational,Branded,Non-local	English
131	stair calorie calculator	us	5	30			calories burned climbing stairs	2026-06-24 18:57:35	Sitelinks,People also ask	50	500	800	2015-09-28	Informational,Non-branded,Non-local	English
132	jumping jack calorie calculator	us	0	30			jumping jacks calories calculator	2026-05-25 18:18:52	People also ask	50	60	150	2016-04-18	Informational,Non-branded,Non-local	English
133	burpee calorie calculator	us	2	30			how many calories do burpees burn	2026-05-22 18:49:53	Sitelinks,People also ask	50	700	1000	2015-09-04	Informational,Non-branded,Non-local	English
134	spin bike calorie calculator	us	7	30			stationary bike calorie calculator	2026-06-05 02:40:11	Sitelinks,People also ask	60	2000	2700	2016-06-24	Informational,Non-branded,Non-local	English
135	bike riding calorie calculator	us	10	30	0.70		calories burned biking	2026-06-08 08:58:11	People also ask,Sitelinks	60	11000	18000	2016-07-31	Informational,Non-branded,Non-local	English
136	peloton calorie calculator	us	2	30			peloton calorie calculator	2026-05-17 20:50:43	Sitelinks,People also ask	30	50	50	2020-01-27	Informational,Branded,Non-local	English
137	yoga calorie calculator	us	9	30			yoga calories burned calculator	2026-06-15 17:06:25	People also ask,Sitelinks	30	1200	1500	2015-09-24	Informational,Non-branded,Non-local	English
138	boba calorie calculator	us	3	30			bubble tea calorie calculator	2026-06-12 06:57:46	People also ask,Sitelinks	40	50	70	2019-06-09	Informational,Non-branded,Non-local	English
139	elliptical machine calorie calculator	us	4	30	3.50		elliptical calorie calculator	2026-06-03 03:04:59	Sitelinks	40	1400	1600	2015-12-22	Informational,Non-branded,Non-local	English
140	calorie to pound calculator	us	1	30			calories to pounds	2026-07-18 22:05:38	People also ask,AI Overview,Thumbnail	30	700	800	2015-12-03	Informational,Non-branded,Non-local	English
141	calorie calculator for recomp	us	5	30			body recomposition calculator	2026-05-26 13:44:49		40	2900	4500	2020-07-07	Informational,Non-branded,Non-local	English
142	yoga calorie burn calculator	us	8	20			yoga calories burned calculator	2026-06-28 15:50:24	Sitelinks,People also ask	20	1200	1500	2017-05-18	Informational,Non-branded,Non-local	English
143	stair climbing calorie calculator	us	4	20			stairmaster calorie calculator	2026-08-17 04:56:17	AI Overview,Thumbnail,People also ask,Sitelinks	30	400	600	2016-12-12	Informational,Non-branded,Non-local	English
144	indian food calorie calculator app	us	10	20	1.00		indian food calorie calculator	2026-07-05 05:27:28	AI Overview,Thumbnail,People also ask,Video preview	200	40	250	2016-06-16	Informational,Commercial,Non-branded,Non-local	English
145	chipotle calorie calculator reddit	us	0	20			chipotle nutrition calculator	2026-06-27 14:00:29	Sitelinks	20	296000	303000	2020-07-17	Informational,Branded,Non-local	English
146	acai bowl calorie calculator	us	0	20			acai bowl calories calculator	2026-06-09 03:24:12	People also ask	20	50	60	2017-10-29	Informational,Non-branded,Non-local	English
147	starbucks calorie calculator custom	us	9	20			starbucks calorie calculator	2026-06-10 23:09:34		30	7600	8100	2020-01-17	Informational,Branded,Non-local	English
148	breastfeeding calorie calculator app	us	2	20	0.80		breastfeeding calorie calculator	2026-07-06 10:14:37	AI Overview,Thumbnail,People also ask,Sitelinks	20	1400	1900	2017-09-02	Informational,Commercial,Non-branded,Non-local	English
149	pushup calorie calculator	us	6	20			push up calorie calculator	2026-08-18 06:08:39	People also ask	40	90	100	2015-09-23	Informational,Non-branded,Non-local	English
150	hiit calorie burn calculator	us	6	20			calories burned hiit	2026-07-27 17:27:59	AI Overview,Thumbnail,People also ask	40	20	20	2015-09-30	Informational,Non-branded,Non-local	English
151	boba tea calorie calculator	us	4	20			bubble tea calories	2026-06-26 18:15:59	Sitelinks,People also ask	20	350	1300	2020-09-26	Informational,Non-branded,Non-local	English
152	navy bike calorie calculator	us	0	20			navy prt calculator	2026-06-05 19:46:18	Sitelinks	20	3600	3600	2015-09-21	Informational,Branded,Non-local	English
153	bojangles calorie calculator	us	1	20			bojangles nutrition	2026-08-20 22:36:23	People also ask	20	1800	1800	2017-10-16	Informational,Branded,Non-local	English
154	tennis calorie calculator	us	0	20			calories burned playing tennis	2026-07-25 03:04:42	Sitelinks,People also ask	30	150	150	2020-02-08	Informational,Non-branded,Non-local	English
155	biking calorie burn calculator	us	10	20			calories burned biking	2026-06-26 01:56:22	Sitelinks,People also ask	30	10000	17000	2018-01-09	Informational,Non-branded,Non-local	English
156	papa murphy's calorie calculator	us	2	20			papa murphy's nutrition	2026-06-29 23:19:21		20	1300	1300	2016-03-01	Informational,Branded,Non-local	English
157	intermittent fasting calorie calculator	us	4	20	0.50		intermittent fasting calculator	2026-06-04 06:24:17	People also ask	30	800	1000	2016-06-12	Informational,Non-branded,Non-local	English
158	bjj calorie calculator	us	0	20			how many calories does jiu jitsu burn	2026-06-24 12:38:13	Sitelinks,People also ask	30	200	200	2018-07-11	Informational,Non-branded,Non-local	English
159	calorie calculator rowing machine	us	6	20			rowing machine calorie calculator	2026-07-04 02:29:00	Sitelinks,People also ask	40	1100	1500	2015-11-15	Informational,Non-branded,Non-local	English
160	horse calorie calculator	us	4	20			horse feed calculator	2026-08-06 07:01:08	People also ask,Sitelinks	20	300	350	2017-07-06	Informational,Commercial,Non-branded,Non-local	English
161	chicken breast calorie calculator	us	3	20			chicken breast calories	2026-06-02 14:32:53	People also ask	20	3200	4900	2017-11-19	Informational,Non-branded,Non-local	English
162	breastfeeding mom calorie calculator	us	5	20			breastfeeding calorie calculator	2026-07-08 23:19:32	Sitelinks,People also ask	30	2200	2800	2020-03-24	Informational,Non-branded,Non-local	English
163	calorie calculator incline treadmill	us	5	20			treadmill calorie calculator	2026-07-25 01:09:42	Sitelinks	30	9900	13000	2017-11-21	Informational,Non-branded,Non-local	English
164	rowing calorie burn calculator	us	1	20			rowing machine calorie calculator	2026-07-21 11:44:02	People also ask,Sitelinks	30	1400	1800	2020-01-10	Informational,Non-branded,Non-local	English
165	calorie calculator to lose weight while breastfeeding	us	2	20	0.60		breastfeeding calorie calculator	2026-08-15 04:48:53	Sitelinks	20	1900	2300	2020-05-17	Informational,Non-branded,Non-local	English
166	chicken calorie calculator	us	1	20			chicken breast calories	2026-06-29 22:19:41	People also ask	20	3200	4800	2015-09-12	Informational,Non-branded,Non-local	English
167	hiit calorie calculator	us	8	20		1.91	hiit calories burned calculator	2026-06-08 07:42:04	People also ask	50	300	500	2015-09-14	Informational,Non-branded,Non-local	English
168	calorie burn calculator elliptical	us	9	20			elliptical calorie calculator	2026-08-03 06:56:07	AI Overview,Thumbnail,People also ask,Sitelinks	30	1300	1500	2016-04-07	Informational,Non-branded,Non-local	English
169	p90x calorie calculator	us	0	20		1.38	p90x calorie calculator	2026-08-13 07:59:24	AI Overview,Thumbnail,People also ask	30	10	10	2015-09-01	Informational,Branded,Non-local	English
170	gram to calorie calculator	us	2	20	0.00		grams to calories	2026-06-16 15:53:05	Sitelinks,People also ask	50	800	1400	2017-02-05	Informational,Non-branded,Non-local	English
171	rowing machine calorie burn calculator	us	6	20	1.10		rowing machine calorie calculator	2026-06-10 18:14:30	Sitelinks,People also ask	30	800	1100	2017-01-17	Informational,Non-branded,Non-local	English
172	nursing calorie calculator	us	3	20			breastfeeding calorie calculator	2026-06-10 13:15:48	Sitelinks,People also ask	20	1600	2000	2016-12-01	Informational,Non-branded,Non-local	English
173	crossfit calorie calculator	us	9	20			crossfit calorie calculator	2026-06-24 03:57:40	Sitelinks,People also ask	30	20	20	2015-09-11	Informational,Branded,Non-local	English
174	nandos calorie calculator	us	0	20			nandos nutrition	2026-07-20 13:39:42	Video preview,People also ask	150	300	1900	2015-12-17	Informational,Branded,Non-local	English
175	ebike calorie calculator	us	1	20			bike ride calorie calculator	2026-06-09 12:02:25	Sitelinks,People also ask	40	90	90	2018-07-31	Informational,Non-branded,Non-local	English
176	rower calorie calculator	us	3	20	1.50		rowing machine calorie calculator	2026-06-30 04:27:55	Sitelinks,People also ask	30	900	1300	2019-09-09	Informational,Non-branded,Non-local	English
177	calorie calculator elliptical	us	9	20	0.00		elliptical calorie calculator	2026-06-15 22:04:09	Sitelinks,People also ask	30	1300	1600	2016-01-02	Informational,Non-branded,Non-local	English
178	pilates calorie calculator	us	5	20			pilates calories burned	2026-08-18 02:27:52	People also ask,AI Overview,Thumbnail	20	700	900	2017-01-06	Informational,Non-branded,Non-local	English
179	omelette calorie calculator	us	0	20	1.00		how many calories in an omelette	2026-08-15 17:32:40	AI Overview,People also ask	20	60	100	2016-09-15	Informational,Non-branded,Non-local	English
180	stairs calorie calculator	us	4	20			calories burned climbing stairs	2026-06-02 10:01:15	People also ask,Sitelinks,Video preview	30	600	900	2016-01-04	Informational,Non-branded,Non-local	English
181	rice calorie calculator	us	0	20			rice calculator	2026-06-19 00:02:44	People also ask	30	40	40	2016-09-22	Informational,Non-branded,Non-local	English
182	desk cycle calorie calculator	us	0	20			desk cycle calories	2026-05-23 17:47:24	Sitelinks,People also ask	30	40	40	2015-10-01	Informational,Branded,Non-local	English
183	deskcycle calorie calculator	us	0	20			desk cycle calories	2026-05-30 00:03:46	Sitelinks,People also ask	20	40	40	2016-04-20	Informational,Branded,Non-local	English
184	hiking calorie calculator with elevation gain	us	5	10			hiking calorie calculator	2026-07-25 01:05:26	Sitelinks	10	1300	1400	2016-07-03	Informational,Non-branded,Non-local	English
185	boxing calorie calculator	us	2	10			boxing calories burned	2026-05-16 23:02:35	People also ask	10	150	300	2021-04-22	Informational,Non-branded,Non-local	English
186	apple watch calorie calculator	us	8	10			how accurate is apple watch calories	2026-07-29 16:49:21	AI Overview,Thumbnail,People also ask	10	3200	3200	2020-05-26	Informational,Branded,Non-local	English
187	treadmill calorie calculator app	us	7	10			treadmill calorie calculator	2026-07-31 01:59:57	Sitelinks,People also ask	10	9900	13000	2016-03-23	Informational,Commercial,Non-branded,Non-local	English
188	navy prt bike calorie calculator	us	0	10		1.46	navy prt calculator	2026-05-16 11:44:46	Sitelinks,People also ask	10	5100	5300	2015-09-20	Informational,Branded,Non-local	English
189	basketball calorie calculator	us	7	10			calories burned playing basketball	2026-06-29 18:09:07	Sitelinks,People also ask	10	70	80	2017-06-22	Informational,Non-branded,Non-local	English
190	farmer's dog calorie calculator	us	2	10	2.00		farmers dog calories	2026-07-18 03:32:18	AI Overview,Thumbnail,People also ask	10	200	200	2023-07-28	Informational,Commercial,Branded,Non-local	English
191	calorie to gram calculator	us	1	10			calories to grams	2026-08-19 03:21:44	AI Overview,Thumbnail,People also ask,Sitelinks,Video preview	40	450	1000	2017-06-14	Informational,Non-branded,Non-local	English
192	pieology calorie calculator	us	1	10			pieology nutrition	2026-06-30 08:31:30	People also ask	10	500	500	2017-04-17	Informational,Branded,Non-local	English
193	kung fu tea calorie calculator	us	0	10			kung fu tea calories	2026-07-19 12:27:52	People also ask	10	1500	1700	2018-07-13	Informational,Branded,Non-local	English
194	free breastfeeding calorie calculator	us	5	10			breastfeeding calorie calculator	2026-08-16 14:47:38	People also ask,Sitelinks	10	1600	2000	2023-06-13	Informational,Non-branded,Non-local	English
195	poke bros calorie calculator	us	1	10			poke bros nutrition	2026-08-03 10:52:45	Sitelinks,People also ask	10	300	300	2021-03-16	Informational,Branded,Non-local	English
196	shake calorie calculator	us	1	10			smoothie calorie calculator	2026-07-06 05:12:53		40	450	500	2018-06-01	Informational,Non-branded,Non-local	English
197	calorie calculator to gain muscle and lose fat	us	0	10	0.20		bulking calculator	2026-08-15 11:17:35	Sitelinks,AI Overview,Thumbnail,People also ask,Video preview	20	4500	7200	2020-01-17	Informational,Commercial,Non-branded,Non-local	English
198	outback calorie calculator	us	3	10			outback allergen menu	2026-06-01 15:48:11	Sitelinks	10	4100	4200	2017-06-26	Informational,Branded,Non-local	English
199	hiit workout calorie calculator	us	3	10			hiit calories burned calculator	2026-06-10 09:38:58	People also ask	10	300	500	2016-02-01	Informational,Non-branded,Non-local	English
200	life fitness treadmill calorie calculator	us	9	10			calories burned calculator	2026-05-23 22:46:49	Video preview,People also ask,Sitelinks	20	700	700	2017-12-13	Informational,Branded,Non-local	English
201	running calorie calculator with elevation	us	6	10			calories burned calculator	2026-07-24 12:05:29	People also ask	20	14000	24000	2017-07-04	Informational,Non-branded,Non-local	English
202	insanity calorie calculator	us	1	10		1.14	21 day fix calculator	2026-08-05 02:42:40	AI Overview,Thumbnail,People also ask,Sitelinks	20	150	200	2015-10-02	Informational,Branded,Non-local	English
203	calorie calculator for indian food	us	0	10	0.90		indian food calorie calculator	2026-08-18 15:43:20	Sitelinks,Video preview,People also ask	250	100	5300	2016-12-26	Informational,Commercial,Non-branded,Non-local	English
204	grams to calorie calculator	us	6	10			grams to calories	2026-05-28 00:43:18	Sitelinks,People also ask	30	800	1400	2017-02-07	Informational,Non-branded,Non-local	English
205	golf calorie calculator	us	0	10			calories burned golfing	2026-06-05 19:56:19	Sitelinks	10	150	200	2016-05-10	Informational,Non-branded,Non-local	English
206	burger calorie calculator	us	8	10			red robin nutrition	2026-07-04 23:49:18	AI Overview,Thumbnail,People also ask	10	1500	1500	2016-11-30	Informational,Non-branded,Non-local	English
207	jordan syatt calorie calculator	us	0	10	0.06		weight loss calculator	2026-08-13 18:38:29	AI Overview,Thumbnail,Video preview,People also ask	20	20	200	2019-10-16	Informational,Non-branded,Non-local	English
208	hot yoga calorie calculator	us	1	10			yoga calories burned calculator	2026-07-18 22:48:37	AI Overview,Thumbnail,People also ask	10	1000	1400	2016-06-11	Informational,Non-branded,Non-local	English
209	katy hearn calorie calculator	us	0	10	3.00		katy hearn macro calculator	2026-08-17 14:07:28	People also ask	10	500	500	2017-03-16	Informational,Branded,Non-local	English
210	syatt fitness calorie calculator	us	4	10			calorie deficit calculator	2026-07-19 23:02:52	Video preview	10	450	900	2020-03-23	Informational,Branded,Non-local	English
211	spinning calorie calculator	us	9	10			calories burned biking	2026-08-10 07:28:59	People also ask	20	9400	16000	2016-01-08	Informational,Branded,Non-local	English
212	bike calculator calorie	us	10	10			calories burned biking	2026-06-06 07:35:56	Sitelinks,Video preview	10	11000	18000	2017-02-19	Informational,Non-branded,Non-local	English
213	navy prt calorie calculator bike	us	0	10			navy prt bike calculator	2026-06-12 04:44:58	Sitelinks,People also ask	10	1100	1100	2018-10-31	Informational,Branded,Non-local	English
214	homemade dog food calorie calculator	us	3	10	0.90		balance it	2026-07-30 18:50:22	AI Overview,Thumbnail,Sitelinks,People also ask,Video preview	10	6300	6500	2020-06-05	Informational,Non-branded,Non-local	English
215	elliptical trainer calorie calculator	us	8	10			calories burned calculator		20	700	700	2015-11-04	Informational,Non-branded,Non-local	English
216	deadlift calorie calculator	us	0	10			calories burned deadlifting	2026-06-12 07:59:47	People also ask	10	150	250	2016-07-05	Informational,Non-branded,Non-local	English
217	apple watch calorie goal calculator	us	3	10	0.80		apple watch move goal by age	2026-06-16 13:30:40	AI Overview,Thumbnail,People also ask	10	450	500	2020-08-30	Informational,Branded,Non-local	English
218	indoor cycle calorie calculator	us	6	10			stationary bike calorie calculator	2026-07-19 11:59:33	AI Overview,Thumbnail,People also ask	20	2000	2600	2019-04-20	Informational,Non-branded,Non-local	English
219	onesol calorie calculator	us	3		0.15		one sol macro calculator	2026-05-26 20:36:45	Sitelinks	10	10	2023-05-04	Informational,Commercial,Branded,Non-local	English
220	runner calorie intake calculator	us	8				calorie calculator for runners	2026-07-26 20:44:10	Sitelinks	80	80	2020-03-12	Informational,Non-branded,Non-local	English
221	tmpm calorie calculator	us	0				meal prep calorie calculator	2026-06-06 20:26:38		10	10	2023-12-31	Informational,Navigational,Branded,Non-local	English
222	v shred calorie calculator	us	8		0.60		v shred macro calculator	2026-08-19 22:45:03	People also ask	0	0	2017-07-22	Informational,Branded,Non-local	English
223	calorie move goal calculator	us	9				apple watch move goal calculator	2026-08-13 02:29:45	Sitelinks,People also ask	30	40	2020-05-23	Informational,Non-branded,Non-local	English
224	jeff nippard calorie calculator	us	2				ffmi calc	2026-08-02 22:19:13	Video preview,People also ask	20	20	2018-06-09	Informational,Non-branded,Non-local	English
225	stairmaster calorie calculator with speed	us	0				stairmaster calorie calculator	2026-08-13 23:01:54	People also ask	1600	1800	2023-08-18	Informational,Branded,Non-local	English
226	pet nutrition alliance calorie calculator dog	us	9				dog food calculator	2026-07-28 02:35:47	AI Overview,Thumbnail,People also ask	17000	19000	2020-03-20	Informational,Branded,Non-local	English
227	free calorie calculator for breastfeeding moms	us	0				breastfeeding calorie calculator	2026-08-17 21:25:32	People also ask,Discussions	1800	2200	2023-06-13	Informational,Non-branded,Non-local	English
228	stair machine calorie calculator	us	0				stairmaster calorie calculator	2026-05-26 11:35:23	Sitelinks	1300	1400	2016-05-05	Informational,Branded,Non-local	English
229	raw dog food calorie calculator	us	7		0.70		raw dog food calculator	2026-07-02 12:52:06	People also ask	700	900	2020-01-10	Informational,Non-branded,Non-local	English
230	jiu jitsu calorie calculator	us	0				how many calories does jiu jitsu burn	2026-08-18 00:34:53	AI Overview,Thumbnail,Sitelinks,People also ask	80	80	2017-04-15	Informational,Non-branded,Non-local	English
231	starbucks frappuccino calorie calculator	us	8				starbucks calorie calculator	2026-06-03 16:10:42	Sitelinks,People also ask,Video preview	26000	28000	2021-05-16	Informational,Branded,Non-local	English
232	cryotherapy calorie calculator	us	0				how many calories does cryotherapy burn	2026-07-22 20:27:22	People also ask	40	40	2019-09-26	Informational,Non-branded,Non-local	English
233	calorie calculator for intermittent fasting	us	4		0.50		fasting calculator	2026-07-18 05:14:38	People also ask,Sitelinks	3000	3600	2017-06-06	Informational,Non-branded,Non-local	English
234	insanity nutrition guide calorie calculator	us	4				insanity nutrition guide	2017-03-24	Informational,Branded,Non-local	English
235	hypothyroidism calorie calculator	us	0				hypothyroidism calorie calculator	2026-08-09 07:47:56	AI Overview,Thumbnail,Sitelinks,People also ask	0	0	2016-11-13	Informational,Non-branded,Non-local	English
236	kj to calorie calculator	us	3				kj vs calories	2026-08-12 04:16:19	People also ask,AI Overview,Thumbnail,Video preview,Sitelinks	450	38000	2015-11-25	Informational,Non-branded,Non-local	English
237	syatt calorie calculator	us	0				calorie weight loss calculator	2026-08-01 10:54:02	AI Overview,Thumbnail,Video preview	50	350	2020-05-19	Informational,Non-branded,Non-local	English
238	builtwithscience calorie calculator	us	6				calorie surplus calculator	2026-06-04 19:22:31		1600	3900	2019-04-03	Informational,Branded,Non-local	English
239	hot pot calorie calculator	us	0				is hotpot good for weight loss	2026-06-30 23:18:47	AI Overview,People also ask	0	0	2021-10-13	Informational,Non-branded,Non-local	English
240	craft beer calorie calculator	us	4				beer calorie calculator	2026-07-26 10:43:07	People also ask	70	100	2015-12-30	Informational,Non-branded,Non-local	English
"""

def parse_lines(raw_text):
    items = []
    for line in raw_text.strip().split('\n'):
        parts = line.split('\t')
        if not parts or len(parts) < 2:
            continue
        kw = parts[1].strip()
        vol = 0
        if len(parts) > 4 and parts[4].strip().isdigit():
            vol = int(parts[4].strip())
        tp = 0
        if len(parts) > 10 and parts[10].strip().isdigit():
            tp = int(parts[10].strip())
        gtp = 0
        if len(parts) > 11 and parts[11].strip().isdigit():
            gtp = int(parts[11].strip())
        parent = parts[7].strip() if len(parts) > 7 else ""
        intent = parts[14].strip() if len(parts) > 14 else "Informational"
        items.append({
            'keyword': kw,
            'vol': vol,
            'tp': tp,
            'gtp': gtp,
            'parent': parent,
            'intent': intent
        })
    return items

csv1_items = parse_lines(csv1_raw)
csv2_items = parse_lines(csv2_raw)
all_items = csv1_items + csv2_items

# Existing Calculator / Page Routes Mapping
existing_mapping = {
    "calculators/weight-loss/index.html": ["weight loss percentage calculator", "percentage weight loss calculator", "weight loss calculator percentage", "percentage calculator of weight loss", "percentage of weight loss calculator", "body weight loss percentage calculator", "weight percentage loss calculator", "body weight percentage loss calculator", "percentage of body weight loss calculator", "body percentage weight loss calculator", "percentage calculator weight loss", "weight loss calculator by percentage", "weight loss by percentage calculator", "weight loss challenge percentage calculator", "calculator for percentage of weight loss", "body percentage calculator weight loss", "percentage loss calculator weight", "weight loss percentage calculator formula", "total body weight loss percentage calculator", "how to figure percentage weight loss calculator", "calculate weight loss percentage calculator", "weight loss body percentage calculator", "calculator for weight loss percentage", "calculator weight loss percentage", "weight loss calculator in percentage", "percentage calculator for weight loss", "how to calculate percentage of weight loss calculator", "weight loss percentage loss calculator", "weight loss percentage calculator excel template", "weight loss percentage calculator kg", "fitwatch weight loss percentage calculator", "weight loss percentage calculator uk", "weight loss percentage calculator stone", "percentage of weight loss per week calculator", "weight loss in percentage calculator", "weight loss percentage calculator lbs and oz", "fitwatch percentage weight loss calculator", "calculator of weight loss percentage", "weight loss calculator percentage loss", "total weight loss percentage calculator", "weight loss percentage calculator spreadsheet", "weight loss calculator percentage body weight", "healthy weight loss percentage calculator", "fit watch weight loss percentage calculator", "body weight loss calculator percentage", "weight loss percentage calculator excel", "good calculator weight percentage loss", "weight loss percentage calculator biggest loser", "weight loss percentage calculator grams"],
    "calculators/newborn-weight-loss/index.html": ["weight loss percentage calculator newborn", "baby weight loss percentage calculator", "newborn weight loss percentage calculator", "birth weight loss percentage calculator", "infant percentage weight loss calculator", "percentage birth weight loss calculator", "infant weight loss percentage calculator", "percentage weight loss calculator newborn", "baby percentage weight loss calculator", "percentage weight loss baby calculator", "birth weight percentage loss calculator", "percentage weight loss calculator baby", "weight loss percentage calculator baby", "weight loss percentage calculator infant", "percentage of weight loss calculator newborn", "percentage weight loss calculator infant", "percentage of birth weight loss calculator", "weight loss percentage calculator infant"],
    "calculators/bariatric-surgery-weight-loss/index.html": ["percentage of excess weight loss calculator", "excess weight loss percentage calculator", "bariatric calorie calculator"],
    "calculators/biggest-loser/index.html": ["biggest loser weight loss percentage calculator", "biggest loser percentage weight loss calculator"],
    "calculators/bmi/index.html": ["bmi weight loss percentage calculator"],
    "calculators/body-fat/index.html": ["body fat percentage weight loss calculator", "body fat percentage calculator weight loss", "weight loss body fat percentage calculator", "weight loss calculator body fat percentage", "male body fat percentage weight loss calculator", "body fat percentage to weight loss calculator", "weight loss fat percentage calculator", "body fat weight loss percentage calculator", "body fat percentage weight loss rate calculator"],
    "calculators/calorie/index.html": ["calorie burn calculator", "calorie in food calculator", "calorie burned calculator walking", "calorie to pound calculator"],
    "calculators/calorie-deficit/index.html": ["mayo clinic calorie calculator", "losertown calorie calculator", "syatt fitness calorie calculator", "syatt calorie calculator"],
    "calculators/walking/index.html": ["walk calorie calculator", "calorie burn walking calculator", "calorie calculator for walking", "step calorie calculator"],
    "calculators/dog-weight-loss/index.html": ["pet calorie calculator", "royal canin calorie calculator dog", "farmer's dog calorie calculator", "homemade dog food calorie calculator", "pet nutrition alliance calorie calculator dog", "raw dog food calorie calculator"],
    "calculators/keto/index.html": ["keto calorie calculator"],
    "calculators/macro/index.html": ["calorie calculator to gain muscle", "macro percentage calculator for weight loss", "macros for weight loss calculator percentage", "muscle building calorie calculator", "calorie calculator based on macros", "calorie calculator to gain muscle and lose fat", "builtwithscience calorie calculator"],
    "calculators/pregnancy/index.html": ["calorie calculator pregnancy"],
    "calculators/postpartum-weight-loss/index.html": ["breastfeeding calorie calculator", "calorie calculator breastfeeding", "breastfeeding calorie deficit calculator", "calorie deficit calculator breastfeeding", "calorie calculator for breastfeeding", "calorie calculator while breastfeeding", "lactation calorie calculator", "breastfeeding calorie calculator to lose weight", "the breastfeeding mama calorie calculator", "breastfeeding mom calorie calculator", "calorie calculator to lose weight while breastfeeding", "nursing calorie calculator", "free breastfeeding calorie calculator", "free calorie calculator for breastfeeding moms"],
    "restaurants/starbucks/index.html": ["starbucks coffee calorie calculator", "starbucks custom drink calorie calculator", "starbucks calorie calculator custom", "starbucks frappuccino calorie calculator"],
    "restaurants/subway/index.html": ["subway sandwich calorie calculator"]
}

# Now group unmapped keywords into NEW proposed pages
new_pages = {
    "calculators/rucking": {
        "title": "Rucking Calorie Calculator — Calories Burned Rucking & Backpacking",
        "category": "Cardio & Fitness Equipment",
        "keywords": ["rucking calorie calculator", "ruck calorie calculator", "hiking calorie calculator", "goruck calorie calculator", "backpacking calorie calculator", "ruck march calorie calculator", "hiking calorie calculator with elevation gain"]
    },
    "calculators/stairmaster": {
        "title": "StairMaster Calorie Calculator — Stair Climbing Calories Burned",
        "category": "Cardio & Fitness Equipment",
        "keywords": ["stairmaster calorie calculator", "stair master calorie calculator", "stair stepper calorie calculator", "stairmaster calorie burn calculator", "stair climber calorie calculator", "stair machine calorie calculator", "stairmaster calorie calculator with speed", "stair calorie calculator", "stairs calorie calculator", "stair climbing calorie calculator"]
    },
    "calculators/elliptical": {
        "title": "Elliptical Calorie Calculator — Calories Burned on Elliptical Machine",
        "category": "Cardio & Fitness Equipment",
        "keywords": ["elliptical calorie calculator", "elliptical machine calorie calculator", "elliptical calorie burn calculator", "calorie burn calculator elliptical", "calorie calculator elliptical", "elliptical trainer calorie calculator"]
    },
    "calculators/rowing": {
        "title": "Rowing Machine Calorie Calculator — Calories Burned Rowing",
        "category": "Cardio & Fitness Equipment",
        "keywords": ["rowing machine calorie calculator", "rowing calorie calculator", "rower calorie calculator", "rowing calorie burn calculator", "concept 2 calorie calculator", "calorie calculator rowing machine", "rowing machine calorie burn calculator"]
    },
    "calculators/cycling": {
        "title": "Cycling & Stationary Bike Calorie Calculator",
        "category": "Cardio & Fitness Equipment",
        "keywords": ["exercise bike calorie calculator", "spin bike calorie calculator", "biking calorie burn calculator", "bike riding calorie calculator", "spinning calorie calculator", "indoor cycle calorie calculator", "peloton calorie calculator", "recumbent bike calorie calculator", "ebike calorie calculator", "desk cycle calorie calculator", "deskcycle calorie calculator", "navy prt bike calorie calculator", "navy bike calorie calculator", "navy prt calorie calculator bike", "calorie calculator stationary bike", "most accurate cycling calorie calculator", "bike calculator calorie"]
    },
    "calculators/hiit-bodyweight": {
        "title": "HIIT & Bodyweight Exercise Calorie Calculator",
        "category": "Fitness & Workouts",
        "keywords": ["hiit calorie burn calculator", "hiit calorie calculator", "hiit workout calorie calculator", "jump rope calorie calculator", "jump rope calorie burn calculator", "push up calorie calculator", "pushup calorie calculator", "burpee calorie calculator", "jumping jack calorie calculator", "squat calorie calculator", "deadlift calorie calculator", "bjj calorie calculator", "jiu jitsu calorie calculator", "boxing calorie calculator", "yoga calorie calculator", "yoga calorie burn calculator", "hot yoga calorie calculator", "pilates calorie calculator", "sauna calorie calculator", "sauna calorie burn calculator", "insanity calorie calculator", "p90x calorie calculator", "crossfit calorie calculator", "tennis calorie calculator", "basketball calorie calculator", "golf calorie calculator", "cryotherapy calorie calculator"]
    },
    "restaurants/dutch-bros": {
        "title": "Dutch Bros Calorie & Nutrition Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["dutch bros calorie calculator"]
    },
    "restaurants/taco-bell": {
        "title": "Taco Bell Nutrition & Calorie Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["taco bell calorie calculator"]
    },
    "restaurants/dominos": {
        "title": "Domino's Pizza Calorie Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["dominos calorie calculator"]
    },
    "restaurants/five-guys": {
        "title": "Five Guys Calorie Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["five guys calorie calculator", "5 guys calorie calculator"]
    },
    "restaurants/pizza-hut": {
        "title": "Pizza Hut Calorie Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["pizza hut calorie calculator"]
    },
    "restaurants/jimmy-johns": {
        "title": "Jimmy John's Calorie Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["jimmy johns calorie calculator", "jimmy john's calorie calculator"]
    },
    "restaurants/wendys": {
        "title": "Wendy's Calorie Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["wendy's calorie calculator", "wendys calorie calculator"]
    },
    "restaurants/chipotle": {
        "title": "Chipotle Calorie Calculator",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["chipotle calorie calculator reddit"]
    },
    "restaurants/fast-food-hub": {
        "title": "Fast Food & Chain Restaurant Calorie Calculator Hub",
        "category": "Restaurant & Fast Food Nutrition",
        "keywords": ["7 brew calorie calculator", "ihop calorie calculator", "wawa calorie calculator", "burger king calorie calculator", "sheetz calorie calculator", "blaze pizza calorie calculator", "kfc calorie calculator", "salata calorie calculator", "jersey mike's calorie calculator", "whataburger calorie calculator", "publix sub calorie calculator", "popeyes calorie calculator", "sonic calorie calculator", "olive garden calorie calculator", "panera calorie calculator", "mod pizza calorie calculator", "dairy queen calorie calculator", "smoothie king calorie calculator", "applebee's calorie calculator", "firehouse subs calorie calculator", "firehouse calorie calculator", "papa john's calorie calculator", "cookout calorie calculator", "jack in the box calorie calculator", "qdoba bowl calorie calculator", "nandos calorie calculator", "carl's jr calorie calculator", "mellow mushroom calorie calculator", "bolay calorie calculator", "pieology calorie calculator", "poke bros calorie calculator", "outback calorie calculator", "dig calorie calculator", "bojangles calorie calculator", "papa murphy's calorie calculator", "burger calorie calculator"]
    },
    "calculators/boba-tea": {
        "title": "Boba & Bubble Tea Calorie Calculator",
        "category": "Food & Beverage Nutrition",
        "keywords": ["bubble tea calorie calculator", "boba calorie calculator", "boba tea calorie calculator", "kung fu tea calorie calculator"]
    },
    "calculators/poke-bowl": {
        "title": "Poke Bowl & Acai Bowl Calorie Calculator",
        "category": "Food & Beverage Nutrition",
        "keywords": ["poke bowl calorie calculator", "poke calorie calculator", "acai bowl calorie calculator", "hot pot calorie calculator"]
    },
    "calculators/salad-calories": {
        "title": "Salad & Dressing Calorie Calculator",
        "category": "Food & Beverage Nutrition",
        "keywords": ["salad calorie calculator"]
    },
    "calculators/sushi-calories": {
        "title": "Sushi & Sushi Roll Calorie Calculator",
        "category": "Food & Beverage Nutrition",
        "keywords": ["sushi calorie calculator", "sushi roll calorie calculator"]
    },
    "calculators/beer-calories": {
        "title": "Beer & Alcohol Calorie Calculator",
        "category": "Food & Beverage Nutrition",
        "keywords": ["beer calorie calculator", "craft beer calorie calculator"]
    },
    "calculators/indian-food": {
        "title": "Indian Food Calorie Calculator",
        "category": "Food & Beverage Nutrition",
        "keywords": ["indian food calorie calculator", "indian food calorie calculator app", "calorie calculator for indian food", "calorie calculator indian food"]
    },
    "calculators/smoothie": {
        "title": "Smoothie & Protein Shake Calorie Calculator",
        "category": "Food & Beverage Nutrition",
        "keywords": ["shake calorie calculator", "omelette calorie calculator", "chicken breast calorie calculator", "chicken calorie calculator", "rice calorie calculator"]
    },
    "calculators/body-recomposition": {
        "title": "Body Recomposition Calorie Calculator — Lose Fat & Gain Muscle",
        "category": "Specialized Health & Clinical",
        "keywords": ["body recomposition calorie calculator", "body recomp calorie calculator", "calorie calculator for body recomp", "calorie calculator for body recomposition", "calorie calculator body recomp", "calorie calculator for recomp", "body recomposition calorie deficit calculator"]
    },
    "calculators/pcos-calorie": {
        "title": "PCOS Calorie & Deficit Calculator",
        "category": "Specialized Health & Clinical",
        "keywords": ["pcos calorie calculator", "pcos calorie deficit calculator", "hypothyroidism calorie calculator"]
    },
    "calculators/intermittent-fasting": {
        "title": "Intermittent Fasting Calorie Calculator",
        "category": "Specialized Health & Clinical",
        "keywords": ["intermittent fasting calorie calculator", "calorie calculator for intermittent fasting"]
    },
    "calculators/carnivore-diet": {
        "title": "Carnivore Diet Calorie Calculator",
        "category": "Specialized Health & Clinical",
        "keywords": ["carnivore calorie calculator", "carnivore diet calorie calculator"]
    },
    "calculators/unit-converters": {
        "title": "Grams to Calories & Calories to Pounds Calculator",
        "category": "Unit Converters & Tools",
        "keywords": ["gram to calorie calculator", "grams to calorie calculator", "calorie to gram calculator", "kj to calorie calculator", "21 day fix calorie calculator", "myplate calorie calculator", "eric roberts calorie calculator", "eric roberts fitness calorie calculator", "katy hearn calorie calculator", "jordan syatt calorie calculator", "kinobody calorie calculator", "jeff nippard calorie calculator", "onesol calorie calculator", "tmpm calorie calculator", "v shred calorie calculator", "apple watch calorie calculator", "apple watch calorie goal calculator", "calorie move goal calculator", "runner calorie intake calculator", "treadmill calorie calculator accuracy", "treadmill calorie calculator app", "life fitness treadmill calorie calculator", "running calorie calculator with elevation", "calorie calculator for runners", "insanity nutrition guide calorie calculator"]
    }
}

kw_to_item = {item['keyword']: item for item in all_items}

print("=== EXISTING PAGES ANALYSIS ===")
total_existing_vol = 0
total_existing_tp = 0
for route, kws in existing_mapping.items():
    vol_sum = sum(kw_to_item[k]['vol'] for k in kws if k in kw_to_item)
    tp_sum = sum(kw_to_item[k]['tp'] if kw_to_item[k]['tp'] > 0 else kw_to_item[k]['gtp'] for k in kws if k in kw_to_item)
    total_existing_vol += vol_sum
    total_existing_tp += tp_sum
    print(f"[EXISTING] {route:<50} | KWs: {len(kws):<3} | Vol: {vol_sum:<6} | TP: {tp_sum:<8}")

print(f"\nTOTAL EXISTING COVERED VOLUME: {total_existing_vol} | TOTAL TRAFFIC POTENTIAL: {total_existing_tp}\n")

print("=== NEW PROPOSED PAGES & TOPICAL AUTHORITIES ===")
total_new_vol = 0
total_new_tp = 0
for route, data in new_pages.items():
    kws = data['keywords']
    vol_sum = sum(kw_to_item[k]['vol'] for k in kws if k in kw_to_item)
    tp_sum = sum(kw_to_item[k]['tp'] if kw_to_item[k]['tp'] > 0 else kw_to_item[k]['gtp'] for k in kws if k in kw_to_item)
    total_new_vol += vol_sum
    total_new_tp += tp_sum
    print(f"[NEW PAGE] /{route:<35} | Vol: {vol_sum:<6} | TP: {tp_sum:<8} | Title: {data['title']}")

print(f"\nTOTAL NEW UNTAPPED SEARCH VOLUME: {total_new_vol} | TOTAL NEW TRAFFIC POTENTIAL: {total_new_tp}")

